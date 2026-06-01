# SensiPRO ARES v6 — Session Handoff

**Fecha:** 2026-06-01
**Rama:** `refactor/phase-0-nuclear-refoundation`
**PR:** [#1](https://github.com/alehnzgarcia7-crypto/SensiPRO/pull/1) — DRAFT, **MERGEABLE**
**HEAD:** `8eaf95e` (+ commit de este handoff)

---

## Estado

- Working tree limpio, al día con `origin`.
- Salud verde: `npx eslint … v6` → 0, `npx tsc -p tsconfig.ares-v6.json` → 0.
- Tests: **158 passed (15 files)** — `npx vitest run packages/algorithms/src/engine-v6 src/lib/ares-v6 src/app/api/generate/v6 --coverage=false` (91 motor + 67 backend).
- CI: GitHub Actions run **26784031211** → conclusión **success**
  ([link](https://github.com/alehnzgarcia7-crypto/SensiPRO/actions/runs/26784031211)).
  `Phase 0.1B ARES v6 Gate` = success (bloqueante); `legacy-audit` = success (no bloqueante); `E2E Tests` = skipped.

---

## Fases completas

- **Fase 0** — Refundación nuclear: docs + contratos del motor v6.
- **Fase 0.1 / 0.1B** — Infra CI (`scripts/ci-runner.mjs`) + gate v6 bloqueante.
- **Fase 1 / 1.5** — Motor modular (orquestador + 10 módulos) + quality gate (`tsconfig.ares-v6.json`, LAB_VERIFIED con tolerancia PPI, fix S24 Ultra).
- **Fase 2 Foundation** — Backend aislado: `src/lib/ares-v6/` + endpoint `POST /api/generate/v6` (OFF por defecto, adapter que nunca pierde `screenDpi`).
- **Fase 3A — Lab Hardening** — `docs/phase-3/*`. Endurece el endpoint (sigue OFF):
  - **Strict Zod** (root/player/overrides `.strict()`) + dedupe de síntomas.
  - **Rate limit** `src/lib/ares-v6/rate-limit.ts` por IP+deviceId sobre **Redis** (reusa el ioredis de `src/lib/cache/redis.ts` vía `getRedisClient()`), 60s, 20/8, 429 + `Retry-After`, **fail-open** en lab, corre **antes** de Prisma.
  - **Payload guard** (`Content-Length > 20KB ⇒ 413`).
  - **Observabilidad** `observability.ts` (requestId + hashes, eventos, métricas, redacción) — **cero PII**.
  - **Access policy** `access-policy.ts` (device activo=público; inactivo⇒NotFound; `user` reservado).
  - **api-errors.ts** (envelopes + headers). **lab mode** en `meta`. **dpi.source** expuesto en el motor.
  - **Harness** `scripts/ares-v6-compare-fixtures.ts` con flags (`--json/--preset/--all-presets/--fixture/--output`).

---

## Endpoint v6

- `POST /api/generate/v6` — **apagado por defecto** (`ARES_V6_API_ENABLED !== 'true'` ⇒ 404).
- Pipeline: flag → 413 (payload) → 400 (JSON) → 400 (strict Zod) → 429 (rate limit, pre-Prisma) → generate.
- No toca legacy ni pagos/auth/middleware/UI/schema. No escribe feedback.

---

## SIGUIENTE: Fase 3B (propuesta)

- Smoke test contra **DB real + Redis real** (validar el path no-mockeado del limiter).
- Feedback loop `/api/feedback/v6` detrás de `ARES_V6_WRITE_FEEDBACK`.
- UI experimental detrás de `NEXT_PUBLIC_ARES_V6_ENABLED`.
- Throttle por IP a nivel edge/middleware + decisión fail-open vs fail-closed.
- Comparativa legacy vs v6 + rollout gradual.

---

## Riesgos abiertos

- **(a) Rate limit post-validación** (no pre-parse): un flood fuerza parse+Zod (barato, ≤20KB) pero nunca DB/engine. Throttle edge → 3B.
- **(b) `x-forwarded-for` spoofeable:** en exposición real confiar sólo en el header del proxy/CDN.
- **(c) Fail-open si Redis cae:** decisión de lab; revisar fail-closed en producción.
- **(d) Sólo mock-tested:** falta smoke contra DB/Redis reales (3B).
- **(e) Hook Semgrep local** falla por falta de `SEMGREP_APP_TOKEN` (cosmético; no afecta el gate).
