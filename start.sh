#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting x402 Demo Application...${NC}\n"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then kill $BACKEND_PID 2>/dev/null; fi
    if [ ! -z "$FRONTEND_PID" ]; then kill $FRONTEND_PID 2>/dev/null; fi
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend
echo -e "${GREEN}[1/2] Starting Backend (ElysiaJS + Bun)...${NC}"
cd backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    bun install
fi

bun run dev &
BACKEND_PID=$!
echo -e "Backend started on ${YELLOW}http://localhost:3000${NC}"

# Go back to root and start frontend
cd ../frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo -e "${GREEN}[2/2] Starting Frontend (React + Vite)...${NC}"
npm run dev &
FRONTEND_PID=$!
echo -e "Frontend started on ${YELLOW}http://localhost:5173${NC}"

echo -e "\n${GREEN}✓ All services running!${NC}"
echo -e "Press ${YELLOW}Ctrl+C${NC} to stop all services\n"

# Wait for both processes
wait
