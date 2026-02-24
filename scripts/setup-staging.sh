#!/bin/bash
# ═══════════════════════════════════════════════════════
# Setup staging environment
# ═══════════════════════════════════════════════════════

set -euo pipefail

echo "🚀 ARES SensiPRO — Staging Setup"
echo "═══════════════════════════════════════"

echo ""
echo "1️⃣ Verificando herramientas..."
command -v vercel &>/dev/null || { echo "❌ vercel CLI no instalado: npm i -g vercel"; exit 1; }
command -v node &>/dev/null || { echo "❌ Node.js no instalado"; exit 1; }

echo "   ✅ vercel CLI: $(vercel --version)"
echo "   ✅ node: $(node --version)"

echo ""
echo "2️⃣ Variables de entorno necesarias:"
echo "   DATABASE_URL          → Neon/Supabase PostgreSQL connection string"
echo "   REDIS_URL             → Upstash Redis URL"
echo "   NEXTAUTH_SECRET       → openssl rand -base64 32"
echo "   NEXTAUTH_URL          → https://staging.sensibilidadespro.com"
echo "   MERCADOPAGO_ACCESS_TOKEN → MercadoPago sandbox token"
echo "   STRIPE_SECRET_KEY     → Stripe test key (sk_test_...)"
echo "   STRIPE_WEBHOOK_SECRET → Stripe webhook secret (whsec_...)"
echo "   RESEND_API_KEY        → Resend API key"
echo "   VAPID_PUBLIC_KEY      → npx web-push generate-vapid-keys"
echo "   VAPID_PRIVATE_KEY     → (from same command)"
echo "   CRON_SECRET           → openssl rand -hex 16"
echo "   GOOGLE_CLIENT_ID      → Google OAuth"
echo "   GOOGLE_CLIENT_SECRET  → Google OAuth"

echo ""
echo "3️⃣ Para configurar en Vercel:"
echo "   vercel link"
echo "   vercel env add DATABASE_URL staging"
echo "   vercel env add REDIS_URL staging"
echo "   # ... repeat for each variable"

echo ""
echo "4️⃣ Para deploy manual:"
echo "   vercel --env staging"

echo ""
echo "5️⃣ Para verificar:"
echo "   curl https://staging.sensibilidadespro.com/api/health"

echo ""
echo "═══════════════════════════════════════"
echo "📋 Checklist antes de staging:"
echo "   □ Database provisioned (Neon/Supabase)"
echo "   □ Redis provisioned (Upstash)"
echo "   □ All env vars set in Vercel"
echo "   □ Prisma migrations run"
echo "   □ Seed data loaded"
echo "   □ Domain configured"
