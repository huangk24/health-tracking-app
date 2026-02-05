from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.food_entry import CalorieEntry, FoodItem, MealType
from app.schemas.food_entry import (
    NutritionTotals,
    MealSummary,
    DailyNutritionSummary,
    CalorieEntryCreate,
    FoodItemCreate,
)


class NutritionService:
    """Service for nutrition and food entry logic."""

    @staticmethod
    def calculate_daily_nutrition(user_id: int, date: datetime, db: Session) -> DailyNutritionSummary:
        """Calculate daily nutrition summary for a user on a specific date."""
        # Get entries for the date
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)

        entries = db.query(CalorieEntry).filter(
            CalorieEntry.user_id == user_id,
            CalorieEntry.date >= start_of_day,
            CalorieEntry.date < end_of_day,
        ).all()

        # Calculate totals by meal type
        meals_dict = {}
        total_calories = 0
        total_protein = 0
        total_carbs = 0
        total_fat = 0
        total_fiber = 0
        total_sodium = 0

        for entry in entries:
            meal_type = entry.meal_type
            totals = entry.get_totals()

            if meal_type not in meals_dict:
                meals_dict[meal_type] = []
            meals_dict[meal_type].append(entry)

            total_calories += totals["calories"]
            total_protein += totals["protein_g"]
            total_carbs += totals["carbs_g"]
            total_fat += totals["fat_g"]
            total_fiber += totals["fiber_g"]
            total_sodium += totals["sodium_mg"]

        # Default goals (placeholder - should come from user profile)
        daily_goals = NutritionTotals(
            calories=2000,  # Default TDEE
            protein_g=150,
            carbs_g=250,
            fat_g=65,
            fiber_g=25,
            sodium_mg=2300,
        )

        # Actual intake
        actual_intake = NutritionTotals(
            calories=round(total_calories, 2),
            protein_g=round(total_protein, 2),
            carbs_g=round(total_carbs, 2),
            fat_g=round(total_fat, 2),
            fiber_g=round(total_fiber, 2),
            sodium_mg=round(total_sodium, 2),
        )

        # Actual consumption from activities (placeholder)
        actual_consumption = NutritionTotals(
            calories=0,
            protein_g=0,
            carbs_g=0,
            fat_g=0,
            fiber_g=0,
            sodium_mg=0,
        )

        # Calculate remaining
        remaining = NutritionTotals(
            calories=round(daily_goals.calories - actual_intake.calories - actual_consumption.calories, 2),
            protein_g=round(daily_goals.protein_g - actual_intake.protein_g, 2),
            carbs_g=round(daily_goals.carbs_g - actual_intake.carbs_g, 2),
            fat_g=round(daily_goals.fat_g - actual_intake.fat_g, 2),
            fiber_g=round(daily_goals.fiber_g - actual_intake.fiber_g, 2),
            sodium_mg=round(daily_goals.sodium_mg - actual_intake.sodium_mg, 2),
        )

        # Build meal summaries
        meals = []
        for meal_type in MealType:
            if meal_type in meals_dict:
                meal_entries = meals_dict[meal_type]
                meal_totals = calculate_meal_totals(meal_entries)
                meals.append(
                    MealSummary(
                        meal_type=meal_type,
                        entries=meal_entries,
                        totals=meal_totals,
                    )
                )

        return DailyNutritionSummary(
            date=start_of_day,
            goals=daily_goals,
            actual_intake=actual_intake,
            actual_consumption=actual_consumption,
            remaining=remaining,
            meals=meals,
        )


def calculate_meal_totals(entries: list[CalorieEntry]) -> NutritionTotals:
    """Calculate nutrition totals for a set of entries."""
    total_calories = 0
    total_protein = 0
    total_carbs = 0
    total_fat = 0
    total_fiber = 0
    total_sodium = 0

    for entry in entries:
        totals = entry.get_totals()
        total_calories += totals["calories"]
        total_protein += totals["protein_g"]
        total_carbs += totals["carbs_g"]
        total_fat += totals["fat_g"]
        total_fiber += totals["fiber_g"]
        total_sodium += totals["sodium_mg"]

    return NutritionTotals(
        calories=round(total_calories, 2),
        protein_g=round(total_protein, 2),
        carbs_g=round(total_carbs, 2),
        fat_g=round(total_fat, 2),
        fiber_g=round(total_fiber, 2),
        sodium_mg=round(total_sodium, 2),
    )
