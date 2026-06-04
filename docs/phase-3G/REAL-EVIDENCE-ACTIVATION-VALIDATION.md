# Fase 3G — Real Evidence Activation · Validación

**Rama:** `refactor/phase-0-nuclear-refoundation` · PR #1 (DRAFT)
**Gates:** `Phase 0.1B ARES v6 Gate` (bloqueante) + `ARES v6 Real-Infra Smoke`. `legacy-audit` no bloqueante.

---

## 1. Criterios de aceptación

| # | Criterio | Estado |
|---|---|---|
| 1 | `target-url-check` existe (lib + CLI) | ✅ |
| 2 | `validate-real-evidence` existe (lib + CLI) | ✅ |
| 3 | El workflow genera `ares-v6-real-execution-mode.json` | ✅ |
| 4 | El workflow corre target-check cuando hay `targetUrl` (gatea) | ✅ |
| 5 | El workflow corre validate-real-evidence | ✅ |
| 6 | El workflow sigue manual-only (`workflow_dispatch`) | ✅ |
| 7 | Environment protegido requerido (`ares-v6-internal-lab`) | ✅ |
| 8 | Feedback default `false` | ✅ |
| 9 | Persist default `true` | ✅ |
| 10 | Sin secretos en artifacts (scanner + sanitizer) | ✅ |
| 11 | Dry-run NO puede reclamar evidencia real (NO_GO_MORE_EVIDENCE) | ✅ |
| 12 | Real mode con evCov=0 falla | ✅ |
| 13 | Packet sigue DRAFT sin humano | ✅ |
| 14 | Docs 3G creados | ✅ |
| 15 | Tests verdes (local) | ✅ |
| 16 | CI verde | ⏳ (se sella con el run id tras push) |
| 17 | PR mergeable | ⏳ |
| 18 | Sin cambios al motor | ✅ |
| 19 | Sin cambios a legacy | ✅ |
| 20 | Nada público activado | ✅ |

## 2. Tests (delta 3G)

| Suite | Casos | Tipo |
|---|---|---|
| `target-url-check.test.ts` | 13 | unit (contrato URL + redacción) |
| `real-evidence-validation.test.ts` | 16 | unit (modo, validador, secret scan) |
| `human-review-session.test.ts` | +6 | unit (execution mode + finalización) |
| `workflow-safety.test.ts` | +5 | static (steps 3G + defaults) |

Total v6: **497** = **478 unit** + **19 real-infra smoke** (antes 457 = 438 + 19; +40 unit).

## 3. Comandos corridos (local) y resultados

```
npm run db:generate                          → ok
npx eslint <7 dirs v6> scripts/ares-v6-*.ts  → 0 errores
npx tsc -p tsconfig.ares-v6.json             → exit 0
npx vitest run <7 dirs v6> --coverage=false  → 478 passed | 19 skipped (497)
```

### Real-infra smoke (local, DB efímera)
```
createdb sensipro_ares_v6_smoke (role alex) → db:push:test → ares:v6:seed:smoke →
ARES_V6_REAL_INFRA_SMOKE=true vitest real-infra.smoke.test.ts → 19 passed → dropdb
```

### Demostración de los CLIs 3G (dry-run)
```
ares:v6:target-check --target-url https://example.com --json   → passed=true, mode=real-http, redacted=https://example.com
ares:v6:ui-readiness --json --target local                     → passed=false (local sin flags — correcto)
ares:v6:evidence --fixtures-only --legacy-compare --summary-only → NO_GO_MORE_DATA, evCov=0
ares:v6:human-review --evidence-json ... (fixtures-only)        → recommended=NO_GO_MORE_EVIDENCE, status=DRAFT
ares:v6:validate-real-evidence --mode dry-run-local ...          → passed=true,  rec=NO_GO_MORE_EVIDENCE  (NO-GO válido)
ares:v6:validate-real-evidence --mode real-http (fixtures-only)  → passed=false                          (real rechaza fixtures-only)
```

## 4. Resultado de CI

- `Phase 0.1B ARES v6 Gate`: ⏳ run ____ (se sella tras push).
- `ARES v6 Real-Infra Smoke`: ⏳ run ____.
- PR #1: ⏳ MERGEABLE.

## 5. Seguridad / privacidad (verificado)

- El `targetUrl` nunca se imprime crudo: el checker emite sólo `redactedTargetUrl`
  (scheme://host/path, query enmascarada, sin credenciales).
- El packet lleva sólo `targetUrlRedacted`; el sanitizer redacta valores secret-looking.
- El validador escanea cada artifact por secretos (64-hex, bearer, claves sensibles)
  y falla si encuentra uno.
- `NEXT_PUBLIC_*` no es seguridad; el gate sigue server-side; en prod además acuse
  `_ALLOW_PRODUCTION` + deployment protection real verificada por un humano.
- El probe de reachability es **warning-only** (un preview protegido responde 401/403).

## 6. Lo que NO se tocó (confirmado)

pagos/Stripe/MercadoPago/webhooks, auth/NextAuth, middleware, command-center, admin,
pricing, landing, academy, UI del generador, rutas legacy (`/api/generate`, `/all`,
`/headshot`, `/export`), engine-v6 (curves/presets/research-matrix/calibration) y el
motor legacy. Schema sin cambios. Sin deployment público. La UI sigue OFF/oculta.

## 7. GO / NO-GO de 3G

- ✅ **GO** para que el operador ejecute el workflow real con un `targetUrl`
  protegido, una vez configurados environment + secrets + Vercel Deployment Protection.
- ⛔ **NO-GO** para closed-beta hasta que exista un Human Review Packet **FINAL** con
  evidencia real (`evidenceFixtureCoverage > 0` y ≥ umbral, `structuralRisk=CLEAR`,
  smoke OK, deployment protection verificada) + firma humana (`decidedBy` + `rationale`).

## 8. Siguiente fase

- **3G-B** si falta evidencia (recolectar más generaciones/feedback reales y repetir).
- **3H** (diseño de closed-beta, detrás de flag, NO pública) sólo si el packet FINAL
  da `GO_PREPARE_CLOSED_BETA_DESIGN`.
