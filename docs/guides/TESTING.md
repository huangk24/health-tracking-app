# Testing Guide

Comprehensive guide to testing the Health Tracking App, covering backend (Python/pytest) and frontend (TypeScript/Vitest) testing strategies.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [Test Coverage](#test-coverage)
- [Continuous Integration](#continuous-integration)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

---

## Testing Philosophy

### Testing Pyramid

```
        ┌─────────────┐
        │     E2E     │  ← Few (manual testing for now)
        ├─────────────┤
        │ Integration │  ← Some (API endpoint tests)
        ├─────────────┤
        │    Unit     │  ← Many (business logic, utilities)
        └─────────────┘
```

### Goals

- **80%+ code coverage** required for backend
- **Fast feedback** - tests should run in seconds
- **Reliability** - no flaky tests
- **Maintainability** - clear, readable test code
- **Isolation** - tests don't depend on each other

---

## Backend Testing

### Framework: pytest

We use **pytest** for all backend testing with **pytest-cov** for coverage reporting.

### Test Structure

```
backend/tests/
├── conftest.py              # Shared fixtures and configuration
├── unit/                    # Unit tests (fast, isolated)
│   ├── test_user_model.py
│   ├── test_user_schema.py
│   ├── test_user_service.py
│   ├── test_calculations.py
│   ├── test_usda_service.py
│   ├── test_weight_entry_model.py
│   ├── test_weight_entry_schema.py
│   └── test_health.py
└── integration/             # Integration tests (DB + API)
    ├── test_auth.py
    ├── test_profile.py
    ├── test_nutrition.py
    ├── test_weights.py
    ├── test_custom_foods.py
    └── test_weekly_comparison.py
```

### Running Tests

```bash
cd backend

# Run all tests
uv run pytest tests/ -v

# Run with coverage report
uv run pytest tests/ --cov=app --cov-report=term-missing

# Run specific test file
uv run pytest tests/unit/test_user_service.py -v

# Run specific test function
uv run pytest tests/unit/test_user_service.py::test_create_user -v

# Run tests matching a pattern
uv run pytest -k "test_auth" -v

# Run tests with output (show print statements)
uv run pytest tests/ -v -s

# Run tests in parallel (faster)
uv run pytest tests/ -n auto

# Stop on first failure
uv run pytest tests/ -x

# Run only failed tests from last run
uv run pytest tests/ --lf
```

### Fixtures (conftest.py)

Shared test fixtures defined in `backend/tests/conftest.py`:

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, get_db
from app.models.user import User

# Test database setup
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test."""
    engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with test database."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db_session):
    """Create a test user."""
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password="$2b$12$hashedpassword"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def auth_headers(client, test_user):
    """Get authentication headers with JWT token."""
    response = client.post("/auth/login", json={
        "username": "testuser",
        "password": "testpassword"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
```

### Unit Tests

**Unit tests** test individual functions/methods in isolation.

#### Example: Testing a Service Function

```python
# tests/unit/test_user_service.py
import pytest
from app.services.user import create_user, get_user_by_username
from app.schemas.user import UserCreate

def test_create_user(db_session):
    """Test user creation."""
    user_data = UserCreate(
        username="johndoe",
        email="john@example.com",
        password="securepassword123"
    )

    user = create_user(db_session, user_data)

    assert user.id is not None
    assert user.username == "johndoe"
    assert user.email == "john@example.com"
    assert user.hashed_password != "securepassword123"  # Should be hashed

def test_get_user_by_username(db_session, test_user):
    """Test retrieving user by username."""
    user = get_user_by_username(db_session, "testuser")

    assert user is not None
    assert user.id == test_user.id
    assert user.username == "testuser"

def test_get_user_by_username_not_found(db_session):
    """Test retrieving non-existent user."""
    user = get_user_by_username(db_session, "nonexistent")

    assert user is None
```

#### Example: Testing Calculations

```python
# tests/unit/test_calculations.py
import pytest
from app.services.calculations import calculate_bmr, calculate_tdee

def test_calculate_bmr_male():
    """Test BMR calculation for male."""
    bmr = calculate_bmr(sex="male", age=30, height_cm=175, weight_kg=75)

    # Using Mifflin-St Jeor equation
    # BMR = 10 * weight + 6.25 * height - 5 * age + 5
    expected = 10 * 75 + 6.25 * 175 - 5 * 30 + 5

    assert bmr == pytest.approx(expected, rel=0.01)

def test_calculate_bmr_female():
    """Test BMR calculation for female."""
    bmr = calculate_bmr(sex="female", age=25, height_cm=165, weight_kg=60)

    # BMR = 10 * weight + 6.25 * height - 5 * age - 161
    expected = 10 * 60 + 6.25 * 165 - 5 * 25 - 161

    assert bmr == pytest.approx(expected, rel=0.01)

def test_calculate_tdee_sedentary():
    """Test TDEE calculation for sedentary activity level."""
    bmr = 1500
    tdee = calculate_tdee(bmr, "sedentary")

    assert tdee == pytest.approx(1500 * 1.2, rel=0.01)

def test_calculate_tdee_very_active():
    """Test TDEE calculation for very active."""
    bmr = 1800
    tdee = calculate_tdee(bmr, "very_active")

    assert tdee == pytest.approx(1800 * 1.725, rel=0.01)

@pytest.mark.parametrize("sex,expected_offset", [
    ("male", 5),
    ("female", -161)
])
def test_bmr_sex_offset(sex, expected_offset):
    """Test that sex offset is applied correctly."""
    # Fixed values for other parameters
    weight, height, age = 70, 170, 30
    base = 10 * weight + 6.25 * height - 5 * age

    bmr = calculate_bmr(sex, age, height, weight)

    assert bmr == pytest.approx(base + expected_offset, rel=0.01)
```

### Integration Tests

**Integration tests** test API endpoints with real database interactions.

#### Example: Testing Authentication Endpoints

```python
# tests/integration/test_auth.py
def test_register_user(client):
    """Test user registration endpoint."""
    response = client.post("/auth/register", json={
        "username": "newuser",
        "email": "new@example.com",
        "password": "password123"
    })

    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == "newuser"
    assert data["user"]["email"] == "new@example.com"

def test_register_duplicate_username(client, test_user):
    """Test registration with existing username fails."""
    response = client.post("/auth/register", json={
        "username": "testuser",  # Already exists
        "email": "different@example.com",
        "password": "password123"
    })

    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()

def test_login_success(client, test_user):
    """Test successful login."""
    response = client.post("/auth/login", json={
        "username": "testuser",
        "password": "testpassword"
    })

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "testuser"

def test_login_invalid_password(client, test_user):
    """Test login with wrong password fails."""
    response = client.post("/auth/login", json={
        "username": "testuser",
        "password": "wrongpassword"
    })

    assert response.status_code == 401
    assert "incorrect" in response.json()["detail"].lower()

def test_login_nonexistent_user(client):
    """Test login with non-existent user fails."""
    response = client.post("/auth/login", json={
        "username": "nonexistent",
        "password": "password123"
    })

    assert response.status_code == 401
```

#### Example: Testing Protected Endpoints

```python
# tests/integration/test_nutrition.py
from datetime import date

def test_get_daily_summary_authenticated(client, auth_headers, test_user, db_session):
    """Test getting daily nutrition summary."""
    # Create some food entries
    from app.models.food_entry import FoodEntry
    entry = FoodEntry(
        user_id=test_user.id,
        meal_type="breakfast",
        food_name="Oatmeal",
        serving_size=1,
        serving_unit="cup",
        calories=300,
        protein_g=10,
        carbs_g=54,
        fat_g=6,
        date=date.today()
    )
    db_session.add(entry)
    db_session.commit()

    response = client.get(
        f"/nutrition/daily?date={date.today()}",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["date"] == str(date.today())
    assert data["totals"]["calories"] == 300
    assert "breakfast" in data["meals"]
    assert len(data["meals"]["breakfast"]) == 1

def test_get_daily_summary_unauthenticated(client):
    """Test that daily summary requires authentication."""
    response = client.get(f"/nutrition/daily?date={date.today()}")

    assert response.status_code == 401

def test_create_food_entry(client, auth_headers):
    """Test creating a food entry."""
    response = client.post("/nutrition/entries", headers=auth_headers, json={
        "meal_type": "lunch",
        "food_name": "Chicken Breast",
        "serving_size": 150,
        "serving_unit": "g",
        "calories": 248,
        "protein_g": 46.5,
        "carbs_g": 0,
        "fat_g": 5.4,
        "date": str(date.today())
    })

    assert response.status_code == 201
    data = response.json()
    assert data["food_name"] == "Chicken Breast"
    assert data["calories"] == 248

def test_delete_food_entry(client, auth_headers, test_user, db_session):
    """Test deleting a food entry."""
    # Create entry
    from app.models.food_entry import FoodEntry
    entry = FoodEntry(
        user_id=test_user.id,
        meal_type="snack",
        food_name="Apple",
        serving_size=1,
        serving_unit="piece",
        calories=95,
        date=date.today()
    )
    db_session.add(entry)
    db_session.commit()
    entry_id = entry.id

    response = client.delete(f"/nutrition/entries/{entry_id}", headers=auth_headers)

    assert response.status_code == 204

    # Verify deletion
    deleted = db_session.query(FoodEntry).filter(FoodEntry.id == entry_id).first()
    assert deleted is None

def test_user_cannot_delete_other_users_entry(client, auth_headers, db_session):
    """Test that users cannot delete other users' entries."""
    # Create another user's entry
    from app.models.user import User
    from app.models.food_entry import FoodEntry

    other_user = User(username="otheruser", email="other@example.com", hashed_password="hash")
    db_session.add(other_user)
    db_session.commit()

    entry = FoodEntry(
        user_id=other_user.id,
        meal_type="dinner",
        food_name="Pizza",
        serving_size=2,
        serving_unit="slice",
        calories=570,
        date=date.today()
    )
    db_session.add(entry)
    db_session.commit()

    response = client.delete(f"/nutrition/entries/{entry.id}", headers=auth_headers)

    assert response.status_code == 404  # Entry not found (for security)
```

### Using Parametrize for Multiple Test Cases

```python
@pytest.mark.parametrize("meal_type,expected_status", [
    ("breakfast", 201),
    ("lunch", 201),
    ("dinner", 201),
    ("snack", 201),
    ("invalid", 422),  # Invalid meal type
])
def test_create_food_entry_meal_types(client, auth_headers, meal_type, expected_status):
    """Test food entry creation with different meal types."""
    response = client.post("/nutrition/entries", headers=auth_headers, json={
        "meal_type": meal_type,
        "food_name": "Test Food",
        "serving_size": 1,
        "serving_unit": "serving",
        "calories": 100,
        "date": str(date.today())
    })

    assert response.status_code == expected_status
```

### Mocking External APIs

```python
# tests/unit/test_usda_service.py
from unittest.mock import patch, Mock

@patch('app.services.usda.requests.get')
def test_search_usda_foods_success(mock_get):
    """Test USDA food search with mocked API response."""
    # Mock API response
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "foods": [
            {
                "fdcId": 123456,
                "description": "Apple, raw",
                "dataType": "Survey (FNDDS)"
            }
        ],
        "totalHits": 1
    }
    mock_get.return_value = mock_response

    from app.services.usda import search_foods

    results = search_foods("apple")

    assert len(results["foods"]) == 1
    assert results["foods"][0]["description"] == "Apple, raw"
    mock_get.assert_called_once()

@patch('app.services.usda.requests.get')
def test_search_usda_foods_api_error(mock_get):
    """Test USDA search when API is down."""
    mock_get.side_effect = Exception("API unavailable")

    from app.services.usda import search_foods

    with pytest.raises(Exception, match="API unavailable"):
        search_foods("apple")
```

---

## Frontend Testing

### Framework: Vitest + React Testing Library

We use **Vitest** (fast Vite-native test runner) with **React Testing Library** for component testing.

### Test Structure

```
frontend/src/
├── components/
│   ├── AddFoodForm.tsx
│   ├── AddFoodForm.test.tsx
│   ├── NutritionSummary.tsx
│   └── NutritionSummary.test.tsx
├── services/
│   ├── api.ts
│   └── api.test.ts
└── utils/
    ├── date.ts
    └── date.test.ts
```

### Running Tests

```bash
cd frontend

# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- AddFoodForm.test.tsx

# Run tests matching pattern
npm test -- --grep="nutrition"
```

### Component Testing

#### Example: Testing a Simple Component

```typescript
// src/components/UserBadge.test.tsx
import { render, screen } from '@testing-library/react';
import { UserBadge } from './UserBadge';

describe('UserBadge', () => {
  it('renders username and email', () => {
    render(<UserBadge username="johndoe" email="john@example.com" />);

    expect(screen.getByText('johndoe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('applies correct CSS class', () => {
    const { container } = render(<UserBadge username="johndoe" email="john@example.com" />);

    expect(container.firstChild).toHaveClass('user-badge');
  });
});
```

#### Example: Testing Form Interactions

```typescript
// src/components/AddFoodForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddFoodForm } from './AddFoodForm';
import '@testing-library/jest-dom';

describe('AddFoodForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  it('renders all form fields', () => {
    render(<AddFoodForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/food name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/calories/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/protein/i)).toBeInTheDocument();
  });

  it('calls onSubmit with form data when valid', async () => {
    render(<AddFoodForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    // Fill form
    fireEvent.change(screen.getByLabelText(/food name/i), {
      target: { value: 'Apple' }
    });
    fireEvent.change(screen.getByLabelText(/calories/i), {
      target: { value: '95' }
    });

    // Submit
    fireEvent.click(screen.getByText(/add food/i));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          foodName: 'Apple',
          calories: 95
        })
      );
    });
  });

  it('shows validation error for negative calories', async () => {
    render(<AddFoodForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/calories/i), {
      target: { value: '-10' }
    });
    fireEvent.click(screen.getByText(/add food/i));

    await waitFor(() => {
      expect(screen.getByText(/must be positive/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onCancel when cancel button clicked', () => {
    render(<AddFoodForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText(/cancel/i));

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
```

### API Service Testing

```typescript
// src/services/api.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { nutritionApi } from './api';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('nutritionApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getDailySummary calls correct endpoint', async () => {
    const mockData = {
      date: '2026-03-06',
      meals: {},
      totals: { calories: 0 }
    };

    mockedAxios.get.mockResolvedValue({ data: mockData });

    const result = await nutritionApi.getDailySummary('2026-03-06');

    expect(mockedAxios.get).toHaveBeenCalledWith('/nutrition/daily?date=2026-03-06');
    expect(result.data).toEqual(mockData);
  });

  it('createFoodEntry sends POST request', async () => {
    const mockEntry = {
      meal_type: 'breakfast',
      food_name: 'Oatmeal',
      calories: 300
    };

    mockedAxios.post.mockResolvedValue({ data: { id: 1, ...mockEntry } });

    await nutritionApi.createFoodEntry(mockEntry);

    expect(mockedAxios.post).toHaveBeenCalledWith('/nutrition/entries', mockEntry);
  });
});
```

### Utility Function Testing

```typescript
// src/utils/date.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, getTodayInPST } from './date';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2026-03-06T10:00:00Z');
    expect(formatDate(date)).toBe('2026-03-06');
  });

  it('handles string input', () => {
    expect(formatDate('2026-03-06')).toBe('2026-03-06');
  });
});

describe('getTodayInPST', () => {
  it('returns date in YYYY-MM-DD format', () => {
    const today = getTodayInPST();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
```

---

## Test Coverage

### Viewing Coverage

**Backend:**
```bash
cd backend
uv run pytest tests/ --cov=app --cov-report=html

# Open HTML report
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
```

**Frontend:**
```bash
cd frontend
npm test -- --coverage

# Coverage report shows in terminal
```

### Coverage Requirements

- **Backend**: Minimum 80% (current: 90.70%)
- **Frontend**: Minimum 70% (target)

### What to Cover

**High Priority:**
- Authentication logic
- Business calculations (BMR, TDEE, macros)
- Data validation
- User data isolation

**Medium Priority:**
- API endpoint error handling
- Component rendering
- Form validation

**Low Priority:**
- UI styling
- Constants
- Type definitions

---

## Continuous Integration

### GitHub Actions (Future)

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install uv
      - run: cd backend && uv sync
      - run: cd backend && uv run pytest tests/ --cov=app --cov-fail-under=80

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm test
```

---

## Best Practices

### DO

✅ **Write tests first** (TDD when possible)
✅ **One assertion per test** (or closely related assertions)
✅ **Use descriptive test names** (`test_cannot_delete_other_users_entry`)
✅ **Test edge cases** (empty input, null values, boundary conditions)
✅ **Mock external dependencies** (APIs, databases in unit tests)
✅ **Clean up after tests** (fixtures handle this)
✅ **Test error cases** (not just happy path)

### DON'T

❌ **Don't test implementation details** (test behavior, not internals)
❌ **Don't share state between tests** (use fixtures)
❌ **Don't mock what you don't own** (mock external APIs, not internal functions)
❌ **Don't write flaky tests** (tests should be deterministic)
❌ **Don't skip failing tests** (fix them or remove them)
❌ **Don't test framework code** (test your code, not React/FastAPI)

---

## Common Patterns

### Testing Authentication

```python
# Always use auth_headers fixture for protected endpoints
def test_protected_endpoint(client, auth_headers):
    response = client.get("/protected", headers=auth_headers)
    assert response.status_code == 200
```

### Testing Database Queries

```python
# Use db_session fixture and verify database state
def test_creates_record(client, auth_headers, db_session):
    client.post("/entries", headers=auth_headers, json={...})

    from app.models.food_entry import FoodEntry
    count = db_session.query(FoodEntry).count()
    assert count == 1
```

### Testing Error Responses

```python
def test_invalid_input(client):
    response = client.post("/entries", json={"calories": -10})

    assert response.status_code == 422
    assert "must be positive" in response.json()["detail"][0]["msg"]
```

---

## Troubleshooting

### Tests fail locally but pass in CI

**Cause**: Environment differences

**Solution**:
- Check Python/Node versions match
- Ensure dependencies are synced (`uv sync`, `npm install`)
- Check environment variables
- Clear cache: `pytest --cache-clear`

### Flaky tests (pass/fail randomly)

**Cause**: Shared state, timing issues, external dependencies

**Solution**:
- Use fixtures to isolate tests
- Mock time-dependent code
- Mock external API calls
- Check for race conditions

### Slow tests

**Cause**: Too many integration tests, no mocking

**Solution**:
- Move logic to unit tests
- Mock external APIs
- Use smaller test data sets
- Run tests in parallel: `pytest -n auto`

### Coverage drops unexpectedly

**Cause**: New uncovered code, deleted tests

**Solution**:
- Run with `--cov-report=term-missing` to see uncovered lines
- Add tests for new features
- Check if any tests were accidentally deleted

---

## Resources

- **pytest docs**: https://docs.pytest.org/
- **Vitest docs**: https://vitest.dev/
- **React Testing Library**: https://testing-library.com/react
- **FastAPI Testing**: https://fastapi.tiangolo.com/tutorial/testing/

Happy testing! 🧪
