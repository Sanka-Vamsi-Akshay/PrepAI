# 🚀 PrepAI – AI-Powered Interview Preparation Platform

[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-20232A?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

PrepAI is a comprehensive, production-grade AI-powered interview preparation platform. It empowers software developers and technical candidates to excel in technical and behavioral interviews through resume intelligence, personalized AI mock interviews, company-specific interview simulators, full-fledged coding environments with real-time evaluation, and deep analytics.

---

## 📋 Table of Contents

- [Features](#-features)
  - [🤖 AI Mock Interviews](#-ai-mock-interviews)
  - [📄 Resume Intelligence](#-resume-intelligence)
  - [🎯 Personalized Interviews](#-personalized-interviews)
  - [🏢 Company Interview Modes](#-company-interview-modes)
  - [💻 Coding Interview Simulator](#-coding-interview-simulator)
  - [📊 Analytics](#-analytics)
  - [✨ Productivity](#-productivity)
- [Screenshots](#-screenshots)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Installation & Execution](#-installation--execution)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Security & Hardening](#-security--hardening)
- [Testing & Quality Verification](#-testing--quality-verification)
- [Production Deployment](#-production-deployment)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🤖 AI Mock Interviews
- **Curated Question Bank**: Comprehensive domain-specific questions covering Frontend, Backend, Fullstack, DevOps, Mobile, and System Design across Easy, Medium, and Hard difficulties.
- **Dynamic Interview Sessions**: Real-time structured interview execution with dynamic adaptive follow-up questions tailored to candidate answers.
- **AI Evaluation Engine**: Multi-dimensional grading covering technical accuracy, communication clarity, depth of knowledge, and problem-solving framework.
- **Asynchronous Background Processing**: Offloads AI evaluation generation to resilient BullMQ background workers backed by Redis queues.
- **Real-time Notifications**: In-app notifications alerting candidates when AI evaluations and detailed feedback reports are ready.

### 📄 Resume Intelligence
- **Multi-Format Uploads**: Secure upload and processing for PDF (`application/pdf`) and DOCX (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`) documents up to 5MB.
- **Automated Resume Parsing**: Extracts candidate experience, education, projects, skills, and certifications using Gemini AI with deterministic offline fallback parsing.
- **Comprehensive Resume Score**: Calculates an overall ATS readability and impact score (0–100%) based on skill density, structural formatting, and quantifiable achievements.
- **Skill Extraction & Verification**: Identifies technical skills, tools, frameworks, and domain competencies.
- **Targeted Gap Analysis**: Compares parsed candidate profiles against specific engineering roles (Frontend, Backend, Fullstack, DevOps) to surface missing skills and experience gaps.
- **Actionable Learning Roadmap**: Generates structured, step-by-step recommendation plans to bridge identified skill gaps.

### 🎯 Personalized Interviews
- **Resume-Based Contextual Questions**: Tailors technical interview questions specifically to the candidate's actual projects, listed technologies, and work experience.
- **Resume Alignment Score**: Evaluates how closely candidate answers align with their claimed background and experience level.
- **Consistency Score**: Measures verbal consistency and technical narrative continuity across multiple interview responses.
- **Confidence & Depth Score**: Assesses technical authority, precision, and confidence in explaining complex architectural choices.

### 🏢 Company Interview Modes
PrepAI features dedicated interview modes tailored to specific company hiring bars, focus areas, and evaluation criteria across **9 supported company profiles**:

| Company | Focus Areas | Default Difficulty |
| :--- | :--- | :--- |
| **Google** | Scalability, Algorithms, System Architecture | Hard |
| **Meta** | System Design, Product Architecture, Rapid Coding | Hard |
| **Amazon** | Leadership Principles, System Architecture, Code Efficiency | Medium-Hard |
| **Microsoft** | Pragmatic Engineering, Object-Oriented Design, Security | Medium-Hard |
| **Startup** | Fullstack Versatility, Practical Delivery, System Architecture | Medium |
| **Accenture** | Technical Fundamentals, Delivery Frameworks | Easy-Medium |
| **TCS** | Software Fundamentals, Core Computer Science | Easy |
| **Infosys** | Programming Principles, Problem Solving | Easy |
| **Wipro** | Software Lifecycle, Fundamental Concepts | Easy |

- **Tailored Question Generation**: Generates company-tailored technical questions focusing on specific engineering pillars (e.g., Google's distributed systems, Amazon's Leadership Principles).
- **Company-Specific Evaluator**: Evaluates responses against the specific company's hiring standards and core evaluation pillars.

### 💻 Coding Interview Simulator
- **Embedded Monaco Code Editor**: Feature-rich browser IDE with syntax highlighting, auto-completion, line numbers, and theme customizations powered by VS Code's editor engine.
- **Multi-Language Support**: Full coding environment supporting **Python**, **Java**, and **JavaScript**.
- **Run & Submit Modes**: Test solutions against public sample test cases before final submission.
- **Hidden Test Case Validation**: Validates code against hidden edge-case test suites during submission to evaluate correctness and boundary handling.
- **AI Code Review & Scoring**: Multi-metric evaluation scoring solutions on Correctness, Code Quality, Time/Space Complexity, and Optimization Opportunities.
- **Dual Execution Provider Architecture**: Pluggable code execution framework configurable via environment variables:
  - `PistonExecutionProvider`: Executes code inside isolated, secure, time-bounded sandbox environments via Piston API.
  - `MockExecutionProvider`: Deterministic local mock sandbox execution for rapid development and offline testing.
- **Offline Static Code Analyzer**: Fallback static code analysis engine verifying syntax structures, algorithmic efficiency, and test execution offline.

### 📊 Analytics
- **Interactive Overview Dashboard**: Tracks total mock interviews, coding sessions completed, cumulative practice hours, and average scores.
- **Performance Progress Tracking**: Visual performance trends mapped over daily and weekly practice intervals.
- **Coding Statistics**: Detailed breakdown of coding problems solved by difficulty (Easy, Medium, Hard), success rate, language usage distribution, and topic strength/weakness matrices.
- **Resume Intelligence Analytics**: Visual breakdown of candidate skill distribution, resume scores, and domain gap analysis.
- **Company Readiness Index**: Aggregated readiness scores indicating interview preparedness for specific companies (e.g., Google Readiness vs. Amazon Readiness).
- **Topic & Skill Performance Breakdown**: Granular skill mastery tracking across Dynamic Programming, System Design, Data Structures, SQL, and specific framework ecosystems.

### ✨ Productivity
- **Automatic Code Saving**: Periodic autosave every 5 seconds during active coding sessions to prevent data loss.
- **Draft Recovery & Protection**: Unsaved changes protection and automatic draft restoration prompt upon page refresh or network disconnection.
- **Question Bookmarking**: Save and categorize challenging interview questions for later review and focused study.
- **Notification Center**: Real-time status alerts for background processing, evaluation readiness, and application milestones.
- **Quick Start Mode**: Instantly launch domain-specific mock interview sessions with a single click.
- **Resume Selector**: Switch between uploaded resume profiles seamlessly when launching personalized interview sessions.

---

## 🖼️ Screenshots

### Dashboard
*(Add screenshot here)*

### Resume Analyzer
*(Add screenshot here)*

### Coding Workspace
*(Add screenshot here)*

### Analytics
*(Add screenshot here)*

### Interview Workspace
*(Add screenshot here)*

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 | Declarative component-based UI framework |
| | TypeScript | End-to-end static type safety |
| | Vite | Lightning-fast build tool and dev server |
| | Tailwind CSS v4 | CSS-first styling engine with customized theme tokens |
| | React Query | Asynchronous server-state management and caching |
| | Axios | HTTP client with security interceptors |
| | Monaco Editor | In-browser code editing engine |
| **Backend** | Node.js | Asynchronous server runtime engine |
| | Express | Enterprise HTTP API routing and middleware framework |
| | TypeScript | Strict server-side type safety |
| | Prisma ORM | Type-safe database client and migration engine |
| | PostgreSQL | Production relational database engine |
| | BullMQ | Distributed background job queue processor |
| | Redis | High-performance memory store for caching and queues |
| | Zod | Runtime environment and schema validation |
| | Winston / Morgan | Structured logging and HTTP request profiling |
| **AI Layer** | Google Gemini | Generative AI models (`@google/genai`) for questions & evaluations |
| | Deterministic Engine | Offline regex, heuristic, and static analysis fallback parsers |
| **Infrastructure** | Docker / Docker Compose | Multi-container application orchestration |
| | Railway | Cloud hosting for Backend, Worker, Postgres, and Redis |
| | Vercel | Production edge hosting for Frontend SPA |
| | GitHub Actions | Automated CI/CD build, lint, and verification pipelines |

---

## 🏗️ Architecture

```mermaid
graph TD
    Client["🌐 Browser (React SPA + Monaco Editor)"]
    API["⚡ Backend API (Express + TypeScript)"]
    DB[(🐘 PostgreSQL Database)]
    Cache[(🔴 Redis Cache & Queue Store)]
    Worker["⚙️ BullMQ Background Worker"]
    Gemini["🤖 Google Gemini API"]
    Piston["🔒 Piston Code Execution Provider"]

    Client -->|REST API + CSRF / Cookies| API
    API -->|ORM Queries| DB
    API -->|Jobs / Cache| Cache
    Worker -->|Process Jobs| Cache
    Worker -->|Update Results| DB
    API -->|AI Evaluation / Questions| Gemini
    Worker -->|AI Processing| Gemini
    API -->|Execute Code| Piston
```

### Component Breakdown
- **Browser (Client)**: React SPA providing an interactive user workspace, Monaco editor, dynamic charts, and client-side draft restoration.
- **Backend API**: Stateless Express server handling authentication, validation, security headers, rate limiting, and core domain services.
- **PostgreSQL Database**: Relational datastore managed via Prisma ORM storing users, questions, interview sessions, coding problems, submissions, evaluations, and execution logs.
- **Redis & BullMQ**: In-memory cache store managing session tokens, analytics caching, and asynchronous job queuing for long-running AI evaluation tasks.
- **BullMQ Worker**: Background consumer process dedicated to executing asynchronous AI processing jobs without blocking HTTP request execution.
- **Google Gemini API**: External LLM engine generating dynamic questions, scoring technical answers, evaluating coding solutions, and extracting resume insights.
- **Piston Provider**: Isolated code compilation and execution engine executing untrusted Python, Java, and JavaScript code securely inside time-bounded containers.

---

## 📁 Project Structure

```text
ai-interview-platform/
├── .github/
│   └── workflows/             # GitHub Actions CI/CD workflows
├── backend/                   # Node.js + Express + TypeScript API server
│   ├── prisma/                # Prisma ORM schema & database seed files
│   │   ├── schema.prisma      # Complete database models & relations
│   │   └── seed.ts            # Starter questions & 20 coding problems seed script
│   ├── src/
│   │   ├── config/            # Environment validation, logger, Redis, DB client
│   │   ├── controllers/       # Route controllers (Auth, Resume, Coding, Interviews)
│   │   ├── middlewares/       # Security, rate limiting, upload validation, auth guard
│   │   ├── queues/            # BullMQ job queues and workers
│   │   ├── routes/            # Versioned REST API endpoints (/api/v1)
│   │   ├── services/          # Core business logic layer
│   │   │   ├── ai/            # Gemini AI integration and fallback prompts
│   │   │   ├── coding/        # Coding problems, execution providers (Piston/Mock)
│   │   │   ├── resume.service.ts # Resume parsing and gap analysis logic
│   │   │   └── analytics.service.ts # Aggregate analytics & caching calculation
│   │   ├── types/             # Backend TypeScript interfaces & types
│   │   ├── utils/             # Operational error classes & response handlers
│   │   ├── app.ts             # Express application pipeline configuration
│   │   ├── index.ts           # HTTP server bootstrapping & graceful shutdown
│   │   └── worker.ts          # Standalone background worker process bootstrapper
│   ├── tests/                 # Integration test suites (Auth, Resume, Coding, Security)
│   ├── Dockerfile             # Multi-stage production container build for backend
│   └── package.json           # Backend dependencies & npm scripts
├── frontend/                  # React + TypeScript + Vite SPA client
│   ├── src/
│   │   ├── assets/            # Static assets and media resources
│   │   ├── components/        # Reusable component library (Workspace, Analytics, Modals)
│   │   ├── hooks/             # Custom React Query hooks (useInterviews, useResumes)
│   │   ├── layouts/           # Structural dashboard shells
│   │   ├── pages/             # Main view pages (Analytics, CodingWorkspace, ResumeAnalyzer)
│   │   ├── services/          # Axios HTTP service client
│   │   ├── store/             # Global client state management
│   │   └── types/             # Frontend TypeScript models
│   ├── Dockerfile             # Multi-stage build with Nginx web server
│   └── package.json           # Frontend dependencies & Vite setup
├── uploads/                   # Local storage directory for uploaded resumes (Git-ignored)
├── docker-compose.yml         # Development multi-container orchestration
└── docker-compose.prod.yml    # Production multi-container hardened stack
```

---

## 🚀 Installation & Execution

You can set up PrepAI either locally on your host machine or fully containerized using Docker Compose.

### Option A: Local Bare-Metal Execution (Recommended for Dev)

#### Prerequisites
- **Node.js**: v18.x or higher
- **PostgreSQL**: v14.x or higher running locally on port `5432`
- **Redis**: v6.x or higher running locally on port `6379`

#### 1. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Generate Prisma Client & Push Database Schema
npm run prisma:generate
npx prisma db push

# Seed starter questions and 20 coding problems
npx prisma db seed

# Start API dev server (runs on http://localhost:5000)
npm run dev
```

#### 2. Background Worker Setup (Separate Terminal)
```bash
cd backend
npm run worker:dev
```

#### 3. Frontend Setup (Separate Terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173 or http://localhost:8080)
npm run dev
```

---

### Option B: Docker Compose Execution

Spin up the entire application stack (Frontend, Backend API, Background Worker, PostgreSQL, and Redis) with a single command:

```bash
# Build and start all services in detached mode
docker compose up --build -d

# Apply Prisma migrations inside the backend container
docker compose exec backend npx prisma migrate deploy

# Seed the database inside the backend container
docker compose exec backend npx prisma db seed
```

Access Points:
- **Frontend SPA**: [http://localhost:8080](http://localhost:8080) (or `http://localhost:5173`)
- **Backend API Base**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Health Check**: [http://localhost:5000/api/v1/health/live](http://localhost:5000/api/v1/health/live)

---

## 🔐 Environment Variables

### Backend Configuration (`backend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://postgres:postgres@localhost:5432/ai_interview_db?schema=public` |
| `JWT_SECRET` | Secret key for signing JWT auth tokens (Production crashes if default string is used) | `super_secret_jwt_key_change_me_in_production` |
| `REDIS_HOST` | Hostname for Redis connection | `localhost` |
| `REDIS_PORT` | Port for Redis connection | `6379` |
| `REDIS_PASSWORD` | Optional password for Redis connection | `""` |
| `GEMINI_API_KEY` | Google Gemini API key (Triggers offline deterministic fallback if omitted) | `AIzaSy...` |
| `CODE_EXECUTION_PROVIDER` | Execution provider selector (`piston` or `mock`) | `mock` |
| `PISTON_URL` | Endpoint URL for Piston execution engine | `https://emkc.org/api/v2/piston` |
| `ANALYTICS_CACHE_TTL_SECONDS` | Cache expiration time in seconds for analytics endpoints | `300` |
| `CORS_ORIGIN` | Allowed origin for Cross-Origin Request Sharing | `http://localhost:8080` |
| `FRONTEND_URL` | Base URL of the frontend client for security redirects | `http://localhost:8080` |

### Frontend Configuration (`frontend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base API endpoint URL consumed by Axios service client | `http://localhost:5000/api/v1` |

---

## 📡 API Overview

The PrepAI REST API (`/api/v1`) provides organized modules handling core application domains:

- **🔐 Authentication (`/auth`)**: User registration, authentication login, profile retrieval, logout, and token session verification.
- **❓ Questions (`/questions`)**: Domain question filtering by difficulty, topic, category, and premium access state.
- **📥 Submissions (`/submissions`)**: Submission records, evaluation details, and answer history retrieval.
- **🎙️ Interviews (`/interviews`)**: Session creation, quick-start setup, response submission, evaluation generation, and company-mode sessions.
- **📊 Analytics (`/analytics`)**: User dashboards, progress tracking trends, coding analytics, topic mastery, and company readiness metrics.
- **🔖 Bookmarks (`/bookmarks`)**: Bookmark toggling and retrieval of saved practice questions.
- **🔔 Notifications (`/notifications`)**: User notification feed management and mark-as-read updates.
- **📄 Resumes (`/resumes`)**: PDF/DOCX file upload, resume listing, detailed parsing breakdown, gap analysis, and resume deletion.
- **💻 Coding (`/coding`)**: Coding problem bank retrieval, coding session initialization, code saving, run execution, submission, and coding evaluation retrieval.
- **🏥 Health (`/health`)**: Liveness (`/health/live`) and readiness (`/health/ready`) health check probes.

---

## 🛡️ Security & Hardening

PrepAI incorporates production security best practices:

- **JWT Authentication & Secure Cookies**: Authentication tokens delivered via strictly configured `httpOnly`, `sameSite='lax'`, and `secure` (in production) cookies.
- **CSRF Protection**: Multi-layered CSRF token validation protecting state-modifying requests.
- **Helmet Security Headers**: HTTP security headers locked down to prevent cross-site scripting (XSS), clickjacking, and MIME-sniffing attacks.
- **Specialized Rate Limiting**: Dedicated rate limiters configured to protect high-impact vectors:
  - Resume Uploads: Max 5 uploads / 15 mins.
  - Code Executions: Max 15 runs / 15 mins.
  - AI-Intensive Actions: Max 10 requests / 15 mins.
  - Evaluation Retries: Max 3 retries / 15 mins.
- **Resume Upload Hardening**: Multi-stage upload validation checking strict MIME types (`application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`), single-file payload bounds, and 5MB file size caps.
- **Production Secret Validation**: Backend boot sequence checks process environment configurations and immediately exits if default insecure JWT secrets or credentials are detected in production.
- **Trust Proxy Configuration**: Configured Express `trust proxy` settings ensuring accurate client IP resolution behind reverse proxies (Nginx, Railway, Vercel).
- **Offline AI Fallbacks**: Deterministic offline parsing and evaluation fallback handlers ensuring application availability even during external API outages.

---

## 🧪 Testing & Quality Verification

PrepAI contains comprehensive integration test suites located in `backend/tests/` verifying critical user workflows:

| Test Suite | Focus & Verification |
| :--- | :--- |
| `integration.test.js` | Full end-to-end user authentication lifecycle, question fetching, and answer submission flow. |
| `ux-upgrade.test.js` | Validates bookmarking functionality, notifications feed, and UI productivity flows. |
| `resume-phase1.test.js` | Verifies resume upload processing, parsing extraction, resume scoring, and domain gap analysis. |
| `personalized-interview.test.js` | Tests contextual resume-based interview generation, alignment scoring, and consistency metrics. |
| `company-interview.test.js` | Verifies company-specific question generation, company difficulty mapping, and company readiness evaluations across all 9 profiles. |
| `coding-interview.test.js` | Tests coding problem retrieval, session autosave, code execution sandbox runs, test case submission, and execution history persistence. |
| `production-hardening.test.js` | Verifies production security guardrails: JWT boot crash validation, secure SameSite cookie policies, MIME verification, file size caps, and rate limiter HTTP 429 enforcement. |

Run tests locally:
```bash
cd backend
node tests/production-hardening.test.js
node tests/coding-interview.test.js
```

---

## 🚢 Production Deployment

### Railway Deployment (Backend API, Worker, Postgres, Redis)

1. **Create Railway Project**: Provision PostgreSQL and Redis databases from the Railway template catalog.
2. **Deploy Backend Service**:
   - Root Directory: `/backend`
   - Build Command: `npm run build`
   - Start Command: `npx prisma migrate deploy && node dist/index.js`
3. **Deploy Worker Service**:
   - Root Directory: `/backend`
   - Build Command: `npm run build`
   - Start Command: `node dist/worker.js`
4. **Configure Environment Variables**: Attach `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `JWT_SECRET`, `GEMINI_API_KEY`, `NODE_ENV=production`.

### Vercel Deployment (Frontend SPA)

1. **Connect Repository**: Import project into Vercel and set Root Directory to `frontend`.
2. **Framework Preset**: Select `Vite`.
3. **Environment Variables**: Set `VITE_API_URL` pointing to your deployed Railway Backend API URL (e.g., `https://backend-production.up.railway.app/api/v1`).
4. **Deploy**: Trigger automated build and deployment.

---

## 🗺️ Future Roadmap

The following features are planned for upcoming releases:

- [ ] 🎤 **Voice-Based Mock Interviews**: Real-time speech-to-text and text-to-speech conversational interview practice.
- [ ] 📹 **Video Performance Analysis**: AI facial expressions, eye contact, and body language feedback during live answers.
- [ ] 📄 **Advanced ATS Resume Checker**: Deep formatting audit and keyword density optimization against specific job descriptions.
- [ ] ⚙️ **Custom Enterprise Company Profiles**: Ability for corporate recruiters to define custom hiring rubrics and interview questions.
- [ ] 🔁 **Full Interview Replay & Session Timeline**: Audio-visual interactive playback of past interview sessions with timed AI annotations.
- [ ] 🤖 **AI Personal Career Coach**: Conversational AI mentor offering daily practice schedules and tailored skill guidance.
- [ ] 📱 **Mobile Application**: Cross-platform React Native mobile app for practice on the go.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps to contribute:

1. **Fork the Repository**
2. **Create a Feature Branch**: `git checkout -b feature/AmazingFeature`
3. **Commit Your Changes**: `git commit -m 'Add some AmazingFeature'`
4. **Push to the Branch**: `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

Please ensure all lint checks (`npm run lint`) and builds (`npm run build`) pass cleanly before submitting pull requests.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
