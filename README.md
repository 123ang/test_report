# Test Report

A multi-user web application for testers to log, manage, and track manual test cases and test results across multiple systems and applications.

## Features

- ✅ Manual test case creation and execution
- 🌍 Multi-language support (English & Japanese)
- 📊 Dashboard with visual analytics
- 📸 Screenshot uploads for test results
- 📥 CSV import/export
- 📱 Mobile-responsive design
- 🔐 JWT authentication

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **Charts**: Recharts

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+

### Installation

1. Clone the repository
2. Install dependencies:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:

```bash
# In backend/.env
DATABASE_URL="postgresql://username:password@localhost:5432/test_report"
JWT_SECRET="your-secure-random-secret-key"
JWT_EXPIRES_IN="24h"
PORT=4014
```

4. Run database migrations:

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

5. Start development servers:

**Option A: Using PM2 (Recommended)**

```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 logs
```

**Option B: Manual (Two Terminals)**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

6. Open http://localhost:3014 in your browser

## Documentation

- [DEVELOPER.md](./DEVELOPER.md) - Detailed technical documentation
- [TESTING_LOCAL.md](./TESTING_LOCAL.md) - Step-by-step local testing guide
- [DEPLOY_VPS.md](./DEPLOY_VPS.md) - Production deployment guide
- [PM2_GUIDE.md](./PM2_GUIDE.md) - PM2 process manager guide
- [PM2_QUICK_REFERENCE.md](./PM2_QUICK_REFERENCE.md) - Quick PM2 commands
- [PORT_CONFIGURATION.md](./PORT_CONFIGURATION.md) - Port setup details

## License

MIT
