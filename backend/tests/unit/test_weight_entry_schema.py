"""Unit tests for WeightEntry schemas"""
import pytest
from datetime import date
from pydantic import ValidationError

from app.schemas.weight_entry import WeightEntryCreate, WeightEntryResponse, WeightTrendData


def test_weight_entry_create_valid():
    """Test creating a valid weight entry schema"""
    entry = WeightEntryCreate(
        date=date.today(),
        weight=75.5
    )
    assert entry.date == date.today()
    assert entry.weight == 75.5


def test_weight_entry_create_invalid_weight_negative():
    """Test that negative weight is rejected"""
    with pytest.raises(ValidationError):
        WeightEntryCreate(
            date=date.today(),
            weight=-5.0
        )


def test_weight_entry_create_invalid_weight_zero():
    """Test that zero weight is rejected"""
    with pytest.raises(ValidationError):
        WeightEntryCreate(
            date=date.today(),
            weight=0
        )


def test_weight_entry_create_positive_weight():
    """Test that positive weight values are accepted"""
    entry = WeightEntryCreate(
        date=date.today(),
        weight=0.1  # Very small but positive
    )
    assert entry.weight == 0.1


def test_weight_entry_response_schema():
    """Test weight entry response schema"""
    response = WeightEntryResponse(
        id=1,
        user_id=10,
        date=date.today(),
        weight=75.5
    )
    assert response.id == 1
    assert response.user_id == 10
    assert response.date == date.today()
    assert response.weight == 75.5


def test_weight_trend_data_without_change():
    """Test weight trend data without change value"""
    trend = WeightTrendData(
        date=date.today(),
        weight=75.5
    )
    assert trend.date == date.today()
    assert trend.weight == 75.5
    assert trend.change is None


def test_weight_trend_data_with_change():
    """Test weight trend data with change value"""
    trend = WeightTrendData(
        date=date.today(),
        weight=75.5,
        change=1.5
    )
    assert trend.date == date.today()
    assert trend.weight == 75.5
    assert trend.change == 1.5


def test_weight_trend_data_negative_change():
    """Test weight trend data with negative change (weight loss)"""
    trend = WeightTrendData(
        date=date.today(),
        weight=75.5,
        change=-1.5
    )
    assert trend.change == -1.5


def test_weight_entry_create_missing_fields():
    """Test that all required fields must be provided"""
    with pytest.raises(ValidationError):
        WeightEntryCreate(date=date.today())  # Missing weight

    with pytest.raises(ValidationError):
        WeightEntryCreate(weight=75.5)  # Missing date


def test_weight_entry_response_missing_fields():
    """Test that response schema requires all fields"""
    with pytest.raises(ValidationError):
        WeightEntryResponse(
            id=1,
            user_id=10,
            date=date.today()
            # Missing weight
        )
