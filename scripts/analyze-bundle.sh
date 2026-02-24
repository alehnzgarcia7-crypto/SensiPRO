#!/bin/bash
# ═══════════════════════════════════════════════════════
# Analizar bundle size del proyecto
# ═══════════════════════════════════════════════════════

set -euo pipefail

echo "📊 ARES SensiPRO — Bundle Analysis"
echo "═══════════════════════════════════════"

# 1. Build with analysis
echo ""
echo "1️⃣ Building with ANALYZE=true..."
ANALYZE=true npm run build

# 2. Check output sizes
echo ""
echo "2️⃣ Output sizes:"
echo "   .next/static/chunks:"
du -sh .next/static/chunks/ 2>/dev/null || echo "   (not found)"
echo ""
echo "   Largest JS files:"
find .next/static -name "*.js" -exec du -sh {} + 2>/dev/null | sort -rh | head -10

# 3. Run Lighthouse
echo ""
echo "3️⃣ Running Lighthouse (requires lighthouse CLI)..."
if command -v lighthouse &>/dev/null; then
  lighthouse http://localhost:3000 \
    --chrome-flags="--headless --no-sandbox" \
    --output=json \
    --output-path=./lighthouse-report.json \
    --only-categories=performance,accessibility,best-practices,seo \
    --quiet

  echo "   Report saved: lighthouse-report.json"

  # Extract scores
  node -e "
    const r = require('./lighthouse-report.json');
    const cats = r.categories;
    console.log('   Performance:    ' + Math.round(cats.performance.score * 100));
    console.log('   Accessibility:  ' + Math.round(cats.accessibility.score * 100));
    console.log('   Best Practices: ' + Math.round(cats['best-practices'].score * 100));
    console.log('   SEO:            ' + Math.round(cats.seo.score * 100));
  "
else
  echo "   ⚠️ lighthouse CLI not installed. Run: npm i -g lighthouse"
fi

echo ""
echo "═══════════════════════════════════════"
echo "🎯 Analysis complete"
