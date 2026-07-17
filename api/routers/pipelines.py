from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from api.database import get_db
from api.models import PipelineRun, SecurityScan
from api.schemas import PipelineRunResponse, PipelineRunCreate
from api.auth import verify_api_key
from api.sse_manager import sse_manager

router = APIRouter(prefix="/pipelines", tags=["Pipelines"])


@router.get("", response_model=List[PipelineRunResponse])
async def list_pipelines(
    workflow_name: Optional[str] = Query(None, description="Filter by workflow name"),
    status: Optional[str] = Query(None, description="Filter by status (success/failed/running)"),
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(PipelineRun).order_by(desc(PipelineRun.started_at)).limit(limit)
    if workflow_name:
        stmt = stmt.where(PipelineRun.workflow_name == workflow_name)
    if status:
        stmt = stmt.where(PipelineRun.status == status)

    res = await db.execute(stmt)
    return res.scalars().all()


@router.get("/{run_id}", response_model=PipelineRunResponse)
async def get_pipeline(run_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(PipelineRun).where(PipelineRun.id == run_id))
    prun = res.scalars().first()
    if not prun:
        raise HTTPException(status_code=404, detail="Pipeline run not found")
    return prun


@router.post("", response_model=PipelineRunResponse, dependencies=[Depends(verify_api_key)])
async def create_pipeline(payload: PipelineRunCreate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(PipelineRun).where(PipelineRun.run_id == payload.run_id))
    existing = res.scalars().first()
    if existing:
        for k, v in payload.model_dump(exclude_unset=True).items():
            if v is not None:
                setattr(existing, k, v)
        prun = existing
    else:
        prun = PipelineRun(**payload.model_dump())
        db.add(prun)
    await db.commit()
    await db.refresh(prun)

    await sse_manager.broadcast("pipeline_update", {"id": prun.id, "status": prun.status})
    return prun
