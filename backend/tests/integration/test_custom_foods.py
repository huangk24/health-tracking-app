"""Integration tests for custom food endpoints"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

# Test database
TEST_DATABASE_URL = "sqlite:///./test_custom_foods.db"
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


@pytest.fixture
def test_user_token(client):
    """Create a test user and return their auth token"""
    # Register user
    client.post(
        "/auth/register",
        json={"username": "testuser", "password": "testpass123"}
    )
    # Login
    response = client.post(
        "/auth/login",
        json={"username": "testuser", "password": "testpass123"}
    )
    return response.json()["access_token"]


def test_create_and_get_custom_food(client, test_user_token):
    """Test creating and retrieving custom foods"""
    # Create a custom food
    custom_food_data = {
        "name": "Homemade Protein Shake",
        "unit": "g",
        "reference_amount": 39,
        "calories": 250,
        "protein_g": 30,
        "carbs_g": 20,
        "fat_g": 5,
    }

    response = client.post(
        "/nutrition/custom-foods",
        json=custom_food_data,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Homemade Protein Shake"
    assert data["unit"] == "g"
    assert data["reference_amount"] == 39
    assert data["calories"] == 250
    assert data["protein_g"] == 30
    assert data["carbs_g"] == 20
    assert data["fat_g"] == 5
    custom_food_id = data["id"]

    # Get all custom foods
    response = client.get(
        "/nutrition/custom-foods",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    foods = response.json()
    assert len(foods) == 1
    assert foods[0]["name"] == "Homemade Protein Shake"


def test_create_custom_food_validation(client, test_user_token):
    """Test validation for custom food creation"""
    # Test with missing name
    response = client.post(
        "/nutrition/custom-foods",
        json={
            "name": "",
            "unit": "g",
            "reference_amount": 100,
            "calories": 100,
        },
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == 422

    # Test with negative calories
    response = client.post(
        "/nutrition/custom-foods",
        json={
            "name": "Test Food",
            "unit": "g",
            "reference_amount": 100,
            "calories": -100,
        },
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == 422

    # Test with invalid reference_amount
    response = client.post(
        "/nutrition/custom-foods",
        json={
            "name": "Test Food",
            "unit": "g",
            "reference_amount": 0,
            "calories": 100,
        },
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == 422


def test_delete_custom_food(client, test_user_token):
    """Test deleting a custom food"""
    # Create a custom food
    custom_food_data = {
        "name": "Test Food to Delete",
        "unit": "g",
        "reference_amount": 100,
        "calories": 150,
        "protein_g": 10,
        "carbs_g": 15,
        "fat_g": 5,
    }

    response = client.post(
        "/nutrition/custom-foods",
        json=custom_food_data,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == 200
    food_id = response.json()["id"]

    # Delete the custom food
    response = client.delete(
        f"/nutrition/custom-foods/{food_id}",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == 204

    # Verify it's deleted
    response = client.get(
        "/nutrition/custom-foods",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    foods = response.json()
    assert all(f["id"] != food_id for f in foods)


def test_delete_nonexistent_custom_food(client, test_user_token):
    """Test deleting a custom food that doesn't exist"""
    response = client.delete(
        "/nutrition/custom-foods/999999",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == 404


def test_custom_food_user_isolation(client, test_user_token):
    """Test that users can only see their own custom foods"""
    # Create a custom food for the first user
    custom_food_data = {
        "name": "User 1 Food",
        "unit": "serving",
        "reference_amount": 1,
        "calories": 200,
    }

    response = client.post(
        "/nutrition/custom-foods",
        json=custom_food_data,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == 200

    # Register a second user
    response = client.post(
        "/auth/register",
        json={"username": "testuser2", "password": "testpass123"},
    )
    assert response.status_code == 201

    # Login as second user
    response = client.post(
        "/auth/login",
        json={"username": "testuser2", "password": "testpass123"},
    )
    assert response.status_code == 200
    user2_token = response.json()["access_token"]

    # Get custom foods as second user - should be empty
    response = client.get(
        "/nutrition/custom-foods",
        headers={"Authorization": f"Bearer {user2_token}"},
    )
    assert response.status_code == 200
    foods = response.json()
    assert len(foods) == 0


def test_create_food_entry_from_custom_food(client, test_user_token):
    """Test creating a calorie entry from a custom food with proportional calculation"""
    # First, create a custom food (nutrition values for 100g)
    custom_food_data = {
        "name": "Custom Meal",
        "unit": "g",
        "reference_amount": 100,
        "calories": 300,
        "protein_g": 25,
        "carbs_g": 30,
        "fat_g": 10,
    }

    response = client.post(
        "/nutrition/custom-foods",
        json=custom_food_data,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == 200
    custom_food = response.json()

    # Create a food item from the custom food
    food_item_data = {
        "name": custom_food["name"],
        "serving_size": f"{custom_food['reference_amount']}{custom_food['unit']}",
        "serving_size_grams": custom_food["reference_amount"],
        "calories": custom_food["calories"],
        "protein_g": custom_food["protein_g"],
        "carbs_g": custom_food["carbs_g"],
        "fat_g": custom_food["fat_g"],
    }

    response = client.post(
        "/nutrition/food-items",
        json=food_item_data,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == 200
    food_item = response.json()

    # Create a calorie entry with 50g (half of the reference amount)
    entry_data = {
        "food_item_id": food_item["id"],
        "quantity": 50,
        "unit": custom_food["unit"],
        "meal_type": "lunch",
        "date": "2026-02-27",
    }

    response = client.post(
        "/nutrition/entries",
        json=entry_data,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == 200
    entry = response.json()

    # Verify the totals are correct (50/100 = 0.5 * nutrition values)
    assert entry["totals"]["calories"] == 150  # 300 * 0.5
    assert entry["totals"]["protein_g"] == 12.5  # 25 * 0.5
    assert entry["totals"]["carbs_g"] == 15  # 30 * 0.5
    assert entry["totals"]["fat_g"] == 5  # 10 * 0.5
