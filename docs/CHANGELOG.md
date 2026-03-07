# Changelog

All notable changes to the Health Tracking App will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Alembic database migrations
- Rate limiting for API endpoints
- Email verification for new accounts
- Password reset functionality
- Weekly/monthly nutrition reports
- Export data feature (CSV/JSON)
- API versioning (/api/v1/)

---

## [1.0.0] - 2026-03-06

### Initial Release 🎉

The first stable release of the Health Tracking App with comprehensive health tracking features.

### Added

#### Core Features
- **User Authentication**
  - User registration with email validation
  - Secure login with JWT token authentication
  - bcrypt password hashing (12 rounds)
  - Token-based session management

#### Profile Management
- **User Profile**
  - Store personal information (sex, age, height, weight)
  - Activity level selection (sedentary to very active)
  - Weight goal selection (lose, maintain, gain)
  - Profile update functionality

- **Custom Nutrition Goals**
  - Override calculated BMR/TDEE with custom calorie targets
  - Set custom macro percentages (protein, carbs, fat)
  - Auto-balancing macro sliders with real-time gram calculation
  - Toggle between recommended and custom nutrition modes

#### Nutrition Tracking
- **Daily Nutrition Dashboard**
  - Calories ring chart with progress visualization
  - Macro donut chart (protein, carbs, fat breakdown)
  - Real-time progress tracking
  - Net calories calculation (consumed - burned)

- **Meal Logging**
  - Four meal types: Breakfast, Lunch, Dinner, Snack
  - Three food sources:
    - **USDA Database**: Search 350,000+ foods
    - **Custom Foods**: Personal food library
    - **Manual Entry**: Quick custom nutrition input
  - Nutritional preview before adding
  - Edit and delete food entries
  - Historical day editing (PST timezone)

- **USDA Food Integration**
  - Real-time search of USDA FoodData Central
  - Nutrition details normalized to 100g
  - Proportional calculation for entered amounts
  - Support for multiple serving units

- **Custom Food Library**
  - Create and save favorite foods
  - Complete nutrition information
  - Standardized units (g, oz, ml, cup, tbsp, tsp, serving, piece, slice)
  - Quick reuse for logging

#### Weight Tracking
- **Daily Weight Logging**
  - Add weight entries with date selection
  - View historical weight data
  - Delete weight entries

- **Weight Visualization**
  - Interactive trend chart (Chart.js)
  - Historical weight progression
  - Visual goal comparison

- **Weekly Weight Comparison**
  - Week-over-week weight analysis
  - Average weight calculation per week
  - Change metrics (kg and percentage)
  - Trend indicators (increasing/decreasing/stable)
  - Goal progress tracking

#### Exercise Tracking
- **Exercise Logging**
  - Log exercise activities with calories burned
  - Date-based exercise entries
  - Multiple exercises per day
  - Edit and delete functionality

- **Exercise Integration**
  - Automatic integration with daily calorie calculations
  - Net calorie adjustment based on exercise
  - Exercise summary in dashboard

#### User Experience
- **Responsive Design**
  - Mobile-optimized layouts (phones ≤768px)
  - Tablet support (769px-1024px)
  - Desktop optimization (1025px+)
  - Touch-friendly tap targets (44px minimum)
  - Adaptive grids and spacing

- **Welcome Modal**
  - First-time user onboarding
  - Step-by-step setup guide
  - Profile completion prompts
  - One-time display (localStorage)

- **Modern UI/UX**
  - Purple/pink gradient theme (#667eea to #764ba2)
  - Glass-morphism effects
  - Smooth animations and transitions
  - Hover effects and visual feedback
  - Professional card layouts

#### Technical Features
- **Backend (FastAPI + Python)**
  - RESTful API architecture
  - SQLAlchemy ORM with PostgreSQL/SQLite
  - Pydantic schema validation
  - Automatic API documentation (Swagger/ReDoc)
  - Health check endpoint
  - CORS middleware configuration

- **Frontend (React + TypeScript)**
  - Vite build system
  - Context API for state management
  - Protected route system
  - Axios API client
  - Chart.js for visualizations
  - LocalStorage for token persistence

- **Database**
  - PostgreSQL for production (Neon.tech)
  - SQLite for local development
  - User isolation (all queries filtered by user_id)
  - Foreign key relationships
  - Indexed queries for performance

- **Deployment**
  - Render.com hosting (frontend + backend)
  - Neon PostgreSQL database
  - Automatic HTTPS
  - Environment-based configuration
  - Health checks and auto-restart

#### Testing
- **Backend Testing**
  - 67 tests total
  - 90.70% code coverage
  - Unit tests for models, schemas, services
  - Integration tests for API endpoints
  - pytest framework

- **Frontend Testing**
  - Vitest test framework
  - React Testing Library
  - Component unit tests
  - API service tests

#### Documentation
- **Comprehensive Documentation**
  - Architecture documentation
  - API reference (all endpoints)
  - Deployment guide (Render + Neon)
  - Contributing guidelines
  - Code of conduct
  - Security policy
  - Development setup guide
  - Testing guide

#### Developer Experience
- **Code Quality**
  - Pre-commit hooks (trailing whitespace, EOF, YAML)
  - Commitlint (Conventional Commits)
  - TypeScript strict mode
  - Python type hints
  - ESLint + Prettier

- **Development Tools**
  - One-command startup script (`start-dev.sh`)
  - Hot reload for backend and frontend
  - Automatic health checks
  - Clear error messages
  - Development environment setup

### Changed
- Migrated from SQLite-only to PostgreSQL for production
- Enhanced UI with gradient theme throughout the app
- Improved mobile responsiveness for all pages
- Refactored nutrition calculation logic for custom goals support

### Fixed
- Backend serialization error with exercise entries
- Frontend health check before loading nutrition data
- USDA food search error handling
- Token expiration handling
- Date timezone consistency (PST)
- Macro percentage validation (must sum to 100%)
- Profile update validation errors

### Security
- JWT token authentication with HS256
- bcrypt password hashing (cost factor: 12)
- SQL injection prevention via ORM
- XSS prevention via React escaping
- User data isolation (queries filtered by user_id)
- HTTPS enforcement in production
- CORS restricted to known origins
- Input validation on all endpoints

---

## Version History

### Version Numbering

We use Semantic Versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes (incompatible API changes)
- **MINOR**: New features (backward-compatible)
- **PATCH**: Bug fixes (backward-compatible)

### Release Types

- **[Unreleased]**: Changes in development, not yet released
- **[X.Y.Z]**: Released version with date

### Change Categories

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

---

## Migration Guide

### Migrating to 1.0.0

This is the first stable release. If you were using a pre-1.0 version:

#### Database Migration

**From SQLite to PostgreSQL:**

1. Export data from SQLite:
```bash
cd backend
python migrate_to_postgres.py --source sqlite:///./health_tracking.db --target $DATABASE_URL
```

2. Update environment variables:
```bash
# .env
DATABASE_URL=postgresql://user:password@host/database
```

3. Restart backend server

#### Frontend Updates

No breaking changes. Clear browser cache to see new UI improvements.

#### API Changes

No breaking API changes in 1.0.0 release.

---

## Upgrade Instructions

### Upgrading from Pre-release

```bash
# 1. Pull latest code
git pull origin main

# 2. Backend: Update dependencies
cd backend
uv sync

# 3. Frontend: Update dependencies
cd frontend
npm install

# 4. Restart servers
./start-dev.sh
```

---

## Known Issues

### Current Limitations

1. **No email verification**: Users can register with any email
2. **No password reset**: Must contact admin if password forgotten
3. **No rate limiting**: Endpoints vulnerable to brute force
4. **No 2FA**: Single factor authentication only
5. **No data export**: Cannot export user data yet
6. **Database migrations**: Manual migrations required (Alembic coming)

See [GitHub Issues](https://github.com/huangk24/health-tracking-app/issues) for full list.

---

## How to Report Issues

Found a bug or have a suggestion?

1. **Check existing issues**: https://github.com/huangk24/health-tracking-app/issues
2. **Open a new issue**: Use the appropriate template
3. **Security issues**: Email security@example.com (do not open public issue)

---

## Contributors

Thank you to all contributors who made this release possible! 🎉

- [Kai Huang](https://github.com/huangk24) - Project Creator and Lead Developer

See the full [Contributors List](https://github.com/huangk24/health-tracking-app/graphs/contributors).

---

**[Unreleased]**: https://github.com/huangk24/health-tracking-app/compare/v1.0.0...HEAD
**[1.0.0]**: https://github.com/huangk24/health-tracking-app/releases/tag/v1.0.0
