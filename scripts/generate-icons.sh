#!/bin/bash
# Genera todos los tamaños de iconos PWA desde un icon-512x512.png fuente
# Requiere: sharp-cli (npm i -g sharp-cli)

set -euo pipefail

SOURCE="public/icons/icon-512x512.png"
OUTDIR="public/icons"

if [ ! -f "$SOURCE" ]; then
  echo "No se encontro $SOURCE"
  echo "   Coloca un icono de 512x512 en esa ruta y vuelve a ejecutar."
  exit 1
fi

SIZES=(16 32 72 96 128 144 152 192 384 512)

for SIZE in "${SIZES[@]}"; do
  npx sharp-cli -i "$SOURCE" -o "${OUTDIR}/icon-${SIZE}x${SIZE}.png" resize "$SIZE" "$SIZE"
  echo "  icon-${SIZE}x${SIZE}.png generado"
done

# Apple touch icon (180x180)
npx sharp-cli -i "$SOURCE" -o "${OUTDIR}/apple-touch-icon.png" resize 180 180
echo "  apple-touch-icon.png generado"

# Shortcut icons (96x96)
cp "${OUTDIR}/icon-96x96.png" "${OUTDIR}/shortcut-generator.png"
cp "${OUTDIR}/icon-96x96.png" "${OUTDIR}/shortcut-academy.png"
echo "  shortcut icons generados"

echo ""
echo "${#SIZES[@]} iconos generados en ${OUTDIR}"
