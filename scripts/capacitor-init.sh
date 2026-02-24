#!/bin/bash
# ═══════════════════════════════════════════════════════
# Inicializar Capacitor en el proyecto
# ═══════════════════════════════════════════════════════

set -euo pipefail

echo "📱 Inicializando Capacitor..."

# Install dependencies
npm install @capacitor/core @capacitor/cli @capacitor/android \
  @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard \
  --save

# Initialize Capacitor
npx cap init "SensiPRO" "com.sensibilidadespro.app" --web-dir=out

# Add Android platform
npx cap add android

echo ""
echo "✅ Capacitor inicializado"
echo ""
echo "Próximos pasos:"
echo "  1. npm run build && npx next export -o out"
echo "  2. npx cap sync android"
echo "  3. npx cap open android  (abre Android Studio)"
echo "  4. O ejecuta: bash scripts/build-apk.sh"
