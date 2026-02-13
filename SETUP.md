# Test Report - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Git** (optional, for version control)

## Step 1: Database Setup

### Create PostgreSQL Database

1. Open PostgreSQL command line or pgAdmin
2. Create a new database:

```sql
CREATE DATABASE test_report;
```

3. Create a user (optional):

```sql
CREATE USER test_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE test_report TO test_user;
```

## Step 2: Backend Setup

### Install Dependencies

```bash
cd backend
npm install
```

### Configure Environment Variables

1. Copy the example environment file:

```bash
copy .env.example .env
```

2. Edit `.env` and update with your database credentials:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/test_report"
JWT_SECRET="your-secure-random-secret-key-change-this"
JWT_EXPIRES_IN="24h"
PORT=5000
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880
NODE_ENV="development"
```

**Important:** Change `JWT_SECRET` to a secure random string!

### Run Database Migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### Seed the Database

```bash
npm run seed
```

This creates:
- Demo user: `demo@testreport.com` / `password123`
- Sample test case with translations
- Sample test run

### Start the Backend Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Step 3: Frontend Setup

### Install Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### Configure Environment Variables

1. Copy the example environment file:

```bash
copy .env.example .env
```

2. The default configuration should work:

```env
VITE_API_URL=http://localhost:5000/api
```

### Start the Frontend Development Server

```bash
npm run dev
```

The app will start on `http://localhost:5173`

## Step 4: Access the Application

1. Open your browser and go to `http://localhost:5173`
2. You can either:
   - Register a new account
   - Login with demo account: `demo@testreport.com` / `password123`

## Project Structure

```
test_report/
├── backend/                # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, upload, etc.
│   │   ├── templates/      # Test case templates
│   │   └── utils/          # Helper functions
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.js         # Seed data
│   └── uploads/            # Screenshot storage
├── frontend/               # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React context (Auth, Lang)
│   │   ├── i18n/           # Translations (EN/JA)
│   │   └── utils/          # Helper functions
│   └── public/
└── DEVELOPER.md            # Detailed documentation
```

## Common Commands

### Backend

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Generate Prisma client
npx prisma generate

# Create new migration
npx prisma migrate dev --name migration_name

# Open Prisma Studio (database GUI)
npx prisma studio

# Seed database
npm run seed
```

### Frontend

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### Database Connection Issues

If you see "Can't reach database server":

1. Ensure PostgreSQL is running
2. Check your DATABASE_URL in `.env`
3. Verify database exists: `psql -l`
4. Test connection: `psql -U username -d test_report`

### Port Already in Use

If port 5000 or 5173 is already in use:

1. Change PORT in `backend/.env`
2. Update VITE_API_URL in `frontend/.env` accordingly
3. Or kill the process using the port:
   - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`
   - Mac/Linux: `lsof -ti:5000 | xargs kill`

### Prisma Issues

If you encounter Prisma errors:

```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Format schema
npx prisma format
```

### CORS Issues

If you see CORS errors in the browser console:

1. Ensure backend is running on `http://localhost:5000`
2. Check VITE_API_URL in `frontend/.env`
3. Restart both servers

## Default Test Account

After seeding, you can login with:

- **Email:** `demo@testreport.com`
- **Password:** `password123`

## Features

✅ User authentication (register/login)
✅ Multi-language support (English & Japanese)
✅ Test case management (CRUD)
✅ Test execution with screenshot uploads
✅ Test run history
✅ Dashboard with charts
✅ CSV import/export
✅ Mobile-responsive design
✅ Pre-built test case templates

## Next Steps

1. **Create your first test case**: Go to Test Cases → Create Test Case
2. **Execute a test**: Click the play button on any test case
3. **View dashboard**: See your test statistics and trends
4. **Import test cases**: Use CSV Import to bulk-create test cases
5. **Export data**: Download test cases or test runs as CSV

## Production Deployment

See [DEVELOPER.md](./DEVELOPER.md) for detailed deployment instructions including:

- VPS setup
- Nginx configuration
- PM2 process management
- SSL certificates
- Environment variables

## Support

For detailed documentation, see [DEVELOPER.md](./DEVELOPER.md)

## License

MIT
