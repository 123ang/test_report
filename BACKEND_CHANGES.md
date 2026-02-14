# Backend Changes (for other developers)

This document summarizes **backend-only** changes made to support recent features. Frontend and docs changes are not listed here.

---

## 1. Project status: "End project" / "Finished" projects

### What changed

Projects can now be marked as **finished** (ended) or **active**. Finished projects are hidden by default on the projects list and can be reopened.

### Schema (`backend/prisma/schema.prisma`)

- **Project** model: added field  
  `status String @default("active")`  
  Allowed values: `"active"` | `"finished"`.

### Database

- New column: `projects.status` (default `'active'`).
- If you already had a DB, apply schema with `npx prisma db push` or add a migration. Existing rows get `status = 'active'`.

### API (`backend/src/routes/project.routes.js`)

**Create project – `POST /api/projects`**

- Request body may include optional `status`.
- If `status === 'finished'` it is stored; otherwise the project is created as `'active'`.

**Update project – `PUT /api/projects/:id`**

- Request body may include optional `status` with value `'active'` or `'finished'`.
- Only fields that are **sent** in the body are updated (e.g. you can send only `{ "status": "finished" }` without name/description/language).
- This allows the frontend to call “End project” with `PUT /api/projects/:id` and body `{ "status": "finished" }`, and “Reopen” with `{ "status": "active" }`.

**List / Get project**

- `GET /api/projects` and `GET /api/projects/:id` return the project(s) including the `status` field. No change to auth or query params.

### What others need to do

- After pulling: run migrations (or `npx prisma db push`) and `npx prisma generate`.
- If you have scripts or other clients that create/update projects, they can optionally set or change `status`; existing behaviour (no `status` sent) remains valid and keeps projects `active`.

---

## 2. Project get by ID: test case status for “new version” guard

### What changed

The frontend must only allow creating a **new version** when all test cases in existing versions are **Verified**. To support this, the backend now returns each version’s test case **status** when loading a single project.

### API (`backend/src/routes/project.routes.js`)

**Get project – `GET /api/projects/:id`**

- Under `include.versions`, the version include now has:
  - `_count: { select: { testCases: true } }` (unchanged)
  - **Added:** `testCases: { select: { status: true } }`
- So each version in the response has a `testCases` array of `{ status: "Open" | "Fixed" | "Verified" }` (and no other test case fields). The frontend uses this to decide if “New Version” is allowed.

### What others need to know

- Response shape of `GET /api/projects/:id` has changed: `project.versions[].testCases` is now an array of `{ status }` instead of being absent. Any client that parses this response should tolerate (or use) the new `testCases` array.
- No new endpoints; no change to auth or query params.

---

## Summary table

| Area              | Change |
|-------------------|--------|
| **Prisma schema** | `Project.status` added (`"active"` \| `"finished"`). |
| **POST /projects**| Optional body field `status`; default `'active'`. |
| **PUT /projects/:id** | Optional body field `status`; only provided fields are updated. |
| **GET /projects/:id** | `versions[].testCases` now included as `[{ status }]` for “all verified” check. |

No other backend files were modified (e.g. test case routes, version routes, auth, CSV, dashboard are unchanged for these features).
