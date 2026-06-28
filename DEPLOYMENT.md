# PrepAI Production Deployment & Operations Guide

This guide documents the procedures for deployment, rollbacks, backup/recovery strategies, and security headers configuration for the PrepAI interview preparation platform.

---

## 1. Production Configuration & Environment Setup

PrepAI supports two configuration modes loaded dynamically based on `NODE_ENV`:
*   **Development (`development`)**: Dynamic hot reloading, verbose logging, lenient CORS/Cookie policies, high rate limits.
*   **Production (`production`)**: Strict type-checking, minified builds, gzip compression, contextual Winston JSON logs with `X-Request-ID` tracing, secure HTTP-only cookies, and restricted rate limits (max 100 requests per 15 minutes per IP).

### Production Environment Variables (`.env`)

Configure the following variables in your production environment:

| Variable | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection URL with SSL enabled | `postgresql://user:pass@ep-host.region.neon.tech/prepai_db?sslmode=require` |
| `JWT_SECRET` | High-entropy secret for signing session tokens | `openssl rand -hex 32` (Generate a random 64-char string) |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `NODE_ENV` | Target application run mode | `production` |
| `PORT` | Backend server port | `5000` |
| `FRONTEND_URL` | Domain serving the frontend client | `https://prepai.yourdomain.com` |

---

## 2. Docker Production Orchestration

PrepAI containers are configured to run as **non-root users** to guarantee container runtime security and restrict host OS namespace access.

*   **Backend Container**: Switch to built-in system user `node`.
*   **Frontend Container**: Switch to built-in user `nginx` and exposes non-privileged port `8080`.

### Spin up Production Services

Deploy the environment using `docker-compose.prod.yml` at the project root:

```bash
# 1. Build and run production containers in daemon mode
docker-compose -f docker-compose.prod.yml up -d --build

# 2. Verify containers are running healthy and as non-root
docker-compose -f docker-compose.prod.yml ps
```

### Apply Database Migrations inside Production Container

```bash
docker-compose -f docker-compose.prod.yml exec -it backend npx prisma migrate deploy
```

---

## 3. Helmet Security Headers Reference

PrepAI mounts Express `helmet()` security middleware, applying headers to mitigate vectors like XSS, Clickjacking, and Session Hijacking:

| Header | Production Setting | Mitigated Risk | Details |
| :--- | :--- | :--- | :--- |
| `Content-Security-Policy` | Custom rules / Strict | Cross-Site Scripting (XSS), Data Injection | Controls resource origins (scripts, styles, connections) allowed to execute. |
| `Strict-Transport-Security` | `max-age=15552000; includeSubDomains` | Session Hijacking, Man-in-the-Middle | Enforces secure HTTPS connections for browsers. |
| `X-Frame-Options` | `SAMEORIGIN` | Clickjacking | Prevents pages from being framed inside external websites. |
| `X-Content-Type-Options` | `nosniff` | MIME Sniffing | Disables automatic file format sniffing, forcing browser adherence to declared headers. |
| `Referrer-Policy` | `no-referrer` | Information Leakage | Limits referrer metadata transmitted when navigating between domains. |
| `X-DNS-Prefetch-Control` | `off` | Privacy Leakage | Disables DNS prefetching for links on pages, preventing predictive lookup leaks. |
| `X-XSS-Protection` | `0` | Legacy XSS Bypass | Disables outdated browser-level XSS filters in favor of robust CSP policies. |
| `Cross-Origin-Opener-Policy` | `same-origin` | Cross-Origin attacks | Isolates window contexts, preventing cross-origin window handle hijacking. |
| `Cross-Origin-Embedder-Policy` | `require-corp` | Side-channel attacks (Spectre) | Blocks cross-origin files from loading without explicit CORP authorization. |
| `Cross-Origin-Resource-Policy` | `same-origin` | Unauthorized Resource Sharing | Prevents other domains from reading local static content and assets. |

---

## 4. Rollback Protocols

In the event of a critical service degradation or build failure during deployment, execute the following rollback steps.

```mermaid
graph TD
    A[Monitor Alert / Failure Detected] --> B{Determine Root Cause}
    B -->|Code Bug / UI Failure| C[Step 1: Rollback Container Tag]
    B -->|Migration Failure| D[Step 2: Revert DB Migrations]
    C --> E[Verify Rollback Health]
    D --> E
    E -->|Healthy| F[Post-Mortem & Fix Root Cause]
```

### Step 1: Revert Code Deployments

Deploy the previous stable image tag (or run a git checkout and rebuild):

```bash
# 1. Edit docker-compose.prod.yml target tag, or pull previous stable tag
docker pull your-registry/prepai-backend:v1.1.0
docker pull your-registry/prepai-frontend:v1.1.0

# 2. Restart services to apply rollback
docker-compose -f docker-compose.prod.yml up -d --no-deps backend frontend
```

### Step 2: Rollback Database Schema Migrations

If a migration introduced breaking changes to the database structure:

1.  **Identify the Target Migration ID**: Check the migrations applied by listing migration folders in `backend/prisma/migrations/`.
2.  **Run Prisma Migrate Resolve**: Tell Prisma to resolve the schema state.
3.  **Execute manual rollback SQL script (if backup restore is not preferred)**:
    Since Prisma does not support native down-migrations, run the rollback statements generated in the previous migration history folder:

```bash
# Run manual rollback via psql or PgAdmin connection
psql -d $DATABASE_URL -f backend/prisma/migrations/<migration_to_revert>/migration.sql
```

---

## 5. Database Backup and Recovery Recommendations

To guarantee zero-data-loss capabilities, set up scheduled automated logical backups and write scripts to perform periodic restoration audits.

### Logical Backups (pg_dump)

Run regular logical database dumps using `pg_dump` targeting the database container:

```bash
# Backup command
docker exec -t prepai_postgres_prod pg_dump -U postgres -d ai_interview_db -F c -b -v -f /backups/db_backup_$(date +%F_%T).dump
```

*   **Automation cron (production host system)**:
    Create a cron script executing daily at 02:00 AM, purging copies older than 30 days.

```bash
0 2 * * * find /var/backups/prepai/ -name "*.dump" -mtime +30 -exec rm {} \; && docker exec -t prepai_postgres_prod pg_dump -U postgres -d ai_interview_db -F c -b -v -f /var/backups/prepai/db_backup_$(date +\%F).dump
```

### Database Recovery Procedure

In case of database corruption or hardware failures:

1.  Provision a clean target PostgreSQL instance.
2.  Restore the latest schema and data dump:

```bash
# Restore schema and records using pg_restore
pg_restore -h <db_host> -U postgres -d <db_name> -v /var/backups/prepai/db_backup_2026-06-20.dump
```

3.  Restart backend applications to re-establish connection pool handles.

---

## 6. Health & Liveness Endpoints Validation

Once deployed, query endpoints regularly via monitoring systems (e.g. Prometheus, Datadog) to verify liveness and latency parameters.

### Liveness Probe (`GET /api/v1/health/live`)
Confirms the application process is running.
```bash
curl -f http://localhost:5000/api/v1/health/live
```
*Expected Output:*
```json
{
  "success": true,
  "message": "Server is live",
  "data": {
    "status": "LIVE",
    "uptime": 124.5
  }
}
```

### Readiness Probe (`GET /api/v1/health/ready`)
Confirms connection pool handles can communicate with database instances.
```bash
curl -f http://localhost:5000/api/v1/health/ready
```
*Expected Output:*
```json
{
  "success": true,
  "message": "Database is ready",
  "data": {
    "status": "READY"
  }
}
```

### Full System Probe (`GET /api/v1/health`)
Provides environmental metadata, database status, and database response times.
```bash
curl -f http://localhost:5000/api/v1/health
```
*Expected Output:*
```json
{
  "success": true,
  "message": "System is healthy",
  "data": {
    "status": "UP",
    "version": "1.0.0",
    "environment": "production",
    "uptime": 3600.42,
    "database": {
      "status": "CONNECTED",
      "responseTimeMs": 8
    }
  }
}
```
