# ARES v6 — Internal Controlled Activation Validation (Fase 3C)

**Rama:** `refactor/phase-0-nuclear-refoundation`
**Gates:** `Phase 0.1B ARES v6 Gate` (unit) + `ARES v6 Real-Infra Smoke` (Redis + Postgres reales)

---

## 1. Resumen

- **Internal access guard** (token SHA-256 timing-safe, stealth 404 / 403 lab) en los 3 endpoints.
- **Persistencia controlada** de generaciones (flag-gated, sin PII) + política required/degraded.
- **Feedback v0** interno (strict Zod, 409 duplicado, anti-PII, anti-poisoning) — evidencia, no verdad.
- **Lab metrics** (`GET /api/lab/v6/metrics`) + agregador puro testeado.
- **Lab runner** (local-service + http, artifact JSON, token nunca serializado) + **cleanup** (retención, dry-run).
- **3 modelos Prisma aditivos** + migración aditiva `20260602000000_ares_v6_lab` (sólo CREATE TABLE/INDEX).
- Endpoint **OFF por defecto**; sin UI; sin rollout; **el feedback no recalibra el motor**.

---

## 2. Tests

| Suite | Casos | Tipo |
|---|---:|---|
| `internal-access.test.ts` | 8 | unit |
| `generation-persistence.test.ts` | 5 | unit |
| `feedback-quality.test.ts` | 8 | unit |
| `feedback-schema.test.ts` | 8 | unit |
| `feedback-service.test.ts` | 4 | unit |
| `lab-metrics.test.ts` | 6 | unit |
| `lab-runner.test.ts` | 5 | unit |
| `lab-cleanup.test.ts` | 3 | unit |
| `generate/v6/route.test.ts` (reescrito) | 11 | unit (internal access + persistence) |
| `feedback/v6/route.test.ts` (nuevo) | 8 | unit |
| `lab/v6/metrics/route.test.ts` (nuevo) | 4 | unit |
| `real-infra.smoke.test.ts` (ampliado) | 11 | **integration (real Redis + Postgres)** |

**Total v6: 239** — **228 unit** (28 archivos, smoke saltado en el gate) + **11 real-infra smoke**.

---

## 3. Comandos corridos (local) y resultados

```
npm run db:generate                                         → exit 0 (Prisma 5.22.0, nuevos modelos)
npx eslint <5 dirs v6> --ext .ts,.tsx                       → exit 0 (0 findings)
npx tsc -p tsconfig.ares-v6.json                            → exit 0
npx vitest run <5 dirs v6> --coverage=false                 → 228 passed | 11 skipped (28 files)
npm run ares:v6:fixtures -- --json                          → 12 fixtures
npm run ares:v6:lab:run -- --all-fixtures --preset STANDARD_PRO → 12/12 ok, p95=2ms, fallbackPpiRate=0
npm run ares:v6:lab:run -- --fixture redmi-note-13 --json   → artifact JSON (1 row, sin token)
npm run ares:v6:lab:cleanup -- --dry-run                    → { dryRun:true, generations:0, feedback:0, cutoffs:{…} }
```

**Smoke real (local, Postgres 16 + Redis 7 nativos, DB efímera):**
```
createdb → db:push:test (incl. ares_v6_*) → vitest real-infra.smoke → 11 passed → dropdb
```
Cubre: limiter atómico Redis (count/TTL/IP_DEVICE/IP_GLOBAL), Prisma activo/inactivo/inexistente, ruta 200/404/429, **persistencia de generación (generationId real)**, **feedback 201 + 409 duplicado real**, **métricas viendo generación+feedback**, **cleanup dry-run real**.

**Migración aditiva** generada offline (`prisma migrate diff --from-schema-datamodel … --to-schema-datamodel …`): sólo `CREATE TABLE`/`CREATE INDEX` para `ares_v6_generations`, `ares_v6_feedback`, `ares_v6_lab_runs`. Cero ALTER/DROP sobre tablas existentes.

---

## 4. Resultado de CI

Commit `7f2ecff` · GitHub Actions run **26803272532** → conclusión **success**
([link](https://github.com/alehnzgarcia7-crypto/SensiPRO/actions/runs/26803272532)).

- `Phase 0.1B ARES v6 Gate`: **success** (lint + tsc + vitest sobre engine-v6 + lib + generate/v6 + feedback/v6 + lab/v6).
- `ARES v6 Real-Infra Smoke`: **success** — Postgres 16 + Redis 7 service containers; db:push:test (incl. `ares_v6_*`) → seed → vitest **11 passed** (limiter atómico, Prisma activo/inactivo/inexistente, ruta 200/404/429, persistencia, feedback 201/409, métricas, cleanup dry-run).
- `Legacy Audit non-blocking debt report`: **success** (no bloqueante).
- `E2E Tests`: **skipped**.
- PR #1: OPEN · DRAFT · **MERGEABLE**.
- Workflow manual `ares-v6-internal-lab.yml`: YAML válido (parse OK), `workflow_dispatch` únicamente (no corre en push/PR).

---

## 5. Seguridad / privacidad (verificado)

- Token interno nunca guardado ni logueado (comparación SHA-256 timing-safe).
- Persistencia y logs sin IP cruda, sin ipHash en filas, sin user-agent, sin cookies/tokens, sin body completo (`grep` en el registro construido: sin `ipHash`/`userAgent`).
- Feedback SUSPICIOUS excluido de métricas confiables por defecto. Comentarios con PII rechazados (400).
- Endpoints internos no expuestos públicamente (internal-access + flags OFF).

---

## 6. Riesgos restantes

- Activación real requiere secrets del environment `ares-v6-internal-lab` (token hash, salt, DATABASE_URL, REDIS_URL) — código + workflow listos; secrets pendientes de configurar por el operador.
- `UNKNOWN_GLOBAL` rate-limit compartido (heredado de 3B).
- Sin cron de cleanup (manual).
- El runner http depende de devices en la DB del target.
- Hook Semgrep local falla por falta de `SEMGREP_APP_TOKEN` (cosmético; no afecta el gate).

---

## 7. Recomendación Fase 3D

Ver §13 del reporte / el prompt sugerido: **Comparativa controlada legacy vs v6 + decisión de calibración asistida por humano** (nunca automática), usando exclusivamente evidencia TRUSTED y los umbrales go/no-go del runbook.

---

## 8. Lo que NO se tocó (confirmado)

Pagos, Stripe, MercadoPago, webhooks, auth, NextAuth, middleware, command-center, admin APIs, pricing, landing, academy, UI del generador, rutas legacy (`/api/generate`, `/all`, `/headshot`, `/export`). El schema sólo recibió modelos nuevos `ares_v6_*` (aditivos); ningún modelo existente fue modificado.

---

## 9. Fase 3C.1 — Security patch addendum

**P0 corregido:** el internal access ya no dependía sólo de `ARES_V6_API_ENABLED`. Ahora **cualquier** superficie activa (`ARES_V6_WRITE_FEEDBACK`, `ARES_V6_LAB_METRICS_ENABLED`, `ARES_V6_PERSIST_GENERATIONS`, `ARES_V6_INTERNAL_ACCESS_ENABLED`, además de `API_ENABLED`) en producción exige token, y un modo `off`/`lab` explícito se **ignora** (forzado a `header`, marcado `unsafeModeIgnored`) en producción con superficie activa. Un flag mal puesto ya no puede exponer una superficie públicamente.

### Cambios
- `internal-access.ts`: `getAresV6EnabledSurfaces` / `isAresV6SurfaceEnabled` / `shouldRequireAresV6InternalAccess` / `getAresV6InternalAccessMode` + override de modo inseguro.
- `internal-access-route.ts` (nuevo): `enforceAresV6InternalAccess` — chokepoint único en los 3 endpoints (log de denegación sin secretos + respuesta stealth).
- `lab/v6/metrics`: rate-limit (bucket `metrics`) **antes** de la query; ventana por defecto 7d, máx 90d (`until<since` / rango>90d ⇒ 400); tope `ARES_V6_LAB_METRICS_MAX_ROWS = 10 000` con `orderBy createdAt desc`.
- `feedback-service.ts`: `isPrismaUniqueConstraintError(error: unknown)`; `P2002` (carrera de duplicado) ⇒ **409** (antes 500).
- `internal-env-preflight.ts` + `scripts/ares-v6-verify-internal-env.ts` (`npm run ares:v6:verify-env`): verificador de entorno (`--json` / `--strict` / `--for-workflow` / `--target local|preview`); seguridad = error en `preview`, warning en `local`; nunca imprime secretos.
- Workflow manual: corre el preflight como paso **bloqueante**; inputs `enableFeedback` / `enableMetrics` / `persistGenerations`; env `INTERNAL_ACCESS_MODE=header`, `FAIL_MODE=closed`, `PROXY_TRUST_MODE=strict`; token nunca ecoado.
- CI gate: eslint incluye `scripts/ares-v6-*.ts` (la deuda lint de scripts legacy queda fuera del gate bloqueante).

### Tests (delta 3C.1)
| Suite | Casos | Nota |
|---|---:|---|
| `internal-access.test.ts` (reescrito) | 12 | detección de superficies, require en prod, override off/lab, sin leak |
| `internal-env-preflight.test.ts` (nuevo) | 7 | preview falla sin secrets; local degrada a warning; sin secretos impresos |
| `feedback-service.test.ts` | 5 | +P2002 ⇒ `ConflictError` (409) |
| `lab/v6/metrics/route.test.ts` (reescrito) | 9 | +429/503 sin DB, ventana 7d, rango>90d, until<since, key desconocida |
| `real-infra.smoke.test.ts` (ampliado) | 12 | +token interno requerido (modo header) contra infra real |

**Total v6: 258** — **246 unit** (28 archivos; smoke saltado en el gate) + **12 real-infra smoke**.

### Comandos 3C.1 (local) y resultados
```
npx eslint <5 dirs v6> scripts/ares-v6-*.ts --ext .ts,.tsx → exit 0 (0 findings)
npx tsc -p tsconfig.ares-v6.json                            → exit 0
npx vitest run <5 dirs v6> --coverage=false                 → 246 passed | 12 skipped (29 files)
real-infra.smoke (Postgres 16 + Redis 7 locales, DB efímera) → 12 passed
npm run ares:v6:verify-env -- --json (local)               → passed:true, errors:0, warnings:6
npm run ares:v6:verify-env -- --strict --target preview    → exit 1 (correcto: sin secrets no se activa)
```

### CI
Run **<pendiente>** — actualizar con el id de GitHub Actions cuando cierre verde tras el push.
