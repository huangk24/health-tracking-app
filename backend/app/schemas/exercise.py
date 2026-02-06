from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict


class ExerciseEntryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    calories_burned: float = Field(..., gt=0)
    date: date


class ExerciseEntryUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    calories_burned: float | None = Field(None, gt=0)


class ExerciseEntryResponse(BaseModel):
    id: int
    user_id: int
    name: str
    calories_burned: float
    date: date
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
