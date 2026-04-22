from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.crud import sqli as crud_sqli
from app.models.User import User
from app.schemas.sqli import SqliAccountSchema

router = APIRouter()


@router.get("/levels/2/employees", response_model=list[SqliAccountSchema])
async def sqli_employees(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await crud_sqli.ensure_seeded(db)
    return await crud_sqli.get_all_accounts(db)


@router.get("/levels/2/search", response_model=list[SqliAccountSchema])
async def sqli_search(
    username: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await crud_sqli.ensure_seeded(db)
    return await crud_sqli.search_accounts(db, username)


@router.post("/levels/2/reset", status_code=204)
async def sqli_reset(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await crud_sqli.reset_accounts(db)
