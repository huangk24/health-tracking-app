# Health Tracking App - Implementation Notes (Feb 2026)

## Product Requirements (Summary)
- Authenticated users store profile: sex, age, height, weight, goals
- Log food intake by weight/count/portion; compute nutrients (calories, protein, fats, carbs, fiber, sodium)
- Recommend daily calories and nutrition targets based on goals
- Track meals and exercises by day using PST

## Selected Stack
- **Frontend**: React + Vite + TypeScript (CSS modules + global styles)
- **Backend**: FastAPI (Python) + SQLAlchemy
- **Database**: SQLite (auto-creates tables on startup)
- **Auth**: JWT tokens + bcrypt password hashing
- **Nutrition Data**: USDA FoodData Central API
- **Package Management**: uv (Python), npm (JavaScript)

## Architecture & Data Flow
1. **User Profile** → stored via SQLAlchemy; drives BMR/TDEE calculations when profile is complete.
2. **Custom Nutrition Goals** → users can override calculated targets with custom calories (1000-4000) and macro percentages (protein, carbs, fat) → stored in user model → prioritized over BMR/TDEE calculations in nutrition service.
3. **Custom Foods** → users create reusable food entries with name, unit, reference_amount, and nutrition values → stored per user → proportional calculation when logging (quantity/reference_amount × nutrition values).
4. **Food Logging** → frontend submits quantity + unit from three sources (USDA, Custom Foods, Manual Entry) → backend normalizes nutrition → daily intake totals stored.
5. **Exercise Logging** → calories burned are applied to daily remaining calories.
6. **Weight Tracking** → daily weight entries with date → historical trends visualized in interactive charts.
7. **Weekly Weight Comparison** → backend analyzes weight changes over time → calculates week-over-week differences, trends, and goal progress → frontend displays visual indicators and statistics.
8. **Weight Entry Management** → users can add/delete weight entries from profile page → backend validates and manages weight history.
9. **Daily Summary** → backend aggregates meals + exercises for a PST day → frontend renders summary cards.

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
- `User`: auth + profile fields (sex, age, height, weight, activity level, goal) + custom nutrition fields (use_custom_nutrition, custom_calories, custom_protein_percent, custom_carbs_percent, custom_fat_percent) + relationship to custom_foods
- `CustomFood`: user-specific reusable food entries with name, unit (standardized: g, oz, ml, cup, tbsp, tsp, serving, piece, slice), reference_amount, calories, protein_g, carbs_g, fat_g, fiber_g, sodium_mg
- `FoodEntry`: meal type, food name, portion, nutrition data, date, user association
- `ExerciseEntry`: name, calories burned, date, user association
- `WeightEntry`: weight (kg), date, user association for daily weight tracking with weekly comparisons

## Nutrition & Recommendation Logic
- **BMR**: Mifflin–St Jeor
- **TDEE**: BMR × activity multiplier
- **Goal modifier**: deficit/surplus based on goal type
- **Macros**: protein-forward for muscle gain, balanced for maintenance
- **Custom Override**: When `use_custom_nutrition` is true, user's custom calories and macro percentages take precedence over calculated values. Backend validates calorie range (1000-4000) and converts percentages to grams. Frontend provides interactive sliders with auto-balancing to maintain 100% total.
- **Custom Food Proportional Calculation**: When logging from custom foods, nutrition values scale proportionally: `(entered_amount / reference_amount) × stored_nutrition_values`. Example: If custom food is "Protein Powder" with 150 cal per 39g, entering 25g calculates (25/39) × 150 = 96 cal.

## Testing & Coverage (High Coverage Required)
- **Backend**: pytest + pytest-cov with coverage gate in [backend/pyproject.toml](backend/pyproject.toml)
- **Frontend**: Vitest
- **Coverage target**: keep >= 80% for backend and >= 80% for frontend

## Dependency Management with uv
This project uses [uv](https://github.com/astral-sh/uv) for Python package management, offering:
- **Fast dependency resolution**: 10-100x faster than pip
- **Reproducible builds**: uv.lock ensures consistent installs
- **Virtual environment management**: automatic .venv creation
- **pyproject.toml-first**: dependencies declared in [backend/pyproject.toml](backend/pyproject.toml)

### Key Commands
```bash
# Install/sync all dependencies (creates .venv automatically)
uv sync

# Run commands in the virtual environment
uv run uvicorn app.main:app --reload
uv run pytest tests/ -v

# Add new dependencies
uv add fastapi  # production dependency
uv add --dev pytest  # development dependency

# Update all dependencies
uv sync --upgrade
```

### Project Structure
- **pyproject.toml**: declares all dependencies (production + dev)
- **uv.lock**: lockfile with pinned versions (commit this!)
- **.venv/**: virtual environment (auto-created, gitignored)

## CI/CD + Code Review Automation
- **CI**: Backend + frontend checks in [.github/workflows/ci.yml](.github/workflows/ci.yml)
- **Pre-commit**: repo-wide formatting/sanity hooks in [.pre-commit-config.yaml](.pre-commit-config.yaml)
- **Commit linting**: conventional commits enforced in [.github/workflows/commitlint.yml](.github/workflows/commitlint.yml)
- **Code review**: CODEOWNERS in [.github/CODEOWNERS](.github/CODEOWNERS) + PR template [.github/pull_request_template.md](.github/pull_request_template.md)
- **CD**: placeholder deploy workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml)

## UI/UX Design Patterns
- **Segmented Controls**: Food source selector uses iOS-style segmented control with smooth transitions, white background for selected state, and subtle shadows
- **Nutrition Info Cards**: Gradient backgrounds (light purple/blue), structured row layout with label-value separation, section dividers with arrow icons for calculated values
- **Custom Food Management**: Modal-based interface with create/edit/delete actions, inline edit with form pre-population, button animations on hover
- **Responsive Typography**: Proper font weights and hierarchies, letter-spacing for headers, color-coded sections (primary: #4f46e5, secondary: #6366f1)

## Additional Standards to Implement Next
- **Linting/formatting**: Ruff/Black (backend), ESLint/Prettier (frontend)
- **Type checks**: mypy (backend) + TS strict mode (frontend)
- **Migrations**: Alembic for SQLAlchemy
- **Secrets**: .env.example + secret scanning
- **Observability**: structured logging + health checks
