#!/bin/bash
# Start UAP Chatbot Backend + Tunnel

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting UAP Chatbot...${NC}"

# Kill existing processes
pkill -f "node server.js" 2>/dev/null
pkill -f "lt --port 3000" 2>/dev/null

sleep 2

# Start backend
echo -e "${BLUE}📡 Starting backend on port 3000...${NC}"
cd ~/.openclaw/workspace/uap-chatbot
node server.js > /tmp/uap-server.log 2>&1 &

sleep 3

# Start tunnel
echo -e "${BLUE}🌐 Starting tunnel...${NC}"
lt --port 3000 > /tmp/uap-tunnel.log 2>&1 &

sleep 5

# Get tunnel URL
TUNNEL_URL=$(grep -o "https://.*\.loca\.lt" /tmp/uap-tunnel.log | head -1)

echo ""
echo -e "${GREEN}✅ UAP Chatbot is running!${NC}"
echo ""
echo -e "${GREEN}Frontend:${NC} https://uap-chatbot-deploy.vercel.app"
echo -e "${GREEN}Backend:${NC} ${TUNNEL_URL}"
echo ""
echo "To update frontend with new URL:"
echo "1. Edit public/index.html and change API_URL"
echo "2. Run: ./deploy-frontend.sh"
echo ""
