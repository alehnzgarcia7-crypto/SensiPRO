#!/bin/bash
# ═══════════════════════════════════════════════════════
# SEO Verification Checklist
# ═══════════════════════════════════════════════════════

set -euo pipefail

URL="${1:-https://sensibilidadespro.com}"

echo "🔍 SEO Checklist — ${URL}"
echo "═══════════════════════════════════════"

# 1. Check main page
echo ""
echo "1. Main page:"
HTTP=$(curl -sI "${URL}" | head -1)
echo "   Status: ${HTTP}"

# 2. Check meta tags
echo ""
echo "2. Meta tags:"
curl -s "${URL}" | grep -oP '<title>.*?</title>' | head -1 | sed 's/^/   /'
curl -s "${URL}" | grep -oP 'content="[^"]*"' | grep -i description | head -1 | sed 's/^/   /'

# 3. Check OG tags
echo ""
echo "3. Open Graph:"
curl -s "${URL}" | grep "og:" | head -5 | sed 's/^/   /'

# 4. Sitemap
echo ""
echo "4. Sitemap:"
SITEMAP_COUNT=$(curl -s "${URL}/sitemap.xml" | grep -c "<url>" || echo "0")
echo "   URLs in sitemap: ${SITEMAP_COUNT}"

# 5. Robots.txt
echo ""
echo "5. Robots.txt:"
curl -s "${URL}/robots.txt" | head -5 | sed 's/^/   /'

# 6. Structured data
echo ""
echo "6. Structured data (JSON-LD):"
LD_COUNT=$(curl -s "${URL}" | grep -c "application/ld+json" || echo "0")
echo "   JSON-LD blocks: ${LD_COUNT}"

# 7. Performance headers
echo ""
echo "7. Headers:"
curl -sI "${URL}" | grep -iE "cache-control|x-frame|content-type|x-content-type" | sed 's/^/   /'

echo ""
echo "═══════════════════════════════════════"
echo "🎯 Checklist complete"
