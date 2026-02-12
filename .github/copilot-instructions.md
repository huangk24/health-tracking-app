# Health Tracking App - Copilot Instructions

## Project Overview
A health tracking application for monitoring daily calorie intake and consumption to support weight management goals (gain/loss).

## Stack (Option B - Implemented)
- **Backend**: FastAPI (Python) + SQLAlchemy + SQLite
- **Frontend**: React + Vite + TypeScript
- **Auth**: JWT tokens + bcrypt password hashing
- **Testing**: pytest (backend 90%+ coverage), vitest (frontend)
- **Package Manager**: uv (Python), npm (JavaScript)

## Architecture & Key Patterns

### Backend Structure ([backend/app](backend/app))
- **Single-responsibility files**: One route/model/schema/service per file
- **Layered architecture**: Routes → Services → Models (database)
- **Database**: SQLAlchemy ORM with [app/database.py](backend/app/database.py), tables auto-created on startup
- **Authentication**: JWT tokens in [app/services/auth.py](backend/app/services/auth.py), bcrypt password hashing (case-sensitive)
- **API routes**: Grouped under `/auth` prefix in [app/api/routes/auth.py](backend/app/api/routes/auth.py)

### Frontend Structure ([frontend/src](frontend/src))
- **Context-based auth**: [contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx) manages global auth state with localStorage
- **Protected routes**: [components/ProtectedRoute.tsx](frontend/src/components/ProtectedRoute.tsx) wraps authenticated pages
- **API client**: [services/api.ts](frontend/src/services/api.ts) handles all backend requests
- **Page routing**: React Router with `/login`, `/register`, `/dashboard`

## Development Workflow

### Backend
```bash
cd backend
uv sync  # Install dependencies and create .venv
uv run uvicorn app.main:app --reload  # Dev server on :8000
uv run pytest tests/ -v  # Run tests with coverage
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Vite dev server on :5173
npm test  # Run tests
```

### Database
- SQLite file: [backend/health_tracking.db](backend/health_tracking.db)
- Migrations: Not implemented yet (tables auto-create)
- Test DB: Separate SQLite file per test

## Critical Implementation Details

### Password Security
- **Case-sensitive**: Passwords use bcrypt and preserve case
- **No duplicate usernames**: Enforced at database level (unique constraint)
- **Min length**: 8 characters (validated in Pydantic schema)

### Authentication Flow
1. Register → Auto-login → Redirect to dashboard
2. Login → Store JWT token + user in localStorage → Protected routes accessible
3. Logout → Clear localStorage → Redirect to login

### API Integration
- **CORS**: Configured in [backend/app/main.py](backend/app/main.py) for `localhost:5173`
- **Token format**: `Authorization: Bearer <token>`
- **Endpoints**: `/auth/register` (POST), `/auth/login` (POST)

### Testing Standards
- **Backend**: 80%+ coverage required (currently 90.70%)
- **Unit tests**: [tests/unit/](backend/tests/unit/) for models/schemas/services
- **Integration tests**: [tests/integration/](backend/tests/integration/) for API endpoints
- **Test fixtures**: [tests/conftest.py](backend/tests/conftest.py) sets up test database

## CI/CD Automation
- **Pre-commit**: Trailing whitespace, end-of-file fixes, YAML validation
- **Commitlint**: Conventional commits enforced
- **CI**: Backend + frontend tests run on PRs (coverage gates enabled)
- **Code review**: CODEOWNERS auto-assigns reviewers

## Common Tasks

### Adding a new backend route
1. Create route file in [app/api/routes/](backend/app/api/routes/)
2. Add route to [app/api/router.py](backend/app/api/router.py)
3. Create corresponding tests in [tests/integration/](backend/tests/integration/)

### Adding a new frontend page
1. Create page component in [src/pages/](frontend/src/pages/)
2. Add route in [src/App.tsx](frontend/src/App.tsx)
3. Wrap with `<ProtectedRoute>` if authentication required

### Running the full stack
```bash
# Option 1: One command (recommended)
./start-dev.sh

# Option 2: Two terminals
# Terminal 1: Backend
cd backend && uv run uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend && npm run dev

# Visit http://localhost:5173
```

## Next Steps (Not Yet Implemented)
- User profile updates (sex, age, height, weight)
- Food logging and nutrition tracking
- Goal setting and recommendations
- BMR/TDEE calculations
- Alembic database migrations
- Environment variables for secrets
