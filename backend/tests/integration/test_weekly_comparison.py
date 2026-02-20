"""Tests for weekly comparison endpoint"""
from datetime import date, timedelta
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.models.food_entry import CalorieEntry, FoodItem, MealType
from app.models.exercise import ExerciseEntry

# Test database
TEST_DATABASE_URL = "sqlite:///./test_weekly_comparison.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    Base.metadata.drop_all(bind=engine)


def register_and_login(client: TestClient) -> str:
    """Register and login a test user, return the access token"""
    client.post(
        "/auth/register",
        json={"username": "weekly_user", "password": "Password123"},
    )
    response = client.post(
        "/auth/login",
        json={"username": "weekly_user", "password": "Password123"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_weekly_comparison_no_data(client: TestClient):
    """Test weekly comparison with no data"""
    token = register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/profile/weekly-comparison", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert "current_week" in data
    assert "last_week" in data
    assert data["current_week"]["calories"] == 0.0
    assert data["current_week"]["carbs"] == 0.0
    assert data["current_week"]["protein"] == 0.0
    assert data["current_week"]["fats"] == 0.0
    assert data["current_week"]["exercise"] == 0.0


def test_weekly_comparison_with_data(client: TestClient):
    """Test weekly comparison with nutrition and exercise data"""
    token = register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Get the user and create a db session
    db = next(override_get_db())
    user = db.query(User).filter(User.username == "weekly_user").first()

    # Create a food item
    food_item = FoodItem(
        name="Test Food",
        serving_size="100g",
        serving_size_grams=100.0,
        calories=200,
        protein_g=20.0,
        carbs_g=30.0,
        fat_g=10.0
    )
    db.add(food_item)
    db.commit()
    db.refresh(food_item)

    today = date.today()
    # Calculate current week start (Monday)
    current_week_start = today - timedelta(days=today.weekday())

    # Add entries for current week
    for i in range(7):
        entry_date = current_week_start + timedelta(days=i)

        # Add food entry (1 serving = 100g = 200 cal)
        calorie_entry = CalorieEntry(
            user_id=user.id,
            food_item_id=food_item.id,
            quantity=1,
            unit="serving",
            meal_type=MealType.BREAKFAST,
            date=entry_date
        )
        db.add(calorie_entry)

        # Add exercise entry
        exercise = ExerciseEntry(
            user_id=user.id,
            name="Running",
            calories_burned=300,
            date=entry_date
        )
        db.add(exercise)

    # Add entries for last week
    last_week_start = current_week_start - timedelta(days=7)
    for i in range(7):
        entry_date = last_week_start + timedelta(days=i)

        # Add food entry with 1.5 servings (1.5 * 200 = 300 cal)
        calorie_entry = CalorieEntry(
            user_id=user.id,
            food_item_id=food_item.id,
            quantity=1.5,
            unit="serving",
            meal_type=MealType.LUNCH,
            date=entry_date
        )
        db.add(calorie_entry)

        # Add exercise entry
        exercise = ExerciseEntry(
            user_id=user.id,
            name="Swimming",
            calories_burned=250,
            date=entry_date
        )
        db.add(exercise)

    db.commit()
    db.close()

    # Get weekly comparison
    response = client.get("/profile/weekly-comparison", headers=headers)
    assert response.status_code == 200
    data = response.json()

    # Check current week (1 serving = 200 cal)
    assert data["current_week"]["calories"] == 200.0
    assert data["current_week"]["carbs"] == 30.0
    assert data["current_week"]["protein"] == 20.0
    assert data["current_week"]["fats"] == 10.0
    assert data["current_week"]["exercise"] == 300.0

    # Check last week (1.5 servings = 300 cal)
    assert data["last_week"]["calories"] == 300.0
    assert data["last_week"]["carbs"] == 45.0
    assert data["last_week"]["protein"] == 30.0
    assert data["last_week"]["fats"] == 15.0
    assert data["last_week"]["exercise"] == 250.0

    # Check date ranges
    assert "current_week_start" in data
    assert "current_week_end" in data
    assert "last_week_start" in data
    assert "last_week_end" in data


def test_weekly_comparison_unauthorized(client: TestClient):
    """Test weekly comparison without authentication"""
    response = client.get("/profile/weekly-comparison")
    assert response.status_code == 401


def test_weekly_comparison_partial_week_data(client: TestClient):
    """Test weekly comparison with data only on some days (not all 7)"""
    token = register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Get the user and create a db session
    db = next(override_get_db())
    user = db.query(User).filter(User.username == "weekly_user").first()

    # Create a food item
    food_item = FoodItem(
        name="Partial Week Food",
        serving_size="100g",
        serving_size_grams=100.0,
        calories=300,
        protein_g=30.0,
        carbs_g=40.0,
        fat_g=15.0
    )
    db.add(food_item)
    db.commit()
    db.refresh(food_item)

    today = date.today()
    # Calculate current week start (Monday)
    current_week_start = today - timedelta(days=today.weekday())

    # Add entries for only 3 days of the current week (Monday, Wednesday, Friday)
    for day_offset in [0, 2, 4]:
        entry_date = current_week_start + timedelta(days=day_offset)

        # Add food entry (1 serving = 300 cal)
        calorie_entry = CalorieEntry(
            user_id=user.id,
            food_item_id=food_item.id,
            quantity=1,
            unit="serving",
            meal_type=MealType.LUNCH,
            date=entry_date
        )
        db.add(calorie_entry)

        # Add exercise entry
        exercise = ExerciseEntry(
            user_id=user.id,
            name="Yoga",
            calories_burned=150,
            date=entry_date
        )
        db.add(exercise)

    db.commit()
    db.close()

    # Get weekly comparison
    response = client.get("/profile/weekly-comparison", headers=headers)
    assert response.status_code == 200
    data = response.json()

    # Should average over 3 days (not 7)
    # Total: 3 days * 300 cal = 900 cal / 3 days = 300 cal/day
    assert data["current_week"]["calories"] == 300.0
    assert data["current_week"]["carbs"] == 40.0
    assert data["current_week"]["protein"] == 30.0
    assert data["current_week"]["fats"] == 15.0
    assert data["current_week"]["exercise"] == 150.0
