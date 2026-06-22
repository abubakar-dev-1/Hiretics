# 02 — Data Model (DynamoDB, table-per-entity)

**Pattern:** table-per-entity. Four tables, each with a clear primary key and GSIs sized to the access patterns below. This is *access-pattern-first* design — every index exists to serve a specific query.

> Why not single-table? Easier to reason about and defend in a viva, and new query patterns don't force a redesign. The report contradicts itself (R1.5 "one table per service" vs §6.4.2 "single-table"); we pick the defensible interpretation and make the report consistent.

---

## Access patterns (the contract)

| # | Access pattern | Served by |
|---|----------------|-----------|
| A1 | Find user by email (login) | `Users` → `EmailIndex` GSI |
| A2 | Get user by id | `Users` PK |
| A3 | List users in a company (admin) | `Users` → `CompanyIndex` GSI |
| A4 | Get company + credit balance | `Companies` PK |
| A5 | **Atomically deduct 1 credit** | `Companies` `UpdateItem` + condition |
| A6 | List campaigns for a company | `Campaigns` → `CompanyIndex` GSI |
| A7 | Get campaign by id | `Campaigns` PK |
| A8 | Get campaign by public hash (candidate apply) | `Campaigns` → `PublicHashIndex` GSI |
| A9 | List candidates for a campaign, ranked by score | `Candidates` → `CampaignScoreIndex` GSI |
| A10 | Get candidate by id | `Candidates` PK |
| A11 | Update candidate score/status (worker) | `Candidates` `UpdateItem` |
| A12 | Analytics: age/city/university distribution | `Candidates` query by `companyId` + in-memory aggregate |

---

## Tables

### `Companies`
| Attribute | Type | Notes |
|-----------|------|-------|
| `companyId` (PK) | S (UUID) | |
| `name` | S | |
| `availableCredits` | N | default 0; gated atomically (A5) |
| `createdAt` | S (ISO) | |

**Atomic credit deduction (A5):**
```
UpdateItem Companies
  Key: { companyId }
  UpdateExpression:    SET availableCredits = availableCredits - :one
  ConditionExpression: availableCredits >= :one
  Values: { :one: 1 }
```
If the condition fails (`ConditionalCheckFailedException`) → balance is 0 → skip AI, mark candidate `Pending Credits`. This is race-safe under concurrent Lambdas (R1.6).

---

### `Users`
| Attribute | Type | Notes |
|-----------|------|-------|
| `userId` (PK) | S (UUID) | |
| `companyId` | S | FK → Companies |
| `email` | S | unique (enforced via EmailIndex lookup on signup) |
| `passwordHash` | S | bcrypt |
| `fullName` | S | |
| `role` | S | `Admin` \| `Recruiter` |
| `createdAt` | S | |

- **`EmailIndex`** (GSI): PK `email` → login (A1).
- **`CompanyIndex`** (GSI): PK `companyId`, SK `createdAt` → list recruiters (A3).

---

### `Campaigns`
| Attribute | Type | Notes |
|-----------|------|-------|
| `campaignId` (PK) | S (UUID) | |
| `companyId` | S | FK → Companies |
| `createdByUserId` | S | FK → Users |
| `jobTitle` | S | |
| `jobDescription` | S | used by AI |
| `criteria` | M (JSON) | reuse existing MVP criteria (skills/weights/keywords/etc.) |
| `status` | S | `Active` \| `Closed` |
| `publicHash` | S | cryptographic UUID for the public link (anti-IDOR, R1.7) |
| `isFavorite` / `isArchived` | BOOL | reuse MVP UX |
| `startDate` / `endDate` | S | |
| `createdAt` | S | |

- **`CompanyIndex`** (GSI): PK `companyId`, SK `createdAt` → dashboard list (A6).
- **`PublicHashIndex`** (GSI): PK `publicHash` → candidate apply page lookup (A8).

---

### `Candidates`
| Attribute | Type | Notes |
|-----------|------|-------|
| `candidateId` (PK) | S (UUID) | |
| `campaignId` | S | FK → Campaigns |
| `companyId` | S | denormalized for analytics scoping (A12) |
| `fullName` | S | |
| `email` | S | |
| `s3ResumeKey` | S | `resumes/{campaignId}/{candidateId}.pdf` |
| `aiScore` | N | 0–100, null until scored |
| `aiReasoning` | S | one-line justification from AI |
| `scoringBreakdown` | M | skills/experience/education/location/keywords |
| `matchedSkills` / `matchedKeywords` | L | reuse MVP enrichment |
| `relevance` | S | high/medium/low/irrelevant |
| `status` | S | `Pending` \| `Scored` \| `Manual Review` \| `Pending Credits` \| `Rejected` |
| `appliedAt` | S | |

- **`CampaignScoreIndex`** (GSI): PK `campaignId`, SK `aiScore` (N) → ranked candidate list (A9). Because score is the GSI sort key, updating the score automatically re-ranks — no delete/recreate.

---

## Why `s3ResumeKey` encodes the IDs
The worker is triggered by an S3 event that only carries the **object key**. By making the key `resumes/{campaignId}/{candidateId}.pdf`, the worker can parse out both IDs with no extra lookup, then fetch the `Candidate` (created at presign time with `status=Pending`) and `Campaign` records. See [03-pipelines.md](03-pipelines.md).

## Notes / honesty
- **Analytics uses a query+aggregate** scoped by `companyId`. At demo scale this is fine; at real scale you'd precompute aggregates. Say so in the viva — it shows you understand the trade-off.
- **Uniqueness of email** is enforced in application code (check `EmailIndex` before insert), not by the DB — DynamoDB has no unique constraints beyond the key.
