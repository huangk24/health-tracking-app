from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.food_entry import CalorieEntry, FoodItem
from app.services.auth import decode_token
from app.schemas.food_entry import (
    CalorieEntryCreate,
    CalorieEntryResponse,
    FoodItemCreate,
    FoodItemResponse,
    DailyNutritionSummary,
)
from app.services.nutrition import NutritionService

router = APIRouter(prefix="/nutrition", tags=["nutrition"])


def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> User:
    """Dependency to get current authenticated user from Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ")[1]
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/daily", response_model=DailyNutritionSummary)
def get_daily_nutrition(
    date: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get daily nutrition summary for the authenticated user."""
    # Parse date or use today
    if date:
        try:
            target_date = datetime.fromisoformat(date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format")
    else:
        target_date = datetime.utcnow()

    return NutritionService.calculate_daily_nutrition(current_user.id, target_date, db)


@router.post("/entries", response_model=CalorieEntryResponse)
def create_calorie_entry(
    entry: CalorieEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a food entry for the authenticated user."""
    # Verify food item exists
    food_item = db.query(FoodItem).filter(FoodItem.id == entry.food_item_id).first()
    if not food_item:
        raise HTTPException(status_code=404, detail="Food item not found")

    # Create entry
    db_entry = CalorieEntry(
        user_id=current_user.id,
        food_item_id=entry.food_item_id,
        meal_type=entry.meal_type,
        quantity=entry.quantity,
        unit=entry.unit,
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)

    return db_entry


@router.get("/food-items", response_model=list[FoodItemResponse])
def get_food_items(
    db: Session = Depends(get_db),
):
    """Get all available food items."""
    items = db.query(FoodItem).all()
    return items


@router.post("/food-items", response_model=FoodItemResponse)
def create_food_item(
    item: FoodItemCreate,
    db: Session = Depends(get_db),
):
    """Create a new food item (admin only in production)."""
    # Check if already exists
    existing = db.query(FoodItem).filter(FoodItem.name == item.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Food item already exists")

    db_item = FoodItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    return db_item
