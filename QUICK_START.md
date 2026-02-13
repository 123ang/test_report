# Quick Start Guide

Get Test Report running in 5 minutes!

## 1. Install PostgreSQL

Download and install PostgreSQL from https://www.postgresql.org/download/

Create a database:
```sql
CREATE DATABASE test_report;
```

## 2. Setup Backend

```bash
cd backend
npm install
copy .env.example .env
```

Edit `.env` and set your database URL:
```
DATABASE_URL="postgresql://username:password@localhost:5432/test_report"
JWT_SECRET="change-this-to-a-random-secret"
```

Run migrations and seed:
```bash
npx prisma migrate dev
npm run seed
npm run dev
```

## 3. Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

## 4. Open Browser

Go to `http://localhost:5173`

Login with:
- Email: `demo@testreport.com`
- Password: `password123`

## Done! 🎉

You now have a fully functional test reporting system.

### What's Next?

- Create your first test case
- Execute a test and log results
- Upload screenshots
- View the dashboard
- Import test cases from CSV

For detailed documentation, see [DEVELOPER.md](./DEVELOPER.md)
