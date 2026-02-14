# HIRETICS - AI-Powered Recruitment Platform
## Final Year Project (FYP) — 50% Progress Report

---

### Project Title
**Hiretics: An AI-Powered Event-Driven Serverless Recruitment Platform with Automated CV Ranking**

### Student Information
- **Degree:** BS (Computer Science / Software Engineering)
- **Semester:** Final Year
- **Report Type:** 50% Progress Report (Part 1 Completion)

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Project Objectives](#3-project-objectives)
4. [Scope of the Project](#4-scope-of-the-project)
5. [Technology Stack & Justification](#5-technology-stack--justification)
6. [System Architecture — Part 1 (Current)](#6-system-architecture--part-1-current)
7. [System Architecture — Part 2 (Planned Migration)](#7-system-architecture--part-2-planned-migration)
8. [Part 1 — What Has Been Completed (50%)](#8-part-1--what-has-been-completed-50)
9. [Part 2 — What Will Be Done (Remaining 50%)](#9-part-2--what-will-be-done-remaining-50)
10. [Database Design](#10-database-design)
11. [API Design & Endpoints](#11-api-design--endpoints)
12. [UI/UX Design Work](#12-uiux-design-work)
13. [AI Integration — Google Gemini for CV Ranking](#13-ai-integration--google-gemini-for-cv-ranking)
14. [Challenges Faced & How They Were Resolved](#14-challenges-faced--how-they-were-resolved)
15. [Research & Development (R&D) — First Half](#15-research--development-rd--first-half)
16. [Project Timeline / Gantt Chart Breakdown](#16-project-timeline--gantt-chart-breakdown)
17. [Testing & Quality Assurance](#17-testing--quality-assurance)
18. [Conclusion](#18-conclusion)

---

## 1. EXECUTIVE SUMMARY

**Hiretics** is a full-stack AI-powered recruitment platform designed to automate and streamline the hiring process for companies. The platform allows recruiters to create job campaigns, receive candidate applications (CV/resume uploads), and leverages **Google Gemini AI** to automatically parse, analyze, and rank candidates based on how well their resume matches the job description — assigning a match score from 1 to 100.

The project is being developed in **two phases:**

- **Part 1 (Completed — 50%):** Built a fully functional MVP using a **microservices architecture** with NestJS backend, Next.js frontend, Supabase (PostgreSQL + Auth + Storage), Stripe payments, and Google Gemini AI integration. Also designed responsive UI for the landing page and dashboard.

- **Part 2 (Planned — Remaining 50%):** Migrate the entire backend to an **event-driven serverless architecture** using AWS services (Lambda, SQS, API Gateway, DynamoDB, S3, Cognito) running on **LocalStack** for local development, using the **Serverless Framework**. Also develop the landing page and add production-readiness features.

This two-phase approach demonstrates a real-world software engineering journey: **build a working product first, then evolve the architecture** to be scalable, cost-efficient, and event-driven.

---

## 2. PROBLEM STATEMENT

Traditional recruitment processes are:

1. **Time-consuming:** HR teams manually screen hundreds or thousands of resumes for each job opening, spending an average of 6-8 seconds per resume.
2. **Inconsistent:** Human bias and fatigue lead to inconsistent evaluation criteria across candidates.
3. **Unscalable:** As application volume grows, manual screening becomes a bottleneck.
4. **Lacking analytics:** Companies have no aggregated insights about their applicant pool (demographics, education backgrounds, geographic distribution).
5. **Expensive:** Enterprise recruitment tools (like Greenhouse, Lever, Workday) cost $5,000–$100,000+ per year, making them inaccessible to small and medium businesses.

**Hiretics solves these problems** by providing an affordable, AI-powered platform that automates CV parsing, ranking, and analytics — turning what takes hours of manual work into seconds of automated processing.

---

## 3. PROJECT OBJECTIVES

### Primary Objectives
1. Develop a web-based recruitment platform where companies can create and manage hiring campaigns
2. Implement AI-powered automatic CV parsing and candidate ranking using Google Gemini
3. Provide real-time analytics dashboards showing applicant demographics
4. Implement a subscription-based business model with Stripe payment integration
5. Demonstrate architectural evolution from microservices to event-driven serverless

### Secondary Objectives
6. Design a responsive, modern UI/UX following current design trends
7. Implement secure user authentication and authorization
8. Ensure the system is scalable and cost-efficient through serverless architecture
9. Demonstrate cloud-native development practices using LocalStack for local AWS emulation

### Learning Objectives
10. Gain hands-on experience with microservices architecture
11. Understand event-driven systems and message queues (SQS)
12. Learn serverless computing patterns (AWS Lambda, API Gateway)
13. Implement AI/ML integration in a production application
14. Practice full-stack development with modern frameworks

---

## 4. SCOPE OF THE PROJECT

### In Scope
- Campaign management (CRUD operations)
- PDF resume upload and AI-powered parsing/ranking
- User authentication (signup, signin, session management)
- Subscription management (Free/Pro plans) with Stripe
- Analytics dashboard (age, city, university distribution)
- Responsive dashboard UI and landing page UI
- Migration to event-driven serverless architecture
- LocalStack-based development environment

### Out of Scope
- Mobile application (iOS/Android)
- Real-time chat between recruiter and candidate
- Video interview scheduling
- Integration with job boards (LinkedIn, Indeed)
- Multi-tenancy (single organization per deployment)
- Production AWS deployment (using LocalStack for demonstration)

---

## 5. TECHNOLOGY STACK & JUSTIFICATION

### Part 1 Stack (Current — Microservices)

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Frontend Framework** | Next.js | 15.3.2 | Server-side rendering, App Router, API routes, React Server Components, industry standard |
| **Frontend Language** | TypeScript | 5.x | Type safety reduces bugs by 15-25% (Microsoft study), better developer experience |
| **UI Library** | React | 18.2.0 | Largest ecosystem, component reusability, hooks API |
| **Styling** | Tailwind CSS | 4.1.6 | Utility-first CSS, rapid prototyping, consistent design, small bundle size |
| **UI Components** | shadcn/ui (Radix UI) | Latest | Accessible, unstyled primitives, full customization control |
| **State Management** | Zustand | 5.0.5 | Lightweight (1KB), simpler than Redux, no boilerplate |
| **Form Handling** | React Hook Form + Zod | 7.56.3 / 3.24.4 | Performant form handling, schema-based validation |
| **Charts** | Recharts | 2.15.3 | React-native charting, responsive, composable |
| **Backend Framework** | NestJS | 11.0.1 | TypeScript-first, modular architecture, dependency injection, enterprise-grade |
| **Database** | Supabase (PostgreSQL) | - | Open-source Firebase alternative, built-in Auth + Storage + Realtime |
| **Authentication** | Supabase Auth | - | Email/password auth, JWT tokens, session management out of the box |
| **File Storage** | Supabase Storage | - | S3-compatible, easy file upload with public URLs |
| **AI/ML** | Google Gemini 1.5 Flash | 0.24.1 | Fast inference, good at structured data extraction, free tier available |
| **PDF Processing** | pdf-parse | 1.1.1 | Lightweight PDF text extraction, Node.js native |
| **Payments** | Stripe | 18.2.1 | Industry standard, excellent developer experience, test mode |
| **Containerization** | Docker + Docker Compose | - | Consistent environments, easy multi-service orchestration |
| **HTTP Client** | Axios | 1.10.0 | Promise-based, interceptors, request/response transformation |

### Part 2 Stack (Planned — Serverless)

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Compute** | AWS Lambda | Pay-per-execution, auto-scaling, zero server management |
| **API Layer** | API Gateway | Managed REST API, request validation, CORS handling |
| **Message Queue** | Amazon SQS | Decouples services, reliable message delivery, dead letter queues |
| **Database** | DynamoDB | Serverless NoSQL, single-digit millisecond performance, pay-per-request |
| **File Storage** | Amazon S3 | Industry standard object storage, 99.999999999% durability |
| **Authentication** | Amazon Cognito | Managed user pools, JWT tokens, MFA support |
| **IaC Framework** | Serverless Framework | Simple YAML config, plugin ecosystem, LocalStack integration |
| **Local Emulation** | LocalStack | Full AWS emulation, free for development, no AWS account needed |

### Why This Two-Stack Approach?

This project deliberately demonstrates **architectural evolution** — a critical real-world skill:

1. **Part 1 (Microservices):** Proves the business logic works. Supabase provides rapid development with built-in auth, database, and storage. NestJS provides structured, maintainable code.

2. **Part 2 (Serverless):** Proves the ability to re-architect for scale. Migrating to Lambda + SQS demonstrates understanding of event-driven patterns, message queues, and cloud-native development.

This mirrors real industry practice: startups build MVPs quickly, then evolve architecture as they scale.

---

## 6. SYSTEM ARCHITECTURE — Part 1 (Current)

### Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                     │
│              Next.js 15 (Port 3000)                  │
│   ┌─────────┬──────────┬──────────┬───────────┐      │
│   │ Signin/ │ Campaign │Analytics │ Settings/ │      │
│   │ Signup  │Dashboard │Dashboard │ Pricing   │      │
│   └────┬────┴────┬─────┴────┬─────┴─────┬─────┘      │
└────────┼─────────┼──────────┼───────────┼────────────┘
         │         │          │           │
    HTTP REST (CORS enabled, localhost)
         │         │          │           │
┌────────▼───┐┌────▼─────┐┌──▼────────┐┌─▼──────────┐
│ Campaign   ││ PDF      ││ Analytics ││Subscription│
│ Service    ││ Ranking  ││ Service   ││ Service    │
│ (NestJS)   ││ Service  ││ (NestJS)  ││ (NestJS)   │
│ Port:3001  ││(NestJS)  ││ Port:3003 ││ Port:3004  │
│            ││Port:3002 ││           ││            │
│ - CRUD     ││- Upload  ││- Age stats││- Create    │
│ - Archive  ││- Parse   ││- City %   ││- Read      │
│ - Favorite ││- AI Rank ││- Uni stats││- Update    │
│ - Status   ││- Storage ││           ││- Plans     │
└─────┬──────┘└──┬───┬───┘└─────┬─────┘└──────┬─────┘
      │          │   │          │              │
      └──────────┼───┼──────────┼──────────────┘
                 │   │          │
          ┌──────▼───▼──────────▼──────┐
          │       SUPABASE             │
          │  ┌──────────────────────┐  │
          │  │   PostgreSQL DB      │  │
          │  │ - campaigns table    │  │
          │  │ - applicants table   │  │
          │  │ - subscription table │  │
          │  └──────────────────────┘  │
          │  ┌──────────────────────┐  │
          │  │   Supabase Auth      │  │
          │  │ - Email/Password     │  │
          │  │ - JWT Sessions       │  │
          │  └──────────────────────┘  │
          │  ┌──────────────────────┐  │
          │  │   Supabase Storage   │  │
          │  │ - resumes bucket     │  │
          │  │ - PDF files          │  │
          │  └──────────────────────┘  │
          └────────────────────────────┘
                       │
              ┌────────▼────────┐
              │  Google Gemini  │    ┌──────────┐
              │  1.5 Flash API  │    │  Stripe  │
              │  (CV Analysis)  │    │  (Payments)│
              └─────────────────┘    └──────────┘
```

### Architecture Pattern: Microservices

Each service is:
- **Independent:** Separate NestJS application with its own module, controller, service, DTOs
- **Containerized:** Individual Dockerfile, orchestrated via Docker Compose
- **Loosely coupled:** Services communicate only through the shared Supabase database
- **Independently deployable:** Each service can be built and deployed separately

### Service Responsibilities

| Service | Port | Responsibility | Tables Used |
|---------|------|---------------|-------------|
| Campaign Service | 3001 | Campaign CRUD, status management, archiving, favorites | campaigns |
| PDF Ranking Service | 3002 | CV upload, PDF text extraction, Gemini AI analysis, candidate scoring | campaigns (read), applicants (write), Supabase Storage |
| Analytics Service | 3003 | Aggregate statistics — age, city, university distribution | applicants (read) |
| Subscription Service | 3004 | User plan management (Free/Pro), billing status | subscription |

---

## 7. SYSTEM ARCHITECTURE — Part 2 (Planned Migration)

### Target Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                     │
│              Next.js 15 (Port 3000)                  │
└────────────────────────┬─────────────────────────────┘
                         │
                    HTTPS / REST
                         │
              ┌──────────▼──────────┐
              │    API GATEWAY      │
              │  (Single REST API)  │
              │   LocalStack:4566   │
              └──┬──┬──┬──┬──┬──┬──┘
                 │  │  │  │  │  │
    ┌────────────┘  │  │  │  │  └──────────────┐
    │     ┌─────────┘  │  │  └─────────┐       │
    ▼     ▼            ▼  ▼            ▼       ▼
┌──────┐┌──────┐  ┌──────┐┌──────┐┌──────┐┌──────┐
│Campaign││ CV  │  │Analyt││ Subs ││ Auth ││ CV   │
│Lambdas││Upload│  │Lambds││Lambds││Lambds││Process│
│ (6)   ││  λ  │  │ (3)  ││ (3)  ││ (4)  ││  λ   │
└──┬────┘└──┬──┘  └──┬───┘└──┬───┘└──┬───┘└──┬───┘
   │        │        │       │       │       │
   │        │   SQS  │       │       │       │
   │        ├───────────────────────────────►│
   │        │  cv-processing-queue           │
   │        │                                │
   │   ┌────▼────┐                      ┌────▼────┐
   │   │   S3    │                      │ Gemini  │
   │   │ Bucket  │                      │   AI    │
   │   │(resumes)│                      │  API    │
   │   └─────────┘                      └─────────┘
   │
   └──────────┬──────────┬──────────┐
              │          │          │
        ┌─────▼────┐┌────▼─────┐┌──▼──────────┐
        │ DynamoDB ││ DynamoDB ││  DynamoDB   │
        │campaigns ││applicants││subscriptions│
        └──────────┘└──────────┘└─────────────┘
                                       │
              ┌────────────┐     ┌─────▼─────┐
              │  Cognito   │     │  Stripe   │
              │ User Pool  │     │ (Payments)│
              └────────────┘     └───────────┘

        ╔══════════════════════════════════════╗
        ║  ALL RUNNING ON LOCALSTACK           ║
        ║  (Free, No AWS Account Required)     ║
        ║  Single container on port 4566       ║
        ╚══════════════════════════════════════╝
```

### Key Architectural Changes (Part 1 → Part 2)

| Aspect | Part 1 (Current) | Part 2 (Target) |
|--------|------------------|-----------------|
| **Compute** | 4 NestJS servers (always running) | 19 Lambda functions (on-demand) |
| **Communication** | Synchronous REST only | Event-driven via SQS + REST |
| **Database** | PostgreSQL (Supabase) | DynamoDB (NoSQL, serverless) |
| **Auth** | Supabase Auth | AWS Cognito |
| **Storage** | Supabase Storage | Amazon S3 |
| **API Layer** | 4 separate ports (3001-3004) | Single API Gateway |
| **CV Processing** | Synchronous (user waits) | Async via SQS (immediate response) |
| **Deployment** | Docker Compose | Serverless Framework → LocalStack |
| **Scaling** | Manual (add containers) | Automatic (Lambda auto-scales) |
| **Cost Model** | Pay for uptime | Pay per request |

---

## 8. PART 1 — WHAT HAS BEEN COMPLETED (50%)

### 8.1 Backend Microservices (Fully Functional)

#### Campaign Service — 100% Complete
- POST /campaigns — Create new campaign with validation
- GET /campaigns — List all campaigns with archive filtering
- GET /campaigns/favourite — Filter favorite campaigns
- GET /campaigns/{id} — Get single campaign details
- PUT /campaigns/{id} — Update campaign (auto-calculates status from dates)
- DELETE /campaigns/{id} — Delete campaign
- **Auto Status Management:** Campaigns automatically transition between `not-started`, `ongoing`, and `completed` based on start/end dates using date-fns library

#### PDF Ranking Service — 100% Complete
- POST /cv — Upload PDF resume (multipart form-data)
  - Parses PDF text using pdf-parse library
  - Uploads file to Supabase Storage (resumes bucket)
  - Sends resume text + job description to Google Gemini 1.5 Flash
  - AI extracts: name, email, city, university, age, and match score (1-100)
  - Stores applicant record in database
- GET /cv — Retrieve ranked candidates sorted by AI score (descending)

#### Analytics Service — 100% Complete
- GET /analytics/age — Age distribution statistics
- GET /analytics/city — City distribution with percentages
- GET /analytics/university — University distribution with counts

#### Subscription Service — 100% Complete
- POST /subs — Create subscription record (free plan on signup)
- GET /subs — Get user's current plan
- PATCH /subs — Update plan (free → pro after Stripe checkout)

### 8.2 Frontend Application (Fully Functional)

#### Authentication System — 100% Complete
- **Sign Up Page:** Registration with full name, email, password
  - Password strength validation (8+ chars, uppercase, lowercase, number)
  - Terms & conditions acceptance
  - Auto-creates free subscription on successful signup
- **Sign In Page:** Email/password login with Supabase Auth
  - Error handling, loading states, password visibility toggle
- **Protected Routes:** Automatic redirect to signin for unauthenticated users
  - Public routes: signup, applicant submission page
- **Session Management:** JWT-based sessions via Supabase, localStorage persistence
- **Logout:** Available from sidebar and dropdown menu

#### Dashboard (Home Page) — 100% Complete
- Campaign cards grid layout (responsive)
- Create new campaign button/card
- Campaign status indicators (ongoing, completed, not-started)
- Loading skeleton screens
- Empty state handling

#### Campaign Management — 100% Complete
- **Campaign Creation Dialog:** Multi-step form with validation
  - Fields: name, company name, job role, job description, start/end dates
- **Campaign Detail Page:** Full campaign view with applicant list
- **Archive/Unarchive:** Soft delete to trash
- **Favorite/Unfavorite:** Mark campaigns as favorites
- **Edit Campaign:** Update all fields

#### Applicant/CV System — 100% Complete
- **Public Applicant Page:** `/campaign/applicants/{id}` — no auth required
  - File upload (PDF, DOC, DOCX supported)
  - Campaign ID auto-linked
- **Ranked Applicants View:** Inside campaign detail page
  - Sorted by AI match score (highest first)
  - Name, email, CV download link displayed

#### Analytics Dashboard — 100% Complete
- Age distribution chart
- City distribution with percentages
- University distribution chart
- Built with Recharts library

#### Pricing Page — 100% Complete
- Free plan: $0/month, 3 campaigns max
- Pro plan: $29/month, unlimited features
- Stripe Checkout integration
  - Creates checkout session via Next.js API route
  - Redirects to Stripe hosted payment page
  - On success, updates subscription via backend API

#### Settings Page — 100% Complete
- Change email dialog
- Change password dialog
- Upload profile photo dialog

#### Favorites Page — 100% Complete
- Filtered view of favorited campaigns

#### Trash Page — 100% Complete
- View archived/deleted campaigns

#### UI/UX Features — 100% Complete
- **Dark Mode:** Full light/dark theme switching via next-themes
- **Responsive Design:** Mobile-first, works on all screen sizes
- **Toast Notifications:** Success/error feedback via Sonner
- **Loading States:** Skeleton screens, progress indicators
- **Top Loading Bar:** Page transition progress via nextjs-toploader

### 8.3 UI Design Work

#### Dashboard UI — Designed & Developed
- Responsive grid layout for campaign cards
- Sidebar navigation with collapsible menu
- Header with user info, theme toggle, notifications
- Mobile-specific header and navigation

#### Landing Page UI — Designed (Not Yet Developed)
- Responsive landing page design completed
- Hero section, features section, pricing section, testimonials, footer
- Will be developed as part of Part 2

### 8.4 DevOps & Infrastructure
- Docker Compose orchestration for all 4 backend services
- Individual Dockerfiles (Node 18 Alpine)
- Git version control with Husky pre-commit hooks
- Environment variable management via .env files

### 8.5 Code Quality
- Full TypeScript across frontend and backend
- DTO validation with class-validator (backend)
- Zod schema validation (frontend)
- ESLint + Prettier configured
- Modular architecture (controllers, services, DTOs pattern)

---

## 9. PART 2 — WHAT WILL BE DONE (Remaining 50%)

### 9.1 Backend Migration to Serverless (Core Work)

| Task | Description | Complexity |
|------|-------------|-----------|
| LocalStack Setup | Docker Compose for LocalStack, setup script for all AWS resources | Medium |
| Serverless Framework Config | serverless.yml with 19 Lambda functions, DynamoDB tables, SQS queues, S3 bucket | High |
| Common Utilities | DynamoDB client, SQS client, S3 client, Cognito client, response helpers | Medium |
| Campaign Lambdas (6) | Migrate all CRUD operations from Supabase/NestJS to DynamoDB/Lambda | High |
| CV Upload Lambda | Multipart parsing, S3 upload, SQS message send (async pattern) | High |
| CV Process Lambda | SQS consumer: PDF parse → Gemini AI → DynamoDB write | High |
| CV List Lambda | Query DynamoDB GSI for ranked applicants | Medium |
| Analytics Lambdas (3) | DynamoDB Scan with in-memory aggregation | Medium |
| Subscription Lambdas (3) | DynamoDB CRUD for subscription records | Medium |
| Auth Lambdas (4) | Cognito signup, signin, signout, getSession | High |

### 9.2 Frontend Updates

| Task | Description |
|------|-------------|
| Auth Migration | Replace Supabase auth calls with HTTP calls to /auth/* Lambda endpoints |
| API URL Consolidation | Point all API calls to single LocalStack API Gateway URL |
| Token Management | Store Cognito JWT tokens, add Authorization headers to all requests |
| Async CV Upload | Handle 202 response, show processing status, poll for results |
| Landing Page Development | Build the designed landing page with Next.js |

### 9.3 Event-Driven Features

| Feature | Description |
|---------|-------------|
| CV Processing Queue | SQS queue for async PDF parsing and AI analysis |
| Dead Letter Queue | Failed CV processing messages for investigation |
| Campaign Events Queue | Event bus for campaign lifecycle events (future consumers) |
| Subscription Events Queue | Event bus for subscription changes (future consumers) |

### 9.4 Landing Page Development
- Develop the responsive landing page from existing UI design
- Hero section with call-to-action
- Features showcase
- Pricing section
- How it works section
- Testimonials / social proof
- Footer with links

### 9.5 Production Readiness
- JWT-based API authentication on all protected endpoints
- CORS configuration for API Gateway
- Error handling and logging
- End-to-end testing
- Developer documentation

---

## 10. DATABASE DESIGN

### Part 1 — Current (Supabase PostgreSQL)

#### campaigns table
```sql
CREATE TABLE campaigns (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR NOT NULL,
  company_name VARCHAR NOT NULL,
  job_role    VARCHAR NOT NULL,
  job_description TEXT NOT NULL,
  status      VARCHAR DEFAULT 'not-started',  -- 'ongoing' | 'completed' | 'not-started'
  is_favorite BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  start_date  DATE,
  end_date    DATE,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

#### applicants table
```sql
CREATE TABLE applicants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR NOT NULL,
  email       VARCHAR NOT NULL,
  cv_link     TEXT NOT NULL,
  age         INTEGER,
  campaign_id UUID REFERENCES campaigns(id),
  city        VARCHAR,
  university  VARCHAR,
  score       INTEGER CHECK (score >= 1 AND score <= 100),
  created_at  TIMESTAMP DEFAULT NOW()
);
```

#### subscription table
```sql
CREATE TABLE subscription (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  plan        VARCHAR NOT NULL DEFAULT 'free',
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

### Part 2 — Target (DynamoDB)

#### campaigns table
- **Partition Key:** id (String, UUID)
- **GSI IsArchivedIndex:** PK=is_archived (Number 0/1), SK=created_at (String)
- **GSI FavouriteIndex:** PK=is_favorite (Number 0/1), SK=created_at (String)

#### applicants table
- **Partition Key:** id (String, UUID)
- **GSI CampaignScoreIndex:** PK=campaign_id (String), SK=score (Number)

#### subscriptions table
- **Partition Key:** user_id (String)

### Why DynamoDB over PostgreSQL for Part 2?
- **Serverless-native:** No connection pooling issues with Lambda
- **Pay-per-request:** No provisioned capacity needed
- **Single-digit ms latency:** Consistent performance at any scale
- **Fully managed:** No database administration
- **Works on LocalStack:** Full DynamoDB emulation available

---

## 11. API DESIGN & ENDPOINTS

### Complete API Reference

#### Campaign Endpoints
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | /campaigns | Create campaign | `{ name, company_name, job_role, job_description, start_date?, end_date? }` | Campaign object (201) |
| GET | /campaigns | List campaigns | Query: `?is_archived=true/false` | Campaign[] (200) |
| GET | /campaigns/favourite | List favorites | - | Campaign[] (200) |
| GET | /campaigns/{id} | Get one campaign | - | Campaign object (200) |
| PUT | /campaigns/{id} | Update campaign | Partial campaign fields | Campaign object (200) |
| DELETE | /campaigns/{id} | Delete campaign | - | `{ message }` (200) |

#### CV/Applicant Endpoints
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | /cv | Upload & rank CV | FormData: `file` (PDF) + `campaign_id` | Part 1: Full result (200). Part 2: Accepted (202) |
| GET | /cv | Get ranked CVs | Query: `?campaign_id=uuid` | Applicant[] sorted by score desc (200) |

#### Analytics Endpoints
| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | /analytics/age | Age distribution | `[{ age, count }]` |
| GET | /analytics/city | City distribution | `[{ city, percentage }]` |
| GET | /analytics/university | University distribution | `[{ university, count }]` |

#### Subscription Endpoints
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | /subs | Create subscription | `{ user_id, plan }` | `{ message, user_id, plan }` |
| GET | /subs | Get subscription | Query: `?user_id=uuid` | `{ user_id, plan }` |
| PATCH | /subs | Update plan | `{ user_id, plan }` | `{ message, user_id, plan }` |

#### Auth Endpoints (Part 2 — New)
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | /auth/signup | Register user | `{ email, password, full_name }` | `{ message, userId }` |
| POST | /auth/signin | Login user | `{ email, password }` | `{ accessToken, idToken, user }` |
| POST | /auth/signout | Logout user | Authorization header | `{ message }` |
| GET | /auth/session | Validate session | Authorization header | `{ user }` |

---

## 12. UI/UX DESIGN WORK

### Dashboard Design (Developed)
- **Layout:** Responsive grid with collapsible sidebar
- **Navigation:** Home, Favorites, Trash, Settings, Analytics
- **Theme:** Dual theme (light/dark) with green primary (#16A34A), purple secondary (#9333EA), amber accent (#F59E0B)
- **Components:** Built with shadcn/ui (Radix UI primitives) for full accessibility
- **Responsiveness:** Mobile-first design, tested on all breakpoints
- **Loading States:** Skeleton screens for all data-dependent views

### Landing Page Design (Designed, Development in Part 2)
- **Hero Section:** Tagline, CTA button, hero illustration
- **Features Section:** Key platform capabilities with icons
- **How It Works:** Step-by-step visual guide
- **Pricing Section:** Free vs Pro plan comparison
- **Testimonials:** Social proof section
- **Footer:** Links, contact info, social media
- **Responsiveness:** Fully responsive design for mobile, tablet, desktop

### Design Decisions
- **Why shadcn/ui:** Unlike Material UI or Chakra, shadcn/ui gives you the actual component code (not a dependency), allowing full customization while maintaining accessibility
- **Why Tailwind CSS:** Faster iteration than traditional CSS, consistent spacing/color system, excellent dark mode support, smaller bundle than CSS-in-JS solutions
- **Why Zustand over Redux:** For this project's scale, Redux is overkill. Zustand provides the same functionality with 90% less boilerplate code

---

## 13. AI INTEGRATION — Google Gemini for CV Ranking

### How It Works

```
┌─────────┐    ┌──────────┐    ┌─────────────┐    ┌──────────┐
│  PDF     │───►│ pdf-parse│───►│   Gemini    │───►│ Structured│
│  Upload  │    │ (extract │    │ 1.5 Flash   │    │   JSON    │
│          │    │  text)   │    │  (analyze)  │    │  Output   │
└─────────┘    └──────────┘    └─────────────┘    └──────────┘
```

### The AI Prompt

The system sends Google Gemini this prompt:
```
Given the following resume and job description, extract the following information
from the resume and provide a score (1-100) based on how well the resume matches
the job description:

- name
- email
- city
- university
- age
- score (1-100 based on job description fit)

Resume: {extracted PDF text}

Job Description: {campaign's job description}

Return ONLY a JSON object with these fields:
{
  "name": "",
  "email": "",
  "city": "",
  "university": "",
  "age": 0,
  "score": 0
}
```

### Why Google Gemini 1.5 Flash?
1. **Speed:** Flash model optimized for fast inference (< 2 seconds for CV analysis)
2. **Accuracy:** Excellent at structured data extraction from unstructured text
3. **Cost:** Generous free tier (15 RPM, 1M tokens/day) — suitable for development and small-scale production
4. **JSON Mode:** Reliably outputs valid JSON when prompted correctly
5. **Context Window:** 1M tokens — can handle even the longest resumes

### Scoring Methodology
The AI evaluates the resume against the job description considering:
- **Skills match:** Technical skills mentioned vs. required
- **Experience relevance:** Work history alignment with job role
- **Education fit:** Degree and university relevance
- **Keywords:** Job description keywords found in resume
- **Overall coherence:** Resume quality and professionalism

The score (1-100) represents the AI's confidence that this candidate is a good fit for the specific job.

---

## 14. CHALLENGES FACED & HOW THEY WERE RESOLVED

### Challenge 1: Microservices Communication Pattern
**Problem:** Initially considered using HTTP inter-service communication (Service A calls Service B's API). This creates tight coupling and cascading failure risk.

**Resolution:** Designed services to be independent — each service directly queries Supabase. In Part 2, introducing SQS queues for true event-driven decoupling. The PDF Ranking Service writes to the `applicants` table, and the Analytics Service reads from it — no direct service-to-service HTTP calls.

**Learning:** Shared database pattern is simpler for MVPs but doesn't scale. Event-driven patterns (SQS) in Part 2 properly decouple services.

### Challenge 2: PDF Parsing Reliability
**Problem:** Different PDF formats (text-based, image-based, encrypted) caused pdf-parse to fail or return empty text for some resumes.

**Resolution:** Added error handling around PDF parsing. For text extraction failures, the system returns a meaningful error message instead of crashing. The Gemini AI also handles partial text gracefully, extracting whatever information is available.

**Learning:** PDF is not a reliable text format. Production systems need OCR (Tesseract) as a fallback for image-based PDFs.

### Challenge 3: Gemini AI Response Consistency
**Problem:** Google Gemini occasionally returned malformed JSON, extra text around the JSON, or different field names than requested.

**Resolution:**
- Added explicit "Return ONLY a JSON object" instruction in the prompt
- Implemented JSON parsing with try-catch and regex extraction to find JSON within larger responses
- Added validation of extracted fields with fallback defaults

**Learning:** LLM outputs are probabilistic, not deterministic. Always validate and sanitize AI responses before storing in database.

### Challenge 4: CORS Configuration Across Microservices
**Problem:** Frontend on port 3000 making requests to 4 different backend ports (3001-3004) caused CORS errors during development.

**Resolution:** Added explicit CORS configuration in every NestJS service's `main.ts`:
```typescript
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

**Learning:** In Part 2, a single API Gateway eliminates this problem entirely — all requests go through one endpoint.

### Challenge 5: Campaign Status Synchronization
**Problem:** Campaign status (not-started/ongoing/completed) needed to stay in sync with current date. If a campaign's end_date passes, it should automatically become "completed."

**Resolution:** Implemented date-based status computation using date-fns library. Status is recalculated on every read operation:
```typescript
if (endDate < today) status = 'completed';
else if (startDate <= today) status = 'ongoing';
else status = 'not-started';
```

**Learning:** This "compute on read" approach works for small datasets but is inefficient at scale. Part 2 should use a scheduled Lambda (cron) to batch-update statuses.

### Challenge 6: File Upload Handling in NestJS
**Problem:** Handling multipart form-data (PDF upload) alongside JSON body fields (campaign_id) required special configuration.

**Resolution:** Used NestJS `@UseInterceptors(FileInterceptor('file'))` with `@UploadedFile()` decorator, combined with `@Body()` for the campaign_id field. Multer handles the multipart parsing.

**Learning:** In Part 2 (Lambda), multipart parsing requires a different approach since there's no Express middleware. Will use `lambda-multipart-parser` or `busboy` library.

### Challenge 7: Supabase Storage Public URLs
**Problem:** Uploaded PDFs needed to be publicly accessible so recruiters could download candidate CVs, but Supabase Storage buckets are private by default.

**Resolution:** Configured the `resumes` bucket as public in Supabase dashboard. Used `getPublicUrl()` method to generate permanent public URLs for each uploaded file.

**Learning:** In Part 2, S3 bucket with public-read policy or presigned URLs will replace this.

### Challenge 8: Stripe Integration with Subscription Service
**Problem:** Needed to coordinate between Stripe (external payment) and the subscription service (internal plan tracking). After Stripe checkout, the subscription needs to be updated from "free" to "pro."

**Resolution:** Implemented a callback flow:
1. Frontend creates Stripe checkout session via Next.js API route
2. On successful payment, Stripe redirects to `/pricing?session_id=xxx`
3. Frontend detects the session_id, calls PATCH /subs to update the plan

**Learning:** This client-side callback approach works but isn't reliable (user could close browser). Part 2 should implement Stripe webhooks for server-side confirmation.

---

## 15. RESEARCH & DEVELOPMENT (R&D) — First Half

### R&D Area 1: Microservices vs. Monolith Architecture
**Research Conducted:**
- Studied Martin Fowler's microservices patterns
- Compared monolithic NestJS app vs. microservices approach
- Analyzed communication patterns: synchronous REST vs. async messaging

**Decision:** Chose microservices for Part 1 to demonstrate service independence, then event-driven serverless for Part 2 to demonstrate architectural evolution.

**Key Findings:**
- Microservices add operational complexity but enable independent scaling
- For a 4-service system, the overhead is manageable
- Shared database pattern simplifies initial development but creates coupling

### R&D Area 2: AI Model Selection for CV Analysis
**Models Evaluated:**
| Model | Pros | Cons | Decision |
|-------|------|------|----------|
| GPT-4 (OpenAI) | Highest accuracy | Expensive ($30/1M tokens), rate limits | Rejected — cost |
| GPT-3.5 Turbo | Cheap, fast | Lower accuracy for structured extraction | Rejected — accuracy |
| Gemini 1.5 Flash | Fast, free tier, good JSON output | Newer, less community support | **Selected** |
| Claude (Anthropic) | Excellent reasoning | Expensive, no free tier | Rejected — cost |
| Llama 3 (Local) | Free, private | Requires GPU, slower, setup complexity | Rejected — infrastructure |

**Why Gemini 1.5 Flash Won:**
- Free tier: 15 requests/minute, 1M tokens/day
- Sub-2-second response times
- Reliable JSON output with proper prompting
- No infrastructure needed (API call only)

### R&D Area 3: Database Selection
**Databases Evaluated:**
| Database | Pros | Cons | Phase |
|----------|------|------|-------|
| Supabase (PostgreSQL) | Built-in auth, storage, realtime, free tier | Not serverless-native | Part 1 |
| Firebase (Firestore) | Serverless, real-time | Vendor lock-in, limited queries | Rejected |
| MongoDB Atlas | Flexible schema, free tier | Not truly serverless | Rejected |
| DynamoDB | Serverless, fast, pay-per-request | NoSQL limitations, learning curve | Part 2 |
| PlanetScale (MySQL) | Serverless MySQL, branching | Limited free tier | Rejected |

**Decision:** Supabase for Part 1 (fastest MVP development with built-in auth/storage), DynamoDB for Part 2 (serverless-native, works on LocalStack).

### R&D Area 4: Serverless Framework Comparison
**Frameworks Evaluated for Part 2:**
| Framework | Pros | Cons | Decision |
|-----------|------|------|----------|
| Serverless Framework | Largest community, plugins, LocalStack support | YAML config | **Selected** |
| AWS SAM | Official AWS tool, CloudFormation-based | Heavier setup, less plugin ecosystem | Rejected |
| AWS CDK | TypeScript IaC, powerful | Complex, steeper learning curve | Rejected |
| Terraform | Multi-cloud, mature | Different paradigm, not serverless-focused | Rejected |

### R&D Area 5: LocalStack for Local Development
**Research Conducted:**
- Tested LocalStack Community Edition (free) vs. Pro ($35/month)
- Verified service coverage: DynamoDB, SQS, S3, Lambda, API Gateway, Cognito — all available in Community Edition
- Tested `serverless-localstack` plugin compatibility
- Benchmarked LocalStack performance vs. real AWS

**Key Findings:**
- LocalStack Community Edition supports all required services
- API Gateway on LocalStack uses URL format: `http://localhost:4566/restapis/{id}/local/_user_request_/`
- Cognito on LocalStack has partial support — token validation may differ from real AWS
- DynamoDB on LocalStack is fully compatible with AWS SDK
- Cold start times on LocalStack are significantly faster than real Lambda

### R&D Area 6: Event-Driven Patterns with SQS
**Research Conducted:**
- Studied async processing patterns for file uploads
- Analyzed dead letter queue (DLQ) strategies for failed processing
- Researched SQS vs. SNS vs. EventBridge for event routing

**Decision:** SQS for direct queue-based processing (CV pipeline), with DLQ for failure handling. SNS/EventBridge would add complexity without benefit at this scale.

---

## 16. PROJECT TIMELINE / GANTT CHART BREAKDOWN

### Part 1 Timeline (Completed)

| Week | Phase | Tasks Completed |
|------|-------|----------------|
| Week 1-2 | **Research & Planning** | Requirements gathering, technology research, architecture design, Figma wireframes |
| Week 3-4 | **Database & Auth Setup** | Supabase project setup, database schema design, table creation, auth configuration |
| Week 5-6 | **Backend - Campaign & Subscription** | NestJS project setup, Campaign Service (6 endpoints), Subscription Service (3 endpoints), Docker setup |
| Week 7-8 | **Backend - PDF Ranking & Analytics** | PDF Ranking Service (Gemini AI integration, PDF parsing, file upload), Analytics Service (3 endpoints) |
| Week 9-10 | **Frontend - Auth & Dashboard** | Next.js setup, signin/signup pages, protected routes, dashboard layout, sidebar, header |
| Week 11-12 | **Frontend - Features** | Campaign creation, applicant management, analytics page, favorites, trash, settings |
| Week 13-14 | **Integration & UI** | Stripe payment integration, landing page UI design, responsive design, dark mode, bug fixes |

### Part 2 Timeline (Planned)

| Week | Phase | Tasks Planned |
|------|-------|---------------|
| Week 15-16 | **LocalStack & Infrastructure** | LocalStack setup, setup scripts, serverless.yml, common utilities |
| Week 17-18 | **Lambda Migration - Core** | Campaign Lambdas (6), Subscription Lambdas (3), DynamoDB operations |
| Week 19-20 | **Lambda Migration - CV & Events** | CV Upload + Process Lambdas (SQS pattern), Analytics Lambdas, event queues |
| Week 21-22 | **Auth & Frontend** | Cognito auth Lambdas (4), frontend auth migration, API URL updates |
| Week 23-24 | **Landing Page & Polish** | Landing page development, end-to-end testing, documentation, final presentation |

---

## 17. TESTING & QUALITY ASSURANCE

### Part 1 Testing Approach
- **Manual API Testing:** All 14 endpoints tested with Postman/curl
- **Frontend Testing:** Manual browser testing across Chrome, Firefox, Edge
- **Responsive Testing:** Chrome DevTools device simulation (mobile, tablet, desktop)
- **Integration Testing:** End-to-end user flows (signup → create campaign → upload CV → view results)
- **Error Handling:** Tested error scenarios (invalid input, network failures, AI response failures)

### Part 2 Testing Plan
- **Unit Testing:** Jest for individual Lambda handlers
- **Integration Testing:** LocalStack-based end-to-end testing
- **SQS Testing:** Verify message flow, DLQ behavior, retry logic
- **Auth Testing:** Full Cognito flow (signup → verify → signin → session → signout)
- **Load Testing:** Concurrent CV uploads to test SQS queue behavior

---

## 18. CONCLUSION

### Part 1 Achievements
The first 50% of the Hiretics project has delivered a **fully functional MVP** with:
- 4 independent microservices handling campaigns, CV ranking, analytics, and subscriptions
- AI-powered CV analysis using Google Gemini achieving automated candidate scoring
- Complete user authentication and subscription management
- Responsive dashboard UI with dark mode support
- Stripe payment integration for subscription billing
- Docker-based deployment setup

### Part 2 Vision
The remaining 50% will demonstrate **architectural maturity** by:
- Migrating to event-driven serverless architecture (Lambda + SQS)
- Implementing true async processing for CV analysis
- Replacing Supabase with AWS-native services (DynamoDB, S3, Cognito)
- Running everything on LocalStack for cost-free development
- Developing the landing page from existing designs
- Adding production-readiness features

### Key Takeaway
This project showcases the complete software engineering lifecycle: from problem identification → technology research → MVP development → architectural evolution. The deliberate two-phase approach mirrors real-world engineering practices where teams build working products first, then optimize architecture for scale and maintainability.

---

## APPENDIX

### A. Environment Variables Reference
```
# Frontend (client/.env.local)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE_URL_SUBSCRIPTION=http://localhost:3004
NEXT_PUBLIC_API_BASE_URL_ANALYTICS=http://localhost:3003
NEXT_PUBLIC_API_BASE_URL_APPLICANTS=http://localhost:3002
STRIPE_SECRET_KEY=

# Backend Services (.env per service)
SUPABASE_URL=
SUPABASE_KEY=
GEMINI_API_KEY=          # PDF Ranking Service only
```

### B. Repository Structure
```
Hiretics-new/
├── client/                    # Next.js 15 frontend
│   ├── src/
│   │   ├── app/              # Pages (App Router)
│   │   ├── components/       # React components
│   │   ├── api/              # API client functions
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities (api, supabase, stripe)
│   │   ├── store/            # Zustand state
│   │   └── types/            # TypeScript types
│   └── public/               # Static assets
├── backend/                   # NestJS microservices
│   ├── campaign-service/     # Port 3001
│   ├── pdf-ranking-service/  # Port 3002
│   ├── analytics-service/    # Port 3003
│   ├── subscription-service/ # Port 3004
│   └── docker-compose.yml
└── package.json              # Root (Husky hooks)
```

### C. External Services & API Keys Required
| Service | Purpose | Free Tier |
|---------|---------|-----------|
| Supabase | Database, Auth, Storage | 500MB DB, 1GB storage, 50K auth users |
| Google Gemini | CV analysis AI | 15 RPM, 1M tokens/day |
| Stripe | Payment processing | Full test mode, no charges |
| LocalStack (Part 2) | AWS emulation | Fully free Community Edition |

---

---

## 19. BRANDING & COLOR GUIDE (For PPT / Presentation)

### Brand Identity
- **Project Name:** Hiretics
- **Tagline:** AI-Powered Recruitment Platform
- **Font Family:** Geist Sans (primary), Geist Mono (code/technical)

### Primary Color Palette

| Color | Hex Code | RGB | Usage |
|-------|----------|-----|-------|
| **Primary Green** | `#16A34A` | rgb(22, 163, 74) | Main brand color, buttons, CTAs, active states, success indicators |
| **Secondary Purple** | `#9333EA` | rgb(147, 51, 234) | Secondary actions, highlights, badges, accent elements |
| **Accent Amber** | `#F59E0B` | rgb(245, 158, 11) | Warnings, stars/favorites, attention-grabbing elements |
| **Destructive Red** | `#EF4444` | rgb(239, 68, 68) | Errors, delete actions, danger states |

### Light Theme Colors (PPT Light Slides)

| Element | Color | Hex |
|---------|-------|-----|
| **Background** | White | `#FFFFFF` |
| **Text (Primary)** | Near Black | `#1A1A1A` |
| **Text (Secondary/Muted)** | Gray | `#737373` |
| **Card Background** | White | `#FFFFFF` |
| **Borders** | Light Gray | `#E5E5E5` |
| **Sidebar Background** | Off White | `#FAFAFA` |

### Dark Theme Colors (PPT Dark Slides)

| Element | Color | Hex |
|---------|-------|-----|
| **Background** | Near Black | `#1A1A1A` |
| **Text (Primary)** | Off White | `#FAFAFA` |
| **Text (Secondary/Muted)** | Gray | `#A3A3A3` |
| **Card Background** | Dark Gray | `#262626` |
| **Borders** | White 10% opacity | `#FFFFFF1A` |
| **Sidebar Background** | Dark Gray | `#262626` |

### Chart/Data Visualization Colors

| Chart Color | Light Mode Hex | Dark Mode Hex | Use For |
|-------------|---------------|---------------|---------|
| Chart 1 | `#E76F51` (Orange-Red) | `#4F46E5` (Indigo) | Primary data series |
| Chart 2 | `#2A9D8F` (Teal) | `#10B981` (Emerald) | Secondary data series |
| Chart 3 | `#264653` (Dark Teal) | `#F59E0B` (Amber) | Tertiary data series |
| Chart 4 | `#E9C46A` (Gold) | `#A855F7` (Purple) | Quaternary data series |
| Chart 5 | `#D4A574` (Tan) | `#EF4444` (Red) | Quinary data series |

### PPT Slide Recommendations

#### Slide Theme Setup
```
Background:        #FFFFFF (light) or #1A1A1A (dark)
Title Text:        #1A1A1A (light) or #FAFAFA (dark)
Body Text:         #737373 (light) or #A3A3A3 (dark)
Accent/Highlight:  #16A34A (green — use for headers, key points)
Secondary Accent:  #9333EA (purple — use for diagrams, secondary highlights)
Call-to-Action:    #F59E0B (amber — use sparingly for attention)
```

#### Suggested Slide Color Combinations

**Option 1: Professional Light**
- Background: `#FFFFFF`
- Headers: `#16A34A` (green)
- Body text: `#1A1A1A`
- Diagram accents: `#9333EA` (purple)
- Highlight boxes: `#F0FDF4` (very light green, use green at 5% opacity)

**Option 2: Bold Dark**
- Background: `#1A1A1A`
- Headers: `#16A34A` (green)
- Body text: `#FAFAFA`
- Diagram accents: `#9333EA` (purple)
- Highlight boxes: `#262626` (dark gray card)

**Option 3: Mixed (Recommended for Presentations)**
- Title/section slides: Dark background (`#1A1A1A`) with green headers
- Content slides: Light background (`#FFFFFF`) with dark text
- Architecture/diagram slides: Dark background for better contrast
- Creates visual rhythm and keeps audience engaged

### Logo/Brand Mark Colors
- Primary logo color: `#16A34A` (green)
- Logo on dark background: `#16A34A` or `#FFFFFF`
- Logo on light background: `#16A34A` or `#1A1A1A`

### Border Radius (Design Language)
- Small elements: `6px`
- Medium elements (buttons, inputs): `8px`
- Large elements (cards, dialogs): `10px`
- Extra large (modals): `14px`

---

*Report prepared for FYP 50% Progress Presentation*
*Project: Hiretics — AI-Powered Recruitment Platform*
