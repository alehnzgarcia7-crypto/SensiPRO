# ARES v6 — Evidence Review Validation (Fase 3D)

**Rama:** `refactor/phase-0-nuclear-refoundation`
**Gates:** `Phase 0.1B ARES v6 Gate` (bloqueante) + `ARES v6 Real-Infra Smoke` (Postgres 16 + Redis 7). `legacy-audit` no bloqueante.

---

## 1. Resumen

- Comparador legacy-vs-v6 (`legacy-vs-v6-comparator.ts`): deltas + severidad + dirección + expectedness; fixtures-only, puro.
- Adapter legacy (`legacy-output-adapter.ts`): usa el motor legacy real congelado vía costura inyectable; import-debt evaluado y seguro.
- Umbrales + GO/NO-GO (`evidence-thresholds.ts`): versionados, precedencia INFRA → MORE_DATA → FIX_ENGINE.
- Evidence snapshot (`evidence-snapshot.ts`): ensambla métricas + comparación + feedback TRUSTED + GO/NO-GO; LEGACY-FREE en runtime; SUSPICIOUS excluido por defecto.
- Propuestas (`calibration-proposals.ts`): human-gated, `autoApplyAllowed:false` siempre; gates de infra/muestra/suspicious/fallback; artefacto JSON (sin modelo Prisma).
- CLI (`scripts/ares-v6-evidence-review.ts` + `evidence-review-cli.ts`): JSON + markdown; safe dry-run por defecto; sin tokens/PII.
- Endpoint opcional `GET /api/lab/v6/evidence`: READ-ONLY, OFF por defecto, surface flag 3C.1, rate-limit ns `evidence`.

---

## 2. Tests

| Suite | Casos | Tipo |
|---|---|---|
| `evidence-thresholds.test.ts` | 13 | unit |
| `legacy-output-adapter.test.ts` | 8 | unit |
| `legacy-vs-v6-comparator.test.ts` | 8 | unit |
| `evidence-snapshot.test.ts` | 7 | unit |
| `calibration-proposals.test.ts` | 7 | unit |
| `evidence-review-cli.test.ts` | 8 | unit |
| `real-infra.smoke.test.ts` (Evidence tribunal 3D) | +1 | smoke (real DB) |

Total proyecto v6: **310** = **297 unit** + **13 real-infra smoke** (antes 258 = 246 + 12; +51 unit, +1 smoke).

Casos cubiertos (mission): GO con todos los umbrales; muestra baja ⇒ MORE_DATA; infra falla ⇒ INFRA; rating/outcome malo ⇒ FIX_ENGINE; SUSPICIOUS excluido; fallbackPpi bloquea propuesta; fila DANGEROUS detectada (sniperScope>scope4x, scope4x>scope2x); TODO_ROJO redPoint bajo ⇒ review; fallbackPpi ⇒ review (no propuesta); CLI JSON sin token/body/IP; markdown generado; propuestas con `humanReviewRequired:true` y `autoApplyAllowed:false`; NO_LEGACY_EQUIVALENT marcado.

---

## 3. Comandos corridos (local) y resultados

```bash
npm run db:generate
npx eslint packages/algorithms/src/engine-v6 src/lib/ares-v6 src/app/api/generate/v6 src/app/api/feedback/v6 src/app/api/lab/v6 scripts/ares-v6-*.ts --ext .ts,.tsx   # 0 errores
npx tsc -p tsconfig.ares-v6.json                                                                                                                                  # 0 errores
npx vitest run packages/algorithms/src/engine-v6 src/lib/ares-v6 src/app/api/generate/v6 src/app/api/feedback/v6 src/app/api/lab/v6 --coverage=false               # 297 passed, 13 skipped

npm run ares:v6:evidence -- --fixtures-only --legacy-compare --json --output ares-v6-evidence-summary.json
npm run ares:v6:evidence -- --fixtures-only --legacy-compare --markdown --output ares-v6-evidence-report.md
npm run ares:v6:evidence -- --fixtures-only --legacy-compare --proposals --json   # decision NO_GO_MORE_DATA (sin DB), 45 filas, 0 dangerous, propuesta NO_CHANGE bloqueada INSUFFICIENT_SAMPLE
```

### Real-infra smoke (local, DB efímera)

```bash
createdb sensipro_ares_v6_smoke
DATABASE_URL=postgresql://…/sensipro_ares_v6_smoke REDIS_URL=redis://localhost:6379 ARES_V6_REAL_INFRA_SMOKE=true \
  ARES_V6_API_ENABLED=true ARES_V6_PERSIST_GENERATIONS=true ARES_V6_WRITE_FEEDBACK=true ARES_V6_LAB_METRICS_ENABLED=true … \
  npm run db:push:test && npm run ares:v6:seed:smoke
npx vitest run src/lib/ares-v6/__tests__/real-infra.smoke.test.ts --coverage=false   # 13 passed
dropdb sensipro_ares_v6_smoke
```

Verificado en los logs: generaciones persistidas con PPI real (no fallback), feedback TRUSTED (rating 5/BETTER) y SUSPICIOUS (rating 2/WORSE+resuelto ⇒ `OUTCOME_RESOLVED_CONFLICT`), métricas servidas, snapshot construido, propuestas human-gated; **cero IP/UA/token/body crudo** (solo `ipHash`/`userAgentHash`).

---

## 4. Resultado de CI

- Commit: `2a206fb` (rama `refactor/phase-0-nuclear-refoundation`).
- Run de Actions: **26845969669** → **success**.
- `Phase 0.1B ARES v6 Gate`: **success**.
- `ARES v6 Real-Infra Smoke`: **success** (Postgres 16 + Redis 7).
- `Legacy Audit`: success (no bloqueante). `E2E Tests`: skipped (solo en push a main).
- PR #1: OPEN · DRAFT · **MERGEABLE**.

---

## 5. Seguridad / privacidad (verificado)

- Artefactos y endpoint sin tokens, sin IP cruda, sin user-agent, sin body, sin cookies (el modelo de evidencia carece de esos campos; test de CLI lo afirma).
- `ARES_V6_LAB_EVIDENCE_ENABLED` añadido a las surface flags 3C.1 ⇒ exige internal token en producción; un `off`/`lab` explícito se ignora.
- Endpoint OFF por defecto (404), rate-limit antes de DB, ventana acotada (7d/90d).
- Comparación legacy-vs-v6 es fixtures-only y puro; el motor legacy se importa en una sola costura y, en el endpoint, de forma perezosa solo bajo `includeLegacyCompare`.

---

## 6. Riesgos restantes

- GO/NO-GO con muestra real requiere activación interna (secrets del environment `ares-v6-internal-lab`) — código + workflow listos; sin DB real, la evidencia es fixtures-only ⇒ MORE_DATA por diseño.
- El mapeo preset→estilo legacy es una aproximación (3 estilos vs 20 presets); 4 presets v6-only se marcan `NO_LEGACY_EQUIVALENT`.
- Las propuestas son hipótesis: requieren A/B y revisión humana antes de cualquier cambio de motor.
- Hook Semgrep local falla sin `SEMGREP_APP_TOKEN` (cosmético; no afecta el gate).

---

## 7. Recomendación Fase 3E

Con GO/NO-GO en verde sobre evidencia interna real, evaluar **UI experimental oculta** tras `NEXT_PUBLIC_ARES_V6_ENABLED` (solo lectura, behind flag, sin reemplazar el generador legacy), con la decisión de activación siempre HUMANA.

---

## 8. Lo que NO se tocó (confirmado)

pagos/Stripe/MercadoPago/webhooks, auth/NextAuth, middleware, command-center, admin, pricing, landing, academy, UI del generador, rutas legacy (`/api/generate`, `/all`, `/headshot`, `/export`), engine/presets/research-matrix de v6, y el motor legacy (solo lectura vía adapter). Schema sin cambios (sin modelo de propuestas). Sin deployment público.
