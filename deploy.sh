#!/usr/bin/env bash
# Deploy Test Report app (VPS production)
# Usage: ./deploy.sh   or   bash deploy.sh
# Run from project root, or after: git pull && ./deploy.sh

set -e

# Project root = directory where this script lives
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "  Test Report – Deploy"
echo "  Project root: $SCRIPT_DIR"
echo "=========================================="

# --- 1. Git pull (optional: skip if you already pulled)
echo ""
echo "[1/6] Git pull..."
git pull || { echo "Warning: git pull failed (e.g. not a repo or no network). Continuing anyway."; }

# --- 2. Backend: install deps
echo ""
echo "[2/6] Backend: npm install..."
cd backend
npm install
cd ..

# --- 3. Backend: Prisma
echo ""
echo "[3/6] Backend: Prisma generate & migrate..."
cd backend
npx prisma generate
npx prisma migrate deploy
cd ..

# --- 4. Frontend: install deps and build
echo ""
echo "[4/6] Frontend: npm install & build..."
cd frontend
npm install
npm run build
cd ..

# --- 5. PM2: restart backend
echo ""
echo "[5/6] PM2: restart backend..."
if pm2 describe test-report-api >/dev/null 2>&1; then
  pm2 restart ecosystem.production.config.cjs
else
  pm2 start ecosystem.production.config.cjs
fi

# --- 6. Save process list
echo ""
echo "[6/6] PM2: save..."
pm2 save

echo ""
echo "=========================================="
echo "  Deploy finished."
echo "  Backend: pm2 status / pm2 logs test-report-api"
echo "  App: https://test-report.suntzutechnologies.com"
echo "=========================================="
