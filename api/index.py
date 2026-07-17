from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.config import settings
from api.database import init_db, AsyncSessionLocal
from api.seed_data import seed_if_empty
from api.routers import webhooks, pipelines, deployments, models, gatekeeper, metrics


import traceback

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB and run seeder on startup gracefully without failing Vercel lambda cold boot
    try:
        await init_db()
        async with AsyncSessionLocal() as session:
            await seed_if_empty(session)
    except Exception as e:
        print(f"⚠️ Lifespan database/seeding notice: {e}", flush=True)
        traceback.print_exc()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API & SSE stream for the Traffic Light Governance MLOps Observability Platform.",
    lifespan=lifespan
)

# CORS configuration allowing GitHub Pages, Vercel & localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in settings.ALLOWED_ORIGINS else settings.ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.github\.io|https://.*\.vercel\.app|http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=False if "*" in settings.ALLOWED_ORIGINS else True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under /api/v1
app.include_router(webhooks.router, prefix="/api/v1")
app.include_router(pipelines.router, prefix="/api/v1")
app.include_router(deployments.router, prefix="/api/v1")
app.include_router(models.router, prefix="/api/v1")
app.include_router(gatekeeper.router, prefix="/api/v1")
app.include_router(metrics.router, prefix="/api/v1")


@app.get("/", tags=["Health"])
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "healthy",
        "docs_url": "/docs",
        "sse_stream_url": "/api/v1/metrics/events/stream"
    }
