from datetime import datetime
from enum import Enum
from pydantic import BaseModel, ConfigDict


class MealType(str, Enum):
    """Meal type enumeration."""
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"
    IN_BETWEEN = "in_between"


class FoodItemBase(BaseModel):
    """Base food item schema."""
    name: str
    serving_size: str = "100g"
    calories: float
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    fiber_g: float = 0
    sodium_mg: float = 0


class FoodItemCreate(FoodItemBase):
    """Schema for creating a food item."""
    pass


class FoodItemResponse(FoodItemBase):
    """Schema for returning food item data."""
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CalorieEntryBase(BaseModel):
    """Base calorie entry schema."""
    food_item_id: int
    meal_type: MealType
    quantity: float
    unit: str = "serving"


class CalorieEntryCreate(CalorieEntryBase):
    """Schema for creating a calorie entry."""
    pass


class CalorieEntryResponse(CalorieEntryBase):
    """Schema for returning calorie entry with food details."""
    id: int
    user_id: int
    date: datetime
    created_at: datetime
    food_item: FoodItemResponse

    model_config = ConfigDict(from_attributes=True)


class NutritionTotals(BaseModel):
    """Nutrition totals for a meal or day."""
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    sodium_mg: float


class MealSummary(BaseModel):
    """Summary of a meal with its entries."""
    meal_type: MealType
    entries: list[CalorieEntryResponse]
    totals: NutritionTotals


class DailyNutritionSummary(BaseModel):
    """Daily nutrition summary with goals and remaining nutrients."""
    date: datetime
    goals: NutritionTotals  # Daily calorie/macro goals
    actual_intake: NutritionTotals  # What was logged
    actual_consumption: NutritionTotals  # From activities (placeholder)
    remaining: NutritionTotals  # goals - actual_intake - actual_consumption
    meals: list[MealSummary]
