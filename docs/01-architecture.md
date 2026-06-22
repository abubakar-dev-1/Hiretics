# 01 — System Architecture (Target / Serverless)

## What we are claiming (and how each word is earned)

| Term | Earned? | Justification |
|------|---------|---------------|
| **Serverless** | ✅ (emulated) | Logic runs in AWS Lambda functions; no always-on app servers — except one tiny Socket.io process for live updates (declared, not hidden). Emulated on LocalStack, **not** real AWS. |
| **Event-driven** | ✅ | S3 `ObjectCreated` → SQS → Lambda. The core pipeline is triggered by events, not synchronous calls. |
| **Queue-based** | ✅ | Amazon SQS decouples upload from processing, with a Dead Letter Queue for failures. |
| **Microservices** | ✅ (serverless-style) | Lambdas grouped by bounded context (auth, campaign, candidate, credits, analytics, worker), each independently deployable. |

> Full honest label: *"An event-driven, queue-based serverless architecture with microservices-style domain decomposition, emulated locally via LocalStack."*

---

## High-level diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         BROWSER  (Next.js client)                      │
│   Recruiter Dashboard · Admin Panel · Public Candidate Apply page      │
└───────────┬───────────────────────────────────────────┬──────────────┘
            │ REST (JWT in Authorization header)         │ WebSocket (live updates)
            ▼                                             ▼
   ┌─────────────────────┐                      ┌──────────────────────┐
   │   API GATEWAY (REST) │                      │  Socket.io server     │
   │   LocalStack :4566    │                     │  (tiny always-on Node)│
   └─────────┬───────────┘                       └──────────▲───────────┘
             │ routes to                                     │ emit to room=companyId
   ┌─────────┴───────────────────────────────┐              │ (HTTP POST /emit)
   │              LAMBDA FUNCTIONS             │             │
   │  auth · campaign · candidate · credits ·  │             │
   │  analytics                                │             │
   └─────┬───────────────────────┬────────────┘             │
         │                        │ 1. request presigned URL │
         ▼                        ▼                          │
   ┌──────────┐          ┌─────────────────┐                 │
   │ DynamoDB │          │  S3 (resumes)   │                 │
   │ 4 tables │          └────────┬────────┘                 │
   └────▲─────┘                   │ 2. ObjectCreated event   │
        │                         ▼                          │
        │                 ┌─────────────────┐                │
        │                 │ SQS Resume Queue │──► DLQ         │
        │                 └────────┬────────┘                │
        │ 5. write score           │ 3. trigger              │
        │                          ▼                         │
        │                 ┌──────────────────────────────┐   │
        └─────────────────┤   LAMBDA: worker             │   │
                          │  parse PDF → credit deduct    │   │
                          │  → AI score → write DynamoDB  │───┘ 6. push live update
                          │  → emit WebSocket             │
                          └───────────────┬──────────────┘
                                          │ 4. AI call
                                          ▼
                          ┌──────────────────────────────┐
                          │  AI provider (interface)      │
                          │  OpenAI gpt-4o-mini (default) │
                          │  / Gemini (free) / MOCK       │
                          └──────────────────────────────┘

   ╔══════════════════════════════════════════════════════════════╗
   ║  S3 · SQS · Lambda · DynamoDB · API Gateway → all on LocalStack ║
   ║  (Docker, port 4566, free Community Edition)                    ║
   ╚══════════════════════════════════════════════════════════════╝
```

---

## Components

| Component | Tech | Role |
|-----------|------|------|
| **Frontend** | Next.js (existing, repointed) | Recruiter dashboard, admin panel, public apply page. Talks to API Gateway + Socket.io. |
| **API layer** | API Gateway (REST) on LocalStack | Single entry point for all REST calls. |
| **Compute** | AWS Lambda (Node 18 handlers) | Stateless functions, grouped by domain. |
| **Queue** | Amazon SQS + DLQ | Decouples CV upload from processing; retries + dead-lettering. |
| **Storage** | Amazon S3 | Resume PDFs. Direct-to-S3 presigned uploads. |
| **Database** | DynamoDB (table-per-entity) | Companies, Users, Campaigns, Candidates. See [02-data-model.md](02-data-model.md). |
| **Auth** | Custom JWT + bcrypt (Lambda) | Signup/signin; JWT carries `userId, companyId, role`. No Cognito (Pro-only). |
| **Real-time** | Socket.io (tiny Node server) | Worker pushes "candidate scored" → dashboard updates live. |
| **AI** | Provider interface | OpenAI `gpt-4o-mini` default; Gemini & MOCK swappable by env. |
| **IaC** | Serverless Framework + `serverless-localstack` | Defines all functions + resources in `serverless.yml`. |
| **Emulation** | LocalStack Community + Docker | Runs the whole AWS stack locally for free. |

---

## Key design decisions (and why)

1. **Greenfield `serverless/` folder; keep `backend/` (Supabase) as fallback.** Zero risk to the working MVP; clean architecture story (MVP → re-architected).
2. **Table-per-entity DynamoDB**, not single-table. Easier to defend in a viva, easier to extend (new query = new table/GSI without redesign), and strengthens the "each service owns its data" microservices claim. *(Single-table remains a possible future flex; the report contradicts itself on this — R1.5 vs §6.4.2 — so we pick the defensible one.)*
3. **Custom JWT + bcrypt, not Cognito.** Cognito needs LocalStack Pro; custom auth is free, matches the report, and gives us the Company/User/Role model that powers RBAC + credits + multi-tenancy.
4. **Direct-to-S3 presigned upload.** The browser PUTs the PDF straight to S3, bypassing the backend — saves bandwidth and is the trigger source for the event pipeline.
5. **AI behind a provider interface with MOCK mode.** Swap providers in one line; demo the full pipeline offline.
6. **Socket.io over API Gateway WebSockets.** LocalStack Community's WS API Gateway support is flaky; a tiny Node socket server is reliable. The small "always-on" caveat is declared honestly.

---

## Multi-tenancy & RBAC (new vs. the old MVP)

The Supabase MVP had flat users. The serverless system introduces:

- **Company** owns a shared pool of **credits** and many **Users**.
- **Roles:** `Admin` (manages credits + recruiters) and `Recruiter` (runs campaigns).
- **Isolation:** every query is scoped by `companyId` from the JWT — one company can never see another's data.

See [02-data-model.md](02-data-model.md) and [03-pipelines.md](03-pipelines.md).
