from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from api.database import get_db
from api.schemas import DashboardSummary, DORAMetrics
from api.services.analytics import get_dashboard_summary_data, compute_dora_metrics
from api.sse_manager import sse_manager

router = APIRouter(prefix="/metrics", tags=["Metrics & Events"])


@router.get("/summary", response_model=DashboardSummary)
async def get_summary(db: AsyncSession = Depends(get_db)):
    """
    Returns aggregated metrics, DORA stats, security findings breakdown, and recent activity for the dashboard.
    """
    data = await get_dashboard_summary_data(db)
    return DashboardSummary(**data)


@router.get("/dora", response_model=DORAMetrics)
async def get_dora(db: AsyncSession = Depends(get_db)):
    """
    Returns the 4 Key DORA metrics over the last 30 days.
    """
    data = await compute_dora_metrics(db)
    return DORAMetrics(**data)


@router.get("/events/stream")
async def sse_event_stream(request: Request):
    """
    Server-Sent Events endpoint for real-time dashboard updates (`EventSource`).
    Keeps connection open and streams JSON updates on pipelines, deployments, PRs, and models.
    """
    queue = await sse_manager.connect()

    async def event_generator():
        try:
            # Send initial connected heartbeat
            yield "event: heartbeat\ndata: {\"status\": \"connected\"}\n\n"
            while True:
                if await request.is_disconnected():
                    break
                message = await queue.get()
                yield message
        except Exception:
            pass
        finally:
            sse_manager.disconnect(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
