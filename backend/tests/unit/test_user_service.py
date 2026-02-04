import pytest
from app.services.user import create_user, get_user


def test_create_user():
    """Test create_user service function"""
    result = create_user({"username": "test"})
    assert result is None  # Placeholder returns None


def test_get_user():
    """Test get_user service function"""
    result = get_user(1)
    assert result is None  # Placeholder returns None
