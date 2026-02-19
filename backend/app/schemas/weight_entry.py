from pydantic import BaseModel, Field
from datetime import date
from typing import Optional


class WeightEntryCreate(BaseModel):
    """Schema for creating a weight entry"""
    date: date
    weight: float = Field(..., gt=0, description="Weight in kg")


class WeightEntryResponse(BaseModel):
    """Schema for weight entry response"""
    id: int
    user_id: int
    date: date
    weight: float

    class Config:
        from_attributes = True


class WeightTrendData(BaseModel):
    """Schema for weight trend analytics"""
    date: date
    weight: float
    change: Optional[float] = None  # Change from previous entry

    class Config:
        from_attributes = True
