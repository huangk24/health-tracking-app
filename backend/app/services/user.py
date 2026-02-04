from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserRegister
from app.services.auth import get_password_hash
from typing import Optional


def create_user(db: Session, user_data: UserRegister) -> User:
    """Create a new user with hashed password"""
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get user by username"""
    return db.query(User).filter(User.username == username).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()
