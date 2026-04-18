from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.crud import idor as crud_idor
from app.models.IdorProfile import IdorProfile
from app.models.User import User

router = APIRouter()


def _profile_dict(p: IdorProfile) -> dict:
    return {
        "id": p.id,
        "username": p.username,
        "email": p.email,
        "phone": p.phone,
        "role": p.role,
        "secret_note": p.secret_note,
    }


@router.get("/levels/3/my-profile")
async def idor_my_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await crud_idor.ensure_seeded(db)
    profile = await crud_idor.get_profile_by_username(db, "john_doe")
    if not profile:
        raise HTTPException(status_code=500, detail="Profile seed failed")
    return _profile_dict(profile)


@router.get("/levels/3/profile/{profile_id}")
async def idor_get_profile(
    profile_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await crud_idor.ensure_seeded(db)
    profile = await crud_idor.get_profile(db, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return _profile_dict(profile)


@router.post("/levels/3/reset")
async def idor_reset(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await crud_idor.reset_profiles(db)
    return {"message": "Level reset"}
