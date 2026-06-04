# SensiPRO ARES v6 — Session Handoff

**Fecha:** 2026-06-04
**Rama:** `refactor/phase-0-nuclear-refoundation`
**PR:** [#1](https://github.com/alehnzgarcia7-crypto/SensiPRO/pull/1) — DRAFT, **MERGEABLE**
**HEAD:** (Fase 3G — Real Evidence Activation · CI run ⏳ pendiente de sellar)

---

## Estado

- **Fase 3G ENTREGADA** ✅ (Real Evidence Activation + Protected Preview Human Review) — el **contrato de activación real**, sin tocar runtime de endpoints ni motor. (1) **Target URL contract** (`target-url-check.ts` + `ares:v6:target-check`): valida `targetUrl` (HTTPS, no localhost/loopback, no `user:pass@`, no `?token/secret/session/bearer/auth=`), **redacción primero** (nunca emite la URL cruda), reachability como **probe warning-only** (un preview protegido responde 401/403). Emite `ares-v6-real-execution-mode.json` (`real-http` si hay targetUrl válido, `dry-run-local` si no). (2) **Real-evidence validator** (`real-evidence-validation.ts` + `ares:v6:validate-real-evidence`): auditor escéptico — en `real-http` exige evidencia **no** fixtures-only, `evidenceFixtureCoverage>0`, `totalGenerations>0`, packet presente, recomendación basada en evidencia real, gates de closed-beta y **cero secretos** (escáner 64-hex/bearer/claves); en `dry-run-local` exige `NO_GO_MORE_EVIDENCE` y prohíbe closed-beta. (3) **Packet hardening** (schema `3G`): bloque `execution` (executionMode + targetUrlRedacted + deploymentProtectionVerified), `dry-run-local` **nunca** recomienda closed-beta, y FINAL **bloqueado** (queda DRAFT con `finalizationBlockedReasons`) si un GO va sobre un bloqueador o un closed-beta sin cobertura/CLEAR/deployment/smoke. (4) **Workflow** `ares-v6-internal-review-session.yml`: modo real cuando hay `targetUrl`; nuevos steps target-check (gate, argv citado) + validate-real-evidence (gate, **falla el run** en real sin evidencia real); sube `*-real-execution-mode/*-target-url-check/*-real-evidence-validation.json`. (5) Docs `docs/phase-3G/*` (runbook + operator guide + GO/NO-GO + validation). **+40 unit tests** (target-url-check 13, real-evidence-validation 16, human-review +6, workflow-safety +5). **No** toca motor/legacy/pagos/auth/middleware; **0** modelos Prisma nuevos; UI sigue OFF/oculta. **CI verde ≠ aprobación.** CI 3G: run ⏳ (pendiente de sellar). PR #1 OPEN · DRAFT.
- **Fase 3F.1 ENTREGADA** ✅ (Pre-Activation Seal) — blindaje antes de 3G. (1) **server-only seal COMPLETO**: los 12 módulos críticos ahora llevan `import 'server-only'` (se agregaron los 5 tsx-shared: `internal-ui-readiness`, `human-review-session`, `human-review-cli`, `lab-metrics`, `evidence-snapshot`). Los 4 scripts CLI que los importan corren con **`npx tsx --conditions=react-server`** → `server-only` no-op en el CLI, protección real en Next; salida de evidencia **byte-idéntica** (cero cambio de números). (2) **token hash hex real** en readiness (`/^[a-f0-9]{64}$/i`, no sólo length 64). (3) **workflow argv safety**: los steps con inputs ya NO pasan por `ci-runner` (que usa `shell:true`); corren `npm` directo con **arrays bash citados** + `| tee` (`if/fi`, no `&&`). (4) docs `PRE-ACTIVATION-SEAL.md` + `OPERATOR-PRE-3G-CHECKLIST.md` (21 ítems). (5) tests: `server-only-boundary` (12 módulos marcados + 0 runtime-imports de cliente), `workflow-safety` (no bash-c/eval/`-- $VAR`), token hash hex. **CI verde ≠ aprobación**; closed-beta sólo con evidencia real + decisión humana. CI 3F.1: run **26974739905** → **success** (`Phase 0.1B ARES v6 Gate` + `ARES v6 Real-Infra Smoke`; confirma `--conditions=react-server` en CI). PR #1 OPEN · DRAFT · **MERGEABLE**.
- **Fase 3F ENTREGADA** ✅ — de "UI construida" a "sesión interna controlada con evidencia + revisión humana + decisión documentada". (1) **server-only** en los 7 módulos route/page-only (`internal-ui-*`, `evidence-route-service`, `feedback-service`, `generation-persistence`); lab-metrics/evidence-snapshot/calibration-proposals **se omiten a propósito** (los importa el CLI de evidencia bajo tsx, donde `server-only` lanzaría) — alias a stub vacío en vitest, Next mantiene la protección real. (2) **UI readiness** (`internal-ui-readiness.ts` + `ares:v6:ui-readiness`): pura sobre env, deployment-protection como **checklist humano** (no protección real), sin secretos. (3) **Human review session** (`human-review-session.ts` + `human-review-cli.ts` + `ares:v6:human-review`): packet JSON/MD, recomendación → decisión **DRAFT hasta `decidedBy`+`rationale`**; evidenceCoverage=0 ⇒ NO_GO_MORE_EVIDENCE; sin DB nueva, sin secretos. (4) **SSR smoke** always-on + **Playwright browser smoke** (config dedicada `*.pw.ts`, manual). (5) **Workflow manual** `ares-v6-internal-review-session.yml` (workflow_dispatch, environment protegido, inputs como argv citado — sin inyección). **No** UI pública, **no** aplica propuestas, **no** toca motor/legacy/pagos/auth/middleware; diff aditivo (+1 dep `server-only`). CI 3F: run **26923217585** → **success** (`Phase 0.1B ARES v6 Gate` + `ARES v6 Real-Infra Smoke`). PR #1 OPEN · DRAFT · **MERGEABLE**.
- **Fase 3E SELLADA** ✅ — UI interna oculta read-only `/internal/ares-v6` (run CI **26919718496**).
- **Fase 3D.1B SELLADA** ✅ — contrato del endpoint `GET /api/lab/v6/evidence` cerrado; path 200 probado a nivel unit.
- Salud verde local: `eslint` (7 dirs v6 + `scripts/ares-v6-*.ts`) → 0, `tsc -p tsconfig.ares-v6.json` → 0.
- Tests: **497** = **478 unit** (58 archivos) + **19 real-infra smoke** (validado local con DB efímera, role `alex`). +40 unit en 3G (target-url-check, real-evidence-validation, human-review execution/finalización, workflow-safety 3G).

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
- **3F — Internal UI Execution + Human Review** — `docs/phase-3F/`:
  - **server-only** (cierra P1 3E) en `internal-ui-flags/access/service/preview` + `evidence-route-service`/`feedback-service`/`generation-persistence`; `lab-metrics`/`evidence-snapshot`/`calibration-proposals` **OMITIDOS** (los importa el CLI de evidencia bajo tsx → `server-only` lanzaría). Alias vitest a stub vacío; Next mantiene la protección real.
  - **UI readiness** (`internal-ui-readiness.ts`, `ares:v6:ui-readiness`): pura sobre env, deployment-protection como checklist humano, sin secretos, exit 1 en `--strict` con errores. **Human review** (`human-review-session.ts` + `human-review-cli.ts`, `ares:v6:human-review`): packet JSON/MD, **DRAFT hasta `decidedBy`+`rationale`**, evidenceCoverage=0 ⇒ NO_GO_MORE_EVIDENCE, sin DB nueva, sanitizer de secretos.
  - **SSR smoke** always-on (gate) + **Playwright** `*.pw.ts` (config dedicada, `ares:v6:ui:smoke`, manual). **Workflow** `ares-v6-internal-review-session.yml` (workflow_dispatch, env `ares-v6-internal-lab`, inputs como argv citado — sin inyección).
  - **Tests:** +24 unit (readiness/human-review/cli + SSR smoke). +1 dep `server-only` (0.0.1).

---

## Endpoints v6 (todos OFF por defecto)

- `POST /api/generate/v6` — flag → internal access → config gate → 413 → 400 → rate limit → generate → (opcional) persist.
- `POST /api/feedback/v6` — flag `ARES_V6_WRITE_FEEDBACK` → internal access → rate limit (ns `fb`) → service (404/409) → 201.
- `GET /api/lab/v6/metrics` — flag `ARES_V6_LAB_METRICS_ENABLED` → internal access → métricas agregadas.
- `GET /api/lab/v6/evidence` — flag `ARES_V6_LAB_EVIDENCE_ENABLED` → internal access → rate limit (ns `evidence`) → snapshot agregado (sin filas crudas).
- `GET /internal/ares-v6` (UI, no API) — flag `ARES_V6_INTERNAL_UI_ENABLED` → `assertCanViewAresV6InternalUi` (404 si off; prod requiere `_ALLOW_PRODUCTION`) → dashboard read-only. Server action `previewAresV6GenerationAction` re-gateado, sin persistencia.

Flags 3C: `ARES_V6_INTERNAL_ACCESS_MODE` (off/header/lab), `ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256`, `ARES_V6_PERSIST_GENERATIONS(_REQUIRED)`, `ARES_V6_WRITE_FEEDBACK`, `ARES_V6_LAB_METRICS_ENABLED`. Flag 3D: `ARES_V6_LAB_EVIDENCE_ENABLED` (surface flag 3C.1 → exige token en prod). Flags 3E: `ARES_V6_INTERNAL_UI_ENABLED` (gate server único), `ARES_V6_INTERNAL_UI_ALLOW_PRODUCTION` (acuse deployment-protection en prod), `NEXT_PUBLIC_ARES_V6_ENABLED` (solo hint cliente, NUNCA seguridad). Runbook: `docs/phase-3C/INTERNAL-CONTROLLED-ACTIVATION-RUNBOOK.md §8`.

---

## SIGUIENTE: el operador corre el workflow real → (eventual) Fase 3H

3G entregó el **contrato de activación real** (target-url-check + validate-real-evidence + packet `execution`/finalización + workflow en modo real + docs `docs/phase-3G/*`). Lo que sigue **NO es código** sino una **acción de operador/ops**: tras pasar `docs/phase-3F/OPERATOR-PRE-3G-CHECKLIST.md` (environment protegido + secrets + **Vercel Deployment Protection** verificada a mano), ejecutar el **workflow manual** `ares-v6-internal-review-session.yml` con un `targetUrl` apuntando a un **preview protegido** que **persista generaciones** (modo `real-http`), para **mover `evidenceFixtureCoverage` de 0** a evidencia real y producir un Human Review Packet con datos reales. El run **fallará en rojo** (NO-GO honesto) si no hay evidencia real todavía. **Fase 3H** = **diseño** de closed-beta (detrás de flag, NO pública) y SÓLO si existe un packet **FINAL** con `GO_PREPARE_CLOSED_BETA_DESIGN` sostenido (`structuralRisk=CLEAR`, cobertura/feedback ≥ umbral, smoke OK, deployment protection verificada) + firma humana (`decidedBy`+`rationale`). Si falta evidencia: **3G-B** (recolectar más y repetir). **CI verde ≠ aprobación.** La UI sigue OFF/oculta. Ver `docs/phase-3G/*` y `docs/phase-3F/*`.

---

## Riesgos abiertos

- Activación real necesita secrets del environment `ares-v6-internal-lab` (token hash, salt, DB/Redis URLs) — código + workflow listos, secrets pendientes del operador. El environment debe **crearse y protegerse a mano** (required reviewers + prevent self-review); el preflight bloquea la activación si falta config.
- `UNKNOWN_GLOBAL` cap compartido (3B). Cleanup sin cron (manual). Runner http depende de devices en la DB del target.
- Hook Semgrep local falla por falta de `SEMGREP_APP_TOKEN` (cosmético; no afecta el gate).
