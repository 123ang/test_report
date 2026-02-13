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
PORT=5000
```

4. Run database migrations:

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

5. Start development servers:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

6. Open http://localhost:5173 in your browser

## Documentation

See [DEVELOPER.md](./DEVELOPER.md) for detailed documentation.

## License

MIT
