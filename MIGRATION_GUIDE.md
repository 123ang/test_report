# Migration Guide: New Structure (Project → Version → Test Cases)

## Overview

The app has been redesigned with a new structure:

**Old**: App Name → Test Cases → Test Runs  
**New**: Projects → Versions → Test Cases (with status tracking built-in)

## Changes

### Database Schema

**Added**:
- `Project` model - groups test cases by project
- `Version` model - versions within a project

**Modified**:
- `TestCase` now belongs to a `Version` (instead of having `appName`)
- `TestCase` now has `status`, `severity`, `priority`, `environment`, `actualResult`, `notes`, `testedAt` fields (moved from TestRun)

**Removed**:
- `TestRun` model
- `TestRunImage` model

### Migration Steps

1. **Backup your database** before migrating:
   ```bash
   pg_dump test_report > backup_$(date +%Y%m%d).sql
   ```

2. **Reset database** (WARNING: This will delete all data):
   ```bash
   cd backend
   npx prisma migrate reset
   ```

3. **Or create a new migration** (if you want to preserve data):
   ```bash
   cd backend
   npx prisma migrate dev --name redesign_project_version_structure
   ```

4. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

5. **Seed the database**:
   ```bash
   npm run seed
   ```

## API Changes

### New Endpoints

**Projects**:
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

**Versions**:
- `GET /api/projects/:projectId/versions` - List versions for a project
- `POST /api/projects/:projectId/versions` - Create version
- `GET /api/versions/:id` - Get version details
- `PUT /api/versions/:id` - Update version
- `DELETE /api/versions/:id` - Delete version

**Test Cases** (modified):
- `GET /api/versions/:versionId/test-cases` - List test cases for a version
- `POST /api/versions/:versionId/test-cases` - Create test case
- `GET /api/test-cases/:id` - Get test case
- `PUT /api/test-cases/:id` - Update test case (including status, results)
- `DELETE /api/test-cases/:id` - Delete test case

### Removed Endpoints

- All `/api/test-runs/*` endpoints

## Frontend Changes

### New Pages

- `/projects` - List all projects
- `/projects/new` - Create new project
- `/projects/:id` - View project with versions
- `/projects/:projectId/versions/new` - Create new version
- `/versions/:id` - View version with test cases
- `/versions/:versionId/test-cases/new` - Create test case

### Modified Pages

- Test case form now includes status, severity, priority, environment, actual result, notes
- Test case list shows status badges (Open, Fixed, Verified, Closed)
- Dashboard shows stats by project and version

### Removed Pages

- `/test-runs` - Test runs list
- `/test-runs/:id` - Test run detail
- `/test-cases/:id/execute` - Execute test (now edit test case directly)

## CSV Format Changes

### Import CSV Format

```csv
project,version,title_en,title_ja,description_en,description_ja,steps_en,steps_ja,expected_result_en,expected_result_ja,status,severity,priority,environment
My Project,v1.0,Login test,ログインテスト,Test login,ログインをテスト,1. Open app,1. アプリを開く,User logged in,ユーザーがログイン,Open,High,High,Production
```

### Export CSV Format

Same as import, plus:
- `actual_result`
- `notes`
- `tested_at`
- `created_at`
- `updated_at`

## UI Changes

### Navigation

- Sidebar now shows: Dashboard, Projects, (removed Test Runs)
- Breadcrumbs: Projects → [Project Name] → [Version Name] → Test Cases

### Test Case Table

New columns:
- Status (Open/Fixed/Verified/Closed) with color badges
- Fixed checkbox
- Verified checkbox

Removed columns:
- Separate "Execute" action (now edit in place)

## Notes

- The new structure is simpler and more aligned with typical bug tracking workflows
- Test cases now track their own status instead of creating separate test run records
- Screenshots/attachments can be added later if needed (currently removed)
