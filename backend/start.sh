#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting CodeCampus AI Backend${NC}"
echo ""

# Check if port 8000 is already in use
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Port 8000 is already in use${NC}"
    echo -e "${YELLOW}Killing existing process...${NC}"
    lsof -ti:8000 | xargs kill -9
    sleep 1
fi

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo -e "${GREEN}📦 Activating virtual environment${NC}"
    source venv/bin/activate
fi

# Start the server
echo -e "${GREEN}🌐 Starting server on http://localhost:8000${NC}"
echo -e "${GREEN}📚 API docs available at http://localhost:8000/docs${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

python3 main.py
