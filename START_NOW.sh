#!/bin/bash

echo "🚀 Starting CodeCampus AI..."
echo ""

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Error: backend directory not found"
    exit 1
fi

# Start backend
echo "📦 Starting backend server..."
cd backend

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo "   Activating virtual environment..."
    source venv/bin/activate
fi

# Start backend in background
python3 main.py &
BACKEND_PID=$!

echo "   Backend PID: $BACKEND_PID"
echo "   Waiting for backend to start..."
sleep 5

# Check if backend is running
if curl -s http://localhost:8000/ > /dev/null; then
    echo "   ✅ Backend running on http://localhost:8000"
else
    echo "   ❌ Backend failed to start"
    echo "   Check terminal for errors"
    exit 1
fi

cd ..

# Start frontend
echo ""
echo "🎨 Starting frontend server..."
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
fi

# Start frontend
npm run dev &
FRONTEND_PID=$!

echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "✅ All servers started!"
echo ""
echo "📝 Access the app:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo ""
echo "🔐 Login with:"
echo "   Email: test@example.com"
echo "   Password: Password@123"
echo ""
echo "⚠️  To stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
wait
