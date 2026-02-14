-- Run this ONCE on the VPS database if project_members table is missing (P2021).
-- Then run: npx prisma migrate resolve --applied 20260213170100_add_project_collaboration
--
-- From project root: sudo -u postgres psql -d test_report -f backend/prisma/add-project-members-table.sql
-- Or: cd backend && npx prisma db execute --file prisma/add-project-members-table.sql

CREATE TABLE IF NOT EXISTS "project_members" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "project_members_project_id_user_id_key" ON "project_members"("project_id", "user_id");

ALTER TABLE "project_members" DROP CONSTRAINT IF EXISTS "project_members_project_id_fkey";
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "project_members" DROP CONSTRAINT IF EXISTS "project_members_user_id_fkey";
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
