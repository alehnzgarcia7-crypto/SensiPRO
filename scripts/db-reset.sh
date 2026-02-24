#!/bin/bash
set -e

echo "🗄️  Reseteando base de datos ARES..."
echo "⚠️  Esto borrará TODOS los datos."
echo ""
read -p "¿Continuar? (y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
  echo "Cancelado."
  exit 0
fi

npm run db:reset
npm run db:seed

echo ""
echo "✅ Base de datos reseteada y seed aplicado."
