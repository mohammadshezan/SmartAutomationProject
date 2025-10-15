# QSTEEL Logistics Platform (Hackathon Edition)

A demo-grade, production-lean full-stack platform for AI-driven logistics: planning rakes, forecasting demand, live tracking, and transparent dispatch logging.

## Stack
- Web: Next.js (React), Tailwind CSS, shadcn/ui, Recharts, Leaflet, PWA
- API: Node.js + Express, Prisma + PostgreSQL, Redis, Socket.IO
- AI: FastAPI (Python) with forecasting/optimization stubs
- Infra: Docker Compose (Postgres, Redis, AI service)

## Quick start
1. Install Node.js 18+, Python 3.10+
2. `npm install`
3. Start infra: `docker compose up -d`
4. Start web: `npm run -w apps/web dev`
5. Start API: `npm run -w apps/api dev`

Demo users (seeded):
- admin@sail.test / OTP 123456 (Admin)
- manager@sail.test / OTP 123456 (Logistics Manager)
- yard@sail.test / OTP 123456 (Yard Supervisor)

## Notes
- This repo is a scaffold optimized for demos with progressive enhancement paths to production.

### Single .env (optional)
You can keep all environment variables in a single root file `./.env`.

- Copy `.env.example` at repo root to `.env` and fill values.
- The API (`apps/api`) and Web (`apps/web`) are configured to read the root `.env` automatically. Local overrides still work with `apps/api/.env.local` and `apps/web/.env.local`.

## Database migrations (Prisma)

- Use descriptive migration names, e.g. `routes_schema`, `add_plant_relation_to_route`.
- Local development:
	- Ensure Postgres is running (see docker-compose) and create `apps/api/.env` with `DATABASE_URL=postgresql://qsteel:qsteel@localhost:5432/qsteel?schema=public`.
	- From `apps/api`:
		- `prisma generate`
		- `prisma migrate dev --name <migration_name>`
		- `npm run prisma:seed`
- Multiple environments:
	- Keep `.env` per environment (or inject `DATABASE_URL` from secrets in CI/CD).
	- Prefer `prisma migrate deploy` on deploy to apply pending migrations.
	- Optionally use `prisma migrate diff` to review SQL when promoting between envs.

## Repository recovery (2025-10-11)
An accidental revert landed on origin/main. We restored the repository by force-pushing the last known-good local commit and created an annotated tag for traceability.

- Tag: `restore-2025-10-11`
- Message: "Restore main after accidental revert; force-pushed local good state (f0e9584) over origin/main"

Team sync steps (read-only, safe):
- Pull new history and tags, then fast-forward or reset your local main if needed.

PowerShell (Windows):
1. `git fetch --all --tags`
2. If you have no local changes: `git switch main; git reset --hard origin/main`
3. If you have local work, rebase instead: `git switch main; git rebase origin/main`

Bash (macOS/Linux):
1. `git fetch --all --tags`
2. No local changes: `git switch main && git reset --hard origin/main`
3. With local work: `git switch main && git rebase origin/main`

If you need to inspect the restore point:
- `git show restore-2025-10-11`
- `git log --decorate --oneline --graph --all`

### Restore point at 5:00 PM (2025-10-11)
Per request, we created a precise restore point matching the repository state at or before 5:00 PM local time on 2025-10-11.

- Tag: `restore-2025-10-11-1700`
- Branch: `restore/2025-10-11-1700`
- Resolved commit: `9c60e9d` (last commit at or before 17:00 local time)

How to check it out (read-only tag):
- Windows PowerShell: `git fetch --all --tags; git switch --detach restore-2025-10-11-1700`
- Bash: `git fetch --all --tags && git switch --detach restore-2025-10-11-1700`

Or work on the branch:
- `git fetch --all; git switch restore/2025-10-11-1700`

To compare with current main:
- `git --no-pager log --oneline --decorate --graph restore-2025-10-11-1700..main`
- `git diff --stat restore-2025-10-11-1700..main`

