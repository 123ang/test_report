#!/usr/bin/env bash
# Drop all tables, re-apply migrations, and seed the database.
# Use on VPS or local when you want a clean DB (e.g. tables missing or wrong schema).
# Run from backend: ./scripts/reset-and-seed.sh
# Or from project root: cd backend && ./scripts/reset-and-seed.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$BACKEND_DIR"

echo "=========================================="
echo "  Reset DB: drop schema, migrate, seed"
echo "=========================================="

echo ""
echo "[1/4] Dropping all tables (works when app user is not schema owner)..."
npx prisma db execute --file prisma/reset-schema-drop-tables.sql

echo ""
echo "[2/4] Applying all migrations..."
npx prisma migrate deploy

echo ""
echo "[3/4] Regenerating Prisma Client..."
npx prisma generate

echo ""
echo "[4/4] Seeding..."
node prisma/seed.js

echo ""
echo "=========================================="
echo "  Done. Database reset and seeded."
echo "  Restart the backend (e.g. pm2 restart ecosystem.production.config.cjs)"
echo "=========================================="
