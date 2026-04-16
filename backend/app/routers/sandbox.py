from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.User import User
from app.models.UserProgress import UserProgress

router = APIRouter(prefix="/sandbox", tags=["sandbox"])


@router.get("/progress", response_model=List[str])
async def get_progress(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(UserProgress.level_id).where(UserProgress.user_id == current_user.id)
    result = await db.execute(query)
    return [row[0] for row in result.all()]


@router.post("/progress/{level_id}")
async def complete_level(
    level_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(UserProgress).where(
        UserProgress.user_id == current_user.id, UserProgress.level_id == level_id
    )
    result = await db.execute(query)
    if result.scalar_one_or_none():
        return {"message": "Level already completed"}

    new_progress = UserProgress(user_id=current_user.id, level_id=level_id)
    db.add(new_progress)
    await db.commit()
    return {"message": "Level completed"}


@router.delete("/progress")
async def reset_progress(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = delete(UserProgress).where(UserProgress.user_id == current_user.id)
    await db.execute(query)
    await db.commit()
    return {"message": "Progress reset"}
