# Health Tracking App - Implementation Notes (Feb 2026)

## Product Requirements (Summary)
- Authenticated users store profile: sex, age, height, weight, goals
- Log food intake by weight/count/portion; compute nutrients (calories, protein, fats, carbs, fiber, sodium)
- Recommend daily calories and nutrition targets based on goals
- Track meals and exercises by day using PST

## Selected Stack
- **Frontend**: React + Vite + TypeScript (CSS modules + global styles)
- **Backend**: FastAPI (Python) + SQLAlchemy
- **Database**: PostgreSQL (Neon) in production, SQLite for local development
- **Hosting**: Render.com (frontend static site + backend web service)
- **Auth**: JWT tokens + bcrypt password hashing
- **Nutrition Data**: USDA FoodData Central API
- **Package Management**: uv (Python), npm (JavaScript)

## Live Deployment
- **Frontend**: https://health-tracking-frontend.onrender.com
- **Backend API**: https://health-tracking-backend.onrender.com
- **Database**: PostgreSQL on Neon.tech (512MB free tier)

## Technology Choices & Rationale

### Frontend: TypeScript + React + Vite

**TypeScript over JavaScript**
- **Type Safety**: Catch bugs at compile-time rather than runtime. Critical for health data where calculation errors could mislead users.
- **Developer Experience**: IntelliSense provides autocomplete, inline documentation, and refactoring confidence.
- **Interface Contracts**: Strong typing between frontend and backend ensures API integration correctness.
- **Scalability**: As the codebase grows, TypeScript prevents common JS pitfalls (undefined properties, type coercion bugs).

**React over Vue/Angular/Svelte**
- **Ecosystem Maturity**: Largest component library ecosystem (UI kits, charts, forms) accelerates development.
- **Hiring & Community**: Largest developer pool and most StackOverflow answers for rapid problem-solving.
- **Performance**: Virtual DOM with React 18+ concurrent features provides smooth UX for data-heavy dashboards.
- **Flexibility**: Unopinionated architecture allows choosing best patterns (Context API, custom hooks) without framework lock-in.

**Vite over Create React App/Webpack**
- **Speed**: Cold starts in ~100ms vs 30+ seconds with CRA. Hot module replacement (HMR) is instant.
- **Modern Defaults**: Native ES modules, optimized production builds, zero config for TypeScript.
- **Build Size**: Rollup-powered production builds are 30-40% smaller than webpack equivalents.
- **Future-Proof**: CRA is deprecated; Vite is actively maintained by Vue/React communities.

### Backend: Python + FastAPI + SQLAlchemy

**Python over Node.js (JavaScript)**
- **Nutrition Science Libraries**: NumPy, pandas, scikit-learn for future ML-based recommendations. No equivalent maturity in JS.
- **Type System**: Python 3.11+ type hints with Pydantic provide runtime validation that JS lacks.
- **Scientific Credibility**: Nutrition calculations (BMR, TDEE) use well-documented Python implementations trusted by health tech.
- **Developer Productivity**: Readable syntax reduces bugs in complex business logic (macro calculations, goal adjustments).
- **Data Processing**: Natural language for ETL pipelines if scaling to batch imports from wearables/APIs.

**FastAPI over Flask/Django/Express**
- **Performance**: ASGI-based async I/O handles 3-4x more requests/second than Flask. Comparable to Node.js performance.
- **Automatic Docs**: OpenAPI (Swagger) + ReDoc generated from type hints. Zero maintenance cost for API documentation.
- **Type Validation**: Pydantic models provide request/response validation + serialization. Django requires manual serializers.
- **Modern Python**: Native async/await support. Flask's @app.route doesn't leverage Python's async capabilities.
- **Developer Experience**: Autocomplete for routes, dependency injection, and automatic error handling reduce boilerplate.

**SQLAlchemy over Raw SQL/Django ORM**
- **Database Agnosticism**: Easy migration from SQLite (dev) → PostgreSQL (production) without query rewrites.
- **Query Flexibility**: Hybrid approach—ORM for CRUD, raw SQL for complex aggregations (weekly weight trends).
- **Relationship Management**: Declarative relationships (User → FoodEntry) prevent foreign key mistakes.
- **Type Safety**: Models with type hints integrate seamlessly with FastAPI's Pydantic validation.

### Database: SQLite (Local) → PostgreSQL (Production)

**Relational over NoSQL (MongoDB/Firebase)**
- **Data Structure**: Health tracking has strict schemas (User, FoodEntry, WeightEntry) with foreign key relationships. NoSQL's flexibility is unnecessary.
- **ACID Guarantees**: Critical for financial-like data (calorie budgets). NoSQL eventual consistency could show incorrect daily totals.
- **Query Power**: SQL joins are essential for aggregating meals + exercises + goals in single queries. NoSQL requires multiple round-trips.
- **Data Integrity**: Constraints (unique usernames, non-null calories) prevent corrupt data. NoSQL validation is application-level only.

**SQLite (Development) + PostgreSQL (Production)**
- **Development**: SQLite for simplicity, zero configuration, single file database. Perfect for local development.
- **Production**: PostgreSQL on Neon.tech for scalability, concurrent writes, and cloud infrastructure.
- **Migration**: SQLAlchemy abstracts the database via `DATABASE_URL` environment variable:
  - Local: `sqlite:///./health_tracking.db` (default fallback)
  - Production: `postgresql://user:password@host/database` (from Neon)
- **Code Changes**: Minimal - added `psycopg2-binary` driver and conditional `connect_args` in [backend/app/database.py](backend/app/database.py)
- **Benefits**: PostgreSQL provides better concurrency, full-text search capability, JSON operations, and multi-region replication for future scaling.

### Authentication: JWT + bcrypt

**JWT over Session Cookies**
- **Stateless**: No server-side session storage required. Scales horizontally without sticky sessions/Redis.
- **Mobile-Friendly**: Tokens work seamlessly in native apps. Cookies have CORS/SameSite complexity.
- **Microservices Ready**: Token validation can happen in any service without database lookup.
- **Expiration Control**: Built-in `exp` claim with automatic validation. Sessions require manual cleanup.

**bcrypt over Argon2/scrypt**
- **Industry Standard**: Proven track record since 1999. Known security properties and attack patterns.
- **Tunable Work Factor**: Easy to increase cost as hardware improves (currently 12 rounds).
- **Library Maturity**: Python's `bcrypt` is battle-tested with minimal CVEs.
- **Overkill Avoided**: Argon2 is superior but unnecessary for health app (not cryptocurrency/military). bcrypt is sufficient.

### Package Management: uv (Python) + npm (JavaScript)

**uv over pip/poetry**
- **Speed**: 10-100x faster dependency resolution. Critical for CI/CD pipelines.
- **Lock Files**: `uv.lock` provides reproducible builds like npm's package-lock.json. pip lacks this by default.
- **Virtual Environments**: Auto-creates and manages `.venv` without manual `python -m venv`.
- **Compatibility**: Drop-in pip replacement. Existing `requirements.txt` / `pyproject.toml` work unchanged.
- **Modern Tooling**: Built in Rust with modern dependency resolver (like npm 7+).

**npm over yarn/pnpm**
- **Default Choice**: Ships with Node.js. Zero installation friction for new developers.
- **Ecosystem Standard**: 99% of tutorials/docs assume npm. Less cognitive overhead.
- **Monorepo Simplicity**: Not needed yet. Yarn/pnpm shine for monorepos; single React app doesn't benefit.
- **Lock Files**: package-lock.json is sufficient for deterministic builds.

### Data Source: USDA FoodData Central API

**USDA over Custom Nutrition DB**
- **Accuracy**: Government-verified nutrition data. Legal liability reduction for health recommendations.
- **Coverage**: 400K+ foods including branded items. Building this would take years.
- **Maintenance**: USDA updates data quarterly. No manual upkeep required.
- **Trust**: Users recognize USDA branding. Increases credibility vs "our database".
- **Cost**: Free API with generous rate limits (3600 requests/hour). Custom DB requires licensing (nutritionix $500+/month).

### Testing: pytest + vitest

**pytest over unittest**
- **Assertions**: `assert x == y` vs `self.assertEqual(x, y)`. More readable, better error messages.
- **Fixtures**: Modular test setup (database, auth tokens) with dependency injection. unittest requires inheritance gymnastics.
- **Plugins**: Coverage, asyncio, mocking all integrate seamlessly. unittest ecosystem is sparse.

**vitest over Jest**
- **Speed**: 2-10x faster due to native ESM + esbuild. Jest requires babel transpilation.
- **Vite Integration**: Shares config with Vite. Jest needs separate babel/webpack config.
- **Modern Features**: Top-level await, JSX without config, TypeScript without ts-jest shim.

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
