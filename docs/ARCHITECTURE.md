# Architecture Documentation

## System Overview

The Health Tracking App is a full-stack web application designed with a modern, scalable architecture following industry best practices. The system uses a client-server architecture with a React frontend, FastAPI backend, and PostgreSQL database.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           React SPA (TypeScript + Vite)              │  │
│  │  • React Router for navigation                       │  │
│  │  • Context API for state management                  │  │
│  │  • Axios for HTTP requests                           │  │
│  │  • localStorage for JWT token persistence            │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS/REST API
                            │ JSON payloads
┌───────────────────────────▼─────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            FastAPI Backend (Python 3.11+)            │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │         Presentation Layer (Routes)            │ │  │
│  │  │  • Authentication (/auth/*)                    │ │  │
│  │  │  • Profile (/profile/*)                        │ │  │
│  │  │  • Nutrition (/nutrition/*)                    │ │  │
│  │  │  • Weights (/weights/*)                        │ │  │
│  │  │  • Exercise (/exercise/*)                      │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │          Business Logic Layer (Services)       │ │  │
│  │  │  • Authentication & Authorization              │ │  │
│  │  │  • Nutrition Calculations (BMR/TDEE)           │ │  │
│  │  │  • USDA FoodData Central Integration           │ │  │
│  │  │  • User Profile Management                     │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │        Data Access Layer (Models)              │ │  │
│  │  │  • SQLAlchemy ORM                              │ │  │
│  │  │  • Pydantic Schemas (Validation)               │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │ SQL Queries
                            │ Connection Pool
┌───────────────────────────▼─────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                PostgreSQL Database                    │  │
│  │  Tables: users, food_entries, weight_entries,        │  │
│  │          exercise_entries, custom_foods              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

External Services:
┌─────────────────────────┐
│  USDA FoodData Central  │ ◄─── API Integration
│  (Nutritional Database) │
└─────────────────────────────────┘
```

## Design Patterns & Principles

### Backend Architecture

#### 1. Layered Architecture
The backend follows a strict three-layer architecture:

**Presentation Layer** (`app/api/routes/*.py`)
- Handles HTTP requests/responses
- Input validation via Pydantic schemas
- Route definitions and endpoint logic
- Dependency injection for authentication

**Business Logic Layer** (`app/services/*.py`)
- Core application logic
- Calculations (BMR, TDEE, macro distributions)
- External API integrations (USDA)
- Business rule enforcement

**Data Access Layer** (`app/models/*.py`)
- SQLAlchemy ORM models
- Database schema definitions
- Relationships and constraints
- Query abstraction

#### 2. Repository Pattern
Each model has corresponding service functions that abstract database operations:
```python
# Service layer abstracts data access
def get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()
```

#### 3. Dependency Injection
FastAPI's built-in DI system is used extensively:
```python
@router.get("/profile")
async def get_profile(
    current_user: User = Depends(get_current_user),  # Auth dependency
    db: Session = Depends(get_db)                     # DB dependency
):
    # Route logic
```

#### 4. Single Responsibility Principle
Each module has one clear purpose:
- `auth.py` - Authentication/authorization only
- `nutrition.py` - Nutrition calculations only
- `usda.py` - USDA API integration only

### Frontend Architecture

#### 1. Component-Based Architecture
React components follow a clear hierarchy:

```
App.tsx (Root)
├── HomePage
├── LoginPage / RegisterPage
└── DashboardPage (Protected)
    ├── NutritionSummary
    ├── MealSection
    │   └── AddFoodForm
    │       └── CustomFoodManager
    ├── ExerciseSection
    │   └── AddExerciseForm
    ├── WeightTrend
    ├── DailyWeightLogger
    └── WeeklyComparison
```

#### 2. Context API for Global State
`AuthContext` manages:
- User authentication state
- JWT token storage/retrieval
- Login/logout operations
- Protected route access

#### 3. Custom Hooks
Reusable logic extracted into hooks:
- `useAuth()` - Access authentication context
- State management hooks for forms

#### 4. Service Layer Pattern
API calls abstracted in `services/api.ts`:
```typescript
export const nutritionApi = {
  getDailySummary: (date: string) => api.get(`/nutrition/daily?date=${date}`),
  createFoodEntry: (data: FoodEntryCreate) => api.post('/nutrition/entries', data),
  // ... more methods
};
```

## Data Flow

### Authentication Flow
```
1. User submits credentials
   ↓
2. Frontend → POST /auth/login
   ↓
3. Backend validates credentials (bcrypt)
   ↓
4. Backend generates JWT token
   ↓
5. Frontend stores token in localStorage
   ↓
6. Frontend updates AuthContext
   ↓
7. Protected routes become accessible
```

### Daily Nutrition Flow
```
1. User navigates to Dashboard
   ↓
2. Frontend → GET /nutrition/daily?date=YYYY-MM-DD
   ↓
3. Backend queries:
   - food_entries (for selected date)
   - exercise_entries (for selected date)
   - user profile (for goals)
   ↓
4. Backend calculates:
   - Total calories consumed
   - Total macros (protein, carbs, fat)
   - Total calories burned (exercise)
   - Net calories
   - Remaining to goal
   ↓
5. Frontend displays:
   - Calories ring chart
   - Macro donut chart
   - Meal breakdown
   - Exercise summary
```

### Food Logging Flow
```
1. User selects food source (USDA/Custom/Manual)
   ↓
2a. USDA: Search → Select → Preview nutrition
2b. Custom: Select from saved foods
2c. Manual: Enter values directly
   ↓
3. User enters quantity/serving
   ↓
4. Frontend calculates proportional nutrition
   ↓
5. Frontend → POST /nutrition/entries
   ↓
6. Backend validates and saves to database
   ↓
7. Frontend refreshes dashboard
```

## Database Schema

### Entity-Relationship Diagram

```
┌─────────────────────┐
│       users         │
├─────────────────────┤
│ id (PK)             │
│ username (UNIQUE)   │
│ email               │
│ hashed_password     │
│ sex                 │◄───┐
│ age                 │    │
│ height_cm           │    │ Foreign Key
│ weight_kg           │    │ Relationships
│ activity_level      │    │
│ goal                │    │
│ use_custom_nutrition│    │
│ custom_calories     │    │
│ created_at          │    │
│ updated_at          │    │
└─────────────────────┘    │
                           │
         ┌─────────────────┼─────────────────┬─────────────────┐
         │                 │                 │                 │
         ▼                 ▼                 ▼                 ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  food_entries   │ │weight_entries│ │exercise_entries│ │custom_foods│
├─────────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤
│ id (PK)         │ │ id (PK)      │ │ id (PK)      │ │ id (PK)      │
│ user_id (FK)    │ │ user_id (FK) │ │ user_id (FK) │ │ user_id (FK) │
│ meal_type       │ │ weight_kg    │ │ name         │ │ name         │
│ food_name       │ │ date         │ │ calories_...│ │ unit         │
│ serving_...     │ │ created_at   │ │ date         │ │ calories     │
│ calories        │ └──────────────┘ │ created_at   │ │ protein_g    │
│ protein_g       │                  │ updated_at   │ │ carbs_g      │
│ carbs_g         │                  └──────────────┘ │ fat_g        │
│ fat_g           │                                    │ fiber_g      │
│ fiber_g         │                                    │ sodium_mg    │
│ sodium_mg       │                                    │ created_at   │
│ fdc_id          │                                    └──────────────┘
│ date            │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

### Key Indexes
```sql
-- Performance-critical indexes
CREATE INDEX idx_food_entries_user_date ON food_entries(user_id, date);
CREATE INDEX idx_weight_entries_user_date ON weight_entries(user_id, date);
CREATE INDEX idx_exercise_entries_user_date ON exercise_entries(user_id, date);
CREATE INDEX idx_custom_foods_user ON custom_foods(user_id);
```

## Security Architecture

### Authentication & Authorization

#### JWT Token System
```
Token Structure:
{
  "sub": "username",        # Subject (username)
  "exp": 1234567890,       # Expiration timestamp
  "iat": 1234567890        # Issued at timestamp
}

Signed with HS256 algorithm using SECRET_KEY
```

#### Security Measures
1. **Password Hashing**: bcrypt with 12 rounds (cost factor)
2. **Token Expiry**: JWT tokens expire after 30 days
3. **HTTPS Only**: All production traffic over TLS
4. **CORS Policy**: Restricted to frontend domain
5. **SQL Injection Prevention**: SQLAlchemy ORM parameterized queries
6. **XSS Prevention**: React auto-escapes all rendered content
7. **User Isolation**: All queries filtered by `user_id`

### Input Validation

**Backend (Pydantic)**
```python
class FoodEntryCreate(BaseModel):
    food_name: str = Field(..., min_length=1, max_length=200)
    calories: float = Field(..., ge=0, le=5000)
    protein_g: float = Field(0, ge=0, le=500)
    # ... validation rules
```

**Frontend (TypeScript)**
- Strong typing prevents invalid data
- Form validation before submission
- Client-side range checks

## Performance Considerations

### Backend Optimizations
1. **Database Connection Pooling**: SQLAlchemy connection pool (size=5, max_overflow=10)
2. **Lazy Loading**: Relationships loaded on-demand
3. **Query Optimization**: Eager loading with `joinedload()` where appropriate
4. **Response Compression**: Gzip compression for large responses
5. **Async I/O**: FastAPI ASGI for non-blocking operations

### Frontend Optimizations
1. **Code Splitting**: React.lazy() for route-based splitting
2. **Asset Optimization**: Vite bundles and minifies production builds
3. **Caching**: localStorage for user preferences and token
4. **Debouncing**: Search inputs debounced to reduce API calls
5. **Memo/Callback**: React optimization hooks for expensive renders

### Caching Strategy
- **Static Assets**: 1-year cache with content hashing
- **API Responses**: No caching (real-time health data)
- **USDA Search**: Consider implementing Redis cache in future

## Scalability

### Current Limitations (Free Tier)
- **Database**: 512MB storage on Neon (suitable for ~10K users)
- **Backend**: 512MB RAM on Render (auto-sleeps after 15min inactivity)
- **Frontend**: Static hosting (no server-side limits)

### Scaling Path
1. **Short-term** (100-1K users):
   - Upgrade to Neon Pro ($19/mo) - 10GB storage
   - Upgrade to Render Starter ($7/mo) - 512MB always-on

2. **Medium-term** (1K-10K users):
   - Add Redis caching layer
   - Implement database read replicas
   - CDN for static assets (Cloudflare)

3. **Long-term** (10K+ users):
   - Containerization with Docker
   - Kubernetes orchestration
   - Horizontal scaling with load balancers
   - Separate microservices (Auth, Nutrition, Analytics)

## Deployment Architecture

### Production Environment (Render + Neon)
```
┌──────────────────────────────────────────────────┐
│              Render.com Platform                 │
│                                                  │
│  ┌────────────────────┐  ┌───────────────────┐ │
│  │   Static Site      │  │   Web Service     │ │
│  │   (Frontend)       │  │   (Backend)       │ │
│  │                    │  │                   │ │
│  │  • React build     │  │  • FastAPI app    │ │
│  │  • Nginx server    │  │  • Uvicorn ASGI   │ │
│  │  • Auto SSL        │  │  • Auto scaling   │ │
│  │  • Global CDN      │  │  • Health checks  │ │
│  └────────────────────┘  └─────────┬─────────┘ │
│                                    │           │
└────────────────────────────────────┼───────────┘
                                     │
                                     │ PostgreSQL
                                     │ Connection
                                     ▼
                          ┌──────────────────────┐
                          │    Neon.tech         │
                          │  PostgreSQL Database │
                          │  • Auto-scaling      │
                          │  • Auto-backups      │
                          │  • Point-in-time     │
                          │    recovery          │
                          └──────────────────────┘
```

### CI/CD Pipeline (Future)
```
Git Push → GitHub Actions
    ↓
  Tests (pytest + vitest)
    ↓
  Lint (black + eslint)
    ↓
  Build (uv + npm)
    ↓
  Deploy to Render (auto)
```

## Technology Decisions

### Why FastAPI over Flask/Django?
- **Performance**: ASGI async I/O (3-4x faster than Flask)
- **Type Safety**: Automatic validation with Pydantic
- **API Documentation**: Auto-generated OpenAPI/Swagger docs
- **Modern Python**: Native async/await support

### Why React over Vue/Angular?
- **Ecosystem**: Largest component library selection
- **Community**: Most StackOverflow answers and tutorials
- **Performance**: Virtual DOM with concurrent rendering
- **Flexibility**: Unopinionated architecture

### Why PostgreSQL over MongoDB?
- **Data Structure**: Relational health data (users → entries)
- **ACID Compliance**: Critical for calorie tracking accuracy
- **Query Power**: Complex aggregations with SQL
- **Data Integrity**: Foreign keys and constraints

### Why TypeScript over JavaScript?
- **Type Safety**: Catch bugs at compile-time
- **IDE Support**: IntelliSense and autocomplete
- **Refactoring**: Safe large-scale code changes
- **Documentation**: Types serve as inline docs

## Future Architectural Improvements

### Planned Enhancements
1. **Microservices**: Split into Auth, Nutrition, Analytics services
2. **Event-Driven**: Message queue (RabbitMQ) for async processing
3. **Caching Layer**: Redis for USDA search results
4. **Real-time Updates**: WebSocket for live dashboard updates
5. **Mobile Apps**: React Native or Flutter apps
6. **Analytics Pipeline**: Data warehouse for insights
7. **AI/ML**: Personalized nutrition recommendations
8. **Third-party Integrations**: Fitbit, MyFitnessPal, Apple Health

### Technical Debt
- **Database Migrations**: Implement Alembic for schema versioning
- **Environment Variables**: Move secrets to .env files
- **Error Monitoring**: Add Sentry for error tracking
- **Logging**: Structured logging with ELK stack
- **API Versioning**: Version API endpoints (/api/v1/...)
- **Rate Limiting**: Prevent API abuse
- **E2E Tests**: Add Playwright for comprehensive testing

## Monitoring & Observability

### Current Monitoring
- **Render Dashboard**: CPU, memory, request metrics
- **Neon Dashboard**: Database connections, query performance
- **Browser DevTools**: Frontend performance and errors

### Future Monitoring Stack
- **APM**: New Relic or DataDog
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Alerting**: PagerDuty for critical incidents
- **Metrics**: Prometheus + Grafana dashboards

## Conclusion

This architecture prioritizes:
1. **Simplicity**: Easy to understand and maintain
2. **Security**: Defense-in-depth approach
3. **Scalability**: Clear path to handle growth
4. **Developer Experience**: Fast feedback loops
5. **User Experience**: Fast, responsive, reliable

The system is production-ready for small to medium user bases (up to 10K users) with a clear roadmap for scaling to enterprise levels.
