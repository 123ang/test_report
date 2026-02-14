# VPS Database Migration – Bring Production to Latest Schema

This guide helps you update your **VPS database** from an older "version 1" state to the **current schema** (Project → Version → Test Cases + images + project members).

---

## 500 on /api/projects and /api/dashboard (quick fix)

If the live site returns **500** for projects and dashboard (and you’ve already pulled the latest code):

**On the VPS, from the project root:**

```bash
cd /root/projects/test_report
chmod +x fix-500-production.sh   # only needed once
./fix-500-production.sh
```

This applies any pending migrations (including `project_members`), regenerates the Prisma client, and restarts the backend. Then reload the app and try again.

---

## Nuclear option: remove all tables, recreate, and reseed

If you're okay **wiping all data** and starting fresh (same DB the app uses, correct schema, demo data):

```bash
cd /root/projects/test_report
chmod +x reset-db-and-seed.sh   # only once
./reset-db-and-seed.sh
```

When prompted, type `y` and Enter. The script will: drop all app tables (no schema drop, so it works when the DB user is not owner of schema `public`), run all migrations, regenerate the Prisma client, run the seed, and restart PM2. Then log in with **demo@testreport.com** / **password123**.

To skip the prompt: `./reset-db-and-seed.sh -y`

If you previously saw **"must be owner of schema public"**: the script now drops tables one by one instead of dropping the schema, so it works with the app's database user.

---

### Error: “The table `public.project_members` does not exist” (P2021)

If the logs show **project_members does not exist** and `fix-500-production.sh` already ran (so `migrate deploy` didn’t create it), create the table manually and tell Prisma it’s applied:

**1. Create the table** (run one of these):

```bash
cd /root/projects/test_report/backend
npx prisma db execute --file prisma/add-project-members-table.sql
```

If that fails (e.g. permission), run as PostgreSQL superuser (replace `test_report` with your DB name):

```bash
sudo -u postgres psql -d test_report -f /root/projects/test_report/backend/prisma/add-project-members-table.sql
```

**2. Mark the migration as applied** so future deploys don’t try to create it again:

```bash
cd /root/projects/test_report/backend
npx prisma migrate resolve --applied 20260213170100_add_project_collaboration
```

**3. Restart the backend:**

```bash
cd /root/projects/test_report
pm2 restart ecosystem.production.config.cjs
```

Then reload the app; the 500s should stop.

---

If **migrate deploy** fails for other reasons (e.g. “schema is not empty” or “relation already exists”), use the [baseline steps](#2a--database-already-has-current-tables-but-prisma-doesnt-know) below, then run `./fix-500-production.sh` again.

To see the exact error: `pm2 logs test-report-api` (look for `[API Error]`).

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

If the VPS DB **already has** the right tables (users, projects, versions, test_cases, test_case_images) but Prisma never recorded the first migration, or you see:

- **P3018** – “A migration failed to apply”
- **42P07** – `relation "users" already exists`

then the DB is already at that schema; you only need to baseline and apply the rest.

1. SSH and go to backend:
   ```bash
   cd /root/projects/test_report/backend
   ```

2. If the first migration **failed** (P3018), clear the failure state, then mark it as applied:
   ```bash
   npx prisma migrate resolve --rolled-back 20260213170000_initial_with_images
   npx prisma migrate resolve --applied 20260213170000_initial_with_images
   ```

   If you never ran migrate before and just need to baseline:
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

If you can **start from an empty database** (no important production data, or you have a backup), you can **reset all tables, re-apply migrations, and seed** in one go.

**Option 2B-1 – Reset script (recommended, from project backend)**

From the **backend** directory on the VPS:

```bash
cd /root/projects/test_report/backend
chmod +x scripts/reset-and-seed.sh   # only needed once
./scripts/reset-and-seed.sh
```

This script: drops the `public` schema (all tables), runs `prisma migrate deploy`, then runs the seed.

If you get **permission denied to drop schema**, run the reset SQL as the `postgres` user, then migrate and seed as your app user:
```bash
sudo -u postgres psql -d test_report -f /root/projects/test_report/backend/prisma/reset-schema.sql
cd /root/projects/test_report/backend
npx prisma migrate deploy
node prisma/seed.js
```

**Option 2B-2 – Drop and recreate the database**

1. On VPS, as PostgreSQL superuser (replace `test_report` and `your_db_user` if different):
   ```bash
   sudo -u postgres psql -c "DROP DATABASE IF EXISTS test_report;"
   sudo -u postgres psql -c "CREATE DATABASE test_report OWNER your_db_user;"
   ```

2. Ensure `backend/.env` has the correct `DATABASE_URL` for this DB.

3. Run migrations and seed:
   ```bash
   cd /root/projects/test_report/backend
   npx prisma migrate deploy
   npx prisma generate
   node prisma/seed.js
   ```

4. Restart backend:
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

## 500 after reset (“failed to load projects”)

If you get **500** when loading projects (or “failed to load resource”) right after a reset:

1. **Restart the backend** so it uses the new schema and Prisma client:
   ```bash
   cd /root/projects/test_report
   pm2 restart ecosystem.production.config.cjs
   ```
2. **Regenerate Prisma Client** if you didn’t run the full reset script (which now runs `prisma generate`):
   ```bash
   cd /root/projects/test_report/backend
   npx prisma generate
   ```
   Then restart again: `pm2 restart ecosystem.production.config.cjs`
3. **Log in again** – after a reset only the seed user exists. Use **demo@testreport.com** / **password123** (or create a new account).
4. Check backend logs for the real error: `pm2 logs test-report-api` (look for `GET /projects error:`).

---

## Quick reference

| Goal | Command (run from `/root/projects/test_report`) |
|------|-----------------------------------------------|
| Normal deploy (apply pending migrations) | `./deploy.sh` |
| Only apply migrations (no build/PM2) | `cd backend && npx prisma migrate deploy && npx prisma generate` |
| Mark first migration as applied | `cd backend && npx prisma migrate resolve --applied 20260213170000_initial_with_images` |
| Check migration status | `cd backend && npx prisma migrate status` |

Use **Option 1** if the VPS already has the current schema and you just need the latest migration. Use **Option 2A/2B/2C** when the DB is in an old or inconsistent state.
