import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

# Test database
TEST_DATABASE_URL = "sqlite:///./test_profile.db"
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


def register_and_login(client: TestClient) -> str:
    client.post(
        "/auth/register",
        json={"username": "profile_user", "password": "Password123"},
    )
    response = client.post(
        "/auth/login",
        json={"username": "profile_user", "password": "Password123"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_get_profile_requires_auth(client: TestClient) -> None:
    response = client.get("/profile")
    assert response.status_code == 401


def test_get_profile_success(client: TestClient) -> None:
    token = register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/profile", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "profile_user"
    assert data["sex"] is None
    assert data["age"] is None
    assert data["height"] is None
    assert data["weight"] is None
    assert data["goal"] == "maintain"


def test_update_profile_requires_auth(client: TestClient) -> None:
    response = client.put(
        "/profile",
        json={"sex": "male", "age": 30, "height": 180, "weight": 75, "goal": "lose"},
    )
    assert response.status_code == 401


def test_update_profile_success(client: TestClient) -> None:
    token = register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    update_data = {
        "sex": "male",
        "age": 30,
        "height": 180,
        "weight": 75,
        "goal": "lose",
    }
    response = client.put("/profile", headers=headers, json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["sex"] == "male"
    assert data["age"] == 30
    assert data["height"] == 180
    assert data["weight"] == 75
    assert data["goal"] == "lose"


def test_update_profile_partial(client: TestClient) -> None:
    token = register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Update only age
    response = client.put("/profile", headers=headers, json={"age": 25})
    assert response.status_code == 200
    data = response.json()
    assert data["age"] == 25
    assert data["sex"] is None


def test_nutrition_goals_requires_auth(client: TestClient) -> None:
    response = client.get("/profile/nutrition-goals")
    assert response.status_code == 401


def test_nutrition_goals_without_profile(client: TestClient) -> None:
    """Test nutrition goals returns 400 when profile is incomplete"""
    token = register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/profile/nutrition-goals", headers=headers)
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "profile" in data["detail"].lower()


def test_nutrition_goals_with_complete_profile(client: TestClient) -> None:
    """Test nutrition goals calculates personalized recommendations"""
    token = register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Update profile with complete info
    profile_data = {
        "sex": "male",
        "age": 30,
        "height": 180,
        "weight": 75,
        "goal": "lose",
    }
    client.put("/profile", headers=headers, json=profile_data)

    # Get personalized nutrition goals
    response = client.get("/profile/nutrition-goals", headers=headers)
    assert response.status_code == 200
    data = response.json()

    # Verify all goal fields are present
    assert "bmr" in data
    assert "tdee" in data
    assert "calories" in data
    assert "protein" in data
    assert "carbs" in data
    assert "fat" in data
    assert "goal" in data

    # For weight loss goal, calories should be reduced by 500
    # TDEE for 30yo male, 180cm, 75kg with moderate activity ~1970
    # For loss goal: 1970 - 500 = 1470
    assert data["calories"] <= data["tdee"]
    assert data["goal"] == "lose"
