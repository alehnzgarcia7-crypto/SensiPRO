# Fase 3E — Hidden Internal Read-Only UI · Validación

**Rama:** `refactor/phase-0-nuclear-refoundation` · PR #1 (DRAFT)
**Fecha:** 2026-06-03

---

## 1. Acceptance criteria

| # | Criterio | Estado |
|---|---|---|
| 1 | Ruta interna oculta existe (`/internal/ares-v6`) | ✅ |
| 2 | UI OFF por defecto | ✅ (`ARES_V6_INTERNAL_UI_ENABLED` ≠ `true` ⇒ 404) |
| 3 | Flag server requerido | ✅ (`isAresV6InternalUiEnabled`) |
| 4 | NEXT_PUBLIC por sí solo NO da acceso | ✅ (test) |
| 5 | Sin nav público / sitemap / SEO | ✅ (sitemap manual; `/internal/` en robots disallow; cero links) |
| 6 | `metadata` noindex | ✅ (layout + page) |
| 7 | Read-only | ✅ (sin escrituras DB/feedback/motor) |
| 8 | Sin acción de aplicar propuesta | ✅ (panel read-only; sin botón) |
| 9 | Sin feedback público | ✅ |
| 10 | Preview muestra sensibilidad/HUD/botón/confianza/explicación/tuning | ✅ |
| 11 | Evidencia: cobertura evidencia y comparación **separadas** | ✅ (test render) |
| 12 | StructuralRisk visible | ✅ (visible aun bajo NO_GO; BLOCKING ⇒ banner) |
| 13 | Propuestas: `humanReviewRequired` y `autoApplyAllowed=false` | ✅ (test) |
| 14 | Sin JSON crudo como UI primaria | ✅ (cards/barras/badges) |
| 15 | Tests de servicio/componentes/seguridad | ✅ (45 nuevos) |
| 16 | CI verde | ✅ (run **26919718496** → success) |
| 17 | PR mergeable | ✅ (OPEN · DRAFT · **MERGEABLE** · CLEAN) |
| 18 | No se tocó legacy/pagos/auth/middleware/engine | ✅ (diff 100% aditivo) |

---

## 2. Archivos

### Creados — backend (server-only, `src/lib/ares-v6/`)
- `internal-ui-flags.ts` — gate server + hint público + modo + estado de flags.
- `internal-ui-access.ts` — `assertCanViewAresV6InternalUi` (deny inyectable) + estado + operator context.
- `internal-ui-service.ts` — view models: dashboard / preview / evidencia (summary-only) / propuestas / opciones.
- `internal-preview-service.ts` — preview Result-typed (valida enums, sin persistencia).

### Creados — componentes (`src/components/ares-v6-lab/`)
- `presenters.ts` (puro), `primitives.tsx`, `badges.tsx`, `generation-preview-card.tsx`,
  `evidence-cards.tsx`, `proposal-panel.tsx`, `fixture-preset-selector.tsx` (cliente),
  `generation-console.tsx` (cliente), `lab-shell.tsx`, `index.ts`.

### Creados — ruta (`src/app/internal/ares-v6/`)
- `layout.tsx`, `page.tsx`, `actions.ts`, `loading.tsx`, `not-found.tsx`, `error.tsx`.

### Creados — tests
- `src/lib/ares-v6/__tests__/internal-ui-flags.test.ts` (9)
- `src/lib/ares-v6/__tests__/internal-ui-access.test.ts` (8)
- `src/lib/ares-v6/__tests__/internal-ui-service.test.ts` (8)
- `src/lib/ares-v6/__tests__/internal-preview-service.test.ts` (4)
- `src/components/ares-v6-lab/__tests__/presenters.test.ts` (8)
- `src/components/ares-v6-lab/__tests__/components.test.tsx` (8, `react-dom/server`)

### Creados — docs
- `docs/phase-3E/HIDDEN-UI-ARCHITECTURE.md`, `OPERATOR-GUIDE.md`, `HIDDEN-UI-VALIDATION.md` (este).

### Modificados (infra/wiring, no-frozen)
- `tsconfig.ares-v6.json` — include de `src/app/internal/ares-v6` + `src/components/ares-v6-lab` (`.ts`/`.tsx`) + `jsx: react-jsx`.
- `vitest.config.ts` — `esbuild.jsx: 'automatic'` + include de `*.test.tsx`.
- `.github/workflows/ci.yml` — gate lint+test añaden las 2 dirs nuevas.
- `src/app/robots.ts` — `/internal/` al disallow.
- `.gitignore` — artefactos `ares-v6-evidence-*`.

---

## 3. Tests

| Test | Qué prueba | Tipo |
|---|---|---|
| `internal-ui-flags.test.ts` | gate server único; NEXT_PUBLIC solo no habilita; modo OFF/LAB/PRODUCTION; estado sin secretos | unit |
| `internal-ui-access.test.ts` | OFF⇒block; dev/test⇒allow; prod sin ack⇒block; prod con ack⇒allow; deny inyectado; operator context sin token | unit |
| `internal-ui-service.test.ts` | opciones; preview (6 sliders); evidencia ev≠cmp + **summary-only sin vectores**; propuestas invariantes; dashboard sin secreto | unit |
| `internal-preview-service.test.ts` | valid⇒ok; access denegado/enum inválido⇒error **sin construir**; sin persistencia | unit |
| `presenters.test.ts` | tonos/labels MX; 6 filas sensibilidad/gyro; formatters; bar 1–200 | unit |
| `components.test.tsx` | 6 sliders; **coverage ev vs cmp separada**; BLOCKING⇒banner; propuestas read-only; **sin token en HTML** | render (`renderToStaticMarkup`) |

**Total v6: 402 = 383 unit + 19 real-infra smoke** (antes 357 = 338 + 19; **+45 unit**).

> Sin jsdom ni `@testing-library`: la lógica de componentes se prueba con presenters
> puros (node) + render con `react-dom/server` (`renderToStaticMarkup`), habilitado por
> `esbuild.jsx:'automatic'` en la config de vitest. Cero dependencias nuevas.

---

## 4. Comandos (local) y resultados

```bash
npx tsc -p tsconfig.ares-v6.json                                                    # 0 errores
npx eslint <5 dirs v6> src/app/internal/ares-v6 src/components/ares-v6-lab \
  scripts/ares-v6-*.ts --ext .ts,.tsx                                               # 0 errores
npx vitest run <engine-v6 + lib/ares-v6 + generate/v6 + feedback/v6 + lab/v6 \
  + internal/ares-v6 + components/ares-v6-lab> --coverage=false                     # 383 passed, 19 skipped
npm run ares:v6:evidence -- --fixtures-only --legacy-compare --summary-only --json  # NO_GO_MORE_DATA · REVIEW_REQUIRED · evCov=0 cmpCov=1
# real-infra smoke (DB efímera local, role alex, Postgres 16 + Redis 7):            # 19 passed
```

Resultado evidencia (fixtures-only, consistente con la UI):
`NO_GO_MORE_DATA · structuralRisk=REVIEW_REQUIRED · evCov=0 cmpCov=1 · cmp=45(dang=0,rev=0)`.

---

## 5. CI

- Commits: `ddbb3e7` (backend), `cbab70e` (componentes), `c5a836b` (ruta), `4b8db90` (CI wiring), `d8c8c5f` (docs).
- Run de Actions: **26919718496** → **success**.
- `Phase 0.1B ARES v6 Gate`: **success** (gate lint/tsc/test ahora cubre `src/app/internal/ares-v6` +
  `src/components/ares-v6-lab`). `ARES v6 Real-Infra Smoke`: **success**. `Legacy Audit`: success (no bloqueante). `E2E Tests`: skipped (main-only).
- PR #1: OPEN · DRAFT · **MERGEABLE** (CLEAN).

---

## 6. GO / NO-GO

- ✅ **GO** — UI **interna oculta read-only** entregada, OFF por defecto, gateada server-side,
  noindex, sin nav/sitemap, sin auto-aplicar, sin feedback público, sin tocar el motor.
- ⛔ **NO-GO** — **UI pública**: requiere lab interno activado con evidencia real,
  `evidenceFixtureCoverage ≥ 0.8`, `structuralRisk = CLEAR`, `GO_INTERNAL_UI_EXPERIMENT`,
  y decisión humana explícita.

### Próxima fase (3F) — criterios sugeridos
- Activar lab interno (3C runbook) → evidencia real persistida.
- Re-evaluar GO/NO-GO con `evidenceCoverage` real.
- Si GO sostenido + `structuralRisk=CLEAR`: diseñar **UI experimental pública behind flag**
  (aún detrás de decisión humana), reutilizando estos componentes read-only como base.
