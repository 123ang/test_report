# Step-by-Step Testing in Local

Follow these steps in order to run and test the Test Report app on your machine.

**Quick Start with PM2**: If you have PM2 installed, you can use `pm2 start ecosystem.config.cjs` to start both backend and frontend at once. See `PM2_GUIDE.md` for details.

---

## Prerequisites

- **Node.js** 18 or higher installed ([nodejs.org](https://nodejs.org))
- **PostgreSQL** 14 or higher installed and running
- **Database** created: `test_report`

Create the database (in psql or pgAdmin):

```sql
CREATE DATABASE test_report;
```

---

## Step 1: Open the project folder

Open a terminal (PowerShell or Command Prompt) and go to the project root:

```bash
cd c:\Users\User\Desktop\Website\test_report
```

---

## Step 2: Backend – install dependencies

```bash
cd backend
npm install
```

Wait until all packages are installed. You should see a `node_modules` folder in `backend`.

---

## Step 3: Backend – environment file

Create the environment file from the example:

**Windows (PowerShell):**
```bash
copy .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

Edit `backend\.env` and set:

- `DATABASE_URL` – your PostgreSQL connection string  
  Example: `postgresql://postgres:yourpassword@localhost:5432/test_report`
- `JWT_SECRET` – any long random string (e.g. `my-super-secret-key-12345`)

Save the file.

---

## Step 4: Backend – database setup

Still in the `backend` folder, run:

```bash
npx prisma generate
```

Then:

```bash
npx prisma migrate dev --name init
```

Then seed the database:

```bash
npm run seed
```

You should see messages like: “Created demo user”, “Created sample test case”, “Seed completed”.

---

## Step 5: Backend – start the API

Still in `backend`:

```bash
npm run dev
```

You should see:

- `Server is running on http://localhost:4014`
- No errors in the terminal

Leave this terminal open. The backend must keep running.

---

## Step 6: Frontend – open a new terminal

Open a **new** terminal window. Go to the project root, then into the frontend folder:

```bash
cd c:\Users\User\Desktop\Website\test_report
cd frontend
```

---

## Step 7: Frontend – install dependencies

```bash
npm install
```

Wait until installation finishes. You should see `node_modules` in `frontend`.

---

## Step 8: Frontend – environment (optional)

If your API is not on `http://localhost:4014`, create and edit the frontend env file:

**Windows:**
```bash
copy .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

Edit `frontend\.env` and set:

```
VITE_API_URL=http://localhost:4014/api
```

If you use the default port 4014, you can skip this step.

---

## Step 9: Frontend – start the app

Still in the `frontend` folder:

```bash
npm run dev
```

You should see something like:

- `Local: http://localhost:3014/`
- Vite dev server running

Leave this terminal open. The frontend must keep running.

---

## Step 10: Open the app in the browser

1. Open your browser.
2. Go to: **http://localhost:3014**

You should see the Test Report login (or register) page.

---

## Step 11: Log in and test

**Demo account:**

- Email: `demo@testreport.com`
- Password: `password123`

Or click **Register** and create a new account.

After login you should see the Dashboard. You can then:

- Open **Test Cases** and create/edit test cases
- **Execute** a test and log result (Pass/Fail, etc.)
- Open **Test Runs** to see history
- Use **Import CSV** to import test cases
- Use **Export** on Test Cases or Test Runs to download CSV
- Switch language **EN / JA** in the top bar

---

## Quick reference – folder and commands

| Step | Folder   | Command(s) |
|------|----------|------------|
| 2    | `backend`  | `npm install` |
| 4    | `backend`  | `npx prisma generate` → `npx prisma migrate dev --name init` → `npm run seed` |
| 5    | `backend`  | `npm run dev` |
| 7    | `frontend` | `npm install` |
| 9    | `frontend` | `npm run dev` |

---

## Stopping the app

- In the **backend** terminal: press `Ctrl + C`
- In the **frontend** terminal: press `Ctrl + C`

---

## If something goes wrong

**“Cannot find module”**  
- Run `npm install` again in the folder where you see the error (`backend` or `frontend`).

**“Port 5000 already in use”**  
- Change `PORT=4014` to another port (e.g. `4015`) in `backend\.env`.  
- If you change the port, set `VITE_API_URL=http://localhost:4015/api` in `frontend\.env`.

**“Can’t reach database”**  
- Make sure PostgreSQL is running.  
- Check `DATABASE_URL` in `backend\.env` (user, password, host, port, database name).

**Blank page or API errors in browser**  
- Ensure both backend (`npm run dev` in `backend`) and frontend (`npm run dev` in `frontend`) are running.  
- Ensure you use the correct URL (e.g. http://localhost:3014 for the app).

---

## Summary

1. `cd backend` → `npm install` → set `.env` → `npx prisma generate` → `npx prisma migrate dev` → `npm run seed` → `npm run dev`
2. New terminal: `cd frontend` → `npm install` → (optional) `.env` → `npm run dev`
3. Open **http://localhost:3014** and log in (e.g. demo@testreport.com / password123).

You’re done. Use this file whenever you want to run and test the app locally.
