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


def test_update_and_delete_entry(client: TestClient) -> None:
    token = register_and_login(client)

    food_response = client.post(
        "/nutrition/food-items",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Oatmeal",
            "serving_size": "1 serving",
            "calories": 150,
            "protein_g": 5,
            "carbs_g": 27,
            "fat_g": 3,
            "fiber_g": 4,
            "sodium_mg": 120,
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
    entry = entry_response.json()

    update_response = client.patch(
        f"/nutrition/entries/{entry['id']}",
        headers={"Authorization": f"Bearer {token}"},
        json={"quantity": 2, "unit": "serving", "meal_type": "lunch"},
    )
    assert update_response.status_code == 200
    updated_entry = update_response.json()
    assert updated_entry["quantity"] == 2
    assert updated_entry["meal_type"] == "lunch"

    delete_response = client.delete(
        f"/nutrition/entries/{entry['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert delete_response.status_code == 204


def test_update_entry_invalid_quantity(client: TestClient) -> None:
    token = register_and_login(client)

    food_response = client.post(
        "/nutrition/food-items",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Banana",
            "serving_size": "1 serving",
            "calories": 105,
            "protein_g": 1.3,
            "carbs_g": 27,
            "fat_g": 0.4,
            "fiber_g": 3.1,
            "sodium_mg": 1,
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
    entry = entry_response.json()

    update_response = client.patch(
        f"/nutrition/entries/{entry['id']}",
        headers={"Authorization": f"Bearer {token}"},
        json={"quantity": 0},
    )
    assert update_response.status_code == 400


def test_usda_search_and_create_food_item(client: TestClient, monkeypatch) -> None:
    token = register_and_login(client)

    def fake_search_foods(query: str, page_size: int = 10):
        return {
            "foods": [
                {
                    "fdcId": 123,
                    "description": "Apple, raw",
                    "brandName": None,
                    "dataType": "Survey (FNDDS)",
                    "servingSize": 100,
                    "servingSizeUnit": "g",
                }
            ]
        }

    def fake_get_food(fdc_id: int):
        return {
            "description": "Apple, raw",
            "servingSize": 100,
            "servingSizeUnit": "g",
            "foodNutrients": [
                {
                    "nutrient": {"name": "Energy", "unitName": "kcal"},
                    "amount": 52,
                },
                {"nutrient": {"name": "Protein", "unitName": "g"}, "amount": 0.3},
                {
                    "nutrient": {
                        "name": "Carbohydrate, by difference",
                        "unitName": "g",
                    },
                    "amount": 13.8,
                },
                {
                    "nutrient": {"name": "Total lipid (fat)", "unitName": "g"},
                    "amount": 0.2,
                },
                {
                    "nutrient": {"name": "Fiber, total dietary", "unitName": "g"},
                    "amount": 2.4,
                },
                {
                    "nutrient": {"name": "Sodium, Na", "unitName": "mg"},
                    "amount": 1,
                },
            ],
        }

    monkeypatch.setattr("app.services.usda.UsdaService.search_foods", fake_search_foods)
    monkeypatch.setattr("app.services.usda.UsdaService.get_food", fake_get_food)

    search_response = client.get("/nutrition/usda/search?query=apple")
    assert search_response.status_code == 200
    search_data = search_response.json()
    assert search_data["results"][0]["fdc_id"] == 123

    create_response = client.post(
        "/nutrition/food-items/usda",
        headers={"Authorization": f"Bearer {token}"},
        json={"fdc_id": 123},
    )
    assert create_response.status_code == 200
    food_item = create_response.json()
    assert food_item["source"] == "usda"
    assert food_item["serving_size_grams"] == 100

    create_duplicate = client.post(
        "/nutrition/food-items/usda",
        headers={"Authorization": f"Bearer {token}"},
        json={"fdc_id": 123},
    )
    assert create_duplicate.status_code == 200
    assert create_duplicate.json()["id"] == food_item["id"]
