# Hiretics — Documentation & Onboarding

> AI-powered, **event-driven, queue-based, serverless** recruitment platform, emulated locally on **LocalStack** (free, no AWS account, no cost).

This `docs/` folder is the **single source of truth** for the serverless rebuild. It is both the **blueprint** (what we are building and why) and the **recovery manual** (if something breaks, read these to understand intended behavior and restore it).

> ⚠️ **Honesty rule for the viva/report:** This system is *serverless emulated on LocalStack*. Never claim it is "deployed on AWS in production." It is a faithful local emulation — which is exactly what the project set out to prove.

---

## How to read these docs

| # | Doc | Read it when… |
|---|-----|---------------|
| — | [README.md](README.md) (this file) | You're new here or onboarding a teammate. |
| 01 | [01-architecture.md](01-architecture.md) | You want the big picture: components, why each tech, the diagram. |
| 02 | [02-data-model.md](02-data-model.md) | You're touching the database: tables, keys, GSIs, access patterns. |
| 03 | [03-pipelines.md](03-pipelines.md) | You want the *flows/funnels*: the CV pipeline, auth, credits, DLQ. |
| 04 | [04-lambda-inventory.md](04-lambda-inventory.md) | You need the full list of Lambda functions and routes. |
| 05 | [05-local-setup.md](05-local-setup.md) | You're running it on a machine for the first time. |
| 06 | [06-demo-runbook.md](06-demo-runbook.md) | **Demo/viva day** — pre-warm, health checks, fallbacks, "if it breaks". |
| 07 | [07-build-plan.md](07-build-plan.md) | You're building — the phased roadmap & progress tracker. |

---

## The 30-second summary

1. A candidate opens a **secure public link** and uploads a PDF CV **directly to S3** (presigned URL — bypasses the backend).
2. S3 fires an **ObjectCreated event → SQS queue**.
3. A **Lambda worker** consumes the queue: parses the PDF, **atomically deducts a credit**, sends the text to the **AI** for a 0–100 semantic score, writes the result to **DynamoDB**.
4. The worker **pushes a live update** over WebSocket; the recruiter's dashboard updates instantly.
5. If anything fails repeatedly, the message lands in a **Dead Letter Queue** — nothing is lost.

Everything in steps 1–4 runs on **LocalStack** (S3, SQS, Lambda, DynamoDB, API Gateway) inside Docker. The only external dependency is the AI API — and even that has a **MOCK mode** so the whole pipeline runs offline.

---

## Two systems live in this repo (on purpose)

| | **`backend/` (OLD)** | **`serverless/` (NEW)** |
|---|---|---|
| Stack | NestJS + Supabase | Lambda + DynamoDB + SQS + S3 (LocalStack) |
| Status | Working MVP — **kept as fallback** | The real product we're building |
| Role | Demo safety net + logic reference | The graded architecture |

**Never scratch `backend/`.** It is your insurance policy (see [06-demo-runbook.md](06-demo-runbook.md)).

---

## Prerequisites (any machine: Windows/Mac/Linux)

- **Docker Desktop** (runs LocalStack; needs ~4–8 GB RAM free)
- **Node.js v18+**
- **Git**
- An **AI API key** in a gitignored `.env` (see [05-local-setup.md](05-local-setup.md)) — *or* run in `MOCK` mode with no key at all.

## Cost

**$0**, with one optional exception:
- LocalStack Community, Docker, Node, Next.js — **free forever**.
- AI API — OpenAI is pay-per-token (cheap on `gpt-4o-mini`); Gemini has a free tier; `MOCK` mode is free. Swappable via one env var.
