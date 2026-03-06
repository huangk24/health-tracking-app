# Health Tracking App

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Node 18+](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)
[![Backend Coverage](https://img.shields.io/badge/coverage-90.7%25-brightgreen.svg)](docs/guides/TESTING.md)

A comprehensive health tracking application that helps users monitor daily calorie intake, track weight progress, and achieve their fitness goals through data-driven insights.

## 🌐 Live Demo

**Frontend**: https://health-tracking-frontend.onrender.com  
**Backend API**: https://health-tracking-backend.onrender.com  
**API Docs**: https://health-tracking-backend.onrender.com/docs

> **Note**: Free tier services may take 30-60 seconds to wake up from sleep on first request.

## ✨ Features

### Core Functionality
- **📊 Daily Nutrition Dashboard** - Track calories, macros with visual charts
- **🎯 Custom Nutrition Goals** - Set personalized calorie and macro targets
- **🍎 Multiple Food Sources**
  - USDA database (350,000+ foods)
  - Personal custom food library
  - Manual entry
- **⚖️ Weight Tracking** - Log daily weight with trend visualization
- **📈 Weekly Comparisons** - Analyze week-over-week progress
- **🏃 Exercise Logging** - Track workouts and calories burned
- **📱 Responsive Design** - Optimized for mobile, tablet, and desktop

See detailed feature documentation in [docs/features/](docs/features/).

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast builds
- **Chart.js** for visualizations
- **Vitest** for testing

### Backend
- *📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Python**: 3.11 or higher
- **Node.js**: 18 or higher
- **uv**: Fast Python package manager

### Installing uv

**Linux/macOS:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Windows (PowerShell):**
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

See [Development Guide](docs/guides/DEVELOPMENT.md) for detailed setup instructions.inux/macOS:**
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
  `🔧 Environment Setup

Create `backend/.env` with your USDA API key for food search functionality:
🚀 Getting Started

### Option 1: One-Command Start (Recommended)

**Linux/macOS:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

**Windows:**
```bash
bash start-dev.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Access:** http://localhost:5173

For detailed instructions, see [Development Guide](docs/guides/DEVELOPMENT.md).

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
🧑‍💻 Development Commands

### Backend (Python with uv)
```bash
cd backend

# Install dependencies
uv sync

# Run development server
uv run uvicorn app.main:app --reload

# Run tests with coverage
uv run pytest tests/ -v --cov=app

# Add a dependency
uv add package-name
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

See [Development Guide](docs/guides/DEVELOPMENT.md) for more commands and workflows. Standardized units (g, oz, ml, cup, tbsp, tsp, serving, piece, slice)
  - Complete nutrition info (calories, protein, carbs, fat, fiber, sodium)
  - Proportional calculation - enter any amount and get scaled nutrition values
- *📂 Project Structure

```
health-tracking-app/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   └── tests/              # Backend tests
│
├── frontend/               # React frontend
│   └── src/
│       ├── components/     # React components
│       ├── pages/          # Page components
│       ├── services/       # API client
│       ├── contexts/       # React contexts
│       └── styles/         # CSS files
│
├── docs/                   # Documentation
│   ├── api/               # API reference
│   ├── guides/            # User guides
│   ├── features/          # Feature docs
│   └── development/       # Dev docs
│
└── .github/               # GitHub configuration
```

See [Architecture Documentation](docs/ARCHITECTURE.md) for detailed system design.
- **[Security Policy](docs/SECURITY.md)** - Security practices and reporting

### Features & History
- **[Changelog](docs/CHANGELOG.md)** - Version history and release notes
- **[Custom Nutrition](docs/features/CUSTOM_NUTRITION.md)** - Custom nutrition goals feature
- **[Custom Foods](docs/features/CUSTOM_FOOD_FEATURE.md)** - Personal food library feature
- **[UI Improvements](docs/features/UI_IMPROVEMENTS.md)** - Design and UX enhancements

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- [uv](https://github.com/astral-sh/uv) (Python package manager)

### One-Command Setup

```bash
./start-dev.sh
```

This starts both backend and frontend servers. Visit http://localhost:5173 to use the app.

### Manual Setup

**Backend:**
```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

For detailed setup instructions, see the [Development Guide](docs/guides/DEVELOPMENT.md).

## 🏗️ Architecture

The app follows a modern, scalable architecture:

```
React Frontend (TypeScript)
       ↓
FastAPI Backend (Python)
       ↓
PostgreSQL Database
```

See [Architecture Documentation](docs/ARCHITECTURE.md) for details.

## 🧪 Testing

```bash
# Backend tests (90.7% coverage)
cd backend && uv run pytest tests/ -v

# Frontend tests
cd frontend && npm test
```

See [Testing Guide](docs/guides/TESTING.md) for comprehensive testing documentation.

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](docs/CONTRIBUTING.md) before submitting a pull request.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Make your changes and add tests
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
5. Push to your fork and submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

For security concerns, please read our [Security Policy](docs/SECURITY.md). To report vulnerabilities, email [security@example.com] (do not open public issues).

## 📞 Support

- **Documentation**: Check the [docs/](docs/) directory
- **Issues**: [GitHub Issues](https://github.com/huangk24/health-tracking-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/huangk24/health-tracking-app/discussions)

## 🙏 Acknowledgments

- [USDA FoodData Central](https://fdc.nal.usda.gov/) for nutritional data
- [Render.com](https://render.com/) for hosting
- [Neon](https://neon.tech/) for PostgreSQL database

## Deployment

For production deployment instructions, see [Deployment Guide](docs/guides/DEPLOYMENT.md).

**Quick Overview:**
- **Frontend**: Static site on Render.com
- **Backend**: Web service on Render.com  
- **Database**: PostgreSQL on Neon.tech
   - Build: `cd frontend && npm install && npm run build`
   - Publish: `frontend/dist`
   - Redirects: Configure `/*` → `/index.html` in Render dashboard for SPA routing
