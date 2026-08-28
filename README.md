# BrokerVerse

A brokerage compliance platform with a Next.js frontend and a FastAPI +
Postgres backend, structured as two independent projects so each can be
deployed to Vercel separately.

```
brokerverse/
├── backend/    FastAPI + SQLAlchemy + Alembic API (auth, KYC, funds, margin, watchdog)
└── frontend/   Next.js UI (dashboard, onboarding, compliance tools)
```

## Quick start (local)

**Backend** (SQLite by default, no setup needed):
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit JWT_SECRET_KEY
uvicorn app.main:app --reload --port 8000
```

**Frontend** (in a second terminal):
```bash
cd frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
npm run dev
```

Visit `http://localhost:3000` — you'll immediately see the BrokerVerse
dashboard with live demo numbers and demo clients, no account needed. Sign up
from the header to unlock KYC Onboarding, the Funds Checker, Margin Reports,
and Trade Watchdog, and add your own clients.

## Using Postgres instead of SQLite

SQLite is fine for local hacking but isn't durable on Vercel's serverless
filesystem (see `backend/README.md` for why). To use Postgres:

1. Get a free database (e.g. [neon.tech](https://neon.tech) or
   [supabase.com](https://supabase.com)) and copy its connection string.
2. `export DATABASE_URL="postgresql://user:pass@host/dbname"`
3. `cd backend && alembic upgrade head` — this builds every table, index,
   and constraint from scratch.
4. Start the app as normal; it now reads/writes Postgres instead of SQLite.

Full details, including how to add future schema changes, are in
`backend/README.md`.

## Deploying to Vercel

Deploy `backend/` and `frontend/` as **two separate Vercel projects**:

1. **Backend** — import `backend/` as a project. Set `JWT_SECRET_KEY`,
   `DATABASE_URL` (your Postgres connection string), and `CORS_ORIGINS`
   (your frontend's URL) in its environment variables. Run
   `alembic upgrade head` against that same database before/after your
   first deploy — see `backend/README.md`.
2. **Frontend** — import `frontend/` as a project. Set `NEXT_PUBLIC_API_URL`
   to the backend project's deployed URL.

Full details, including a plain-language explanation of the CORS setting,
are in each project's own README.

## Design

- **Color palette**: dark navy background, slate-blue cards and navigation,
  electric blue for primary actions, with green/red reserved specifically
  for market-direction signals (client status, PASS/FAIL, margin OK/issue).
- **Fonts**: Space Grotesk (headings) + Inter (body), unchanged from the
  original design.
