#!/bin/bash
# ═══════════════════════════════════════════════════════
# Submit sitemap to Google Search Console
# Requiere: gcloud CLI autenticado con acceso a GSC
# ═══════════════════════════════════════════════════════

set -euo pipefail

SITE_URL="https://sensibilidadespro.com"
SITEMAP_URL="${SITE_URL}/sitemap.xml"

echo "📡 Submitting sitemap to Google..."
echo "   Site: ${SITE_URL}"
echo "   Sitemap: ${SITEMAP_URL}"

# Ping Google
curl -s "https://www.google.com/ping?sitemap=${SITEMAP_URL}" > /dev/null
echo "   ✅ Google pinged"

# Ping Bing
curl -s "https://www.bing.com/ping?sitemap=${SITEMAP_URL}" > /dev/null
echo "   ✅ Bing pinged"

echo ""
echo "Verifica en Google Search Console:"
echo "   https://search.google.com/search-console/sitemaps"
echo ""
echo "🎯 Sitemap submitted"
