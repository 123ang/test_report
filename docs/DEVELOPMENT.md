# Test Report — Development & API

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Multi-Language Support](#multi-language-support)
- [CSV Import & Export](#csv-import--export)
- [Test Case Templates](#test-case-templates)
- [Frontend Pages](#frontend-pages)
- [Authentication](#authentication)
- [File Uploads](#file-uploads)
- [Deployment](DEPLOYMENT.md)
- [Development TODO](#development-todo)

---

## Overview

**Test Report** is a multi-user web application designed for testers to log, manage, and track manual test cases and test results across multiple systems and applications.

### Key Features

| Feature              | Description                                                    |
| -------------------- | -------------------------------------------------------------- |
| Manual Test Logging  | Create test cases, execute them, and log pass/fail results     |
| Multi-Language       | Test cases support **English (en)** and **Japanese (ja)**      |
| CSV Import           | Bulk-create test cases by uploading a CSV file                 |
| CSV Export           | Download test cases and test runs as CSV files                 |
| Templates            | Pre-built test case templates for users/AI to quickly fill out |
| Dashboard            | Visual charts for pass/fail rates and trends over time         |
| Screenshots          | Upload screenshots when logging test results                   |
| Multi-User Auth      | Simple register/login system with JWT tokens                   |

### Target Users

- Small QA teams (1–10 testers)
- Manual testers working across multiple systems (web, mobile, desktop, APIs)

---

## Tech Stack

| Layer      | Technology                   | Purpose                        |
| ---------- | ---------------------------- | ------------------------------ |
| Frontend   | React 18 + Vite              | SPA with fast HMR              |
| Styling    | Tailwind CSS                 | Utility-first responsive UI    |
| Backend    | Node.js + Express            | REST API server                |
| Database   | PostgreSQL                   | Relational data storage        |
| ORM        | Prisma                       | Type-safe database queries     |
| Auth       | JWT (jsonwebtoken) + bcryptjs | Token-based authentication    |
| Uploads    | Multer                       | Screenshot file uploads        |
| Charts     | Recharts                     | Dashboard visualizations       |
| CSV        | csv-parser + json2csv        | CSV import/export              |
| Toast      | react-hot-toast              | User notifications             |
| HTTP       | Axios                        | Frontend API calls             |
| Deployment | Nginx + PM2                  | Reverse proxy + process manager|

---

## Project Structure

```
test_report/
├── docs/                           # Documentation (this file in docs/DEVELOPMENT.md)
├── scripts/                        # Deploy and DB scripts
├── frontend/                      # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Layout.jsx          # App shell (navbar, sidebar, footer)
│   │   │   ├── Navbar.jsx          # Top nav with language toggle
│   │   │   ├── Sidebar.jsx         # Side navigation
│   │   │   ├── TestCaseTable.jsx   # Test cases data table
│   │   │   ├── TestRunTable.jsx    # Test runs data table
│   │   │   ├── StatusBadge.jsx     # Pass/fail/blocked/skipped badges
│   │   │   ├── FileUpload.jsx      # Screenshot upload component
│   │   │   ├── CSVImportModal.jsx  # CSV upload + preview modal
│   │   │   ├── LanguageTabs.jsx    # EN/JA tab switcher for test case forms
│   │   │   ├── TemplateSelector.jsx# Dropdown to pick a template
│   │   │   ├── Pagination.jsx      # Pagination controls
│   │   │   └── ConfirmDialog.jsx   # Delete confirmation modal
│   │   ├── pages/                  # Page-level components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── TestCasesPage.jsx   # List all test cases
│   │   │   ├── TestCaseFormPage.jsx# Create/edit test case
│   │   │   ├── ExecuteTestPage.jsx # Execute a test and log result
│   │   │   ├── TestRunsPage.jsx    # List all test runs
│   │   │   ├── TestRunDetailPage.jsx
│   │   │   ├── CSVImportPage.jsx   # CSV import interface
│   │   │   └── NotFoundPage.jsx    # 404 page
│   │   ├── services/               # API call functions
│   │   │   ├── api.js              # Axios instance with interceptors
│   │   │   ├── authService.js
│   │   │   ├── testCaseService.js
│   │   │   ├── testRunService.js
│   │   │   ├── dashboardService.js
│   │   │   └── csvService.js
│   │   ├── context/                # React context providers
│   │   │   ├── AuthContext.jsx     # User auth state + JWT
│   │   │   └── LangContext.jsx     # Language preference (en/ja)
│   │   ├── i18n/                   # UI translation strings
│   │   │   ├── en.json             # English UI labels
│   │   │   └── ja.json             # Japanese UI labels
│   │   ├── utils/                  # Helper functions
│   │   │   ├── constants.js        # Status enums, severity, priority
│   │   │   └── formatters.js       # Date formatting, status colors
│   │   ├── App.jsx                 # Root component with routes
│   │   └── main.jsx                # Entry point
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── backend/                       # Node.js backend (Express)
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   ├── seed.js                 # Seed templates into DB
│   │   └── migrations/             # Prisma migration files
│   ├── src/
│   │   ├── index.js                # Server entry point
│   │   ├── routes/                 # Express route definitions
│   │   │   ├── auth.routes.js
│   │   │   ├── testCase.routes.js
│   │   │   ├── testRun.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   └── csv.routes.js
│   │   ├── controllers/            # Request handlers / business logic
│   │   │   ├── auth.controller.js
│   │   │   ├── testCase.controller.js
│   │   │   ├── testRun.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   └── csv.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # JWT verification
│   │   │   ├── upload.middleware.js # Multer config for screenshots
│   │   │   └── validate.middleware.js # Request body validation
│   │   ├── templates/              # Pre-built test case template data
│   │   │   └── testCaseTemplates.js
│   │   └── utils/
│   │       ├── csvParser.js        # CSV import/export helpers
│   │       └── errors.js           # Custom error classes
│   ├── uploads/                    # Screenshot files (gitignored)
│   ├── .env                        # Environment variables (gitignored)
│   ├── .env.example                # Example env file
│   └── package.json
└── .gitignore
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐
│    User       │
│──────────────│
│ id (PK)       │
│ name          │
│ email (UQ)    │
│ password      │
│ preferredLang │──── "en" | "ja"
│ createdAt     │
└──────┬───────┘
       │
       │ 1:N (tester)
       ▼
┌──────────────┐       ┌───────────────────────┐
│  TestCase     │──1:N─▶│  TestCaseTranslation   │
│──────────────│       │───────────────────────│
│ id (PK)       │       │ id (PK)                │
│ appName       │       │ testCaseId (FK)         │
│ templateKey   │       │ language ─── "en"|"ja"  │
│ createdById   │       │ title                   │
│ createdAt     │       │ description             │
│ updatedAt     │       │ steps                   │
└──────┬───────┘       │ expectedResult          │
       │                │ UQ(testCaseId+language) │
       │ 1:N            └───────────────────────┘
       ▼
┌──────────────┐
│  TestRun      │
│──────────────│
│ id (PK)       │
│ testCaseId(FK)│
│ testerId (FK) │
│ status        │──── "pass"|"fail"|"blocked"|"skipped"
│ actualResult  │
│ environment   │
│ severity      │──── "critical"|"major"|"minor"|"trivial"
│ priority      │──── "high"|"medium"|"low"
│ notes         │
│ executedAt    │
└──────┬───────┘
       │ 1:N
       ▼
┌────────────────┐
│  TestRunImage   │
│────────────────│
│ id (PK)         │
│ testRunId (FK)  │
│ filePath        │
│ originalName    │
│ uploadedAt      │
└────────────────┘
```

### Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            Int        @id @default(autoincrement())
  name          String
  email         String     @unique
  password      String
  preferredLang String     @default("en") @map("preferred_lang")
  createdAt     DateTime   @default(now()) @map("created_at")
  testCases     TestCase[]
  testRuns      TestRun[]

  @@map("users")
}

model TestCase {
  id           Int                    @id @default(autoincrement())
  appName      String                 @map("app_name")
  templateKey  String?                @map("template_key")
  createdBy    User                   @relation(fields: [createdById], references: [id])
  createdById  Int                    @map("created_by_id")
  createdAt    DateTime               @default(now()) @map("created_at")
  updatedAt    DateTime               @updatedAt @map("updated_at")
  translations TestCaseTranslation[]
  testRuns     TestRun[]

  @@map("test_cases")
}

model TestCaseTranslation {
  id             Int      @id @default(autoincrement())
  testCase       TestCase @relation(fields: [testCaseId], references: [id], onDelete: Cascade)
  testCaseId     Int      @map("test_case_id")
  language       String   // "en" or "ja"
  title          String
  description    String?
  steps          String   // Multi-line steps separated by newlines
  expectedResult String   @map("expected_result")

  @@unique([testCaseId, language])
  @@map("test_case_translations")
}

model TestRun {
  id           Int            @id @default(autoincrement())
  testCase     TestCase       @relation(fields: [testCaseId], references: [id], onDelete: Cascade)
  testCaseId   Int            @map("test_case_id")
  tester       User           @relation(fields: [testerId], references: [id])
  testerId     Int            @map("tester_id")
  status       String         // "pass", "fail", "blocked", "skipped"
  actualResult String?        @map("actual_result")
  environment  String?
  severity     String?        // "critical", "major", "minor", "trivial"
  priority     String?        // "high", "medium", "low"
  notes        String?
  executedAt   DateTime       @default(now()) @map("executed_at")
  images       TestRunImage[]

  @@map("test_runs")
}

model TestRunImage {
  id           Int      @id @default(autoincrement())
  testRun      TestRun  @relation(fields: [testRunId], references: [id], onDelete: Cascade)
  testRunId    Int      @map("test_run_id")
  filePath     String   @map("file_path")
  originalName String   @map("original_name")
  uploadedAt   DateTime @default(now()) @map("uploaded_at")

  @@map("test_run_images")
}
```

---

## API Endpoints

### Authentication

| Method | Endpoint             | Body                                    | Response                | Auth |
| ------ | -------------------- | --------------------------------------- | ----------------------- | ---- |
| POST   | `/api/auth/register` | `{ name, email, password, preferredLang }` | `{ user, token }`    | No   |
| POST   | `/api/auth/login`    | `{ email, password }`                   | `{ user, token }`       | No   |
| GET    | `/api/auth/me`       | —                                       | `{ user }`              | Yes  |

### Test Cases

| Method | Endpoint               | Query Params                           | Body                          | Auth |
| ------ | ---------------------- | -------------------------------------- | ----------------------------- | ---- |
| GET    | `/api/test-cases`      | `?appName=&search=&page=&limit=&lang=` | —                             | Yes  |
| GET    | `/api/test-cases/:id`  | `?lang=`                               | —                             | Yes  |
| POST   | `/api/test-cases`      | —                                      | See [Create Test Case](#create-test-case-body) | Yes |
| PUT    | `/api/test-cases/:id`  | —                                      | Same as create               | Yes  |
| DELETE | `/api/test-cases/:id`  | —                                      | —                             | Yes  |

#### Create Test Case Body

```json
{
  "appName": "MyApp",
  "templateKey": "login_flow",
  "translations": [
    {
      "language": "en",
      "title": "Login with valid credentials",
      "description": "Verify that users can log in with correct email and password",
      "steps": "1. Open login page\n2. Enter valid email\n3. Enter valid password\n4. Click Login button",
      "expectedResult": "User is redirected to the dashboard"
    },
    {
      "language": "ja",
      "title": "有効な資格情報でログイン",
      "description": "正しいメールアドレスとパスワードでログインできることを確認する",
      "steps": "1. ログインページを開く\n2. 有効なメールアドレスを入力\n3. 有効なパスワードを入力\n4. ログインボタンをクリック",
      "expectedResult": "ユーザーはダッシュボードにリダイレクトされる"
    }
  ]
}
```

### Test Runs

| Method | Endpoint                      | Query Params                                            | Auth |
| ------ | ----------------------------- | ------------------------------------------------------- | ---- |
| GET    | `/api/test-runs`              | `?testCaseId=&status=&testerId=&from=&to=&page=&limit=` | Yes  |
| GET    | `/api/test-runs/:id`          | —                                                       | Yes  |
| POST   | `/api/test-runs`              | Body: `{ testCaseId, status, actualResult, environment, severity, priority, notes }` | Yes |
| PUT    | `/api/test-runs/:id`          | Same as create body                                     | Yes  |
| POST   | `/api/test-runs/:id/images`   | `multipart/form-data` with `screenshots` field          | Yes  |

### Dashboard

| Method | Endpoint                     | Query Params      | Response                              | Auth |
| ------ | ---------------------------- | ----------------- | ------------------------------------- | ---- |
| GET    | `/api/dashboard/summary`     | `?from=&to=`      | `{ total, pass, fail, blocked, skipped, passRate }` | Yes |
| GET    | `/api/dashboard/trends`      | `?days=30`         | `[{ date, pass, fail, total }]`      | Yes  |
| GET    | `/api/dashboard/by-app`      | —                  | `[{ appName, pass, fail, total }]`   | Yes  |
| GET    | `/api/dashboard/recent`      | `?limit=10`        | `[{ testRun with testCase title }]`  | Yes  |

### CSV Import & Export

| Method | Endpoint                      | Description                                   | Auth |
| ------ | ----------------------------- | --------------------------------------------- | ---- |
| GET    | `/api/csv/template`           | Download blank CSV template for test cases     | Yes  |
| POST   | `/api/csv/import`             | Upload CSV file to bulk-create test cases      | Yes  |
| GET    | `/api/csv/export/test-cases`  | Download all test cases as CSV (with translations) | Yes |
| GET    | `/api/csv/export/test-runs`   | Download all test runs as CSV                  | Yes  |

---

## Multi-Language Support

### How It Works

The app supports two layers of multi-language:

#### 1. UI Language (Interface Labels)

- Controlled via `LangContext` in React
- Translation files: `frontend/src/i18n/en.json` and `frontend/src/i18n/ja.json`
- The navbar has a language toggle button (EN / JA)
- User's preferred language is saved in the `User.preferredLang` column

Example `en.json`:
```json
{
  "nav": {
    "dashboard": "Dashboard",
    "testCases": "Test Cases",
    "testRuns": "Test Runs",
    "import": "Import CSV",
    "logout": "Logout"
  },
  "testCase": {
    "title": "Title",
    "steps": "Steps",
    "expectedResult": "Expected Result",
    "create": "Create Test Case",
    "edit": "Edit Test Case"
  },
  "status": {
    "pass": "Pass",
    "fail": "Fail",
    "blocked": "Blocked",
    "skipped": "Skipped"
  }
}
```

Example `ja.json`:
```json
{
  "nav": {
    "dashboard": "ダッシュボード",
    "testCases": "テストケース",
    "testRuns": "テスト実行",
    "import": "CSVインポート",
    "logout": "ログアウト"
  },
  "testCase": {
    "title": "タイトル",
    "steps": "手順",
    "expectedResult": "期待結果",
    "create": "テストケース作成",
    "edit": "テストケース編集"
  },
  "status": {
    "pass": "合格",
    "fail": "不合格",
    "blocked": "ブロック",
    "skipped": "スキップ"
  }
}
```

#### 2. Test Case Content Language

- Each test case has translations stored in the `TestCaseTranslation` table
- The Create/Edit Test Case form has **language tabs** (EN | JA)
- Testers fill in title, steps, and expected result in each language
- When viewing or executing a test, the app shows the content in the user's selected language
- If a translation is missing, it falls back to English

---

## CSV Import & Export

### CSV Template (Download)

The downloadable CSV template has these columns:

```csv
appName,language,title,description,steps,expectedResult
```

### CSV Import Rules

1. Each row represents **one translation** of a test case
2. Rows with the same `appName` + `title` (in English) are grouped as translations of the same test case
3. Steps within a cell are separated by the pipe character `|`
4. The `language` column must be `en` or `ja`
5. At minimum, an English (`en`) row is required; Japanese (`ja`) is optional

### CSV Import Example

```csv
appName,language,title,description,steps,expectedResult
MyApp,en,Login Test,Test login flow,1. Open login page|2. Enter email|3. Enter password|4. Click Login,Dashboard loads successfully
MyApp,ja,ログインテスト,ログインフローのテスト,1. ログインページを開く|2. メールを入力|3. パスワードを入力|4. ログインをクリック,ダッシュボードが正常に読み込まれる
MyApp,en,Logout Test,Test logout,1. Click profile icon|2. Click Logout,User returns to login page
```

In the example above:
- "Login Test" has both EN and JA translations → 1 test case with 2 translations
- "Logout Test" has only EN → 1 test case with 1 translation

### CSV Export

- **Test Cases Export**: Includes all test cases with all translations (one row per translation)
- **Test Runs Export**: Includes test run data with the test case title in the user's preferred language

---

## Test Case Templates

Pre-built templates help testers quickly create standardized test cases. When a user selects a template, the form pre-fills with the template's steps and expected result.

### Available Templates

| Template Key      | Name (EN)           | Name (JA)              |
| ----------------- | ------------------- | ---------------------- |
| `login_flow`      | Login Flow          | ログインフロー          |
| `form_validation` | Form Validation     | フォームバリデーション    |
| `crud_operation`  | CRUD Operation      | CRUD操作               |
| `api_endpoint`    | API Endpoint Test   | APIエンドポイントテスト   |
| `ui_navigation`   | UI Navigation       | UIナビゲーション         |
| `custom`          | Custom (Blank)      | カスタム（空白）         |

### Template Data Structure

Each template provides pre-filled content in both languages:

```javascript
{
  key: "login_flow",
  translations: {
    en: {
      title: "Login Flow",
      description: "Verify the login functionality works correctly",
      steps: "1. Navigate to the login page\n2. Enter a valid email address\n3. Enter the correct password\n4. Click the Login button\n5. Verify the user is redirected to the dashboard",
      expectedResult: "User is successfully logged in and redirected to the dashboard"
    },
    ja: {
      title: "ログインフロー",
      description: "ログイン機能が正しく動作することを確認する",
      steps: "1. ログインページに移動する\n2. 有効なメールアドレスを入力する\n3. 正しいパスワードを入力する\n4. ログインボタンをクリックする\n5. ダッシュボードにリダイレクトされることを確認する",
      expectedResult: "ユーザーが正常にログインし、ダッシュボードにリダイレクトされる"
    }
  }
}
```

---

## Frontend Pages

### Page Map

```
Login / Register
       │
       ▼
  ┌─ Dashboard ────────────────────────────────────────┐
  │   • Stat cards (total, pass, fail, blocked)        │
  │   • Pie chart (pass/fail distribution)             │
  │   • Line chart (trends over last 30 days)          │
  │   • Bar chart (results by app)                     │
  │   • Recent activity feed                           │
  └────────┬───────────────────────────────────────────┘
           │
  ┌────────┼──────────────────┐
  │        │                  │
  ▼        ▼                  ▼
Test Cases List    Test Runs History    CSV Import
  │                    │
  ├──▶ Create/Edit     ├──▶ Run Detail
  │    (with tabs      │    (with screenshot gallery)
  │     EN/JA)         │
  │                    │
  └──▶ Execute Test ───┘
       (log result + upload screenshots)
```

### Key UI Components

| Component           | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| **Navbar**          | App logo, nav links, language toggle (EN/JA), user menu, logout   |
| **Language Tabs**   | Tab bar in test case forms to switch between EN and JA fields     |
| **Template Selector** | Dropdown in create form; selecting a template pre-fills fields  |
| **Status Badge**    | Colored badge: green (pass), red (fail), yellow (blocked), gray (skipped) |
| **File Upload**     | Drag-and-drop zone for screenshots with preview thumbnails        |
| **CSV Import Modal**| Upload CSV → preview parsed data in a table → confirm import      |
| **Data Tables**     | Sortable, searchable tables with pagination for test cases/runs   |
| **Dashboard Charts**| Recharts pie, line, and bar charts                                |

---

## Authentication

### Flow

```
Register → hash password (bcrypt) → save user → return JWT
Login    → verify password → return JWT
Request  → Authorization: Bearer <token> → middleware verifies → proceed
```

### JWT Payload

```json
{
  "userId": 1,
  "email": "tester@example.com",
  "iat": 1707840000,
  "exp": 1707926400
}
```

### Middleware

- All `/api/*` routes (except `/api/auth/login` and `/api/auth/register`) require a valid JWT
- Token is stored in `localStorage` on the frontend
- Axios interceptor attaches the token to every request header

---

## File Uploads

### Screenshot Upload

- **Library**: Multer
- **Storage**: `backend/uploads/` directory
- **Naming**: `{testRunId}_{timestamp}_{originalname}`
- **Max file size**: 5 MB per file
- **Accepted types**: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`
- **Max files per upload**: 5
- **Serving**: Express static route at `/uploads/`

### Upload Flow

1. Tester executes a test case and fills in results
2. Tester drags/drops or selects screenshot files
3. Frontend sends `POST /api/test-runs` to create the run
4. Then sends `POST /api/test-runs/:id/images` with `multipart/form-data`
5. Backend saves files to disk and creates `TestRunImage` records

---

## Deployment

### Architecture on VPS

```
Internet
    │
    ▼
┌─────────────────────────────────┐
│         Nginx (port 80/443)     │
│   ┌─────────────────────────┐   │
│   │  SSL (Let's Encrypt)    │   │
│   └─────────────────────────┘   │
│                                 │
│   /api/*  ──▶  proxy_pass       │──▶  Node.js/Express (port 4014, via PM2)
│   /*      ──▶  serve static     │──▶  React build files (/var/www/test-report/frontend/dist)
│   /uploads──▶  serve static     │──▶  Uploaded screenshots
└─────────────────────────────────┘
                    │
                    ▼
         ┌──────────────────┐
         │   PostgreSQL      │
         │   (port 5432)     │
         └──────────────────┘
```

### Nginx Config Example

```nginx
server {
    listen 80;
    server_name testreport.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name testreport.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/testreport.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/testreport.yourdomain.com/privkey.pem;

    # React frontend
    root /var/www/test-report/frontend/dist;
    index index.html;

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:4014;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploaded files
    location /uploads/ {
        alias /var/www/test-report/backend/uploads/;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Environment Variables (`backend/.env`)

```env
DATABASE_URL="postgresql://username:password@localhost:5432/test_report"
JWT_SECRET="your-secure-random-secret-key"
JWT_EXPIRES_IN="24h"
PORT=4014
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880
NODE_ENV="production"
```

### PM2 Commands

```bash
# Start the server
pm2 start backend/src/index.js --name test-report-api

# View logs
pm2 logs test-report-api

# Restart
pm2 restart test-report-api

# Set to start on boot
pm2 startup
pm2 save
```

---

## Development TODO

### Phase 1 — Project Setup & Database

- [ ] 1.1 Initialize project structure (`frontend/` with Vite + React, `backend/` with Express)
- [ ] 1.2 Set up Express server with middleware (cors, json, dotenv, static uploads)
- [ ] 1.3 Set up Prisma with PostgreSQL connection
- [ ] 1.4 Define Prisma schema (User, TestCase, TestCaseTranslation, TestRun, TestRunImage)
- [ ] 1.5 Run initial database migration
- [ ] 1.6 Create seed script with pre-built templates (6 templates × 2 languages)

### Phase 2 — Authentication

- [ ] 2.1 Build register endpoint with bcrypt password hashing
- [ ] 2.2 Build login endpoint with JWT token generation
- [ ] 2.3 Build `GET /api/auth/me` endpoint for token validation
- [ ] 2.4 Build auth middleware for JWT verification
- [ ] 2.5 Build React AuthContext (store token, user info, preferred language)
- [ ] 2.6 Build Login page
- [ ] 2.7 Build Register page
- [ ] 2.8 Set up protected routes in React Router

### Phase 3 — Test Case Management

- [ ] 3.1 Build Test Case CRUD API endpoints (with nested translations)
- [ ] 3.2 Build Test Cases list page (data table with search, filter by appName)
- [ ] 3.3 Build Create Test Case page with language tabs (EN / JA)
- [ ] 3.4 Build Edit Test Case page (pre-fill form with existing data)
- [ ] 3.5 Build template selector component (dropdown with pre-fill on select)
- [ ] 3.6 Build template data file with all 6 templates in both languages
- [ ] 3.7 Add delete test case with confirmation dialog

### Phase 4 — Test Execution & Run Logging

- [ ] 4.1 Build Test Run creation API endpoint
- [ ] 4.2 Build screenshot upload endpoint with Multer
- [ ] 4.3 Build "Execute Test" page (display steps, form for results)
- [ ] 4.4 Build Test Runs history page (table with filters: status, date, app, tester)
- [ ] 4.5 Build Test Run detail page (full info + screenshot gallery with lightbox)

### Phase 5 — CSV Import & Export

- [ ] 5.1 Build CSV template download endpoint (blank CSV with headers)
- [ ] 5.2 Build CSV export endpoint for test cases (with all translations)
- [ ] 5.3 Build CSV export endpoint for test runs
- [ ] 5.4 Build CSV import endpoint (parse, validate, create test cases + translations)
- [ ] 5.5 Build CSV import page in frontend (file upload, preview table, confirm button)
- [ ] 5.6 Add export buttons on Test Cases and Test Runs list pages

### Phase 6 — Dashboard

- [ ] 6.1 Build summary API (total, pass, fail, blocked, skipped, passRate)
- [ ] 6.2 Build trends API (daily pass/fail counts over last 30 days)
- [ ] 6.3 Build per-app breakdown API
- [ ] 6.4 Build recent activity API
- [ ] 6.5 Build Dashboard page with stat cards
- [ ] 6.6 Add Recharts pie chart (pass/fail distribution)
- [ ] 6.7 Add Recharts line chart (trends over time)
- [ ] 6.8 Add Recharts bar chart (results by app)
- [ ] 6.9 Add recent activity feed

### Phase 7 — UI Polish & UX

- [ ] 7.1 Add language toggle in navbar (EN / JA) with LangContext
- [ ] 7.2 Add UI translation files (`en.json`, `ja.json`)
- [ ] 7.3 Add loading spinners and skeleton screens
- [ ] 7.4 Add toast notifications (react-hot-toast) for all actions
- [ ] 7.5 Add pagination for all list pages
- [ ] 7.6 Add frontend + backend form validation
- [ ] 7.7 Make responsive for tablet screens
- [ ] 7.8 Add error boundary and 404 page
- [ ] 7.9 Add empty states for lists with no data

### Phase 8 — Deployment

- [ ] 8.1 Install and configure PostgreSQL on VPS
- [ ] 8.2 Install Node.js (LTS) and PM2 on VPS
- [ ] 8.3 Clone project and run `npm install` on VPS
- [ ] 8.4 Run Prisma migrations on VPS
- [ ] 8.5 Run seed script on VPS
- [ ] 8.6 Build React for production (`npm run build`)
- [ ] 8.7 Configure Nginx (reverse proxy + static files + SPA fallback)
- [ ] 8.8 Set up SSL with Let's Encrypt (certbot)
- [ ] 8.9 Set up environment variables on VPS
- [ ] 8.10 Start backend with PM2 and configure auto-restart on boot

---

## Quick Reference Commands

### Local Development

```bash
# Start backend (from backend/)
npm run dev

# Start frontend (from frontend/)
npm run dev

# Run Prisma migration
npx prisma migrate dev --name <migration_name>

# Seed the database
npx prisma db seed

# Open Prisma Studio (database GUI)
npx prisma studio

# Generate Prisma client after schema changes
npx prisma generate
```

### Production

```bash
# Build frontend
cd frontend && npm run build

# Start backend with PM2
pm2 start backend/src/index.js --name test-report-api

# Restart backend
pm2 restart test-report-api

# View logs
pm2 logs test-report-api
```
