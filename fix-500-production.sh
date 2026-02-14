#!/usr/bin/env bash
# Fix 500 errors on /api/projects and /api/dashboard (e.g. after schema changes).
# Ensures migrations are applied, Prisma client is current, and backend is restarted.
# Run from project root on VPS: ./fix-500-production.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "  Fix 500 – apply migrations & restart"
echo "=========================================="

echo ""
echo "[1/4] Migration status..."
cd backend
npx prisma migrate status || true

echo ""
echo "[2/4] Applying any pending migrations..."
npx prisma migrate deploy

echo ""
echo "[3/4] Regenerating Prisma Client..."
npx prisma generate

cd ..

echo ""
echo "[4/4] Restarting backend..."
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart ecosystem.production.config.cjs 2>/dev/null || pm2 start ecosystem.production.config.cjs
  echo "PM2 restarted."
else
  echo "PM2 not found. Restart the backend process manually."
fi

echo ""
echo "=========================================="
echo "  Done. Try the app again."
echo "  If still 500: pm2 logs test-report-api"
echo "=========================================="
