# Distributed Job Scheduler

**Author:** Athul S  
**Registration No.:** RA2311047010117

Intern assignment — a background job system with multiple workers, queues, retries, and a dashboard to watch what's going on.

Stack: Node/Express API, separate worker process, React frontend, Postgres + Prisma. Redis is optional (rate limits + scheduler leader lock when available).

## How it works (roughly)

```
Dashboard  <--REST/WS-->  API (Express)
                              |
                    Postgres  +  Redis (optional)
                              ^
                         Worker(s) poll & claim jobs
```

Workers don't touch the DB directly. They hit the API to claim jobs, report success/failure, send heartbeats. Job claiming uses `FOR UPDATE SKIP LOCKED` so two workers can't grab the same row.

## Setup

Needs Node 20+.

**Option A — embedded Postgres (no Docker):**

```bash
npm install
cp .env.example .env
cp .env backend/.env
npm run dev:db          # terminal 1
npm run db:push -w backend && npm run db:seed -w backend
npm run dev             # API :3001, worker, frontend :5173
```

**Option B — Docker Postgres/Redis:**

```bash
npm install
docker compose up -d
cp .env.example .env
npm run db:push -w backend && npm run db:seed -w backend
npm run dev
```

- API: http://localhost:3001
- Dashboard: http://localhost:5173
- Seed login: `admin@test.local` / `password123`

Run things separately if you want:

```bash
npm run dev -w backend
npm run dev:scheduler -w backend
npm run dev -w worker
npm run dev -w frontend
```

Tests: `npm test` (unit + integration; CI runs with Postgres + Redis via GitHub Actions)

## What's in the repo

```
backend/     API, websocket, RBAC
             scheduler process (separate entry: dev:scheduler)
worker/      polls API, runs job handlers (secret auth)
frontend/    full dashboard — org/project picker, all job types
shared/      types + retry delay math
docs/        architecture notes, schema, API list
```

## Features

**Core:** JWT auth, orgs/projects/queues, all 5 job types (immediate, delayed, scheduled, recurring, batch), worker claiming, lifecycle, retries (fixed/linear/exponential), DLQ with failure analysis, metrics, WebSocket live updates.

**Bonus:** RBAC (OWNER/ADMIN/MEMBER/VIEWER), org/project picker in UI, worker secret auth + registration key, queue sharding, distributed scheduler lock (Redis), job dependencies with cycle detection, idempotency keys, event stream, pagination, integration tests, `scheduled_jobs` table, AI failure summaries (OpenAI with heuristic fallback), GitHub Actions CI.

## Docs

- [architecture.md](docs/architecture.md) — how the pieces fit together
- [deploy-render.md](docs/deploy-render.md) — one-click Render Blueprint deploy
- [er-diagram.md](docs/er-diagram.md) — tables, indexes
- [api-documentation.md](docs/api-documentation.md) — endpoint reference
- [design-decisions.md](docs/design-decisions.md) — tradeoffs and rationale

## Job types supported

Immediate, delayed, scheduled (specific time), recurring (cron), batch (parent + child jobs). Retry policies: fixed / linear / exponential backoff. Failed jobs go to DLQ after max attempts.

## Known limitations

- JWT has no refresh/revocation (7-day expiry)
- Redis gracefully degrades if not connected (no rate limit / no multi-instance scheduler lock)
- Failure summaries are pattern-based heuristics, not ML
