import os
from typing import Any

import httpx
from fastapi import HTTPException, status


class UsdaService:
    API_BASE = "https://api.nal.usda.gov/fdc/v1"

    @staticmethod
    def _get_api_key() -> str:
        api_key = os.getenv("USDA_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="USDA API key not configured",
            )
        return api_key

    @staticmethod
    def search_foods(query: str, page_size: int = 10) -> dict[str, Any]:
        api_key = UsdaService._get_api_key()
        params = {
            "api_key": api_key,
            "query": query,
            "pageSize": page_size,
        }
        try:
            with httpx.Client(timeout=10) as client:
                response = client.get(f"{UsdaService.API_BASE}/foods/search", params=params)
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"USDA request failed: {exc.__class__.__name__}",
            )

        if response.status_code != status.HTTP_200_OK:
            error_detail = response.text
            try:
                payload = response.json()
                error_detail = payload.get("error") or payload.get("message") or payload
            except ValueError:
                pass
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"USDA search failed ({response.status_code}): {error_detail}",
            )

        return response.json()

    @staticmethod
    def get_food(fdc_id: int) -> dict[str, Any]:
        api_key = UsdaService._get_api_key()
        params = {"api_key": api_key}
        try:
            with httpx.Client(timeout=10) as client:
                response = client.get(f"{UsdaService.API_BASE}/food/{fdc_id}", params=params)
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"USDA request failed: {exc.__class__.__name__}",
            )

        if response.status_code != status.HTTP_200_OK:
            error_detail = response.text
            try:
                payload = response.json()
                error_detail = payload.get("error") or payload.get("message") or payload
            except ValueError:
                pass
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"USDA food request failed ({response.status_code}): {error_detail}",
            )

        return response.json()

    @staticmethod
    def extract_nutrients(food: dict[str, Any]) -> dict[str, float]:
        nutrients = {
            "calories": 0.0,
            "protein_g": 0.0,
            "carbs_g": 0.0,
            "fat_g": 0.0,
            "fiber_g": 0.0,
            "sodium_mg": 0.0,
        }

        for item in food.get("foodNutrients", []):
            nutrient_info = item.get("nutrient", {}) or {}
            name = (nutrient_info.get("name") or item.get("nutrientName") or "").lower()
            amount = item.get("amount")
            unit = (nutrient_info.get("unitName") or item.get("unitName") or "").lower()

            if amount is None:
                continue

            if "energy" in name:
                calories = float(amount)
                if unit == "kj":
                    calories = calories / 4.184
                nutrients["calories"] = calories
            elif name == "protein":
                nutrients["protein_g"] = float(amount)
            elif name == "carbohydrate, by difference":
                nutrients["carbs_g"] = float(amount)
            elif name == "total lipid (fat)":
                nutrients["fat_g"] = float(amount)
            elif name == "fiber, total dietary":
                nutrients["fiber_g"] = float(amount)
            elif name == "sodium, na":
                nutrients["sodium_mg"] = float(amount)

        return nutrients

    @staticmethod
    def normalize_per_100g(
        nutrients: dict[str, float], serving_size_grams: float | None
    ) -> dict[str, float]:
        if not serving_size_grams or serving_size_grams <= 0:
            return nutrients
        if serving_size_grams == 100:
            return nutrients
        multiplier = 100 / serving_size_grams
        return {key: value * multiplier for key, value in nutrients.items()}

    @staticmethod
    def get_serving_size_grams(food: dict[str, Any]) -> float | None:
        serving_size = food.get("servingSize")
        serving_unit = str(food.get("servingSizeUnit") or "").lower()
        if serving_size and serving_unit in {"g", "gram", "grams"}:
            return float(serving_size)
        return None
