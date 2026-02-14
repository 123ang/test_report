# Schema Migration: Project → Version → Test Cases

Overview of the app’s current structure and how to fix migration issues locally.

---

## Current structure

**Old (legacy):** App Name → Test Cases → Test Runs  
**New:** Projects → Versions → Test Cases (with status, severity, priority)

### Schema changes

- **Added:** `Project`, `Version`
- **Modified:** `TestCase` belongs to `Version`; has `status`, `severity`, `priority`, `notes`, `testedAt`, etc.
- **Removed:** `TestRun`, `TestRunImage`

### API shape

- **Projects:** `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/:id`
- **Versions:** `GET /api/projects/:projectId/versions`, `POST /api/versions`, `GET/PUT/DELETE /api/versions/:id`
- **Test cases:** `GET/POST /api/test-cases` (with `versionId`), `GET/PUT/DELETE /api/test-cases/:id`
- **Removed:** `/api/test-runs/*`

### Frontend routes

- `/projects`, `/projects/:id`, `/projects/:projectId/versions/:versionId` (version = test cases list)

---

## Local migration steps

1. **Backup** (optional):  
   `pg_dump test_report > backup_$(date +%Y%m%d).sql`

2. **Apply migrations** (preferred if repo has migrations):  
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev --name your_migration_name
   npm run seed
   ```

3. **Or reset** (deletes all data):  
   ```bash
   cd backend
   npx prisma migrate reset
   npm run seed
   ```

---

## Quick fix: migration / reset issues

If `prisma migrate reset` or `migrate dev` fails (e.g. old migrations, wrong schema):

**Option A – New terminal (recommended)**  
In a new terminal (outside Cursor):

```bash
cd backend
# Remove old migrations only if you intend to recreate them
# rm -rf prisma/migrations   # Unix
# Remove-Item -Recurse -Force prisma\migrations   # PowerShell
npx prisma migrate dev --name initial_or_redesign
npm run seed
```

**Option B – Fresh database**  
Drop and recreate the DB, then migrate and seed:

```bash
cd backend
# Drop/recreate DB (adjust user/db name for your setup)
psql -U postgres -c "DROP DATABASE IF EXISTS test_report;"
psql -U postgres -c "CREATE DATABASE test_report;"
npx prisma migrate deploy
# or: npx prisma migrate dev --name initial
npm run seed
```

**Verify:** `npm run seed` runs without errors; then `npm run dev` and open the app.

For **production/VPS** migration and 500 fixes, see [DEPLOYMENT.md](DEPLOYMENT.md#vps-database-migration).
