#!/bin/bash

echo "🚀 Starting CodeCampus AI Backend..."
echo ""

cd backend

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "📥 Installing dependencies..."
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

echo ""
echo "✅ Backend starting on http://localhost:8000"
echo "📝 Press Ctrl+C to stop"
echo ""

python3 main.py
