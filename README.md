# Distributed Job Scheduler

**Athul S** · RA2311047010117

Intern assignment — building a background job system similar to what you'd see at a real company: queues, workers pulling jobs, retries when things fail, and a small dashboard to see what's happening.

---

## Where things stand

The full stack runs locally — API, worker, scheduler, Postgres, and the React dashboard. You can log in, switch between orgs/projects, watch jobs move through queues, and see workers heartbeat in. Seed data fills the dashboard so it doesn't look empty on first open.

There's also a **visual demo** (static build, mock data) for anyone who just wants to click around without installing anything. Same UI, no backend. Live version should be on GitHub Pages once the deploy workflow runs; the banner inside the demo points back here for the real app.

Render deployment was attempted via Blueprint — API builds, worker was tricky on free tier so some of that is still half-baked. CI passes on GitHub Actions with Postgres + Redis for integration tests.

---

## What I actually built

Started with auth and org/project structure — each project owns its own queues. Queues have priority, concurrency caps, retry policies, pause/resume, and basic stats.

Job side covers immediate, delayed, scheduled, recurring (cron), and batch jobs. Workers poll the API (not the DB directly), claim work with row locking so two workers don't grab the same job, run handlers concurrently, and send heartbeats. Failed jobs retry with fixed/linear/exponential backoff; after max attempts they land in a dead-letter queue with a short failure summary (regex patterns, OpenAI hook exists but mostly falls back to heuristics).

Backend is Express + Prisma on Postgres. Redis is optional — rate limiting and scheduler leader lock work when it's there, otherwise things degrade gracefully to in-memory. Scheduler runs as its own process by default. Frontend talks REST + WebSocket for live updates.

Other bits that took time: RBAC across the team page, job dependencies with cycle detection, idempotency keys, pagination on list endpoints, queue sharding fields, worker secret auth, event stream on the dashboard, and a fair amount of seed script work so charts and throughput graphs actually show something.

---

## Stack

Node 20, Express, Prisma/Postgres, React + Vite + Tailwind, Socket.IO, optional Redis. Monorepo — `backend`, `worker`, `frontend`, `shared`.

---

## Docs (if you want the details)

- [architecture.md](docs/architecture.md)
- [api-documentation.md](docs/api-documentation.md)
- [deploy-visual-demo.md](docs/deploy-visual-demo.md)
- [deploy-render.md](docs/deploy-render.md)
- [er-diagram.md](docs/er-diagram.md)
- [design-decisions.md](docs/design-decisions.md)

---

## Rough edges

JWT is simple — no refresh tokens, 7-day expiry. Failure summaries aren't magic, just pattern matching. Multi-instance scheduler locking only really holds when Redis is up. Some UI polish still pending but the core flow works end to end.
