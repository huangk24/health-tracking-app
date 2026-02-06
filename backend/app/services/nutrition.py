from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session

from app.models.food_entry import CalorieEntry, MealType
from app.models.exercise import ExerciseEntry
from app.schemas.food_entry import (
    NutritionTotals,
    MealSummary,
    DailyNutritionSummary,
)


class NutritionService:
    # Default daily nutrition goals (can be personalized later based on user profile)
    DEFAULT_GOALS = {
        "calories": 2000,
        "protein_g": 150,
        "carbs_g": 250,
        "fat_g": 65,
        "fiber_g": 25,
        "sodium_mg": 2300,
    }

    @staticmethod
    def calculate_daily_nutrition(
        user_id: int, target_date: date, db: Session
    ) -> DailyNutritionSummary:
        """Calculate daily nutrition summary for a user"""
        # Get all entries for the day
        entries = (
            db.query(CalorieEntry)
            .filter(
                CalorieEntry.user_id == user_id,
                CalorieEntry.date == target_date,
            )
            .all()
        )

        # Get all exercise entries for the day
        exercises = (
            db.query(ExerciseEntry)
            .filter(
                ExerciseEntry.user_id == user_id,
                ExerciseEntry.date == target_date,
            )
            .all()
        )

        # Group entries by meal type
        meals_by_type = {}
        for meal_type in MealType:
            meals_by_type[meal_type] = [
                e for e in entries if e.meal_type == meal_type
            ]

        # Calculate totals
        actual_intake = NutritionService._calculate_totals(entries)
        # Build meals summary
        meals = []
        for meal_type in MealType:
            meal_entries = meals_by_type[meal_type]
            if meal_entries:
                meal_totals = NutritionService._calculate_totals(meal_entries)
                meals.append(
                    MealSummary(
                        meal_type=meal_type,
                        entries=meal_entries,
                        totals=meal_totals,
                    )
                )

        # Calculate exercise consumption
        total_calories_burned = ExerciseEntry.get_total_calories_burned(exercises)
        actual_consumption = NutritionTotals(
            calories=total_calories_burned,
            protein_g=0,
            carbs_g=0,
            fat_g=0,
            fiber_g=0,
            sodium_mg=0,
        )

        # Calculate goals and remaining
        goals = NutritionTotals(**NutritionService.DEFAULT_GOALS)

        remaining = NutritionTotals(
            calories=max(
                0, goals.calories - actual_intake.calories + actual_consumption.calories
            ),
            protein_g=max(
                0, goals.protein_g - actual_intake.protein_g + actual_consumption.protein_g
            ),
            carbs_g=max(
                0, goals.carbs_g - actual_intake.carbs_g + actual_consumption.carbs_g
            ),
            fat_g=max(
                0, goals.fat_g - actual_intake.fat_g + actual_consumption.fat_g
            ),
            fiber_g=max(
                0, goals.fiber_g - actual_intake.fiber_g + actual_consumption.fiber_g
            ),
            sodium_mg=max(
                0,
                goals.sodium_mg
                - actual_intake.sodium_mg
                + actual_consumption.sodium_mg,
            ),
        )

        # Convert exercises to dicts for serialization
        exercise_dicts = [
            {
                "id": ex.id,
                "user_id": ex.user_id,
                "name": ex.name,
                "calories_burned": ex.calories_burned,
                "date": ex.date.isoformat(),
                "created_at": ex.created_at.isoformat(),
                "updated_at": ex.updated_at.isoformat(),
            }
            for ex in exercises
        ]

        return DailyNutritionSummary(
            date=target_date,
            goals=goals,
            actual_intake=actual_intake,
            actual_consumption=actual_consumption,
            remaining=remaining,
            meals=meals,
            exercises=exercise_dicts,
        )

    @staticmethod
    def _calculate_totals(entries: list[CalorieEntry]) -> NutritionTotals:
        """Calculate nutrition totals from a list of entries"""
        totals = {
            "calories": 0,
            "protein_g": 0,
            "carbs_g": 0,
            "fat_g": 0,
            "fiber_g": 0,
            "sodium_mg": 0,
        }

        for entry in entries:
            entry_totals = entry.get_totals()
            for key in totals:
                totals[key] += entry_totals[key]

        return NutritionTotals(**totals)
