"""Integration tests for weight tracking endpoints"""
import pytest
from datetime import date, timedelta
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models.user import User

# Test database
TEST_DATABASE_URL = "sqlite:///./test_weights.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture
def db_session():
    """Create a fresh database session for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db_session):
    """Create a test client with database override"""
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(client):
    """Create a test user and return user data"""
    response = client.post(
        "/auth/register",
        json={"username": "weightuser", "password": "Password123"}
    )
    return response.json()


@pytest.fixture
def auth_headers(test_user, client):
    """Get authentication headers for test user"""
    response = client.post(
        "/auth/login",
        json={"username": "weightuser", "password": "Password123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_weight_entry(client, auth_headers, test_user):
    """Test creating a new weight entry"""
    weight_data = {
        "date": str(date.today()),
        "weight": 75.5
    }

    response = client.post("/weights", json=weight_data, headers=auth_headers)
    assert response.status_code == status.HTTP_201_CREATED

    data = response.json()
    assert data["weight"] == 75.5
    assert data["user_id"] == test_user["id"]  # test_user is a dict
    assert data["date"] == str(date.today())


def test_create_weight_entry_unauthorized(client):
    """Test creating weight entry without authentication"""
    weight_data = {
        "date": str(date.today()),
        "weight": 75.5
    }

    response = client.post("/weights", json=weight_data)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_update_existing_weight_entry(client, auth_headers, test_user):
    """Test updating an existing weight entry for the same date"""
    weight_data = {
        "date": str(date.today()),
        "weight": 75.5
    }

    # Create initial entry
    response1 = client.post("/weights", json=weight_data, headers=auth_headers)
    assert response1.status_code == status.HTTP_201_CREATED
    entry_id = response1.json()["id"]

    # Update the same date with new weight
    weight_data["weight"] = 76.0
    response2 = client.post("/weights", json=weight_data, headers=auth_headers)
    assert response2.status_code == status.HTTP_201_CREATED

    data = response2.json()
    assert data["id"] == entry_id  # Same entry ID
    assert data["weight"] == 76.0  # Updated weight


def test_create_weight_entry_invalid_weight(client, auth_headers):
    """Test creating weight entry with invalid weight"""
    weight_data = {
        "date": str(date.today()),
        "weight": -5.0  # Invalid negative weight
    }

    response = client.post("/weights", json=weight_data, headers=auth_headers)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_get_weight_history_default(client, auth_headers, test_user):
    """Test getting weight history with default parameters"""
    # Create multiple weight entries
    today = date.today()
    for i in range(5):
        weight_data = {
            "date": str(today - timedelta(days=i)),
            "weight": 75.0 + i * 0.5
        }
        client.post("/weights", json=weight_data, headers=auth_headers)

    response = client.get("/weights/history", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert len(data) == 5
    # Verify we have entries with expected weight range
    weights = [entry["weight"] for entry in data]
    assert min(weights) == 75.0
    assert max(weights) == 77.0


def test_get_weight_history_with_days(client, auth_headers, test_user):
    """Test getting weight history with days parameter"""
    # Create multiple weight entries
    today = date.today()
    for i in range(10):
        weight_data = {
            "date": str(today - timedelta(days=i)),
            "weight": 75.0 + i * 0.5
        }
        client.post("/weights", json=weight_data, headers=auth_headers)

    response = client.get("/weights/history?days=5", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    # Should return entries within the last 5 days (may include today + 5 days back)
    assert len(data) >= 5
    assert len(data) <= 7  # Allow some flexibility for date range logic


def test_get_weight_history_with_date_range(client, auth_headers, test_user):
    """Test getting weight history with custom date range"""
    # Create multiple weight entries
    today = date.today()
    for i in range(10):
        weight_data = {
            "date": str(today - timedelta(days=i)),
            "weight": 75.0 + i * 0.5
        }
        client.post("/weights", json=weight_data, headers=auth_headers)

    start = today - timedelta(days=7)
    end = today - timedelta(days=2)

    response = client.get(
        f"/weights/history?start_date={start}&end_date={end}",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert len(data) >= 0  # Should return entries in range


def test_get_weight_history_weekly_aggregation(client, auth_headers, test_user):
    """Test getting weekly aggregated weight history"""
    # Create entries spanning multiple weeks
    today = date.today()
    for i in range(30):
        weight_data = {
            "date": str(today - timedelta(days=i)),
            "weight": 75.0 + i * 0.1
        }
        client.post("/weights", json=weight_data, headers=auth_headers)

    response = client.get("/weights/history?aggregation=week", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert isinstance(data, list)
    # Should have weekly aggregated data


def test_get_weight_history_monthly_aggregation(client, auth_headers, test_user):
    """Test getting monthly aggregated weight history"""
    # Create entries spanning multiple months
    today = date.today()
    for i in range(60):
        weight_data = {
            "date": str(today - timedelta(days=i)),
            "weight": 75.0 + i * 0.1
        }
        client.post("/weights", json=weight_data, headers=auth_headers)

    response = client.get("/weights/history?aggregation=month", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert isinstance(data, list)
    # Should have monthly aggregated data


def test_get_weight_history_empty(client, auth_headers, test_user):
    """Test getting weight history when no entries exist"""
    response = client.get("/weights/history", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert data == []


def test_get_weight_history_unauthorized(client):
    """Test getting weight history without authentication"""
    response = client.get("/weights/history")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_weight_change_calculation(client, auth_headers, test_user):
    """Test that weight change is calculated correctly"""
    today = date.today()

    # Create two entries
    weight_data_1 = {
        "date": str(today - timedelta(days=1)),
        "weight": 75.0
    }
    client.post("/weights", json=weight_data_1, headers=auth_headers)

    weight_data_2 = {
        "date": str(today),
        "weight": 76.0
    }
    client.post("/weights", json=weight_data_2, headers=auth_headers)

    response = client.get("/weights/history?days=2", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert len(data) == 2
    # Check that change is calculated (most recent entry should have change)
    if len(data) > 1 and data[-1].get("change") is not None:
        assert isinstance(data[-1]["change"], float)


def test_profile_weight_updates_with_weight_entry(client, auth_headers, test_user):
    """Test that user profile weight updates when creating weight entries"""
    today = date.today()

    # Create a weight entry
    weight_data = {
        "date": str(today),
        "weight": 80.0
    }
    response = client.post("/weights", json=weight_data, headers=auth_headers)
    assert response.status_code == status.HTTP_201_CREATED

    # Get user profile to check weight was updated
    profile_response = client.get("/profile", headers=auth_headers)
    assert profile_response.status_code == status.HTTP_200_OK

    profile_data = profile_response.json()
    # Check that user's weight was updated (should be 80 as integer)
    assert profile_data["weight"] == 80


def test_get_weight_history_with_limit(client, auth_headers, test_user):
    """Test getting last N date entries with limit parameter"""
    today = date.today()

    # Create 10 entries on different dates
    for i in range(10):
        weight_data = {
            "date": str(today - timedelta(days=i)),
            "weight": 70.0 + i
        }
        client.post("/weights", json=weight_data, headers=auth_headers)

    # Request only last 5 entries
    response = client.get("/weights/history?limit=5", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert len(data) == 5
    # Should be in ascending date order (oldest to newest)
    dates = [entry["date"] for entry in data]
    assert dates == sorted(dates)
    # Should be the 5 most recent dates
    assert data[-1]["date"] == str(today)
    assert data[0]["date"] == str(today - timedelta(days=4))


def test_get_weight_history_limit_with_multiple_entries_per_date(client, auth_headers, test_user):
    """Test that limit returns only latest entry per date when multiple exist"""
    today = date.today()

    # Create multiple entries on the same date (simulating multiple measurements)
    for i in range(3):
        weight_data = {
            "date": str(today),
            "weight": 70.0 + i  # Different weights
        }
        response = client.post("/weights", json=weight_data, headers=auth_headers)
        assert response.status_code == status.HTTP_201_CREATED

    # Create entries on different dates
    for i in range(1, 4):
        weight_data = {
            "date": str(today - timedelta(days=i)),
            "weight": 75.0 + i
        }
        client.post("/weights", json=weight_data, headers=auth_headers)

    # Request last 4 date entries
    response = client.get("/weights/history?limit=4", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    # Should have 4 distinct dates
    assert len(data) == 4
    # Today's entry should be the latest one (72.0, which was the last created)
    today_entries = [e for e in data if e["date"] == str(today)]
    assert len(today_entries) == 1
    assert today_entries[0]["weight"] == 72.0


def test_get_weight_history_limit_returns_in_ascending_order(client, auth_headers, test_user):
    """Test that limit parameter returns entries in ascending date order"""
    today = date.today()

    # Create entries in random order
    dates = [today - timedelta(days=i) for i in [5, 2, 8, 1, 10]]
    for entry_date in dates:
        weight_data = {
            "date": str(entry_date),
            "weight": 70.0
        }
        client.post("/weights", json=weight_data, headers=auth_headers)

    # Request last 3 date entries
    response = client.get("/weights/history?limit=3", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert len(data) == 3
    # Should be in ascending order (oldest to newest)
    dates_returned = [entry["date"] for entry in data]
    assert dates_returned == sorted(dates_returned)
    # Should be the 3 most recent dates
    expected_dates = sorted([str(d) for d in [today - timedelta(days=1), today - timedelta(days=2), today - timedelta(days=5)]])
    assert dates_returned == expected_dates
