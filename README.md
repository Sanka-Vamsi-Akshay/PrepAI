# 🚀 PrepAI – AI-Powered Interview Preparation Platform

[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-20232A?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

PrepAI is an enterprise-grade, full-stack AI platform designed to simulate end-to-end technical hiring processes. It integrates resume intelligence, personalized AI mock interviews, company-specific evaluation rubrics, an embedded multi-language coding workspace, and deep analytics to prepare candidates for modern software engineering roles.

---

## 🌐 Live Demo

- **Frontend Application**: 📷 TODO: Add Frontend Production URL (Add after deployment)
- **Backend API Base**: 📷 TODO: Add Backend Production API URL (Add after deployment)

---

## 💡 Why PrepAI?

Traditional technical interview preparation is often fragmented—candidates practice coding on isolated platforms, review resumes independently, and lack realistic, real-time feedback on behavioral and architectural interview questions. PrepAI bridges this gap by offering a single unified platform. By combining automated resume parsing, adaptive AI mock interviews, real-time code execution with hidden test validation, and company-tailored hiring standards, PrepAI delivers actionable multi-dimensional feedback to help engineers systematically improve their interview performance.

---

## ⚡ Project Highlights

- **🏢 9 Company Interview Profiles**: Custom hiring rubrics and focus areas for Google, Meta, Amazon, Microsoft, Startups, Accenture, TCS, Infosys, and Wipro.
- **💻 Full Coding Simulator**: Monaco editor supporting Python, Java, and JavaScript with public and hidden test case evaluation.
- **📄 Resume Intelligence Engine**: PDF/DOCX parsing, 0–100% ATS readability scoring, skill extraction, and target domain gap analysis.
- **🤖 Adaptive AI Evaluation**: Multi-metric scoring for technical correctness, communication clarity, and problem-solving depth powered by Google Gemini.
- **📊 Granular Analytics**: Real-time dashboards tracking topic performance, language distribution, coding difficulty breakdown, and company readiness indices.
- **🛡️ Hardened Production Security**: Strict MIME validation, specialized rate limiters, JWT environment guards, and secure SameSite cookies.
- **🔄 Deterministic Offline Fallbacks**: High-availability regex and heuristic engines ensuring functionality during external AI API outages.
- **🧪 Comprehensive Integration Test Suites**: 7 comprehensive test suites validating security, authentication, resume parsing, coding, and company modes.
- **📦 Cloud & Container Ready**: Docker Compose orchestration with optimized deployment workflows for Railway and Vercel.

---

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Installation & Execution](#-installation--execution)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Security & Hardening](#-security--hardening)
- [Testing](#-testing)
- [Production Deployment](#-production-deployment)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🤖 AI Mock Interviews
- **Curated Question Bank**: Domain-specific questions across Frontend, Backend, Fullstack, DevOps, Mobile, and System Design.
- **Adaptive Session Execution**: Dynamic follow-up questions tailored to candidate responses.
- **Multi-Metric AI Grading**: Evaluates technical accuracy, communication clarity, and structural depth.
- **Asynchronous Processing**: Background job processing via BullMQ workers and Redis queues for heavy evaluation tasks.
- **Notification Alerts**: In-app alerts when evaluations and feedback reports complete.

### 📄 Resume Intelligence
- **Multi-Format Parsing**: Secure uploading for PDF and DOCX files up to 5MB.
- **ATS Impact Scoring**: Calculates resume impact scores (0–100%) based on skill density and quantifiable achievements.
- **Skill & Gap Analysis**: Extracts core competencies and benchmarks profiles against target engineering roles to highlight skill gaps and generate learning roadmaps.

### 🎯 Personalized Interviews
- **Contextual Questioning**: Generates technical questions directly rooted in candidate resume experience and projects.
- **Alignment & Consistency**: Scores answer consistency, technical authority, and background narrative alignment.

### 🏢 Company Interview Modes
Tailored evaluation criteria and targeted focus areas across 9 company profiles:

| Company | Key Focus Areas | Default Difficulty |
| :--- | :--- | :--- |
| **Google** | Scalability, Distributed Systems, Advanced Algorithms | Hard |
| **Meta** | System Architecture, Rapid Product Coding | Hard |
| **Amazon** | Leadership Principles, System Architecture, Code Efficiency | Medium-Hard |
| **Microsoft** | Pragmatic Engineering, Object-Oriented Design, Security | Medium-Hard |
| **Startup** | Fullstack Versatility, Practical Delivery, Architecture | Medium |
| **Accenture** | Technical Fundamentals, Delivery Frameworks | Easy-Medium |
| **TCS** | Software Fundamentals, Core Computer Science | Easy |
| **Infosys** | Programming Principles, Logical Problem Solving | Easy |
| **Wipro** | Software Lifecycle, Fundamental Concepts | Easy |

### 💻 Coding Interview Simulator
- **Monaco IDE Integration**: In-browser editing engine supporting **Python**, **Java**, and **JavaScript**.
- **Run & Submit Modes**: Execution testing against sample inputs and hidden validation test cases.
- **Pluggable Execution Architecture**: Configurable between `PistonExecutionProvider` (sandboxed container compilation) and `MockExecutionProvider` (local deterministic development execution).
- **Static Analyzer Fallback**: Offline static analysis for syntax verification and test evaluation.

### 📊 Analytics & Productivity
- **Interactive Overview**: Practice hours tracking, coding difficulty distribution, and topic strength matrices.
- **Company Readiness Index**: Aggregated readiness metrics for targeted tech companies.
- **Productivity Workflows**: 5-second periodic code autosave, draft protection on page refresh, question bookmarking, and quick-start interview execution.

---

## 📷 Screenshots

### Dashboard
📷 TODO: Add Dashboard Screenshot

### Resume Analyzer
📷 TODO: Add Resume Analyzer Screenshot

### Coding Workspace
📷 TODO: Add Coding Workspace Screenshot

### Analytics
📷 TODO: Add Analytics Screenshot

### Interview Workspace
📷 TODO: Add Interview Workspace Screenshot

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 / TypeScript | Type-safe declarative component UI library |
| | Vite / Tailwind CSS v4 | Build tooling and CSS-first design engine |
| | React Query / Axios | Server state caching and secure HTTP client |
| | Monaco Editor | In-browser VS Code editing environment |
| **Backend** | Node.js / Express | Server runtime and modular REST API framework |
| | TypeScript / Zod | End-to-end type safety and environment validation |
| | Prisma ORM / PostgreSQL | Relational data management and migration engine |
| | BullMQ / Redis | Distributed asynchronous job processing and caching |
| **AI & Execution** | Google Gemini API | Generative AI models (`@google/genai`) for evaluations |
| | Piston Engine / Static Analyzer | Sandboxed multi-language compilation and offline fallback |
| **Infrastructure** | Docker Compose | Multi-container application orchestration |
| | Railway / Vercel | Cloud platform hosting for API/Worker/DB and SPA |
| | GitHub Actions | Automated CI/CD verification pipelines |

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

---

## 📁 Project Structure

```text
ai-interview-platform/
├── .github/workflows/         # GitHub Actions CI pipelines
├── backend/                   # Express + TypeScript API Server
│   ├── prisma/                # Schema definitions & database seeds
│   │   ├── schema.prisma      # Models: User, Question, Session, CodingProblem, Evaluation
│   │   └── seed.ts            # Starter question bank & 20 coding problems
│   ├── src/
│   │   ├── config/            # Environment validation, logger, Redis, DB client
│   │   ├── controllers/       # Route controllers (Auth, Resume, Coding, Interviews)
│   │   ├── middlewares/       # Security, rate limiters, upload validation, auth guard
│   │   ├── queues/            # BullMQ job queues and workers
│   │   ├── routes/            # Versioned REST API endpoints (/api/v1)
│   │   ├── services/          # Business logic (AI, Coding, Resume, Analytics)
│   │   ├── utils/             # Operational error handling classes
│   │   ├── app.ts             # Express application pipeline setup
│   │   ├── index.ts           # Server entrypoint & graceful shutdown
│   │   └── worker.ts          # Background job process runner
│   ├── tests/                 # 7 verified integration test suites
│   └── Dockerfile             # Production container definition
├── frontend/                  # React + Vite SPA Client
│   ├── src/
│   │   ├── components/        # UI components (Workspace, Analytics, Modals)
│   │   ├── hooks/             # React Query hooks (useInterviews, useResumes)
│   │   ├── pages/             # Page views (Analytics, CodingWorkspace, ResumeAnalyzer)
│   │   └── services/          # Axios HTTP client
│   └── Dockerfile             # Multi-stage build with Nginx
├── uploads/                   # Local storage for uploaded resumes
├── docker-compose.yml         # Development environment stack
└── docker-compose.prod.yml    # Production hardened stack
```

---

## 🚀 Installation & Execution

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

# Generate Prisma Client & Run Database Migrations
npm run prisma:generate
npx prisma migrate dev

# Seed database with starter questions & 20 coding problems
npx prisma db seed

# Start API dev server (http://localhost:5000)
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

# Start Vite dev server (http://localhost:5173 or http://localhost:8080)
npm run dev
```

---

### Option B: Docker Compose Execution

Spin up all services (Frontend, Backend API, Worker, PostgreSQL, Redis) simultaneously:

```bash
# Build and launch containers
docker compose up --build -d

# Apply database migrations inside container
docker compose exec backend npx prisma migrate dev

# Seed database inside container
docker compose exec backend npx prisma db seed
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/ai_interview_db?schema=public` |
| `JWT_SECRET` | Auth token signing key (Production crashes if default key is used) | `super_secret_jwt_key_change_me_in_production` |
| `REDIS_HOST` | Hostname for Redis instance | `localhost` |
| `REDIS_PORT` | Connection port for Redis | `6379` |
| `GEMINI_API_KEY` | Google Gemini API key (Triggers offline fallback if omitted) | `AIzaSy...` |
| `CODE_EXECUTION_PROVIDER` | Execution provider (`piston` or `mock`) | `mock` |
| `PISTON_URL` | Endpoint for Piston execution engine | `https://emkc.org/api/v2/piston` |
| `ANALYTICS_CACHE_TTL_SECONDS` | Analytics caching expiration time in seconds | `300` |
| `CORS_ORIGIN` | Allowed origin for client requests | `http://localhost:8080` |
| `FRONTEND_URL` | Client application URL | `http://localhost:8080` |

### Frontend (`frontend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base API endpoint for client network calls | `http://localhost:5000/api/v1` |

---

## 📡 API Overview

The REST API (`/api/v1`) is structured into distinct domain modules:

- **🔐 Authentication (`/auth`)**: Registration, login, session validation, logout, and profile management.
- **❓ Questions (`/questions`)**: Question catalog filtering by domain, difficulty, and company profile.
- **📥 Submissions (`/submissions`)**: Candidate submission history, grading records, and feedback retrieval.
- **🎙️ Interviews (`/interviews`)**: Session initialization, adaptive response processing, and evaluation generation.
- **📊 Analytics (`/analytics`)**: Dashboard metrics, skill gap tracking, coding stats, and company readiness indices.
- **🔖 Bookmarks (`/bookmarks`)**: Managing and retrieving saved practice questions.
- **🔔 Notifications (`/notifications`)**: Real-time user alert feed and status updates.
- **📄 Resumes (`/resumes`)**: PDF/DOCX parsing, ATS scoring, and engineering gap analysis.
- **💻 Coding (`/coding`)**: Problem catalog retrieval, session execution runs, test submission, and code reviews.
- **🏥 Health (`/health`)**: Infrastructure liveness (`/health/live`) and readiness (`/health/ready`) probes.

---

## 🛡️ Security & Hardening

- **Secure Authentication**: Delivered via `httpOnly`, `sameSite='lax'`, and production `secure` cookies.
- **CSRF & Header Protection**: Multi-layer CSRF token verification and Helmet HTTP header security enforcement.
- **Specialized Rate Limiters**: Enforces strict throttling across high-impact endpoints (Resume uploads: 5/15m, Code runs: 15/15m, AI requests: 10/15m).
- **Resume File Hardening**: Strict MIME validation (`application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`) and 5MB payload limits.
- **Production Secret Validation**: Backend startup validation immediately halts execution if default JWT secrets are detected in production.
- **Offline AI Fallbacks**: Deterministic regex and heuristic parsing engines maintain service availability during external API outages.

---

## 🧪 Testing

PrepAI includes 7 integration test suites located in `backend/tests/` to verify application integrity:

- `integration.test.js`: Full authentication, question retrieval, and submission flows.
- `ux-upgrade.test.js`: Bookmarks, notifications, and UI interaction flows.
- `resume-phase1.test.js`: Resume uploads, ATS scoring, and gap analysis.
- `personalized-interview.test.js`: Resume-contextual questions and consistency scoring.
- `company-interview.test.js`: Company question generation and company readiness evaluations.
- `coding-interview.test.js`: Monaco editor execution, test case validation, and session history.
- `production-hardening.test.js`: JWT production guards, SameSite cookies, MIME verification, and rate limits.

Run tests:
```bash
cd backend
node tests/production-hardening.test.js
node tests/coding-interview.test.js
```

---

## 🚢 Production Deployment

### Railway Deployment (Backend API, Worker, Postgres, Redis)

1. **Provision Databases**: Create PostgreSQL and Redis instances in Railway.
2. **Deploy Backend Service**:
   - Root Directory: `/backend`
   - Build Command: `npm run build`
   - Start Command: `npx prisma migrate deploy && node dist/index.js`
3. **Deploy Worker Service**:
   - Root Directory: `/backend`
   - Build Command: `npm run build`
   - Start Command: `node dist/worker.js`
4. **Environment Variables**: Configure `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `JWT_SECRET`, `GEMINI_API_KEY`, `NODE_ENV=production`.

### Vercel Deployment (Frontend SPA)

1. **Import Repository**: Set Root Directory to `frontend` with the `Vite` framework preset.
2. **Environment Variables**: Set `VITE_API_URL` pointing to your deployed Railway Backend API.
3. **Deploy**: Build and trigger automated edge deployment.

---

## 🗺️ Future Roadmap

- [ ] 🎤 **Voice-Based Mock Interviews**: Real-time speech-to-text conversational interview practice.
- [ ] 📹 **Video Performance Analysis**: AI feedback on body language and eye contact during responses.
- [ ] 📄 **Advanced ATS Resume Matcher**: Deep job description keyword matching.
- [ ] ⚙️ **Custom Enterprise Rubrics**: Allow recruiters to configure proprietary evaluation pillars.
- [ ] 🔁 **Interactive Interview Playback**: Timed audio-visual session replay with AI annotations.
- [ ] 📱 **Mobile Application**: Cross-platform React Native client.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

Ensure `npm run lint` and `npm run build` pass cleanly before submitting PRs.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
