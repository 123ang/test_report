#!/usr/bin/env bash
# Remove all tables, recreate from migrations, and seed the database.
# Use on VPS or local when you want a clean DB (fixes schema issues, missing tables, etc.).
#
# Run from project root:
#   chmod +x reset-db-and-seed.sh   # only once
#   ./reset-db-and-seed.sh
#
# WARNING: This deletes ALL data in the database.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "  Reset DB: drop all tables, migrate, seed"
echo "  (uses DATABASE_URL from backend/.env)"
echo "=========================================="

if [ -n "$1" ] && [ "$1" = "-y" ]; then
  CONFIRM="y"
else
  read -p "This will DELETE all data. Continue? [y/N] " CONFIRM
fi

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "Aborted."
  exit 0
fi

echo ""
if [ -f backend/scripts/reset-and-seed.sh ]; then
  chmod +x backend/scripts/reset-and-seed.sh 2>/dev/null || true
  backend/scripts/reset-and-seed.sh
else
  echo "[1/4] Dropping public schema (all tables)..."
  cd backend
  npx prisma db execute --file prisma/reset-schema.sql
  echo ""
  echo "[2/4] Applying all migrations..."
  npx prisma migrate deploy
  echo ""
  echo "[3/4] Regenerating Prisma Client..."
  npx prisma generate
  echo ""
  echo "[4/4] Seeding..."
  node prisma/seed.js
  cd ..
fi

echo ""
if command -v pm2 >/dev/null 2>&1; then
  echo "Restarting backend (PM2)..."
  pm2 restart ecosystem.production.config.cjs 2>/dev/null || pm2 start ecosystem.production.config.cjs 2>/dev/null || true
  echo "PM2 restarted."
fi

echo ""
echo "=========================================="
echo "  Done. All tables recreated and data seeded."
echo "  Login: demo@testreport.com / password123"
echo "=========================================="
