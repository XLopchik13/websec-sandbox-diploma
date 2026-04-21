from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.crud import path_traversal as crud
from app.models.User import User

router = APIRouter()


@router.get("/levels/6/file")
async def read_file(
    name: str,
    current_user: User = Depends(get_current_user),
):
    result = crud.read_file(name)
    if not result["found"]:
        return {"found": False, "content": None, "traversal": result["traversal"]}
    return result
