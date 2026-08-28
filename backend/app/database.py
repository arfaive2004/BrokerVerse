import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load backend/.env (if present) into the process environment before reading
# any config below, so `uvicorn app.main:app --reload` picks up
# JWT_SECRET_KEY, DATABASE_URL, etc. automatically -- no more remembering to
# `export` them by hand every time. override=False means real environment
# variables (e.g. the ones Vercel injects in production) always win over
# whatever's in a local .env file, and if no .env file exists this is a
# harmless no-op.
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env", override=False)

# Allow overriding with a real Postgres/MySQL database in production via env var.
# Falls back to a local SQLite file for development.
# NOTE: on Vercel's serverless Python runtime the filesystem is ephemeral outside
# of /tmp, and /tmp itself is wiped between cold starts. SQLite works great for
# local dev and demos, but for durable multi-user data in production, set
# DATABASE_URL to a hosted Postgres instance (e.g. Neon, Supabase, Vercel Postgres).
DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    db_dir = "/tmp" if os.environ.get("VERCEL") else os.path.dirname(os.path.abspath(__file__))
    DATABASE_URL = f"sqlite:///{db_dir}/brokerverse.db"

# Some hosts (Heroku-style URLs, some Neon/Supabase copy-paste snippets) hand
# out a "postgres://" URL. SQLAlchemy 1.4+ requires the "postgresql://"
# scheme, so normalize it here rather than making every deployer remember to.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
IS_SQLITE = DATABASE_URL.startswith("sqlite")

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
