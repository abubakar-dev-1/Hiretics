# 06 — Demo / Viva Runbook ("if anything goes south")

> This is your **safety manual**. There is **no single point of failure** that can leave you with nothing to show. Read this the day before, follow it the day of.

## The layered safety net (weakest → strongest)

1. **Hard fallback: the Supabase MVP (`backend/`).** Fully working, no Docker. If LocalStack won't boot, flip the frontend API URL back to the Supabase services and demo a working Hiretics. *You can never be fully down.*
2. **Pre-recorded video** of the full serverless pipeline working on a good day. Universally accepted if live fails. Record it once the build is green.
3. **MOCK AI mode** (`AI_PROVIDER=mock`). The **entire event-driven pipeline runs offline** — S3 → SQS → Lambda → DynamoDB → WebSocket — with a canned score. If venue wifi or the AI account dies, you still demo *the architecture* (which is what's graded).
4. **Seeded data** (`npm run seed`): a company with credits, a campaign, and pre-scored candidates, plus a known-good test CV. Your dashboard is never empty.
5. **Reset to known-good** (`npm run reset`): wipe + re-provision in seconds if state gets messy mid-demo.

## Morning-of checklist (do NOT skip)
```
□ Laptop plugged into power; heavy apps closed (LocalStack wants RAM)
□ Phone hotspot ready — do NOT trust venue wifi
□ docker compose up -d           (start LocalStack 30+ min early)
□ npm run bootstrap              (provision + deploy)
□ npm run seed                   (demo data)
□ npm run socket                 (real-time server)
□ npm run health                 → all ✅ ?  (if any ❌, fix before anyone watches)
□ DRY RUN the full flow once     (warms Lambda cold-starts; confirms today's machine/network)
□ Open the pre-recorded video in a background tab, just in case
□ Confirm Supabase fallback still works (flip URL, load dashboard, flip back)
```

## During the demo — the happy path to show
1. Show the **public apply link**, upload a real PDF.
2. Show it land in **S3** (`awslocal s3 ls`), the message in **SQS**.
3. Switch to the recruiter dashboard — the candidate **appears live** (WebSocket), scored and ranked.
4. Open `serverless.yml` to show the **Lambda functions + SQS + DynamoDB** as real infrastructure-as-code.

## When an examiner asks "what if it fails?" — turn it into a flex
- **Processing failure?** Open the **DLQ** and show the trapped message — SQS retried, then dead-lettered, nothing lost.
- **No credits?** Upload with a zero-credit company — candidate is marked `Pending Credits`, AI is never called (atomic credit guard).
- **Unreadable/scanned PDF?** Candidate flagged `Manual Review` — graceful degradation, no crash.
- **Scale?** "Lambda auto-scales per message; SQS buffers spikes; credits deduct atomically so 1,000 concurrent uploads can't double-spend."

## Recovery quick-reference (when something breaks live)
| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Nothing happens after upload | S3→SQS notification not wired | `npm run bootstrap` re-applies wiring; check `awslocal sqs receive-message` |
| Worker errors / AI timeout | Lambda can't reach internet | set `AI_PROVIDER=mock`, re-upload |
| Dashboard not updating live | Socket server down | `npm run socket`; refresh dashboard |
| 403 everywhere | JWT/clock/secret mismatch | re-signin to get a fresh token |
| Totally stuck | LocalStack corrupted state | `npm run reset` (or fall back to Supabase) |
| Catastrophe | LocalStack won't run at all | **Switch frontend to Supabase backend; play the video** |

> If anything is unclear mid-incident, hand these docs (especially [03-pipelines.md](03-pipelines.md) for intended behavior) to Claude and ask it to diff intended vs. actual to locate the break.
