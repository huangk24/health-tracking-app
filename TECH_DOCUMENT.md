# Health Tracking App - Option B Implementation (Feb 2026)

## Product Requirements (Summary)
- Authenticated users store profile: sex, age, height, weight, goals
- Log food intake by weight/count/portion; compute nutrients (calories, protein, fats, carbs, fiber, sodium)
- Recommend daily calories and nutrition targets based on goals

## Selected Stack (Option B)
- **Frontend**: React + Vite + Tailwind CSS (TypeScript)
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL + SQLAlchemy
- **Auth**: OAuth2 + JWT
- **Nutrition Data**: USDA FoodData Central API

## Architecture & Data Flow
1. **User Profile** → stored in Postgres via FastAPI; drives BMR/TDEE calculations.
2. **Food Logging** → frontend submits quantity + unit → backend normalizes and fetches nutrition data → daily intake totals stored.
3. **Goals** → backend applies goal modifiers (deficit/surplus) and macro splits → frontend shows recommendations.

## Project Structure (Single-Responsibility Files)
- Backend root: [backend/app](backend/app)
	- [backend/app/main.py](backend/app/main.py): FastAPI app entrypoint
	- [backend/app/api/router.py](backend/app/api/router.py): API router composition
	- [backend/app/api/routes](backend/app/api/routes): route modules, one file per endpoint group
	- [backend/tests/unit](backend/tests/unit): unit tests
	- [backend/tests/integration](backend/tests/integration): integration tests
- Frontend root: [frontend/src](frontend/src)
	- [frontend/src/features](frontend/src/features): feature modules (auth, profile, nutrition, goals)
	- [frontend/src/services](frontend/src/services): API client + data adapters
	- [frontend/src/pages](frontend/src/pages): routed pages
	- [frontend/src/components](frontend/src/components): shared UI components

## Core Domain Model (Backend)
- `UserProfile`: sex, age, height, weight, activity level
- `WeightGoal`: goal type, target rate, start date
- `FoodItem`: name, serving size, nutrition facts
- `CalorieEntry`: date, food item, quantity, totals
- `ExerciseActivity`: name, duration, calories burned

## Nutrition & Recommendation Logic
- **BMR**: Mifflin–St Jeor
- **TDEE**: BMR × activity multiplier
- **Goal modifier**: deficit/surplus based on goal type
- **Macros**: protein-forward for muscle gain, balanced for maintenance

## Testing & Coverage (High Coverage Required)
- **Backend**: pytest + pytest-cov with coverage gate in [backend/pytest.ini](backend/pytest.ini)
- **Frontend**: React Testing Library + Vitest (configure when frontend scaffolded)
- **Coverage target**: keep >= 85% for backend and >= 80% for frontend

## CI/CD + Code Review Automation
- **CI**: Backend + frontend checks in [.github/workflows/ci.yml](.github/workflows/ci.yml)
- **Pre-commit**: repo-wide formatting/sanity hooks in [.pre-commit-config.yaml](.pre-commit-config.yaml)
- **Commit linting**: conventional commits enforced in [.github/workflows/commitlint.yml](.github/workflows/commitlint.yml)
- **Code review**: CODEOWNERS in [.github/CODEOWNERS](.github/CODEOWNERS) + PR template [.github/pull_request_template.md](.github/pull_request_template.md)
- **CD**: placeholder deploy workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml)

## Additional Standards to Implement Next
- **Linting/formatting**: Ruff/Black (backend), ESLint/Prettier (frontend)
- **Type checks**: mypy (backend) + TS strict mode (frontend)
- **Migrations**: Alembic for SQLAlchemy
- **Secrets**: .env.example + secret scanning
- **Observability**: structured logging + health checks
