# Backend verification (after frontend changes by others)

Summary of checks and fixes so the backend works correctly with the current schema and frontend.

---

## 1. Schema vs migrations

- **Issue:** `Project` in `schema.prisma` has `status String @default("active")`, but the initial migration does not create this column. Project create/update in the backend send `status`; without the column, the DB or Prisma can fail.
- **Fix:** Added migration `20260213170200_add_project_status` that adds `projects.status` with default `'active'`.
- **Action:** On VPS (or any env), run:
  ```bash
  cd backend && npx prisma migrate deploy
  ```
  Then restart the backend.

---

## 2. Routes and middleware

| Item | Status |
|------|--------|
| `index.js` | Mounts `/api/auth`, `/api/projects`, `/api/versions`, `/api/test-cases`, `/api/dashboard`, `/api/csv`. Serves `/uploads` and global error handler. |
| Auth | `auth.routes.js`: register, login, GET /me. All use `auth.middleware.js` where needed. |
| Projects | List (owner or member), get by id, create, update, delete. POST/DELETE members (owner only). Uses `status` on create/update. |
| Versions | CRUD under project; access checked by project ownership/membership. |
| Test cases | CRUD, toggle (fixed/verified), image upload/delete; all scoped to accessible projects. |
| Dashboard | Summary, trends, by-project, recent; filtered by accessible projects. |
| CSV | Export/import by version; filtered by accessible projects. |
| Middleware | All protected routes use `authMiddleware` from `auth.middleware.js`. |

No route or import issues found.

---

## 3. API base URL (frontend)

- Frontend `api.js`: `VITE_API_URL` or `http://localhost:4014/api`. Matches backend port 4014. No change needed.

---

## 4. Database tables expected

- `users`, `projects`, `versions`, `test_cases`, `test_case_images`, `project_members`, `_prisma_migrations`.
- `projects` must have a `status` column after the new migration (see above).

---

## 5. Quick checklist

- [ ] Run `npx prisma migrate deploy` in `backend/` so `project_members` and `projects.status` exist.
- [ ] Run `npx prisma generate` after any schema/migration change.
- [ ] Restart backend (e.g. PM2) after deploy.
- [ ] Ensure `backend/.env` has `DATABASE_URL` and `JWT_SECRET`.

---

## 6. New migration file

- `backend/prisma/migrations/20260213170200_add_project_status/migration.sql`  
  Adds `projects.status` with default `'active'` so backend create/update work with the current schema.
