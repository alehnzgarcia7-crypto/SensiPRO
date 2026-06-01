# ARES v6 — API Integration Validation Report (Fase 2 Foundation)

**Rama:** `refactor/phase-0-nuclear-refoundation`
**Gate:** `Phase 0.1B ARES v6 Gate` (bloqueante)

---

## 1. Resumen

Se construyó la integración backend aislada de ARES v6: adapter Prisma→engine
(sin perder `screenDpi`), feature flags, schema Zod, servicio de generación con
finder inyectable y el endpoint `POST /api/generate/v6` apagado por defecto.
Todo cubierto por tests; el gate v6 ahora typechequea con `tsconfig.ares-v6.json`
(incluye los tests) y corre vitest sobre motor + lib + endpoint.

---

## 2. Tests agregados

| Suite | Casos | Cubre |
|---|---:|---|
| `src/lib/ares-v6/__tests__/feature-flags.test.ts` | 5 | default false, "false", "true", valores truthy-no-true, mapeo por flag |
| `src/lib/ares-v6/__tests__/device-adapter.test.ts` | 10 | screenDpi→ppi/screenDpi, override gana, ramGb/Hz, campos esenciales, sin screenDpi, fuera de rango, no-mutación |
| `src/lib/ares-v6/__tests__/generate-service.test.ts` | 4 | detectedPpi desde screenDpi, override gana, NotFound, paquete completo |
| `src/app/api/generate/v6/__tests__/route.test.ts` | 6 | flag off→404, body inválido→400, JSON inválido→400, device no existe→404, 200 completo, override ppi |
| **Fase 1.5 — confidence (nuevos)** | 2 | PPI manual fuera de tolerancia ≠ LAB_VERIFIED; dentro de tolerancia sí |

**Total v6:** 114 casos en 11 archivos (89 motor + 25 backend).

---

## 3. Comandos corridos (local) y resultados

```
npm run db:generate                                                  → exit 0 (Prisma Client v5.22.0)
npx eslint packages/algorithms/src/engine-v6 src/lib/ares-v6 \
  src/app/api/generate/v6 --ext .ts,.tsx                             → exit 0 (0 findings)
npx tsc -p tsconfig.ares-v6.json                                     → exit 0 (incluye tests)
npx vitest run packages/algorithms/src/engine-v6 src/lib/ares-v6 \
  src/app/api/generate/v6 --coverage=false                           → 114 passed (11 files)
npx tsx scripts/ares-v6-compare-fixtures.ts                          → tabla de 12 fixtures
```

---

## 4. Resultado del gate CI

Commit `5c1acb8` · GitHub Actions run **26745125558** → conclusión **success**.

- `Phase 0.1B ARES v6 Gate`: **success** (npm ci → db:generate → eslint → `tsc -p tsconfig.ares-v6.json` → vitest → artifact `ci-logs-phase-0-v6-gate`).
- `Legacy Audit non-blocking debt report`: success (no bloqueante, `|| true`).
- `E2E Tests`: skipped (solo en push a main).
- PR #1: **MERGEABLE**.

---

## 5. Qué cubre el endpoint

- Validación Zod estricta del body (deviceId cuid, preset/player/overrides tipados).
- Resolución de device por id en Prisma (select acotado).
- Adaptación que conserva `screenDpi` → `ppi`/`screenDpi`; override de `ppi` gana.
- Generación v6 completa: `sensitivity`, `gyroscope?`, `dpi` (detectedPpi),
  `fireButton`, `hud`, `confidence`, `explanation`, `firstTuningSteps`.
- Respuesta estructurada + `meta.engine` + `meta.labMode`.
- Apagado por defecto (404 cuando `ARES_V6_API_ENABLED !== 'true'`).

---

## 6. Qué NO hace todavía (a propósito)

- No escribe feedback (`ARES_V6_WRITE_FEEDBACK` reservado para Fase 3).
- No cachea resultados.
- No usa sesión/usuario ni historial.
- No está conectado a UI ni a `/api/generate` legacy.
- No hace rollout ni A/B.

---

## 7. Riesgos detectados

- **`tsx` no es dependencia declarada** (se usa vía `npx tsx`, igual que `db:seed`).
  El script de comparación y `ares:v6:fixtures` dependen de que `npx` lo resuelva.
- **Alias `@ares/algorithms/engine-v6`**: nuevo path en `tsconfig.json` y
  `vitest.config.ts`. Next.js y vitest lo resuelven; conviene vigilarlo si se
  cambia el resolver de imports.
- **Hook local de Semgrep** falla en cada Write/Edit por falta de
  `SEMGREP_APP_TOKEN` (cosmético; los archivos sí se escriben).
- El endpoint typechequea y se testea con Prisma mockeado; aún no se ha probado
  contra una base de datos real (eso llega con el rollout en Fase 3).

---

## 8. Deuda pendiente (Fase 3)

- Comparativa legacy vs v6 sobre datos reales + métricas (rating ≥ 4.3, p95 < 700ms).
- Feedback loop (`/api/feedback/v6`) detrás de `ARES_V6_WRITE_FEEDBACK`.
- UI experimental oculta tras `NEXT_PUBLIC_ARES_V6_ENABLED`.
- Rate limiting y, si aplica, sesión/usuario en el endpoint.
- Rollout gradual (5% → 25% → reemplazo) y migración de rutas legacy.

---

## 9. Lo que NO se tocó (confirmado)

Pagos, Stripe, MercadoPago, webhooks, auth, NextAuth, middleware, command-center,
admin APIs, pricing, landing, academy, UI del generador, schema Prisma,
migrations, y las rutas legacy `/api/generate`, `/api/generate/all`,
`/api/generate/headshot`, `/api/export`.

---

## 10. Fase 3A Hardening Addendum

Fase 3A endureció este mismo endpoint (sigue OFF por defecto). Detalle completo en
`docs/phase-3/API-V6-LAB-HARDENING-ARCHITECTURE.md` y `…-VALIDATION.md`. Resumen:

- **Strict schemas:** root/player/overrides son `z.object().strict()` (unknown keys ⇒ 400)
  y `symptoms` se deduplica preservando orden (máx 5).
- **Rate limit:** abuse guard por IP+deviceId sobre **Redis** (ioredis reusado de
  `src/lib/cache/redis.ts`, sin tercera conexión), ventana 60s, 20/IP+device y
  8/unknown-ip, 429 con `Retry-After` + headers `X-RateLimit-*`, fail-open en lab.
  Corre **antes** de Prisma → un bloqueo nunca consulta la DB.
- **Payload guard:** `Content-Length > 20KB ⇒ 413`.
- **Observabilidad:** `requestId` + `ipHash`/`uaHash` salteados, eventos y métricas
  estructuradas, redacción recursiva — **cero PII**.
- **Access policy:** `access-policy.ts` (device activo = público; inactivo ⇒ NotFound
  anti-enumeración; `user` reservado para 3B).
- **Lab mode:** `meta` con `engine/labMode/requestId/rateLimit` siempre y `warnings`
  cuando `ARES_V6_LAB_MODE=true`.
- **Engine:** se expuso `dpi.source` (provenance) para trust + observabilidad.
- **Tests:** 114 → **158** (15 archivos). Gate v6 verde, sin cambios de forma en `ci.yml`.
