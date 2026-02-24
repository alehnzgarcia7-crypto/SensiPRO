#!/bin/bash
# ═══════════════════════════════════════════════════════
# Build APK para SensiPRO
# Requiere: Node.js, Java 17+, Android SDK, Capacitor CLI
# ═══════════════════════════════════════════════════════

set -euo pipefail

echo "🔧 ARES SensiPRO — Build APK"
echo "═══════════════════════════════"

# 1. Build Next.js static export
echo ""
echo "1️⃣ Building Next.js static export..."
npm run build
npx next export -o out

# 2. Sync with Capacitor
echo ""
echo "2️⃣ Syncing Capacitor..."
npx cap sync android

# 3. Build APK
echo ""
echo "3️⃣ Building APK..."
cd android
./gradlew assembleRelease

# 4. Copy APK
echo ""
echo "4️⃣ Copying APK..."
APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
if [ -f "$APK_PATH" ]; then
  cp "$APK_PATH" "../sensipro-release.apk"
  echo "✅ APK generado: sensipro-release.apk"
  echo "   Tamaño: $(du -h ../sensipro-release.apk | cut -f1)"
else
  echo "❌ APK no encontrado en $APK_PATH"
  exit 1
fi

cd ..
echo ""
echo "═══════════════════════════════"
echo "🎯 Build completado"
echo ""
echo "Para firmar el APK:"
echo "  jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \\"
echo "    -keystore sensipro.keystore sensipro-release.apk sensipro"
echo ""
echo "Para alinear el APK:"
echo "  zipalign -v 4 sensipro-release.apk sensipro-aligned.apk"
