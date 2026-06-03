# SensiPRO ARES v6 — Session Handoff

**Fecha:** 2026-06-02
**Rama:** `refactor/phase-0-nuclear-refoundation`
**PR:** [#1](https://github.com/alehnzgarcia7-crypto/SensiPRO/pull/1) — DRAFT, **MERGEABLE**
**HEAD:** (Fase 3D.1B — Evidence Endpoint Contract Patch + False-Positive Test Killer)

---

## Estado

- Working tree limpio, al día con `origin`.
- Salud verde local: `eslint` v6 → 0, `tsc -p tsconfig.ares-v6.json` → 0.
- Tests: **357** = **338 unit** (39 archivos; smoke saltado en el gate) + **19 real-infra smoke** (Redis + Postgres reales, validado local con DB efímera).
- CI 3D.1B: run **PENDIENTE** (se registra tras `gh run watch`). Base 3D.1: run **26855946578** → success. PR #1 OPEN · DRAFT · esperado **MERGEABLE**.

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
- **3D — Evidence Review & Calibration Governance** — `docs/phase-3D/`:
  - **Comparador legacy-vs-v6** (`legacy-vs-v6-comparator.ts`): deltas/severidad/dirección/expectedness, fixtures-only, puro. **Adapter legacy** (`legacy-output-adapter.ts`): usa el motor legacy real congelado vía costura inyectable (import-debt evaluado y seguro).
  - **Umbrales + GO/NO-GO** (`evidence-thresholds.ts`): versionados; INFRA → MORE_DATA → FIX_ENGINE. **Evidence snapshot** (`evidence-snapshot.ts`): métricas + comparación + feedback TRUSTED + decisión; LEGACY-FREE en runtime; SUSPICIOUS excluido por defecto.
  - **Propuestas human-gated** (`calibration-proposals.ts`): `autoApplyAllowed:false` SIEMPRE; gates infra/muestra/suspicious/fallback; artefacto JSON (sin modelo Prisma). **El feedback NUNCA recalibra el motor.**
  - **CLI** `npm run ares:v6:evidence` (`scripts/ares-v6-evidence-review.ts` + `evidence-review-cli.ts`): JSON/markdown, safe dry-run, sin tokens/PII.
  - **Endpoint opcional** `GET /api/lab/v6/evidence` (READ-ONLY, OFF por defecto). **Workflow manual** ampliado + gate sube `ares-v6-evidence-summary.json`/`.md`.
- **3D.1 — Evidence Integrity Patch** — `docs/phase-3D/EVIDENCE-INTEGRITY-PATCH.md`:
  - **Cobertura separada:** `evidenceFixtureCoverage` (DB real, gatea GO) vs `comparisonFixtureCoverage` (fixtures-only, informativo). `fixtureCoverage`/`coveredFixtures` quedan como alias deprecated de evidencia. Nuevos `evidence-fixture-coverage.ts` + `evidence-repository.ts` (counts con brand/model/slug).
  - **Riesgo estructural** (`structuralRisk`: CLEAR/REVIEW_REQUIRED/BLOCKING) separado del GO/NO-GO; **visible aunque la decisión sea MORE_DATA** y primero en next-actions.
  - **Endpoint**: `presetId` validado contra `ARES_V6_PRESETS` (400); `compareScope=filtered|all`; `includeRows` (default false ⇒ `highRiskSummaryRows` sin vectores/deltas; true ⇒ cap 100). CLI: `--compare-scope`/`--include-rows`/`--summary-only`.
  - **Propuestas**: nuevos bloqueos `EVIDENCE_COVERAGE_INSUFFICIENT` / `STRUCTURAL_RISK_REVIEW_REQUIRED`. Versiones snapshot/thresholds/report/proposal **3D.2**. `autoApplyAllowed:false` invariante.
- **3D.1B — Evidence Endpoint Contract Patch** — `docs/phase-3D/EVIDENCE-INTEGRITY-PATCH.md §8`:
  - **Contrato compartido** `evidence-query-schema.ts` (route + CLI misma semántica) + **service testeable** `evidence-route-service.ts` (route = shell delgado). Warning **máquina** `comparison_not_filtered_by_preset`. `meta.rowsIncluded/rowsLimit/rowsTruncated`.
  - **Mata-falsos-positivos:** `evidence-route-service.test.ts` prueba el **path 200 sin DB/Redis** (comparador llamado con `{presetId}` vs `{}`; default sin vectores/deltas; includeRows cap 100); `evidence-query-schema.test.ts` afirma que `compareScope=sideways` falla con `field='compareScope'` (enum reconocido, no unknown key). Honestidad: la 3D.1 ya implementaba el contrato pero sólo lo probaba en smoke; 3D.1B lo prueba a nivel unit.

---

## Endpoints v6 (todos OFF por defecto)

- `POST /api/generate/v6` — flag → internal access → config gate → 413 → 400 → rate limit → generate → (opcional) persist.
- `POST /api/feedback/v6` — flag `ARES_V6_WRITE_FEEDBACK` → internal access → rate limit (ns `fb`) → service (404/409) → 201.
- `GET /api/lab/v6/metrics` — flag `ARES_V6_LAB_METRICS_ENABLED` → internal access → métricas agregadas.
- `GET /api/lab/v6/evidence` — flag `ARES_V6_LAB_EVIDENCE_ENABLED` → internal access → rate limit (ns `evidence`) → snapshot agregado (sin filas crudas).

Flags 3C: `ARES_V6_INTERNAL_ACCESS_MODE` (off/header/lab), `ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256`, `ARES_V6_PERSIST_GENERATIONS(_REQUIRED)`, `ARES_V6_WRITE_FEEDBACK`, `ARES_V6_LAB_METRICS_ENABLED`. Flag 3D: `ARES_V6_LAB_EVIDENCE_ENABLED` (surface flag 3C.1 → exige token en prod). Runbook: `docs/phase-3C/INTERNAL-CONTROLLED-ACTIVATION-RUNBOOK.md §8`.

---

## SIGUIENTE: Fase 3E (propuesta)

Con GO/NO-GO en verde sobre evidencia interna real (activación interna del lab), evaluar **UI experimental oculta** tras `NEXT_PUBLIC_ARES_V6_ENABLED` (solo lectura, behind flag, sin reemplazar el generador legacy). La decisión de activación sigue siendo **humana**. Ver `docs/phase-3D/EVIDENCE-REVIEW-VALIDATION.md §7`.

---

## Riesgos abiertos

- Activación real necesita secrets del environment `ares-v6-internal-lab` (token hash, salt, DB/Redis URLs) — código + workflow listos, secrets pendientes del operador. El environment debe **crearse y protegerse a mano** (required reviewers + prevent self-review); el preflight bloquea la activación si falta config.
- `UNKNOWN_GLOBAL` cap compartido (3B). Cleanup sin cron (manual). Runner http depende de devices en la DB del target.
- Hook Semgrep local falla por falta de `SEMGREP_APP_TOKEN` (cosmético; no afecta el gate).
