# Health Tracking App
A health tracking app that helps users track daily calorie intake and consumption for weight gain or loss.

## 🌐 Live Demo

**Frontend**: https://health-tracking-frontend.onrender.com  
**Backend API**: https://health-tracking-backend.onrender.com

> **Note**: Free tier services may take 30-60 seconds to wake up from sleep on first request.

## What It Does
- **Daily dashboard** showing calories, macros, and remaining targets.
- **Custom nutrition goals** - Override BMR/TDEE calculations with your own calorie and macro targets.
- **Weight tracking** with daily logging and historical trend visualization.
- **Meals and exercise logged by day** with a PST-based date selector.
- **USDA FoodData Central search** for quick food logging.
- **Edit and delete entries** for any day, including past days.
- **Responsive design** - Fully optimized for mobile phones, tablets, and desktop with adaptive layouts.
- **New user onboarding** - Welcome modal guides first-time users through setup process.

## Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: FastAPI + SQLAlchemy
- **Database**: PostgreSQL (Neon) in production, SQLite for local development
- **Hosting**: Render.com (frontend static site + backend web service)
- **Auth**: JWT tokens + bcrypt password hashing
- **Testing**: pytest (backend) + vitest (frontend)
- **Package Manager**: uv (Python) + npm (JavaScript)

## Prerequisites
- **Python**: 3.11 or higher
- **Node.js**: 18 or higher
- **uv**: Fast Python package manager ([installation guide](https://github.com/astral-sh/uv))

  **Linux/macOS:**
  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```

  **Windows (PowerShell):**
  ```powershell
  powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```

  **Windows (WSL or Git Bash):**
  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```

## Environment Setup
- Create [backend/.env](backend/.env) with `USDA_API_KEY=<your_api_key>` to enable USDA FoodData Central search and imports.

## Getting Started

### Option 1: One-Command Start (Recommended) 🚀

Start both backend and frontend servers with a single command:

**Linux/macOS:**
```bash
cd /workspaces/health-tracking-app
chmod +x start-dev.sh  # Only needed once
./start-dev.sh
```

**Windows (Git Bash/WSL):**
```bash
cd /workspaces/health-tracking-app
bash start-dev.sh
```

**Windows (PowerShell) - Manual Start:**
```powershell
# Terminal 1 - Backend
cd backend
uv sync
uv run uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
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
uv sync  # First time only - installs dependencies
uv run uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd /workspaces/health-tracking-app/frontend
npm install  # First time only
npm run dev
```

Then open your browser to **http://localhost:5173**

## Development Commands

### Backend (Python with uv)
```bash
cd backend

# Install/sync dependencies
uv sync

# Run development server
uv run uvicorn app.main:app --reload

# Run tests with coverage
uv run pytest tests/ -v

# Add a new dependency
uv add package-name

# Add a dev dependency
uv add --dev package-name
```

### Frontend (Node.js with npm)
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Features

- **User Authentication** - Register and login with JWT tokens
- **Profile Management** - View and manage user profile with BMR/TDEE calculations
- **Custom Nutrition Goals** - Override calculated targets with your own calorie and macro percentages (protein, carbs, fat)
- **Nutrition Dashboard** - Calories ring, macro donut, and daily targets at a glance
- **Weight Tracking** - Log daily weight with interactive historical trend chart
- **Weekly Weight Comparison** - Analyze weight changes week-over-week with trend indicators and goal progress
- **Weight Entry Management** - Add and delete weight entries directly from the profile page
- **Meal Tracking** - Log meals with three food sources:
  - **USDA Database** - Search USDA FoodData Central for 350,000+ foods
  - **My Custom Foods** - Save your favorite foods with nutrition info for quick logging
  - **Manual Entry** - Enter any food with custom nutrition values
- **Custom Food Library** - Create, edit, and manage your personal collection of favorite foods with:
  - Custom names and serving sizes
  - Standardized units (g, oz, ml, cup, tbsp, tsp, serving, piece, slice)
  - Complete nutrition info (calories, protein, carbs, fat, fiber, sodium)
  - Proportional calculation - enter any amount and get scaled nutrition values
- **Meal Details & Editing** - Expand meals for nutrient totals and edit or delete entries
- **Exercise Logging** - Track exercises and calories burned
- **Daily Summary** - ViewFully optimized for mobile phones (≤768px), tablets (769px-1024px), and desktop with:
  - Adaptive layouts that stack vertically on small screens
  - Touch-friendly button sizing (minimum 44px tap targets)
  - Single/multi-column grids based on screen size
  - Optimized typography and spacing for each breakpoint
- **New User Onboarding** - Interactive welcome modal that appears on first registration with:
  - Step-by-step guide to complete profile setup
  - Clear explanation of nutrition goal calculation
  - Smooth animations and modern design
  - One-time display (uses localStorage)acking
- **PST Date Selector** - Browse and edit historical days, defaulting to current day in PST
- **Responsive Design** - Works on desktop and mobile devices with refined, modern UI

## Deployment

The app is deployed on Render.com with the following architecture:
- **Frontend**: Static site at https://health-tracking-frontend.onrender.com
- **Backend**: Web service at https://health-tracking-backend.onrender.com
- **Database**: PostgreSQL on Neon.tech

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Quick Deployment Overview

1. **Database**: Create PostgreSQL database on [Neon](https://neon.tech)
2. **Backend**: Deploy to Render as Web Service
   - Build: `cd backend && uv sync`
   - Start: `cd backend && uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Environment: `DATABASE_URL`, `SECRET_KEY`
3. **Frontend**: Deploy to Render as Static Site
   - Build: `cd frontend && npm install && npm run build`
   - Publish: `frontend/dist`
   - Redirects: Configure `/*` → `/index.html` in Render dashboard for SPA routing
