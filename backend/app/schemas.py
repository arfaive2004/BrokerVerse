import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    full_name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=6)
    broker_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    broker_name: Optional[str] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class MetricsResponse(BaseModel):
    total_brokerage: float
    active_clients: int
    new_clients: int


class TopClientOut(BaseModel):
    rank: int
    name: str
    profit: float
    status: str


class ExpiringClientOut(BaseModel):
    client_id: str
    full_name: str
    kyc_expiry_date: str


class NotifyRequest(BaseModel):
    client_id: str


class FundsResult(BaseModel):
    status: str
    surplus: str
    actual_balance: Optional[str] = None
    required_funds: Optional[str] = None
