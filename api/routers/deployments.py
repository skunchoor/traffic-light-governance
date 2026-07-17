from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from api.database import get_db
from api.models import Deployment
from api.schemas import DeploymentResponse, DeploymentCreate
from api.auth import verify_api_key
from api.sse_manager import sse_manager

router = APIRouter(prefix="/deployments", tags=["Deployments"])


@router.get("", response_model=List[DeploymentResponse])
async def list_deployments(
    environment: Optional[str] = Query(None, description="Filter by environment (staging/production)"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Deployment).order_by(desc(Deployment.deployed_at)).limit(limit)
    if environment:
        stmt = stmt.where(Deployment.environment == environment)
    if status:
        stmt = stmt.where(Deployment.status == status)

    res = await db.execute(stmt)
    return res.scalars().all()


@router.get("/{deployment_id}", response_model=DeploymentResponse)
async def get_deployment(deployment_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Deployment).where(Deployment.id == deployment_id))
    dep = res.scalars().first()
    if not dep:
        raise HTTPException(status_code=404, detail="Deployment not found")
    return dep


@router.post("", response_model=DeploymentResponse, dependencies=[Depends(verify_api_key)])
async def create_deployment(payload: DeploymentCreate, db: AsyncSession = Depends(get_db)):
    dep = Deployment(**payload.model_dump())
    db.add(dep)
    await db.commit()
    await db.refresh(dep)

    await sse_manager.broadcast("deployment_update", {"id": dep.id, "environment": dep.environment, "version": dep.version})
    return dep
