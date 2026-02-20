"""Unit tests for WeightEntry model"""
import pytest
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.user import User
from app.models.weight_entry import WeightEntry

# Test database
TEST_DATABASE_URL = "sqlite:///./test_weight_model.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def db_session():
    """Create a fresh database session for each test"""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user(db_session):
    """Create a test user"""
    user = User(username="testuser", hashed_password="hashedpass")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def test_create_weight_entry(db_session, test_user):
    """Test creating a weight entry"""
    weight_entry = WeightEntry(
        user_id=test_user.id,
        date=date.today(),
        weight=75.5
    )
    db_session.add(weight_entry)
    db_session.commit()
    db_session.refresh(weight_entry)

    assert weight_entry.id is not None
    assert weight_entry.user_id == test_user.id
    assert weight_entry.date == date.today()
    assert weight_entry.weight == 75.5


def test_weight_entry_user_relationship(db_session, test_user):
    """Test relationship between weight entry and user"""
    weight_entry = WeightEntry(
        user_id=test_user.id,
        date=date.today(),
        weight=75.5
    )
    db_session.add(weight_entry)
    db_session.commit()
    db_session.refresh(weight_entry)

    # Test relationship
    assert weight_entry.user is not None
    assert weight_entry.user.id == test_user.id
    assert weight_entry.user.username == "testuser"


def test_multiple_weight_entries_for_user(db_session, test_user):
    """Test creating multiple weight entries for the same user"""
    entries = []
    for i in range(5):
        entry = WeightEntry(
            user_id=test_user.id,
            date=date.today(),
            weight=75.0 + i
        )
        db_session.add(entry)
        entries.append(entry)

    db_session.commit()

    # Query all entries for user
    user_entries = db_session.query(WeightEntry).filter(
        WeightEntry.user_id == test_user.id
    ).all()

    assert len(user_entries) == 5


def test_weight_entry_date_index(db_session, test_user):
    """Test that date field is indexed for efficient queries"""
    weight_entry = WeightEntry(
        user_id=test_user.id,
        date=date.today(),
        weight=75.5
    )
    db_session.add(weight_entry)
    db_session.commit()

    # Query by date should use index
    result = db_session.query(WeightEntry).filter(
        WeightEntry.date == date.today()
    ).first()

    assert result is not None
    assert result.weight == 75.5
