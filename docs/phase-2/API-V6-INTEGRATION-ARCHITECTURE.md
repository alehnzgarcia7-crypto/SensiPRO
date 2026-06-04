# ARES v6 — API Integration Architecture (Fase 2 Foundation)

**Rama:** `refactor/phase-0-nuclear-refoundation`
**Estado:** Backend aislado, OFF por defecto. No conectado a UI ni a producción.

> El endpoint v6 **no** reemplaza ni toca las rutas legacy (`/api/generate`, `/api/generate/all`, `/api/generate/headshot`, `/api/export`). No toca pagos, auth, middleware, webhooks ni el schema de Prisma.

---

## 1. Módulos creados

```
src/lib/ares-v6/
├── feature-flags.ts      Lee ARES_V6_API_ENABLED / LAB_MODE / WRITE_FEEDBACK (backend, no NEXT_PUBLIC)
├── device-adapter.ts     Prisma Device → AresV6DeviceSignal (nunca pierde screenDpi)
├── request-schema.ts     Validación Zod del body del endpoint
└── generate-service.ts   Orquestación: find device → adapt → generateAresV6 (finder inyectable)

src/app/api/generate/v6/
└── route.ts              POST handler aislado, detrás de feature flag
```

Aislamiento: el backend importa el motor vía el alias `@ares/algorithms/engine-v6`
(añadido a `tsconfig.json` y `vitest.config.ts`), no a través del barrel
`@ares/algorithms` — así el typecheck estricto de v6 nunca arrastra el motor legacy.

---

## 2. Adapter Prisma → v6

`toAresV6DeviceSignal(device)` y `toAresV6DeviceSignalWithOverrides(device, overrides)`.

Regla de oro (deuda nuclear 4.1 del research): **screenDpi no se pierde**.

```
ppi       = override.ppi ?? device.screenDpi ?? undefined
screenDpi = device.screenDpi ?? undefined
```

- Campos esenciales (brand, model, screenSize, ramGb, screenHz, panelType, tier, chipset, releaseYear) se mapean tal cual.
- `normalizeAresV6Overrides` sanea overrides: descarta valores fuera de rango
  (ramGb 1–32, screenHz 30–240, ppi 200–700, pingMs 0–999) como defensa en
  profundidad. La validación dura vive en Zod (API).
- El adapter es **puro**: no importa Prisma, no muta sus entradas.

`PanelType`/`DeviceTier` de Prisma son uniones de string idénticas a
`AresV6PanelType`/`AresV6DeviceTier`, así que el `Device` de Prisma encaja
estructuralmente sin casts.

---

## 3. Feature flags (backend)

```
ARES_V6_API_ENABLED   → isAresV6ApiEnabled()        habilita el endpoint
ARES_V6_LAB_MODE      → isAresV6LabMode()            output experimental interno
ARES_V6_WRITE_FEEDBACK→ isAresV6FeedbackWriteEnabled() (no usado aún en Fase 2)
```

- `true` solo si la env var es exactamente la cadena `"true"`.
- Default `false`. Se leen en **tiempo de llamada** (flip sin reinicio).
- Nunca `NEXT_PUBLIC_*`: v6 no se expone al cliente por env.

---

## 4. Schema Zod

`aresV6GenerateRequestSchema` valida:

```ts
{
  deviceId: string (cuid),
  presetId: AresV6PresetId,           // derivado de ARES_V6_PRESETS (fuente de verdad)
  player: {
    fingers: 2 | 3 | 4 | 5,
    playstyle, mode,                  // requeridos
    handDominance?, preferredRange?,
    primaryWeaponCategory?, secondaryWeaponCategory?,
    usesGyroscope?, currentRank?,
    symptoms?: AresV6Symptom[] (máx 5)
  },
  overrides?: {
    ramGb? (1–32), screenHz? (30–240), ppi? (200–700), pingMs? (0–999),
    client?, graphicsQuality?, highFpsMode?, frameBoostEnabled?,
    thermalState?, hasScreenProtector?, inputLagHint?
  }
}
```

Los enums se mantienen exhaustivos: el preset se deriva del motor, y el resto usa
un helper `zEnumFromUnion(Record<Union, true>)` que convierte en error de compilación
cualquier miembro faltante de la unión.

---

## 5. Flujo request → response

```
POST /api/generate/v6
  │
  ├─ isAresV6ApiEnabled()? ── no ─→ 404 (endpoint invisible)
  │
  ├─ request.json()        ── inválido ─→ 400 VALIDATION_ERROR
  ├─ schema.safeParse()    ── inválido ─→ 400 VALIDATION_ERROR
  │
  ├─ generateAresV6ForDeviceId(input)
  │     ├─ findDevice(deviceId)  (Prisma select; finder inyectable)
  │     │      └─ null ─→ NotFoundError ─→ 404
  │     ├─ toAresV6DeviceSignalWithOverrides(device, overrides)
  │     └─ generateAresV6({ device, presetId, player })
  │
  └─ 200 {
        success: true,
        data: {
          device: { id, brand, model, slug, screenDpi },
          generation: AresV6GenerationOutput
        },
        meta: { engine: 'ARES-v6-refoundation', labMode }
      }
```

Errores controlados vía `@ares/errors` (`handleApiError`, `formatErrorResponse`):
estructura `{ success: false, error: { code, message, statusCode } }`. Errores
desconocidos → 500 genérico (mensaje oculto fuera de development). Logging
estructurado vía `@ares/logger` (sin `console`, sin datos sensibles).

`export const runtime = 'nodejs'` porque el finder usa Prisma (no edge).

---

## 6. Testabilidad

- `generate-service.ts` acepta `deps.findDevice` inyectable; el default importa
  Prisma de forma perezosa (`await import('@ares/database')`), así los tests de
  servicio inyectan un finder y **nunca tocan la base de datos**.
- El handler de ruta se testea con Prisma mockeado (`vi.mock('@ares/database')`)
  y el flag por `process.env`.

---

## 7. Por qué no se toca legacy

Fase 0 congeló legacy; Fase 1 construyó el motor; Fase 2 expone un endpoint
**paralelo** detrás de flag. El legacy sigue sirviendo producción intacto hasta
que exista comparativa, feedback y rollout gradual (plan en
`docs/phase-0/API-MIGRATION-PLAN.md`).

---

## 8. Rollback

Apagar el endpoint es instantáneo y sin revertir commits:

```
ARES_V6_API_ENABLED=false   (o sin definir)  → el endpoint responde 404
NEXT_PUBLIC_ARES_V6_ENABLED=false             → (cuando exista UI) la oculta
```

---

## 9. Seguridad y fair play

SensiPRO **no** modifica Free Fire, **no** usa APK/hacks/macros/auto-headshot/GFX.
El endpoint solo devuelve valores manuales para aplicar en los ajustes oficiales,
con score de confianza y protocolo de prueba.
