import pytest
from app.schemas.user import UserRegister, UserResponse


def test_user_register_schema():
    """Test UserRegister schema validation"""
    user_data = UserRegister(
        username="testuser",
        password="password123"
    )
    assert user_data.username == "testuser"
    assert user_data.password == "password123"


def test_user_response_schema():
    """Test UserResponse schema validation"""
    user_data = UserResponse(
        id=1,
        username="testuser",
        sex="M",
        age=30,
        height=175,
        weight=70
    )
    assert user_data.id == 1
    assert user_data.username == "testuser"
