from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from datetime import date, datetime
from typing import Optional

from app.database import get_db
from app.schemas.food_entry import (
    FoodItemCreate,
    FoodItemResponse,
    CalorieEntryCreate,
    CalorieEntryResponse,
    DailyNutritionSummary,
)
from app.models.food_entry import FoodItem, CalorieEntry
from app.models.user import User
from app.services.nutrition import NutritionService
from app.services.auth import decode_token
from app.services.user import get_user_by_username

router = APIRouter(prefix="/nutrition", tags=["nutrition"])


def get_current_user(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
) -> User:
    """Extract current user from Bearer token"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid auth scheme")
        username = decode_token(token)
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )
        user = get_user_by_username(db, username)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )
        return user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


@router.get("/daily", response_model=DailyNutritionSummary)
def get_daily_nutrition(
    date_param: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get daily nutrition summary for a user"""
    target_date = date.fromisoformat(date_param) if date_param else date.today()
    return NutritionService.calculate_daily_nutrition(user.id, target_date, db)


@router.post("/entries", response_model=CalorieEntryResponse)
def create_calorie_entry(
    entry_data: CalorieEntryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Create a new calorie entry"""
    # Verify food item exists
    food_item = db.query(FoodItem).filter(FoodItem.id == entry_data.food_item_id).first()
    if not food_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food item not found",
        )

    entry = CalorieEntry(
        user_id=user.id,
        food_item_id=entry_data.food_item_id,
        quantity=entry_data.quantity,
        unit=entry_data.unit,
        meal_type=entry_data.meal_type,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/food-items", response_model=list[FoodItemResponse])
def get_food_items(db: Session = Depends(get_db)):
    """Get all available food items"""
    return db.query(FoodItem).all()


@router.post("/food-items", response_model=FoodItemResponse)
def create_food_item(
    food_data: FoodItemCreate,
    db: Session = Depends(get_db),
):
    """Create a new food item"""
    food_item = FoodItem(**food_data.dict())
    db.add(food_item)
    db.commit()
    db.refresh(food_item)
    return food_item
