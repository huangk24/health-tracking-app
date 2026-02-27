from pydantic import BaseModel, ConfigDict, field_validator


class CustomFoodCreate(BaseModel):
    name: str
    unit: str
    reference_amount: float
    calories: float
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    fiber_g: float = 0
    sodium_mg: float = 0

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()

    @field_validator("unit")
    @classmethod
    def validate_unit(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Unit cannot be empty")
        # Standardized units
        allowed_units = ["g", "oz", "ml", "cup", "tbsp", "tsp", "serving", "piece", "slice"]
        if v.lower() not in allowed_units:
            raise ValueError(f"Unit must be one of: {', '.join(allowed_units)}")
        return v.lower()

    @field_validator("reference_amount")
    @classmethod
    def validate_reference_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Reference amount must be positive")
        return v

    @field_validator("calories")
    @classmethod
    def validate_calories(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Calories cannot be negative")
        return v

    @field_validator("protein_g", "carbs_g", "fat_g", "fiber_g", "sodium_mg")
    @classmethod
    def validate_nutrition(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Nutrition values cannot be negative")
        return v


class CustomFoodResponse(BaseModel):
    id: int
    user_id: int
    name: str
    unit: str
    reference_amount: float
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    sodium_mg: float
    created_at: str

    model_config = ConfigDict(from_attributes=True)
