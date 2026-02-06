#!/bin/bash
# start-dev.sh - Start both backend and frontend servers with health checks and proper cleanup
set -e

echo "🚀 Starting Health Tracking App Development Environment..."

# Kill any existing processes
echo "🧹 Cleaning up old processes..."
pkill -f "uvicorn app.main:app" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2

# Start backend
echo "📡 Starting backend server..."
cd "$(dirname "$0")/backend"
uvicorn app.main:app --reload --host 0.0.0.0 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Give backend time to start
sleep 3

# Verify backend health
echo "🔍 Checking backend health..."
if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
  echo "❌ Backend failed to start!"
  kill $BACKEND_PID 2>/dev/null || true
  exit 1
fi
echo "✅ Backend health check passed"

# Start frontend
echo "🎨 Starting frontend development server..."
cd "$(dirname "$0")/frontend"
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "=========================================="
echo "✅ Development environment ready!"
echo "=========================================="
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "📡 Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Handle cleanup on exit
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; echo '✅ All servers stopped'" EXIT

# Keep script running
wait