from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from api.database import get_db
from api.models import GatekeeperReport
from api.schemas import GatekeeperReportResponse, GatekeeperReportCreate
from api.auth import verify_api_key
from api.sse_manager import sse_manager

router = APIRouter(prefix="/gatekeeper", tags=["Gatekeeper Reports"])


@router.get("", response_model=List[GatekeeperReportResponse])
async def list_gatekeeper_reports(
    traffic_light: Optional[str] = Query(None, description="Filter by status (GREEN/YELLOW/RED)"),
    repo: Optional[str] = Query(None, description="Filter by repository"),
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(GatekeeperReport).order_by(desc(GatekeeperReport.created_at)).limit(limit)
    if traffic_light:
        stmt = stmt.where(GatekeeperReport.traffic_light == traffic_light)
    if repo:
        stmt = stmt.where(GatekeeperReport.repo == repo)

    res = await db.execute(stmt)
    return res.scalars().all()


@router.get("/{report_id}", response_model=GatekeeperReportResponse)
async def get_gatekeeper_report(report_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(GatekeeperReport).where(GatekeeperReport.id == report_id))
    report = res.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Gatekeeper report not found")
    return report


@router.post("", response_model=GatekeeperReportResponse, dependencies=[Depends(verify_api_key)])
async def create_gatekeeper_report(payload: GatekeeperReportCreate, db: AsyncSession = Depends(get_db)):
    grep = GatekeeperReport(**payload.model_dump())
    db.add(grep)
    await db.commit()
    await db.refresh(grep)

    await sse_manager.broadcast("gatekeeper_update", {"id": grep.id, "traffic_light": grep.traffic_light, "pr_number": grep.pr_number})
    return grep
