#!/bin/bash

# Start backend server in the background
echo "Starting backend server..."
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 &
BACKEND_PID=$!

# Start frontend server in the background
echo "Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Display PIDs
echo ""
echo "✅ Backend server started (PID: $BACKEND_PID) on http://localhost:8000"
echo "✅ Frontend server started (PID: $FRONTEND_PID) on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers..."
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
