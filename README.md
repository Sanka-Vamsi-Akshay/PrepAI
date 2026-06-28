# AI Interview Preparation Platform - Foundation

An enterprise-grade, highly scalable foundation for an AI-powered Mock Interview Simulator. Built with React, Vite, Tailwind CSS v4, Express, TypeScript, Prisma, and PostgreSQL, all orchestrated using Docker Compose.

---

## 📂 Project Architecture & Folder Structure

```text
ai-interview-platform/
├── docker-compose.yml         # Container orchestration (Dev/Prod stacks)
├── README.md                  # Main onboarding guide & documentation
│
├── backend/                   # Node.js + Express + TypeScript + Prisma
│   ├── prisma/                # Prisma ORM setup
│   │   └── schema.prisma      # DB models: User, Question, Interview, Submission
│   ├── src/
│   │   ├── config/            # Environment (Zod), logger (Winston), DB client
│   │   ├── controllers/       # Route request handlers
│   │   ├── middlewares/       # Security (Helmet), Rate Limiter, Error Handler
│   │   ├── routes/            # Versioned API routes (v1 health, auth)
│   │   ├── utils/             # Operational AppError classes
│   │   ├── app.ts             # Express App setup & middleware pipeline
│   │   └── index.ts           # Express bootstrapper & graceful shutdown handler
│   ├── tsconfig.json          # TS config with path alias '@backend/*'
│   ├── eslint.config.js       # ESLint v9 Flat Config
│   ├── .prettierrc            # Formatting configuration
│   └── Dockerfile             # Multi-stage production container definition
│
└── frontend/                  # React + TypeScript + Vite + Tailwind CSS v4
    ├── public/                # Static assets (favicons, etc.)
    ├── src/
    │   ├── assets/            # Global images, icons
    │   ├── components/        # Reusable UI component library (e.g. AuthGuard)
    │   ├── layouts/           # Structural page shells (DashboardLayout)
    │   ├── pages/             # View entrypoints (Dashboard, Questions, Login)
    │   ├── services/          # Central API service using Axios interceptor
    │   ├── hooks/             # Custom React Hooks
    │   ├── store/             # Global/Client State slices
    │   ├── routes/            # Client routing registry
    │   ├── types/             # Frontend Typescript typings
    │   ├── utils/             # Helper formatters and computations
    │   ├── App.tsx            # Main App layout & React Query provider
    │   ├── main.tsx           # Entry mounting file
    │   └── index.css          # Tailwind CSS v4 CSS-first style declaration
    ├── tsconfig.json          # TS config with path alias '@/*'
    ├── vite.config.ts         # Vite bundler, path resolving, Tailwind v4
    ├── .eslintrc.json         # ESLint v8 configuration
    ├── .prettierrc            # Formatting rules
    └── Dockerfile             # Multi-stage SPA container with Nginx server
```

---

## 🛠️ Getting Started: Installation & Execution

You can run this project either **locally on your machine** or fully **isolated inside Docker**.

### Method A: Run via Docker Compose (Recommended)
This approach spins up the React client, Express API, and a PostgreSQL database instantly without configuring node modules or DB instances locally.

1. **Build and start the stack:**
   ```bash
   docker compose up --build
   ```
2. **Apply database migrations:**
   Inside the running backend container, apply migrations:
   ```bash
   docker compose exec backend npx prisma migrate dev --name init
   ```
3. **Access Services:**
   - **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
   - **Backend API Base:** [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
   - **API Health Check:** [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

### Method B: Run Locally (Bare-metal)

Ensure you have Node.js 18+ and a local PostgreSQL instance running.

#### 1. Database Setup
Create a PostgreSQL database named `ai_interview_db`.

#### 2. Backend Initialization
1. Navigate into the backend:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables. Copy `.env.example` to `.env` and fill in details:
   ```bash
   cp .env.example .env
   ```
4. Push Prisma schema & migrate:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start backend development server:
   ```bash
   npm run dev
   ```

#### 3. Frontend Initialization
1. Navigate into the frontend:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Start frontend development server:
   ```bash
   npm run dev
   ```

---

## 🛡️ Enterprise-Grade Design Implementations

- **Strict Environment Validation:** Uses `zod` in `backend/src/config/env.ts` to block application boot if environment keys are missing or malformed.
- **Global Error Handling:** Implements `AppError` and custom HTTP error classes (`BadRequestError`, `UnauthorizedError`) with a single central Express error-interception middleware that suppresses system stack traces in production.
- **API Security Protocols:** Implements `helmet` to lock down HTTP headers, `cors` configured for local routing, and `express-rate-limit` (general + auth-specific limits) to mitigate brute-force/DoS vector.
- **Advanced Logging Pipeline:** Winston handles structured file/console logs, while Morgan channels all Express traffic through Winston's stream pipeline.
- **Tailwind CSS v4:** Uses CSS-first declarations in Vite without `tailwind.config.js` bloat. Theme tokens are configured inside `@theme` tags in `src/index.css`.
- **Clean API Requests:** Axios configured with request/response interceptors to attach bearer tokens automatically and format errors uniformly.

---

## 🔍 Common Setup Issues & Technical Fixes

### 1. Database connection fails (`P2002`, `ECONNREFUSED`)
* **Docker Compose:** The backend waits for PostgreSQL to pass its health check (`pg_isready`) before booting. If it fails, ensure docker ports aren't blocked by a local Postgres service running on `5432`. Stop your local service and rerun:
  ```bash
  docker compose down -v && docker compose up --build
  ```
* **Local Run:** Ensure `DATABASE_URL` in `backend/.env` points to `localhost` and not `db` (since `db` resolves only inside the Docker virtual network).

### 2. Path Aliases not resolving in Editor or Dev environment
* **Backend:** If TypeScript path aliases (`@backend/*`) throw compilation errors, ensure `ts-node-dev` is running with `-r tsconfig-paths/register` and build compiles using `tsc && tsc-alias`.
* **Frontend:** If Vite fails to resolve `@/*`, confirm `vite.config.ts` includes the `resolve.alias` mapping to `path.resolve(__dirname, './src')`.

### 3. Hot Module Replacement (HMR) not refreshing in WSL or Docker
* In WSL/Docker environments, Vite's file system watcher may miss file changes. This is fixed in `vite.config.ts` by enabling `usePolling: true` inside `server.watch` settings.

### 4. JWT Verification Fails on API requests
* Make sure headers are formatted as `Authorization: Bearer <TOKEN>`. The Axios client does this automatically under `frontend/src/services/api.ts`.
