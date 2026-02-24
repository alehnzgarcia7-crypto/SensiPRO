#!/bin/bash
# ═══════════════════════════════════════════════════════
# 🏁 ARES SensiPRO — DEPLOY A PRODUCCIÓN
# sensibilidadespro.com GOES LIVE
# ═══════════════════════════════════════════════════════

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}🏁 ARES SensiPRO — PRODUCTION DEPLOY${NC}"
echo "═══════════════════════════════════════════════════"
echo ""

# PRE-FLIGHT CHECKS
echo -e "${YELLOW}1️⃣  Pre-flight checks...${NC}"

echo -n "   Git branch: "
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
  echo -e "${RED}❌ Must be on 'main' branch (currently on '$BRANCH')${NC}"
  exit 1
fi
echo -e "${GREEN}main ✅${NC}"

echo -n "   Clean working tree: "
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${RED}❌ Uncommitted changes${NC}"
  exit 1
fi
echo -e "${GREEN}clean ✅${NC}"

echo -n "   TypeScript: "
npx tsc --noEmit --silent && echo -e "${GREEN}ok ✅${NC}" || { echo -e "${RED}❌ Type errors${NC}"; exit 1; }

echo -n "   Unit tests: "
npx vitest run --silent && echo -e "${GREEN}passed ✅${NC}" || { echo -e "${RED}❌ Test failures${NC}"; exit 1; }

echo -n "   Lint: "
npm run lint --silent && echo -e "${GREEN}ok ✅${NC}" || { echo -e "${RED}❌ Lint errors${NC}"; exit 1; }

# BUILD
echo ""
echo -e "${YELLOW}2️⃣  Building...${NC}"
npm run build
echo -e "   ${GREEN}Build complete ✅${NC}"

# DEPLOY
echo ""
echo -e "${YELLOW}3️⃣  Deploying to Vercel (production)...${NC}"
vercel --prod
echo -e "   ${GREEN}Deployed ✅${NC}"

# POST-DEPLOY VERIFICATION
echo ""
echo -e "${YELLOW}4️⃣  Post-deploy verification...${NC}"

PROD_URL="https://sensibilidadespro.com"

echo -n "   Health check: "
HEALTH=$(curl -s "${PROD_URL}/api/health")
STATUS=$(echo "$HEALTH" | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).status" 2>/dev/null || echo "failed")
if [ "$STATUS" = "healthy" ]; then
  echo -e "${GREEN}healthy ✅${NC}"
else
  echo -e "${RED}❌ ${STATUS}${NC}"
fi

echo -n "   SSL: "
SSL_OK=$(curl -sI "${PROD_URL}" | grep -c "HTTP/2 200\|HTTP/2 301\|HTTP/1.1 200" || true)
if [ "$SSL_OK" -ge 1 ]; then
  echo -e "${GREEN}valid ✅${NC}"
else
  echo -e "${RED}❌ SSL issue${NC}"
fi

echo -n "   Sitemap: "
SITEMAP_OK=$(curl -s "${PROD_URL}/sitemap.xml" | grep -c "<url>" || true)
echo -e "${GREEN}${SITEMAP_OK} URLs ✅${NC}"

echo -n "   Robots.txt: "
ROBOTS_OK=$(curl -s "${PROD_URL}/robots.txt" | grep -c "Sitemap" || true)
if [ "$ROBOTS_OK" -ge 1 ]; then
  echo -e "${GREEN}ok ✅${NC}"
else
  echo -e "${RED}❌ Missing sitemap reference${NC}"
fi

# DONE
echo ""
echo "═══════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}🎉🎉🎉 sensibilidadespro.com IS LIVE! 🎉🎉🎉${NC}"
echo ""
echo -e "${CYAN}POST-LAUNCH CHECKLIST:${NC}"
echo "   □ Submit sitemap to Google Search Console"
echo "   □ Submit sitemap to Bing Webmaster Tools"
echo "   □ Verify Sentry is receiving events"
echo "   □ Test MercadoPago payment flow"
echo "   □ Test Stripe payment flow"
echo "   □ Verify push notifications work"
echo "   □ Check Vercel Analytics dashboard"
echo "   □ Monitor first 24h for errors"
echo "   □ Announce on social media"
echo ""
echo -e "${YELLOW}🔥 ARES SensiPRO — SystemWoods era ends today.${NC}"
echo ""
