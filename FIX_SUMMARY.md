# 🔧 Fixed: Backend Serialization & Health Checks

## What Was Wrong
**Error**: `PydanticSerializationError: Unable to serialize unknown type: <class 'app.models.exercise.ExerciseEntry'>`

**Cause**: The `exercises` field in `DailyNutritionSummary` was typed as plain `list` instead of a properly serializable type. When Pydantic tried to serialize the raw SQLAlchemy `ExerciseEntry` objects, it failed.

---

## ✅ What Was Fixed

### 1. Backend Serialization (CRITICAL)
**File**: `backend/app/schemas/food_entry.py`
```python
# Before: exercises: list  # unclear type
# After:  exercises: list[dict]  # proper serialization
```

**File**: `backend/app/services/nutrition.py`
```python
# Now converts exercises to dicts before returning:
exercise_dicts = [
    {
        "id": ex.id,
        "user_id": ex.user_id,
        "name": ex.name,
        "calories_burned": ex.calories_burned,
        "date": ex.date.isoformat(),
        "created_at": ex.created_at.isoformat(),
        "updated_at": ex.updated_at.isoformat(),
    }
    for ex in exercises
]
```

### 2. Frontend Health Checks (PREVENTION)
**File**: `frontend/src/pages/DashboardPage.tsx`

Added automatic health check before loading nutrition data:
```typescript
useEffect(() => {
  // Verify backend is reachable before loading nutrition data
  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/health`);
      if (!response.ok) {
        throw new Error("Backend returned error");
      }
    } catch (err) {
      setError(
        "⚠️ Backend server is not responding. Make sure to start it with: cd backend && uvicorn app.main:app --reload"
      );
      setLoading(false);
      return;
    }
    // Backend is healthy, fetch nutrition data
    fetchNutrition();
  };

  if (token) {
    checkBackendHealth();
  }
}, [token]);
```

### 3. Improved Startup Script
**File**: `start-dev.sh`

Updated with:
- ✅ Process cleanup before starting
- ✅ Backend health check before starting frontend
- ✅ Proper signal handling for clean shutdown
- ✅ Clear instructions if backend fails

**Usage**:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

---

## 🎯 Going Forward: Prevent This Again

### Option 1: Use the Startup Script (RECOMMENDED)
```bash
./start-dev.sh
```
This handles everything automatically and checks backend health.

### Option 2: Manual Start
```bash
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Option 3: Kill & Restart
If something breaks, kill and restart:
```bash
# Kill old processes
pkill -f "uvicorn app.main:app"

# Restart
cd backend
uvicorn app.main:app --reload
```

---

## 🚨 Error Prevention Checklist

When adding new features:

1. **Add Model?** → Make sure it's imported in `backend/app/main.py`
   ```python
   from app.models import user, food_entry, exercise  # ← Add here
   ```

2. **Add Schema with Models?** → Convert to dicts/responses for serialization
   ```python
   # ❌ Don't: return raw SQLAlchemy objects
   # ✅ Do: convert to dicts with .isoformat() for dates
   ```

3. **Add Route?** → Register in `backend/app/api/router.py`
   ```python
   api_router.include_router(exercise_router, prefix="/nutrition")
   ```

4. **Don't Know What's Wrong?** → Check:
   - Backend log: `INFO: Started reloader process` (if you see this, it's running)
   - Browser console: Shows "⚠️ Backend server is not responding"
   - Frontend: Clear error message tells you to restart backend

---

## 📊 Current Status

✅ Backend: Running on http://localhost:8000
✅ Frontend: Ready to run on http://localhost:5173
✅ Health checks: Enabled
✅ Process cleanup: Automated with new startup script

**Refresh your browser** - everything should work now!
