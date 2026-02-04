import pytest
from app.schemas.user import UserCreate, UserRead


def test_user_create_schema():
    """Test UserCreate schema validation"""
    user_data = UserCreate(
        username="testuser",
        password="password123",
        sex="M",
        age=30,
        height=175,
        weight=70
    )
    assert user_data.username == "testuser"
    assert user_data.age == 30


def test_user_read_schema():
    """Test UserRead schema validation"""
    user_data = UserRead(
        id=1,
        username="testuser",
        sex="M",
        age=30,
        height=175,
        weight=70
    )
    assert user_data.id == 1
    assert user_data.username == "testuser"
