from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class CustomFood(Base):
    """User-defined custom food items for quick logging"""
    __tablename__ = "custom_foods"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    unit = Column(String, nullable=False)  # e.g., "g", "oz", "ml", "cup", "serving"
    reference_amount = Column(Float, nullable=False)  # e.g., 39 for "39g"
    calories = Column(Float, nullable=False)  # Nutrition values for reference_amount
    protein_g = Column(Float, default=0)
    carbs_g = Column(Float, default=0)
    fat_g = Column(Float, default=0)
    fiber_g = Column(Float, default=0)
    sodium_mg = Column(Float, default=0)
    created_at = Column(String, default=lambda: datetime.now().isoformat())

    # Relationships
    user = relationship("User", back_populates="custom_foods")
