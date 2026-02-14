# Test Report – Setup Guide

Get the app running locally: quick path first, then detailed steps and troubleshooting.

---

## Quick Start (5 minutes)

1. **Create the database** (PostgreSQL):
   ```sql
   CREATE DATABASE test_report;
   ```

2. **Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```
   Edit `.env`: set `DATABASE_URL` and `JWT_SECRET`. Then:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run seed
   npm run dev
   ```

3. **Frontend** (new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Browser:** Open `http://localhost:5173` (or the port Vite shows).  
   Login: `demo@testreport.com` / `password123`

---

## Prerequisites

- **Node.js** 18+ ([nodejs.org](https://nodejs.org/))
- **PostgreSQL** 14+ ([postgresql.org](https://www.postgresql.org/download/))

---

## Step 1: Database

Create the database (psql or pgAdmin):

```sql
CREATE DATABASE test_report;
```

Optional: create a dedicated user:

```sql
CREATE USER test_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE test_report TO test_user;
```

---

## Step 2: Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/test_report"
JWT_SECRET="your-secure-random-secret-key-change-this"
JWT_EXPIRES_IN="24h"
PORT=4014
```

Then:

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Backend runs at `http://localhost:4014`.

---

## Step 3: Frontend

New terminal:

```bash
cd frontend
npm install
cp .env.example .env   # optional; defaults point to backend :4014
npm run dev
```

Frontend runs at `http://localhost:5173` (or the port Vite prints).

---

## Step 4: Use the app

- Open the frontend URL in your browser.
- Register or log in with `demo@testreport.com` / `password123`.

---

## Project structure

```
test_report/
├── backend/          # Node.js + Express + Prisma
│   ├── src/
│   ├── prisma/
│   └── uploads/
├── frontend/         # React + Vite + Tailwind
│   └── src/
├── docs/             # Documentation
└── scripts/          # Deploy and DB scripts
```

---

## Common commands

**Backend:** `npm run dev` | `npx prisma generate` | `npx prisma migrate dev --name <name>` | `npm run seed` | `npx prisma studio`  
**Frontend:** `npm run dev` | `npm run build` | `npm run preview`

---

## Troubleshooting

- **Database connection:** Ensure PostgreSQL is running; check `DATABASE_URL`; verify DB exists (`psql -l`).
- **Port in use:** Change `PORT` in `backend/.env` and/or the frontend dev port; or stop the process using the port.
- **Prisma:** `npx prisma generate`; if needed, `npx prisma migrate reset` (deletes data).
- **CORS:** Ensure backend is on the URL set in frontend `VITE_API_URL`.

---

## Next steps

- [Development & API](DEVELOPMENT.md)
- [Deployment (VPS)](DEPLOYMENT.md)
- [Testing locally](TESTING.md)
