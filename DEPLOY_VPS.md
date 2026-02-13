# Deploy Test Report on VPS

This guide walks you through deploying the Test Report app on a VPS so it runs at **https://test-report.suntzutechnologies.com**.

---

## Overview

| Item | Value |
|------|--------|
| **Domain** | test-report.suntzutechnologies.com |
| **Backend** | Node.js (Express) on port 4014 — **PM2 runs only the backend** |
| **Frontend** | Built once (`npm run build`), then static files served by Nginx (no PM2) |
| **Database** | PostgreSQL (local on VPS) |
| **SSL** | Let's Encrypt (Certbot) |
| **Web server** | Nginx (reverse proxy + static files) |

---

## Quick deploy (after first-time setup)

After the initial setup (Nginx, SSL, PM2, `.env` files) is done, use the deploy script to update the app:

```bash
cd /root/projects/test_report
git pull
chmod +x deploy.sh   # only needed once
./deploy.sh
```

This will: pull latest code, install backend and frontend dependencies, run Prisma migrations, build the frontend, and restart the PM2 backend. See `deploy.sh` in the repo for the exact steps.

---

## Prerequisites

- A VPS with **Ubuntu 22.04** (or similar) and SSH access
- **Root or sudo** access
- Domain **suntzutechnologies.com** (or parent domain) under your control for DNS

---

## Step 1: DNS (Do this first)

Point the subdomain to your VPS IP.

1. In your DNS provider (e.g. Cloudflare, Namecheap, your registrar):
2. Add an **A record**:
   - **Name/host:** `test-report` (or `test-report.suntzutechnologies.com` depending on provider)
   - **Type:** A
   - **Value:** your VPS public IP (e.g. `123.45.67.89`)
   - **TTL:** 300 or Auto

Wait 5–15 minutes (or up to 48 hours) for DNS to propagate. Check with:

```bash
ping test-report.suntzutechnologies.com
```

You should see your VPS IP in the response.

---

## Step 2: Connect to the VPS and prepare the system

```bash
ssh root@YOUR_VPS_IP
# or: ssh your_user@YOUR_VPS_IP
```

Update the system and install basics:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git
```

---

## Step 3: Install Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # should show v20.x
npm -v
```

---

## Step 4: Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Create database and user:

```bash
sudo -u postgres psql
```

In the PostgreSQL prompt:

```sql
CREATE DATABASE test_report;
CREATE USER test_report_user WITH ENCRYPTED PASSWORD '5792_Ang';
GRANT ALL PRIVILEGES ON DATABASE test_report TO test_report_user;
\c test_report
GRANT ALL ON SCHEMA public TO test_report_user;
\q
```

Replace `CHOOSE_A_STRONG_PASSWORD` with a real password and note it for Step 8.

---

## Step 5: Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
```

---

## Step 6: Install PM2 (backend only)

```bash
sudo npm install -g pm2
```

---

## Step 7: Clone the project to the VPS

On the VPS:

```bash
mkdir -p /root/projects
cd /root/projects
git clone https://github.com/123ang/test_report.git
cd test_report
```

The project is now in `/root/projects/test_report`.

---

## Step 8: Backend setup on the VPS

```bash
cd /root/projects/test_report/backend
npm install --production
```

Create the environment file:

```bash
nano .env
```

Paste and adjust (use the DB password from Step 4 and a strong random `JWT_SECRET`):

```env
DATABASE_URL="postgresql://test_report_user:CHOOSE_A_STRONG_PASSWORD@localhost:5432/test_report"
JWT_SECRET="GENERATE_A_LONG_RANDOM_STRING_FOR_PRODUCTION"
JWT_EXPIRES_IN="24h"
PORT=4014
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880
NODE_ENV="production"
```

Save and exit (Ctrl+O, Enter, Ctrl+X in nano).

Run migrations and seed (optional):

```bash
npx prisma generate
npx prisma migrate deploy
npm run seed
```

Create uploads directory:

```bash
mkdir -p uploads
```

Start **only the backend** with PM2 (frontend is served by Nginx, not PM2):

**Option 1: Using PM2 Ecosystem Config (Recommended)**

```bash
cd /root/projects/test_report
pm2 start ecosystem.production.config.cjs
pm2 save
pm2 startup
# Run the command that pm2 startup prints (usually with sudo)
```

**Option 2: Manual PM2 Start**

```bash
pm2 start src/index.js --name test-report-api --cwd /root/projects/test_report/backend
pm2 save
pm2 startup
# Run the command that pm2 startup prints (usually with sudo)
```

Check:

```bash
pm2 status
curl http://127.0.0.1:4014/api/health
```

You should see `{"status":"ok",...}`.

**Summary**: For production, PM2 runs only the backend. The frontend is built and served by Nginx — no PM2 process for the frontend. See `PM2_GUIDE.md` for more commands.

---

## Step 9: Frontend build and env

Set the API URL for production:

```bash
cd /root/projects/test_report/frontend
nano .env
```

Add (replace with your real domain):

```env
VITE_API_URL=https://test-report.suntzutechnologies.com/api
```

Save and exit. Then build:

```bash
npm install
npm run build
```

This creates `frontend/dist`. Nginx will serve these static files (no PM2 for the frontend).

---

## Step 10: Nginx configuration

Create a site config:

```bash
sudo nano /etc/nginx/sites-available/test-report.suntzutechnologies.com
```

Paste (replace `test-report.suntzutechnologies.com` if you use a different hostname):

```nginx
server {
    listen 80;
    server_name test-report.suntzutechnologies.com;
    root /root/projects/test_report/frontend/dist;
    index index.html;

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:4014;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploaded screenshots
    location /uploads/ {
        alias /root/projects/test_report/backend/uploads/;
    }

    # SPA: all routes → index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Save and exit. Enable the site and test:

```bash
sudo ln -s /etc/nginx/sites-available/test-report.suntzutechnologies.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Open in browser: **http://test-report.suntzutechnologies.com**  
You should see the app (login page). SSL comes next.

---

## Step 11: SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d test-report.suntzutechnologies.com
```

- Enter email when asked
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (recommended: yes)

Certbot will update your Nginx config and add SSL. Reload Nginx if needed:

```bash
sudo systemctl reload nginx
```

Test: **https://test-report.suntzutechnologies.com**

Auto-renewal (usually already set up):

```bash
sudo certbot renew --dry-run
```

---

## Step 12: Firewall (optional but recommended)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

**Note:** You do **not** need to open port 4014 or 3014 for production. Nginx handles all external traffic (80/443) and proxies `/api/` to the backend internally.

---

## Summary checklist

- [ ] DNS A record: `test-report` → VPS IP
- [ ] Node.js, PostgreSQL, Nginx, PM2 installed
- [ ] PostgreSQL: database `test_report` and user created
- [ ] Project in `/root/projects/test_report` (backend + frontend)
- [ ] `backend/.env` with DATABASE_URL, JWT_SECRET, PORT=4014
- [ ] `npx prisma migrate deploy` and optional `npm run seed`
- [ ] PM2: backend only — `pm2 start ecosystem.production.config.cjs` (or manual start), then `pm2 save` / `pm2 startup`
- [ ] `frontend/.env`: `VITE_API_URL=https://test-report.suntzutechnologies.com/api`
- [ ] `npm run build` in frontend (Nginx serves the build; no PM2 for frontend)
- [ ] Nginx site for `test-report.suntzutechnologies.com` (proxy /api, /uploads, SPA)
- [ ] Certbot: SSL for `test-report.suntzutechnologies.com`
- [ ] UFW: allow Nginx and SSH

---

## Useful commands after deploy

| Task | Command |
|------|--------|
| **Full deploy** | `cd /root/projects/test_report && git pull && ./deploy.sh` |
| Backend logs | `pm2 logs test-report-api` |
| Restart backend | `pm2 restart test-report-api` |
| Backend status | `pm2 status` |
| Nginx reload | `sudo systemctl reload nginx` |
| Nginx logs | `sudo tail -f /var/log/nginx/error.log` |
| Rebuild frontend | `cd /root/projects/test_report/frontend && npm run build` |
| New migration | `cd /root/projects/test_report/backend && npx prisma migrate deploy` |

---

## Troubleshooting

**502 Bad Gateway**  
- Backend not running: `pm2 status` and `pm2 start test-report-api` if needed.  
- Wrong port in Nginx `proxy_pass` (must match `PORT` in backend `.env`, which is 4014).

**API calls fail or CORS errors**  
- Frontend `.env`: `VITE_API_URL` must be `https://test-report.suntzutechnologies.com/api` (same origin).  
- Rebuild frontend after changing `.env`: `npm run build`.

**Database connection error**  
- Check `DATABASE_URL` in `backend/.env`.  
- Ensure PostgreSQL is running: `sudo systemctl status postgresql`.  
- Ensure DB and user exist and user has rights (Step 4).

**Screenshots not loading**  
- Nginx `location /uploads/` must `alias` to `/root/projects/test_report/backend/uploads/`.  
- Backend must write files to `backend/uploads` (same path as in `.env`).

**SSL certificate issues**  
- DNS must point to this VPS before running certbot.  
- Run again: `sudo certbot --nginx -d test-report.suntzutechnologies.com`.

---

## Reference

- Main domain: [Sun Tzu Technologies](https://suntzutechnologies.com/)
- App URL after deploy: **https://test-report.suntzutechnologies.com**
- For more app and API details, see [DEVELOPER.md](./DEVELOPER.md).
