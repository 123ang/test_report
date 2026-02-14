# Deploy Test Report on VPS

Deploy the app to a VPS (e.g. **https://test-report.suntzutechnologies.com**) and fix production DB/schema issues.

---

## Overview

| Item | Value |
|------|--------|
| **Domain** | test-report.suntzutechnologies.com |
| **Backend** | Node.js (Express) on port 4014 — **PM2 runs only the backend** |
| **Frontend** | Built once (`npm run build`), static files served by Nginx |
| **Database** | PostgreSQL (local on VPS) |
| **SSL** | Let's Encrypt (Certbot) |
| **Web server** | Nginx (reverse proxy + static files) |

---

## Quick deploy (after first-time setup)

From the **project root** on the VPS:

```bash
cd /root/projects/test_report
git pull
./scripts/deploy.sh
```

Or, if you keep scripts in project root: `./deploy.sh`.  
The deploy script: installs deps, runs Prisma migrations, builds frontend, restarts PM2 backend.

**If the DB is on an old schema:** see [VPS database migration](#vps-database-migration) below. You can run `./scripts/migrate-vps.sh` after `git pull`, or use the fix/reset scripts described there.

---

## First-time setup

### Prerequisites

- VPS (e.g. Ubuntu 22.04), SSH, root/sudo
- Domain (or subdomain) pointed to the VPS IP

### 1. DNS

Add an **A record**: `test-report` (or your subdomain) → VPS public IP. Wait for propagation (`ping test-report.suntzutechnologies.com`).

### 2. System and Node

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3. PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql && sudo systemctl enable postgresql
sudo -u postgres psql
```

In psql:

```sql
CREATE DATABASE test_report;
CREATE USER test_report_user WITH ENCRYPTED PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE test_report TO test_report_user;
\c test_report
GRANT ALL ON SCHEMA public TO test_report_user;
\q
```

### 4. Nginx and PM2

```bash
sudo apt install -y nginx
sudo npm install -g pm2
```

### 5. Clone project

```bash
mkdir -p /root/projects
cd /root/projects
git clone https://github.com/your-org/test_report.git
cd test_report
```

### 6. Backend on VPS

```bash
cd backend
npm install --production
cp .env.example .env
nano .env
```

Set in `.env`:

```env
DATABASE_URL="postgresql://test_report_user:your_password@localhost:5432/test_report"
JWT_SECRET="long-random-production-secret"
JWT_EXPIRES_IN="24h"
PORT=4014
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880
NODE_ENV="production"
```

Then:

```bash
npx prisma generate
npx prisma migrate deploy
npm run seed   # optional
mkdir -p uploads
cd ..
pm2 start ecosystem.production.config.cjs
pm2 save
pm2 startup   # run the command it prints
```

Check: `curl http://127.0.0.1:4014/api/health`

### 7. Frontend build

```bash
cd frontend
echo 'VITE_API_URL=https://test-report.suntzutechnologies.com/api' > .env
npm install
npm run build
cd ..
```

### 8. Nginx site

```bash
sudo nano /etc/nginx/sites-available/test-report.suntzutechnologies.com
```

Example config (adjust paths and server_name):

```nginx
server {
    listen 80;
    server_name test-report.suntzutechnologies.com;
    root /root/projects/test_report/frontend/dist;
    index index.html;
    location /api/ {
        proxy_pass http://127.0.0.1:4014;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location /uploads/ {
        alias /root/projects/test_report/backend/uploads/;
    }
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/test-report.suntzutechnologies.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 9. SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d test-report.suntzutechnologies.com
```

### 10. Firewall (optional)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## VPS database migration

Use this when the live site returns **500** on `/api/projects` or `/api/dashboard`, or when the DB is on an old schema (e.g. no `project_members`, or “version 1” structure).

### Quick fix: apply migrations and restart

From **project root** on VPS:

```bash
./scripts/fix-500-production.sh
```

Or:

```bash
chmod +x scripts/fix-500-production.sh
./scripts/fix-500-production.sh
```

This runs `prisma migrate deploy`, `prisma generate`, and restarts the backend. Reload the app and try again.

### Full reset (wipe data, reseed)

If you can **delete all data** and want a clean schema + seed:

```bash
./scripts/reset-db-and-seed.sh
```

Type `y` when prompted. To skip prompt: `./scripts/reset-db-and-seed.sh -y`.  
Login after reset: `demo@testreport.com` / `password123`.

### Error: table `project_members` does not exist (P2021)

If `fix-500-production.sh` already ran but logs still say `project_members` does not exist:

1. Create the table (from repo backend):
   ```bash
   cd backend
   npx prisma db execute --file prisma/add-project-members-table.sql
   ```
   Or as postgres user:  
   `sudo -u postgres psql -d test_report -f /root/projects/test_report/backend/prisma/add-project-members-table.sql`

2. Mark migration as applied:
   ```bash
   npx prisma migrate resolve --applied 20260213170100_add_project_collaboration
   ```

3. Restart:
   ```bash
   cd ..
   pm2 restart ecosystem.production.config.cjs
   ```

### DB has old schema or no migration history

- **Already has current tables** but Prisma doesn’t know:  
  `cd backend && npx prisma migrate resolve --applied 20260213170000_initial_with_images` then `npx prisma migrate deploy`, `npx prisma generate`, restart PM2.

- **Empty or wipe OK:** Use `./scripts/reset-db-and-seed.sh` (see above), or drop DB, recreate, then `npx prisma migrate deploy` and `node prisma/seed.js` from `backend/`.

- **Important data on old schema:** Backup with `pg_dump`, then either migrate data manually to the new schema or restore backup elsewhere and start fresh with the new DB.

### Check migration status

```bash
cd backend
npx prisma migrate status
```

---

## Useful commands (from project root)

| Task | Command |
|------|--------|
| Full deploy | `git pull && ./scripts/deploy.sh` |
| Backend logs | `pm2 logs test-report-api` |
| Restart backend | `pm2 restart ecosystem.production.config.cjs` |
| Rebuild frontend | `cd frontend && npm run build` |
| Apply migrations only | `cd backend && npx prisma migrate deploy && npx prisma generate` |

---

## Troubleshooting

- **502 Bad Gateway:** Backend not running or wrong port; check `pm2 status` and Nginx `proxy_pass` (must match `PORT` in backend `.env`).
- **API/CORS errors:** Set `VITE_API_URL` in frontend `.env` to production API URL, then rebuild frontend.
- **DB connection:** Check `DATABASE_URL`, PostgreSQL running, user/DB exist.
- **Screenshots not loading:** Nginx `location /uploads/` must alias to backend `uploads/` path.

For more app/API details see [DEVELOPMENT.md](DEVELOPMENT.md).
