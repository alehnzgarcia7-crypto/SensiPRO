# SensiPRO ARES v6 — Session Handoff

**Fecha:** 2026-06-02
**Rama:** `refactor/phase-0-nuclear-refoundation`
**PR:** [#1](https://github.com/alehnzgarcia7-crypto/SensiPRO/pull/1) — DRAFT, **MERGEABLE**
**HEAD:** (Fase 3C + commit de este handoff)

---

## Estado

- Working tree limpio, al día con `origin`.
- Salud verde local: `eslint` v6 → 0, `tsc -p tsconfig.ares-v6.json` → 0.
- Tests: **239** = **228 unit** (28 archivos; smoke saltado en el gate) + **11 real-infra smoke** (Redis + Postgres reales, validado local).
- CI: ver run id en `docs/phase-3C/INTERNAL-CONTROLLED-ACTIVATION-VALIDATION.md` (§4).

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

- Activación real necesita secrets del environment `ares-v6-internal-lab` (token hash, salt, DB/Redis URLs) — código + workflow listos, secrets pendientes del operador.
- `UNKNOWN_GLOBAL` cap compartido (3B). Cleanup sin cron (manual). Runner http depende de devices en la DB del target.
- Hook Semgrep local falla por falta de `SEMGREP_APP_TOKEN` (cosmético; no afecta el gate).
