from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, date
from enum import Enum

from app.database import Base


class MealType(str, Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"
    IN_BETWEEN = "in_between"


class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    serving_size = Column(String)  # e.g., "100g", "1 cup"
    calories = Column(Float)
    protein_g = Column(Float, default=0)
    carbs_g = Column(Float, default=0)
    fat_g = Column(Float, default=0)
    fiber_g = Column(Float, default=0)
    sodium_mg = Column(Float, default=0)

    # Relationships
    calorie_entries = relationship("CalorieEntry", back_populates="food_item")


class CalorieEntry(Base):
    __tablename__ = "calorie_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    food_item_id = Column(Integer, ForeignKey("food_items.id"), index=True)
    quantity = Column(Float, default=1.0)  # How many servings
    unit = Column(String, default="serving")  # "serving", "g", "ml", etc.
    meal_type = Column(SQLEnum(MealType), default=MealType.SNACK)
    date = Column(Date, default=date.today, index=True)
    created_at = Column(String, default=lambda: datetime.now().isoformat())

    # Relationships
    user = relationship("User", back_populates="calorie_entries")
    food_item = relationship("FoodItem", back_populates="calorie_entries")

    def get_totals(self):
        """Calculate total nutrition for this entry"""
        multiplier = self.quantity
        return {
            "calories": self.food_item.calories * multiplier,
            "protein_g": self.food_item.protein_g * multiplier,
            "carbs_g": self.food_item.carbs_g * multiplier,
            "fat_g": self.food_item.fat_g * multiplier,
            "fiber_g": self.food_item.fiber_g * multiplier,
            "sodium_mg": self.food_item.sodium_mg * multiplier,
        }
