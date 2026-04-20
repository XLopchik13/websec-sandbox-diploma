from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.crud import levels_catalog
from app.crud import progress as crud_progress
from app.models.User import User
from app.schemas.progress import ProgressSchema

router = APIRouter(prefix="/sandbox", tags=["sandbox"])


async def _build_progress(db: AsyncSession, user_id: int) -> ProgressSchema:
    completed = await crud_progress.get_completed_levels(db, user_id)
    total = await levels_catalog.count(db)
    return ProgressSchema(completed=completed, total=total)


@router.get("/progress", response_model=ProgressSchema)
async def get_progress(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await _build_progress(db, current_user.id)


@router.post("/progress/{level_id}", response_model=ProgressSchema)
async def complete_level(
    level_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await crud_progress.complete_level(db, current_user.id, level_id)
    return await _build_progress(db, current_user.id)


@router.delete("/progress", status_code=204)
async def reset_progress(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await crud_progress.reset_progress(db, current_user.id)
