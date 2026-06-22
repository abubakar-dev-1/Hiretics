# Hiretics — Serverless Backend

Event-driven serverless backend on **LocalStack** (free). See [`../docs/`](../docs) for the full architecture; this README is the quick command reference.

## Quick start
```bash
cp .env.example .env        # then paste your ROTATED OpenAI key (or set AI_PROVIDER=mock)
npm install
npm run ls:up               # start LocalStack (Docker) on :4566
npm run bootstrap           # deploy tables, bucket, queues, functions to LocalStack
npm run health              # verify everything is provisioned (✅/❌)
```

After `bootstrap`, the Serverless output prints the API Gateway base URL
(`http://localhost:4566/restapis/{id}/local/_user_request_`). Test the health route:
```bash
curl http://localhost:4566/restapis/{id}/local/_user_request_/health
```

## Scripts
| Command | Does |
|---------|------|
| `npm run ls:up` / `ls:down` | start / stop LocalStack |
| `npm run bootstrap` | `serverless deploy` to LocalStack |
| `npm run health` | check tables, bucket, queue exist |
| `npm run remove` | tear down the deployed stack |
| `npm run seed` / `reset` | demo data / reset (added in Phase 7) |

## Status
**Phase 0** — foundations: LocalStack, IaC (4 DynamoDB tables + S3 + SQS/DLQ), `/health` Lambda.
Build progress tracked in [`../docs/07-build-plan.md`](../docs/07-build-plan.md).
