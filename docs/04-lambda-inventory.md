# 04 — Lambda Function Inventory

All functions sit behind one **API Gateway**, except the **worker** (SQS-triggered). Defined in `serverless/serverless.yml`. ~20 functions, grouped by bounded context ("serverless microservices").

| # | Function | Trigger | Route / Source | Auth | Purpose | Access patterns |
|---|----------|---------|----------------|------|---------|-----------------|
| **AUTH** |
| 1 | `auth-signup` | HTTP | `POST /auth/signup` | public | Create company + admin (or user), bcrypt hash | A1, write Company+User |
| 2 | `auth-signin` | HTTP | `POST /auth/signin` | public | Verify password, issue JWT | A1 |
| 3 | `auth-signout` | HTTP | `POST /auth/signout` | JWT | Invalidate client token (stateless ack) | — |
| 4 | `auth-session` | HTTP | `GET /auth/session` | JWT | Validate token, return current user | A2 |
| **CAMPAIGN** |
| 5 | `campaign-create` | HTTP | `POST /campaigns` | JWT | Create campaign + publicHash | write Campaign |
| 6 | `campaign-list` | HTTP | `GET /campaigns` | JWT | List company's campaigns | A6 |
| 7 | `campaign-get` | HTTP | `GET /campaigns/{id}` | JWT | Single campaign | A7 |
| 8 | `campaign-update` | HTTP | `PUT /campaigns/{id}` | JWT | Edit / favorite / archive / close | A7, update |
| 9 | `campaign-delete` | HTTP | `DELETE /campaigns/{id}` | JWT | Delete campaign | A7, delete |
| 10 | `campaign-public` | HTTP | `GET /public/campaigns/{hash}` | **public** | Candidate apply page data | A8 |
| **CANDIDATE** |
| 11 | `candidate-presign` | HTTP | `POST /candidates/presign` | **public** | Create Candidate(Pending) + presigned S3 PUT URL | write Candidate |
| 12 | `candidate-list` | HTTP | `GET /campaigns/{id}/candidates` | JWT | Ranked candidate list | A9 |
| 13 | `candidate-get` | HTTP | `GET /candidates/{id}` | JWT | Single candidate detail | A10 |
| **WORKER (the showpiece)** |
| 14 | `worker-process` | **SQS** | `ResumeProcessingQueue` | n/a | parse → credit → AI → write → emit | A5, A7, A10, A11 |
| **CREDITS / COMPANY** |
| 15 | `company-get` | HTTP | `GET /company` | JWT | Company info + credit balance | A4 |
| 16 | `credits-add` | HTTP | `POST /credits/add` | JWT (**Admin**) | Top up credit pool | A4, update |
| 17 | `recruiters-list` | HTTP | `GET /recruiters` | JWT (**Admin**) | List company users | A3 |
| 18 | `recruiters-invite` | HTTP | `POST /recruiters` | JWT (**Admin**) | Add a recruiter | A1, write User |
| 19 | `recruiters-remove` | HTTP | `DELETE /recruiters/{id}` | JWT (**Admin**) | Remove a recruiter | A2, delete |
| **ANALYTICS** |
| 20 | `analytics-age` | HTTP | `GET /analytics/age` | JWT | Age distribution | A12 |
| 21 | `analytics-city` | HTTP | `GET /analytics/city` | JWT | City distribution | A12 |
| 22 | `analytics-university` | HTTP | `GET /analytics/university` | JWT | University distribution | A12 |

> The count flexes ~19–22 depending on how you split analytics/recruiters. The report's "19 Lambda functions" claim is comfortably satisfied.

## Shared library (`serverless/src/lib/`) — not Lambdas, reused by all
| Module | Responsibility |
|--------|----------------|
| `dynamo.ts` | DynamoDB DocumentClient + table helpers |
| `s3.ts` | presigned URL generation, object fetch |
| `sqs.ts` | (if any direct sends) |
| `jwt.ts` | sign/verify JWT, extract claims |
| `rbac.ts` | role guards (`requireAdmin`, etc.) |
| `response.ts` | consistent HTTP/CORS responses |
| `ai/` | provider interface: `openai.ts`, `gemini.ts`, `mock.ts`, `index.ts` (selects by env) |

## Auth/RBAC enforcement
Each protected handler runs the same opening: verify JWT → attach `{userId, companyId, role}` → scope queries by `companyId`. Admin-only handlers additionally call `requireAdmin(role)` → `403` otherwise. (Implemented as a small wrapper so it's one line per handler.)
