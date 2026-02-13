-- Wipe all tables and migration history so you can run migrations from scratch.
-- Run with: npx prisma db execute --file prisma/reset-schema.sql
-- Then: npx prisma migrate deploy && node prisma/seed.js

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
