#!/usr/bin/env bash
# One-time: create the add_project_collaboration migration folder on VPS so
# "prisma migrate resolve --applied" can find it (migrations were in .gitignore).
# Run from backend: ./scripts/vps-add-migration-folder.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATIONS_DIR="$BACKEND_DIR/prisma/migrations"
MIGRATION_NAME="20260213170100_add_project_collaboration"
MIGRATION_DIR="$MIGRATIONS_DIR/$MIGRATION_NAME"

if [ -d "$MIGRATION_DIR" ]; then
  echo "Migration folder already exists: $MIGRATION_DIR"
  exit 0
fi

echo "Creating $MIGRATION_DIR ..."
mkdir -p "$MIGRATION_DIR"

cat > "$MIGRATION_DIR/migration.sql" << 'EOF'
-- CreateTable
CREATE TABLE "project_members" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_members_project_id_user_id_key" ON "project_members"("project_id", "user_id");

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EOF

echo "Done. Run: npx prisma migrate resolve --applied $MIGRATION_NAME"
echo "(Do NOT run migrate deploy - table already exists.)"