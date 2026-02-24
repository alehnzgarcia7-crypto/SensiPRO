# ═══════════════════════════════════════════════════════════════════════════════
#
#     █████╗ ██████╗ ███████╗███████╗
#    ██╔══██╗██╔══██╗██╔════╝██╔════╝
#    ███████║██████╔╝█████╗  ███████╗
#    ██╔══██║██╔══██╗██╔══╝  ╚════██║
#    ██║  ██║██║  ██║███████╗███████║
#    ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝
#
#    ███████╗███████╗███╗   ██╗███████╗██╗██████╗ ██████╗  ██████╗
#    ██╔════╝██╔════╝████╗  ██║██╔════╝██║██╔══██╗██╔══██╗██╔═══██╗
#    ███████╗█████╗  ██╔██╗ ██║███████╗██║██████╔╝██████╔╝██║   ██║
#    ╚════██║██╔══╝  ██║╚██╗██║╚════██║██║██╔═══╝ ██╔══██╗██║   ██║
#    ███████║███████╗██║ ╚████║███████║██║██║     ██║  ██║╚██████╔╝
#    ╚══════╝╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝╚═╝     ╚═╝  ╚═╝ ╚═════╝
#
#    Generador de Sensibilidades #1 para Free Fire 🎯
#    Plataforma Gaming Enterprise — Hecho en Cancún, México 🇲🇽
#    Nombre código: ARES (Dios de la Guerra)
#
#    "Si SystemWoods es un scooter, ARES es un F1" 🏎️🔥
#
# ═══════════════════════════════════════════════════════════════════════════════

# CLAUDE.md — Arquitectura y Reglas del Proyecto ARES
# Versión: 1.0 | Fecha: 2026-02-17
# Este archivo es la REFERENCIA MAESTRA para Claude Code.
# ╔══════════════════════════════════════════════════════════════╗
# ║  LÉELO COMPLETO antes de tocar CUALQUIER archivo.           ║
# ║  Si no lo lees, el proyecto no va a funcionar.              ║
# ║  No es opcional. No es sugerencia. Es OBLIGATORIO.          ║
# ╚══════════════════════════════════════════════════════════════╝

---

## 🏛️ VISIÓN Y MISIÓN

### ¿Qué es ARES?

ARES es la **plataforma #1 de sensibilidades para Free Fire en LATAM**, construida
con tecnología enterprise (Next.js 14 + TypeScript + PostgreSQL) para servir a los
**50+ millones de jugadores** de Free Fire en América Latina.

### ¿Por qué ARES destruye a SystemWoods?

```
┌─────────────────────────┬──────────────────────┬──────────────────────┐
│ Característica          │ SystemWoods 2.0      │ ARES SensiPRO        │
├─────────────────────────┼──────────────────────┼──────────────────────┤
│ Algoritmo               │ Valores genéricos    │ Basado en hardware   │
│                         │ aleatorios           │ real del dispositivo │
├─────────────────────────┼──────────────────────┼──────────────────────┤
│ Dispositivos            │ ~200                 │ 500+                 │
├─────────────────────────┼──────────────────────┼──────────────────────┤
│ Giroscopio              │ ❌ No incluido       │ ✅ Completo (Premium)│
├─────────────────────────┼──────────────────────┼──────────────────────┤
│ Estilos de juego        │ 1 genérico           │ 3 especializados     │
├─────────────────────────┼──────────────────────┼──────────────────────┤
│ Tecnología              │ WordPress/PHP básico │ Next.js 14 + TS      │
├─────────────────────────┼──────────────────────┼──────────────────────┤
│ Diseño                  │ Template comprado    │ Design system gaming │
│                         │                      │ AAA custom           │
├─────────────────────────┼──────────────────────┼──────────────────────┤
│ Mobile                  │ No optimizado        │ PWA + APK Android    │
├─────────────────────────┼──────────────────────┼──────────────────────┤
│ SEO                     │ Básico               │ Enterprise (cada     │
│                         │                      │ device = URL propia) │
├─────────────────────────┼──────────────────────┼──────────────────────┤
│ Comunidad               │ ❌ No existe         │ Rankings, torneos,   │
│                         │                      │ logros, compartir    │
├─────────────────────────┼──────────────────────┼──────────────────────┤
│ Academia                │ ❌ No existe         │ 20+ guías, tips,     │
│                         │                      │ análisis de meta     │
├─────────────────────────┼──────────────────────┼──────────────────────┤
│ Monetización            │ Ads genéricos        │ Tiers + códigos +    │
│                         │                      │ MercadoPago + Stripe │
├─────────────────────────┼──────────────────────┼──────────────────────┤
│ Velocidad               │ Lento (WordPress)    │ <1s render (Next.js) │
├─────────────────────────┼──────────────────────┼──────────────────────┤
│ Comparador              │ ❌ No existe         │ ✅ Side-by-side      │
├─────────────────────────┼──────────────────────┼──────────────────────┤
│ Exportar configs        │ ❌ No existe         │ ✅ Imagen + PDF      │
└─────────────────────────┴──────────────────────┴──────────────────────┘
```

### Números del proyecto:

```
┌───────────────────────────────────────────────────────────────┐
│                    ARES — EN NÚMEROS                           │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Scripts de construcción ···· 68                               │
│  Archivos a generar ········ ~450                              │
│  Endpoints API ············· ~80                               │
│  Modelos de datos ·········· 18 modelos + 12 enums            │
│  Líneas de código ·········· ~60,000+ estimadas               │
│  Fases de desarrollo ······· 9 (F0 → F8)                     │
│  Dispositivos soportados ··· 500+                             │
│  Sensibilidades generadas ·· 1,500+ (500 × 3 estilos)        │
│  Guías de academia ········· 20+                              │
│  Tips pre-escritos ········· 100+                             │
│  Logros/badges ············· 20+                              │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Especificaciones completas:** `docs/MASTER-PLAN-[A-I].md` (9 archivos, uno por fase)
**Progreso actual:** `PROGRESS.md` (actualizar después de CADA script)

---

## 📁 ESTRUCTURA COMPLETA DEL PROYECTO

```
~/SensiPRO/
│
├── CLAUDE.md                              ← 📖 ESTE ARCHIVO (léelo primero SIEMPRE)
├── PROGRESS.md                            ← 📊 Tracker de progreso (actualízalo SIEMPRE)
├── autopilot.sh                           ← 🤖 Ejecutor autónomo de scripts
│
├── docs/                                  ← 📚 Documentación completa
│   ├── MASTER-PLAN-A.md                   ← Fase 0: Fundación (8 scripts)
│   ├── MASTER-PLAN-B.md                   ← Fase 1: Motor de Sensibilidades (10 scripts)
│   ├── MASTER-PLAN-C.md                   ← Fase 2: UI/UX Elite Gaming (8 scripts)
│   ├── MASTER-PLAN-D.md                   ← Fase 3: Academia PRO (6 scripts)
│   ├── MASTER-PLAN-E.md                   ← Fase 4: Monetización (8 scripts)
│   ├── MASTER-PLAN-F.md                   ← Fase 5: Comunidad y Social (8 scripts)
│   ├── MASTER-PLAN-G.md                   ← Fase 6: Admin y Analytics (6 scripts)
│   ├── MASTER-PLAN-H.md                   ← Fase 7: Mobile y PWA (5 scripts)
│   ├── MASTER-PLAN-I.md                   ← Fase 8: SEO, Growth, Deploy (9 scripts)
│   ├── API.md                             ← Documentación de endpoints
│   ├── ARCHITECTURE.md                    ← Diagramas de arquitectura
│   ├── DATABASE-SCHEMA.md                 ← ERD y tablas
│   ├── DEVICES.md                         ← Catálogo de dispositivos y specs
│   └── ALGORITHMS.md                      ← Documentación del motor de sensibilidades
│
├── packages/                              ← 📦 Librerías compartidas (workspace)
│   │
│   ├── database/                          ← 🗄️ Prisma schema + client + migrations + seed
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── prisma/
│   │   │   ├── schema.prisma              ← FUENTE DE VERDAD del schema (18 modelos)
│   │   │   ├── migrations/               ← Auto-generated by Prisma
│   │   │   └── seeds/
│   │   │       ├── devices.seed.ts        ← 500+ dispositivos con specs reales
│   │   │       ├── sensitivities.seed.ts  ← 1,500+ sensibilidades generadas
│   │   │       ├── guides.seed.ts         ← 20+ guías pre-escritas
│   │   │       ├── tips.seed.ts           ← 100+ tips de Free Fire
│   │   │       ├── achievements.seed.ts   ← 20+ logros
│   │   │       └── run-seed.ts            ← Entry point del seed completo
│   │   └── src/
│   │       ├── client.ts                  ← PrismaClient singleton
│   │       └── index.ts                   ← Re-export client + generated types
│   │
│   ├── algorithms/                        ← 🧠 Motor de sensibilidades (EL CORE)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts                   ← Barrel exports
│   │       ├── sensitivity.engine.ts      ← Algoritmo principal de cálculo
│   │       ├── gyroscope.engine.ts        ← Motor de giroscopio
│   │       ├── device.analyzer.ts         ← Análisis de specs del dispositivo
│   │       ├── style.profiles.ts          ← Perfiles: agresivo/balanceado/francotirador
│   │       ├── comparison.engine.ts       ← Motor de comparación entre dispositivos
│   │       ├── specs.analyzer.ts          ← Categorizador inteligente de tier
│   │       ├── seed-generator.ts          ← Generador masivo de sensibilidades para seed
│   │       ├── constants.ts               ← Todas las constantes del algoritmo
│   │       └── __tests__/
│   │           ├── sensitivity.test.ts
│   │           ├── gyroscope.test.ts
│   │           ├── comparison.test.ts
│   │           └── styles.test.ts
│   │
│   ├── types/                             ← 📝 @ares/types — TypeScript types globales
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── user.types.ts              ← UserProfile, UserSession, UserPublic
│   │       ├── device.types.ts            ← DeviceInfo, DeviceSpecs, DeviceBrand
│   │       ├── sensitivity.types.ts       ← SensitivityResult, GenerateRequest
│   │       ├── payment.types.ts           ← CheckoutRequest, ActivationResult
│   │       ├── api.types.ts               ← ApiResponse<T>, ApiError, PaginatedResponse
│   │       ├── academy.types.ts           ← GuideInfo, GuideFull, TipOfDay
│   │       └── community.types.ts         ← LeaderboardEntry, TournamentInfo
│   │
│   ├── utils/                             ← 🔧 @ares/utils — Helpers compartidos
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── format.ts                  ← formatNumber, formatCurrency, slugify
│   │       ├── validation.ts              ← isValidEmail, isValidUsername
│   │       ├── device.utils.ts            ← normalizeDeviceName, getBrandIcon
│   │       ├── sensitivity.utils.ts       ← formatSensitivity, getStyleColor
│   │       ├── tier.utils.ts              ← canAccess, isFeatureAvailable
│   │       └── crypto.ts                  ← generateCode, hashPassword
│   │
│   ├── errors/                            ← ⚠️ @ares/errors — Clases de error estándar
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── base.error.ts              ← AresError base class
│   │       ├── errors.ts                  ← NotFoundError, AuthError, BusinessError, etc.
│   │       └── error-handler.ts           ← handleApiError, formatErrorResponse
│   │
│   ├── logger/                            ← 📋 @ares/logger — Logging wrapper
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       └── logger.ts                  ← createLogger, structured JSON output
│   │
│   └── config/                            ← ⚙️ @ares/config — Env management
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── env.ts                     ← getEnvOrThrow, validateEnv (Zod)
│           └── constants.ts               ← APP_NAME, limits, prices, ranges
│
├── src/                                   ← 💻 Aplicación Next.js 14
│   │
│   ├── app/                               ← 🌐 App Router (páginas y API)
│   │   ├── layout.tsx                     ← Root layout + providers + fonts + metadata
│   │   ├── page.tsx                       ← Landing page épica (SEO optimized)
│   │   ├── globals.css                    ← Tailwind + custom gaming styles
│   │   ├── not-found.tsx                  ← 404 page gaming themed
│   │   ├── error.tsx                      ← Error boundary gaming themed
│   │   ├── loading.tsx                    ← Global loading state
│   │   │
│   │   ├── (auth)/                        ← 🔐 Grupo: autenticación
│   │   │   ├── layout.tsx                 ← Layout centrado con fondo gaming
│   │   │   ├── login/page.tsx             ← Login con diseño gaming
│   │   │   └── register/page.tsx          ← Registro con validación real-time
│   │   │
│   │   ├── (main)/                        ← 🎮 Grupo: app principal (requiere auth)
│   │   │   ├── layout.tsx                 ← Layout con navbar + mobile nav
│   │   │   ├── generator/page.tsx         ← 🎯 GENERADOR PRINCIPAL (la joya)
│   │   │   ├── results/[id]/page.tsx      ← Resultados de sensibilidad
│   │   │   ├── compare/page.tsx           ← Comparador side-by-side
│   │   │   ├── favorites/page.tsx         ← Configuraciones guardadas
│   │   │   ├── history/page.tsx           ← Historial de búsquedas (timeline)
│   │   │   ├── profile/page.tsx           ← Perfil del usuario
│   │   │   ├── profile/subscription/page.tsx ← Gestión de suscripción
│   │   │   ├── leaderboard/page.tsx       ← Rankings globales
│   │   │   ├── tournaments/page.tsx       ← Torneos
│   │   │   ├── tournaments/[id]/page.tsx  ← Detalle de torneo
│   │   │   ├── activate/page.tsx          ← Activar código
│   │   │   ├── support/page.tsx           ← Formulario de soporte
│   │   │   └── payments/
│   │   │       ├── success/page.tsx       ← Éxito post-pago
│   │   │       └── failure/page.tsx       ← Error post-pago
│   │   │
│   │   ├── academy/                       ← 📚 Grupo: academia (parcialmente público)
│   │   │   ├── layout.tsx                 ← Layout con sidebar de navegación
│   │   │   ├── page.tsx                   ← Hub de academia
│   │   │   ├── guides/page.tsx            ← Lista de guías
│   │   │   ├── guides/[slug]/page.tsx     ← Guía individual
│   │   │   ├── tips/page.tsx              ← Tips y trucos
│   │   │   ├── meta/page.tsx              ← Análisis de meta actual
│   │   │   └── videos/page.tsx            ← Video tutoriales
│   │   │
│   │   ├── devices/                       ← 📱 Grupo: catálogo de dispositivos (público, SEO)
│   │   │   ├── page.tsx                   ← Catálogo con filtros
│   │   │   ├── [brand]/page.tsx           ← Dispositivos por marca
│   │   │   └── [brand]/[model]/page.tsx   ← Página individual (SEO gold)
│   │   │
│   │   ├── pricing/page.tsx               ← 💰 Página de precios
│   │   ├── community/page.tsx             ← 👥 Hub de comunidad
│   │   ├── share/[id]/page.tsx            ← 🔗 Config compartida (pública, OG metadata)
│   │   │
│   │   ├── admin/                         ← 👑 Panel admin (protegido role ADMIN)
│   │   │   ├── layout.tsx                 ← Layout admin con sidebar
│   │   │   ├── page.tsx                   ← Dashboard principal
│   │   │   ├── users/page.tsx             ← Gestión de usuarios
│   │   │   ├── devices/page.tsx           ← Gestión de dispositivos
│   │   │   ├── codes/page.tsx             ← Generar/gestionar códigos
│   │   │   ├── content/page.tsx           ← CMS para guías/tips
│   │   │   ├── analytics/page.tsx         ← Analytics y métricas
│   │   │   ├── tournaments/page.tsx       ← Gestionar torneos
│   │   │   ├── support/page.tsx           ← Tickets de soporte
│   │   │   └── revenue/page.tsx           ← Dashboard de ingresos
│   │   │
│   │   └── api/                           ← 🔌 API Routes
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── devices/route.ts           ← GET: list, search, filter
│   │       ├── devices/[id]/route.ts      ← GET: device detail
│   │       ├── devices/brands/route.ts    ← GET: list brands
│   │       ├── sensitivity/generate/route.ts  ← POST: generar sensibilidad
│   │       ├── sensitivity/compare/route.ts   ← POST: comparar 2 devices
│   │       ├── favorites/route.ts         ← GET, POST, DELETE
│   │       ├── history/route.ts           ← GET, POST, DELETE
│   │       ├── codes/activate/route.ts    ← POST: activar código
│   │       ├── payments/checkout/route.ts ← POST: crear sesión pago
│   │       ├── payments/webhook/mp/route.ts   ← POST: webhook MercadoPago
│   │       ├── payments/webhook/stripe/route.ts ← POST: webhook Stripe
│   │       ├── academy/guides/route.ts    ← GET: guías
│   │       ├── academy/tips/route.ts      ← GET: tips
│   │       ├── community/leaderboard/route.ts ← GET: rankings
│   │       ├── community/tournaments/route.ts ← GET, POST
│   │       ├── community/configs/route.ts ← GET, POST: configs compartidas
│   │       ├── community/vote/route.ts    ← POST: votar config
│   │       ├── comments/route.ts          ← GET, POST, DELETE
│   │       ├── notifications/route.ts     ← GET, PATCH
│   │       ├── users/[id]/route.ts        ← GET: perfil público
│   │       ├── users/achievements/route.ts ← GET: logros
│   │       ├── share/route.ts             ← POST: crear share link
│   │       ├── export/image/route.ts      ← POST: exportar como imagen
│   │       ├── export/pdf/route.ts        ← POST: exportar como PDF
│   │       ├── admin/users/route.ts       ← GET, PATCH (admin)
│   │       ├── admin/codes/route.ts       ← GET, POST (admin)
│   │       ├── admin/devices/route.ts     ← GET, POST, PATCH (admin)
│   │       ├── admin/guides/route.ts      ← GET, POST, PATCH, DELETE (admin)
│   │       ├── admin/analytics/route.ts   ← GET (admin)
│   │       ├── admin/tournaments/route.ts ← GET, POST, PATCH (admin)
│   │       └── health/route.ts            ← GET: health check
│   │
│   ├── components/                        ← 🧩 Componentes React
│   │   │
│   │   ├── ui/                            ← 🎨 Design System ARES (15+ componentes)
│   │   │   ├── button.tsx                 ← primary/fire/premium/vip/ghost/danger
│   │   │   ├── card.tsx                   ← default/glow/solid + glassmorphism
│   │   │   ├── input.tsx                  ← gaming styled + label + error + icon
│   │   │   ├── select.tsx                 ← custom dropdown gaming
│   │   │   ├── badge.tsx                  ← free/premium/vip/style badges + glow
│   │   │   ├── modal.tsx                  ← overlay blur + slide-in + ESC close
│   │   │   ├── toast.tsx                  ← success/error/warning/info + auto-dismiss
│   │   │   ├── skeleton.tsx               ← shimmer animation gaming
│   │   │   ├── progress.tsx               ← gradient glow progress bar
│   │   │   ├── tooltip.tsx                ← hover tooltip dark theme
│   │   │   ├── tabs.tsx                   ← animated indicator
│   │   │   ├── dropdown.tsx               ← animated dropdown menu
│   │   │   ├── slider.tsx                 ← range slider gaming
│   │   │   ├── toggle.tsx                 ← on/off with glow
│   │   │   └── index.ts                   ← Barrel exports
│   │   │
│   │   ├── generator/                     ← 🎯 Componentes del generador
│   │   │   ├── brand-selector.tsx         ← Grid de marcas con logos
│   │   │   ├── brand-grid.tsx             ← Grid responsive de marcas
│   │   │   ├── model-selector.tsx         ← Lista filtrada por marca
│   │   │   ├── device-search.tsx          ← Input con autocomplete
│   │   │   ├── device-card.tsx            ← Card de dispositivo con specs
│   │   │   ├── style-picker.tsx           ← 3 cards seleccionables
│   │   │   ├── sensitivity-display.tsx    ← Tarjeta de resultados principal
│   │   │   ├── sensitivity-card.tsx       ← Card individual de valor
│   │   │   ├── sensitivity-grid.tsx       ← Grid de 6 valores
│   │   │   ├── gyroscope-panel.tsx        ← Panel expandible gyro
│   │   │   ├── gyroscope-grid.tsx         ← Grid de 6 valores gyro
│   │   │   ├── comparison-table.tsx       ← Tabla comparativa
│   │   │   ├── device-info-card.tsx       ← Info del device seleccionado
│   │   │   ├── action-bar.tsx             ← Favorito/Compartir/Exportar
│   │   │   ├── export-card.tsx            ← Exportar imagen/PDF
│   │   │   ├── share-button.tsx           ← Compartir en redes
│   │   │   └── favorite-button.tsx        ← Toggle favorito con animación
│   │   │
│   │   ├── academy/                       ← 📚 Componentes de academia
│   │   │   ├── guide-card.tsx
│   │   │   ├── category-filter.tsx
│   │   │   ├── video-player.tsx
│   │   │   ├── tip-carousel.tsx
│   │   │   ├── tip-of-day.tsx
│   │   │   └── meta-chart.tsx
│   │   │
│   │   ├── community/                     ← 👥 Componentes de comunidad
│   │   │   ├── leaderboard-table.tsx
│   │   │   ├── achievement-badge.tsx
│   │   │   ├── tournament-card.tsx
│   │   │   ├── user-rank.tsx
│   │   │   ├── config-share-card.tsx
│   │   │   └── comment-section.tsx
│   │   │
│   │   ├── payments/                      ← 💰 Componentes de pago
│   │   │   ├── pricing-card.tsx
│   │   │   ├── code-activator.tsx
│   │   │   ├── checkout-form.tsx
│   │   │   ├── tier-badge.tsx
│   │   │   ├── upgrade-prompt.tsx
│   │   │   ├── premium-lock.tsx
│   │   │   └── referral-card.tsx
│   │   │
│   │   ├── admin/                         ← 👑 Componentes de admin
│   │   │   ├── stats-card.tsx
│   │   │   ├── data-table.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── code-generator.tsx
│   │   │
│   │   ├── layout/                        ← 📐 Layout components
│   │   │   ├── navbar.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   ├── tier-indicator.tsx
│   │   │   └── notification-bell.tsx
│   │   │
│   │   ├── effects/                       ← ✨ Efectos visuales
│   │   │   ├── particles-bg.tsx
│   │   │   ├── confetti.tsx
│   │   │   ├── count-up.tsx
│   │   │   ├── glow-card.tsx
│   │   │   └── reveal-animation.tsx
│   │   │
│   │   └── providers.tsx                  ← 🔌 Context providers wrapper
│   │
│   ├── lib/                               ← 📚 Lógica de negocio
│   │   ├── auth/
│   │   │   ├── auth.config.ts             ← NextAuth configuration
│   │   │   ├── auth.actions.ts            ← Server actions (register, login, etc.)
│   │   │   └── auth.middleware.ts         ← Route protection middleware
│   │   ├── payments/
│   │   │   ├── mercadopago.ts             ← SDK + createPreference + processWebhook
│   │   │   ├── stripe.ts                  ← SDK + createCheckoutSession + processWebhook
│   │   │   ├── code.manager.ts            ← generateCode, activateCode, bulkGenerate
│   │   │   └── subscription.service.ts    ← Manage subscriptions, renewals, cancellations
│   │   ├── tier/
│   │   │   └── tier.service.ts            ← checkAccess, upgradeUser, getFeatureAccess
│   │   ├── referral/
│   │   │   └── referral.service.ts        ← Create/track referrals, give rewards
│   │   ├── achievements/
│   │   │   └── achievement.service.ts     ← Check conditions, unlock achievements
│   │   ├── notifications/
│   │   │   └── notification.service.ts    ← In-app notifications
│   │   ├── share/
│   │   │   └── share.service.ts           ← Share links, OG metadata generation
│   │   ├── export/
│   │   │   ├── image-generator.ts         ← Canvas API → shareable card image
│   │   │   └── pdf-generator.ts           ← Config as PDF
│   │   ├── seo/
│   │   │   ├── metadata.ts               ← Dynamic metadata generator
│   │   │   └── sitemap.ts                ← Dynamic sitemap
│   │   ├── analytics/
│   │   │   ├── tracker.ts                ← Event tracking
│   │   │   └── reports.ts                ← Admin report generation
│   │   ├── security/
│   │   │   ├── rate-limiter.ts            ← Redis-based rate limiting per tier
│   │   │   ├── sanitize.ts               ← XSS protection, input sanitization
│   │   │   ├── headers.ts                ← Security headers config
│   │   │   └── csrf.ts                   ← CSRF token handling
│   │   └── ab-testing/
│   │       └── ab.service.ts              ← Simple A/B testing framework
│   │
│   ├── hooks/                             ← 🪝 Custom React hooks
│   │   ├── use-device-search.ts           ← Debounced search + cache + autocomplete
│   │   ├── use-sensitivity.ts             ← Generate + display sensitivity
│   │   ├── use-favorites.ts               ← Toggle favorite, check, list
│   │   ├── use-tier.ts                    ← Check tier + feature access
│   │   ├── use-history.ts                 ← Record + query search history
│   │   ├── use-media-query.ts             ← Responsive breakpoint detection
│   │   └── use-toast.ts                   ← Toast notifications
│   │
│   ├── store/                             ← 🗃️ Zustand stores
│   │   ├── generator.store.ts             ← Selected brand/model/style, results
│   │   ├── user.store.ts                  ← User session, tier, preferences
│   │   └── ui.store.ts                    ← Mobile nav open, modals, toasts
│   │
│   └── styles/                            ← 🎨 Estilos adicionales
│       ├── animations.css                 ← @keyframes gaming animations
│       └── gaming-theme.css               ← CSS variables del tema completo
│
├── public/                                ← 📂 Archivos estáticos
│   ├── images/
│   │   ├── brands/                        ← Logos de marcas (Samsung, Apple, Xiaomi, etc.)
│   │   ├── devices/                       ← Imágenes placeholder de dispositivos
│   │   ├── badges/                        ← Iconos de logros
│   │   ├── og/                            ← Open Graph images base
│   │   └── hero/                          ← Hero section images/backgrounds
│   ├── icons/                             ← Favicon, apple-touch, etc.
│   ├── manifest.json                      ← PWA manifest
│   └── robots.txt                         ← SEO robots
│
├── infrastructure/
│   └── docker/
│       └── docker-compose.dev.yml         ← PostgreSQL 16 + Redis 7
│
├── tests/
│   ├── unit/                              ← Vitest unit tests
│   ├── integration/                       ← API integration tests
│   ├── e2e/                               ← Playwright E2E tests
│   ├── factories/                         ← Test data factories
│   └── setup.ts                           ← Global test setup
│
├── scripts/
│   ├── ares-setup.sh                      ← Setup inicial del proyecto
│   ├── ares-telegram-setup.sh             ← Configurar notificaciones Telegram
│   └── verify-all.sh                      ← Verificar integridad del proyecto
│
├── package.json                           ← Workspace root (Turborepo)
├── turbo.json                             ← Pipeline configuration
├── tsconfig.json                          ← TypeScript base config
├── tailwind.config.ts                     ← Tailwind + design system gaming
├── next.config.ts                         ← Next.js configuration
├── postcss.config.js                      ← PostCSS for Tailwind
├── vitest.config.ts                       ← Vitest configuration
├── playwright.config.ts                   ← Playwright E2E config
├── .env.example                           ← Template de variables de entorno
├── .eslintrc.json                         ← ESLint strict config
├── .prettierrc                            ← Prettier config
├── .gitignore                             ← Git ignore rules
└── middleware.ts                           ← Next.js middleware (auth + rate limit)
```

---

## ⚡ STACK TECNOLÓGICO

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ARES — STACK COMPLETO                            │
├────────────────┬─────────────────────────┬──────────────────────────────┤
│ Capa           │ Tecnología              │ Justificación                │
├────────────────┼─────────────────────────┼──────────────────────────────┤
│ Runtime        │ Node.js 20 LTS          │ Estabilidad + performance    │
│ Lenguaje       │ TypeScript 5.4+ strict  │ Type safety no negociable    │
│ Framework      │ Next.js 14 App Router   │ SSR + SEO + API + SA + Edge  │
│ ORM            │ Prisma 5                │ Type-safe, migrations, seed  │
│ Base de datos  │ PostgreSQL 16           │ Confiable, extensible, JSONB │
│ Cache          │ Redis 7 (Upstash prod)  │ Rate limit, cache, sessions  │
│ Styling        │ Tailwind CSS 3.4        │ Utility-first + gaming theme │
│ Animaciones    │ Framer Motion 11        │ Animaciones 60fps AAA        │
│ State          │ Zustand 4               │ Ligero, simple, performante  │
│ Auth           │ NextAuth.js v5          │ OAuth + credentials + JWT    │
│ Pagos          │ Stripe + MercadoPago    │ Internacional + México       │
│ Email          │ Resend                  │ Transactional emails modern  │
│ Validación     │ Zod                     │ Runtime + type inference     │
│ UI Base        │ Radix UI primitives     │ Accesibilidad + headless     │
│ Charts         │ Recharts                │ Admin + analytics charts     │
│ Testing        │ Vitest + Playwright     │ Unit + E2E                   │
│ SEO            │ next-sitemap + schema   │ Posicionamiento orgánico     │
│ PWA            │ next-pwa                │ App-like en móvil            │
│ Images         │ Sharp + next/image      │ Optimización automática      │
│ Icons          │ Lucide React            │ Consistent icon system       │
│ Deploy         │ Vercel (prod)           │ Zero-config + edge + CDN     │
│ DB Hosting     │ Supabase / Neon         │ PostgreSQL managed + free    │
│ Redis Host     │ Upstash                 │ Serverless Redis + free tier │
│ CI/CD          │ GitHub Actions          │ Automated pipeline           │
│ Monitoring     │ Vercel Analytics+Sentry │ Métricas + error tracking    │
│ DNS + Domain   │ Cloudflare              │ CDN + DDoS + SSL             │
└────────────────┴─────────────────────────┴──────────────────────────────┘
```

### Arquitectura de alto nivel:

```
                          ┌─────────────────────────┐
                          │     CLOUDFLARE CDN       │
                          │   sensibilidadespro.com  │
                          └────────────┬────────────┘
                                       │
                          ┌────────────▼────────────┐
                          │       VERCEL EDGE        │
                          │    Next.js 14 (SSR)      │
                          │                          │
                          │  ┌──────────────────┐    │
                          │  │  Middleware       │    │
                          │  │  • Auth check     │    │
                          │  │  • Rate limiting  │    │
                          │  │  • Geolocation    │    │
                          │  └──────────────────┘    │
                          │                          │
                          │  ┌──────────────────┐    │
                          │  │  App Router       │    │
                          │  │  • Server Comps   │    │
                          │  │  • Client Comps   │    │
                          │  │  • API Routes     │    │
                          │  │  • Server Actions │    │
                          │  └──────────────────┘    │
                          └────┬───────────┬────────┘
                               │           │
                    ┌──────────▼──┐   ┌────▼─────────┐
                    │ SUPABASE/   │   │   UPSTASH     │
                    │ NEON        │   │   REDIS       │
                    │             │   │               │
                    │ PostgreSQL  │   │ • Cache       │
                    │ 16          │   │ • Rate limits │
                    │             │   │ • Sessions    │
                    │ 18 tablas   │   │               │
                    │ 500+ devices│   │               │
                    └─────────────┘   └───────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────▼────┐  ┌───────▼──────┐  ┌─────▼──────┐
     │ MERCADOPAGO │  │    STRIPE    │  │   RESEND   │
     │             │  │              │  │            │
     │ Pagos MX    │  │ Pagos INTL   │  │ Emails     │
     │ OXXO/SPEI   │  │ Cards        │  │ Welcome    │
     │ Transferen. │  │ Subscript.   │  │ Activation │
     └─────────────┘  └──────────────┘  └────────────┘
```

### Flujo del generador (la operación más importante):

```
    Usuario                    Next.js                @ares/algorithms          Prisma/PostgreSQL
      │                          │                         │                         │
      │  Selecciona marca        │                         │                         │
      │ ──────────────────────▶  │                         │                         │
      │                          │  GET /api/devices       │                         │
      │                          │  ?brand=samsung ──────────────────────────────▶   │
      │                          │                         │                 Query   │
      │  ◀──────────────────── Devices[] ◀───────────────────────────────────────── │
      │                          │                         │                         │
      │  Selecciona modelo       │                         │                         │
      │ ──────────────────────▶  │                         │                         │
      │                          │                         │                         │
      │  Selecciona estilo       │                         │                         │
      │ ──────────────────────▶  │                         │                         │
      │                          │  POST /api/sensitivity  │                         │
      │                          │  /generate              │                         │
      │                          │  {deviceId, style}      │                         │
      │                          │ ─────────────────────▶  │                         │
      │                          │                         │  1. Get device specs     │
      │                          │                         │ ──────────────────────▶  │
      │                          │                         │  ◀───── DeviceSpecs ──── │
      │                          │                         │                         │
      │                          │                         │  2. Calculate:           │
      │                          │                         │     Hz factor            │
      │                          │                         │     Screen factor        │
      │                          │                         │     RAM factor           │
      │                          │                         │     Panel factor         │
      │                          │                         │     Tier factor          │
      │                          │                         │     Style multiplier     │
      │                          │                         │     Clamp 1-100          │
      │                          │                         │                         │
      │                          │                         │  3. If Premium:          │
      │                          │                         │     Calculate gyroscope  │
      │                          │                         │                         │
      │                          │  ◀── SensitivityResult  │                         │
      │                          │                         │                         │
      │                          │  4. Record in history   │                         │
      │                          │ ──────────────────────────────────────────────▶   │
      │                          │                         │                         │
      │  ◀──────────────────── Animated result display     │                         │
      │   🎯 General: 72        │                         │                         │
      │   🔴 Red Point: 68      │                         │                         │
      │   🔭 Scope 2x: 55       │                         │                         │
      │   🔭 Scope 4x: 48       │                         │                         │
      │   🎯 Sniper: 42         │                         │                         │
      │   👁️ Free View: 75      │                         │                         │
      │                          │                         │                         │
```

---

## 🔒 REGLAS ABSOLUTAS (NUNCA ROMPER)

Estas reglas son **INQUEBRANTABLES**. Si Claude Code genera código que viola
alguna de estas reglas, el script se considera FALLIDO y debe rehacerse.

### Regla 1: TypeScript Estricto — CERO `any`

```typescript
// ✅ CORRECTO — Tipos explícitos siempre
const device: Device = await getDevice(deviceId);
const sensitivity: SensitivityResult = calculateSensitivity(device, style);
const user: UserProfile | null = await getUserById(userId);
const devices: Device[] = await prisma.device.findMany({ where: { brand } });

// ✅ CORRECTO — Generics cuando aplica
function apiResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

// ✅ CORRECTO — Zod para inferir tipos de validación
const schema = z.object({ deviceId: z.string().cuid() });
type GenerateInput = z.infer<typeof schema>;

// ❌ PROHIBIDO — JAMÁS usar 'any' bajo NINGUNA circunstancia
const data: any = response;              // ❌ NUNCA
const items = json as any[];             // ❌ NUNCA
function process(x: any): any {}         // ❌ NUNCA
const result = (error as any).message;   // ❌ NUNCA — usar 'unknown'
```

### Regla 2: Server Components por defecto

```typescript
// ✅ CORRECTO — Server Component (DEFAULT en App Router)
// Cada page.tsx es Server Component a menos que NECESITE interactividad
// src/app/devices/page.tsx
export default async function DevicesPage() {
  const devices = await prisma.device.findMany({
    where: { isActive: true },
    orderBy: { brand: 'asc' },
  });
  return <DeviceGrid devices={devices} />;
}

// ✅ CORRECTO — Client Component SOLO cuando hay interactividad
// src/components/generator/brand-selector.tsx
'use client';
import { useState, useCallback } from 'react';
export function BrandSelector({ brands }: { brands: string[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  // ... interactividad del usuario
}

// ❌ PROHIBIDO — 'use client' innecesario
'use client'; // ❌ NO poner esto si solo renderizas datos estáticos
```

### Regla 3: Validación SIEMPRE con Zod

```typescript
// ✅ CORRECTO — Todo input externo se valida con Zod
import { z } from 'zod';

export const GenerateSchema = z.object({
  deviceId: z.string().cuid('ID de dispositivo inválido'),
  style: z.enum(['AGGRESSIVE', 'BALANCED', 'SNIPER'], {
    errorMap: () => ({ message: 'Estilo debe ser AGGRESSIVE, BALANCED o SNIPER' }),
  }),
  includeGyro: z.boolean().default(false),
});

export const RegisterSchema = z.object({
  username: z.string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y _'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  referralCode: z.string().optional(),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

// En API route:
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = GenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } },
      { status: 400 }
    );
  }
  const { deviceId, style, includeGyro } = parsed.data;
  // ... continuar con datos validados y tipados
}

// ❌ PROHIBIDO — Validación manual
if (!req.body.deviceId) { ... }           // ❌ NUNCA
if (typeof style !== 'string') { ... }    // ❌ NUNCA
```

### Regla 4: Errores con @ares/errors

```typescript
// ✅ CORRECTO — Errores tipados y descriptivos
import { NotFoundError, BusinessError, AuthError, ForbiddenError, RateLimitError } from '@ares/errors';

// Dispositivo no encontrado
throw new NotFoundError('Device', deviceId);
// → { code: 'NOT_FOUND', message: 'Device not found: clxxxxxxxxx', statusCode: 404 }

// Feature requiere Premium
throw new BusinessError('PREMIUM_REQUIRED', 'El giroscopio requiere una cuenta Premium');
// → { code: 'PREMIUM_REQUIRED', message: '...', statusCode: 403 }

// Rate limit excedido
throw new RateLimitError('FREE_LIMIT', 'Has alcanzado el límite de 5 búsquedas diarias. Mejora a Premium para búsquedas ilimitadas.');
// → { code: 'RATE_LIMIT', message: '...', statusCode: 429 }

// Sesión expirada
throw new AuthError('SESSION_EXPIRED', 'Tu sesión ha expirado. Inicia sesión de nuevo.');

// Código ya usado
throw new BusinessError('CODE_ALREADY_USED', 'Este código ya fue utilizado');

// ❌ PROHIBIDO — Errores genéricos
throw new Error('algo salió mal');            // ❌ NUNCA
throw new Error('not found');                 // ❌ NUNCA — usar NotFoundError
return { error: 'invalid' };                  // ❌ NUNCA — usar throw
```

### Regla 5: Logging con @ares/logger

```typescript
// ✅ CORRECTO — Logging estructurado con contexto
import { logger } from '@ares/logger';

logger.info('Sensitivity generated', {
  userId: session.user.id,
  deviceId,
  style,
  device: `${device.brand} ${device.model}`,
  resultGeneral: result.general,
  responseTimeMs: Date.now() - startTime,
});

logger.error('Payment webhook failed', {
  provider: 'mercadopago',
  externalId: webhookData.id,
  error: err.message,
  stack: err.stack,
});

logger.warn('Rate limit approaching', {
  userId,
  tier: 'FREE',
  currentCount: 4,
  limit: 5,
});

// ❌ PROHIBIDO — JAMÁS console.log en producción
console.log('done');                          // ❌ NUNCA
console.log('user:', user);                   // ❌ NUNCA
console.error('error:', e);                   // ❌ NUNCA — usar logger.error
```

### Regla 6: API Response estándar

```typescript
// ✅ ÉXITO — Siempre esta estructura
{
  "success": true,
  "data": {
    "device": { "id": "clx...", "brand": "Samsung", "model": "Galaxy S24 Ultra" },
    "sensitivity": {
      "style": "AGGRESSIVE",
      "general": 72,
      "redPoint": 68,
      "scope2x": 55,
      "scope4x": 48,
      "sniperScope": 42,
      "freeView": 75
    }
  }
}

// ✅ ÉXITO PAGINADO
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 523,
    "totalPages": 27
  }
}

// ✅ ERROR — Siempre esta estructura
{
  "success": false,
  "error": {
    "code": "PREMIUM_REQUIRED",
    "message": "El giroscopio requiere una cuenta Premium",
    "statusCode": 403
  }
}

// ❌ PROHIBIDO — Respuestas inconsistentes
{ "error": "bad request" }                    // ❌ NUNCA — falta structure
{ "data": null, "message": "not found" }      // ❌ NUNCA — falta success/error
res.status(500).send('Internal Error');        // ❌ NUNCA — falta JSON
```

### Regla 7: NO TODOs, NO placeholders, NO stubs vacíos

```typescript
// ❌ PROHIBIDO — TODO lo siguiente
// TODO: implement later
// FIXME: this is broken
// HACK: temporary fix
throw new Error('Not implemented');
return null; // placeholder
return {} as SensitivityResult; // fake cast
// @ts-ignore
// @ts-expect-error
// eslint-disable-next-line

// ✅ CORRECTO — Si una dependencia futura no existe aún:
// El componente/función se implementa completo con la interfaz correcta
// y se marca con comentario de referencia:
// Implemented in ARES-XXX (nombre del script futuro)
```

### Regla 8: Imports con alias @ares/

```typescript
// ✅ CORRECTO — Siempre usar alias de workspace
import { prisma } from '@ares/database';
import { SensitivityEngine } from '@ares/algorithms';
import type { Device, SensitivityResult } from '@ares/types';
import { NotFoundError, BusinessError } from '@ares/errors';
import { logger } from '@ares/logger';
import { formatSensitivity, clampValue } from '@ares/utils';
import { SENSITIVITY_MIN, SENSITIVITY_MAX } from '@ares/config';

// ✅ CORRECTO — Imports relativos solo DENTRO del mismo package
import { BrandSelector } from '../generator/brand-selector';
import { useToast } from '@/hooks/use-toast';

// ❌ PROHIBIDO — Imports relativos que cruzan packages
import { prisma } from '../../../../packages/database';    // ❌ NUNCA
import { logger } from '../../../packages/logger/src';     // ❌ NUNCA
```

### Regla 9: Mobile First — SIEMPRE

```typescript
// ✅ CORRECTO — Mobile first, luego breakpoints mayores
<div className="px-4 md:px-8 lg:px-12">
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
    {brands.map(brand => <BrandCard key={brand} />)}
  </div>
</div>

// ✅ CORRECTO — Touch targets mínimo 44px
<button className="min-h-[44px] min-w-[44px] px-6 py-3">

// ❌ PROHIBIDO — Desktop first
<div className="grid grid-cols-6 sm:grid-cols-2">  // ❌ Al revés
<button className="p-1">  // ❌ Muy chico para touch
```

### Regla 10: Dark Mode ONLY — No light mode

```typescript
// ✅ CORRECTO — Todo es dark theme gaming
<body className="bg-[#050810] text-slate-200 antialiased">

// ❌ PROHIBIDO — No hay light mode, no hay toggle
<div className="dark:bg-black bg-white">       // ❌ NUNCA — no hay light
```

---

## 🗄️ DATABASE SCHEMA COMPLETO (Prisma)

Este es el schema COMPLETO. Prisma schema es la **fuente de verdad**.
Claude Code debe implementarlo EXACTAMENTE así.

```prisma
// ═══════════════════════════════════════════════════════════════
// ARES — Prisma Schema
// Base de datos: PostgreSQL 16
// 18 modelos | 12 enums | ~45 índices
// ═══════════════════════════════════════════════════════════════

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ═══════════════════════════════════
// ENUMS
// ═══════════════════════════════════

enum UserTier {
  FREE
  PREMIUM
  VIP
}

enum UserRole {
  USER
  MODERATOR
  ADMIN
}

enum SensitivityStyle {
  AGGRESSIVE
  BALANCED
  SNIPER
}

enum PanelType {
  LCD
  IPS
  AMOLED
  OLED
  LTPO
}

enum DeviceTier {
  LOW
  MID
  HIGH
  ULTRA
  GAMING
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

enum PaymentProvider {
  MERCADOPAGO
  STRIPE
  CODE
}

enum CodeStatus {
  AVAILABLE
  USED
  EXPIRED
}

enum CodeType {
  PREMIUM_30
  PREMIUM_90
  PREMIUM_365
  VIP_30
  VIP_90
  VIP_365
}

enum GuideCategory {
  SENSITIVITY
  MOVEMENT
  AIM
  STRATEGY
  DEVICE
  META
}

enum TournamentStatus {
  UPCOMING
  ACTIVE
  COMPLETED
  CANCELLED
}

// ═══════════════════════════════════
// MODELOS
// ═══════════════════════════════════

// ──────────────────────────────────
// 1. USER — Usuarios de la plataforma
// ──────────────────────────────────
model User {
  id              String    @id @default(cuid())
  email           String    @unique @db.VarChar(255)
  username        String    @unique @db.VarChar(30)
  password        String    @db.VarChar(255)            // bcrypt hash
  displayName     String?   @map("display_name") @db.VarChar(50)
  avatarUrl       String?   @map("avatar_url") @db.VarChar(500)
  bio             String?   @db.VarChar(200)

  role            UserRole  @default(USER)
  tier            UserTier  @default(FREE)
  tierExpiresAt   DateTime? @map("tier_expires_at")

  // Stats
  totalSearches   Int       @default(0) @map("total_searches")
  totalFavorites  Int       @default(0) @map("total_favorites")
  totalShares     Int       @default(0) @map("total_shares")

  // Referrals
  referralCode    String?   @unique @map("referral_code") @db.VarChar(12)
  referredBy      String?   @map("referred_by") @db.VarChar(12)
  referralCount   Int       @default(0) @map("referral_count")

  // Auth tracking
  lastLoginAt     DateTime? @map("last_login_at")
  lastLoginIp     String?   @map("last_login_ip") @db.VarChar(45)
  isActive        Boolean   @default(true) @map("is_active")

  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  favorites       Favorite[]
  searchHistory   SearchHistory[]
  payments        Payment[]
  subscriptions   Subscription[]
  achievements    UserAchievement[]
  sharedConfigs   SharedConfig[]
  votes           Vote[]
  comments        Comment[]
  tournamentEntries TournamentEntry[]
  notifications   Notification[]
  codesUsed       ActivationCode[] @relation("CodeUser")
  codesCreated    ActivationCode[] @relation("CodeCreator")
  guidesAuthored  Guide[]
  adminLogs       AdminLog[]

  @@map("users")
  @@index([email])
  @@index([username])
  @@index([tier])
  @@index([referralCode])
  @@index([createdAt])
}

// ──────────────────────────────────
// 2. DEVICE — Dispositivos con specs técnicos
// ──────────────────────────────────
model Device {
  id              String      @id @default(cuid())
  brand           String      @db.VarChar(50)           // Samsung, Apple, Xiaomi...
  model           String      @db.VarChar(100)          // Galaxy S24 Ultra
  slug            String      @unique @db.VarChar(150)  // samsung-galaxy-s24-ultra

  // Specs técnicos (determinan la sensibilidad)
  screenHz        Int         @map("screen_hz") @db.SmallInt       // 60, 90, 120, 144
  screenSize      Float       @map("screen_size")                   // Pulgadas: 6.1, 6.7
  ramGb           Int         @map("ram_gb") @db.SmallInt           // 2, 3, 4, 6, 8, 12, 16
  panelType       PanelType   @default(LCD) @map("panel_type")
  tier            DeviceTier  @default(MID)
  chipset         String?     @db.VarChar(100)                      // Snapdragon 8 Gen 3
  releaseYear     Int?        @map("release_year") @db.SmallInt

  // Media
  imageUrl        String?     @map("image_url") @db.VarChar(500)

  // Flags
  isPopular       Boolean     @default(false) @map("is_popular")    // Top 50 en FF LATAM
  isActive        Boolean     @default(true) @map("is_active")

  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")

  // Relations
  sensitivities   Sensitivity[]
  favorites       Favorite[]
  searchHistory   SearchHistory[]
  sharedConfigs   SharedConfig[]

  @@map("devices")
  @@unique([brand, model])
  @@index([brand])
  @@index([slug])
  @@index([tier])
  @@index([isPopular])
  @@index([screenHz])
}

// ──────────────────────────────────
// 3. SENSITIVITY — Sensibilidades calculadas
// ──────────────────────────────────
model Sensitivity {
  id              String            @id @default(cuid())
  deviceId        String            @map("device_id")
  style           SensitivityStyle

  // Valores principales (0-100)
  general         Int               @db.SmallInt
  redPoint        Int               @map("red_point") @db.SmallInt
  scope2x         Int               @map("scope_2x") @db.SmallInt
  scope4x         Int               @map("scope_4x") @db.SmallInt
  sniperScope     Int               @map("sniper_scope") @db.SmallInt
  freeView        Int               @map("free_view") @db.SmallInt

  // Giroscopio (Premium feature)
  gyroGeneral     Int?              @map("gyro_general") @db.SmallInt
  gyroRedPoint    Int?              @map("gyro_red_point") @db.SmallInt
  gyroScope2x     Int?              @map("gyro_scope_2x") @db.SmallInt
  gyroScope4x     Int?              @map("gyro_scope_4x") @db.SmallInt
  gyroSniper      Int?              @map("gyro_sniper") @db.SmallInt
  gyroFreeView    Int?              @map("gyro_free_view") @db.SmallInt

  createdAt       DateTime          @default(now()) @map("created_at")

  // Relations
  device          Device            @relation(fields: [deviceId], references: [id], onDelete: Cascade)

  @@map("sensitivities")
  @@unique([deviceId, style])
  @@index([deviceId])
  @@index([style])
}

// ──────────────────────────────────
// 4. FAVORITE — Configs guardadas por usuario
// ──────────────────────────────────
model Favorite {
  id              String            @id @default(cuid())
  userId          String            @map("user_id")
  deviceId        String            @map("device_id")
  style           SensitivityStyle
  nickname        String?           @db.VarChar(50)       // "Mi config favorita"

  createdAt       DateTime          @default(now()) @map("created_at")

  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  device          Device            @relation(fields: [deviceId], references: [id], onDelete: Cascade)

  @@map("favorites")
  @@unique([userId, deviceId, style])
  @@index([userId])
}

// ──────────────────────────────────
// 5. SEARCH HISTORY
// ──────────────────────────────────
model SearchHistory {
  id              String            @id @default(cuid())
  userId          String            @map("user_id")
  deviceId        String            @map("device_id")
  style           SensitivityStyle
  searchedAt      DateTime          @default(now()) @map("searched_at")

  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  device          Device            @relation(fields: [deviceId], references: [id], onDelete: Cascade)

  @@map("search_history")
  @@index([userId, searchedAt(sort: Desc)])
  @@index([deviceId])
}

// ──────────────────────────────────
// 6. ACTIVATION CODE
// ──────────────────────────────────
model ActivationCode {
  id              String      @id @default(cuid())
  code            String      @unique @db.VarChar(20)   // ARES-XXXX-XXXX-XXXX
  type            CodeType
  status          CodeStatus  @default(AVAILABLE)

  createdById     String      @map("created_by_id")
  usedById        String?     @map("used_by_id")
  usedAt          DateTime?   @map("used_at")
  expiresAt       DateTime?   @map("expires_at")

  createdAt       DateTime    @default(now()) @map("created_at")

  createdBy       User        @relation("CodeCreator", fields: [createdById], references: [id])
  usedBy          User?       @relation("CodeUser", fields: [usedById], references: [id])
  subscription    Subscription?

  @@map("activation_codes")
  @@index([code])
  @@index([status])
  @@index([type])
}

// ──────────────────────────────────
// 7. PAYMENT
// ──────────────────────────────────
model Payment {
  id              String          @id @default(cuid())
  userId          String          @map("user_id")
  externalId      String?         @map("external_id") @db.VarChar(255)
  provider        PaymentProvider
  amount          Int                                     // Centavos MXN
  currency        String          @default("MXN") @db.VarChar(3)
  status          PaymentStatus   @default(PENDING)
  codeType        CodeType?       @map("code_type")
  metadata        Json?

  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  user            User            @relation(fields: [userId], references: [id])
  subscription    Subscription?

  @@map("payments")
  @@index([userId])
  @@index([externalId])
  @@index([status])
  @@index([createdAt])
}

// ──────────────────────────────────
// 8. SUBSCRIPTION
// ──────────────────────────────────
model Subscription {
  id              String    @id @default(cuid())
  userId          String    @map("user_id")
  tier            UserTier
  startDate       DateTime  @map("start_date")
  endDate         DateTime  @map("end_date")
  isActive        Boolean   @default(true) @map("is_active")

  paymentId       String?   @unique @map("payment_id")
  codeId          String?   @unique @map("code_id")

  createdAt       DateTime  @default(now()) @map("created_at")

  user            User      @relation(fields: [userId], references: [id])
  payment         Payment?  @relation(fields: [paymentId], references: [id])
  code            ActivationCode? @relation(fields: [codeId], references: [id])

  @@map("subscriptions")
  @@index([userId])
  @@index([endDate])
  @@index([isActive])
}

// ──────────────────────────────────
// 9. GUIDE — Contenido de academia
// ──────────────────────────────────
model Guide {
  id              String        @id @default(cuid())
  title           String        @db.VarChar(200)
  slug            String        @unique @db.VarChar(200)
  description     String        @db.VarChar(500)
  category        GuideCategory
  content         String        @db.Text                  // Markdown content
  imageUrl        String?       @map("image_url") @db.VarChar(500)
  readTimeMin     Int           @default(5) @map("read_time_min") @db.SmallInt

  isPremium       Boolean       @default(false) @map("is_premium")
  isPublished     Boolean       @default(false) @map("is_published")
  viewCount       Int           @default(0) @map("view_count")

  authorId        String        @map("author_id")

  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  author          User          @relation(fields: [authorId], references: [id])
  sections        GuideSection[]
  comments        Comment[]

  @@map("guides")
  @@index([slug])
  @@index([category])
  @@index([isPublished])
  @@index([viewCount(sort: Desc)])
}

// ──────────────────────────────────
// 10. GUIDE SECTION
// ──────────────────────────────────
model GuideSection {
  id              String    @id @default(cuid())
  guideId         String    @map("guide_id")
  title           String    @db.VarChar(200)
  content         String    @db.Text
  orderIndex      Int       @map("order_index") @db.SmallInt
  isPremium       Boolean   @default(false) @map("is_premium")

  createdAt       DateTime  @default(now()) @map("created_at")

  guide           Guide     @relation(fields: [guideId], references: [id], onDelete: Cascade)

  @@map("guide_sections")
  @@index([guideId, orderIndex])
}

// ──────────────────────────────────
// 11. ACHIEVEMENT — Logros/badges
// ──────────────────────────────────
model Achievement {
  id              String    @id @default(cuid())
  key             String    @unique @db.VarChar(50)     // FIRST_SEARCH, 100_SEARCHES, etc.
  name            String    @db.VarChar(100)
  description     String    @db.VarChar(300)
  iconUrl         String?   @map("icon_url") @db.VarChar(500)
  category        String    @db.VarChar(50)             // search, social, premium, milestone
  points          Int       @default(10)
  requirement     Json                                   // { type: 'count', field: 'totalSearches', value: 1 }

  createdAt       DateTime  @default(now()) @map("created_at")

  users           UserAchievement[]

  @@map("achievements")
}

// ──────────────────────────────────
// 12. USER ACHIEVEMENT — Relación usuario-logro
// ──────────────────────────────────
model UserAchievement {
  id              String      @id @default(cuid())
  userId          String      @map("user_id")
  achievementId   String      @map("achievement_id")
  unlockedAt      DateTime    @default(now()) @map("unlocked_at")

  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement     Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)

  @@map("user_achievements")
  @@unique([userId, achievementId])
  @@index([userId])
}

// ──────────────────────────────────
// 13. TOURNAMENT
// ──────────────────────────────────
model Tournament {
  id                String            @id @default(cuid())
  title             String            @db.VarChar(200)
  description       String?           @db.Text
  status            TournamentStatus  @default(UPCOMING)
  startDate         DateTime          @map("start_date")
  endDate           DateTime          @map("end_date")
  prizeDescription  String?           @map("prize_description") @db.VarChar(500)
  maxParticipants   Int?              @map("max_participants")
  entryTier         UserTier          @default(FREE) @map("entry_tier")

  createdAt         DateTime          @default(now()) @map("created_at")

  entries           TournamentEntry[]

  @@map("tournaments")
  @@index([status])
  @@index([startDate])
}

// ──────────────────────────────────
// 14. TOURNAMENT ENTRY
// ──────────────────────────────────
model TournamentEntry {
  id              String      @id @default(cuid())
  tournamentId    String      @map("tournament_id")
  userId          String      @map("user_id")
  score           Int?        @default(0)
  rank            Int?        @db.SmallInt
  joinedAt        DateTime    @default(now()) @map("joined_at")

  tournament      Tournament  @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("tournament_entries")
  @@unique([tournamentId, userId])
  @@index([tournamentId, score(sort: Desc)])
}

// ──────────────────────────────────
// 15. SHARED CONFIG — Configs compartidas en comunidad
// ──────────────────────────────────
model SharedConfig {
  id              String            @id @default(cuid())
  userId          String            @map("user_id")
  deviceId        String            @map("device_id")
  style           SensitivityStyle
  title           String            @db.VarChar(100)
  description     String?           @db.VarChar(500)
  votes           Int               @default(0)
  isApproved      Boolean           @default(true) @map("is_approved")

  createdAt       DateTime          @default(now()) @map("created_at")

  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  device          Device            @relation(fields: [deviceId], references: [id], onDelete: Cascade)
  userVotes       Vote[]
  comments        Comment[]

  @@map("shared_configs")
  @@index([votes(sort: Desc)])
  @@index([deviceId])
  @@index([createdAt(sort: Desc)])
}

// ──────────────────────────────────
// 16. VOTE
// ──────────────────────────────────
model Vote {
  id              String      @id @default(cuid())
  userId          String      @map("user_id")
  sharedConfigId  String      @map("shared_config_id")
  value           Int         @db.SmallInt              // +1 or -1

  createdAt       DateTime    @default(now()) @map("created_at")

  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  sharedConfig    SharedConfig @relation(fields: [sharedConfigId], references: [id], onDelete: Cascade)

  @@map("votes")
  @@unique([userId, sharedConfigId])
}

// ──────────────────────────────────
// 17. COMMENT — En guías y configs
// ──────────────────────────────────
model Comment {
  id              String      @id @default(cuid())
  userId          String      @map("user_id")
  content         String      @db.VarChar(1000)

  // Polymorphic: puede estar en una guía O en un shared config
  guideId         String?     @map("guide_id")
  sharedConfigId  String?     @map("shared_config_id")

  // Self-relation para replies
  parentId        String?     @map("parent_id")

  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")

  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  guide           Guide?      @relation(fields: [guideId], references: [id], onDelete: Cascade)
  sharedConfig    SharedConfig? @relation(fields: [sharedConfigId], references: [id], onDelete: Cascade)
  parent          Comment?    @relation("CommentReplies", fields: [parentId], references: [id])
  replies         Comment[]   @relation("CommentReplies")

  @@map("comments")
  @@index([guideId, createdAt(sort: Desc)])
  @@index([sharedConfigId, createdAt(sort: Desc)])
  @@index([userId])
}

// ──────────────────────────────────
// 18. NOTIFICATION
// ──────────────────────────────────
model Notification {
  id              String    @id @default(cuid())
  userId          String    @map("user_id")
  type            String    @db.VarChar(50)             // achievement, subscription, tournament, guide
  title           String    @db.VarChar(200)
  message         String    @db.VarChar(500)
  link            String?   @db.VarChar(500)
  isRead          Boolean   @default(false) @map("is_read")

  createdAt       DateTime  @default(now()) @map("created_at")

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
  @@index([userId, isRead, createdAt(sort: Desc)])
}

// ──────────────────────────────────
// 19. ADMIN LOG — Registro de acciones admin
// ──────────────────────────────────
model AdminLog {
  id              String    @id @default(cuid())
  adminId         String    @map("admin_id")
  action          String    @db.VarChar(100)            // CREATE_CODE, BAN_USER, etc.
  target          String?   @db.VarChar(200)            // userId, codeId, etc.
  details         Json?
  ipAddress       String?   @map("ip_address") @db.VarChar(45)

  createdAt       DateTime  @default(now()) @map("created_at")

  admin           User      @relation(fields: [adminId], references: [id])

  @@map("admin_logs")
  @@index([adminId])
  @@index([action])
  @@index([createdAt(sort: Desc)])
}
```

---

## 🧠 MOTOR DE SENSIBILIDADES — DOCUMENTACIÓN COMPLETA

El motor de sensibilidades es el **CORE del negocio**. Es lo que nos diferencia
técnicamente de SystemWoods (que usa valores random/genéricos).

### Algoritmo paso a paso:

```
┌─────────────────────────────────────────────────────────────────┐
│                 SENSITIVITY CALCULATION PIPELINE                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INPUT: DeviceSpecs + SensitivityStyle                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ Step 1: BASE VALUES                                   │       │
│  │ general=50, redPoint=45, scope2x=40, scope4x=35,     │       │
│  │ sniperScope=30, freeView=55                           │       │
│  └───────────────────────┬──────────────────────────────┘       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ Step 2: HARDWARE MULTIPLIERS                          │       │
│  │                                                       │       │
│  │ hzFactor:                                             │       │
│  │   60Hz  → 1.00 (base)                                │       │
│  │   90Hz  → 1.08 (+8%)                                 │       │
│  │   120Hz → 1.15 (+15%)                                │       │
│  │   144Hz → 1.18 (+18%)                                │       │
│  │                                                       │       │
│  │ screenFactor:                                         │       │
│  │   <5.5"  → 0.95 (-5%)                               │       │
│  │   5.5-6" → 0.98 (-2%)                               │       │
│  │   6-6.5" → 1.00 (base)                              │       │
│  │   6.5-7" → 1.05 (+5%)                               │       │
│  │   >7"    → 1.08 (+8%)                               │       │
│  │                                                       │       │
│  │ ramFactor:                                            │       │
│  │   ≤2GB   → 0.85 (-15%)                              │       │
│  │   3GB    → 0.92 (-8%)                               │       │
│  │   4GB    → 0.97 (-3%)                               │       │
│  │   6GB    → 1.00 (base)                              │       │
│  │   8GB    → 1.05 (+5%)                               │       │
│  │   ≥12GB  → 1.08 (+8%)                               │       │
│  │                                                       │       │
│  │ panelFactor:                                          │       │
│  │   LCD    → 1.00 (base)                               │       │
│  │   IPS    → 1.02 (+2%)                               │       │
│  │   AMOLED → 1.05 (+5%)                               │       │
│  │   OLED   → 1.05 (+5%)                               │       │
│  │   LTPO   → 1.07 (+7%)                               │       │
│  │                                                       │       │
│  │ tierFactor:                                           │       │
│  │   LOW    → 0.85 (-15%)                              │       │
│  │   MID    → 1.00 (base)                              │       │
│  │   HIGH   → 1.10 (+10%)                              │       │
│  │   ULTRA  → 1.15 (+15%)                              │       │
│  │   GAMING → 1.18 (+18%)                              │       │
│  └───────────────────────┬──────────────────────────────┘       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ Step 3: COMBINED HARDWARE SCORE                       │       │
│  │                                                       │       │
│  │ For each sensitivity type:                            │       │
│  │   adjusted = base × hzF × screenF × ramF × panelF    │       │
│  │                    × tierF                            │       │
│  └───────────────────────┬──────────────────────────────┘       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ Step 4: STYLE MULTIPLIER                              │       │
│  │                                                       │       │
│  │ AGGRESSIVE:                                           │       │
│  │   general ×1.15  redPoint ×1.20  scope2x ×0.95      │       │
│  │   scope4x ×0.90  sniper ×0.85   freeView ×1.10      │       │
│  │                                                       │       │
│  │ BALANCED:                                             │       │
│  │   ALL ×1.00 (valores neutros optimizados)            │       │
│  │                                                       │       │
│  │ SNIPER:                                               │       │
│  │   general ×0.85  redPoint ×0.90  scope2x ×1.10      │       │
│  │   scope4x ×1.20  sniper ×1.30   freeView ×0.90      │       │
│  └───────────────────────┬──────────────────────────────┘       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ Step 5: CLAMP & ROUND                                 │       │
│  │                                                       │       │
│  │ final = Math.round(Math.max(1, Math.min(100, val)))  │       │
│  └───────────────────────┬──────────────────────────────┘       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ Step 6: GYROSCOPE (Premium only)                      │       │
│  │                                                       │       │
│  │ gyroBase = sensitivityValue × 0.50 (50% base)       │       │
│  │ gyroPanel = AMOLED/OLED? +5% : 0                     │       │
│  │ gyroGaming = GAMING tier? +8% : 0                     │       │
│  │ gyroFinal = clamp(gyroBase × (1+gyroPanel+gyroGaming))│       │
│  └───────────────────────┬──────────────────────────────┘       │
│                          ▼                                       │
│  OUTPUT: SensitivityResult                                      │
│  {                                                               │
│    general: 72, redPoint: 68, scope2x: 55,                     │
│    scope4x: 48, sniperScope: 42, freeView: 75,                 │
│    gyroscope?: { general: 38, redPoint: 35, ... }               │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

### Ejemplo de cálculo real:

```
Device: Samsung Galaxy S24 Ultra
Specs: 120Hz, 6.8", 12GB RAM, AMOLED, ULTRA tier
Style: AGGRESSIVE

Step 1 — Base: general=50
Step 2 — Hz: 50 × 1.15 = 57.5
Step 3 — Screen: 57.5 × 1.05 = 60.375 (6.8" → 6.5-7" range)
Step 4 — RAM: 60.375 × 1.08 = 65.205 (12GB → ≥12)
Step 5 — Panel: 65.205 × 1.05 = 68.465 (AMOLED)
Step 6 — Tier: 68.465 × 1.15 = 78.735 (ULTRA)
Step 7 — Style: 78.735 × 1.15 = 90.545 (AGGRESSIVE general)
Step 8 — Clamp: Math.round(90.545) = 91

→ general = 91 ✅
```

### Reglas del motor:
1. Todos los valores finales se clampean entre **1-100**
2. Valores de giroscopio son **~40-60%** de los valores normales
3. Cada dispositivo tiene exactamente **3 configuraciones** (una por estilo)
4. El seed genera las **1,500+** sensibilidades automáticamente
5. Cálculos son **determinísticos**: mismo input = mismo output SIEMPRE
6. Si un dispositivo no tiene todos los specs, se usan valores por defecto de su tier

---

## 💰 MODELO DE MONETIZACIÓN COMPLETO

### Tabla de tiers y features:

```
┌──────────────────────┬─────────────┬─────────────┬─────────────┐
│ Feature              │    FREE     │   PREMIUM   │     VIP     │
├──────────────────────┼─────────────┼─────────────┼─────────────┤
│ Marcas disponibles   │ 3 (Samsung, │ TODAS (36+) │ TODAS (36+) │
│                      │ iPhone,     │             │             │
│                      │ Redmi)      │             │             │
├──────────────────────┼─────────────┼─────────────┼─────────────┤
│ Búsquedas por día    │ 5           │ Ilimitadas  │ Ilimitadas  │
├──────────────────────┼─────────────┼─────────────┼─────────────┤
│ Estilos de juego     │ 1 (Balanc.) │ 3 (todos)   │ 3 (todos)   │
├──────────────────────┼─────────────┼─────────────┼─────────────┤
│ Giroscopio           │     ❌      │     ✅      │     ✅      │
├──────────────────────┼─────────────┼─────────────┼─────────────┤
│ Favoritos            │ 3 máximo    │ Ilimitados  │ Ilimitados  │
├──────────────────────┼─────────────┼─────────────┼─────────────┤
│ Comparador           │     ❌      │     ✅      │     ✅      │
├──────────────────────┼─────────────┼─────────────┼─────────────┤
│ Exportar config      │     ❌      │     ✅      │     ✅      │
├──────────────────────┼─────────────┼─────────────┼─────────────┤
│ Historial            │ 10 últimas  │ Completo    │ Completo    │
├──────────────────────┼─────────────┼─────────────┼─────────────┤
│ Academia             │ 5 guías     │ 15 guías    │ TODAS (20+) │
├──────────────────────┼─────────────┼─────────────┼─────────────┤
│ Sin publicidad       │     ❌      │     ❌      │     ✅      │
├──────────────────────┼─────────────┼─────────────┼─────────────┤
│ Torneos exclusivos   │     ❌      │     ❌      │     ✅      │
├──────────────────────┼─────────────┼─────────────┼─────────────┤
│ Temas VIP            │     ❌      │     ❌      │     ✅      │
├──────────────────────┼─────────────┼─────────────┼─────────────┤
│ Badge especial       │     —       │     ⭐      │     👑      │
├──────────────────────┼─────────────┼─────────────┼─────────────┤
│ Soporte prioritario  │     ❌      │     ❌      │     ✅      │
├──────────────────────┼─────────────┼─────────────┼─────────────┤
│ Precio mensual       │    $0       │  $49 MXN    │  $99 MXN    │
│ Precio anual         │    $0       │  $399 MXN   │  $799 MXN   │
└──────────────────────┴─────────────┴─────────────┴─────────────┘
```

### Códigos de activación:

```
┌──────────────┬────────────┬──────────────┬────────────────────────┐
│ Tipo         │ Duración   │ Precio venta │ Formato código         │
├──────────────┼────────────┼──────────────┼────────────────────────┤
│ PREMIUM_30   │ 30 días    │ $49 MXN      │ ARES-XXXX-XXXX-XXXX   │
│ PREMIUM_90   │ 90 días    │ $129 MXN     │ ARES-XXXX-XXXX-XXXX   │
│ PREMIUM_365  │ 365 días   │ $399 MXN     │ ARES-XXXX-XXXX-XXXX   │
│ VIP_30       │ 30 días    │ $99 MXN      │ ARES-XXXX-XXXX-XXXX   │
│ VIP_90       │ 90 días    │ $249 MXN     │ ARES-XXXX-XXXX-XXXX   │
│ VIP_365      │ 365 días   │ $799 MXN     │ ARES-XXXX-XXXX-XXXX   │
└──────────────┴────────────┴──────────────┴────────────────────────┘

Formato: ARES-[4 alfanum]-[4 alfanum]-[4 alfanum]
Ejemplo: ARES-K7M2-P9X4-R3N8
Caracteres: A-Z, 0-9 (sin O/0/I/1 para evitar confusión)
```

---

## 🧭 MAPA COMPLETO DE SCRIPTS (68 total)

```
┌───────────────────────────────────────────────────────────────────────────┐
│                          ARES — ROADMAP DE 68 SCRIPTS                     │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  FASE 0 — FUNDACIÓN (8 scripts)                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ 001 ARES-000-genesis              005 ARES-004-design-system       │  │
│  │ 002 ARES-001-database-foundation  006 ARES-005-infra-docker        │  │
│  │ 003 ARES-002-shared-libraries     007 ARES-006-testing-framework   │  │
│  │ 004 ARES-003-auth-system          008 ARES-007-security-base       │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  FASE 1 — MOTOR DE SENSIBILIDADES (10 scripts)                           │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ 009 ARES-100-device-database      014 ARES-105-device-comparison   │  │
│  │ 010 ARES-101-sensitivity-algo     015 ARES-106-config-export       │  │
│  │ 011 ARES-102-gyroscope-engine     016 ARES-107-share-system        │  │
│  │ 012 ARES-103-style-system         017 ARES-108-favorites-system    │  │
│  │ 013 ARES-104-device-specs-analyzer018 ARES-109-search-history      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  FASE 2 — UI/UX ELITE GAMING (8 scripts)                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ 019 ARES-200-landing-page         023 ARES-204-device-pages        │  │
│  │ 020 ARES-201-generator-ui         024 ARES-205-responsive-mobile   │  │
│  │ 021 ARES-202-results-display      025 ARES-206-animations-effects  │  │
│  │ 022 ARES-203-device-selector      026 ARES-207-theme-variants      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  FASE 3 — ACADEMIA PRO (6 scripts)                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ 027 ARES-300-academy-foundation   030 ARES-303-tips-engine         │  │
│  │ 028 ARES-301-guides-system        031 ARES-304-meta-analysis       │  │
│  │ 029 ARES-302-video-integration    032 ARES-305-seo-content         │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  FASE 4 — MONETIZACIÓN (8 scripts)                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ 033 ARES-400-tier-system          037 ARES-404-subscription-mgmt   │  │
│  │ 034 ARES-401-mercadopago          038 ARES-405-referral-system     │  │
│  │ 035 ARES-402-stripe               039 ARES-406-premium-gate        │  │
│  │ 036 ARES-403-activation-codes     040 ARES-407-revenue-analytics   │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  FASE 5 — COMUNIDAD Y SOCIAL (8 scripts)                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ 041 ARES-500-user-profiles        045 ARES-504-config-sharing      │  │
│  │ 042 ARES-501-leaderboard          046 ARES-505-achievements        │  │
│  │ 043 ARES-502-tournament-system    047 ARES-506-notifications       │  │
│  │ 044 ARES-503-comments-reviews     048 ARES-507-social-integration  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  FASE 6 — ADMIN Y ANALYTICS (6 scripts)                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ 049 ARES-600-admin-dashboard      052 ARES-603-analytics-dashboard │  │
│  │ 050 ARES-601-user-management      053 ARES-604-support-system      │  │
│  │ 051 ARES-602-content-management   054 ARES-605-ab-testing          │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  FASE 7 — MOBILE Y PWA (5 scripts)                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ 055 ARES-700-pwa-setup            058 ARES-703-capacitor-apk       │  │
│  │ 056 ARES-701-push-notifications   059 ARES-704-performance-optim   │  │
│  │ 057 ARES-702-offline-mode                                          │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  FASE 8 — SEO, GROWTH, TESTING Y DEPLOY (9 scripts)                     │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ 060 ARES-800-seo-engine           065 ARES-805-integration-tests   │  │
│  │ 061 ARES-801-sitemap-schema       066 ARES-806-e2e-tests           │  │
│  │ 062 ARES-802-social-meta          067 ARES-807-deploy-staging      │  │
│  │ 063 ARES-803-growth-automation    068 ARES-808-deploy-production 🏁│  │
│  │ 064 ARES-804-unit-tests                                            │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  Detalle de cada script: docs/MASTER-PLAN-[A-I].md                       │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 📏 ESTÁNDARES DE CÓDIGO

### Naming conventions:

```typescript
// ── Archivos: kebab-case ──────────────────────────────
sensitivity-engine.ts
brand-selector.tsx
use-device-search.ts
generator.store.ts
auth.config.ts

// ── Componentes React: PascalCase ─────────────────────
export function BrandSelector() { }
export function SensitivityDisplay() { }
export function PremiumLock({ feature }: { feature: string }) { }

// ── Variables y funciones: camelCase ──────────────────
const deviceSpecs = getDeviceSpecs(deviceId);
async function calculateSensitivity() { }
const isLoggedIn = session !== null;
const canAccessGyro = tier !== 'FREE';

// ── Constantes: SCREAMING_SNAKE_CASE ─────────────────
const MAX_FREE_SEARCHES = 5;
const MAX_FREE_FAVORITES = 3;
const PREMIUM_PRICE_MXN = 4900;     // $49.00 en centavos
const VIP_PRICE_MXN = 9900;         // $99.00 en centavos
const SENSITIVITY_MIN = 1;
const SENSITIVITY_MAX = 100;
const CODE_LENGTH = 12;
const CODE_PREFIX = 'ARES';

// ── Enums: PascalCase ────────────────────────────────
enum SensitivityStyle { AGGRESSIVE, BALANCED, SNIPER }
enum UserTier { FREE, PREMIUM, VIP }

// ── API routes: kebab-case ───────────────────────────
/api/sensitivity/generate
/api/devices/brands
/api/codes/activate
/api/payments/webhook/mp

// ── CSS classes: BEM-ish con Tailwind ─────────────────
// Preferir Tailwind. Custom classes solo para animaciones
// o estilos muy específicos del tema gaming.
```

### Git commits:
```
feat(generator): ARES-101 sensitivity algorithm — hardware-based calculation engine
feat(ui): ARES-200 landing page — hero section with particle effects
feat(payment): ARES-401 MercadoPago integration — checkout + webhooks
fix(algorithm): ARES-102 fix gyroscope values for low-end devices
test(e2e): ARES-806 full user journey test
docs: ARES-800 SEO engine — sitemap, schema.org
chore: update dependencies
```

---

## 🔑 VARIABLES DE ENTORNO

```bash
# ═══════════════════════════════════════════════════════════
# ARES — Variables de Entorno
# Copiar a .env.local y llenar con valores reales
# ═══════════════════════════════════════════════════════════

# ── Database ──────────────────────────────────────────────
DATABASE_URL="postgresql://ares:ares@localhost:5432/ares_dev"
REDIS_URL="redis://localhost:6379"

# ── Auth ──────────────────────────────────────────────────
NEXTAUTH_SECRET="tu-secret-super-seguro-aqui-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# ── Payments: MercadoPago ─────────────────────────────────
MP_PUBLIC_KEY="TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
MP_ACCESS_TOKEN="TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# ── Payments: Stripe ──────────────────────────────────────
STRIPE_PUBLIC_KEY="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# ── Email ─────────────────────────────────────────────────
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="ARES SensiPRO <noreply@sensibilidadespro.com>"

# ── App ───────────────────────────────────────────────────
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Sensibilidades PRO"
NEXT_PUBLIC_APP_DESCRIPTION="Generador de Sensibilidades #1 para Free Fire"

# ── SEO ───────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL="https://sensibilidadespro.com"
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# ── Rate Limiting ─────────────────────────────────────────
RATE_LIMIT_FREE=5              # búsquedas/día tier FREE
RATE_LIMIT_PREMIUM=9999        # prácticamente ilimitado
RATE_LIMIT_WINDOW=86400        # 24 horas en segundos

# ── Feature Flags ─────────────────────────────────────────
ENABLE_STRIPE=false            # true cuando tengamos cuenta
ENABLE_PUSH_NOTIFICATIONS=false
ENABLE_ANALYTICS=false         # true en producción
```

---

## 🚀 COMANDOS ESENCIALES

```bash
# ── Desarrollo ────────────────────────────────────────────
npm run dev                    # Next.js dev server (localhost:3000)
npm run dev:db                 # Levantar PostgreSQL + Redis (Docker)

# ── Base de datos ─────────────────────────────────────────
npm run db:migrate             # Ejecutar migrations pendientes
npm run db:seed                # Sembrar 500+ devices + sensibilidades + guías
npm run db:studio              # Abrir Prisma Studio (GUI para la DB)
npm run db:reset               # ⚠️ Reset COMPLETO (dev only)
npm run db:generate            # Regenerar Prisma Client

# ── Testing ───────────────────────────────────────────────
npm run test                   # Tests unitarios (Vitest)
npm run test:watch             # Tests en modo watch
npm run test:e2e               # Tests E2E (Playwright)
npm run test:coverage          # Reporte de cobertura

# ── Build & Quality ───────────────────────────────────────
npm run build                  # Build de producción
npm run lint                   # ESLint check
npm run lint:fix               # ESLint auto-fix
npm run typecheck              # tsc --noEmit (verificar tipos)
npm run format                 # Prettier format

# ── Docker ────────────────────────────────────────────────
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d
docker compose -f infrastructure/docker/docker-compose.dev.yml down

# ── Autopilot ─────────────────────────────────────────────
./autopilot.sh                 # Modo interactivo
./autopilot.sh --auto          # Modo autónomo (construye solo)
./autopilot.sh --auto --notify # Autónomo + notificaciones Telegram
./autopilot.sh --status        # Ver progreso actual
./autopilot.sh --resume        # Retomar desde último fallo
```

---

## ⚠️ CHECKLIST ANTES DE CADA COMMIT

Después de completar cada script, Claude Code **DEBE** ejecutar TODOS estos pasos:

```bash
# 1. ✅ TypeScript compila sin errores
npx tsc --noEmit

# 2. ✅ No hay 'any' en el código
grep -r ": any\b" src/ packages/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".test." | grep -v ".d.ts"
# Resultado esperado: 0 líneas

# 3. ✅ No hay console.log en código de producción
grep -r "console\.\(log\|warn\|error\|debug\)" src/ packages/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".test." | grep -v "__tests__"
# Resultado esperado: 0 líneas

# 4. ✅ Tests pasan (si existen para este script)
npx vitest run

# 5. ✅ Actualizar PROGRESS.md
# Cambiar ⬜ → ✅ para el script completado
# Llenar: Fecha, LOC, Archivos, Tests

# 6. ✅ Git commit con formato correcto
git add -A
git commit -m "feat(scope): ARES-XXX description"

# 7. ✅ Git push
git push origin main
```

---

## 🧠 CONTEXTO PARA CLAUDE CODE

Cuando ejecutes un script, sigue EXACTAMENTE esta secuencia:

```
1. LEE este archivo (CLAUDE.md) ──────────────── Entender arquitectura y reglas
        │
        ▼
2. LEE PROGRESS.md ────────────────────────────── Saber qué script toca
        │
        ▼
3. LEE docs/MASTER-PLAN-X.md ─────────────────── Instrucciones exactas del script
        │                                          (X = letra de la fase)
        ▼
4. CREA TODOS los archivos del script ─────────── No dejar NINGUNO pendiente
        │
        ▼
5. SIGUE las convenciones de CLAUDE.md ────────── TypeScript strict, Zod, etc.
        │
        ▼
6. ESCRIBE tests (mín. 3-5 por feature) ──────── Vitest para units
        │
        ▼
7. EJECUTA la checklist de validación ─────────── tsc, grep any, grep console.log
        │
        ▼
8. ACTUALIZA PROGRESS.md ──────────────────────── Marcar ✅ con fecha, LOC, archivos
        │
        ▼
9. GIT COMMIT + PUSH ─────────────────────────── Con mensaje descriptivo
```

### Si un archivo de dependencia no existe aún:

Porque es de un script futuro, créalo como **implementación completa con
la interfaz correcta** y marca con comentario de referencia:

```typescript
// Full implementation in ARES-XXX (nombre del script futuro)
// This is a working stub with correct interfaces

export class FeatureService {
  async doSomething(input: FeatureInput): Promise<FeatureResult> {
    // Implementación básica funcional
    return { success: true, data: defaultValue };
  }
}
```

**NUNCA** dejar `throw new Error('Not implemented')` ni `// TODO`.

---

## 🎯 ARES — Sensibilidades PRO
## Construido con 🇲🇽 desde Cancún, México
## Por Alex García | 2026
##
## "Donde SystemWoods ve jugadores, ARES ve un imperio" 🔥👑
