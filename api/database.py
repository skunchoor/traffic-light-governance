import os
import re
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from api.config import settings

db_url = settings.DATABASE_URL
connect_args = {}

# Normalize PostgreSQL schemes for asyncpg (Neon, Supabase, Vercel Postgres)
if db_url.startswith("postgres://") or db_url.startswith("postgresql://") or db_url.startswith("postgresql+asyncpg://") or db_url.startswith("postgres+asyncpg://"):
    if not db_url.startswith("postgresql+asyncpg://"):
        db_url = re.sub(r"^postgres(?:ql)?(?:\+asyncpg)?://", "postgresql+asyncpg://", db_url)
    # Strip ALL libpq query parameters (like ?sslmode=require&channel_binding=prefer&options=...)
    # since asyncpg does not accept libpq query string kwargs like channel_binding or sslmode in connect()
    if "?" in db_url:
        db_url = db_url.split("?")[0]
    connect_args = {"ssl": "require"}

# Normalize SQLite schemes
elif db_url.startswith("sqlite://") and not db_url.startswith("sqlite+aiosqlite://"):
    db_url = db_url.replace("sqlite://", "sqlite+aiosqlite://")
    connect_args = {"check_same_thread": False}
elif "sqlite" in db_url:
    connect_args = {"check_same_thread": False}

# Ensure directory exists for local SQLite
if ":///" in db_url and "aiosqlite" in db_url:
    path = db_url.split(":///")[1]
    # On Vercel, force path inside /tmp if it's not already
    if (os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME")) and not path.startswith("/tmp"):
        path = os.path.join("/tmp", os.path.basename(path))
        db_url = f"sqlite+aiosqlite:///{path}"
    dir_name = os.path.dirname(path)
    if dir_name and not os.path.exists(dir_name):
        os.makedirs(dir_name, exist_ok=True)

engine = create_async_engine(
    db_url,
    echo=settings.DEBUG,
    connect_args=connect_args
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()


_db_initialized = False


import traceback


async def get_db():
    global _db_initialized
    if not _db_initialized:
        try:
            await init_db()
            from api.seed_data import seed_if_empty
            async with AsyncSessionLocal() as seed_session:
                await seed_if_empty(seed_session)
            _db_initialized = True
        except Exception as e:
            print(f"⚠️ Lazy DB initialization/seeding error: {e}", flush=True)
            traceback.print_exc()

    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # Auto-migration: safely add new columns to existing tables in PostgreSQL / SQLite
        from sqlalchemy import text
        migration_statements = [
            "ALTER TABLE pipeline_runs ADD COLUMN project VARCHAR DEFAULT 'skunchoor/traffic-light-governance'",
            "ALTER TABLE deployments ADD COLUMN project VARCHAR DEFAULT 'skunchoor/traffic-light-governance'",
            "ALTER TABLE deployments ADD COLUMN component VARCHAR DEFAULT 'Azure Container Registry'",
            "ALTER TABLE model_promotions ADD COLUMN project VARCHAR DEFAULT 'skunchoor/traffic-light-governance'",
            "ALTER TABLE security_scans ADD COLUMN project VARCHAR DEFAULT 'skunchoor/traffic-light-governance'",
            "ALTER TABLE gatekeeper_reports ADD COLUMN project VARCHAR DEFAULT 'skunchoor/traffic-light-governance'"
        ]
        
        is_postgres = "postgres" in str(engine.url)
        for stmt in migration_statements:
            try:
                if is_postgres:
                    stmt_pg = stmt.replace("ADD COLUMN", "ADD COLUMN IF NOT EXISTS")
                    await conn.execute(text(stmt_pg))
                else:
                    await conn.execute(text(stmt))
            except Exception as e:
                err_str = str(e).lower()
                if "already exists" in err_str or "duplicate column" in err_str or "no such column" in err_str:
                    pass
                else:
                    print(f"⚠️ Auto-migration check: {stmt} -> {e}", flush=True)
