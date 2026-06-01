# ARES v6 — Lab Hardening Validation Report (Fase 3A)

**Rama:** `refactor/phase-0-nuclear-refoundation`
**Gate:** `Phase 0.1B ARES v6 Gate` (bloqueante)
**Alcance:** endurecimiento del endpoint v6 aislado. Sin tocar producción, pagos, auth, middleware, Prisma schema, UI ni rutas legacy.

---

## 1. Resumen

Fase 3A convierte el backend v6 (apagado por defecto) en un endpoint de laboratorio defendible:

- **Strict Zod** en root/player/overrides (unknown keys ⇒ 400) + dedupe de síntomas.
- **Abuse guard** por IP+deviceId sobre **Redis** (ioredis reusado), ventana 60s, 429 con `Retry-After`, fail-open explícito.
- **Payload guard** (`Content-Length > 20KB ⇒ 413`).
- **Observabilidad** estructurada con `requestId` y hashes — cero PII.
- **Access policy** boundary (device público/activo hoy; gancho para premium en 3B).
- **Lab mode** con `meta` enriquecido y testeado.
- **Harness** de comparación con flags (`--json/--preset/--all-presets/--fixture/--output`).

El endpoint sigue **OFF por defecto** (404) y no escribe feedback.

---

## 2. Tests agregados

| Suite | Casos | Cubre |
|---|---:|---|
| `src/lib/ares-v6/__tests__/request-schema.test.ts` (NEW) | 11 | happy path, unknown root/player/overrides keys, dedupe de síntomas, >5 síntomas, ppi fuera de rango, enum inválido, cuid inválido, campo requerido |
| `src/lib/ares-v6/__tests__/rate-limit.test.ts` (NEW) | 9 | key IP+deviceId vs unknown-ip, allow, exceed→429+Retry-After, unknown-ip más estricto, bucket por deviceId, reset helper, fail-open (store null + store que lanza) |
| `src/lib/ares-v6/__tests__/observability.test.ts` (NEW) | 8 | extractClientIp, requestId+ipHash (no raw), redacción anidada, métricas sin PII, evento sin body, redacción en data |
| `src/lib/ares-v6/__tests__/access-policy.test.ts` (NEW) | 6 | activo/desconocido permitido, inactivo denegado, user reservado, assert NotFound |
| `src/app/api/generate/v6/__tests__/route.test.ts` (REWRITE) | 13 | flag off (404, sin DB ni rate), 413, JSON malo, unknown key, body inválido, 429 sin Prisma, device null 404, inactivo 404, 200 completo+headers, override ppi, dedupe síntomas, labMode, requestId en error |
| `src/lib/ares-v6/__tests__/generate-service.test.ts` (+1) | 5 | (+ device inactivo ⇒ NotFound) |
| `packages/algorithms/src/engine-v6/__tests__/generate.test.ts` (+2) | 20 | (+ dpi.source = PPI / TIER_FALLBACK) |

**Total v6: 158 casos en 15 archivos** (era 114 en 11). Desglose: 91 motor + 67 backend.

---

## 3. Comandos corridos (local) y resultados

```
npm run db:generate                                                  → exit 0 (Prisma Client v5.22.0)
npx eslint packages/algorithms/src/engine-v6 src/lib/ares-v6 \
  src/app/api/generate/v6 --ext .ts,.tsx                             → exit 0 (0 findings)
npx tsc -p tsconfig.ares-v6.json                                     → exit 0 (incluye tests + src/lib/cache/redis.ts importado)
npx vitest run packages/algorithms/src/engine-v6 src/lib/ares-v6 \
  src/app/api/generate/v6 --coverage=false                           → 158 passed (15 files)
npm run ares:v6:fixtures -- --json                                   → JSON de 12 fixtures
npm run ares:v6:fixtures -- --fixture redmi-note-13                  → tabla (General 178, src PPI, HIGH)
```

> `npm ci` se valida en CI (GitHub Actions), no localmente: correrlo en local borraría el `node_modules` de trabajo. No se modificó `package.json` ni `package-lock.json`, así que `npm ci` permanece consistente.

---

## 4. Resultado del gate CI

Commit `8eaf95e` · GitHub Actions run **26784031211** → conclusión **success**
([link](https://github.com/alehnzgarcia7-crypto/SensiPRO/actions/runs/26784031211)).

- `Phase 0.1B ARES v6 Gate`: **success** (npm ci → db:generate → eslint → `tsc -p tsconfig.ares-v6.json` → vitest **158** → artifact `ci-logs-phase-0-v6-gate`).
- `Legacy Audit non-blocking debt report`: **success** (no bloqueante).
- `E2E Tests`: **skipped** (sólo en push a `main`).
- PR #1: OPEN · DRAFT · **MERGEABLE**.

El gate v6 no cambió de forma: ya lintea + typechequea (`tsconfig.ares-v6.json`) + testea los tres directorios v6, que ahora incluyen automáticamente todos los módulos nuevos. `legacy-audit` sigue **no bloqueante**; `E2E` sigue sólo en push a `main`.

---

## 5. Endpoints / superficie cubierta

- `POST /api/generate/v6` — flag off→404, payload→413, JSON→400, schema estricto→400, rate limit→429, device no existe/inactivo→404, éxito→200 con `meta` (engine, labMode, requestId, rateLimit, warnings en lab) y headers de rate limit.
- Helpers puros y testeados aislados: `getAresV6RateLimitKey`, `checkAresV6RateLimit`, `createAresV6RequestContext`, `redactAresV6LogPayload`, `buildAresV6GenerationMetrics`, `canGenerateForDevice`, `assertCanGenerateForDevice`.

---

## 6. Riesgos restantes

- **Rate limit sólo post-validación (no pre-parse).** Un flood puede forzar parse+Zod (barato, ≤20KB, fail-fast) pero nunca DB/engine. Un throttle por IP a nivel edge/middleware se difiere a 3B (cuando el endpoint se exponga de verdad) para no compartir bucket entre devices.
- **`x-forwarded-for` es spoofeable.** Aceptable en lab; en exposición real debe confiarse sólo en el header inyectado por el proxy/CDN (Cloudflare/Vercel).
- **Fail-open en Redis caído.** Decisión de lab (disponibilidad > bloqueo). En producción debe revisarse fail-closed o un fallback distribuido.
- **`ppiSource` colapsa a `PPI`/`TIER_FALLBACK`** vía API porque el adapter promueve `screenDpi`→`ppi`. Es intencional (regla de oro Fase 2); se documenta.
- **Sólo mock-tested.** Falta smoke contra DB real y Redis real (Fase 3B).
- **Hook local de Semgrep** falla en cada Write/Edit por falta de `SEMGREP_APP_TOKEN` (cosmético; los archivos se escriben y el gate no depende de él).
- **`tsx`** sigue resolviéndose vía `npx` (no es devDependency declarada); el harness es lab-only y no forma parte del gate, así que no afecta `npm ci`.

---

## 7. Deuda para Fase 3B

- Smoke test contra DB real + Redis real (validar el path no-mockeado del limiter).
- Feedback loop (`/api/feedback/v6`) detrás de `ARES_V6_WRITE_FEEDBACK`.
- UI experimental oculta detrás de `NEXT_PUBLIC_ARES_V6_ENABLED`.
- Throttle por IP a nivel edge/middleware + decisión fail-open vs fail-closed.
- Comparativa legacy vs v6 sobre datos reales + métricas (rating ≥ 4.3, p95 < 700ms) y rollout gradual.

---

## 8. Lo que NO se tocó (confirmado)

Pagos, Stripe, MercadoPago, webhooks, auth, NextAuth, middleware, command-center, admin APIs, pricing, landing, academy, UI del generador, schema Prisma, migrations, y las rutas legacy `/api/generate`, `/api/generate/all`, `/api/generate/headshot`, `/api/export`. El motor legacy sigue intacto y el gate legacy permanece no bloqueante.
