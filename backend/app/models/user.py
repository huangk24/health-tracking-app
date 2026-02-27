from sqlalchemy import Column, Integer, String, Float, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    sex = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    weight = Column(Integer, nullable=True)
    goal = Column(String, nullable=True, default="maintain")  # lose, maintain, gain

    # Custom nutrition settings
    use_custom_nutrition = Column(Boolean, nullable=True, default=False)
    custom_calories = Column(Integer, nullable=True)
    custom_protein_percent = Column(Float, nullable=True)
    custom_carbs_percent = Column(Float, nullable=True)
    custom_fat_percent = Column(Float, nullable=True)

    # Relationships
    calorie_entries = relationship("CalorieEntry", back_populates="user")
    exercise_entries = relationship("ExerciseEntry", back_populates="user")
    weight_entries = relationship("WeightEntry", back_populates="user")
    custom_foods = relationship("CustomFood", back_populates="user")
