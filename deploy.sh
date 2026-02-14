#!/usr/bin/env bash
# Deploy Test Report app (VPS production)
# Usage: ./deploy.sh   from project root
# Or:    ./scripts/deploy.sh   (script can live in project root or in scripts/)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# If script is in scripts/ subdir, project root is parent; else script is in project root
if [ -d "$SCRIPT_DIR/backend" ]; then
  ROOT_DIR="$SCRIPT_DIR"
else
  ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
fi
cd "$ROOT_DIR"

echo "=========================================="
echo "  Test Report – Deploy"
echo "  Project root: $ROOT_DIR"
echo "=========================================="

echo ""
echo "[1/6] Git pull..."
git pull || { echo "Warning: git pull failed (e.g. not a repo or no network). Continuing anyway."; }

echo ""
echo "[2/6] Backend: npm install..."
cd backend
npm install
cd ..

echo ""
echo "[3/6] Backend: Prisma generate & migrate..."
cd backend
npx prisma generate
npx prisma migrate deploy
cd ..

echo ""
echo "[4/6] Frontend: npm install & build..."
cd frontend
npm install
npm run build
cd ..

echo ""
echo "[5/6] PM2: restart backend..."
if pm2 describe test-report-api >/dev/null 2>&1; then
  pm2 restart ecosystem.production.config.cjs
else
  pm2 start ecosystem.production.config.cjs
fi

echo ""
echo "[6/6] PM2: save..."
pm2 save

echo ""
echo "=========================================="
echo "  Deploy finished."
echo "  Backend: pm2 status / pm2 logs test-report-api"
echo "  App: https://test-report.suntzutechnologies.com"
echo "=========================================="
