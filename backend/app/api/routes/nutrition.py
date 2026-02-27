from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
from sqlalchemy.orm import Session
from datetime import date, datetime
from typing import Optional

from app.database import get_db
from app.schemas.food_entry import (
    FoodItemCreate,
    FoodItemResponse,
    CalorieEntryCreate,
    CalorieEntryUpdate,
    CalorieEntryResponse,
    DailyNutritionSummary,
    UsdaFoodSearchResponse,
    UsdaFoodSearchResult,
    UsdaFoodCreate,
)
from app.schemas.custom_food import CustomFoodCreate, CustomFoodResponse
from app.models.food_entry import FoodItem, CalorieEntry
from app.models.custom_food import CustomFood
from app.models.user import User
from app.services.nutrition import NutritionService
from app.services.auth import decode_token
from app.services.user import get_user_by_username
from app.services.usda import UsdaService
from app.utils.time import pst_today

router = APIRouter(prefix="/nutrition", tags=["nutrition"])


def get_current_user(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
) -> User:
    """Extract current user from Bearer token for request auth."""
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
    date_param: Optional[str] = Query(default=None, alias="date"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get daily nutrition summary for a user"""
    target_date = date.fromisoformat(date_param) if date_param else pst_today()
    return NutritionService.calculate_daily_nutrition(user.id, target_date, db, user)



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
        date=entry_data.date or pst_today(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.patch("/entries/{entry_id}", response_model=CalorieEntryResponse)
def update_calorie_entry(
    entry_id: int,
    entry_data: CalorieEntryUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Update an existing calorie entry"""
    entry = (
        db.query(CalorieEntry)
        .filter(CalorieEntry.id == entry_id, CalorieEntry.user_id == user.id)
        .first()
    )
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calorie entry not found",
        )

    if entry_data.quantity is not None:
        if entry_data.quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity must be positive",
            )
        entry.quantity = entry_data.quantity
    if entry_data.unit is not None:
        entry.unit = entry_data.unit
    if entry_data.meal_type is not None:
        entry.meal_type = entry_data.meal_type

    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_calorie_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Delete a calorie entry"""
    entry = (
        db.query(CalorieEntry)
        .filter(CalorieEntry.id == entry_id, CalorieEntry.user_id == user.id)
        .first()
    )
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calorie entry not found",
        )
    db.delete(entry)
    db.commit()
    return None


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
    food_item = FoodItem(**food_data.model_dump())
    db.add(food_item)
    db.commit()
    db.refresh(food_item)
    return food_item


@router.get("/usda/search", response_model=UsdaFoodSearchResponse)
def search_usda_foods(query: str):
    """Search USDA FoodData Central"""
    data = UsdaService.search_foods(query=query)
    results = []
    for food in data.get("foods", []):
        results.append(
            UsdaFoodSearchResult(
                fdc_id=food.get("fdcId"),
                description=food.get("description") or "",
                brand_name=food.get("brandName"),
                data_type=food.get("dataType"),
                serving_size=food.get("servingSize"),
                serving_size_unit=food.get("servingSizeUnit"),
            )
        )
    return UsdaFoodSearchResponse(results=results)


@router.post("/food-items/usda", response_model=FoodItemResponse)
def create_food_item_from_usda(
    food_data: UsdaFoodCreate,
    db: Session = Depends(get_db),
):
    """Create a food item from USDA FoodData Central"""
    existing = (
        db.query(FoodItem)
        .filter(
            FoodItem.source == "usda",
            FoodItem.external_id == str(food_data.fdc_id),
        )
        .first()
    )
    if existing:
        return existing

    food = UsdaService.get_food(food_data.fdc_id)
    nutrients = UsdaService.extract_nutrients(food)
    serving_size_grams = UsdaService.get_serving_size_grams(food) or 100.0
    nutrients = UsdaService.normalize_per_100g(nutrients, serving_size_grams)

    food_item = FoodItem(
        name=food.get("description") or "USDA Food",
        serving_size="100 g",
        serving_size_grams=100.0,
        source="usda",
        external_id=str(food_data.fdc_id),
        calories=nutrients["calories"],
        protein_g=nutrients["protein_g"],
        carbs_g=nutrients["carbs_g"],
        fat_g=nutrients["fat_g"],
        fiber_g=nutrients["fiber_g"],
        sodium_mg=nutrients["sodium_mg"],
    )
    db.add(food_item)
    db.commit()
    db.refresh(food_item)
    return food_item


@router.get("/custom-foods", response_model=list[CustomFoodResponse])
def get_custom_foods(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get all custom foods for the current user"""
    custom_foods = (
        db.query(CustomFood)
        .filter(CustomFood.user_id == user.id)
        .order_by(CustomFood.name)
        .all()
    )
    return custom_foods


@router.post("/custom-foods", response_model=CustomFoodResponse)
def create_custom_food(
    food_data: CustomFoodCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Create a new custom food for the current user"""
    custom_food = CustomFood(
        user_id=user.id,
        name=food_data.name,
        unit=food_data.unit,
        reference_amount=food_data.reference_amount,
        calories=food_data.calories,
        protein_g=food_data.protein_g,
        carbs_g=food_data.carbs_g,
        fat_g=food_data.fat_g,
        fiber_g=food_data.fiber_g,
        sodium_mg=food_data.sodium_mg,
    )
    db.add(custom_food)
    db.commit()
    db.refresh(custom_food)
    return custom_food


@router.put("/custom-foods/{food_id}", response_model=CustomFoodResponse)
def update_custom_food(
    food_id: int,
    food_data: CustomFoodCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Update an existing custom food"""
    custom_food = (
        db.query(CustomFood)
        .filter(CustomFood.id == food_id, CustomFood.user_id == user.id)
        .first()
    )
    if not custom_food:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Custom food not found",
        )

    custom_food.name = food_data.name
    custom_food.unit = food_data.unit
    custom_food.reference_amount = food_data.reference_amount
    custom_food.calories = food_data.calories
    custom_food.protein_g = food_data.protein_g
    custom_food.carbs_g = food_data.carbs_g
    custom_food.fat_g = food_data.fat_g
    custom_food.fiber_g = food_data.fiber_g
    custom_food.sodium_mg = food_data.sodium_mg

    db.commit()
    db.refresh(custom_food)
    return custom_food


@router.delete("/custom-foods/{food_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_custom_food(
    food_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Delete a custom food"""
    custom_food = (
        db.query(CustomFood)
        .filter(CustomFood.id == food_id, CustomFood.user_id == user.id)
        .first()
    )
    if not custom_food:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Custom food not found",
        )
    db.delete(custom_food)
    db.commit()
    return None
