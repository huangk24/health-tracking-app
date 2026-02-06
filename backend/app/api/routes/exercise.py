from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.exercise import ExerciseEntry
from app.models.user import User
from app.schemas.exercise import ExerciseEntryCreate, ExerciseEntryUpdate, ExerciseEntryResponse
from app.services.auth import decode_token
from app.services.user import get_user_by_username

router = APIRouter(prefix="/exercises", tags=["exercises"])


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


@router.post("", response_model=ExerciseEntryResponse, status_code=201)
def create_exercise_entry(
    exercise: ExerciseEntryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Create a new exercise entry."""
    db_exercise = ExerciseEntry(
        user_id=user.id,
        name=exercise.name,
        calories_burned=exercise.calories_burned,
        date=exercise.date
    )
    db.add(db_exercise)
    db.commit()
    db.refresh(db_exercise)
    return db_exercise


@router.get("", response_model=list[ExerciseEntryResponse])
def get_exercise_entries(
    date_filter: date,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get all exercise entries for the current user on a specific date."""
    exercises = db.query(ExerciseEntry).filter(
        ExerciseEntry.user_id == user.id,
        ExerciseEntry.date == date_filter
    ).all()
    return exercises


@router.patch("/{exercise_id}", response_model=ExerciseEntryResponse)
def update_exercise_entry(
    exercise_id: int,
    exercise_update: ExerciseEntryUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Update an existing exercise entry."""
    db_exercise = db.query(ExerciseEntry).filter(
        ExerciseEntry.id == exercise_id,
        ExerciseEntry.user_id == user.id
    ).first()

    if not db_exercise:
        raise HTTPException(status_code=404, detail="Exercise entry not found")

    # Update fields if provided
    if exercise_update.name is not None:
        db_exercise.name = exercise_update.name
    if exercise_update.calories_burned is not None:
        db_exercise.calories_burned = exercise_update.calories_burned

    db.commit()
    db.refresh(db_exercise)
    return db_exercise


@router.delete("/{exercise_id}", status_code=204)
def delete_exercise_entry(
    exercise_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Delete an exercise entry."""
    db_exercise = db.query(ExerciseEntry).filter(
        ExerciseEntry.id == exercise_id,
        ExerciseEntry.user_id == user.id
    ).first()

    if not db_exercise:
        raise HTTPException(status_code=404, detail="Exercise entry not found")

    db.delete(db_exercise)
    db.commit()
    return None
