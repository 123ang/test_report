# VPS Database Migration – Bring Production to Latest Schema

This guide helps you update your **VPS database** from an older "version 1" state to the **current schema** (Project → Version → Test Cases + images + project members).

---

## Current migrations (in repo)

Your project has **2 migrations** that must be applied in order:

| Migration | What it does |
|-----------|----------------------|
| `20260213170000_initial_with_images` | Creates: users, projects, versions, test_cases, test_case_images |
| `20260213170100_add_project_collaboration` | Creates: project_members |

---

## Option 1: Normal update (VPS already has “current” tables)

If the VPS database **already has** the tables `users`, `projects`, `versions`, `test_cases`, `test_case_images` (from a previous deploy) and only needs the **project_members** table:

1. SSH to VPS and go to project:
   ```bash
   ssh root@YOUR_VPS_IP
   cd /root/projects/test_report
   ```

2. Pull latest code (includes both migration files):
   ```bash
   git pull
   ```

3. Run deploy (this runs `prisma migrate deploy`):
   ```bash
   ./deploy.sh
   ```

   This will apply any **pending** migrations (e.g. `add_project_collaboration`) and restart the backend.

**Done.** Check the app; you should have the `project_members` table and collaboration feature.

---

## Option 2: VPS has no migration history (or “version 1” old schema)

If the VPS database is in one of these states:

- It was created long ago and has **no** `_prisma_migrations` table, or  
- It has **different tables** (e.g. old “version 1” design with different names), or  
- `prisma migrate deploy` fails with errors like “schema is not empty” or “migration failed”  

then use one of the following.

### 2A – Database already has current tables, but Prisma doesn’t know

If the VPS DB **already has** the right tables (users, projects, versions, test_cases, test_case_images) but Prisma never recorded the first migration:

1. SSH and go to project:
   ```bash
   cd /root/projects/test_report/backend
   ```

2. Mark the first migration as already applied (baseline):
   ```bash
   npx prisma migrate resolve --applied 20260213170000_initial_with_images
   ```

3. Apply remaining migrations (e.g. project_members):
   ```bash
   npx prisma migrate deploy
   ```

4. Regenerate client and restart app:
   ```bash
   npx prisma generate
   cd ..
   pm2 restart ecosystem.production.config.cjs
   ```

### 2B – Fresh database (empty or you can wipe it)

If you can **start from an empty database** (no important production data, or you have a backup):

1. On VPS, connect to PostgreSQL and drop/recreate the database (replace `test_report` and user if different):
   ```bash
   sudo -u postgres psql -c "DROP DATABASE IF EXISTS test_report;"
   sudo -u postgres psql -c "CREATE DATABASE test_report OWNER your_db_user;"
   ```

2. Ensure `backend/.env` on VPS has the correct `DATABASE_URL` for this DB.

3. Run migrations:
   ```bash
   cd /root/projects/test_report/backend
   npx prisma migrate deploy
   npx prisma generate
   ```

4. (Optional) Seed demo data:
   ```bash
   npm run seed
   ```

5. Restart backend:
   ```bash
   cd ..
   pm2 restart ecosystem.production.config.cjs
   ```

### 2C – You have important data on VPS (old schema)

If the VPS has **important data** in an **old “version 1” schema** (different tables/columns):

1. **Backup** the current database:
   ```bash
   sudo -u postgres pg_dump test_report > ~/test_report_backup_$(date +%Y%m%d).sql
   ```

2. Then either:
   - **Manual migration**: Export data from old tables, create new DB with `prisma migrate deploy`, then import/transform data into the new schema (custom scripts), or  
   - **Fresh start**: Restore the backup to a different DB name for reference, create a new empty `test_report` DB, run `prisma migrate deploy`, and re‑create only the data you need (no automatic conversion script is provided here).

---

## Ensure migrations are on the VPS

Migrations live in the repo under `backend/prisma/migrations/`. After `git pull`, verify:

```bash
ls -la /root/projects/test_report/backend/prisma/migrations/
```

You should see:

- `20260213170000_initial_with_images/`
- `20260213170100_add_project_collaboration/`
- `migration_lock.toml`

If they’re missing, fix your git history/repo so these folders and files are present, then run the steps in Option 1 or 2 again.

---

## Check what’s applied on VPS

To see which migrations Prisma thinks are applied:

```bash
cd /root/projects/test_report/backend
npx prisma migrate status
```

- **“Database schema is up to date!”** – no pending migrations; DB is at latest.
- **“X migration(s) pending”** – run `npx prisma migrate deploy` (or use Option 1/2 above).

---

## Quick reference

| Goal | Command (run from `/root/projects/test_report`) |
|------|-----------------------------------------------|
| Normal deploy (apply pending migrations) | `./deploy.sh` |
| Only apply migrations (no build/PM2) | `cd backend && npx prisma migrate deploy && npx prisma generate` |
| Mark first migration as applied | `cd backend && npx prisma migrate resolve --applied 20260213170000_initial_with_images` |
| Check migration status | `cd backend && npx prisma migrate status` |

Use **Option 1** if the VPS already has the current schema and you just need the latest migration. Use **Option 2A/2B/2C** when the DB is in an old or inconsistent state.
