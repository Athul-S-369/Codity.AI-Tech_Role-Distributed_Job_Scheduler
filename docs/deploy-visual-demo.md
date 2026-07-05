# Visual demo mode (static, mock data)

**Author:** Athul S · RA2311047010117

Interactive **read-only** preview of the dashboard — same UI as the real app, with sample data. No backend, worker, or database required.

---

## Run locally

```bash
npm install
npm run dev:demo
```

Open http://localhost:5173 — auto-logged in as **Athul S** (OWNER).

- Mock login (any credentials work after sign-out)
- No WebSocket (frozen metrics)
- Create / retry / invite actions hidden (read-only)

---

## Build static site (GitHub Pages, Vercel, Cloudflare)

```bash
npm run build:demo
```

Output: `frontend/dist/`

### GitHub Pages

1. Push repo to GitHub
2. Settings → Pages → Source: **GitHub Actions** or deploy `frontend/dist` from `gh-pages` branch
3. If repo is not at domain root, build with base path:

```bash
cd frontend
npm run build:demo -- --base=/Codity.AI-Tech_Role-Distributed_Job_Scheduler/
```

4. Add to submission README:

```markdown
## Visual demo (static)
https://your-username.github.io/Codity.AI-Tech_Role-Distributed_Job_Scheduler/

Mock data, read-only UI preview.

## Full stack application
https://github.com/Athul-S-369/Codity.AI-Tech_Role-Distributed_Job_Scheduler
npm run start
```

---

## How it works

| Flag | `VITE_DEMO_MODE=true` in `.env.demo` |
|------|--------------------------------------|
| API | `frontend/src/lib/api.demo.ts` returns fixtures |
| Data | `frontend/src/demo/fixtures.ts` |
| WebSocket | Disabled in `useWebSocket.ts` |
| Mutations | Hidden via `canMutate = false` in demo mode |

---

## Full application

Clone and run the real distributed stack:

```bash
git clone https://github.com/Athul-S-369/Codity.AI-Tech_Role-Distributed_Job_Scheduler.git
cd Codity.AI-Tech_Role-Distributed_Job_Scheduler
npm install
npm run start
```

Login: `admin@test.local` / `password123`
