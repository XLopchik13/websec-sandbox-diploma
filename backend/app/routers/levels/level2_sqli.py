from typing import Any, Dict, List

from fastapi import APIRouter, Depends
from sqlalchemy import delete, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.SqliAccount import SqliAccount
from app.models.User import User

router = APIRouter()

_SEED = [
    {"username": "alice", "role": "user"},
    {"username": "bob", "role": "user"},
    {"username": "charlie", "role": "user"},
    {"username": "admin", "role": "admin"},
]


async def _ensure_seeded(db: AsyncSession) -> None:
    result = await db.execute(text("SELECT COUNT(*) FROM sqli_accounts"))
    count = result.scalar()
    if count == 0:
        db.add_all([SqliAccount(username=r["username"], role=r["role"]) for r in _SEED])
        await db.commit()


@router.get("/levels/2/search", response_model=List[Dict[str, Any]])
async def sqli_search(
    username: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _ensure_seeded(db)
    query = text(f"SELECT id, username, role FROM sqli_accounts WHERE username = '{username}'")
    result = await db.execute(query)
    return [dict(row) for row in result.mappings().all()]


@router.post("/levels/2/reset")
async def sqli_reset(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await db.execute(delete(SqliAccount))
    db.add_all([SqliAccount(username=r["username"], role=r["role"]) for r in _SEED])
    await db.commit()
    return {"message": "Level reset"}
