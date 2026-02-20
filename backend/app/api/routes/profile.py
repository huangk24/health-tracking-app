from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date, timedelta

from app.database import get_db
from app.models.user import User
from app.models.food_entry import CalorieEntry
from app.models.exercise import ExerciseEntry
from app.schemas.user import UserResponse, UserUpdate
from app.services.auth import decode_token
from app.services.user import get_user_by_username
from app.services.calculations import get_nutrition_goals
from app.utils.time import pst_today
from pydantic import BaseModel

router = APIRouter(prefix="/profile", tags=["profile"])


class NutritionGoalsResponse(BaseModel):
    """Response model for nutrition goals"""
    bmr: int  # Basal Metabolic Rate
    tdee: int  # Total Daily Energy Expenditure
    calories: int  # Daily calorie target based on goal
    protein: int  # Daily protein in grams
    carbs: int  # Daily carbs in grams
    fat: int  # Daily fat in grams
    goal: str  # lose, maintain, or gain


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


@router.get("", response_model=UserResponse)
def get_profile(user: User = Depends(get_current_user)):
    """Get current user's profile"""
    return user


@router.put("", response_model=UserResponse)
def update_profile(
    user_update: UserUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    # Update fields if provided
    if user_update.sex is not None:
        user.sex = user_update.sex
    if user_update.age is not None:
        user.age = user_update.age
    if user_update.height is not None:
        user.height = user_update.height
    if user_update.weight is not None:
        user.weight = user_update.weight
    if user_update.goal is not None:
        # Validate goal value
        if user_update.goal not in ["lose", "maintain", "gain"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Goal must be 'lose', 'maintain', or 'gain'"
            )
        user.goal = user_update.goal

    db.commit()
    db.refresh(user)
    return user


@router.get("/nutrition-goals", response_model=NutritionGoalsResponse)
def get_nutrition_goals_endpoint(user: User = Depends(get_current_user)):
    """Get calculated nutrition goals for the current user"""
    # Check if user has required profile information
    if not all([user.sex, user.age, user.height, user.weight]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please complete your profile (sex, age, height, weight) to see nutrition goals"
        )

    goals = get_nutrition_goals(
        sex=user.sex,
        age=user.age,
        height=user.height,
        weight=user.weight,
        goal=user.goal or "maintain"
    )

    return NutritionGoalsResponse(
        bmr=goals["bmr"],
        tdee=goals["tdee"],
        calories=goals["calories"],
        protein=goals["protein"],
        carbs=goals["carbs"],
        fat=goals["fat"],
        goal=user.goal or "maintain"
    )


class WeeklyAverages(BaseModel):
    """Weekly average nutrition and exercise data"""
    calories: float
    carbs: float
    protein: float
    fats: float
    exercise: float


class WeeklyComparisonResponse(BaseModel):
    """Response model for weekly comparison"""
    current_week: WeeklyAverages
    last_week: WeeklyAverages
    current_week_start: date
    current_week_end: date
    last_week_start: date
    last_week_end: date


@router.get("/weekly-comparison", response_model=WeeklyComparisonResponse)
def get_weekly_comparison(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get weekly comparison of nutrition and exercise data"""
    today = pst_today()

    # Calculate current week (Monday to Sunday)
    current_week_start = today - timedelta(days=today.weekday())  # Monday
    current_week_end = current_week_start + timedelta(days=6)  # Sunday

    # Calculate last week (Monday to Sunday)
    last_week_start = current_week_start - timedelta(days=7)
    last_week_end = last_week_start + timedelta(days=6)

    # Get data for current week
    current_week_data = _calculate_week_averages(
        user.id, current_week_start, current_week_end, db
    )

    # Get data for last week
    last_week_data = _calculate_week_averages(
        user.id, last_week_start, last_week_end, db
    )

    return WeeklyComparisonResponse(
        current_week=current_week_data,
        last_week=last_week_data,
        current_week_start=current_week_start,
        current_week_end=current_week_end,
        last_week_start=last_week_start,
        last_week_end=last_week_end
    )


def _calculate_week_averages(
    user_id: int,
    start_date: date,
    end_date: date,
    db: Session
) -> WeeklyAverages:
    """Calculate average daily nutrition and exercise for a week (only days with data)"""
    # Get all calorie entries for the week
    entries = db.query(CalorieEntry).filter(
        CalorieEntry.user_id == user_id,
        CalorieEntry.date >= start_date,
        CalorieEntry.date <= end_date
    ).all()

    # Get all exercise entries for the week
    exercises = db.query(ExerciseEntry).filter(
        ExerciseEntry.user_id == user_id,
        ExerciseEntry.date >= start_date,
        ExerciseEntry.date <= end_date
    ).all()

    # Track unique dates with nutrition data
    nutrition_dates = set()

    # Calculate totals
    total_calories = 0
    total_carbs = 0
    total_protein = 0
    total_fats = 0

    for entry in entries:
        nutrition_dates.add(entry.date)
        entry_totals = entry.get_totals()
        total_calories += entry_totals["calories"]
        total_carbs += entry_totals["carbs_g"]
        total_protein += entry_totals["protein_g"]
        total_fats += entry_totals["fat_g"]

    # Track unique dates with exercise data
    exercise_dates = set()
    total_exercise = 0
    for ex in exercises:
        exercise_dates.add(ex.date)
        total_exercise += ex.calories_burned

    # Count days with nutrition data (0 if no data)
    num_nutrition_days = len(nutrition_dates) if nutrition_dates else 1
    # Count days with exercise data (0 if no data)
    num_exercise_days = len(exercise_dates) if exercise_dates else 1

    return WeeklyAverages(
        calories=round(total_calories / num_nutrition_days, 1),
        carbs=round(total_carbs / num_nutrition_days, 1),
        protein=round(total_protein / num_nutrition_days, 1),
        fats=round(total_fats / num_nutrition_days, 1),
        exercise=round(total_exercise / num_exercise_days, 1)
    )
