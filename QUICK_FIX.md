# Quick Fix for Migration Issue

The `prisma migrate reset` command used the old migration. Here's how to fix it:

## Option 1: Run in a New Terminal (Recommended)

Open a **new PowerShell terminal** (not in Cursor) and run:

```powershell
cd C:\Users\User\Desktop\Website\test_report\backend

# Remove old migrations
Remove-Item -Recurse -Force prisma\migrations

# Create new migration (this will prompt you interactively)
npx prisma migrate dev --name redesign_project_version_structure

# Seed the database
npm run seed
```

## Option 2: Manual SQL Execution

If Option 1 doesn't work, run the SQL manually:

1. Connect to your PostgreSQL database:
   ```powershell
   psql -U postgres -d test_report
   ```

2. Run this SQL:
   ```sql
   -- Drop old tables
   DROP TABLE IF EXISTS test_run_images CASCADE;
   DROP TABLE IF EXISTS test_runs CASCADE;
   
   -- Create projects table
   CREATE TABLE projects (
       id SERIAL PRIMARY KEY,
       name TEXT NOT NULL,
       description TEXT,
       created_by_id INTEGER NOT NULL REFERENCES users(id),
       created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Create versions table
   CREATE TABLE versions (
       id SERIAL PRIMARY KEY,
       project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
       name TEXT NOT NULL,
       description TEXT,
       created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Modify test_cases table
   ALTER TABLE test_cases DROP COLUMN IF EXISTS app_name;
   ALTER TABLE test_cases ADD COLUMN version_id INTEGER REFERENCES versions(id) ON DELETE CASCADE;
   ALTER TABLE test_cases ADD COLUMN status TEXT NOT NULL DEFAULT 'Open';
   ALTER TABLE test_cases ADD COLUMN severity TEXT;
   ALTER TABLE test_cases ADD COLUMN priority TEXT;
   ALTER TABLE test_cases ADD COLUMN environment TEXT;
   ALTER TABLE test_cases ADD COLUMN actual_result TEXT;
   ALTER TABLE test_cases ADD COLUMN notes TEXT;
   ALTER TABLE test_cases ADD COLUMN tested_at TIMESTAMP(3);
   ```

3. Exit psql: `\q`

4. Then run:
   ```powershell
   cd C:\Users\User\Desktop\Website\test_report\backend
   npx prisma generate
   npm run seed
   ```

## Option 3: Fresh Database

If you want to start completely fresh:

```powershell
cd C:\Users\User\Desktop\Website\test_report\backend

# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS test_report;"
psql -U postgres -c "CREATE DATABASE test_report;"

# Remove migrations folder
Remove-Item -Recurse -Force prisma\migrations

# Create fresh migration
npx prisma migrate dev --name initial_redesign

# Seed
npm run seed
```

## Verify It Worked

After running one of the options above, check:

```powershell
npm run seed
```

You should see:
```
✅ Created user: demo@testreport.com
✅ Created projects
✅ Created versions
✅ Created test cases
```

Then start the backend:
```powershell
npm run dev
```

The backend should start without errors on port 4014.
