from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.crud import idor as crud_idor
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


@router.get("/levels/3/my-profile")
async def idor_my_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = await crud_idor.get_my_profile(db)
    if not profile:
        await crud_idor.reset_profiles(db)
        profile = await crud_idor.get_my_profile(db)
    if not profile:
        raise HTTPException(status_code=500, detail="Profile seed failed")
    return {
        "id": profile.id,
        "username": profile.username,
        "email": profile.email,
        "phone": profile.phone,
        "role": profile.role,
        "secret_note": profile.secret_note,
    }


@router.get("/levels/3/profile/{profile_id}")
async def idor_get_profile(
    profile_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = await crud_idor.get_profile(db, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {
        "id": profile.id,
        "username": profile.username,
        "email": profile.email,
        "phone": profile.phone,
        "role": profile.role,
        "secret_note": profile.secret_note,
    }


@router.post("/levels/3/reset")
async def idor_reset(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await crud_idor.reset_profiles(db)
    return {"message": "Profiles reset"}
