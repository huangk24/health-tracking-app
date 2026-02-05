from pydantic import BaseModel, ConfigDict
from datetime import date
from enum import Enum


class MealType(str, Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"
    IN_BETWEEN = "in_between"


class FoodItemCreate(BaseModel):
    name: str
    serving_size: str
    calories: float
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    fiber_g: float = 0
    sodium_mg: float = 0


class FoodItemResponse(BaseModel):
    id: int
    name: str
    serving_size: str
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    sodium_mg: float

    model_config = ConfigDict(from_attributes=True)


class CalorieEntryCreate(BaseModel):
    food_item_id: int
    quantity: float = 1.0
    unit: str = "serving"
    meal_type: MealType


class CalorieEntryResponse(BaseModel):
    id: int
    food_item_id: int
    quantity: float
    unit: str
    meal_type: MealType
    date: date
    food_item: FoodItemResponse

    model_config = ConfigDict(from_attributes=True)


class NutritionTotals(BaseModel):
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    sodium_mg: float


class MealSummary(BaseModel):
    meal_type: MealType
    entries: list[CalorieEntryResponse]
    totals: NutritionTotals


class DailyNutritionSummary(BaseModel):
    date: date
    goals: NutritionTotals
    actual_intake: NutritionTotals
    actual_consumption: NutritionTotals  # from activities
    remaining: NutritionTotals  # goals - actual_intake - actual_consumption
    meals: list[MealSummary]
