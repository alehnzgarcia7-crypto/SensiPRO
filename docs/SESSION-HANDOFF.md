# SensiPRO ARES v6 — Session Handoff

**Fecha:** 2026-06-02
**Rama:** `refactor/phase-0-nuclear-refoundation`
**PR:** [#1](https://github.com/alehnzgarcia7-crypto/SensiPRO/pull/1) — DRAFT, **MERGEABLE**
**HEAD:** (Fase 3C.1 — internal activation security patch P0)

---

## Estado

- Working tree limpio, al día con `origin`.
- Salud verde local: `eslint` v6 → 0, `tsc -p tsconfig.ares-v6.json` → 0.
- Tests: **258** = **246 unit** (28 archivos; smoke saltado en el gate) + **12 real-infra smoke** (Redis + Postgres reales, validado local).
- CI 3C: run **26803272532** → success. **3C.1: pendiente de push** (actualizar id al cerrar verde). PR #1 OPEN · DRAFT · **MERGEABLE**.

---

## Fases completas

- **0 / 0.1 / 0.1B** — Refundación, contratos, CI gate.
- **1 / 1.5** — Motor modular + quality gate.
- **2 Foundation** — Backend aislado + endpoint OFF por defecto.
- **3A — Lab Hardening** — strict Zod, rate limit, payload guard, observabilidad sin PII, access policy, lab mode (`docs/phase-3/`).
- **3B — Real-Infra Validation** — dual bucket, Redis atómico Lua, proxy trust, fail-open/closed, log salt, real-infra smoke (`docs/phase-3B/`).
- **3C — Internal Controlled Activation** — `docs/phase-3C/`:
  - **Internal access guard** (`internal-access.ts`): token SHA-256 timing-safe, modos off/header/lab, stealth 404.
  - **Persistencia controlada** (`generation-persistence.ts`): flag `ARES_V6_PERSIST_GENERATIONS` (+ `_REQUIRED`); `AresV6Generation` sin PII.
  - **Feedback v0** (`POST /api/feedback/v6`, `feedback-schema/quality/service.ts`): OFF por defecto (`ARES_V6_WRITE_FEEDBACK`), strict, 409 duplicado, anti-PII, anti-poisoning. **No recalibra el motor.**
  - **Lab metrics** (`GET /api/lab/v6/metrics`, `lab-metrics.ts`): OFF por defecto (`ARES_V6_LAB_METRICS_ENABLED`).
  - **Lab runner + cleanup** (`scripts/ares-v6-internal-lab-runner.ts`, `…-lab-cleanup.ts`; `lab-runner.ts`, `lab-cleanup.ts`).
  - **Workflow manual** `.github/workflows/ares-v6-internal-lab.yml` (workflow_dispatch + environment `ares-v6-internal-lab`).
  - **Prisma**: 3 modelos aditivos (`AresV6Generation`, `AresV6Feedback`, `AresV6LabRun`) + migración `20260602000000_ares_v6_lab` (sólo CREATE).
- **3C.1 — Internal Activation Security Patch (P0)** — `docs/phase-3C/…VALIDATION.md §9`:
  - **Cualquier** superficie v6 activa en prod exige internal token (no sólo `API_ENABLED`); `off`/`lab` explícito se ignora (→ `header`, `unsafeModeIgnored`).
  - `enforceAresV6InternalAccess` (chokepoint único en los 3 endpoints). Métricas: rate-limit (bucket `metrics`) + ventana 7d / máx 90d + tope 10k filas. Feedback `P2002` ⇒ **409**.
  - Preflight `npm run ares:v6:verify-env` (`internal-env-preflight.ts` + `scripts/ares-v6-verify-internal-env.ts`) — **bloqueante** en el workflow manual; nunca imprime secretos.

---

## Endpoints v6 (todos OFF por defecto)

- `POST /api/generate/v6` — flag → internal access → config gate → 413 → 400 → rate limit → generate → (opcional) persist.
- `POST /api/feedback/v6` — flag `ARES_V6_WRITE_FEEDBACK` → internal access → rate limit (ns `fb`) → service (404/409) → 201.
- `GET /api/lab/v6/metrics` — flag `ARES_V6_LAB_METRICS_ENABLED` → internal access → métricas agregadas.

Flags 3C: `ARES_V6_INTERNAL_ACCESS_MODE` (off/header/lab), `ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256`, `ARES_V6_PERSIST_GENERATIONS(_REQUIRED)`, `ARES_V6_WRITE_FEEDBACK`, `ARES_V6_LAB_METRICS_ENABLED`. Runbook: `docs/phase-3C/INTERNAL-CONTROLLED-ACTIVATION-RUNBOOK.md`.

---

## SIGUIENTE: Fase 3D (propuesta)

Comparativa controlada **legacy vs v6** sobre evidencia TRUSTED + decisión de calibración **asistida por humano** (nunca automática), usando los umbrales go/no-go del runbook. Sólo entonces evaluar UI experimental tras `NEXT_PUBLIC_ARES_V6_ENABLED`.

---

## Riesgos abiertos

- Activación real necesita secrets del environment `ares-v6-internal-lab` (token hash, salt, DB/Redis URLs) — código + workflow listos, secrets pendientes del operador. El environment debe **crearse y protegerse a mano** (required reviewers + prevent self-review); el preflight bloquea la activación si falta config.
- `UNKNOWN_GLOBAL` cap compartido (3B). Cleanup sin cron (manual). Runner http depende de devices en la DB del target.
- Hook Semgrep local falla por falta de `SEMGREP_APP_TOKEN` (cosmético; no afecta el gate).
