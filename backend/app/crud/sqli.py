from typing import Any

from sqlalchemy import delete, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.SqliAccount import SqliAccount

_SEED = [
    {"username": "a.ivanova", "role": "user"},
    {"username": "d.smirnov", "role": "user"},
    {"username": "e.kuznetsova", "role": "user"},
    {"username": "m.popov", "role": "user"},
    {"username": "n.sokolova", "role": "user"},
    {"username": "p.volkov", "role": "user"},
    {"username": "o.lebedeva", "role": "user"},
    {"username": "s.morozov", "role": "user"},
    {"username": "t.novikova", "role": "user"},
    {"username": "v.kozlov", "role": "user"},
    {"username": "hr.manager", "role": "moderator"},
    {"username": "it.support", "role": "moderator"},
    {"username": "sysadmin", "role": "admin"},
]


async def ensure_seeded(db: AsyncSession) -> None:
    result = await db.execute(text("SELECT COUNT(*) FROM sqli_accounts"))
    if result.scalar() != len(_SEED):
        await db.execute(delete(SqliAccount))
        db.add_all([SqliAccount(username=r["username"], role=r["role"]) for r in _SEED])
        await db.commit()


async def get_all_accounts(db: AsyncSession) -> list[dict[str, Any]]:
    result = await db.execute(text("SELECT id, username, role FROM sqli_accounts ORDER BY id"))
    return [dict(row) for row in result.mappings().all()]


async def search_accounts(db: AsyncSession, username: str) -> list[dict[str, Any]]:
    query = text(f"SELECT id, username, role FROM sqli_accounts WHERE username LIKE '%{username}%'")
    result = await db.execute(query)
    return [dict(row) for row in result.mappings().all()]


async def reset_accounts(db: AsyncSession) -> None:
    await db.execute(delete(SqliAccount))
    db.add_all([SqliAccount(username=r["username"], role=r["role"]) for r in _SEED])
    await db.commit()
