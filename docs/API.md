# ARES SensiPRO — API Reference
# ══════════════════════════════════════════════════════════════
# Documentación completa de todos los endpoints de la API
# Base URL: https://sensibilidadespro.com/api
# Formato: JSON | Auth: NextAuth JWT Bearer Token
# ══════════════════════════════════════════════════════════════

## Convenciones Generales

### Base URL
```
Producción: https://sensibilidadespro.com/api
Desarrollo: http://localhost:3000/api
```

### Autenticación
Todos los endpoints protegidos requieren header `Authorization: Bearer <token>` o cookie de sesión NextAuth. Los endpoints públicos están marcados con 🔓 (público) y los protegidos con 🔐 (auth required). Los endpoints admin requieren `role: ADMIN`.

### Formato de Respuesta
```json
{
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 156,
    "totalPages": 13
  }
}
```

### Errores
```json
{
  "error": "Descripción del error",
  "details": { ... }
}
```

| Código | Significado |
|--------|-------------|
| 400 | Parámetros inválidos (Zod validation) |
| 401 | No autenticado |
| 403 | Sin permisos (tier insuficiente o no admin) |
| 404 | Recurso no encontrado |
| 429 | Rate limit excedido |
| 500 | Error interno del servidor |

### Rate Limiting
- Endpoints públicos: 60 requests/minuto por IP
- Endpoints autenticados: 120 requests/minuto por usuario
- Generación de sensibilidad (FREE): 5/día
- Webhooks: Sin límite (verificación por firma)

---

# ████████████████████████████████████████████████████████████
# █                                                          █
# █   FASE 0 — AUTENTICACIÓN                                █
# █   Script: ARES-003                                      █
# █                                                          █
# ████████████████████████████████████████████████████████████

---

## `[...nextauth]` — NextAuth.js Handler

**Route:** `/api/auth/[...nextauth]`
**Métodos:** GET, POST
**Auth:** 🔓 Público
**Fase:** 0 | **Script:** ARES-003

Maneja todo el flujo de autenticación OAuth. No se llama directamente — NextAuth gestiona las rutas internas:

| Ruta | Propósito |
|------|-----------|
| `/api/auth/signin` | Página de login |
| `/api/auth/signout` | Cerrar sesión |
| `/api/auth/session` | Obtener sesión actual |
| `/api/auth/callback/google` | Callback OAuth Google |
| `/api/auth/callback/discord` | Callback OAuth Discord |
| `/api/auth/csrf` | Token CSRF |

### Providers configurados:
1. **Google** — Login principal
2. **Discord** — Login gaming community

### Session payload:
```typescript
{
  user: {
    id: string;
    email: string;
    username: string | null;
    tier: "FREE" | "PREMIUM" | "VIP";
    role: "USER" | "ADMIN";
    image: string | null;
  },
  expires: string; // ISO date
}
```

---

# ████████████████████████████████████████████████████████████
# █                                                          █
# █   FASE 1 — MOTOR DE SENSIBILIDAD                        █
# █   Scripts: ARES-100 → ARES-109                          █
# █                                                          █
# ████████████████████████████████████████████████████████████

---

## GET `/api/devices` — Listar dispositivos

**Auth:** 🔓 Público
**Fase:** 1 | **Script:** ARES-100

Obtiene lista de dispositivos con filtros opcionales.

### Query Parameters:
| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `brand` | string | — | Filtrar por marca (samsung, xiaomi, apple, etc.) |
| `search` | string | — | Buscar por nombre de dispositivo |
| `page` | number | 1 | Página actual |
| `limit` | number | 20 | Resultados por página (máx 50) |

### Response 200:
```json
{
  "data": [
    {
      "id": "clx123...",
      "name": "Samsung Galaxy S24",
      "slug": "samsung-galaxy-s24",
      "brand": "Samsung",
      "imageUrl": "/devices/samsung-galaxy-s24.webp",
      "screenSize": 6.2,
      "refreshRate": 120,
      "panelType": "AMOLED",
      "ram": 8,
      "processor": "Snapdragon 8 Gen 3",
      "releaseYear": 2024
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 523, "totalPages": 27 }
}
```

---

## GET `/api/devices/brands` — Listar marcas

**Auth:** 🔓 Público
**Fase:** 1 | **Script:** ARES-100

Retorna todas las marcas disponibles con conteo de dispositivos.

### Response 200:
```json
{
  "data": [
    { "brand": "Samsung", "count": 87, "slug": "samsung" },
    { "brand": "Xiaomi", "count": 62, "slug": "xiaomi" },
    { "brand": "Apple", "count": 23, "slug": "apple" },
    { "brand": "Motorola", "count": 45, "slug": "motorola" },
    { "brand": "OPPO", "count": 34, "slug": "oppo" }
  ]
}
```

---

## GET `/api/devices/[slug]` — Detalle de dispositivo

**Auth:** 🔓 Público
**Fase:** 1 | **Script:** ARES-100

Obtiene toda la información de un dispositivo por su slug.

### Path Parameters:
| Param | Tipo | Descripción |
|-------|------|-------------|
| `slug` | string | Slug del dispositivo (ej: `samsung-galaxy-s24`) |

### Response 200:
```json
{
  "data": {
    "id": "clx123...",
    "name": "Samsung Galaxy S24",
    "slug": "samsung-galaxy-s24",
    "brand": "Samsung",
    "imageUrl": "/devices/samsung-galaxy-s24.webp",
    "screenSize": 6.2,
    "screenResolutionW": 1080,
    "screenResolutionH": 2340,
    "refreshRate": 120,
    "panelType": "AMOLED",
    "touchSamplingRate": 240,
    "ram": 8,
    "processor": "Snapdragon 8 Gen 3",
    "processorTier": "HIGH",
    "gpuTier": "HIGH",
    "releaseYear": 2024,
    "ppi": 416,
    "_count": { "sensitivities": 1243 }
  }
}
```

### Response 404:
```json
{ "error": "Device not found" }
```

---

## POST `/api/generate` — Generar sensibilidad

**Auth:** 🔓 Público (con rate limit por tier)
**Fase:** 1 | **Script:** ARES-101

El endpoint más importante de la plataforma. Genera sensibilidad óptima basada en hardware real del dispositivo.

### Rate Limits:
| Tier | Límite |
|------|--------|
| FREE | 5/día |
| PREMIUM | Ilimitado |
| VIP | Ilimitado |

### Request Body:
```json
{
  "deviceId": "clx123...",
  "style": "BALANCED",
  "includeGyroscope": false
}
```

| Campo | Tipo | Required | Descripción |
|-------|------|----------|-------------|
| `deviceId` | string | ✅ | ID del dispositivo |
| `style` | enum | ✅ | `AGGRESSIVE` \| `BALANCED` \| `SNIPER` |
| `includeGyroscope` | boolean | ❌ | Solo PREMIUM/VIP |

### Response 200:
```json
{
  "data": {
    "id": "clx456...",
    "deviceId": "clx123...",
    "deviceName": "Samsung Galaxy S24",
    "style": "BALANCED",
    "general": 72,
    "redDot": 68,
    "scope2x": 55,
    "scope4x": 48,
    "sniperScope": 42,
    "freeView": 75,
    "gyroscope": null,
    "gyroscopeRedDot": null,
    "gyroscopeScope2x": null,
    "gyroscopeScope4x": null,
    "gyroscopeSniper": null,
    "factors": {
      "hzFactor": 1.15,
      "screenFactor": 0.95,
      "ramFactor": 1.0,
      "panelFactor": 1.05,
      "processorTier": 1.0,
      "styleMultiplier": 1.0
    },
    "createdAt": "2025-02-01T12:00:00.000Z"
  }
}
```

### Response 403 (tier limit):
```json
{
  "error": "Daily limit reached",
  "details": { "limit": 5, "used": 5, "tier": "FREE", "resetAt": "2025-02-02T00:00:00.000Z" }
}
```

---

## POST `/api/compare` — Comparar dispositivos

**Auth:** 🔓 Público
**Fase:** 1 | **Script:** ARES-105

Compara sensibilidades generadas entre 2-4 dispositivos.

### Request Body:
```json
{
  "deviceIds": ["clx123...", "clx789..."],
  "style": "BALANCED"
}
```

| Campo | Tipo | Required | Descripción |
|-------|------|----------|-------------|
| `deviceIds` | string[] | ✅ | 2-4 IDs de dispositivos |
| `style` | enum | ✅ | Estilo de sensibilidad |

### Response 200:
```json
{
  "data": {
    "comparisons": [
      {
        "device": { "name": "Samsung Galaxy S24", "brand": "Samsung" },
        "sensitivity": { "general": 72, "redDot": 68, "scope2x": 55, "scope4x": 48, "sniperScope": 42, "freeView": 75 }
      },
      {
        "device": { "name": "iPhone 15", "brand": "Apple" },
        "sensitivity": { "general": 65, "redDot": 62, "scope2x": 50, "scope4x": 44, "sniperScope": 38, "freeView": 70 }
      }
    ],
    "differences": {
      "general": { "min": 65, "max": 72, "spread": 7 },
      "redDot": { "min": 62, "max": 68, "spread": 6 }
    }
  }
}
```

---

## POST `/api/export` — Exportar sensibilidad como imagen

**Auth:** 🔐 PREMIUM/VIP
**Fase:** 1 | **Script:** ARES-106

Genera una imagen compartible con la configuración de sensibilidad.

### Request Body:
```json
{
  "sensitivityId": "clx456...",
  "format": "png",
  "theme": "dark"
}
```

### Response 200:
Binary image (Content-Type: image/png)

---

## GET `/api/favorites` — Listar favoritos

**Auth:** 🔐 Autenticado
**Fase:** 1 | **Script:** ARES-107

### Query Parameters:
| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `page` | number | 1 | Página |
| `limit` | number | 10 | Límite |

### Límites por tier:
| Tier | Máx favoritos |
|------|---------------|
| FREE | 3 |
| PREMIUM | 9999 |
| VIP | 9999 |

### Response 200:
```json
{
  "data": [
    {
      "id": "clx...",
      "sensitivityId": "clx456...",
      "deviceName": "Samsung Galaxy S24",
      "style": "BALANCED",
      "general": 72,
      "createdAt": "2025-02-01T12:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 2, "totalPages": 1 }
}
```

---

## POST `/api/favorites` — Agregar favorito

**Auth:** 🔐 Autenticado
**Fase:** 1 | **Script:** ARES-107

### Request Body:
```json
{ "sensitivityId": "clx456..." }
```

### Response 201:
```json
{ "data": { "id": "clx...", "sensitivityId": "clx456...", "createdAt": "..." } }
```

---

## DELETE `/api/favorites/[id]` — Eliminar favorito

**Auth:** 🔐 Autenticado (owner)
**Fase:** 1 | **Script:** ARES-107

### Response 200:
```json
{ "data": { "deleted": true } }
```

---

## GET `/api/history` — Historial de generaciones

**Auth:** 🔐 Autenticado
**Fase:** 1 | **Script:** ARES-108

### Límites por tier:
| Tier | Máx historial |
|------|---------------|
| FREE | 10 |
| PREMIUM | 9999 |
| VIP | 9999 |

### Response 200:
```json
{
  "data": [
    {
      "id": "clx...",
      "deviceName": "Samsung Galaxy S24",
      "style": "BALANCED",
      "general": 72,
      "redDot": 68,
      "scope2x": 55,
      "scope4x": 48,
      "sniperScope": 42,
      "freeView": 75,
      "createdAt": "2025-02-01T12:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

---

# ████████████████████████████████████████████████████████████
# █                                                          █
# █   FASE 3 — ACADEMIA PRO                                 █
# █   Scripts: ARES-300 → ARES-305                          █
# █                                                          █
# ████████████████████████████████████████████████████████████

---

## GET `/api/v1/academy/guides` — Listar guías

**Auth:** 🔓 Público
**Fase:** 3 | **Script:** ARES-300

### Query Parameters:
| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `category` | enum | — | `SENSITIVITY` \| `MOVEMENT` \| `AIM` \| `STRATEGY` \| `DEVICE` \| `META` |
| `page` | number | 1 | Página |
| `limit` | number | 12 | Resultados (máx 50) |
| `search` | string | — | Búsqueda por título/descripción |

### Response 200:
```json
{
  "data": [
    {
      "id": "clx...",
      "title": "Guía Definitiva de Sensibilidad",
      "slug": "guia-definitiva-sensibilidad-free-fire",
      "description": "...",
      "category": "SENSITIVITY",
      "imageUrl": "/guides/sens.webp",
      "readTimeMin": 8,
      "isPremium": false,
      "viewCount": 4521,
      "author": { "username": "admin" },
      "_count": { "sections": 3, "comments": 12 }
    }
  ],
  "pagination": { "page": 1, "limit": 12, "total": 20, "totalPages": 2 }
}
```

---

## GET `/api/v1/academy/tips` — Listar tips

**Auth:** 🔓 Público
**Fase:** 3 | **Script:** ARES-303

### Query Parameters:
| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `category` | enum | — | Categoría de tip |
| `page` | number | 1 | Página |
| `limit` | number | 20 | Resultados (máx 50) |

### Response 200:
```json
{
  "data": [
    {
      "id": "clx...",
      "title": "Empieza siempre en 50",
      "content": "Pon todos los sliders en 50 como punto de partida...",
      "category": "SENSITIVITY",
      "difficulty": "BEGINNER",
      "createdAt": "2025-01-15T00:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

---

## GET `/api/v1/admin/meta` — Obtener meta snapshot

**Auth:** 🔓 Público
**Fase:** 3 | **Script:** ARES-304

Retorna el snapshot actual del meta de Free Fire.

### Response 200:
```json
{
  "data": {
    "version": "OB45",
    "lastUpdated": "2025-02-01",
    "patchNotes": "Nerf a MP5, buff a M4A1...",
    "weapons": [ { "name": "M4A1", "tier": "S", "damage": 53, ... } ],
    "characters": [ { "name": "Alok", "tier": "S", ... } ],
    "topCombos": [ { "name": "Rush Agresivo", ... } ]
  }
}
```

---

## PUT `/api/v1/admin/meta` — Actualizar meta

**Auth:** 🔐 ADMIN
**Fase:** 3 | **Script:** ARES-304

### Request Body:
```json
{
  "version": "OB46",
  "patchNotes": "Buff a FAMAS, nerf a AWM...",
  "weapons": [ ... ],
  "characters": [ ... ]
}
```

### Response 200:
```json
{ "data": { ... }, "message": "Meta updated successfully" }
```

---

# ████████████████████████████████████████████████████████████
# █                                                          █
# █   FASE 4 — MONETIZACIÓN                                 █
# █   Scripts: ARES-400 → ARES-407                          █
# █                                                          █
# ████████████████████████████████████████████████████████████

---

## POST `/api/payments/create` — Crear pago

**Auth:** 🔐 Autenticado
**Fase:** 4 | **Script:** ARES-401

Inicia un checkout de MercadoPago o Stripe.

### Request Body:
```json
{
  "tier": "PREMIUM",
  "provider": "mercadopago",
  "period": "monthly"
}
```

| Campo | Tipo | Required | Descripción |
|-------|------|----------|-------------|
| `tier` | enum | ✅ | `PREMIUM` \| `VIP` |
| `provider` | enum | ✅ | `mercadopago` \| `stripe` |
| `period` | enum | ✅ | `monthly` \| `yearly` |

### Precios:
| Tier | Mensual | Anual |
|------|---------|-------|
| PREMIUM | $49 MXN | $470 MXN |
| VIP | $99 MXN | $950 MXN |

### Response 200:
```json
{
  "data": {
    "checkoutUrl": "https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=...",
    "paymentId": "clx...",
    "provider": "mercadopago"
  }
}
```

---

## POST `/api/webhooks/mercadopago` — Webhook MercadoPago

**Auth:** Verificación por firma (`x-signature` header)
**Fase:** 4 | **Script:** ARES-401

Recibe notificaciones de pago de MercadoPago. Actualiza tier del usuario, crea registro de suscripción, envía email de confirmación.

### Headers requeridos:
| Header | Descripción |
|--------|-------------|
| `x-signature` | Firma HMAC del payload |
| `x-request-id` | ID de la notificación |

### Response:
- `200` — Procesado correctamente
- `400` — Firma inválida
- `500` — Error de procesamiento

---

## POST `/api/webhooks/stripe` — Webhook Stripe

**Auth:** Verificación por firma (`stripe-signature` header)
**Fase:** 4 | **Script:** ARES-402

Eventos procesados:
- `checkout.session.completed` — Pago exitoso
- `customer.subscription.updated` — Cambio de plan
- `customer.subscription.deleted` — Cancelación
- `invoice.payment_failed` — Pago fallido

### Response:
- `200` — Procesado
- `400` — Firma inválida

---

## POST `/api/activation-codes/redeem` — Redimir código

**Auth:** 🔐 Autenticado
**Fase:** 4 | **Script:** ARES-403

Activa un código de suscripción (venta offline/influencers).

### Request Body:
```json
{ "code": "ARES-XXXX-XXXX-XXXX" }
```

### Response 200:
```json
{
  "data": {
    "tier": "PREMIUM",
    "durationDays": 30,
    "expiresAt": "2025-03-01T00:00:00.000Z"
  }
}
```

### Response 400:
```json
{ "error": "Code already redeemed" }
```

---

## POST `/api/cron/expire-subscriptions` — Expirar suscripciones

**Auth:** CRON secret header
**Fase:** 4 | **Script:** ARES-406

Ejecutado diariamente. Downgrade usuarios cuya suscripción expiró a FREE.

### Headers:
| Header | Descripción |
|--------|-------------|
| `Authorization` | `Bearer CRON_SECRET` |

### Response 200:
```json
{ "data": { "expired": 12, "notified": 12 } }
```

---

## GET `/api/admin/revenue` — Dashboard de ingresos

**Auth:** 🔐 ADMIN
**Fase:** 4 | **Script:** ARES-407

### Query Parameters:
| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `period` | enum | `30d` | `7d` \| `30d` \| `90d` \| `365d` |

### Response 200:
```json
{
  "data": {
    "totalRevenue": 45600,
    "mrr": 12300,
    "subscribers": { "premium": 180, "vip": 45 },
    "churnRate": 4.2,
    "conversionRate": 8.5,
    "dailyRevenue": [ { "date": "2025-02-01", "amount": 1230 } ]
  }
}
```

---

# ████████████████████████████████████████████████████████████
# █                                                          █
# █   FASE 5 — COMUNIDAD                                    █
# █   Scripts: ARES-500 → ARES-507                          █
# █                                                          █
# ████████████████████████████████████████████████████████████

---

## GET/PUT `/api/profile` — Perfil de usuario

**Auth:** 🔐 Autenticado
**Fase:** 5 | **Script:** ARES-500

**GET** — Obtener perfil del usuario actual
**PUT** — Actualizar perfil (username, bio, avatar, etc.)

### PUT Request Body:
```json
{
  "username": "proGamer123",
  "bio": "Heroico en Free Fire 🔥",
  "socialLinks": { "youtube": "https://youtube.com/@...", "tiktok": "..." }
}
```

---

## GET/POST `/api/comments` — Comentarios

**Auth:** 🔐 Autenticado (POST) / 🔓 Público (GET)
**Fase:** 5 | **Script:** ARES-501

### POST Request Body:
```json
{ "guideId": "clx...", "content": "Excelente guía, me sirvió mucho" }
```

| Campo | Tipo | Max |
|-------|------|-----|
| `content` | string | 500 chars |

---

## DELETE `/api/comments/[id]` — Eliminar comentario

**Auth:** 🔐 Autenticado (owner o ADMIN)
**Fase:** 5

---

## POST `/api/comments/[id]/report` — Reportar comentario

**Auth:** 🔐 Autenticado
**Fase:** 5 | **Script:** ARES-501

### Request Body:
```json
{ "reason": "spam" }
```

---

## GET/POST `/api/shared-configs` — Configs compartidas

**Auth:** 🔐 Autenticado
**Fase:** 5 | **Script:** ARES-502

Los usuarios comparten sus configuraciones de sensibilidad con la comunidad.

### POST Request Body:
```json
{
  "sensitivityId": "clx...",
  "title": "Mi config perfecta para S24",
  "description": "Después de 3 meses probando..."
}
```

---

## POST `/api/shared-configs/[id]/vote` — Votar config

**Auth:** 🔐 Autenticado
**Fase:** 5 | **Script:** ARES-502

### Request Body:
```json
{ "vote": "up" }
```

| Campo | Valores |
|-------|---------|
| `vote` | `up` \| `down` \| `remove` |

---

## GET `/api/leaderboard` — Ranking de jugadores

**Auth:** 🔓 Público
**Fase:** 5 | **Script:** ARES-503

### Query Parameters:
| Param | Tipo | Default |
|-------|------|---------|
| `type` | enum | `reputation` |
| `limit` | number | 20 |

Tipos: `reputation` | `guides_read` | `shared_configs` | `tips_contributed`

---

## GET `/api/notifications` — Notificaciones del usuario

**Auth:** 🔐 Autenticado
**Fase:** 5 | **Script:** ARES-504

### Response 200:
```json
{
  "data": [
    {
      "id": "clx...",
      "type": "COMMENT_REPLY",
      "message": "proGamer123 respondió tu comentario",
      "isRead": false,
      "link": "/academy/guides/guia-definitiva-sensibilidad#comments",
      "createdAt": "2025-02-01T12:00:00.000Z"
    }
  ],
  "unreadCount": 3
}
```

---

## GET/POST `/api/tournaments` — Torneos

**Auth:** 🔐 Autenticado (POST=ADMIN) / 🔓 Público (GET)
**Fase:** 5 | **Script:** ARES-505

---

## POST `/api/tournaments/[id]/join` — Unirse a torneo

**Auth:** 🔐 Autenticado (VIP only)
**Fase:** 5

---

# ████████████████████████████████████████████████████████████
# █                                                          █
# █   FASE 6 — ADMIN                                        █
# █   Scripts: ARES-600 → ARES-605                          █
# █                                                          █
# ████████████████████████████████████████████████████████████

---

## GET/POST `/api/admin/users` — Gestión de usuarios

**Auth:** 🔐 ADMIN
**Fase:** 6 | **Script:** ARES-600

### GET Query Parameters:
| Param | Tipo | Descripción |
|-------|------|-------------|
| `search` | string | Buscar por email/username |
| `tier` | enum | Filtrar por tier |
| `role` | enum | Filtrar por role |
| `page` | number | Página |

---

## PUT `/api/admin/users/[id]` — Editar usuario

**Auth:** 🔐 ADMIN
**Fase:** 6

### Request Body:
```json
{ "tier": "VIP", "role": "ADMIN", "isBanned": false }
```

---

## GET `/api/admin/users/export` — Exportar usuarios CSV

**Auth:** 🔐 ADMIN
**Fase:** 6

Response: `text/csv` descargable.

---

## GET/POST `/api/admin/devices` — CRUD Dispositivos admin

**Auth:** 🔐 ADMIN
**Fase:** 6 | **Script:** ARES-601

---

## GET/POST `/api/admin/guides` — CRUD Guías admin

**Auth:** 🔐 ADMIN
**Fase:** 6 | **Script:** ARES-602

---

## PUT/DELETE `/api/admin/guides/[id]` — Editar/eliminar guía

**Auth:** 🔐 ADMIN
**Fase:** 6

---

## GET `/api/admin/analytics` — Dashboard de analytics

**Auth:** 🔐 ADMIN
**Fase:** 6 | **Script:** ARES-603

### Response 200:
```json
{
  "data": {
    "totalUsers": 15420,
    "activeToday": 2340,
    "generationsToday": 890,
    "revenueMonth": 12300,
    "topDevices": [ { "name": "Redmi Note 12", "count": 342 } ],
    "topGuides": [ { "title": "Guía Definitiva...", "views": 4521 } ],
    "userGrowth": [ { "date": "2025-02-01", "users": 150 } ],
    "tierDistribution": { "FREE": 12000, "PREMIUM": 2800, "VIP": 620 }
  }
}
```

---

## GET/POST `/api/admin/ab-tests` — A/B Tests

**Auth:** 🔐 ADMIN
**Fase:** 6 | **Script:** ARES-604

---

## GET `/api/admin/ab-tests/[key]/results` — Resultados A/B Test

**Auth:** 🔐 ADMIN
**Fase:** 6

---

## GET `/api/ab-variant` — Obtener variante A/B del usuario

**Auth:** 🔓 Público (basado en cookie/session)
**Fase:** 6

### Query Parameters:
| Param | Tipo | Descripción |
|-------|------|-------------|
| `key` | string | Nombre del test |

### Response 200:
```json
{ "data": { "variant": "B", "testKey": "pricing-page-v2" } }
```

---

## GET/POST `/api/support` — Tickets de soporte

**Auth:** 🔐 Autenticado
**Fase:** 6 | **Script:** ARES-605

---

## GET/PUT `/api/admin/support/[id]` — Admin: gestionar tickets

**Auth:** 🔐 ADMIN
**Fase:** 6

---

# ████████████████████████████████████████████████████████████
# █                                                          █
# █   FASE 7 — MOBILE / PWA                                 █
# █   Scripts: ARES-700 → ARES-704                          █
# █                                                          █
# ████████████████████████████████████████████████████████████

---

## POST `/api/push/subscribe` — Registrar push subscription

**Auth:** 🔐 Autenticado
**Fase:** 7 | **Script:** ARES-702

### Request Body:
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": { "p256dh": "...", "auth": "..." }
  }
}
```

---

## POST `/api/admin/push/broadcast` — Enviar push masivo

**Auth:** 🔐 ADMIN
**Fase:** 7 | **Script:** ARES-702

### Request Body:
```json
{
  "title": "¡Nuevo meta actualizado!",
  "body": "El parche OB46 trajo cambios importantes...",
  "url": "/academy/meta",
  "targetTiers": ["PREMIUM", "VIP"]
}
```

---

# ████████████████████████████████████████████████████████████
# █                                                          █
# █   FASE 8 — SEO & DEPLOY                                 █
# █   Scripts: ARES-800 → ARES-808                          █
# █                                                          █
# ████████████████████████████████████████████████████████████

---

## GET `/api/health` — Health check

**Auth:** 🔓 Público
**Fase:** 8 | **Script:** ARES-807

### Response 200:
```json
{
  "status": "ok",
  "timestamp": "2025-02-01T12:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": "ok",
    "redis": "ok"
  }
}
```

---

## GET `/api/og/device/[slug]` — OG Image para dispositivo

**Auth:** 🔓 Público
**Fase:** 8 | **Script:** ARES-800

Genera imagen OpenGraph dinámica para compartir dispositivos en redes sociales. Retorna `image/png` (1200x630).

---

## GET `/api/og/guide/[slug]` — OG Image para guía

**Auth:** 🔓 Público
**Fase:** 8 | **Script:** ARES-800

Genera imagen OpenGraph dinámica para guías de academia. Retorna `image/png` (1200x630).

---

## POST `/api/cron/email-automation` — Automatización de emails

**Auth:** CRON secret header
**Fase:** 8 | **Script:** ARES-804

Ejecutado diariamente. Envía emails automáticos:
- Welcome series (día 1, 3, 7)
- Reactivación de usuarios inactivos (30 días)
- Reminder de suscripción por expirar (3 días antes)

### Response 200:
```json
{
  "data": {
    "welcome": { "sent": 45 },
    "reactivation": { "sent": 12 },
    "expiration": { "sent": 8 }
  }
}
```

---

# ═══════════════════════════════════════════════════════════════
# RESUMEN DE ENDPOINTS
# ═══════════════════════════════════════════════════════════════
#
# Total: 42 endpoints
#
# Por fase:
#   Fase 0 (Auth):         1 (NextAuth handler)
#   Fase 1 (Motor):        9 (devices, generate, compare, export, favorites, history)
#   Fase 3 (Academia):     4 (guides, tips, meta GET/PUT)
#   Fase 4 (Monetización): 5 (payments, webhooks MP/Stripe, codes, cron, revenue)
#   Fase 5 (Comunidad):    9 (profile, comments, shared-configs, leaderboard, notifications, tournaments)
#   Fase 6 (Admin):       10 (users, devices, guides, analytics, A/B, support)
#   Fase 7 (Mobile):       2 (push subscribe, broadcast)
#   Fase 8 (SEO/Deploy):   4 (health, OG images, email cron)
#
# Por autenticación:
#   🔓 Público:     16
#   🔐 Auth:        15
#   🔐 ADMIN:       10
#   🔐 CRON:         2
#
# Webhooks externos:
#   MercadoPago: /api/webhooks/mercadopago (HMAC verification)
#   Stripe:      /api/webhooks/stripe (Stripe signature verification)
#
# ═══════════════════════════════════════════════════════════════
