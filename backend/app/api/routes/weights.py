from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, extract, case
from typing import List, Optional
from datetime import date, timedelta
from collections import defaultdict

from app.database import get_db
from app.models.weight_entry import WeightEntry
from app.models.user import User
from app.schemas.weight_entry import WeightEntryCreate, WeightEntryResponse, WeightTrendData
from app.api.routes.profile import get_current_user

router = APIRouter(prefix="/weights", tags=["weights"])


@router.post("", response_model=WeightEntryResponse, status_code=status.HTTP_201_CREATED)
def create_weight_entry(
    weight_data: WeightEntryCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update a weight entry for a specific date"""
    # Check if entry already exists for this date
    existing = db.query(WeightEntry).filter(
        WeightEntry.user_id == user.id,
        WeightEntry.date == weight_data.date
    ).first()

    if existing:
        # Update existing entry
        existing.weight = weight_data.weight
        db.commit()
        db.refresh(existing)

        # Update user's profile weight with most recent entry
        latest_entry = db.query(WeightEntry).filter(
            WeightEntry.user_id == user.id
        ).order_by(desc(WeightEntry.date)).first()
        if latest_entry:
            user.weight = int(latest_entry.weight)
            db.commit()

        return existing

    # Create new entry
    new_entry = WeightEntry(
        user_id=user.id,
        date=weight_data.date,
        weight=weight_data.weight
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    # Update user's profile weight with most recent entry
    latest_entry = db.query(WeightEntry).filter(
        WeightEntry.user_id == user.id
    ).order_by(desc(WeightEntry.date)).first()
    if latest_entry:
        user.weight = int(latest_entry.weight)
        db.commit()

    return new_entry


@router.get("/history", response_model=List[WeightTrendData])
def get_weight_history(
    days: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    aggregation: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get weight history for trend analysis
    - days: Get last N days (default: 90)
    - start_date & end_date: Custom date range
    - aggregation: "week", "month", "quarter", or "year" for aggregated data
    """

    # Handle aggregated views
    if aggregation == "week":
        # Weekly averages for the last 8 weeks
        today = date.today()
        start_of_week = today - timedelta(days=today.weekday())  # Monday of current week

        # Get all entries for the last 56 days (8 weeks)
        cutoff_date = start_of_week - timedelta(days=56)
        entries = db.query(WeightEntry).filter(
            WeightEntry.user_id == user.id,
            WeightEntry.date >= cutoff_date
        ).order_by(WeightEntry.date).all()

        # Group by week
        weekly_data = defaultdict(list)
        for entry in entries:
            # Calculate which week this entry belongs to
            days_from_start = (entry.date - cutoff_date).days
            week_num = days_from_start // 7
            weekly_data[week_num].append(entry.weight)

        # Calculate averages and create results
        result = []
        for week_num in sorted(weekly_data.keys()):
            weights = weekly_data[week_num]
            avg_weight = sum(weights) / len(weights)
            # Use the Monday of that week as the date
            week_start = cutoff_date + timedelta(days=week_num * 7)
            # Adjust to Monday
            week_monday = week_start - timedelta(days=week_start.weekday())
            result.append(WeightTrendData(
                date=week_monday,
                weight=round(avg_weight, 1),
                change=None
            ))

        return result

    elif aggregation == "month":
        # Monthly averages for current year only (Jan-Dec)
        current_year = date.today().year

        # Get all entries for current year
        entries = db.query(
            extract('month', WeightEntry.date).label('month'),
            func.avg(WeightEntry.weight).label('avg_weight')
        ).filter(
            WeightEntry.user_id == user.id,
            extract('year', WeightEntry.date) == current_year
        ).group_by(
            extract('month', WeightEntry.date)
        ).order_by(
            extract('month', WeightEntry.date)
        ).all()

        # Create result for all 12 months
        result = []
        month_data = {int(e.month): e.avg_weight for e in entries}

        for month in range(1, 13):
            if month in month_data:
                # Create a date for the first day of the month
                month_date = date(current_year, month, 1)
                result.append(WeightTrendData(
                    date=month_date,
                    weight=round(month_data[month], 1),
                    change=None
                ))

        return result

    elif aggregation == "quarter":
        # Quarterly averages for previous year, current year, and next year
        current_year = date.today().year
        years = [current_year - 1, current_year, current_year + 1]

        # Get all entries for the specified years
        entries = db.query(WeightEntry).filter(
            WeightEntry.user_id == user.id,
            extract('year', WeightEntry.date).in_(years)
        ).all()

        # Group by year and quarter manually
        quarterly_data = defaultdict(list)
        for entry in entries:
            year = entry.date.year
            quarter = (entry.date.month - 1) // 3 + 1
            key = (year, quarter)
            quarterly_data[key].append(entry.weight)

        # Calculate averages and create results
        result = []
        for (year, quarter) in sorted(quarterly_data.keys()):
            weights = quarterly_data[(year, quarter)]
            avg_weight = sum(weights) / len(weights)
            # Create a date for the first day of the quarter
            quarter_month = (quarter - 1) * 3 + 1
            quarter_date = date(year, quarter_month, 1)
            result.append(WeightTrendData(
                date=quarter_date,
                weight=round(avg_weight, 1),
                change=None
            ))

        return result

    elif aggregation == "year":
        # Yearly averages for all available years
        entries = db.query(
            extract('year', WeightEntry.date).label('year'),
            func.avg(WeightEntry.weight).label('avg_weight')
        ).filter(
            WeightEntry.user_id == user.id
        ).group_by(
            extract('year', WeightEntry.date)
        ).order_by(
            extract('year', WeightEntry.date)
        ).all()

        result = []
        for entry in entries:
            # Create a date for January 1st of the year
            year_date = date(int(entry.year), 1, 1)
            result.append(WeightTrendData(
                date=year_date,
                weight=round(entry.avg_weight, 1),
                change=None
            ))

        return result

    # Default: daily data points
    query = db.query(WeightEntry).filter(WeightEntry.user_id == user.id)

    if start_date and end_date:
        query = query.filter(
            WeightEntry.date >= start_date,
            WeightEntry.date <= end_date
        )
    elif days:
        cutoff_date = date.today() - timedelta(days=days)
        query = query.filter(WeightEntry.date >= cutoff_date)
    else:
        # Default: last 90 days
        cutoff_date = date.today() - timedelta(days=90)
        query = query.filter(WeightEntry.date >= cutoff_date)

    entries = query.order_by(WeightEntry.date).all()

    # Calculate weight change from previous entry
    result = []
    for i, entry in enumerate(entries):
        change = None
        if i > 0:
            change = round(entry.weight - entries[i-1].weight, 2)

        result.append(WeightTrendData(
            date=entry.date,
            weight=entry.weight,
            change=change
        ))

    return result


@router.get("/latest", response_model=Optional[WeightEntryResponse])
def get_latest_weight(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the most recent weight entry"""
    latest = db.query(WeightEntry).filter(
        WeightEntry.user_id == user.id
    ).order_by(desc(WeightEntry.date)).first()

    return latest


@router.delete("/{weight_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_weight_entry(
    weight_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a weight entry"""
    entry = db.query(WeightEntry).filter(
        WeightEntry.id == weight_id,
        WeightEntry.user_id == user.id
    ).first()

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Weight entry not found"
        )

    db.delete(entry)
    db.commit()

    # Update user's profile weight with most recent entry
    latest_entry = db.query(WeightEntry).filter(
        WeightEntry.user_id == user.id
    ).order_by(desc(WeightEntry.date)).first()
    if latest_entry:
        user.weight = int(latest_entry.weight)
    else:
        user.weight = None
    db.commit()

    return None
