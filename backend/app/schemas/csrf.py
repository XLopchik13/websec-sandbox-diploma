from pydantic import BaseModel


class TransferRequest(BaseModel):
    amount: int
    to: str


class AccountResponse(BaseModel):
    balance: int
    last_transfer_to: str | None = None
    last_transfer_amount: int | None = None


class TransferResponse(BaseModel):
    success: bool
    balance: int
    message: str
