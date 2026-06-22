# 08 — Extended Build Plan (Phases 8–11 + hardening)

Continues [07-build-plan.md](07-build-plan.md). Phases 0–6 (event-driven core: auth/RBAC,
multi-tenancy, campaign CRUD, S3→SQS→Worker→AI→DynamoDB ranking, credits, analytics,
Socket.IO) are **done & live-verified**. This doc tracks the extended scope the FYP report
presents as complete.

> **Decision (this build):** build everything top-to-bottom, one phase at a time. Per-phase
> verification = both projects typecheck clean (`tsc --noEmit` in `serverless/` and `client/`).
> A single full **live LocalStack deploy + `npm run smoke`** integration pass runs at the end
> (Docker was not running during the build). Order: 8 → 9 → 10 → 11, hardening folded in.

---

## Phase 8 — Plans & Entitlements + AI Authoring Assist  ✅ code-complete (typecheck ✓)
*Foundation: the Free/Pro tier + the entitlement gate that Payments and the Pro features reuse.*

**Backend**
- [x] `models/company.ts`: `plan: 'free'|'pro'`, `aiAuthorCount`, `suspended?`; `getCompany` normalizes old records; `setPlan`, `tryConsumeAiAuthor` (atomic, race-safe), `addAiAuthorRefund`.
- [x] `lib/entitlements.ts`: `FREE_AI_AUTHOR_LIMIT = 3`, `entitlementSummary()`.
- [x] AI provider gains `assist()` (title/description/criteria/all) across openai/gemini/**mock** (offline-capable); `buildAssistPrompt` + `parseAssist` in `lib/ai/prompt.ts`.
- [x] `handlers/ai/author.ts` → `POST /ai/author` (auth, entitlement-gated → 402 `UPGRADE_REQUIRED`, refunds free use on AI failure).
- [x] `GET /company` now returns `entitlement` summary.
- [x] `serverless.yml`: `aiAuthor` function.

**Frontend**
- [x] `src/api/ai/api.ts`: `assistCampaign()`, `UpgradeRequiredError`.
- [x] Campaign-creation dialog: AI buttons (title / description / criteria / generate-all), live "N free generations left" / "Pro unlimited" hint, upgrade toast on 402.

**Live-verify checklist (run during final integration pass)**
- [ ] `POST /ai/author {action:'all', jobRole:'Frontend Engineer'}` → suggestions; 4th call on a fresh free company → 402.
- [ ] `GET /company` shows `entitlement.aiAuthor.remaining` decrementing.

## Phase 9 — Payments (Stripe credit packs + Pro upgrade)  ✅ code-complete (typecheck ✓; serverless print ✓)
- [x] `Transactions` table (PK `txnId`, GSI `CompanyIndex`).
- [x] `models/transaction.ts` (create/get/markPaid idempotent/listByCompany/listAll).
- [x] Billing provider abstraction `lib/billing/` (mock default + **Stripe via REST + crypto webhook verify, no SDK dep**), `catalog.ts` (3 packs + Pro), `fulfill.ts` (idempotent grant).
- [x] Handlers: `billing/packs`, `billing/checkout` (Admin), `billing/webhook` (sig-verified), `billing/mock-confirm` (offline), `billing/transactions`. `GET /company` exposes plan + entitlement.
- [x] Frontend: pricing page rewritten (plan/credits banner, Pro upgrade, credit-packs grid), `api/billing/api.ts` with `purchase()` (mock confirm / Stripe redirect).

## Phase 10 — Platform-Owner / Super-Admin console  ✅ code-complete (typecheck ✓; serverless print ✓)
- [x] `SuperAdmin` role; `superAdminOnly` guard; `admin/bootstrap` (secret-gated owner creation); seeded owner.
- [x] `admin/infra` (live SQS + DLQ depth via `lib/sqs.ts`, pipeline + tenant rollups), `admin/tenants`, `admin/tenants/{id}/suspend`, `admin/tenants/{id}/credits`, `admin/revenue`.
- [x] Worker honours `company.suspended` (holds candidates without consuming credit).
- [x] Frontend `/platform` console (live-polling infra, revenue, tenant table w/ suspend + grant). Login routes SuperAdmin → `/platform`.

## Phase 11 — Candidate side + RoleNorth merge  ✅ code-complete (typecheck ✓; serverless print ✓)
- [x] 11a: `Candidate` role + self-scoped accounts (`companyId === userId`), `auth/candidate-signup`; `CVThreads`/`CVVersions`/`CVComparisons` tables + `models/cv.ts`.
- [x] 11b: 2nd event-driven pipeline — `AnalysisBucket` → `AnalysisQueue` (+DLQ) → `cvAnalysisWorker`; RoleNorth analyzer/comparator/tailor ported to `lib/ai/career/` (openai/gemini + **offline mock**). `wire-notifications` now wires both buckets.
- [x] 11c: candidate portal — `/candidate` (dashboard), `/candidate/analyze`, `/candidate/report/[cvId]` (polls), `/candidate/threads/[threadId]` (versions + compare), `/candidate/jobs`, `/candidate/signup`; `ReportView` + `CandidateNav` components; `api/candidate/api.ts`.
- [x] 11d: opt-in job board (`Campaign.visibility`, toggle in create dialog), `GET /jobs` + `/jobs/{id}`, `candidate/tailor` (uses campaign criteria → predicted match), `candidate/apply` (copies CV into resumes bucket → reuses ranking pipeline). Login routes Candidate → `/candidate`.

## Phase 7 — Hardening
- [x] `scripts/seed` updated: plan fields, seeded SuperAdmin + Candidate + a public job.
- [ ] `scripts/reset` + DLQ inspection helper (optional).
- [ ] Update `06-demo-runbook.md` for the new pipelines/consoles.

---

## Final live-integration runbook (run when Docker Desktop is up)
Everything below is verified by `tsc --noEmit` (both projects) + `serverless print`. The
single remaining step is a live LocalStack run:

```
cd serverless
npm run ls:up
npm run bootstrap        # Ctrl+C after "Service deployed" (known hang)
npm run wire             # wires BOTH resume + analysis buckets → queues
npm run seed
npm run sync:env
npm run smoke            # existing recruiter pipeline regression
npm run socket           # separate terminal (real-time)
# then: cd ../client && npm run dev
```
Smoke checks for the new surface (curl or UI):
- `POST /ai/author` 3× then 402 on a fresh free company; `GET /company` shows entitlement.
- `POST /billing/checkout {kind:'credits',packId:'starter'}` → mock → `POST /billing/mock-confirm` → credits +50.
- Login owner@hiretics.test → `/platform` shows queue depth; suspend/grant work.
- Candidate: signup → `/candidate/analyze` upload → report renders; `/candidate/jobs` tailor + one-click apply → appears in recruiter campaign and gets scored.
