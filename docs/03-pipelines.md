# 03 — Pipelines & Funnels (the flows)

This is the behavioral heart of the system. Each flow below is the **intended behavior** — if something misbehaves, compare against these step-by-step contracts to find where it diverged.

---

## 🟢 PIPELINE 1 — CV Ingestion & Scoring (the showpiece)

This is what makes Hiretics "event-driven serverless." Read it carefully.

```
CANDIDATE                FRONTEND            LAMBDA (candidate)        S3            SQS         LAMBDA (worker)        AI         DYNAMODB     SOCKET.IO     RECRUITER
   │ open /apply/{hash}      │                      │                  │             │                 │              │            │             │             │
   │───────────────────────►│ GET campaign by hash │                  │             │                 │              │            │             │             │
   │                        │─────────────────────►│ A8 lookup        │             │                 │              │            │             │             │
   │ fill name/email,       │◄─────────────────────│ campaign info    │             │                 │              │            │             │             │
   │ choose PDF             │                      │                  │             │                 │              │            │             │             │
   │───────────────────────►│ POST /candidate/presign {campaignId,name,email}      │                 │              │            │             │             │
   │                        │─────────────────────►│ create Candidate(status=Pending), return presigned PUT URL      │            │             │             │
   │                        │◄─────────────────────│ {url, candidateId}             │                 │              │            │             │             │
   │                        │ PUT pdf ──────────────────────────────►│ store object │                 │              │            │             │             │
   │◄───── "Success" ───────│                      │                  │ ObjectCreated│                 │              │            │             │             │
   │                        │                      │                  │────────────►│ enqueue message │              │            │             │             │
   │                        │                      │                  │             │────────────────►│ consume      │            │             │             │
   │                        │                      │                  │             │                 │ get PDF◄─────┼────────────┤             │             │
   │                        │                      │                  │             │                 │ A5 deduct credit (atomic) │             │             │
   │                        │                      │                  │             │                 │ parse PDF    │            │             │             │
   │                        │                      │                  │             │                 │ score ──────►│            │             │             │
   │                        │                      │                  │             │                 │ A11 write score ─────────►│             │             │
   │                        │                      │                  │             │                 │ emit ────────────────────────────────►│ push room   │
   │                        │                      │                  │             │                 │              │            │             │────────────►│ live update
   │                        │                      │                  │             │ ack/delete ◄────│ return 200   │            │             │             │
```

### Worker logic (the contract) — matches report Algorithm 2
For each SQS record:
1. Parse `s3ResumeKey` → `campaignId`, `candidateId`.
2. Load `Candidate` + `Campaign` (→ `companyId`, `jobDescription`, `criteria`).
3. **Atomic credit deduct (A5)** on the company. If it fails → set candidate `status=Pending Credits`, (optionally alert admin), **delete message** (don't retry), stop.
4. Download PDF from S3, extract text with `pdf-parse`. If extraction fails → `status=Manual Review`, delete message, stop.
5. Build prompt (`jobDescription` + `criteria` + resume text) → call AI provider → parse JSON (`score`, `scoringBreakdown`, `matchedSkills`, `relevance`, `reasoning`).
6. **Update candidate (A11):** scores + `status=Scored`.
7. `POST` to Socket.io server `/emit` with `{ companyId, campaignId, candidate }`.
8. Return success → SQS deletes the message.

### Failure handling
- Any **thrown** error (AI timeout, S3 down) → message is **not** deleted → SQS makes it visible again after the visibility timeout → retried.
- After `maxReceiveCount` retries → message moves to the **Dead Letter Queue (DLQ)**. Nothing is lost; inspect the DLQ manually.
- "Expected" terminations (no credits, unreadable PDF) **delete** the message — they are not errors, they are valid outcomes recorded on the candidate.

> **Viva flex:** When asked "what if processing fails?", open the DLQ and show the trapped message. Resilience is a feature.

---

## 🔵 FLOW 2 — Authentication (custom JWT + bcrypt)

```
SIGNUP:  POST /auth/signup {companyName?, fullName, email, password, role}
  → check EmailIndex (A1) for existing email → 409 if taken
  → if new company: create Company (availableCredits=0) + first User as Admin
  → bcrypt.hash(password) → put User
  → return { userId } (or auto-login with a token)

SIGNIN:  POST /auth/signin {email, password}
  → EmailIndex lookup (A1) → bcrypt.compare → if ok:
  → sign JWT { userId, companyId, role }  (HS256, secret in env)
  → return { token, user }

PROTECTED REQUESTS:
  → every protected Lambda verifies the JWT, extracts {userId, companyId, role}
  → scopes all queries by companyId (multi-tenancy)
  → enforces role (RBAC) where required
```

---

## 🟣 FLOW 3 — Credits & RBAC

- **Credits** are a shared pool on the **Company**. Only an **Admin** can add credits (`POST /credits/add`). The **worker** deducts them atomically during scoring (A5).
- **RBAC enforcement** (from JWT `role`):
  | Action | Admin | Recruiter |
  |--------|:-----:|:---------:|
  | Add/view credits | ✅ | view only |
  | Add/remove recruiters | ✅ | ❌ |
  | Create/manage campaigns | ✅ | ✅ |
  | View ranked candidates | ✅ | ✅ |
- A Recruiter calling an Admin-only Lambda → `403 Forbidden`.

---

## 🟠 FLOW 4 — Campaign creation & secure public link

```
POST /campaigns {jobTitle, jobDescription, criteria, dates}  (Admin or Recruiter)
  → generate publicHash = crypto UUID  (anti-IDOR, R1.7 — never incremental IDs)
  → put Campaign (status=Active, companyId from JWT)
  → return { campaignId, publicUrl: /apply/{publicHash} }

Recruiter copies publicUrl → shares with candidates → feeds PIPELINE 1.
```

---

## Extending the system later (why this is easy)
Because steps are decoupled by events/queues, **adding a stage = adding a subscriber, not editing the worker**. Examples:
- *"Email the candidate when rejected"* → publish a `CandidateScored` event and attach a new email-Lambda. Worker untouched.
- *"Second AI pass for top candidates"* → new queue + new worker.
- *"Slack notify on new high-scorer"* → new subscriber.

This loose coupling is the architectural payoff — demo it by adding a trivial subscriber live if asked.
