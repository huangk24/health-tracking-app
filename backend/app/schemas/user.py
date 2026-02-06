from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


class UserRegister(BaseModel):
    """Schema for user registration"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    """Schema for user login"""
    username: str
    password: str


class UserResponse(BaseModel):
    """Schema for user response"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    sex: Optional[str] = None
    age: Optional[int] = None
    height: Optional[int] = None
    weight: Optional[int] = None
    goal: Optional[str] = None


class UserUpdate(BaseModel):
    """Schema for user profile update"""
    sex: Optional[str] = None
    age: Optional[int] = None
    height: Optional[int] = None  # in cm
    weight: Optional[int] = None  # in kg
    goal: Optional[str] = None  # lose, maintain, gain


class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Schema for token data"""
    username: Optional[str] = None
