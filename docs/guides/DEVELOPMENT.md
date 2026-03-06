# Development Guide

This guide provides detailed instructions for setting up your development environment and working on the Health Tracking App.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Backend Development](#backend-development)
- [Frontend Development](#frontend-development)
- [Database Management](#database-management)
- [Testing](#testing)
- [Debugging](#debugging)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

Install the following before starting:

| Tool | Version | Installation |
|------|---------|--------------|
| **Python** | 3.11+ | [python.org](https://www.python.org/downloads/) |
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) |
| **uv** | Latest | [astral.sh/uv](https://github.com/astral-sh/uv) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

### Installing uv (Python Package Manager)

**Linux/macOS:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Windows (PowerShell):**
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**Verify installation:**
```bash
uv --version
```

### USDA API Key (Optional)

For food search functionality:

1. Get a free API key from [USDA FoodData Central](https://fdc.nal.usda.gov/api-key-signup.html)
2. Create `backend/.env` file:
   ```bash
   echo "USDA_API_KEY=your_api_key_here" > backend/.env
   ```

---

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/huangk24/health-tracking-app.git
cd health-tracking-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies (creates .venv automatically)
uv sync

# Verify installation
uv run python --version

# Create .env file (optional)
echo "USDA_API_KEY=your_api_key_here" > .env
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Verify installation
npm --version
node --version
```

### 4. Start Development Servers

**Option A: One Command (Recommended)**
```bash
cd /path/to/health-tracking-app
chmod +x start-dev.sh  # First time only
./start-dev.sh
```

**Option B: Two Terminals**

Terminal 1 (Backend):
```bash
cd backend
uv run uvicorn app.main:app --reload
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 5. Verify Setup

- Backend API: http://localhost:8000/docs (Swagger UI)
- Frontend App: http://localhost:5173
- Health Check: http://localhost:8000/health

---

## Development Workflow

### Daily Workflow

1. **Pull latest changes**:
   ```bash
   git pull origin main
   ```

2. **Create feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```

3. **Start development servers**:
   ```bash
   ./start-dev.sh
   ```

4. **Make changes** and test

5. **Run tests**:
   ```bash
   # Backend
   cd backend && uv run pytest tests/ -v
   
   # Frontend
   cd frontend && npm test
   ```

6. **Commit changes**:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

7. **Push and create PR**:
   ```bash
   git push origin feat/your-feature-name
   ```

### Git Branching Strategy

```
main (stable, production-ready)
  ├── feat/custom-nutrition (feature branches)
  ├── fix/auth-bug (bug fixes)
  ├── docs/api-reference (documentation)
  └── chore/update-deps (maintenance)
```

**Branch Naming:**
- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Test additions/changes
- `chore/` - Maintenance tasks

---

## Project Structure

```
health-tracking-app/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── database.py        # Database configuration
│   │   ├── api/               # API routes
│   │   │   ├── router.py      # Main router
│   │   │   └── routes/        # Individual route modules
│   │   │       ├── auth.py
│   │   │       ├── profile.py
│   │   │       ├── nutrition.py
│   │   │       ├── weights.py
│   │   │       └── exercise.py
│   │   ├── models/            # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── food_entry.py
│   │   │   ├── weight_entry.py
│   │   │   ├── exercise_entry.py
│   │   │   └── custom_food.py
│   │   ├── schemas/           # Pydantic schemas
│   │   │   ├── user.py
│   │   │   ├── food_entry.py
│   │   │   ├── weight_entry.py
│   │   │   ├── exercise.py
│   │   │   └── custom_food.py
│   │   ├── services/          # Business logic
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── nutrition.py
│   │   │   ├── calculations.py
│   │   │   └── usda.py
│   │   └── utils/             # Utility functions
│   │       └── time.py
│   ├── tests/                 # Backend tests
│   │   ├── conftest.py
│   │   ├── unit/
│   │   └── integration/
│   ├── pyproject.toml         # Python dependencies
│   ├── .env                   # Environment variables (not committed)
│   └── health_tracking.db     # SQLite database (development)
│
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── main.tsx          # React entry point
│   │   ├── App.tsx           # Main app component
│   │   ├── components/       # Reusable components
│   │   │   ├── AddFoodForm.tsx
│   │   │   ├── CustomFoodManager.tsx
│   │   │   ├── NutritionSummary.tsx
│   │   │   ├── MealSection.tsx
│   │   │   ├── ExerciseSection.tsx
│   │   │   ├── WeightTrend.tsx
│   │   │   ├── DailyWeightLogger.tsx
│   │   │   ├── WeeklyComparison.tsx
│   │   │   ├── CustomNutritionSettings.tsx
│   │   │   ├── WelcomeModal.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/         # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── pages/            # Page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── services/         # API client
│   │   │   └── api.ts
│   │   ├── types/            # TypeScript types
│   │   │   └── nutrition.ts
│   │   ├── utils/            # Utility functions
│   │   │   └── date.ts
│   │   └── styles/           # CSS files
│   │       ├── global.css
│   │       ├── auth.css
│   │       ├── profile.css
│   │       ├── meals.css
│   │       └── nutrition.css
│   ├── package.json          # Node dependencies
│   ├── tsconfig.json         # TypeScript config
│   └── vite.config.ts        # Vite config
│
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   ├── CODE_OF_CONDUCT.md
│   ├── SECURITY.md
│   ├── CHANGELOG.md
│   ├── api/
│   │   └── API_REFERENCE.md
│   ├── guides/
│   │   ├── DEVELOPMENT.md (this file)
│   │   ├── DEPLOYMENT.md
│   │   └── TESTING.md
│   └── features/
│       ├── CUSTOM_NUTRITION.md
│       ├── CUSTOM_FOODS.md
│       └── UI_IMPROVEMENTS.md
│
├── .github/                   # GitHub configuration
│   ├── copilot-instructions.md
│   └── workflows/            # (Future) CI/CD pipelines
│
├── start-dev.sh              # Development startup script
├── README.md                 # Project overview
├── .gitignore
├── .pre-commit-config.yaml   # Pre-commit hooks
└── commitlint.config.cjs     # Commit message linting
```

---

## Backend Development

### Running the Backend

```bash
cd backend

# Development mode (auto-reload)
uv run uvicorn app.main:app --reload

# Production mode
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000

# Custom port
uv run uvicorn app.main:app --reload --port 8001
```

### Adding Dependencies

```bash
cd backend

# Add runtime dependency
uv add package-name

# Add development dependency
uv add --dev package-name

# Examples
uv add requests
uv add --dev pytest-cov
```

### Database Operations

**View Database:**
```bash
cd backend

# SQLite (development)
sqlite3 health_tracking.db

# PostgreSQL (production)
psql $DATABASE_URL
```

**Common Queries:**
```sql
-- List all users
SELECT id, username, email FROM users;

-- View food entries for user
SELECT * FROM food_entries WHERE user_id = 1;

-- Count entries by meal type
SELECT meal_type, COUNT(*) FROM food_entries GROUP BY meal_type;
```

### API Documentation

FastAPI generates interactive docs automatically:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### Adding a New Endpoint

**Example: Add GET /api/stats endpoint**

1. **Create schema** (`backend/app/schemas/stats.py`):
```python
from pydantic import BaseModel

class StatsResponse(BaseModel):
    total_foods: int
    total_exercises: int
    days_logged: int
```

2. **Create service** (`backend/app/services/stats.py`):
```python
from sqlalchemy.orm import Session
from app.models.food_entry import FoodEntry
from app.models.exercise_entry import ExerciseEntry

def get_user_stats(db: Session, user_id: int):
    total_foods = db.query(FoodEntry).filter(FoodEntry.user_id == user_id).count()
    total_exercises = db.query(ExerciseEntry).filter(ExerciseEntry.user_id == user_id).count()
    # ... more logic
    return {
        "total_foods": total_foods,
        "total_exercises": total_exercises,
        "days_logged": days_logged
    }
```

3. **Create route** (`backend/app/api/routes/stats.py`):
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth import get_current_user
from app.models.user import User
from app.schemas.stats import StatsResponse
from app.services.stats import get_user_stats

router = APIRouter()

@router.get("/stats", response_model=StatsResponse)
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_user_stats(db, current_user.id)
```

4. **Register router** (`backend/app/api/router.py`):
```python
from app.api.routes import stats

api_router.include_router(stats.router, tags=["stats"])
```

5. **Write tests** (`backend/tests/integration/test_stats.py`):
```python
def test_get_stats(client, auth_headers):
    response = client.get("/stats", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_foods" in data
```

---

## Frontend Development

### Running the Frontend

```bash
cd frontend

# Development mode (hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Adding Dependencies

```bash
cd frontend

# Add runtime dependency
npm install package-name

# Add development dependency
npm install --save-dev package-name

# Examples
npm install axios
npm install --save-dev @types/react
```

### Environment Variables

Create `.env.local` (not committed):
```bash
VITE_API_URL=http://localhost:8000
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

### Adding a New Component

**Example: Create UserBadge component**

1. **Create component** (`frontend/src/components/UserBadge.tsx`):
```typescript
interface UserBadgeProps {
  username: string;
  email: string;
}

export const UserBadge: React.FC<UserBadgeProps> = ({ username, email }) => {
  return (
    <div className="user-badge">
      <h3>{username}</h3>
      <p>{email}</p>
    </div>
  );
};
```

2. **Create styles** (`frontend/src/styles/user-badge.css`):
```css
.user-badge {
  padding: 1rem;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
```

3. **Use component**:
```typescript
import { UserBadge } from '@/components/UserBadge';
import '@/styles/user-badge.css';

export const ProfilePage = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <UserBadge username={user.username} email={user.email} />
    </div>
  );
};
```

4. **Write tests** (`frontend/src/components/UserBadge.test.tsx`):
```typescript
import { render, screen } from '@testing-library/react';
import { UserBadge } from './UserBadge';

describe('UserBadge', () => {
  it('renders username and email', () => {
    render(<UserBadge username="johndoe" email="john@example.com" />);
    expect(screen.getByText('johndoe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});
```

---

## Database Management

### Local Development (SQLite)

**Location**: `backend/health_tracking.db`

**Reset database**:
```bash
cd backend
rm health_tracking.db
# Tables will auto-create on next server start
```

**Backup database**:
```bash
cd backend
cp health_tracking.db health_tracking_backup_$(date +%Y%m%d).db
```

### Production (PostgreSQL)

**Connection**:
```bash
# Set in .env
DATABASE_URL=postgresql://user:password@host/database
```

**Migrations (Future with Alembic)**:
```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback one version
alembic downgrade -1
```

---

## Testing

See [TESTING.md](TESTING.md) for comprehensive testing guide.

**Quick Reference:**

```bash
# Backend tests
cd backend
uv run pytest tests/ -v --cov=app

# Frontend tests
cd frontend
npm test

# Run specific test file
uv run pytest tests/integration/test_auth.py -v
npm test -- AddFoodForm.test.tsx
```

---

## Debugging

### Backend Debugging

**Print debugging**:
```python
print(f"Debug: user_id={user_id}, date={date}")
```

**VS Code debugger** (`.vscode/launch.json`):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["app.main:app", "--reload"],
      "cwd": "${workspaceFolder}/backend",
      "env": {"PYTHONPATH": "${workspaceFolder}/backend"}
    }
  ]
}
```

### Frontend Debugging

**Console logging**:
```typescript
console.log('Debug:', { user, date, entries });
```

**Browser DevTools**:
- F12 → Console tab
- Network tab for API requests
- React DevTools extension

---

## Common Tasks

### Reset Everything

```bash
# Backend
cd backend
rm health_tracking.db
rm -rf .venv
uv sync

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install

# Restart servers
./start-dev.sh
```

### Update Dependencies

```bash
# Backend
cd backend
uv sync --upgrade

# Frontend
cd frontend
npm update
```

### Format Code

```bash
# Backend (Black)
cd backend
uv run black app/ tests/

# Frontend (Prettier)
cd frontend
npx prettier --write src/
```

### Lint Code

```bash
# Backend (Flake8)
cd backend
uv run flake8 app/

# Frontend (ESLint)
cd frontend
npm run lint
```

---

## Troubleshooting

### Backend won't start

**Error**: `ModuleNotFoundError: No module named 'app'`

**Solution**:
```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

### Frontend can't connect to backend

**Error**: `Network Error` or `CORS error`

**Solution**:
1. Check backend is running: http://localhost:8000/health
2. Check CORS config in `backend/app/main.py`
3. Clear browser cache

### Database errors

**Error**: `table does not exist`

**Solution**:
```bash
# SQLite: Delete and recreate
cd backend
rm health_tracking.db
# Restart backend server to auto-create tables
```

### Port already in use

**Error**: `Address already in use`

**Solution**:
```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>

# Or use different port
uv run uvicorn app.main:app --reload --port 8001
```

---

## Next Steps

- Read [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines
- Review [ARCHITECTURE.md](../ARCHITECTURE.md) for system design
- Check [API_REFERENCE.md](../api/API_REFERENCE.md) for API docs
- See [TESTING.md](TESTING.md) for testing strategies

Happy coding! 🚀
