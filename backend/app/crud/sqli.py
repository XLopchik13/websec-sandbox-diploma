from typing import Any

from sqlalchemy import delete, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.SqliAccount import SqliAccount

_SEED = [
    {"username": "alice", "role": "user"},
    {"username": "bob", "role": "user"},
    {"username": "charlie", "role": "user"},
    {"username": "admin", "role": "admin"},
]


async def ensure_seeded(db: AsyncSession) -> None:
    result = await db.execute(text("SELECT COUNT(*) FROM sqli_accounts"))
    if result.scalar() == 0:
        db.add_all([SqliAccount(username=r["username"], role=r["role"]) for r in _SEED])
        await db.commit()


async def search_accounts(db: AsyncSession, username: str) -> list[dict[str, Any]]:
    query = text(f"SELECT id, username, role FROM sqli_accounts WHERE username = '{username}'")
    result = await db.execute(query)
    return [dict(row) for row in result.mappings().all()]


async def reset_accounts(db: AsyncSession) -> None:
    await db.execute(delete(SqliAccount))
    db.add_all([SqliAccount(username=r["username"], role=r["role"]) for r in _SEED])
    await db.commit()
