#!/bin/bash

# AI Student Assistant - Quick Start Script
# This script sets up and runs the entire application

echo "🎓 AI Student Assistant - Quick Start"
echo "======================================"

# Check if PostgreSQL is running
echo ""
echo "📊 Checking PostgreSQL..."
if brew services list | grep -q "postgresql@14.*started"; then
    echo "✅ PostgreSQL is running"
else
    echo "⚠️  Starting PostgreSQL..."
    brew services start postgresql@14
    sleep 2
fi

# Setup Backend
echo ""
echo "🔧 Setting up Backend..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -q -r requirements.txt

# Create database tables
echo "Creating database tables..."
python -c "from database import engine, Base; from models import *; Base.metadata.create_all(bind=engine)"

# Start backend in background
echo "Starting backend server..."
python main.py &
BACKEND_PID=$!
echo "Backend running with PID: $BACKEND_PID"

cd ..

# Setup Frontend
echo ""
echo "🎨 Setting up Frontend..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

# Start frontend
echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!
echo "Frontend running with PID: $FRONTEND_PID"

cd ..

echo ""
echo "✨ Application is starting!"
echo ""
echo "📍 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🛑 To stop the servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   Or press Ctrl+C twice"
echo ""
echo "📚 Check README.md for more information"
echo ""

# Wait for user interrupt
trap "echo ''; echo '🛑 Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
