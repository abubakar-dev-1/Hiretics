# 09 — Demo Runbook (presentation day)

Everything is built and **live-verified** (15/15 API checks + both event-driven pipelines
scored a real CV end-to-end). This is the practical guide to running it for your viva.

## The one thing to understand
LocalStack emulates AWS on your laptop. Booting it + deploying 50 Lambdas is a **one-time
~15-minute setup you do BEFORE you present** — never during the demo. Once up, the app is
responsive. **Keep it running** through the presentation (don't stop Docker / don't reboot).

> LocalStack **Community does not persist Lambda functions**, so you can't "save & restore".
> The reliable plan is: deploy once, keep it running. Budget 20 min before your slot.

## Prerequisites
- Docker Desktop **running**.
- Don't delete Docker data between deploy and demo (keeps the LocalStack + Lambda runtime
  images cached so re-deploys are faster).

## Startup sequence (run from `serverless/`)
```
npm run ls:up                       # start LocalStack (~30-40s to healthy)
npm run deploy                      # ~14 min. When it prints "Service deployed", press Ctrl+C
                                    #   (serverless-localstack hangs after success — that's normal)
npm run wire                        # wire S3->SQS for BOTH pipelines (resumes + analysis)
npm run seed                        # demo company, public job, + 3 demo logins
npm run sync:env                    # writes the live API id into client/.env.local
npm run warmup                      # pre-warm all Lambdas (no cold-start stalls in the demo)
npm run socket                      # SEPARATE terminal — real-time updates
```
Then the frontend (separate terminal, from `client/`):
```
npm run dev                         # http://localhost:3000
```
Optional sanity check before you walk in:
```
npm run live:check                  # 15/15 endpoint checks
```

## Demo logins (from seed)
| Role | Email | Password | Lands on |
|---|---|---|---|
| Recruiter (Admin) | demo@hiretics.test | demo12345 | `/` dashboard |
| Platform Owner | owner@hiretics.test | owner12345 | `/platform` console |
| Candidate | candidate@hiretics.test | candidate12345 | `/candidate` portal |

## Suggested demo flow (≈8 min)
1. **Architecture (the thesis).** Show `/platform` infra monitor → live **SQS queue depth, DLQ,
   pipeline counts**. This visualizes the event-driven design.
2. **Recruiter side.** Login recruiter → create a campaign; click **✨ Generate with AI** (title /
   description / criteria) — note the "free generations left" gate (Phase 8). Toggle **"List on
   public job board"**.
3. **The pipeline.** Open the campaign's public apply link, upload a CV → watch it get **scored
   live** (S3→SQS→Worker→AI→DynamoDB→Socket.IO). This is the showpiece.
4. **Payments.** Pricing page → buy a credit pack / upgrade to Pro (mock checkout, instant).
5. **Candidate side (RoleNorth merge).** Login candidate → **Analyze CV** → full career report
   (skill-decay, automation exposure, pivot paths, 30-60-90, CV surgery). Upload a 2nd version →
   **Compare**. Go to **Job Board** → **Tailor my CV** to the job → **One-click apply** (it drops
   into the recruiter's ranking pipeline — show it appear on the recruiter side).
6. **Platform owner.** Back to `/platform` → suspend a tenant / grant credits / revenue.

## Make it bulletproof
- **Use mock AI for zero network risk:** in `serverless/.env` set `AI_PROVIDER=mock`, then
  `npm run deploy` (or it's picked up on next deploy). Instant, deterministic, offline. The real
  `openai` provider is more impressive but depends on the internet on the day.
- **Record a 2-3 min fallback video** of the flows above once it's running — if Docker misbehaves,
  play the video.
- **Fallback stack:** the original Supabase/NestJS app still exists if you ever need a lighter live option.

## Troubleshooting
- **First request after startup fails / resets:** a Lambda was cold. Run `npm run warmup`, retry.
  (Default timeout is already raised to 30s.)
- **`docker compose down` says "network still in use":** harmless (a Lambda child container). The
  container still stops. If a redeploy later complains about preexisting tables, do a hard reset:
  `docker compose kill; docker compose down -v --remove-orphans; docker rm -f hiretics-localstack`,
  delete the `serverless/.localstack` folder, then `ls:up` again.
- **"Function already exist" during deploy:** only happens on a non-clean state. Hard-reset as
  above and redeploy. (`LAMBDA_SYNCHRONOUS_CREATE=1` in docker-compose prevents the common race.)
- **Big RAM use:** that's Docker + the emulated cloud. Shut it down after the demo to reclaim it.
