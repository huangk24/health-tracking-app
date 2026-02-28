# Deployment Guide

This guide covers deploying the Health Tracking App to production using Render.com + Neon.tech.

## 🌐 Live Application

- **Frontend**: https://health-tracking-frontend.onrender.com
- **Backend API**: https://health-tracking-backend.onrender.com
- **Database**: PostgreSQL on Neon.tech

## Architecture Overview

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────────────┐
│  Render Static Site     │
│  (React Frontend)       │
│  Port: 443 (HTTPS)      │
└────────┬────────────────┘
         │ API Calls
         ▼
┌─────────────────────────┐
│  Render Web Service     │
│  (FastAPI Backend)      │
│  Port: 10000 (Internal) │
└────────┬────────────────┘
         │ DATABASE_URL
         ▼
┌─────────────────────────┐
│  Neon PostgreSQL        │
│  (Managed Database)     │
└─────────────────────────┘
```

## Prerequisites

- GitHub account with repository
- Render.com account (free tier)
- Neon.tech account (free tier - 512MB database)

## Step 1: Database Setup (Neon)

1. **Create Account**: Go to https://neon.tech and sign up
2. **Create Project**:
   - Click "Create a project"
   - Name: `health-tracking-db`
   - Region: Choose closest to your users (e.g., US East)
   - PostgreSQL version: 16 (default)
3. **Get Connection String**:
   - Go to project dashboard
   - Copy the connection string (starts with `postgresql://`)
   - Format: `postgresql://user:password@host/database?sslmode=require`
   - **Save this** - you'll need it for backend deployment

## Step 2: Backend Deployment (Render)

### 2.1: Create Web Service

1. Go to https://dashboard.render.com
2. Click "New +"  → "Web Service"
3. Connect your GitHub repository: `huangk24/health-tracking-app`
4. Configure service:

   **Basic Settings:**
   - Name: `health-tracking-backend`
   - Region: Same as your database (e.g., Oregon for US West)
   - Branch: `main`
   - Root Directory: `backend`
   - Environment: `Python 3`
   - Build Command: `uv sync`
   - Start Command: `uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT`

   **Instance Type:**
   - Select: `Free` (512MB RAM, spins down after 15 min inactivity)

### 2.2: Environment Variables

Click "Advanced" → "Add Environment Variable" and add:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | `postgresql://...` | From Neon dashboard |
| `SECRET_KEY` | Generate with `openssl rand -hex 32` | For JWT token signing |
| `USDA_API_KEY` | Your USDA API key | Optional - for food search |
| `PYTHON_VERSION` | `3.11` | Match your local version |

### 2.3: Deploy

1. Click "Create Web Service"
2. Wait 2-5 minutes for build and deploy
3. Check logs for success: "Application startup complete"
4. Test health check: `https://health-tracking-backend.onrender.com/health`
5. Copy your backend URL for frontend config

## Step 3: Frontend Deployment (Render)

### 3.1: Create Static Site

1. Go to Render dashboard → "New +" → "Static Site"
2. Connect same repository: `huangk24/health-tracking-app`
3. Configure site:

   **Basic Settings:**
   - Name: `health-tracking-frontend`
   - Branch: `main`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `frontend/dist`

### 3.2: Environment Variables

Add this in the "Environment" section:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://health-tracking-backend.onrender.com` |

### 3.3: Configure SPA Routing

**Critical Step**: Render requires manual redirect configuration for React Router.

1. After site deploys, go to your static site dashboard
2. Click "Redirects/Rewrites" in the left sidebar
3. Click "Add Rule"
4. Configure:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite` (not Redirect)
5. Save changes (takes effect immediately)

**Why this is needed**: React Router handles routing client-side. Without this, refreshing `/dashboard` would return 404 because Render looks for a file called `dashboard` that doesn't exist.

### 3.4: Deploy

1. Click "Create Static Site"
2. Wait 2-3 minutes for build
3. Your app will be live at: `https://health-tracking-frontend.onrender.com`

## Step 4: Update Backend CORS

Your backend needs to allow requests from your frontend domain.

1. Edit `backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development
        "https://health-tracking-frontend.onrender.com",  # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

2. Commit and push:
```bash
git add backend/app/main.py
git commit -m "chore: add production frontend URL to CORS"
git push origin main
```

3. Render will auto-deploy the updated backend

## Step 5: Verify Deployment

### Backend Health Check
```bash
curl https://health-tracking-backend.onrender.com/health
# Expected: {"status": "healthy"}
```

### Database Connection
Check Render logs for backend service:
- Should see: "Connected to PostgreSQL database"
- No errors about database connections

### Frontend Testing
1. Open https://health-tracking-frontend.onrender.com
2. Register a new account
3. Login
4. Add weight entry
5. Log a meal
6. Refresh page (should NOT get 404)
7. Navigate to `/dashboard` and refresh (should work)

## Troubleshooting

### Backend Issues

**Problem**: Service won't start
- Check logs in Render dashboard
- Verify `DATABASE_URL` is set correctly
- Ensure `SECRET_KEY` is 32+ characters

**Problem**: Database connection timeout
- Verify Neon database is active (not paused)
- Check connection string includes `?sslmode=require`
- Ensure `psycopg2-binary` is in `pyproject.toml`

**Problem**: 500 errors on API calls
- Check backend logs for Python tracebacks
- Verify environment variables are set
- Test endpoints manually with curl

### Frontend Issues

**Problem**: 404 on page refresh
- Go to Render dashboard → Static Site → Redirects/Rewrites
- Add rewrite rule: `/*` → `/index.html`
- This is the #1 issue with SPA deployments

**Problem**: Cannot connect to backend
- Check browser console for CORS errors
- Verify `VITE_API_URL` environment variable is set correctly
- Ensure backend CORS allows your frontend domain
- Try calling backend directly: `curl https://your-backend.onrender.com/health`

**Problem**: Build fails
- Check for TypeScript errors in logs
- Verify all dependencies in `package.json`
- Ensure `vite-env.d.ts` exists for Vite types

### General Issues

**Problem**: App is slow / takes 30-60 seconds to load
- **Expected behavior** on free tier
- Render spins down services after 15 minutes of inactivity
- First request "wakes up" the service
- Solution: Upgrade to paid tier ($7/month) to keep active 24/7

**Problem**: Database connection error after inactivity
- Neon free tier may pause inactive databases
- Solution: Activity from backend will wake it up automatically

## Environment Variables Summary

### Backend (Web Service)
```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
SECRET_KEY=<64-character-hex-string>
USDA_API_KEY=<optional-usda-key>
PYTHON_VERSION=3.11
```

### Frontend (Static Site)
```bash
VITE_API_URL=https://health-tracking-backend.onrender.com
```

## Monitoring & Maintenance

### Free Tier Limits

**Render:**
- 750 hours/month compute (enough for 24/7 if only 1 service)
- Spins down after 15 min inactivity
- 100GB bandwidth/month

**Neon:**
- 512MB database storage
- Unlimited compute hours
- 3GB data transfer/month

### Checking Service Health

**Backend logs** (Render dashboard):
```
Application startup complete
INFO:     Uvicorn running on http://0.0.0.0:10000
```

**Frontend build logs** (Render dashboard):
```
✓ built in 12.34s
Site is live
```

### Database Maintenance

1. **View data**: Use Neon SQL Editor in dashboard
2. **Backups**: Neon auto-backs up on free tier (7 days retention)
3. **Migrations**: Currently using SQLAlchemy auto-create (consider Alembic for future)

## Updating the App

### Auto-Deploy (Recommended)

Render watches your `main` branch and auto-deploys on push:

```bash
# Make changes locally
git add .
git commit -m "feat: add new feature"
git push origin main

# Render automatically:
# 1. Detects push to main
# 2. Rebuilds backend and/or frontend
# 3. Deploys new version
# 4. Takes 2-5 minutes total
```

### Manual Deploy

1. Go to Render dashboard
2. Select service (backend or frontend)
3. Click "Manual Deploy" → "Deploy latest commit"

## Cost Optimization

### Current Setup (Free Tier)
- Monthly cost: **$0**
- Limitations: Cold starts, 512MB RAM, limited storage

### Recommended Paid Tier (~100 users)
- Backend Web Service: $7/month (always-on, 512MB RAM)
- Frontend Static Site: Free (always fast)
- Neon Database: Free (512MB enough for 100 users)
- **Total: $7/month** (eliminates cold starts)

## Security Checklist

- ✅ SQLite replaced with PostgreSQL (production-ready)
- ✅ JWT tokens for authentication
- ✅ Bcrypt password hashing
- ✅ CORS configured for specific domains
- ✅ Environment variables for secrets (not in code)
- ✅ HTTPS enabled (Render provides free SSL)
- ⚠️ Consider rate limiting for API endpoints (future enhancement)
- ⚠️ Consider database connection pooling (SQLAlchemy default is basic)

## Next Steps

1. **Custom Domain** (Optional):
   - Purchase domain (e.g., healthtracker.com)
   - Add CNAME in Render dashboard
   - Update CORS and `VITE_API_URL`

2. **Monitoring**:
   - Set up Render alerts for service failures
   - Consider UptimeRobot for health check pings
   - Monitor Neon database usage

3. **Enhancements**:
   - Add database migrations with Alembic
   - Implement rate limiting (slowapi)
   - Add error tracking (Sentry)
   - Set up CI/CD tests before deploy

## Support

- **Render Docs**: https://render.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Project Issues**: https://github.com/huangk24/health-tracking-app/issues
