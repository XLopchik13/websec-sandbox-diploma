from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.crud import xss as crud_xss
from app.models.User import User
from app.schemas.comment import CommentCreate, CommentRead

router = APIRouter()


@router.post("/levels/1/comments", response_model=CommentRead)
async def create_comment(
    comment_data: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await crud_xss.create_comment(db, current_user.id, "1", comment_data.content)


@router.get("/levels/1/comments", response_model=List[CommentRead])
async def get_comments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await crud_xss.get_comments(db, "1")


@router.delete("/levels/1/comments")
async def delete_comments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await crud_xss.delete_comments(db, "1")
    return {"message": "Comments cleared"}
