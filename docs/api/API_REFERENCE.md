# API Reference

## Base URL

**Development:** `http://localhost:8000`  
**Production:** `https://health-tracking-backend.onrender.com`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Obtaining a Token

Tokens are obtained via login or registration endpoints. Store the token securely and include it in all requests to protected endpoints.

---

## Endpoints

### Health Check

#### `GET /health`

Check if the backend server is running.

**Authentication:** Not required

**Response:** `200 OK`
```json
{
  "status": "healthy"
}
```

---

## Authentication Endpoints

### Register

#### `POST /auth/register`

Create a new user account.

**Authentication:** Not required

**Request Body:**
```json
{
  "username": "string (3-50 chars, alphanumeric + underscore)",
  "email": "string (valid email format)",
  "password": "string (min 8 chars)"
}
```

**Response:** `201 Created`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "sex": null,
    "age": null,
    "height_cm": null,
    "weight_kg": null,
    "activity_level": null,
    "goal": null,
    "use_custom_nutrition": false,
    "custom_calories": null,
    "custom_protein_percent": null,
    "custom_carbs_percent": null,
    "custom_fat_percent": null,
    "created_at": "2026-03-06T10:30:00",
    "updated_at": "2026-03-06T10:30:00"
  }
}
```

**Errors:**
- `400 Bad Request` - Username already exists or validation error
- `422 Unprocessable Entity` - Invalid request format

---

### Login

#### `POST /auth/login`

Authenticate and receive a JWT token.

**Authentication:** Not required

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    // ... (same as register response)
  }
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials

---

## Profile Endpoints

### Get Profile

#### `GET /profile`

Retrieve the authenticated user's profile.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "sex": "male",
  "age": 30,
  "height_cm": 175.0,
  "weight_kg": 75.0,
  "activity_level": "moderate",
  "goal": "maintain",
  "use_custom_nutrition": false,
  "custom_calories": null,
  "custom_protein_percent": null,
  "custom_carbs_percent": null,
  "custom_fat_percent": null,
  "created_at": "2026-03-01T10:00:00",
  "updated_at": "2026-03-06T10:30:00"
}
```

---

### Update Profile

#### `PUT /profile`

Update the authenticated user's profile.

**Authentication:** Required

**Request Body:**
```json
{
  "sex": "male|female",
  "age": "number (10-120)",
  "height_cm": "number (50-300)",
  "weight_kg": "number (20-500)",
  "activity_level": "sedentary|light|moderate|active|very_active",
  "goal": "lose|maintain|gain",
  "use_custom_nutrition": "boolean",
  "custom_calories": "number (1000-4000) | null",
  "custom_protein_percent": "number (0-1) | null",
  "custom_carbs_percent": "number (0-1) | null",
  "custom_fat_percent": "number (0-1) | null"
}
```

**Response:** `200 OK` (same as Get Profile)

**Validation Rules:**
- If `use_custom_nutrition` is true, custom fields must be provided
- Custom macro percentages must sum to 1.0 (100%)
- All fields are optional; only provided fields are updated

**Errors:**
- `400 Bad Request` - Validation error (e.g., invalid sex, macro percentages don't sum to 100%)
- `401 Unauthorized` - Invalid or missing token

---

### Get Nutrition Goals

#### `GET /profile/nutrition-goals`

Calculate and retrieve daily nutrition goals (calories, macros) based on profile or custom settings.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "calories": 2200,
  "protein_g": 165.0,
  "carbs_g": 247.5,
  "fat_g": 61.1,
  "is_custom": true,
  "calculation_method": "custom"
}
```

**Calculation Logic:**
1. **Custom Nutrition** (if enabled): Uses `custom_calories` and macro percentages
2. **Calculated** (if profile complete): BMR × activity multiplier ± goal adjustment
3. **Default Fallback**: 2000 calories, 30% protein, 40% carbs, 30% fat

---

## Nutrition Endpoints

### Get Daily Summary

#### `GET /nutrition/daily`

Get comprehensive nutrition summary for a specific date.

**Authentication:** Required

**Query Parameters:**
- `date` (optional): Date in `YYYY-MM-DD` format (defaults to today in PST)

**Example:** `/nutrition/daily?date=2026-03-06`

**Response:** `200 OK`
```json
{
  "date": "2026-03-06",
  "meals": {
    "breakfast": [
      {
        "id": 1,
        "food_name": "Oatmeal",
        "serving_size": 1.0,
        "serving_unit": "cup",
        "calories": 300,
        "protein_g": 10.0,
        "carbs_g": 54.0,
        "fat_g": 6.0,
        "fiber_g": 8.0,
        "sodium_mg": 100.0,
        "fdc_id": null,
        "created_at": "2026-03-06T08:00:00",
        "updated_at": "2026-03-06T08:00:00"
      }
    ],
    "lunch": [],
    "dinner": [],
    "snack": []
  },
  "exercises": [
    {
      "id": 1,
      "user_id": 1,
      "name": "Running",
      "calories_burned": 300,
      "date": "2026-03-06",
      "created_at": "2026-03-06T09:00:00",
      "updated_at": "2026-03-06T09:00:00"
    }
  ],
  "totals": {
    "calories": 300,
    "protein_g": 10.0,
    "carbs_g": 54.0,
    "fat_g": 6.0,
    "fiber_g": 8.0,
    "sodium_mg": 100.0
  },
  "goals": {
    "calories": 2200,
    "protein_g": 165.0,
    "carbs_g": 247.5,
    "fat_g": 61.1
  },
  "net_calories": 0,
  "remaining_calories": 1900,
  "total_exercise_calories": 300
}
```

---

### Create Food Entry

#### `POST /nutrition/entries`

Log a food entry for a specific meal.

**Authentication:** Required

**Request Body:**
```json
{
  "meal_type": "breakfast|lunch|dinner|snack",
  "food_name": "string (1-200 chars)",
  "serving_size": "number (>0)",
  "serving_unit": "string (1-50 chars)",
  "calories": "number (0-5000)",
  "protein_g": "number (0-500, default: 0)",
  "carbs_g": "number (0-1000, default: 0)",
  "fat_g": "number (0-500, default: 0)",
  "fiber_g": "number (0-500, default: 0)",
  "sodium_mg": "number (0-50000, default: 0)",
  "fdc_id": "string | null",
  "date": "string (YYYY-MM-DD, default: today PST)"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "food_name": "Oatmeal",
  "serving_size": 1.0,
  "serving_unit": "cup",
  "calories": 300,
  "protein_g": 10.0,
  "carbs_g": 54.0,
  "fat_g": 6.0,
  "fiber_g": 8.0,
  "sodium_mg": 100.0,
  "fdc_id": null,
  "date": "2026-03-06",
  "meal_type": "breakfast",
  "created_at": "2026-03-06T08:00:00",
  "updated_at": "2026-03-06T08:00:00"
}
```

**Errors:**
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Invalid token

---

### Delete Food Entry

#### `DELETE /nutrition/entries/{entry_id}`

Delete a specific food entry.

**Authentication:** Required

**Path Parameters:**
- `entry_id`: ID of the food entry to delete

**Response:** `204 No Content`

**Errors:**
- `404 Not Found` - Entry doesn't exist or doesn't belong to user
- `401 Unauthorized` - Invalid token

---

### Search USDA Foods

#### `GET /nutrition/usda/search`

Search the USDA FoodData Central database.

**Authentication:** Required

**Query Parameters:**
- `query` (required): Search term (min 2 chars)
- `page_size` (optional): Results per page (default: 20, max: 50)

**Example:** `/nutrition/usda/search?query=apple&page_size=10`

**Response:** `200 OK`
```json
{
  "foods": [
    {
      "fdcId": 1234567,
      "description": "Apple, raw",
      "brandName": null,
      "dataType": "Survey (FNDDS)",
      "foodCategory": "Fruits and Fruit Juices"
    }
  ],
  "totalHits": 156,
  "currentPage": 1,
  "totalPages": 16
}
```

**Errors:**
- `400 Bad Request` - Missing or invalid query
- `503 Service Unavailable` - USDA API unavailable or API key missing

---

### Get USDA Food Details

#### `GET /nutrition/usda/{fdc_id}/details`

Get detailed nutrition information for a specific USDA food.

**Authentication:** Required

**Path Parameters:**
- `fdc_id`: USDA FoodData Central ID

**Example:** `/nutrition/usda/1234567/details`

**Response:** `200 OK`
```json
{
  "fdc_id": "1234567",
  "description": "Apple, raw",
  "nutrients": {
    "calories": 52.0,
    "protein_g": 0.3,
    "carbs_g": 14.0,
    "fat_g": 0.2,
    "fiber_g": 2.4,
    "sodium_mg": 1.0
  },
  "serving_size": 100.0,
  "serving_unit": "g"
}
```

**Note:** All nutrition values are normalized to 100g for consistency.

**Errors:**
- `404 Not Found` - Food not found in USDA database
- `503 Service Unavailable` - USDA API unavailable

---

### Get Custom Foods

#### `GET /nutrition/custom-foods`

Retrieve all custom foods saved by the authenticated user.

**Authentication:** Required

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Protein Shake",
    "unit": "serving",
    "calories": 250,
    "protein_g": 30.0,
    "carbs_g": 20.0,
    "fat_g": 5.0,
    "fiber_g": 3.0,
    "sodium_mg": 150.0,
    "created_at": "2026-03-01T10:00:00"
  }
]
```

---

### Create Custom Food

#### `POST /nutrition/custom-foods`

Save a new custom food to your personal library.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "string (1-200 chars)",
  "unit": "string (g|oz|ml|cup|tbsp|tsp|serving|piece|slice)",
  "calories": "number (0-5000)",
  "protein_g": "number (0-500, default: 0)",
  "carbs_g": "number (0-1000, default: 0)",
  "fat_g": "number (0-500, default: 0)",
  "fiber_g": "number (0-500, default: 0)",
  "sodium_mg": "number (0-50000, default: 0)"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "user_id": 1,
  "name": "Protein Shake",
  "unit": "serving",
  "calories": 250,
  "protein_g": 30.0,
  "carbs_g": 20.0,
  "fat_g": 5.0,
  "fiber_g": 3.0,
  "sodium_mg": 150.0,
  "created_at": "2026-03-06T10:00:00"
}
```

**Errors:**
- `400 Bad Request` - Validation error (negative values, empty name, etc.)

---

### Delete Custom Food

#### `DELETE /nutrition/custom-foods/{food_id}`

Delete a custom food from your library.

**Authentication:** Required

**Path Parameters:**
- `food_id`: ID of the custom food to delete

**Response:** `204 No Content`

**Errors:**
- `404 Not Found` - Food doesn't exist or doesn't belong to user

---

## Weight Tracking Endpoints

### Get Weight Entries

#### `GET /weights`

Retrieve all weight entries for the authenticated user, sorted by date (newest first).

**Authentication:** Required

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "user_id": 1,
    "weight_kg": 75.5,
    "date": "2026-03-06",
    "created_at": "2026-03-06T08:00:00"
  },
  {
    "id": 2,
    "user_id": 1,
    "weight_kg": 76.0,
    "date": "2026-03-05",
    "created_at": "2026-03-05T08:00:00"
  }
]
```

---

### Create Weight Entry

#### `POST /weights`

Log a new weight entry.

**Authentication:** Required

**Request Body:**
```json
{
  "weight_kg": "number (20-500)",
  "date": "string (YYYY-MM-DD, default: today PST)"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "user_id": 1,
  "weight_kg": 75.5,
  "date": "2026-03-06",
  "created_at": "2026-03-06T08:00:00"
}
```

**Note:** Only one weight entry allowed per user per date. If entry exists, it will be updated.

---

### Delete Weight Entry

#### `DELETE /weights/{entry_id}`

Delete a specific weight entry.

**Authentication:** Required

**Path Parameters:**
- `entry_id`: ID of the weight entry to delete

**Response:** `204 No Content`

**Errors:**
- `404 Not Found` - Entry doesn't exist or doesn't belong to user

---

### Get Weekly Comparison

#### `GET /weights/weekly-comparison`

Get week-over-week weight comparison data.

**Authentication:** Required

**Query Parameters:**
- `current_week_start` (required): Start date of current week (YYYY-MM-DD, Monday)

**Example:** `/weights/weekly-comparison?current_week_start=2026-03-03`

**Response:** `200 OK`
```json
{
  "current_week": {
    "start_date": "2026-03-03",
    "end_date": "2026-03-09",
    "days": [
      {
        "date": "2026-03-03",
        "weight_kg": 75.5
      },
      {
        "date": "2026-03-04",
        "weight_kg": 75.3
      },
      {
        "date": "2026-03-05",
        "weight_kg": null
      }
    ],
    "average_kg": 75.4
  },
  "previous_week": {
    "start_date": "2026-02-24",
    "end_date": "2026-03-02",
    "days": [
      // ... similar structure
    ],
    "average_kg": 76.0
  },
  "comparison": {
    "change_kg": -0.6,
    "change_percent": -0.79,
    "trend": "decreasing"
  }
}
```

---

## Exercise Endpoints

### Create Exercise Entry

#### `POST /exercise/entries`

Log an exercise activity with calories burned.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "string (1-200 chars)",
  "calories_burned": "number (0-5000)",
  "date": "string (YYYY-MM-DD, default: today PST)"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "user_id": 1,
  "name": "Running",
  "calories_burned": 300,
  "date": "2026-03-06",
  "created_at": "2026-03-06T09:00:00",
  "updated_at": "2026-03-06T09:00:00"
}
```

---

### Delete Exercise Entry

#### `DELETE /exercise/entries/{entry_id}`

Delete a specific exercise entry.

**Authentication:** Required

**Path Parameters:**
- `entry_id`: ID of the exercise entry to delete

**Response:** `204 No Content`

**Errors:**
- `404 Not Found` - Entry doesn't exist or doesn't belong to user

---

## Error Responses

All endpoints may return the following error formats:

### 400 Bad Request
```json
{
  "detail": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 422 Unprocessable Entity
```json
{
  "detail": [
    {
      "loc": ["body", "calories"],
      "msg": "ensure this value is greater than or equal to 0",
      "type": "value_error.number.not_ge"
    }
  ]
}
```

### 503 Service Unavailable
```json
{
  "detail": "External service unavailable"
}
```

---

## Rate Limiting

**Current:** No rate limiting implemented  
**Future:** 100 requests per minute per user

---

## API Versioning

**Current:** No versioning (v1 implicit)  
**Future:** Path-based versioning (`/api/v1/`, `/api/v2/`)

---

## Interactive Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI:** `http://localhost:8000/docs` (development)
- **ReDoc:** `http://localhost:8000/redoc` (alternative format)

These interfaces allow you to:
- View all endpoints and schemas
- Test API calls directly in the browser
- See request/response examples
- Download OpenAPI schema

---

## Code Examples

### JavaScript/TypeScript (Axios)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Register
const register = async (username: string, email: string, password: string) => {
  const response = await api.post('/auth/register', {
    username,
    email,
    password
  });
  return response.data;
};

// Login
const login = async (username: string, password: string) => {
  const response = await api.post('/auth/login', { username, password });
  const { access_token } = response.data;
  
  // Store token
  localStorage.setItem('token', access_token);
  
  // Set default auth header
  api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
  
  return response.data;
};

// Get daily summary
const getDailySummary = async (date: string) => {
  const response = await api.get(`/nutrition/daily?date=${date}`);
  return response.data;
};

// Create food entry
const logFood = async (data: FoodEntryCreate) => {
  const response = await api.post('/nutrition/entries', data);
  return response.data;
};
```

### Python (requests)

```python
import requests

BASE_URL = "http://localhost:8000"

# Register
def register(username, email, password):
    response = requests.post(f"{BASE_URL}/auth/register", json={
        "username": username,
        "email": email,
        "password": password
    })
    return response.json()

# Login
def login(username, password):
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "username": username,
        "password": password
    })
    data = response.json()
    token = data["access_token"]
    return token

# Get daily summary
def get_daily_summary(token, date):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/nutrition/daily",
        params={"date": date},
        headers=headers
    )
    return response.json()

# Create food entry
def log_food(token, food_data):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/nutrition/entries",
        json=food_data,
        headers=headers
    )
    return response.json()
```

### cURL

```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","password":"password123"}'

# Get daily summary (with token)
curl -X GET "http://localhost:8000/nutrition/daily?date=2026-03-06" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create food entry
curl -X POST http://localhost:8000/nutrition/entries \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "meal_type": "breakfast",
    "food_name": "Oatmeal",
    "serving_size": 1,
    "serving_unit": "cup",
    "calories": 300,
    "protein_g": 10,
    "carbs_g": 54,
    "fat_g": 6,
    "fiber_g": 8,
    "sodium_mg": 100,
    "date": "2026-03-06"
  }'
```

---

## Changelog

### Version 1.0.0 (Current)
- Initial API release
- Authentication (register, login)
- Profile management with custom nutrition
- Food entry logging (USDA, custom, manual)
- Weight tracking with weekly comparisons
- Exercise logging
- Daily nutrition summaries
