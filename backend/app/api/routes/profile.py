from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services.auth import decode_token
from app.services.user import get_user_by_username
from app.services.calculations import get_nutrition_goals
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
