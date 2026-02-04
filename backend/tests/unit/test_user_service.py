import pytest
from app.services.auth import get_password_hash, verify_password


def test_password_hashing():
    """Test password hashing"""
    password = "MySecurePassword123"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed)


def test_password_case_sensitive():
    """Test password verification is case-sensitive"""
    password = "MySecurePassword123"
    hashed = get_password_hash(password)
    assert not verify_password("mysecurepassword123", hashed)
    assert not verify_password("MYSECUREPASSWORD123", hashed)
