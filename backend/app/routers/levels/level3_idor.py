from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.crud import idor as crud_idor
from app.models.User import User
from app.schemas.idor import IdorProfileSchema

router = APIRouter()


@router.get("/levels/3/my-profile", response_model=IdorProfileSchema)
async def idor_my_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await crud_idor.ensure_seeded(db)
    profile = await crud_idor.get_profile_by_username(db, "john_doe")
    if not profile:
        raise HTTPException(status_code=500, detail="Profile seed failed")
    return profile


@router.get("/levels/3/profile/{profile_id}", response_model=IdorProfileSchema)
async def idor_get_profile(
    profile_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await crud_idor.ensure_seeded(db)
    profile = await crud_idor.get_profile(db, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.post("/levels/3/reset", status_code=204)
async def idor_reset(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await crud_idor.reset_profiles(db)
