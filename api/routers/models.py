from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from api.database import get_db
from api.models import ModelPromotion
from api.schemas import ModelPromotionResponse, ModelPromotionCreate
from api.auth import verify_api_key
from api.sse_manager import sse_manager

router = APIRouter(prefix="/models", tags=["Models"])


@router.get("", response_model=List[ModelPromotionResponse])
async def list_model_promotions(
    model_name: Optional[str] = Query(None, description="Filter by model name"),
    decision: Optional[str] = Query(None, description="Filter by decision (GREEN/YELLOW/RED)"),
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ModelPromotion).order_by(desc(ModelPromotion.promoted_at)).limit(limit)
    if model_name:
        stmt = stmt.where(ModelPromotion.model_name == model_name)
    if decision:
        stmt = stmt.where(ModelPromotion.decision == decision)

    res = await db.execute(stmt)
    return res.scalars().all()


@router.get("/{promotion_id}", response_model=ModelPromotionResponse)
async def get_model_promotion(promotion_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(ModelPromotion).where(ModelPromotion.id == promotion_id))
    mp = res.scalars().first()
    if not mp:
        raise HTTPException(status_code=404, detail="Model promotion not found")
    return mp


@router.post("", response_model=ModelPromotionResponse, dependencies=[Depends(verify_api_key)])
async def create_model_promotion(payload: ModelPromotionCreate, db: AsyncSession = Depends(get_db)):
    mp = ModelPromotion(**payload.model_dump())
    db.add(mp)
    await db.commit()
    await db.refresh(mp)

    await sse_manager.broadcast("model_promotion_update", {"id": mp.id, "model_name": mp.model_name, "decision": mp.decision})
    return mp
