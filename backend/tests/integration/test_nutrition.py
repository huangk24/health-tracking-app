import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

# Test database
TEST_DATABASE_URL = "sqlite:///./test_nutrition.db"
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
    client.post(
        "/auth/register",
        json={"username": "nutrition_user", "password": "Password123"},
    )
    response = client.post(
        "/auth/login",
        json={"username": "nutrition_user", "password": "Password123"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_daily_requires_auth(client: TestClient) -> None:
    response = client.get("/nutrition/daily")
    assert response.status_code == 401


def test_invalid_token_rejected(client: TestClient) -> None:
    response = client.get(
        "/nutrition/daily",
        headers={"Authorization": "Bearer invalid"},
    )
    assert response.status_code == 401


def test_create_food_entry_and_daily_summary(client: TestClient) -> None:
    token = register_and_login(client)

    food_response = client.post(
        "/nutrition/food-items",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Chicken Breast",
            "serving_size": "100g",
            "calories": 165,
            "protein_g": 31,
            "carbs_g": 0,
            "fat_g": 3.6,
            "fiber_g": 0,
            "sodium_mg": 75,
        },
    )
    assert food_response.status_code == 200
    food_item = food_response.json()

    entry_response = client.post(
        "/nutrition/entries",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "food_item_id": food_item["id"],
            "quantity": 1,
            "unit": "serving",
            "meal_type": "breakfast",
        },
    )
    assert entry_response.status_code == 200

    daily_response = client.get(
        "/nutrition/daily",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert daily_response.status_code == 200
    data = daily_response.json()
    assert data["meals"]
    breakfast = next(
        (meal for meal in data["meals"] if meal["meal_type"] == "breakfast"), None
    )
    assert breakfast is not None
    assert breakfast["totals"]["calories"] >= 165


def test_create_entry_missing_food_item(client: TestClient) -> None:
    token = register_and_login(client)

    entry_response = client.post(
        "/nutrition/entries",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "food_item_id": 9999,
            "quantity": 1,
            "unit": "serving",
            "meal_type": "lunch",
        },
    )
    assert entry_response.status_code == 404
