import pytest
from app.models.user import User


def test_user_model_creation():
    """Test User model can be instantiated"""
    user = User(
        id=1,
        username="testuser",
        hashed_password="hashedpw",
        sex="M",
        age=30,
        height=175,
        weight=70
    )
    assert user.username == "testuser"
    assert user.age == 30
    assert user.height == 175
