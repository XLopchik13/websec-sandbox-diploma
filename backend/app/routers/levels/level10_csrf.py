from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.crud import csrf as crud
from app.models.User import User
from app.schemas.csrf import AccountResponse, TransferRequest, TransferResponse

router = APIRouter()


@router.get("/levels/10/account", response_model=AccountResponse)
async def get_account(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = await crud.get_or_create_account(db, current_user.id)
    return AccountResponse(
        balance=account.balance,
        last_transfer_to=account.last_transfer_to,
        last_transfer_amount=account.last_transfer_amount,
    )


@router.post("/levels/10/transfer", response_model=TransferResponse)
async def transfer(
    body: TransferRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = await crud.transfer(db, current_user.id, body.amount, body.to)
    return TransferResponse(
        success=True,
        balance=account.balance,
        message=f"Переведено {body.amount} ₽ → {body.to}",
    )


@router.post("/levels/10/reset", status_code=204)
async def reset_account(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await crud.reset_account(db, current_user.id)
