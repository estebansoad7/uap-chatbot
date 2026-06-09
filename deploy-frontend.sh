#!/bin/bash
# Deploy frontend to Vercel

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploying frontend to Vercel...${NC}"

cp ~/.openclaw/workspace/uap-chatbot/public/index.html /tmp/uap-chatbot-deploy/
cd /tmp/uap-chatbot-deploy
vercel --prod

echo ""
echo -e "${GREEN}✅ Frontend deployed!${NC}"
echo -e "${GREEN}URL:${NC} https://uap-chatbot-deploy.vercel.app"
