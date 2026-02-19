from sqlalchemy import Column, Integer, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class WeightEntry(Base):
    """Model for tracking daily weight entries"""
    __tablename__ = "weight_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    weight = Column(Float, nullable=False)  # Weight in kg

    # Relationships
    user = relationship("User", back_populates="weight_entries")

    class Config:
        orm_mode = True
