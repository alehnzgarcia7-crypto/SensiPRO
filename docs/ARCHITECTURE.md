# ARES SensiPRO — System Architecture
# ══════════════════════════════════════════════════════════════
# Documentación técnica de arquitectura, componentes,
# flujos de datos, modelos y decisiones de diseño
# ══════════════════════════════════════════════════════════════

---

## 1. Visión General

ARES SensiPRO es una plataforma web gaming que genera configuraciones de sensibilidad óptimas para Free Fire basadas en hardware real del dispositivo del usuario. La plataforma combina un motor de cálculo algorítmico, una academia de contenido educativo, un sistema de monetización con 3 tiers, y una comunidad de jugadores.

### Principios Arquitectónicos

1. **Server-first**: Server Components por defecto, Client Components solo para interactividad
2. **Type-safe end-to-end**: TypeScript strict + Prisma + Zod — sin `any` jamás
3. **Tier-gated**: Cada feature está controlada por el sistema de tiers (FREE/PREMIUM/VIP)
4. **México-first**: Precios en MXN, MercadoPago como pasarela principal, contenido en español
5. **Mobile-first**: 85%+ del tráfico viene de celulares — todo se diseña mobile-first
6. **SEO-driven**: Cada página de dispositivo y guía es una landing page indexable

---

## 2. Arquitectura de Alto Nivel

```
                    ┌──────────────────────────────────┐
                    │          CLOUDFLARE CDN           │
                    │     sensibilidadespro.com         │
                    │   DDoS protection + SSL + Cache   │
                    └───────────────┬──────────────────┘
                                    │
                    ┌───────────────▼──────────────────┐
                    │          VERCEL EDGE              │
                    │       Next.js 14 (SSR)            │
                    │                                   │
                    │  ┌─────────────────────────────┐  │
                    │  │       MIDDLEWARE             │  │
                    │  │  • Auth verification         │  │
                    │  │  • Rate limiting (Redis)     │  │
                    │  │  • Geolocation (MX bias)     │  │
                    │  │  • A/B test assignment       │  │
                    │  └─────────────────────────────┘  │
                    │                                   │
                    │  ┌──────────┐  ┌──────────────┐   │
                    │  │  Server  │  │   Client     │   │
                    │  │  Comps   │  │   Comps      │   │
                    │  │  (SSR)   │  │   (Hydrate)  │   │
                    │  └────┬─────┘  └──────┬───────┘   │
                    │       │               │           │
                    │  ┌────▼───────────────▼────────┐  │
                    │  │       API ROUTES            │  │
                    │  │  42 endpoints across 9 fases │  │
                    │  └────┬──────────────┬────────┘  │
                    └───────┼──────────────┼───────────┘
                            │              │
               ┌────────────▼──┐    ┌──────▼───────────┐
               │  POSTGRESQL   │    │   UPSTASH REDIS  │
               │  (Supabase)   │    │                  │
               │               │    │  • Session cache │
               │  19 modelos   │    │  • Rate limits   │
               │  12 enums     │    │  • Feature flags │
               │  500+ devices │    │  • Leaderboard   │
               │  45+ índices  │    │                  │
               └───────┬───────┘    └──────────────────┘
                       │
          ┌────────────┼────────────────┐
          │            │                │
 ┌────────▼─────┐ ┌───▼──────────┐ ┌───▼────────┐
 │ MERCADOPAGO  │ │   STRIPE     │ │  RESEND    │
 │              │ │              │ │            │
 │ Pagos MX    │ │ Pagos INTL   │ │ Emails     │
 │ OXXO/SPEI   │ │ Cards        │ │ Welcome    │
 │ Transferen. │ │ Subscript.   │ │ Activation │
 │ $49/$99 MXN │ │              │ │ Expiration │
 └──────────────┘ └──────────────┘ └────────────┘
```

---

## 3. Stack Tecnológico

### Core
| Capa | Tecnología | Versión | Justificación |
|------|-----------|---------|---------------|
| Runtime | Node.js | 20 LTS | Estabilidad + performance |
| Lenguaje | TypeScript | 5.4+ strict | Type safety no negociable |
| Framework | Next.js | 14 App Router | SSR + SEO + API + Edge |
| ORM | Prisma | 5 | Type-safe queries, migrations |
| Base de datos | PostgreSQL | 16 | JSONB, extensible, confiable |
| Cache | Redis (Upstash) | 7 | Rate limits, cache, sessions |

### Frontend
| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Styling | Tailwind CSS 3.4 | Utility-first + gaming theme custom |
| Animaciones | Framer Motion 11 | 60fps gaming animations |
| State | Zustand 4 | Ligero, simple, performante |
| UI Primitives | Radix UI | Accesibilidad + headless |
| Charts | Recharts | Admin analytics dashboards |
| Icons | Lucide React | Sistema de iconos consistente |
| Images | next/image + Sharp | Optimización automática |

### Backend
| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Auth | NextAuth.js v5 | OAuth + JWT + session |
| Validation | Zod | Runtime validation + type inference |
| Pagos MX | MercadoPago SDK | OXXO, SPEI, tarjetas MX |
| Pagos INTL | Stripe | Tarjetas internacionales |
| Email | Resend | Transactional emails moderno |
| PWA | next-pwa | App-like en móvil |

### Infrastructure
| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Hosting | Vercel | Zero-config, edge, CDN |
| DB Hosting | Supabase / Neon | PostgreSQL managed |
| Redis | Upstash | Serverless Redis |
| CDN/DNS | Cloudflare | DDoS + SSL + cache |
| CI/CD | GitHub Actions | Automated pipeline |
| Monitoring | Vercel Analytics + Sentry | Métricas + error tracking |
| Testing | Vitest + Playwright | Unit + E2E |

---

## 4. Estructura del Proyecto

```
ares-sensipro/
├── src/
│   ├── app/                         ← Next.js App Router
│   │   ├── (main)/                  ← Layout principal con navbar/footer
│   │   │   ├── page.tsx             ← Landing page (hero + generador)
│   │   │   ├── generate/            ← Generador de sensibilidad
│   │   │   ├── devices/             ← Catálogo de 500+ dispositivos
│   │   │   │   └── [brand]/[model]/ ← SEO landing por dispositivo
│   │   │   ├── academy/             ← Academia PRO (guías, tips, meta, videos)
│   │   │   ├── community/           ← Hub de comunidad
│   │   │   ├── pricing/             ← Página de precios
│   │   │   └── share/[id]/          ← Config compartida pública
│   │   ├── admin/                   ← Panel admin (role ADMIN)
│   │   │   ├── users/
│   │   │   ├── devices/
│   │   │   ├── content/
│   │   │   ├── analytics/
│   │   │   ├── revenue/
│   │   │   └── support/
│   │   └── api/                     ← 42 API Routes
│   │
│   ├── components/                  ← React Components
│   │   ├── ui/                      ← Design system base (gaming-themed)
│   │   ├── generator/               ← Componentes del generador
│   │   ├── academy/                 ← Componentes de academia
│   │   ├── community/               ← Componentes de comunidad
│   │   ├── payments/                ← Componentes de pago
│   │   ├── admin/                   ← Componentes de admin
│   │   ├── layout/                  ← Navbar, footer, mobile nav
│   │   ├── effects/                 ← Particles, confetti, glow
│   │   ├── seo/                     ← JSON-LD, breadcrumbs
│   │   └── providers.tsx            ← Context providers wrapper
│   │
│   ├── lib/                         ← Lógica de negocio
│   │   ├── algorithms/              ← Motor de sensibilidad
│   │   ├── academy/                 ← Queries y config de academia
│   │   ├── auth/                    ← NextAuth config + middleware
│   │   ├── payments/                ← MercadoPago + Stripe + codes
│   │   ├── tiers/                   ← Feature gates por tier
│   │   ├── seo/                     ← Structured data + meta helpers
│   │   ├── security/                ← Rate limiter, sanitize, CSRF
│   │   ├── analytics/               ← Event tracking + reports
│   │   ├── ab-testing/              ← A/B test framework
│   │   └── utils.ts                 ← Utilities (cn, formatters)
│   │
│   ├── hooks/                       ← Custom React hooks
│   │   ├── use-device-search.ts     ← Debounced search + cache
│   │   ├── use-sensitivity.ts       ← Generate + display
│   │   ├── use-favorites.ts         ← Toggle + check + list
│   │   ├── use-tier.ts              ← Feature access check
│   │   └── use-toast.ts             ← Toast notifications
│   │
│   ├── store/                       ← Zustand stores
│   │   ├── generator.store.ts       ← Brand/model/style/results
│   │   ├── user.store.ts            ← Session, tier, prefs
│   │   └── ui.store.ts              ← Nav, modals, toasts
│   │
│   └── styles/
│       ├── animations.css           ← @keyframes gaming
│       └── gaming-theme.css         ← CSS variables del tema
│
├── prisma/
│   ├── schema.prisma                ← 19 modelos + 12 enums
│   ├── migrations/                  ← Historial de migraciones
│   └── seeds/                       ← Seed data (devices, guides, tips)
│
├── public/
│   ├── images/                      ← Brands, devices, badges, heroes
│   ├── icons/                       ← Favicon, PWA icons
│   ├── manifest.json                ← PWA manifest
│   └── robots.txt
│
├── tests/
│   ├── unit/                        ← Vitest
│   ├── integration/                 ← API tests
│   ├── e2e/                         ← Playwright
│   └── factories/                   ← Test data factories
│
├── infrastructure/
│   └── docker/
│       └── docker-compose.dev.yml   ← PostgreSQL 16 + Redis 7
│
└── docs/
    ├── API.md                       ← Referencia de 42 endpoints
    └── ARCHITECTURE.md              ← Este documento
```

---

## 5. Modelo de Datos

### Diagrama Entidad-Relación

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    User      │────<│   Sensitivity    │>────│     Device      │
│             │     │                  │     │                 │
│ id          │     │ id               │     │ id              │
│ email       │     │ userId           │     │ brand           │
│ username    │     │ deviceId         │     │ model           │
│ tier        │     │ style            │     │ slug            │
│ role        │     │ general          │     │ screenSize      │
│ xp          │     │ redDot           │     │ refreshRate     │
│ level       │     │ scope2x/4x       │     │ panelType       │
│ reputation  │     │ sniperScope      │     │ ram             │
└──────┬──────┘     │ freeView         │     │ processor       │
       │            │ gyroscope*       │     │ processorTier   │
       │            └──────────────────┘     │ ppi             │
       │                                      └─────────────────┘
       │
       ├────<┌──────────────────┐
       │     │    Favorite      │
       │     │ userId           │
       │     │ sensitivityId    │
       │     └──────────────────┘
       │
       ├────<┌──────────────────┐
       │     │  SearchHistory   │
       │     │ userId           │
       │     │ deviceId         │
       │     │ style            │
       │     └──────────────────┘
       │
       ├────<┌──────────────────┐     ┌──────────────────┐
       │     │    Guide         │────<│  GuideSection    │
       │     │ authorId         │     │ guideId          │
       │     │ title, slug      │     │ title            │
       │     │ category         │     │ content          │
       │     │ isPremium        │     │ isPremium        │
       │     │ viewCount        │     │ orderIndex       │
       │     └────────┬─────────┘     └──────────────────┘
       │              │
       │              ├────<┌──────────────────┐
       │              │     │    Comment       │
       │     ┌────────┘     │ userId           │
       │     │              │ guideId          │
       │     │              │ content          │
       │     │              └──────────────────┘
       │     │
       ├────<┌──────────────────┐
       │     │  SharedConfig    │────<┌──────────────┐
       │     │ userId           │     │    Vote      │
       │     │ sensitivityId    │     │ userId       │
       │     │ title            │     │ configId     │
       │     │ upvotes/downvotes│     │ value (+1/-1)│
       │     └──────────────────┘     └──────────────┘
       │
       ├────<┌──────────────────┐
       │     │   Subscription   │
       │     │ userId           │
       │     │ tier             │
       │     │ provider         │
       │     │ expiresAt        │
       │     └──────────────────┘
       │
       ├────<┌──────────────────┐
       │     │    Payment       │
       │     │ userId           │
       │     │ amount (MXN)     │
       │     │ provider         │
       │     │ status           │
       │     └──────────────────┘
       │
       ├────<┌──────────────────┐
       │     │ UserAchievement  │>────┌──────────────────┐
       │     │ userId           │     │   Achievement    │
       │     │ achievementId    │     │ key              │
       │     │ unlockedAt       │     │ name             │
       │     └──────────────────┘     │ xpReward         │
       │                              └──────────────────┘
       │
       ├────<┌──────────────────┐
       │     │  Notification    │
       │     │ userId           │
       │     │ type             │
       │     │ message          │
       │     │ isRead           │
       │     └──────────────────┘
       │
       └────<┌──────────────────┐>────┌──────────────────┐
             │ TournamentEntry  │     │   Tournament     │
             │ userId           │     │ name             │
             │ tournamentId     │     │ status           │
             └──────────────────┘     │ maxParticipants  │
                                      └──────────────────┘

Modelos independientes:
┌──────────────────┐     ┌──────────────────┐
│ ActivationCode   │     │    AdminLog      │
│ code             │     │ adminId          │
│ tier             │     │ action           │
│ status           │     │ target           │
│ redeemedBy       │     │ details          │
└──────────────────┘     └──────────────────┘

┌──────────────────┐
│      Tip         │
│ title            │
│ content          │
│ category         │
│ difficulty       │
│ isPublished      │
└──────────────────┘
```

### Enums (12)

| Enum | Valores | Uso |
|------|---------|-----|
| `UserTier` | FREE, PREMIUM, VIP | Control de acceso a features |
| `UserRole` | USER, ADMIN | Permisos de admin |
| `SensitivityStyle` | AGGRESSIVE, BALANCED, SNIPER | Estilo de juego |
| `PanelType` | LCD, IPS, AMOLED, OLED, LTPO | Tipo de pantalla |
| `DeviceTier` | LOW, MID, HIGH, FLAGSHIP | Categoría de hardware |
| `PaymentStatus` | PENDING, COMPLETED, FAILED, REFUNDED | Estado de pago |
| `PaymentProvider` | MERCADOPAGO, STRIPE, ACTIVATION_CODE | Fuente de pago |
| `CodeStatus` | ACTIVE, REDEEMED, EXPIRED, REVOKED | Estado de código |
| `CodeType` | PREMIUM_30D, VIP_30D, PREMIUM_90D, VIP_90D, PREMIUM_365D, VIP_365D | Tipo de código |
| `GuideCategory` | SENSITIVITY, MOVEMENT, AIM, STRATEGY, DEVICE, META | Categoría de guía |
| `TournamentStatus` | UPCOMING, OPEN, IN_PROGRESS, COMPLETED, CANCELLED | Estado de torneo |
| `Difficulty` | BEGINNER, INTERMEDIATE, ADVANCED | Nivel de dificultad |

---

## 6. Flujos de Datos Críticos

### 6.1 Generación de Sensibilidad (Flujo Principal)

```
  Usuario                    Next.js                 @ares/algorithms         PostgreSQL + Redis
    │                          │                          │                        │
    │  1. Selecciona marca     │                          │                        │
    │ ────────────────────▶    │                          │                        │
    │                          │  GET /api/devices?brand  │                        │
    │                          │ ─────────────────────────────────────────────▶    │
    │  ◀── Lista de modelos    │  ◀── Device[]            │                        │
    │                          │                          │                        │
    │  2. Selecciona modelo    │                          │                        │
    │ ────────────────────▶    │                          │                        │
    │  3. Selecciona estilo    │                          │                        │
    │ ────────────────────▶    │                          │                        │
    │                          │                          │                        │
    │                          │  4. Rate limit check     │                        │
    │                          │ ─────────────────────────────────────────────▶    │
    │                          │  ◀── {count: 3, limit: 5} (Redis)                │
    │                          │                          │                        │
    │                          │  POST /api/generate      │                        │
    │                          │  {deviceId, style}       │                        │
    │                          │ ──────────────────▶      │                        │
    │                          │                          │  5. Get device specs   │
    │                          │                          │ ──────────────────▶    │
    │                          │                          │  ◀── DeviceSpecs       │
    │                          │                          │                        │
    │                          │                          │  6. Calculate:         │
    │                          │                          │     hzFactor           │
    │                          │                          │     screenFactor       │
    │                          │                          │     ramFactor          │
    │                          │                          │     panelFactor        │
    │                          │                          │     processorTier      │
    │                          │                          │     styleMultiplier    │
    │                          │                          │     clamp(1, 100)      │
    │                          │                          │                        │
    │                          │                          │  7. If PREMIUM:        │
    │                          │                          │     calc gyroscope     │
    │                          │                          │                        │
    │                          │  ◀── SensitivityResult   │                        │
    │                          │                          │                        │
    │                          │  8. Save to history      │                        │
    │                          │ ─────────────────────────────────────────────▶    │
    │                          │  9. Increment rate count │                        │
    │                          │ ─────────────────────────────────────────────▶    │
    │                          │                          │                (Redis) │
    │  ◀── Animated result     │                          │                        │
    │   🎯 General: 72        │                          │                        │
    │   🔴 Red Dot: 68        │                          │                        │
    │   🔭 Scope 2x: 55       │                          │                        │
    │   🔭 Scope 4x: 48       │                          │                        │
    │   🎯 Sniper: 42         │                          │                        │
    │   👁️ Free View: 75      │                          │                        │
```

### 6.2 Flujo de Pago (MercadoPago)

```
  Usuario              Next.js              MercadoPago           PostgreSQL
    │                    │                      │                     │
    │  Click "Premium"   │                      │                     │
    │ ──────────────▶    │                      │                     │
    │                    │  1. Create Payment   │                     │
    │                    │     record (PENDING) ──────────────────▶   │
    │                    │                      │                     │
    │                    │  2. Create           │                     │
    │                    │     Preference ──▶   │                     │
    │                    │  ◀── checkout_url    │                     │
    │                    │                      │                     │
    │  ◀── Redirect      │                      │                     │
    │     to checkout    │                      │                     │
    │                    │                      │                     │
    │  3. User pays      │                      │                     │
    │     at MP ─────────────────────────▶      │                     │
    │                    │                      │                     │
    │                    │  4. Webhook POST     │                     │
    │                    │  ◀── payment.created │                     │
    │                    │                      │                     │
    │                    │  5. Verify signature │                     │
    │                    │  6. Update Payment   │                     │
    │                    │     → COMPLETED ─────────────────────▶     │
    │                    │  7. Update User tier │                     │
    │                    │     → PREMIUM ───────────────────────▶     │
    │                    │  8. Create           │                     │
    │                    │     Subscription ────────────────────▶     │
    │                    │  9. Send email ──▶ Resend                  │
    │                    │                      │                     │
    │  ◀── Redirect to   │                      │                     │
    │     success page   │                      │                     │
    │     (tier updated) │                      │                     │
```

### 6.3 Flujo de Academia (Tier-Gated Content)

```
  Usuario (FREE)         Next.js SSR            Prisma             Tier System
    │                       │                     │                    │
    │  GET /academy/guides  │                     │                    │
    │ ─────────────────▶    │                     │                    │
    │                       │  getGuides()        │                    │
    │                       │ ─────────────────▶  │                    │
    │                       │  ◀── Guide[]        │                    │
    │                       │                     │                    │
    │  ◀── Guide listing    │                     │                    │
    │   (all visible,       │                     │                    │
    │    premium badge)     │                     │                    │
    │                       │                     │                    │
    │  Click premium guide  │                     │                    │
    │ ─────────────────▶    │                     │                    │
    │                       │  getGuideBySlug()   │                    │
    │                       │ ─────────────────▶  │                    │
    │                       │  ◀── GuideFull      │                    │
    │                       │                     │                    │
    │                       │  checkAccess()      │                    │
    │                       │ ────────────────────────────────────▶   │
    │                       │  ◀── { canRead: true,                   │
    │                       │       premiumSections: false }          │
    │                       │                     │                    │
    │  ◀── Guide page:      │                     │                    │
    │   ✅ Free sections    │                     │                    │
    │   🔒 Premium sections │                     │                    │
    │   🔒 "Upgrade" CTA   │                     │                    │
```

---

## 7. Sistema de Tiers

### Feature Matrix

```
┌──────────────────────────────┬────────┬─────────┬────────┐
│ Feature                      │  FREE  │ PREMIUM │  VIP   │
├──────────────────────────────┼────────┼─────────┼────────┤
│ Generar sensibilidad         │  5/día │  ∞      │  ∞     │
│ Estilo Balanceado            │  ✅    │  ✅     │  ✅    │
│ Estilo Agresivo              │  ❌    │  ✅     │  ✅    │
│ Estilo Sniper                │  ❌    │  ✅     │  ✅    │
│ Giroscopio                   │  ❌    │  ✅     │  ✅    │
│ Comparar dispositivos        │  ❌    │  ✅     │  ✅    │
│ Exportar imagen              │  ❌    │  ✅     │  ✅    │
│ Máx favoritos                │  3     │  ∞      │  ∞     │
│ Máx historial                │  10    │  ∞      │  ∞     │
│ Guías accesibles             │  5     │  15     │  ALL   │
│ Secciones premium            │  ❌    │  ✅     │  ✅    │
│ Videos premium               │  ❌    │  ✅     │  ✅    │
│ Sin anuncios                 │  ❌    │  ❌     │  ✅    │
│ Temas VIP                    │  ❌    │  ❌     │  ✅    │
│ Torneos                      │  ❌    │  ❌     │  ✅    │
│ Soporte prioritario          │  ❌    │  ❌     │  ✅    │
├──────────────────────────────┼────────┼─────────┼────────┤
│ Precio MXN/mes               │  $0    │  $49    │  $99   │
│ Precio MXN/año               │  $0    │  $470   │  $950  │
└──────────────────────────────┴────────┴─────────┴────────┘
```

### Implementación

```typescript
// src/lib/tiers/feature-gate.ts
// Cada feature check es una función pura que toma el tier
// y retorna boolean o number

checkFeatureAccess(tier, 'gyroscope')     // boolean
getFeatureLimit(tier, 'maxFavorites')      // number
canAccessTier(userTier, requiredTier)      // boolean (VIP > PREMIUM > FREE)
getMinimumTier(featureKey)                // 'FREE' | 'PREMIUM' | 'VIP'
getUpgradeFeatures(currentTier, targetTier) // string[] (features gained)
```

---

## 8. Seguridad

### Capas de Protección

```
┌─────────────────────────────────────────────────────┐
│  Capa 1: CLOUDFLARE                                 │
│  • DDoS protection                                  │
│  • WAF rules                                        │
│  • Bot detection                                    │
│  • SSL termination                                  │
├─────────────────────────────────────────────────────┤
│  Capa 2: VERCEL EDGE (Middleware)                   │
│  • Auth verification (JWT)                          │
│  • Rate limiting (Redis-backed, per tier)           │
│  • CORS headers                                     │
│  • CSP headers                                      │
│  • CSRF token validation                            │
├─────────────────────────────────────────────────────┤
│  Capa 3: API ROUTES                                 │
│  • Zod input validation (EVERY endpoint)            │
│  • Role-based access (USER/ADMIN)                   │
│  • Tier-based access (FREE/PREMIUM/VIP)             │
│  • SQL injection prevention (Prisma parameterized)  │
│  • XSS sanitization (DOMPurify)                     │
├─────────────────────────────────────────────────────┤
│  Capa 4: DATABASE                                   │
│  • Row-level security                               │
│  • Encrypted connections (SSL)                      │
│  • Parameterized queries only (Prisma)              │
│  • Webhook signature verification (HMAC)            │
└─────────────────────────────────────────────────────┘
```

### Rate Limiting por Tier

| Tier | Requests/min | Generate/day | Favorites | History |
|------|-------------|-------------|-----------|---------|
| Anon | 30 | 0 | 0 | 0 |
| FREE | 60 | 5 | 3 | 10 |
| PREMIUM | 120 | ∞ | ∞ | ∞ |
| VIP | 120 | ∞ | ∞ | ∞ |
| ADMIN | 300 | ∞ | ∞ | ∞ |

---

## 9. Rendering Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                    RENDERING DECISIONS                         │
├──────────────────────────┬───────────────────────────────────┤
│ Page                     │ Strategy          │ Reason        │
├──────────────────────────┼───────────────────┼───────────────┤
│ /                        │ SSR + ISR (60s)   │ SEO + dynamic │
│ /generate                │ SSR               │ Auth-dependent│
│ /devices                 │ SSG + ISR (3600s) │ SEO, static   │
│ /devices/[brand]/[model] │ SSG + ISR (3600s) │ SEO gold      │
│ /academy                 │ SSR               │ Dynamic data  │
│ /academy/guides          │ SSR               │ Filterable    │
│ /academy/guides/[slug]   │ SSR + ISR (1800s) │ SEO + views   │
│ /academy/tips            │ SSR               │ Dynamic       │
│ /academy/meta            │ SSR + ISR (3600s) │ Semi-static   │
│ /academy/videos          │ SSR               │ Tier-gated    │
│ /pricing                 │ SSG               │ Static        │
│ /community               │ SSR               │ Real-time     │
│ /admin/*                 │ SSR               │ Auth required │
│ /api/*                   │ Edge/Serverless   │ API routes    │
└──────────────────────────┴───────────────────┴───────────────┘
```

---

## 10. Fases de Desarrollo (9 fases, 68 scripts)

```
┌─────────────────────────────────────────────────────────────┐
│ Fase │ Nombre          │ Scripts │ Archivos │ Master Plan   │
├──────┼─────────────────┼─────────┼──────────┼───────────────┤
│  0   │ Foundation      │  8      │  106     │ PLAN-A.md     │
│  1   │ Motor           │  10     │  32      │ PLAN-B.md     │
│  2   │ UI/UX           │  8      │  39      │ PLAN-C.md     │
│  3   │ Academia PRO    │  6      │  30      │ PLAN-D.md     │
│  4   │ Monetización    │  8      │  23      │ PLAN-E.md     │
│  5   │ Comunidad       │  8      │  27      │ PLAN-F.md     │
│  6   │ Admin           │  6      │  25      │ PLAN-G.md     │
│  7   │ Mobile/PWA      │  5      │  22      │ PLAN-H.md     │
│  8   │ SEO/Deploy      │  9      │  32      │ PLAN-I.md     │
├──────┼─────────────────┼─────────┼──────────┼───────────────┤
│ TOTAL│                 │  68     │  336     │ 9 documents   │
└──────┴─────────────────┴─────────┴──────────┴───────────────┘
```

### Dependency Graph

```
FASE 0 (Foundation)
  │
  ├──▶ FASE 1 (Motor) ──▶ FASE 2 (UI/UX)
  │       │
  │       ├──▶ FASE 3 (Academia)
  │       │
  │       └──▶ FASE 4 (Monetización)
  │               │
  │               ├──▶ FASE 5 (Comunidad)
  │               │
  │               └──▶ FASE 6 (Admin)
  │
  └──▶ FASE 7 (Mobile/PWA)
          │
          └──▶ FASE 8 (SEO/Deploy)
```

---

## 11. Design System

### Paleta de Colores (Gaming Theme)

```
┌─────────────────────────────────────────────────┐
│ Token              │ Hex       │ Uso             │
├────────────────────┼───────────┼─────────────────┤
│ fire-500           │ #f97316   │ Primary/CTA     │
│ fire-600           │ #ea580c   │ Hover states    │
│ ice-500            │ #06b6d4   │ Secondary       │
│ ice-600            │ #0891b2   │ Hover states    │
│ background         │ #0a0a0f   │ Page background │
│ background-card    │ #111118   │ Card background │
│ background-surface │ #1a1a24   │ Elevated surface│
│ border-default     │ #ffffff10 │ Subtle borders  │
│ border-hover       │ #ffffff20 │ Hover borders   │
│ text-primary       │ #ffffff   │ Primary text    │
│ text-secondary     │ #94a3b8   │ Secondary text  │
│ text-muted         │ #64748b   │ Muted text      │
│ success            │ #22c55e   │ Success states  │
│ warning            │ #eab308   │ Warning/Premium │
│ error              │ #ef4444   │ Error states    │
└────────────────────┴───────────┴─────────────────┘
```

### Componentes Base
- GamingCard — Tarjeta con borde sutil, hover glow, glassmorphism
- Button — Variantes: primary (fire gradient), secondary (ice), ghost, outline
- Badge — Tier badges (FREE/PREMIUM/VIP), category badges
- GlowCard — Tarjeta con glow effect on hover
- RevealOnScroll — Intersection Observer animation

### Tipografía
- Headings: Inter (Black, Bold)
- Body: Inter (Regular, Medium)
- Code: JetBrains Mono

### Breakpoints
| Name | Width | Target |
|------|-------|--------|
| sm | 640px | Teléfonos grandes |
| md | 768px | Tablets |
| lg | 1024px | Laptops |
| xl | 1280px | Desktops |

---

## 12. Performance Budget

```
┌────────────────────────────┬────────────┬─────────────────┐
│ Métrica                    │ Target     │ Herramienta     │
├────────────────────────────┼────────────┼─────────────────┤
│ First Contentful Paint     │ < 1.5s     │ Lighthouse      │
│ Largest Contentful Paint   │ < 2.5s     │ Lighthouse      │
│ Time to Interactive        │ < 3.0s     │ Lighthouse      │
│ Cumulative Layout Shift    │ < 0.1      │ Lighthouse      │
│ Total JS Bundle (initial)  │ < 150KB gz │ Webpack analyzer│
│ API Response (p95)         │ < 200ms    │ Vercel Analytics │
│ Generate sensitivity       │ < 500ms    │ Custom metric   │
│ Lighthouse Score           │ > 90       │ Lighthouse      │
│ Core Web Vitals            │ All green  │ Search Console  │
└────────────────────────────┴────────────┴─────────────────┘
```

### Optimization Strategies
- **Images**: next/image con Sharp, WebP, lazy loading, blur placeholder
- **Fonts**: Inter self-hosted, font-display: swap, subset
- **JS**: Dynamic imports para componentes pesados (Recharts, Framer Motion)
- **CSS**: Tailwind purge, no CSS-in-JS
- **Data**: ISR para páginas semi-estáticas, SWR para client-side
- **Cache**: Redis para queries frecuentes (device list, brands, featured guides)
- **DB**: Prisma indexes en todas las foreign keys y campos de búsqueda

---

## 13. Monitoreo y Observabilidad

```
┌─────────────────────────────────────────────────────┐
│  Vercel Analytics                                    │
│  • Web Vitals (LCP, FID, CLS)                       │
│  • Route-level performance                           │
│  • Error rates                                       │
├─────────────────────────────────────────────────────┤
│  Sentry                                              │
│  • Runtime error tracking                            │
│  • Source maps para stack traces legibles             │
│  • Release tracking                                  │
│  • Performance transactions                          │
├─────────────────────────────────────────────────────┤
│  Custom Dashboard (Admin)                            │
│  • Usuarios activos / nuevos / churn                 │
│  • Revenue MRR / daily                               │
│  • Generaciones de sensibilidad por hora             │
│  • Top dispositivos buscados                         │
│  • Tier distribution (FREE/PREMIUM/VIP)              │
│  • Guías más vistas                                  │
│  • A/B test results                                  │
├─────────────────────────────────────────────────────┤
│  Health Check: GET /api/health                       │
│  • Database connectivity                             │
│  • Redis connectivity                                │
│  • Response time                                     │
│  • Version info                                      │
└─────────────────────────────────────────────────────┘
```

---

## 14. Reglas Absolutas del Código

Estas reglas son **inquebrantables**. Todo código generado debe cumplirlas:

1. **JAMÁS `any`** — Usar tipos explícitos, generics, o `unknown` + type guards
2. **Server Components por defecto** — `'use client'` solo cuando hay interactividad
3. **Validación SIEMPRE con Zod** — Todo input externo se valida
4. **Errores tipados** — Usar `@ares/errors` (NotFoundError, BusinessError, etc.)
5. **Logging estructurado** — Usar `@ares/logger`, jamás `console.log`
6. **API response estándar** — `{ data, pagination }` o `{ error, details }`
7. **Convenciones de naming**:
   - Variables/funciones: `camelCase`
   - Tipos/interfaces: `PascalCase`
   - Constantes: `UPPER_SNAKE_CASE`
   - Archivos: `kebab-case.ts`
   - Componentes: `PascalCase.tsx`
   - API routes: `kebab-case`
8. **Git commits**: `feat|fix|test|docs|chore(scope): ARES-XXX description`
9. **Target touch**: Botones mínimo `44x44px` (mobile gaming)
10. **Imports absolutos**: `@/` para src, `@ares/` para packages

---

# ═══════════════════════════════════════════════════════════════
# FIN — ARCHITECTURE.md
# ═══════════════════════════════════════════════════════════════
#
# Este documento es la referencia técnica completa de ARES SensiPRO.
# Cubre: arquitectura, stack, estructura, modelos, flujos de datos,
# tiers, seguridad, rendering, fases, design system, performance,
# monitoreo y reglas de código.
#
# Para referencia de API endpoints → docs/API.md
# Para reglas y convenciones → CLAUDE.md
# Para plan de ejecución → PROGRESS.md + MASTER-PLAN-[A-I].md
#
# ═══════════════════════════════════════════════════════════════
