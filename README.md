# Health Tracking App
A health tracking app that helps users track daily calorie intake and consumption for weight gain or loss.

## What It Does
- **Daily dashboard** showing calories, macros, and remaining targets.
- **Meals and exercise logged by day** with a PST-based date selector.
- **USDA FoodData Central search** for quick food logging.
- **Edit and delete entries** for any day, including past days.

## Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: FastAPI + SQLAlchemy
- **Database**: SQLite (auto-creates tables on startup)
- **Auth**: JWT tokens + bcrypt password hashing
- **Testing**: pytest (backend) + vitest (frontend)

## Environment Setup
- Create [backend/.env](backend/.env) with `USDA_API_KEY=<your_api_key>` to enable USDA FoodData Central search and imports.

## Getting Started

### Option 1: One-Command Start (Recommended) 🚀

Start both backend and frontend servers with a single command:

```bash
cd /workspaces/health-tracking-app
chmod +x start-dev.sh  # Only needed once
./start-dev.sh
```

This will:
- ✅ Clean up any old processes
- ✅ Start backend server (http://localhost:8000)
- ✅ Verify backend is healthy
- ✅ Start frontend server (http://localhost:5173)
- ✅ Display both server URLs

Press `Ctrl+C` to stop all servers.

### Option 2: Two Separate Terminals (Simple)

**Terminal 1 - Backend:**
```bash
cd /workspaces/health-tracking-app/backend
pip install -r requirements.txt -r requirements-dev.txt  # First time only
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd /workspaces/health-tracking-app/frontend
npm install  # First time only
npm run dev
```

Then open your browser to **http://localhost:5173**

## Features

- **User Authentication** - Register and login with JWT tokens
- **Nutrition Dashboard** - Calories ring, macro donut, and daily targets at a glance
- **Meal Tracking** - Log meals with USDA FoodData Central integration
- **Meal Details & Editing** - Expand meals for nutrient totals and edit or delete entries
- **Exercise Logging** - Track exercises and calories burned
- **Daily Summary** - View calorie intake vs. daily goals
- **PST Date Selector** - Browse and edit historical days, defaulting to current day in PST
- **Responsive Design** - Works on desktop and mobile devices
