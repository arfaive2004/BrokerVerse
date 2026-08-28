# BrokerVerse — Backend (FastAPI)

This is the API that powers BrokerVerse: authentication, KYC onboarding,
funds checks, margin reports, and trade-surveillance PDF generation, backed
by a Postgres database with Alembic-managed migrations.

## What's real vs. mocked

- **Auth, database, business rules, CSV parsing, PDF generation** are all
  fully functional.
- **Document verification** (`/api/kyc/onboard`) does not run real OCR or
  face-matching (no third-party KYC vendor is configured). It runs a
  deterministic, explainable mock check instead, so the full onboarding →
  dashboard → notifications flow works end-to-end for demos. Swap
  `_mock_verify` in `app/routers/kyc.py` for a real vendor call when you're
  ready.

## Database schema

Five tables, defined in `app/models.py`:

| Table | Purpose |
|---|---|
| `users` | Accounts (email/password auth) |
| `clients` | Onboarded clients. `owner_id IS NULL AND is_demo=true` rows are the global demo data every visitor sees; real clients have `owner_id` set and `is_demo=false` |
| `margin_trades` | Rows behind the Margin Report |
| `watchdog_trades` | Rows behind the Trade Watchdog surveillance PDF |
| `funds_check_logs` | History of funds-check runs |

Design notes:
- **Money columns use `Numeric(14, 2)`, not `Float`.** Floats store binary
  fractions, so repeated arithmetic on them can drift by fractions of a
  cent — not acceptable for anything that looks like a ledger. `Numeric`
  stores an exact decimal value instead.
- **`CheckConstraint`s enforce valid values** at the database level (e.g.
  `clients.status` can only be `'Up'` or `'Down'`, `trade_type` can only be
  `'BUY'` or `'SELL'`) — invalid data is rejected even if it comes from
  outside this API, not just when the app happens to validate it.
- **`owner_id` cascades on delete** (`ondelete="CASCADE"`) — deleting a user
  cleans up their clients/trades/logs instead of leaving orphaned rows.
- **Composite indexes on `(owner_id, is_demo)`** match the app's actual query
  pattern (global demo rows ∪ one user's own rows).

## Local development

```bash
python -m venv venv
source venv/bin/activate         # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # then edit JWT_SECRET_KEY
uvicorn app.main:app --reload --port 8000
```

`.env` is loaded automatically on startup (via `python-dotenv`) — no need to
`export` variables by hand. A real environment variable of the same name
(e.g. one Vercel injects in production) always takes priority over whatever
is in `.env`.

Without a `DATABASE_URL` set, the app uses a local SQLite file and creates
tables automatically on startup — no migration step needed for quick local
hacking. The API will be at `http://127.0.0.1:8000`, with interactive docs
at `http://127.0.0.1:8000/docs`.

## Adding Postgres + running migrations

Once you set `DATABASE_URL` to a Postgres connection string, **Alembic
becomes the source of truth for the schema** — the app no longer auto-creates
tables on startup (see `app/main.py`), so you run migrations explicitly:

```bash
# 1. Get a free Postgres database, e.g. from neon.tech or supabase.com.
#    Copy its connection string.

# 2. Add it to backend/.env (it's loaded automatically -- no need to
#    export it by hand or source anything):
echo 'DATABASE_URL=postgresql://user:password@host:5432/dbname' >> .env

# 3. Create/update every table, index, and constraint in one shot:
alembic upgrade head
```

That's it — `alembic upgrade head` builds the entire schema (tables,
indexes, foreign keys, check constraints) from scratch on a fresh database.
Run the exact same command again after pulling any future migration to bring
an existing database up to date.

Other commands you'll actually use:

```bash
# After changing app/models.py, generate a new migration by diffing
# your models against the live database:
alembic revision --autogenerate -m "describe your change"

# Then review the generated file in alembic/versions/ before running:
alembic upgrade head

# Roll back the most recent migration:
alembic downgrade -1

# See the current migration state of the connected database:
alembic current
```

`psycopg2-binary` (the Postgres driver) is already in `requirements.txt`.

## Deploying to Vercel

1. Push this `backend/` folder as its own Vercel project (or a separate repo).
2. In the Vercel project settings, set environment variables:
   - `JWT_SECRET_KEY` — a long random string (required)
   - `DATABASE_URL` — your Postgres connection string (required for
     anything beyond a throwaway demo — see below)
   - `CORS_ORIGINS` — your frontend's URL, e.g.
     `https://brokerverse.vercel.app` (see the CORS section below)
3. **Before or right after your first deploy**, run `alembic upgrade head`
   from your own machine with `DATABASE_URL` pointed at that same Postgres
   database. Vercel doesn't run migrations for you — this is a one-time (and
   then occasional, after future schema changes) manual step.
4. Deploy. Vercel detects `api/index.py` as the Python entrypoint and uses
   `vercel.json`'s rewrite rule to route all requests to it.

### Why Postgres, not SQLite, in production

Vercel's Python functions run on an ephemeral, serverless filesystem —
anything written to `/tmp` can vanish the moment a "cold" instance spins up,
and concurrent requests can even hit different instances at once. A file-based
database like SQLite doesn't survive that reliably: signups or onboarded
clients can silently disappear, and concurrent writes can throw
`database is locked` errors. Postgres is a persistent, always-on server
that's built to handle concurrent connections, so it doesn't have either
problem. Free tiers from Neon or Supabase are enough for this app.

## CORS, explained

CORS (Cross-Origin Resource Sharing) is a browser security rule: JavaScript
running on one website (e.g. `https://brokerverse.vercel.app`) is blocked by
the browser from calling an API on a different domain (e.g.
`https://brokerverse-backend.vercel.app`) *unless* that API explicitly says
"requests from this origin are allowed." `CORSMiddleware` in `app/main.py` is
what adds that permission to every response.

In practice, all you need to do is set `CORS_ORIGINS` to your deployed
frontend's URL:

```
CORS_ORIGINS=https://brokerverse.vercel.app
```

You can list more than one, comma-separated, if you have multiple frontend
deployments (e.g. a preview URL and a production domain):

```
CORS_ORIGINS=https://brokerverse.vercel.app,https://www.mybrokerage.com
```

`http://localhost:3000` is always allowed automatically, so `npm run dev`
keeps working without any extra setup. Avoid setting `CORS_ORIGINS=*` once
real user accounts are involved — it means literally any website could call
your API from a visitor's browser.

## API overview

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | – | Create an account |
| POST | `/api/auth/login` | – | Get a JWT access token |
| GET | `/api/auth/me` | required | Current user |
| GET | `/api/dashboard/metrics` | optional | Demo metrics, plus your own if logged in |
| GET | `/api/dashboard/top-clients` | optional | Top 5 clients by profit |
| GET | `/api/kyc/expiring` | optional | Clients with KYC expiring within 30 days |
| POST | `/api/kyc/onboard` | required | Onboard a new client (multipart form) |
| POST | `/api/clients/notify` | – | Mark a client as notified |
| POST | `/api/compliance/check-funds` | required | Upload a bank statement CSV |
| GET | `/api/reports/generate-margin-report` | required | CSV margin report |
| GET | `/api/surveillance/run-check` | required | PDF suspicious-activity report |

Global demo data (`is_demo=True` rows, `owner_id=NULL`) is seeded once on
first run and is visible to every visitor. Once a user signs up and adds
clients, their own data is layered on top of the demo baseline whenever
they're logged in.
