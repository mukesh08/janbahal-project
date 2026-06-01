# Janbahal Project

A full-stack CMS with a React frontend (Vite) and an Express/MongoDB backend.

---

## Prerequisites

Make sure these are installed on your machine:

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or an existing connection URI from the team)

---

## 1. Clone the repository

```bash
git clone https://github.com/mukesh08/janbahal-project.git
cd janbahal-project
```

---

## 2. Backend setup

### 2a. Install dependencies

```bash
cd backend
npm install
```

### 2b. Create the `.env` file

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Then open `backend/.env` and set each value:

| Variable | Description |
|---|---|
| `PORT` | Port the backend runs on. Keep it `5001` (frontend proxy is configured for this). |
| `MONGODB_URI` | Your MongoDB Atlas connection string. Get this from Atlas → your cluster → Connect → Drivers. |
| `JWT_SECRET` | Any long random string. Example: run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN` | How long login tokens last. `7d` is fine. |
| `ANTHROPIC_API_KEY` | Not used. Leave as-is. |

> **Getting a MongoDB URI:**
> 1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
> 2. Create a free cluster (or use an existing one)
> 3. Click **Connect** → **Drivers** → copy the connection string
> 4. Replace `<password>` with your database user's password
> 5. Replace `<dbname>` with `janbahal` (or any name you prefer)

### 2c. Start the backend

```bash
npm run dev
```

Backend will run at: `http://localhost:5001`

---

## 3. Frontend setup

Open a **new terminal tab**, then:

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at: `http://localhost:3000`

> The frontend automatically proxies `/api` and `/uploads` requests to `http://localhost:5001`, so no extra config is needed.

---

## 4. Open in browser

| URL | What it is |
|---|---|
| `http://localhost:3000` | Public site |
| `http://localhost:3000/admin` | Admin panel |

---

## 5. Seed sample data (recommended)

Run this once after the backend is started to populate the database with sample pages, menu, and blog posts:

```bash
cd backend
npm run seed
```

This creates:
- **Admin account** — `admin@newacore.com` / `Admin@1234`
- **Pages** — Home, About, Contact
- **Menu** — Main Navigation with links
- **Posts** — 3 sample blog posts

> Safe to run multiple times — it skips anything that already exists.

---

## Project structure

```
janbahal-project/
├── backend/
│   ├── models/        # Mongoose models
│   ├── routes/        # Express route handlers
│   ├── middleware/    # Auth middleware
│   ├── uploads/       # Uploaded media files
│   ├── server.js      # Entry point
│   └── .env           # Your local env vars (not committed)
└── frontend/
    ├── src/
    │   ├── pages/     # React pages
    │   └── components/
    └── vite.config.js
```

---

## Common issues

**MongoDB connection fails**
- Make sure your Atlas cluster allows connections from your IP. Go to Atlas → Network Access → Add IP Address → Add Current IP.

**Port already in use**
- Change `PORT` in `backend/.env` to something else (e.g. `5002`), then update `vite.config.js` proxy target to match.

**`npm install` fails**
- Make sure you are running Node.js v18+. Check with `node -v`.
