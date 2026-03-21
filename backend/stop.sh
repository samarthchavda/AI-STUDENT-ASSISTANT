#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${RED}🛑 Stopping CodeCampus AI Backend${NC}"

# Kill process on port 8000
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}Found process on port 8000, killing...${NC}"
    lsof -ti:8000 | xargs kill -9
    echo -e "${GREEN}✅ Backend stopped successfully${NC}"
else
    echo -e "${RED}No process found on port 8000${NC}"
fi
