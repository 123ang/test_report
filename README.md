# Test Report

A multi-user web application for testers to log, manage, and track manual test cases and test results across projects and versions.

## Features

- Manual test case creation and execution (Projects → Versions → Test cases)
- Multi-language support (English & Japanese)
- Dashboard with analytics
- Screenshot uploads for test results
- CSV import/export
- Mobile-responsive design
- JWT authentication
- Project collaboration (invite members by email)

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL + Prisma ORM

## Quick Start

1. Create DB: `CREATE DATABASE test_report;`
2. **Backend:** `cd backend && npm install && cp .env.example .env` → set `DATABASE_URL` and `JWT_SECRET` in `.env` → `npx prisma generate && npx prisma migrate dev && npm run seed && npm run dev`
3. **Frontend:** `cd frontend && npm install && npm run dev`
4. Open the URL Vite prints (e.g. http://localhost:5173). Login: `demo@testreport.com` / `password123`

## Documentation

All docs are in the **`docs/`** folder:

| Doc | Description |
|-----|-------------|
| [docs/SETUP.md](docs/SETUP.md) | Full setup guide (quick start + troubleshooting) |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | API, schema, and developer reference |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | VPS deploy and production DB migration |
| [docs/MIGRATION.md](docs/MIGRATION.md) | Schema migration (Project → Version → Test cases) |
| [docs/TESTING.md](docs/TESTING.md) | Step-by-step local testing |
| [docs/COLLABORATION.md](docs/COLLABORATION.md) | Project members and permissions |
| [docs/CSV.md](docs/CSV.md) | CSV import/export format and fixes |
| [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) | Feature overview and structure |
| [docs/BACKEND_CHANGES.md](docs/BACKEND_CHANGES.md) | Backend changes (for other developers) |

## Scripts

Run from **project root**:

| Script | Purpose |
|--------|--------|
| `./scripts/deploy.sh` | VPS: pull, install, migrate, build frontend, restart PM2 |
| `./scripts/fix-500-production.sh` | VPS: apply migrations and restart backend (fix 500s) |
| `./scripts/migrate-vps.sh` | VPS: run Prisma migrations and restart backend |
| `./scripts/reset-db-and-seed.sh` | Wipe DB, re-run migrations, seed (use with care) |

## License

MIT
