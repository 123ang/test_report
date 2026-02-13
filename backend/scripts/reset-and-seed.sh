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
echo "[1/3] Dropping public schema (all tables)..."
npx prisma db execute --file prisma/reset-schema.sql

echo ""
echo "[2/3] Applying all migrations..."
npx prisma migrate deploy

echo ""
echo "[3/3] Seeding..."
node prisma/seed.js

echo ""
echo "=========================================="
echo "  Done. Database reset and seeded."
echo "=========================================="
