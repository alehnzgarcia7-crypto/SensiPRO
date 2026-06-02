# ARES v6 — Internal Controlled Activation Architecture (Fase 3C)

**Rama:** `refactor/phase-0-nuclear-refoundation`
**Estado:** Endpoint v6 con **acceso interno**, **persistencia controlada**, **feedback v0** y **métricas de laboratorio** — pero **OFF por defecto** y sin UI pública, sin rollout, sin recalibración automática del motor.

> Fase 3C convierte el endpoint validado contra infra real (3B) en un **laboratorio interno controlado**: recolecta evidencia confiable (generaciones + feedback), la mide (métricas auditables) y la limpia (retención), detrás de un guard de acceso interno. El feedback es **evidencia, nunca verdad automática**.

---

## 1. Por qué existe Fase 3C

| Necesidad | Mitigación 3C |
|---|---|
| `ARES_V6_API_ENABLED=true` no debe exponer público | **Internal access guard** (token SHA-256, timing-safe, stealth 404) |
| Sin evidencia no hay rollout serio | **Persistencia controlada** de generaciones (sin PII) |
| Necesitamos saber si v6 mejora | **Feedback v0** interno (rating/outcome/síntomas) |
| OWASP API6 (abuso de flujos) | Feedback rate-limited, único por generación (409), anti-poisoning |
| OWASP API4/API1 | Límites de tamaño/frecuencia + access policy por objeto |
| Medir antes de UI | **Lab metrics** (p95, fallbackPpiRate, confidence/feedback distributions) |
| Datos no deben crecer sin límite | **Retención + cleanup** (90d/180d, dry-run) |

---

## 2. Módulos nuevos

```
src/lib/ares-v6/
├── internal-access.ts          token interno (SHA-256 + timingSafeEqual), modos off/header/lab
├── generation-persistence.ts   flag-gated; build + persist AresV6Generation (sin PII)
├── feedback-schema.ts          Zod strict del feedback (PII rejected, symptoms dedupe)
├── feedback-quality.ts         sanitiza comentarios, detecta PII, marca SUSPICIOUS
├── feedback-service.ts         orquesta: generation existe → 409 duplicado → quality → persist
├── lab-metrics.ts              calculadoras puras + getAresV6LabMetrics (deps inyectables)
├── lab-runner.ts               core del runner (parse/select/run/summarize); token nunca serializado
├── lab-cleanup.ts              retención + cutoffs + cleanup (dry-run/execute)
└── json-util.ts                toAresV6Json (Json columns sin `any`)

src/app/api/feedback/v6/route.ts   POST feedback v0 (OFF por defecto)
src/app/api/lab/v6/metrics/route.ts GET métricas internas (OFF por defecto)
scripts/ares-v6-internal-lab-runner.ts  CLI lab (local-service + http)
scripts/ares-v6-lab-cleanup.ts          CLI cleanup (--dry-run / --execute)
.github/workflows/ares-v6-internal-lab.yml  workflow manual (workflow_dispatch + environment)
```

Prisma: 3 modelos aditivos (`AresV6Generation`, `AresV6Feedback`, `AresV6LabRun`) sin foreign keys (ids + índices), + migración aditiva `20260602000000_ares_v6_lab`.

---

## 3. Internal access guard (`internal-access.ts`)

- `ARES_V6_INTERNAL_ACCESS_MODE` = `off` | `header` | `lab` (default: prod+API on → `header`, si no `lab`).
- En `header`: token requerido vía `Authorization: Bearer <t>` o `x-ares-v6-lab-token`. Se compara `sha256(token)` con `ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256` usando `timingSafeEqual` (guard de longitud antes).
- Token **nunca** se guarda ni se loggea. Denegación: **404 stealth** por defecto, **403** en lab mode.
- Sin hash configurado en `header` ⇒ denegado (nunca abre). Integrado en los 3 endpoints (generate, feedback, lab/metrics).

---

## 4. Persistencia controlada (`generation-persistence.ts`)

- `ARES_V6_PERSIST_GENERATIONS` (default false). `ARES_V6_PERSIST_GENERATIONS_REQUIRED` decide la política de fallo.
- `buildAresV6GenerationRecord` minimiza el registro: device/preset/player, sensitivity/dpi/hud/etc. (Json), métricas operativas, **sin IP cruda, sin ipHash, sin user-agent, sin body, sin token**.
- En la ruta: éxito ⇒ `meta.generationId`; fallo requerido ⇒ **503** + evento `persistence_failed`; fallo no requerido ⇒ 200 + `meta.persistence.degraded`.

---

## 5. Feedback v0 (`feedback-*`)

- `POST /api/feedback/v6`, OFF por defecto (`ARES_V6_WRITE_FEEDBACK`), internal-access + rate-limit (namespace `fb`, antes de DB).
- Strict Zod: `generationId(cuid)`, `rating 1..5`, `outcome`, `problemResolved?`, `symptoms?(max 5, dedupe)`, `adjustmentsApplied?(record acotado)`, `comment?(<=280, PII ⇒ 400)`.
- Servicio: generación inexistente ⇒ **404**; feedback duplicado por `generationId` ⇒ **409**; device/preset se toman de la **generación almacenada** (no del cliente).
- **El feedback nunca recalibra el motor.** Ver `FEEDBACK-V0-SPEC.md`.

---

## 6. Anti-data-poisoning (`feedback-quality.ts`)

- Comentarios: strip de control chars + colapso + recorte 280; rechazo (400) si contienen URL/email/teléfono.
- `qualityFlag` = `TRUSTED` | `SUSPICIOUS` (+ `qualityReasons`): volumen de ratings bajos por device+preset en ventana, conflictos outcome/síntoma. El feedback SUSPICIOUS **se guarda pero se excluye** de las métricas confiables por defecto.

---

## 7. Lab metrics (`lab-metrics.ts` + `GET /api/lab/v6/metrics`)

- OFF por defecto (`ARES_V6_LAB_METRICS_ENABLED`), internal-access. Sólo agregados (sin filas, sin PII).
- Métricas: total generaciones/feedback, p50/p95/p99 totalDurationMs, avg db/engine, fallbackPpiRate, distribuciones (confidence/preset/mode/device/rating/outcome), unresolvedProblemRate, feedbackCoverageRate, rateLimitDegradedCount, labModeCount, suspiciousFeedbackExcluded. Ver `LAB-METRICS-SPEC.md`.

---

## 8. Lab runner + cleanup

- `scripts/ares-v6-internal-lab-runner.ts`: **local-service** (motor sobre fixtures×presets, artifact JSON) y **http** (POST real con token interno sobre devices activos). Token nunca en el artifact. Opcional: fila `AresV6LabRun`.
- `scripts/ares-v6-lab-cleanup.ts`: `--dry-run` (cuenta) / `--execute` (borra) según retención (gen 90d, feedback 180d; lab runs se conservan).

---

## 9. CI

- Gate `Phase 0.1B ARES v6 Gate` ahora cubre `src/app/api/feedback/v6` y `src/app/api/lab/v6` (lint + tsc + vitest).
- `ares-v6-real-infra-smoke` ahora valida persistencia + feedback + métricas + cleanup dry-run contra Postgres 16 + Redis 7 reales.
- `ares-v6-internal-lab.yml`: **manual** (`workflow_dispatch`), environment protegido `ares-v6-internal-lab`, artifact. **No corre en PR/push.**

---

## 10. Qué sigue OFF / kill switch

- `ARES_V6_API_ENABLED=false` · `ARES_V6_WRITE_FEEDBACK=false` · `ARES_V6_PERSIST_GENERATIONS=false` · `ARES_V6_LAB_METRICS_ENABLED=false`.
- Sin UI pública, sin rollout, sin reemplazo de legacy, sin auto-calibración. SensiPRO no modifica Free Fire ni usa APK/hacks/macros/GFX.
