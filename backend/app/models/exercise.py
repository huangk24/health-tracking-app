from datetime import date, datetime
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class ExerciseEntry(Base):
    __tablename__ = "exercise_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    calories_burned = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="exercise_entries")

    @staticmethod
    def get_total_calories_burned(entries):
        """Calculate total calories burned from a list of exercise entries."""
        return sum(entry.calories_burned for entry in entries)
