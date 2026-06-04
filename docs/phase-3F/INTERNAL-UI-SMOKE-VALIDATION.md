# Fase 3F — Validación de la UI oculta (smoke)

Dos capas de smoke. La SSR corre siempre (gate); la de browser corre manual.

---

## 1. SSR smoke (always-on · en el gate)

`src/app/internal/ares-v6/__tests__/internal-ui-ssr-smoke.test.tsx` — render a nivel
React con `react-dom/server` (sin jsdom, sin browser). Cubierto por el gate
(`Phase 0.1B ARES v6 Gate`).

| Caso | Aserción |
|---|---|
| Flag off → stealth | `getAresV6InternalUiAccessState().ok === false`; el guard niega (404); el 404 contiene "Página no encontrada" y **NO** "ARES v6" / "Command Lab". |
| Flag on → render | render del shell contiene: SensiPRO Command Lab, Consola de generación, Cobertura de EVIDENCIA, Cobertura de COMPARACIÓN, Riesgo estructural, Nunca auto-aplicar. |
| Sin controles peligrosos | el HTML NO matchea `aplicar propuesta` / `publicar` / `aprobar` / `recalibrar` / `feedback público`. |
| Sin secretos | el HTML NO contiene token / 64-hex / `x-ares-v6-lab-token` / `bearer`. |

---

## 2. Playwright browser smoke (manual · 3F.1)

Config dedicada `playwright.internal-ui.config.ts` (`testMatch **/*.pw.ts`,
`testDir tests/e2e-internal-ui`, webServer = `next dev` con
`ARES_V6_INTERNAL_UI_ENABLED=true`). Spec
`tests/e2e-internal-ui/ares-v6-internal-ui.pw.ts`.

```bash
npm run ares:v6:ui:smoke      # arranca next dev con el flag y corre el browser smoke
```

Aserciones (flag ON vía webServer):
1. Renderiza el command lab + secciones requeridas.
2. Los dos `select` (fixture/preset) existen y son seleccionables; cambiar preset no rompe (preview se actualiza).
3. **No** hay botón aplicar/publicar/aprobar/recalibrar/feedback-público.
4. El contenido de la página **no** incluye token/64-hex/DATABASE_URL/REDIS_URL/x-ares.

**Aislamiento:** nombrado `*.pw.ts` (no `*.spec.ts`/`*.test.ts`) para que vitest
nunca lo recoja; config separada de `playwright.config.ts` (testDir `./e2e`) para
no entrar al job e2e main-only ni al gate de PR.

**Flag-OFF (404 stealth)** se prueba en la capa SSR (no requiere un segundo
servidor en el browser).

### Por qué no es obligatorio en el gate de PR

El browser smoke arranca `next dev` + instala chromium — pesado y lento para cada
PR. Corre en el **workflow manual 3F** (`runUiSmoke`, `continue-on-error`) y
localmente bajo demanda. La SSR smoke (rápida, determinista) cubre el gate.

---

## 3. Cómo el smoke entra al packet

El workflow escribe un `ares-v6-ui-smoke.json` simple (`{ ran, passed }`) a partir
del `outcome` del paso Playwright, y el CLI de human-review lo lee con
`--ui-smoke-json`. Si el smoke falla, el packet recomienda **NO_GO_FIX_BLOCKERS**.

---

## 4. Estado de validación local (esta entrega)

```
tsc -p tsconfig.ares-v6.json                       # 0 errores
eslint <7 dirs v6 + scripts/ares-v6-*.ts>          # 0 errores
vitest <gate dirs>                                 # 407 passed, 19 skipped
real-infra smoke (DB efímera local)                # 19 passed
ares:v6:ui-readiness --json --target local         # passed=true (warnings esperadas en local)
ares:v6:evidence --fixtures-only --summary-only    # NO_GO_MORE_DATA · evCov=0
ares:v6:human-review --dry-run (sobre la evidencia) # recommended=NO_GO_MORE_EVIDENCE · status=DRAFT
```

Browser Playwright: validado a nivel de config + spec (compila/lint). La ejecución
del browser (chromium + next dev) corre en el workflow manual / 3F.1; no se ejecutó
en el gate de PR a propósito.

### CI 3F

- Run de Actions: **26923217585** → **success** (`Phase 0.1B ARES v6 Gate` +
  `ARES v6 Real-Infra Smoke`; `Legacy Audit` no bloqueante; `E2E Tests` skipped main-only).
- PR #1: OPEN · DRAFT · **MERGEABLE** (CLEAN). El workflow manual de sesión
  `ares-v6-internal-review-session.yml` NO se dispara en push (workflow_dispatch only).
