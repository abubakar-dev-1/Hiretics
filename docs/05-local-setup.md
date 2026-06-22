# 05 — Local Setup & Onboarding

Goal: a fresh machine (Windows/Mac/Linux) goes from `git clone` to a fully running event-driven serverless stack in a few commands. Everything is free.

## Prerequisites
- **Docker Desktop** running (LocalStack needs ~4–8 GB RAM free)
- **Node.js v18+** and npm
- **Git**
- (Optional) an AI key — or use `MOCK` mode with no key

## Repo layout (after the build)
```
Hiretics-new/
├── backend/                 # OLD NestJS+Supabase MVP — fallback, do not delete
├── client/                  # Next.js frontend (repointed to API Gateway)
├── serverless/              # NEW serverless backend
│   ├── serverless.yml       # functions + DynamoDB + S3 + SQS + DLQ
│   ├── docker-compose.yml    # LocalStack container
│   ├── .env                 # gitignored — secrets live here
│   ├── .env.example         # committed — template, no secrets
│   ├── package.json
│   ├── scripts/
│   │   ├── bootstrap.(sh|js) # deploy resources + functions to LocalStack
│   │   ├── seed.(sh|js)      # insert demo company/campaign/candidates
│   │   ├── health-check.(sh|js)
│   │   └── reset.(sh|js)     # wipe + re-provision to known-good state
│   ├── src/
│   │   ├── handlers/{auth,campaign,candidate,credits,analytics,worker}/
│   │   ├── lib/{dynamo,s3,jwt,rbac,response,ai}.ts
│   │   └── models/          # entity types + repository fns per table
│   └── socket-server/       # tiny Socket.io server
└── docs/                    # you are here
```

## `.env` (in `serverless/`, gitignored)
```bash
# --- AI provider ---
AI_PROVIDER=openai            # openai | gemini | mock
OPENAI_API_KEY=               # paste the ROTATED key here, never in chat/git
OPENAI_MODEL=gpt-4o-mini      # cheap default; alts: gpt-4o, gpt-4.1-mini
GEMINI_API_KEY=               # optional free fallback

# --- Auth ---
JWT_SECRET=change-me-long-random

# --- LocalStack / AWS (fake creds; LocalStack ignores them) ---
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_ENDPOINT=http://localhost:4566

# --- Real-time ---
SOCKET_SERVER_URL=http://localhost:4000
```
> 🔒 `.env*` is already gitignored in this repo. Verified: only `landing/.env.example` is tracked. Never commit a real key.

## First run (intended commands — finalized during the build)
```bash
# 1. Start LocalStack
cd serverless
docker compose up -d                 # LocalStack on :4566

# 2. Provision AWS resources + deploy Lambdas into LocalStack
npm install
npm run bootstrap                     # serverless deploy (localstack plugin) + S3→SQS wiring

# 3. (Optional) seed demo data for a safe demo
npm run seed

# 4. Confirm everything is healthy
npm run health                        # ✅/❌ for S3, SQS, DynamoDB, Lambda, API GW

# 5. Start the real-time server
npm run socket                        # Socket.io on :4000

# 6. Start the frontend (separate terminal)
cd ../client
npm install
npm run dev                           # Next.js on :3000, pointed at API Gateway
```

## How the frontend finds the backend
The Next.js client reads a single base URL for the LocalStack API Gateway, e.g.:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4566/restapis/{apiId}/local/_user_request_
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```
`bootstrap` prints the `{apiId}` after deploy; paste it into `client/.env.local`. (We can also script this auto-fill.)

## Known LocalStack gotchas (documented so you don't lose hours)
1. **CORS on S3 for browser PUT.** Direct-to-S3 upload needs a bucket CORS policy allowing `PUT`/`OPTIONS`. `bootstrap` injects `cors-config.json` via `awslocal s3api put-bucket-cors`. (Report §6.2.)
2. **Lambda → internet (AI API).** LocalStack runs Lambdas in child Docker containers that need host network access to reach OpenAI/Gemini. `docker-compose.yml` maps `/var/run/docker.sock` and sets `LAMBDA_EXECUTOR=docker`. If the AI call times out, this is why — or just use `AI_PROVIDER=mock`.
3. **API Gateway URL format** on LocalStack: `http://localhost:4566/restapis/{id}/local/_user_request_/...`.
4. **Cold starts** on first invoke are slow — always do a warm-up run before a demo (see [06-demo-runbook.md](06-demo-runbook.md)).
