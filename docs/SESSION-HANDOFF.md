# SensiPRO ARES v6 — Session Handoff

**Fecha:** 2026-06-01
**Rama:** `refactor/phase-0-nuclear-refoundation`
**PR:** [#1](https://github.com/alehnzgarcia7-crypto/SensiPRO/pull/1) — DRAFT, **MERGEABLE**
**HEAD:** `6c99302` (+ commit de este handoff)

---

## Estado

- Working tree limpio, al día con `origin`.
- Salud verde: `eslint` v6 → 0, `tsc -p tsconfig.ares-v6.json` → 0.
- Tests: **190** = 181 unit (18 archivos; smoke saltado en el gate) + **9 real-infra smoke** (Redis + Postgres reales).
- CI: run **26795777050** → **success** ([link](https://github.com/alehnzgarcia7-crypto/SensiPRO/actions/runs/26795777050)).
  `Phase 0.1B ARES v6 Gate` = success (bloqueante); **`ARES v6 Real-Infra Smoke` = success** (Postgres 16 + Redis 7 service containers); `legacy-audit` = success (no bloqueante); `E2E` = skipped.

---

## Fases completas

- **Fase 0 / 0.1 / 0.1B** — Refundación, contratos, CI gate.
- **Fase 1 / 1.5** — Motor modular + quality gate.
- **Fase 2 Foundation** — Backend aislado + endpoint OFF por defecto.
- **Fase 3A — Lab Hardening** — strict Zod, rate limit (single bucket), payload guard, observabilidad sin PII, access policy, lab mode (`docs/phase-3/`).
- **Fase 3B — Real-Infra Validation** — `docs/phase-3B/`:
  - **Dual bucket** (cierra bypass por rotación de deviceId): IP_GLOBAL + IP_DEVICE / UNKNOWN_GLOBAL + UNKNOWN_DEVICE.
  - **Redis atómico** (Lua EVAL, TTL garantizado; reusa ioredis de `src/lib/cache/redis.ts`).
  - **Proxy trust** (`proxy-trust.ts`): vercel/strict/lab; XFF no se confía a ciegas.
  - **Fail mode** (`rate-limit-policy.ts`): open (lab) / closed (beta-prod → 503).
  - **Log salt policy** (`observability-policy.ts`): salt ≥16 requerido en prod con API on, o 503.
  - **Real-infra smoke** (`__tests__/real-infra.smoke.test.ts`, gated por `ARES_V6_REAL_INFRA_SMOKE`) + job CI con service containers + seed (`testing/seed-real-infra.ts`, `scripts/ares-v6-seed-smoke.ts`, `npm run db:push:test`).

---

## Endpoint v6 (OFF por defecto)

- `POST /api/generate/v6` — 404 si `ARES_V6_API_ENABLED !== 'true'`.
- Pipeline: flag → config gate (503 si falta salt en prod) → 413 → 400 (JSON) → 400 (strict Zod) → rate limit (429 / fail-closed 503, **antes** de Prisma) → generate.
- Flags: `ARES_V6_API_ENABLED`, `ARES_V6_LAB_MODE`, `ARES_V6_PROXY_TRUST_MODE` (vercel/strict/lab), `ARES_V6_RATE_LIMIT_FAIL_MODE` (open/closed), `ARES_V6_RATE_LIMIT_*` (límites), `ARES_V6_LOG_SALT`, `ARES_V6_REAL_INFRA_SMOKE`.

---

## SIGUIENTE: Fase 3C (propuesta) — Internal Controlled Activation

Activar `ARES_V6_API_ENABLED=true` SÓLO en interno/preview (no prod pública) con `FAIL_MODE=closed`, `PROXY_TRUST_MODE=strict`, `LOG_SALT` fuerte; dashboards sobre los eventos/métricas existentes; feedback loop `/api/feedback/v6` tras `ARES_V6_WRITE_FEEDBACK`; primeras muestras por fixture antes de exposición pública.

---

## Riesgos abiertos

- **UNKNOWN_GLOBAL** es un cap compartido para todo el tráfico no confiable (posible ruido bajo carga real).
- **Proxy trust** en prod (Cloudflare→Vercel): usar `strict` o header confiable configurado.
- **Fail-closed** hace de Redis una dependencia dura (503 si cae) → health-checks/alertas.
- Smoke usa `prisma db push` contra DB efímera (no migraciones productivas).
- Hook Semgrep local falla por falta de `SEMGREP_APP_TOKEN` (cosmético; no afecta el gate).
