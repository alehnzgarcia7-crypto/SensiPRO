# SensiPRO ARES v6 — Session Handoff

**Fecha:** 2026-06-03
**Rama:** `refactor/phase-0-nuclear-refoundation`
**PR:** [#1](https://github.com/alehnzgarcia7-crypto/SensiPRO/pull/1) — DRAFT, **MERGEABLE**
**HEAD:** (Fase 3E — Hidden Internal Read-Only UI · ARES v6 Command Lab)

---

## Estado

- **Fase 3E ENTREGADA** ✅ — primera UI experimental de ARES v6: interna, oculta y **solo lectura** en `/internal/ares-v6`. Gate server-side `ARES_V6_INTERNAL_UI_ENABLED` (404 stealth si off; en prod exige `ARES_V6_INTERNAL_UI_ALLOW_PRODUCTION`); `NEXT_PUBLIC_ARES_V6_ENABLED` solo hint de cliente. noindex, sin nav/sitemap. Muestra generación v6, evidencia summary-only, cobertura EVIDENCIA vs COMPARACIÓN separada, riesgo estructural, GO/NO-GO y propuestas human-gated (`autoApplyAllowed=false`). **No** toca motor/legacy/pagos/auth/middleware; diff 100% aditivo. Consume los contratos 3D sin reimplementarlos. CI 3E: run **26919718496** → **success** (`Phase 0.1B ARES v6 Gate` + `ARES v6 Real-Infra Smoke`). PR #1 OPEN · DRAFT · **MERGEABLE**.
- **Fase 3D.1B SELLADA** ✅ — contrato del endpoint `GET /api/lab/v6/evidence` cerrado (`evidence-query-schema.ts` + `evidence-route-service.ts`); path 200 probado a nivel unit.
- Salud verde local: `eslint` (7 dirs v6, incl. `internal/ares-v6` + `components/ares-v6-lab`) → 0, `tsc -p tsconfig.ares-v6.json` → 0.
- Tests: **402** = **383 unit** (45 archivos) + **19 real-infra smoke** (validado local con DB efímera, role `alex`). +45 unit en 3E.
- CI 3D.1B: run **26858197075** → **success**. PR #1 OPEN · DRAFT · **MERGEABLE**.

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
- **3E — Hidden Internal Read-Only UI** — `docs/phase-3E/`:
  - **Ruta** `/internal/ares-v6` (Server Components; un solo island cliente). Gate server `internal-ui-access.ts::assertCanViewAresV6InternalUi` (404 stealth si off; prod exige `ARES_V6_INTERNAL_UI_ALLOW_PRODUCTION`). `internal-ui-flags.ts` (NEXT_PUBLIC solo hint). `internal-ui-service.ts` (view models server-only) + `internal-preview-service.ts` (preview Result-typed, sin persistencia). Server action read-only `actions.ts`.
  - **Componentes** `src/components/ares-v6-lab/` (`presenters.ts` puro + cards). Evidencia **summary-only** (sin vectores), cobertura EVIDENCIA vs COMPARACIÓN separada, riesgo estructural visible, propuestas `autoApplyAllowed=false`/`humanReviewRequired=true` sin botón de aplicar.
  - **Tests:** +45 unit (flags/access/service/preview/presenters + render `react-dom/server`). Sin jsdom/`@testing-library`. CI gate + tsconfig.ares-v6 + vitest amplían a `internal/ares-v6` + `components/ares-v6-lab`.

---

## Endpoints v6 (todos OFF por defecto)

- `POST /api/generate/v6` — flag → internal access → config gate → 413 → 400 → rate limit → generate → (opcional) persist.
- `POST /api/feedback/v6` — flag `ARES_V6_WRITE_FEEDBACK` → internal access → rate limit (ns `fb`) → service (404/409) → 201.
- `GET /api/lab/v6/metrics` — flag `ARES_V6_LAB_METRICS_ENABLED` → internal access → métricas agregadas.
- `GET /api/lab/v6/evidence` — flag `ARES_V6_LAB_EVIDENCE_ENABLED` → internal access → rate limit (ns `evidence`) → snapshot agregado (sin filas crudas).
- `GET /internal/ares-v6` (UI, no API) — flag `ARES_V6_INTERNAL_UI_ENABLED` → `assertCanViewAresV6InternalUi` (404 si off; prod requiere `_ALLOW_PRODUCTION`) → dashboard read-only. Server action `previewAresV6GenerationAction` re-gateado, sin persistencia.

Flags 3C: `ARES_V6_INTERNAL_ACCESS_MODE` (off/header/lab), `ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256`, `ARES_V6_PERSIST_GENERATIONS(_REQUIRED)`, `ARES_V6_WRITE_FEEDBACK`, `ARES_V6_LAB_METRICS_ENABLED`. Flag 3D: `ARES_V6_LAB_EVIDENCE_ENABLED` (surface flag 3C.1 → exige token en prod). Flags 3E: `ARES_V6_INTERNAL_UI_ENABLED` (gate server único), `ARES_V6_INTERNAL_UI_ALLOW_PRODUCTION` (acuse deployment-protection en prod), `NEXT_PUBLIC_ARES_V6_ENABLED` (solo hint cliente, NUNCA seguridad). Runbook: `docs/phase-3C/INTERNAL-CONTROLLED-ACTIVATION-RUNBOOK.md §8`.

---

## SIGUIENTE: Fase 3F — Activación del lab interno + evaluación para UI pública

3E entregada (UI interna oculta read-only) ⇒ fase activa siguiente: **3F**. Objetivo: **activar el lab interno real** (3C runbook: secrets del environment `ares-v6-internal-lab`, persistencia de generaciones, feedback TRUSTED) para mover `evidenceFixtureCoverage` de 0 (fixtures-only) a evidencia real, re-evaluar GO/NO-GO, y — sólo si hay GO sostenido con `structuralRisk=CLEAR` y **decisión humana explícita** — diseñar la **UI experimental pública behind flag** reutilizando los componentes read-only de 3E como base. La UI de 3E NO es pública; sigue OFF por defecto. Ver `docs/phase-3E/HIDDEN-UI-VALIDATION.md §6`.

---

## Riesgos abiertos

- Activación real necesita secrets del environment `ares-v6-internal-lab` (token hash, salt, DB/Redis URLs) — código + workflow listos, secrets pendientes del operador. El environment debe **crearse y protegerse a mano** (required reviewers + prevent self-review); el preflight bloquea la activación si falta config.
- `UNKNOWN_GLOBAL` cap compartido (3B). Cleanup sin cron (manual). Runner http depende de devices en la DB del target.
- Hook Semgrep local falla por falta de `SEMGREP_APP_TOKEN` (cosmético; no afecta el gate).
