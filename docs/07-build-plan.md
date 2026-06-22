# 07 — Build Plan (phased roadmap & progress tracker)

Built **incrementally** so there is *always* something working. Each phase ends at a **demoable checkpoint**. Tick items as we go — this doubles as the progress log for resuming/reverting.

> Strategy: greenfield `serverless/` folder; `backend/` (Supabase) untouched as fallback. Build the pipeline backbone first, then layer auth/RBAC/credits on top.

---

## Phase 0 — Foundations  ·  checkpoint: LocalStack boots, tables exist
- [x] `serverless/` scaffold: `package.json`, TypeScript, folders
- [x] `docker-compose.yml` for LocalStack (S3, SQS, Lambda, DynamoDB, API GW)
- [x] `serverless.yml` base: provider (aws/localstack), `serverless-localstack` plugin — **config validated** (`serverless print` ✅)
- [x] `.env.example` + gitignored `.env`
- [x] DynamoDB tables (Companies, Users, Campaigns, Candidates + GSIs) as `serverless.yml` resources
- [x] `lib/dynamo.ts`, `lib/response.ts` — **TypeScript compiles** (`tsc --noEmit` ✅)
- [x] `scripts/health-check` (verify all services up); `bootstrap` = `serverless deploy`
- [x] `npm install` succeeds; `/health` Lambda added to validate full deploy toolchain
- [x] ✅ **Live verified:** LocalStack up, stack deployed, `npm run health` all ✅, `/health` returns 200 via API Gateway → Lambda

> ⚠️ **Known quirk:** `npm run bootstrap` (serverless-localstack) often **hangs after the deploy actually succeeds** — the CloudFormation stack completes but the node process doesn't exit. If it sits idle after resources are created, it's done: `Ctrl+C` is safe, then run `npm run health` to confirm. Get the API id from the deploy output or `GetRestApis`.

## Phase 1 — The event-driven pipeline backbone  ✅ DONE & LIVE-VERIFIED
*(The showpiece. Proven working end-to-end with real OpenAI scoring.)*
- [x] S3 bucket + CORS config for browser PUT
- [x] `candidate-presign` Lambda → create Candidate(Pending) + presigned URL
- [x] S3 `ObjectCreated` → SQS `ResumeProcessingQueue` notification + DLQ redrive policy
- [x] `worker-process` Lambda (SQS trigger): parse key → load records → atomic credit → pdf-parse → AI score → write
- [x] `lib/ai/` provider interface: `openai.ts` + `gemini.ts` + `mock.ts` (prompt ported from old `cv.service.ts`)
- [x] `lib/s3.ts` (presign + fetch), `lib/aws.ts` (internal vs browser endpoints)
- [x] Models: `company` (atomic deduct/refund), `campaign`, `candidate` (ranked GSI query)
- [x] **Tested:** 4 CVs ranked correctly (React 85>frontend 55>marketing 15>accountant 10); credits 100→96; idempotent + Pending-Credits + Manual-Review paths coded

### Gotchas solved in Phase 1 (so they don't bite again)
1. **S3→SQS notification doesn't apply via CloudFormation** on a pre-existing bucket → run `npm run wire` (`scripts/wire-notifications.js`) after deploy.
2. **SDK v3 auto-CRC32 checksum** breaks plain PUT to presigned URL → S3 clients use `requestChecksumCalculation: 'WHEN_REQUIRED'`.
3. **Presigned URL must use `localhost:4566`** (browser-facing), while the worker reads S3 via the **LocalStack-internal** endpoint (`LOCALSTACK_HOSTNAME`). See `lib/aws.ts`.
4. **pdf-parse** has bundler-hostile debug code → import `pdf-parse/lib/pdf-parse.js` directly.
5. **Lambda CAN reach the internet** (OpenAI) from inside LocalStack on this machine — real scoring confirmed.

### Full local bring-up sequence (current)
`npm run ls:up` → `npm run bootstrap` (Ctrl+C after "Service deployed") → `npm run wire` → `npm run seed` → `npm run health`

## Phase 2 — Read APIs + frontend repoint  ✅ (backend done; dashboard wiring deferred to Phase 3)
- [x] `candidate-list` (ranked via CampaignScoreIndex), `candidate-get` — return snake_case shape the UI expects
- [x] `campaign-public` (apply page by hash) — resolves company_name, maps status
- [x] AI now fills candidate name/email from the CV (public page collects only a file); presign requires only campaignId
- [x] Wire the **public apply page**: `getPublicCampaign(hash)` + presign→PUT upload, via `NEXT_PUBLIC_SERVERLESS_API`. Components untouched (only the `api/` layer + 1 import).
- [x] **Tested (curl):** campaign-public + ranked candidate-list both return correct data with presigned cv_link
- [ ] ⏳ **Live UI click-through:** `cd client && npm run dev` → open `/campaign/applicants/demo-hash-1234` → upload a CV (manual verify)
- [~] Dashboard ranked-list repoint deferred to **Phase 3** (dashboard is Supabase-auth-gated; wire after our auth exists). `getApplicants()` already points at serverless and is ready.

> Migration note: public apply page now uses serverless; the authed dashboard still uses Supabase/NestJS → **fallback stays intact** during migration. `favourite.tsx:25` has a pre-existing (unrelated) type error on the Supabase path.

## Phase 3 — Auth + multi-tenancy  ✅ (backend done; frontend auth bundled into Phase 4)
- [x] `lib/jwt.ts` (sign/verify), `lib/rbac.ts` (`authed`/`adminOnly` wrappers)
- [x] `auth-signup` (Company + Admin, bcrypt, 10 free credits), `auth-signin` (JWT), `auth-session`, `auth-signout`
- [x] `models/user.ts`; JWT verification wrapper; candidate-list/get now `authed` + company-scoped
- [x] **Verified by `npm run smoke`:** signin, wrong-pw 401, session, signup, dup 409, no-token 401, cross-company 404, full pipeline, ranked list
- [ ] Frontend auth migration → **moved to Phase 4** (dashboard data calls need campaign/analytics Lambdas first, so migrate auth + dashboard together)

### Fixes made this phase (important)
1. **Lambda cold-start timeout** (was the real cause of the signup hang): bumped `LAMBDA_RUNTIME_ENVIRONMENT_TIMEOUT=120` + `LAMBDA_KEEPALIVE_MS` in docker-compose; externalized `@aws-sdk/*` in esbuild (15 MB → 7.8 MB bundles, faster cold start).
2. **API-id churn solved:** `npm run api:url` (prints live URL), `npm run sync:env` (writes it into `client/.env.local`). Run `sync:env` after any full teardown.
3. **`npm run smoke`** — reusable E2E regression/demo check.

### Updated full bring-up sequence
`npm run ls:up` → `npm run bootstrap` (Ctrl+C after "Service deployed") → `npm run wire` → `npm run seed` → `npm run sync:env` → `npm run smoke`
> ⚠️ A full `ls:down`/`ls:up` regenerates the API id → always re-run `wire`, `seed`, `sync:env` after.

## Phase 4 — Campaigns + credits + RBAC + frontend migration  ✅ DONE
- [x] `campaign-*` CRUD (create w/ publicHash, list, get, update, delete) — auth + company-scoped, snake_case shape matching the UI
- [x] `company-get`, `credits-add` (Admin), `recruiters-*` list/invite/remove (Admin)
- [x] Atomic credit deduction wired into worker (A5) + Pending Credits path (Phase 1)
- [x] RBAC guards (`adminOnly`) on admin routes
- [x] **Frontend migrated off Supabase** → serverless+JWT: `lib/auth.ts`, `lib/api.ts` (Bearer), campaign/analytics/cv API clients, signin/signup, ProtectedRoute, sidebar/dropdown logout, home page. Client `tsc --noEmit` clean.
- [x] **Verified by `npm run smoke`** + manual curl (campaign CRUD, credits, analytics)
- [~] Deferred (peripheral, Supabase-specific): settings Change-Email / Change-Password dialogs still call Supabase; pricing/Stripe page left as-is (credits are the serverless billing model)

## Phase 6 — Analytics  ✅ DONE (built alongside Phase 4)
- [x] `analytics` age/city/university + overview/scores/campaigns-summary (Scan + aggregate, company-scoped)
- [x] Analytics API client repointed; `AnalyticsMainSection` untouched (same signatures)

## Phase 5 — Real-time  ✅ DONE & VERIFIED
- [x] `socket-server/index.js` (Socket.io, rooms by `company:{companyId}`, JWT handshake, `/emit` relay guarded by `EMIT_SECRET`)
- [x] Worker emits `candidate.scored` after scoring (non-fatal) via `SOCKET_SERVER_URL=http://host.docker.internal:4000`
- [x] Frontend: `lib/socket.ts` (JWT-auth'd client) + `best-candidate.tsx` subscribes → refetches + toasts live
- [x] **Verified:** uploaded a CV → socket log showed `emit candidate.scored -> company:demo-company Fatima Ali`
- [x] `npm run socket` script; deps `socket.io` (server) + `socket.io-client` (client)

> Run order now includes: `npm run socket` (separate terminal) alongside the deployed stack + `client` dev server.

## Phase 6 — Analytics  ·  checkpoint: charts back online
- [ ] `analytics-age|city|university` (query by companyId + aggregate)
- [ ] Repoint existing Recharts dashboards

## Phase 7 — Hardening & demo prep  ·  checkpoint: viva-ready
- [ ] `scripts/seed` + `scripts/reset`
- [ ] DLQ inspection helper
- [ ] Run through [06-demo-runbook.md](06-demo-runbook.md) end to end
- [ ] Record the fallback video
- [ ] Reconcile the FYP2 report wording with what was actually built (Next.js, OpenAI, table-per-entity, Socket.io caveat)

---

## Reuse map (from old `backend/` → new `serverless/`)
| Old | New | Notes |
|-----|-----|-------|
| `pdf-ranking-service` Gemini prompt + scoring | `lib/ai/` + `worker-process` | Port the prompt; swap provider to OpenAI; keep breakdown/relevance/reasoning |
| `pdf-parse` usage | `worker-process` | Same library |
| `campaign.service.ts` CRUD logic | `campaign-*` handlers | Logic maps cleanly; swap Supabase calls for DynamoDB |
| `analytics.service.ts` aggregation | `analytics-*` handlers | Same in-memory aggregation, source DynamoDB |
| Next.js UI | unchanged | Repoint API base URL + auth only |

## Decisions still revisitable
- DynamoDB **table-per-entity** (current choice) vs single-table flex.
- Build **timeline/pacing** — phases are independent checkpoints; pace to the July 2026 completion date.
