"""Integration tests for nutrition endpoints."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_get_daily_nutrition_unauthenticated():
    """Test getting daily nutrition without authentication."""
    response = client.get("/nutrition/daily")
    assert response.status_code == 401


def test_create_calorie_entry_unauthenticated():
    """Test creating a calorie entry without authentication."""
    entry_data = {
        "food_item_id": 1,
        "meal_type": "breakfast",
        "quantity": 2,
        "unit": "serving",
    }
    response = client.post("/nutrition/entries", json=entry_data)
    assert response.status_code == 401
