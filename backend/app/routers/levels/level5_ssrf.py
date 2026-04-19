from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.crud import ssrf as crud_ssrf
from app.models.User import User

router = APIRouter()


class FetchRequest(BaseModel):
    url: str


@router.post("/levels/5/fetch")
async def fetch_url(
    body: FetchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await crud_ssrf.fetch_url(body.url)
