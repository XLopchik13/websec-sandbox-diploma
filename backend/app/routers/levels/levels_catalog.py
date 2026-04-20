from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.crud import levels_catalog
from app.models.User import User
from app.schemas.level import LevelSchema

router = APIRouter()


@router.get("/levels", response_model=list[LevelSchema])
async def get_levels(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await levels_catalog.get_all(db)
