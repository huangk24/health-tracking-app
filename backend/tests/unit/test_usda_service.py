import httpx
import pytest
from fastapi import HTTPException

from app.services.usda import UsdaService


class DummyResponse:
    def __init__(self, status_code: int, json_data=None, text: str = ""):
        self.status_code = status_code
        self._json_data = json_data
        self.text = text

    def json(self):
        if self._json_data is None:
            raise ValueError("No JSON")
        return self._json_data


class DummyClient:
    def __init__(self, response: DummyResponse):
        self.response = response

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def get(self, url, params=None):
        return self.response


class DummyErrorClient:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def get(self, url, params=None):
        request = httpx.Request("GET", url)
        raise httpx.RequestError("Network error", request=request)


def test_search_foods_success(monkeypatch):
    monkeypatch.setenv("USDA_API_KEY", "test-key")
    response = DummyResponse(200, {"foods": [{"fdcId": 1}]})
    monkeypatch.setattr(httpx, "Client", lambda timeout=10: DummyClient(response))

    data = UsdaService.search_foods("apple")
    assert data["foods"][0]["fdcId"] == 1


def test_search_foods_failure(monkeypatch):
    monkeypatch.setenv("USDA_API_KEY", "test-key")
    response = DummyResponse(403, {"message": "invalid key"}, text="invalid")
    monkeypatch.setattr(httpx, "Client", lambda timeout=10: DummyClient(response))

    with pytest.raises(HTTPException) as exc:
        UsdaService.search_foods("apple")
    assert "USDA search failed" in exc.value.detail


def test_get_food_request_error(monkeypatch):
    monkeypatch.setenv("USDA_API_KEY", "test-key")
    monkeypatch.setattr(httpx, "Client", lambda timeout=10: DummyErrorClient())

    with pytest.raises(HTTPException) as exc:
        UsdaService.get_food(123)
    assert "USDA request failed" in exc.value.detail


def test_extract_nutrients_handles_units():
    food = {
        "foodNutrients": [
            {"nutrient": {"name": "Energy", "unitName": "kJ"}, "amount": 418},
            {"nutrient": {"name": "Protein", "unitName": "g"}, "amount": 10},
            {
                "nutrient": {"name": "Carbohydrate, by difference", "unitName": "g"},
                "amount": 20,
            },
            {"nutrient": {"name": "Total lipid (fat)", "unitName": "g"}, "amount": 5},
            {"nutrient": {"name": "Fiber, total dietary", "unitName": "g"}, "amount": 3},
            {"nutrient": {"name": "Sodium, Na", "unitName": "mg"}, "amount": 100},
        ]
    }

    nutrients = UsdaService.extract_nutrients(food)
    assert round(nutrients["calories"], 1) == 99.9
    assert nutrients["protein_g"] == 10
    assert nutrients["carbs_g"] == 20
    assert nutrients["fat_g"] == 5
    assert nutrients["fiber_g"] == 3
    assert nutrients["sodium_mg"] == 100


def test_normalize_per_100g():
    nutrients = {
        "calories": 50,
        "protein_g": 1,
        "carbs_g": 10,
        "fat_g": 0.5,
        "fiber_g": 2,
        "sodium_mg": 5,
    }
    normalized = UsdaService.normalize_per_100g(nutrients, 50)
    assert normalized["calories"] == 100
    assert normalized["carbs_g"] == 20


def test_get_serving_size_grams():
    food = {"servingSize": 40, "servingSizeUnit": "g"}
    assert UsdaService.get_serving_size_grams(food) == 40
    food = {"servingSize": 1, "servingSizeUnit": "oz"}
    assert UsdaService.get_serving_size_grams(food) is None
