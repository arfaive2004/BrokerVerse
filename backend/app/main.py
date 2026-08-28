import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine, SessionLocal, IS_SQLITE
from app.seed import seed_demo_data
from app.routers import auth, dashboard, kyc, clients, funds, margin, watchdog

# On SQLite (local dev / quick demos) it's convenient for the app to just
# create any missing tables on startup. On Postgres, Alembic is the single
# source of truth for the schema (see backend/alembic/) -- run
# `alembic upgrade head` to create/update tables there instead. Letting both
# create_all() and Alembic manage the same Postgres database would fight
# each other, so create_all() only runs for SQLite.
if IS_SQLITE:
    Base.metadata.create_all(bind=engine)

with SessionLocal() as db:
    seed_demo_data(db)

app = FastAPI(title="BrokerVerse API")

# --- CORS -------------------------------------------------------------
# CORS (Cross-Origin Resource Sharing) is the browser-side rule that decides
# whether JavaScript running on one origin (your frontend's domain) is
# allowed to call an API on a different origin (your backend's domain). By
# default browsers block that unless the API explicitly says "this origin is
# allowed" in its response headers -- that's what CORSMiddleware adds.
#
# CORS_ORIGINS is a comma-separated allowlist of frontend URLs that may call
# this API, e.g. "https://brokerverse.vercel.app,https://www.mydomain.com".
# It always includes localhost dev ports so `npm run dev` keeps working
# without extra setup. Avoid "*" (allow every origin) once real user data is
# involved -- it defeats the purpose of the allowlist.
DEFAULT_DEV_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

cors_origins_env = os.environ.get("CORS_ORIGINS", "")
configured_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]
origins = sorted(set(configured_origins) | set(DEFAULT_DEV_ORIGINS)) if configured_origins != ["*"] else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(kyc.router)
app.include_router(clients.router)
app.include_router(funds.router)
app.include_router(margin.router)
app.include_router(watchdog.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "BrokerVerse API"}


@app.get("/")
def root():
    return {"message": "BrokerVerse API is running. See /docs for the API reference."}
