import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

# Test database
TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    Base.metadata.drop_all(bind=engine)


def test_register_user(client):
    """Test user registration"""
    response = client.post(
        "/auth/register",
        json={"username": "testuser", "password": "Password123"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser"
    assert "id" in data


def test_register_duplicate_username(client):
    """Test registration with duplicate username"""
    client.post("/auth/register", json={"username": "testuser", "password": "Password123"})
    response = client.post("/auth/register", json={"username": "testuser", "password": "Password456"})
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_login_success(client):
    """Test successful login"""
    # Register user first
    client.post("/auth/register", json={"username": "testuser", "password": "Password123"})

    # Login
    response = client.post("/auth/login", json={"username": "testuser", "password": "Password123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    """Test login with wrong password (case-sensitive)"""
    client.post("/auth/register", json={"username": "testuser", "password": "Password123"})
    response = client.post("/auth/login", json={"username": "testuser", "password": "password123"})
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    """Test login with non-existent user"""
    response = client.post("/auth/login", json={"username": "nonexistent", "password": "password"})
    assert response.status_code == 401
