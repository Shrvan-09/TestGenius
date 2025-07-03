#!/bin/bash
# local-deploy.sh: Deploy locally for development/testing when AWS is not available
# Usage: ./local-deploy.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 TestGenius Local Development Deployment${NC}"
echo "=============================================="

# Navigate to project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "${PROJECT_DIR}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found. Please install npm${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
echo -e "${GREEN}✅ npm: $(npm --version)${NC}"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Fix security vulnerabilities
echo -e "${YELLOW}🔒 Fixing security vulnerabilities...${NC}"
npm audit fix --only=prod 2>/dev/null || echo -e "${YELLOW}⚠️ Some vulnerabilities could not be auto-fixed${NC}"

# Update browserslist
echo -e "${YELLOW}📱 Updating browserslist database...${NC}"
npx update-browserslist-db@latest 2>/dev/null || echo -e "${YELLOW}⚠️ Could not update browserslist database${NC}"

# Build the application
echo -e "${YELLOW}🏗️ Building application...${NC}"
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Start development server
echo -e "${YELLOW}🚀 Starting development servers...${NC}"

# Start backend server
echo -e "${YELLOW}🔧 Starting backend server...${NC}"
cd server
npm install 2>/dev/null || echo "Backend dependencies already installed"
PORT=3001 node index.js &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend dev server
echo -e "${YELLOW}🎨 Starting frontend development server...${NC}"
npm run dev &
FRONTEND_PID=$!

# Wait for servers to start
sleep 5

echo -e "${GREEN}🎉 Local deployment complete!${NC}"
echo "=============================================="
echo -e "${BLUE}🌍 Application URLs:${NC}"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001"
echo ""
echo -e "${BLUE}🔧 Development Commands:${NC}"
echo "  Stop servers: kill $BACKEND_PID $FRONTEND_PID"
echo "  View logs: tail -f ~/.npm/_logs/*.log"
echo ""
echo -e "${YELLOW}💡 For AWS deployment:${NC}"
echo "1. Run: ./setup-aws-environment.sh"
echo "2. Then: ./deploy-aws.sh dev"
echo ""
echo -e "${GREEN}🎯 Happy coding!${NC}"

# Keep script running
wait
