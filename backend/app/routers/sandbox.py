from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.crud import progress as crud_progress
from app.models.User import User

router = APIRouter(prefix="/sandbox", tags=["sandbox"])


@router.get("/progress", response_model=List[str])
async def get_progress(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await crud_progress.get_completed_levels(db, current_user.id)


@router.post("/progress/{level_id}")
async def complete_level(
    level_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    completed = await crud_progress.complete_level(db, current_user.id, level_id)
    if not completed:
        return {"message": "Level already completed"}
    return {"message": "Level completed"}


@router.delete("/progress")
async def reset_progress(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await crud_progress.reset_progress(db, current_user.id)
    return {"message": "Progress reset"}
