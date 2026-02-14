-- Drop all app tables (no DROP SCHEMA - use when DB user is not owner of schema public).
-- Safe to run with app's DATABASE_URL. Then run: npx prisma migrate deploy && node prisma/seed.js

DROP TABLE IF EXISTS "test_case_images" CASCADE;
DROP TABLE IF EXISTS "test_cases" CASCADE;
DROP TABLE IF EXISTS "project_members" CASCADE;
DROP TABLE IF EXISTS "versions" CASCADE;
DROP TABLE IF EXISTS "projects" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
