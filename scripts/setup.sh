#!/bin/bash
set -e

echo ""
echo "🎮 ═══════════════════════════════════════════════════════"
echo "   ARES SensiPRO — Setup Completo"
echo "═══════════════════════════════════════════════════════"
echo ""

# 1. Check prerequisites
echo "📋 Verificando requisitos..."

if ! command -v node &> /dev/null; then
  echo "❌ Node.js no instalado. Requiere v20+"
  exit 1
fi
NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 20 ]; then
  echo "❌ Node.js v20+ requerido (tienes v$(node -v))"
  exit 1
fi
echo "  ✅ Node.js $(node -v)"

if ! command -v docker &> /dev/null; then
  echo "❌ Docker no instalado"
  exit 1
fi
echo "  ✅ Docker $(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')"

if ! command -v git &> /dev/null; then
  echo "❌ Git no instalado"
  exit 1
fi
echo "  ✅ Git $(git --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')"

echo ""

# 2. Docker services
echo "🐳 Levantando PostgreSQL y Redis..."
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d

echo "⏳ Esperando que los servicios estén listos..."
for i in {1..15}; do
  if docker compose -f infrastructure/docker/docker-compose.dev.yml ps | grep -q "healthy"; then
    break
  fi
  sleep 1
done
sleep 2

echo "  ✅ PostgreSQL: localhost:5432 (ares/ares)"
echo "  ✅ Redis: localhost:6379"
echo ""

# 3. Environment
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  # Generate random NEXTAUTH_SECRET
  SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/genera-un-string-random-de-al-menos-32-caracteres/${SECRET}/" .env.local
  else
    sed -i "s/genera-un-string-random-de-al-menos-32-caracteres/${SECRET}/" .env.local
  fi
  echo "  ✅ .env.local creado con NEXTAUTH_SECRET generado"
else
  echo "  ℹ️  .env.local ya existe, no se sobreescribe"
fi
echo ""

# 4. Dependencies
echo "📦 Instalando dependencias..."
npm install
echo "  ✅ Dependencias instaladas"
echo ""

# 5. Prisma
echo "🗄️  Configurando base de datos..."
npm run db:generate
npm run db:migrate -- --name init
echo "  ✅ Prisma Client generado y migraciones aplicadas"
echo ""

# 6. Seed
echo "🌱 Sembrando datos iniciales..."
npm run db:seed
echo "  ✅ Admin + achievements creados"
echo ""

# 7. Verify
echo "🔍 Verificando TypeScript..."
npx tsc --noEmit && echo "  ✅ TypeScript compila sin errores" || echo "  ⚠️  TypeScript tiene errores"
echo ""

# 8. Done
echo "🎯 ═══════════════════════════════════════════════════════"
echo "   ¡Setup completo! Para iniciar:"
echo ""
echo "   npm run dev          → Servidor de desarrollo"
echo "   npm run db:studio    → Prisma Studio (ver BD)"
echo "   npm test             → Correr tests"
echo "═══════════════════════════════════════════════════════"
echo ""
