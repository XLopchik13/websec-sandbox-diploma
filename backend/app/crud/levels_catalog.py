from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.Level import Level


async def count(db: AsyncSession) -> int:
    result = await db.execute(select(func.count()).select_from(Level))
    return result.scalar_one()


async def get_all(db: AsyncSession) -> list[Level]:
    result = await db.execute(select(Level).order_by(Level.id))
    return list(result.scalars().all())
