from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.database import Base


class MealType(str, Enum):
    """Meal type enumeration."""
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"
    IN_BETWEEN = "in_between"


class FoodItem(Base):
    """Generic food item with nutritional information."""
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    serving_size = Column(String, default="100g")  # e.g., "100g", "1 cup", "1 piece"
    calories = Column(Float, nullable=False)  # per serving
    protein_g = Column(Float, default=0)  # grams
    carbs_g = Column(Float, default=0)
    fat_g = Column(Float, default=0)
    fiber_g = Column(Float, default=0)
    sodium_mg = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    calorie_entries = relationship("CalorieEntry", back_populates="food_item")


class CalorieEntry(Base):
    """User's food log entry for a specific meal."""
    __tablename__ = "calorie_entries"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    food_item_id = Column(Integer, ForeignKey("food_items.id"), nullable=False)
    meal_type = Column(SQLEnum(MealType), nullable=False)
    quantity = Column(Float, nullable=False)  # e.g., 2 (servings), 150 (grams)
    unit = Column(String, default="serving")  # e.g., "serving", "gram", "piece"
    date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="calorie_entries")
    food_item = relationship("FoodItem", back_populates="calorie_entries")

    def get_totals(self):
        """Calculate nutritional totals based on quantity."""
        multiplier = self.quantity
        return {
            "calories": round(self.food_item.calories * multiplier, 2),
            "protein_g": round(self.food_item.protein_g * multiplier, 2),
            "carbs_g": round(self.food_item.carbs_g * multiplier, 2),
            "fat_g": round(self.food_item.fat_g * multiplier, 2),
            "fiber_g": round(self.food_item.fiber_g * multiplier, 2),
            "sodium_mg": round(self.food_item.sodium_mg * multiplier, 2),
        }
