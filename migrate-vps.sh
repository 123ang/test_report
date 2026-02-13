#!/usr/bin/env bash
# Run database migrations on VPS (production).
# Usage: ./migrate-vps.sh
# Run from project root: cd /root/projects/test_report && ./migrate-vps.sh
#
# If you get "schema is not empty" or migration errors, see VPS_DATABASE_MIGRATION.md
# and consider: cd backend && npx prisma migrate resolve --applied 20260213170000_initial_with_images

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "  Test Report – VPS database migration"
echo "=========================================="

cd backend

echo ""
echo "Migration status:"
npx prisma migrate status || true

echo ""
echo "Applying pending migrations..."
npx prisma migrate deploy

echo ""
echo "Regenerating Prisma Client..."
npx prisma generate

cd ..

if command -v pm2 >/dev/null 2>&1; then
  echo ""
  echo "Restarting backend (PM2)..."
  pm2 restart ecosystem.production.config.cjs 2>/dev/null || pm2 start ecosystem.production.config.cjs
fi

echo ""
echo "=========================================="
echo "  Migrations complete."
echo "  Check: cd backend && npx prisma migrate status"
echo "=========================================="
