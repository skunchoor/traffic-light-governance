import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from api.config import settings

# If DATABASE_URL starts with libsql:// or sqlite://, adjust for async SQLAlchemy
db_url = settings.DATABASE_URL
if db_url.startswith("libsql://") or db_url.startswith("https://"):
    # If on Vercel and libsql URL is given without custom driver, safely fallback or use /tmp cache
    if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        db_url = "sqlite+aiosqlite:////tmp/backend_data.db"
    else:
        db_url = db_url.replace("libsql://", "sqlite+aiosqlite:///")
elif db_url.startswith("sqlite://") and not db_url.startswith("sqlite+aiosqlite://"):
    db_url = db_url.replace("sqlite://", "sqlite+aiosqlite://")

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
    connect_args={"check_same_thread": False} if "sqlite" in db_url else {}
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()


_db_initialized = False


async def get_db():
    global _db_initialized
    if not _db_initialized:
        await init_db()
        try:
            from api.seed_data import seed_if_empty
            async with AsyncSessionLocal() as seed_session:
                await seed_if_empty(seed_session)
        except Exception as e:
            if settings.DEBUG:
                print(f"Error seeding database on startup: {e}")
        _db_initialized = True

    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
