# Fase 3F — Internal UI Execution + Human Review · Arquitectura

**Nombre:** Internal UI Execution + Human Review Session + Evidence Readiness Packet
**Fecha:** 2026-06-03
**Postura:** interna · oculta · **solo lectura** · OFF por defecto · evidencia-primero · decisión humana

---

## 1. Qué es Fase 3F

3E construyó la UI interna oculta. **3F la convierte en una sesión de revisión de
producto**: endurece la UI antes de uso real, verifica entorno/secrets/protección,
ejecuta smoke E2E + lab runner + evidence report, y produce un **Human Review
Packet** que termina en una **decisión GO/NO-GO humana, documentada, sin modificar
el motor**.

### Qué NO es 3F

- NO UI pública · NO reemplaza legacy · NO aplica propuestas · NO recalibra el motor.
- NO abre feedback a usuarios · NO toca pagos/auth/middleware/webhooks · NO rollout.

### Principio rector

**Evidence first, human decides, no automatic calibration.** El sistema
RECOMIENDA; un humano APRUEBA. Si `evidenceCoverage=0` o `structuralRisk≠CLEAR`, el
reporte lo dice — no se maquilla (ver §8 de la misión: *No hidden claims*).

---

## 2. Endurecimiento (Task 1) — `server-only`

P1 de 3E cerrado: se agregó `import 'server-only'` a los módulos **exclusivos del
runtime de servidor de Next**, para que un Client Component que los importe en
runtime falle en build.

| Con `server-only` (route/page-only) | Sin `server-only` (importados por CLIs tsx) |
|---|---|
| `internal-ui-flags.ts` | `lab-metrics.ts` |
| `internal-ui-access.ts` | `evidence-snapshot.ts` |
| `internal-ui-service.ts` | `calibration-proposals.ts` |
| `internal-preview-service.ts` | |
| `evidence-route-service.ts` | |
| `feedback-service.ts` | |
| `generation-persistence.ts` | |

**Por qué la columna derecha se omite (a propósito):** esos módulos los importa el
**CLI de evidencia** (`scripts/ares-v6-evidence-review.ts`) que corre bajo **tsx/node
SIN la condición `react-server`**. Ahí el export `default` de `server-only` **lanza**
al importarse. Marcarlos rompería `npm run ares:v6:evidence`. Documentado, no oculto.

**Mecánica:** Next resuelve `server-only` vía la condición de export `react-server`
(no-op en server, módulo que lanza en client). En **vitest** (node, sin esa
condición) se usa un **alias a un stub vacío** (`tests/stubs/server-only.ts` en
`vitest.config.ts`), así los tests importan estos módulos sin lanzar, mientras Next
mantiene la protección real en el build de la app. Los Client Components siguen
importando **solo tipos** (`import type`, borrado en compilación).

---

## 3. UI Execution Readiness (Task 2)

`src/lib/ares-v6/internal-ui-readiness.ts` + `scripts/ares-v6-ui-readiness.ts`.

Verificación PURA sobre un `env` inyectable, específica para correr la UI real.
Severidad: **error** para `preview`/`production`, **warning** para `local` (dry-run).

```bash
npm run ares:v6:ui-readiness -- --json --target local
npm run ares:v6:ui-readiness -- --strict --target preview --ui-only
npm run ares:v6:ui-readiness -- --strict --target production --with-persistence
```

Modos: `--target local|preview|production`, `--json`, `--strict`, `--for-workflow`,
`--ui-only`, `--with-feedback`, `--with-persistence`. Salida: `{ passed, errors[],
warnings[], checks[], checklist[] }` — **sin valores secretos**. Exit 1 en `--strict`
con errores.

Comprueba: `ARES_V6_INTERNAL_UI_ENABLED` (gate, error si off), ack de producción
(`ARES_V6_INTERNAL_UI_ALLOW_PRODUCTION`), evidencia/api/persistencia/feedback,
fail-mode `closed`, proxy `strict`, log salt ≥16, token hash 64 hex, DATABASE/REDIS.
Emite un **checklist humano** (la protección de deployment NO es verificable por env
— es un ítem obligatorio que un humano confirma).

> **NEXT_PUBLIC no es seguridad.** La readiness lo reporta como nota informativa y
> **nunca** lo cuenta como criterio de paso.

---

## 4. Smoke de la UI oculta (Task 3)

Dos capas (ver `INTERNAL-UI-SMOKE-VALIDATION.md`):

1. **SSR smoke (always-on, en el gate):** `src/app/internal/ares-v6/__tests__/internal-ui-ssr-smoke.test.tsx`.
   Prueba a nivel React (sin browser): flag-off ⇒ guard niega + 404 genérico (no
   revela el lab); flag-on ⇒ render con todas las secciones, **sin** controles de
   aplicar/publicar/aprobar/recalibrar, **sin** secretos en el HTML.
2. **Playwright browser smoke (manual / 3F.1):** `playwright.internal-ui.config.ts`
   (config dedicada, `testMatch **/*.pw.ts`, webServer con `ARES_V6_INTERNAL_UI_ENABLED=true`)
   + `tests/e2e-internal-ui/ares-v6-internal-ui.pw.ts`. `npm run ares:v6:ui:smoke`.
   Corre en el workflow manual 3F; **no** en el gate de PR (no se fuerza Playwright
   pesado en cada PR).

---

## 5. Sesión humana + packet (Tasks 4–5)

- `src/lib/ares-v6/human-review-session.ts` — modelo PURO: `SessionPlan` (12 fixtures),
  `Finding`, `Decision`, `evaluateAresV6HumanReviewReadiness` (recomendación),
  `buildAresV6HumanReviewPacket`, `sanitizeAresV6HumanReviewPacket`. **Sin DB nueva**
  (artefactos JSON/MD).
- `src/lib/ares-v6/human-review-cli.ts` — arg parsing + extracción Zod del evidence
  report + render Markdown.
- `scripts/ares-v6-human-review-session.ts` — CLI: lee artefactos, produce
  `human-review-packet.json` + `.md`.

```bash
npm run ares:v6:human-review -- \
  --evidence-json ares-v6-evidence-summary.json \
  --lab-report-json ares-v6-internal-lab-report.json \
  --operator alex --label fase-3f --json --markdown \
  --output human-review-packet.json
```

**Invariantes:** sin secretos (sanitizer redacta tokens/64-hex/Bearer), sin DB
write, **sin GO automático** si falta evidencia. La decisión es **FINAL** sólo con
`decidedBy` + `rationale`; de lo contrario queda **DRAFT** con una recomendación.

---

## 6. Workflow manual (Task 6)

`.github/workflows/ares-v6-internal-review-session.yml` — `workflow_dispatch` **only**,
environment **`ares-v6-internal-lab`** (protegido: required reviewers).

Inputs: `operator` (req), `label`, `targetUrl`, `preset`, `runUiSmoke`, `runEvidence`,
`includeProposals`, `enableFeedback` (default false), `persistGenerations`.

Pasos: checkout → ci → db:generate → db:push → **preflight env** (`verify-env --strict`)
→ **ui-readiness** (`--strict`) → **lab runner** → **UI smoke** (Playwright, opcional,
`continue-on-error`) → **evidence review** (`--from-db --legacy-compare`) → **human
review packet** → upload artifacts.

**Seguridad del workflow:** inputs del operador se pasan SOLO como argv citados
(arrays bash), nunca por un shell que re-parsee (sin `bash -c "$ARGS"`). Secrets en
`env:`, jamás impresos. `ARES_V6_API_ENABLED` sólo `true` con `targetUrl` (modo http).

> **Honestidad de la evidencia:** el lab en **modo local-service NO persiste
> generaciones** (sólo el resumen de la corrida). Por eso `evidence --from-db` en
> local da `evidenceCoverage=0`. La evidencia **real** requiere **modo http**
> (`targetUrl`) contra un target que persista vía la ruta. El packet lo refleja.

---

## 7. Modelo de seguridad (resumen)

- Gate server `ARES_V6_INTERNAL_UI_ENABLED` (404 stealth si off); prod exige ack
  `ARES_V6_INTERNAL_UI_ALLOW_PRODUCTION` + **protección de deployment real**
  (Vercel auth/password/trusted IPs) verificada por un humano.
- `NEXT_PUBLIC_ARES_V6_ENABLED` jamás protege.
- Sin token/IP/UA/body/cookies en logs ni artefactos. Sanitizer en el packet.
- Read-only: sin aplicar/aprobar/publicar; feedback OFF por defecto.

---

## 8. Kill switch / rollback

- `ARES_V6_INTERNAL_UI_ENABLED=false` ⇒ la ruta responde **404** inmediatamente
  (la page es `force-dynamic`; el flag se lee por request, sin rebuild).
- Las superficies API (`generate/feedback/metrics/evidence`) siguen OFF por flag.
- No hay migración ni estado que revertir (artefactos JSON/MD descartables).

Ver `HUMAN-REVIEW-PROTOCOL.md`, `INTERNAL-UI-SMOKE-VALIDATION.md`,
`GO-NO-GO-DECISION-TEMPLATE.md`.
