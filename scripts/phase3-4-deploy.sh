#!/bin/bash
# Phase 3.4 Build & Deploy Script
# This script automates the build, lint, and deploy process for Phase 3.4

set -e

echo "════════════════════════════════════════════════════════"
echo "🚀 Phase 3.4: BUILD & DEPLOY SCRIPT"
echo "════════════════════════════════════════════════════════"
echo ""

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Build
echo -e "${BLUE}[1/4] Building production bundle...${NC}"
echo ""
npm run build

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Build successful!${NC}"
else
  echo -e "${RED}❌ Build failed!${NC}"
  exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════"

# Step 2: Lint
echo -e "${BLUE}[2/4] Running linter...${NC}"
echo ""
npm run lint

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Linting successful (0 errors)!${NC}"
else
  echo -e "${YELLOW}⚠️  Linting warnings found${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════════"

# Step 3: Deploy
echo -e "${BLUE}[3/4] Deploying to Firebase staging...${NC}"
echo ""
firebase deploy --only hosting:lifecv-d2724

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Deployment successful!${NC}"
else
  echo -e "${RED}❌ Deployment failed!${NC}"
  exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════"

# Step 4: Summary
echo -e "${BLUE}[4/4] Deployment Summary${NC}"
echo ""
echo -e "${GREEN}✅ BUILD:    SUCCESSFUL${NC}"
echo -e "${GREEN}✅ LINT:     SUCCESSFUL${NC}"
echo -e "${GREEN}✅ DEPLOY:   SUCCESSFUL${NC}"
echo ""
echo -e "${YELLOW}📱 Staging URL:${NC}"
echo -e "   https://lifecv-d2724.web.app"
echo ""
echo -e "${YELLOW}🔍 Next Steps:${NC}"
echo "   1. Open staging URL in browser"
echo "   2. Sign in with local account (PIN: 1234)"
echo "   3. Test all 12 widgets"
echo "   4. Check console for errors (F12)"
echo "   5. Report: '✅ Phase 3.4 Complete - No Errors'"
echo ""
echo "════════════════════════════════════════════════════════"
