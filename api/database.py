import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from api.config import settings

# If DATABASE_URL starts with libsql:// or sqlite://, adjust for async SQLAlchemy
db_url = settings.DATABASE_URL
if db_url.startswith("libsql://") or db_url.startswith("https://"):
    # When using Turso/libsql with SQLAlchemy async, we use sqlite+aiosqlite or custom driver if local
    # For compatibility across Vercel serverless and Turso, we ensure valid async engine connection string
    db_url = db_url.replace("libsql://", "sqlite+aiosqlite:///")
elif db_url.startswith("sqlite://") and not db_url.startswith("sqlite+aiosqlite://"):
    db_url = db_url.replace("sqlite://", "sqlite+aiosqlite://")

# Ensure directory exists for local SQLite
if ":///" in db_url and "aiosqlite" in db_url:
    path = db_url.split(":///")[1]
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


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
