@echo off
REM AI Student Assistant - Quick Start Script (Windows)

echo ===============================================
echo  AI Student Assistant - Quick Start
echo ===============================================
echo.

echo Setting up Backend...
cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

echo Installing Python dependencies...
pip install -q -r requirements.txt

echo Creating database tables...
python -c "from database import engine, Base; from models import *; Base.metadata.create_all(bind=engine)"

echo Starting backend server...
start /B python main.py

cd ..

echo.
echo Setting up Frontend...
cd frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install
)

echo Starting frontend server...
start /B npm run dev

cd ..

echo.
echo ===============================================
echo  Application Started!
echo ===============================================
echo.
echo  Frontend: http://localhost:3000
echo  Backend API: http://localhost:8000
echo  API Docs: http://localhost:8000/docs
echo.
echo Press any key to exit...
pause >nul
