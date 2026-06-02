# ARES v6 — Evidence Review Architecture (Fase 3D)

**Rama:** `refactor/phase-0-nuclear-refoundation`
**Estado:** tribunal de evidencia interno. NO es UI, NO es rollout, NO es recalibración automática.

> Fase 3D compara legacy vs ARES v6, cruza evidencia interna TRUSTED y produce propuestas de calibración que un humano debe aprobar. **Ninguna propuesta se aplica automáticamente.** El motor, los presets y la research-matrix NO se modifican.

---

## 1. Por qué existe Fase 3D

| Necesidad | Mitigación 3D |
|---|---|
| Saber qué tan distinto es legacy vs v6 | Comparador `legacy-vs-v6-comparator.ts` por fixture×preset |
| Distinguir diferencia buena / mala / esperada | Reglas de `expectedness` (EXPECTED / NEEDS_REVIEW / DANGEROUS) |
| Decidir si v6 merece UI experimental oculta | Umbrales versionados + `evaluateAresV6GoNoGo` |
| Evitar data poisoning | Feedback SUSPICIOUS excluido por defecto |
| No tocar el motor por feedback | Propuestas human-gated, `autoApplyAllowed: false` SIEMPRE |
| Muestra pequeña ⇒ no cambiar el motor | Gates de tamaño de muestra bloquean propuestas |

Disciplina científica: **una muestra pequeña produce hipótesis, no cambios de motor.** Toda calibración requiere propuesta + justificación + aprobación humana.

---

## 2. Módulos nuevos

```
src/lib/ares-v6/
  evidence-thresholds.ts        # umbrales versionados + GO/NO-GO (puro)
  legacy-output-adapter.ts      # única costura al motor legacy congelado (inyectable)
  legacy-vs-v6-comparator.ts    # deltas, severidad, dirección, expectedness (puro, fixtures-only)
  evidence-snapshot.ts          # ensambla métricas + comparación + feedback + GO/NO-GO (LEGACY-FREE)
  calibration-proposals.ts      # propuestas human-gated, NUNCA auto-aplica (artefacto JSON)
  evidence-review-cli.ts        # parser + orquestación + renderers (puro)
scripts/
  ares-v6-evidence-review.ts    # wrapper CLI (npm run ares:v6:evidence)
src/app/api/lab/v6/evidence/
  route.ts                      # GET interno READ-ONLY, OFF por defecto (opcional)
```

Sin modelos Prisma nuevos: las propuestas son artefactos JSON (ver `CALIBRATION-GOVERNANCE.md §6`). No hay ALTER/DROP ni cambios al schema.

---

## 3. Comparador legacy-vs-v6 (`legacy-vs-v6-comparator.ts`)

- **Apples-to-apples:** ambos motores devuelven el mismo vector de 6 sliders en la **misma escala 1–200**. Un jugador neutral (3 dedos, STANDARD, BATTLE_ROYALE) fija todo excepto el **preset**, que es la variable.
- **Deltas:** absoluto y relativo por slider. **Dirección:** `V6_HIGHER` / `V6_LOWER` / `SAME` (|Δ| ≤ 3). **Severidad:** `NONE` ≤ 3, `LOW` ≤ 8, `MEDIUM` ≤ 15, `HIGH` > 15.
- **Expectedness (OB53-aware):**
  - `EXPECTED` — v6 General ~170–185 en PPI mainstream cuando legacy daba ~100 (recalibración v6); AWM por debajo de redPoint.
  - `DANGEROUS` — `sniperScope > scope4x`; `scope4x > scope2x`; en presets de headshot, gap `general − redPoint` muy alto (> 32).
  - `NEEDS_REVIEW` — gap headshot moderado (> 20); regresión inesperada (v6 por debajo de legacy en general/redPoint con delta MEDIUM/HIGH); `fallbackPpi` + delta HIGH.
- **`requiresHumanReview`** cuando `expectedness != EXPECTED`, hay `fallbackPpi`, o `NO_LEGACY_EQUIVALENT`.

### 3.1 Adapter legacy: decisión de import-debt

El comparador usa el **motor legacy real congelado** (`generateSensitivity`) vía una **única costura inyectable** (`legacy-output-adapter.ts`), no un mirror copiado a mano. Se evaluó que el import es **seguro**:

- `@ares/config` valida env de forma **perezosa** (Proxy) → importarlo NO dispara validación; tests/CLI corren sin secretos.
- Los módulos legacy importan `@prisma/client` **solo como tipos** (sin runtime Prisma).
- Sin efectos de I/O / red / `node:` al importar.

Para un tribunal de evidencia, la fidelidad ground-truth supera el riesgo de drift de un mirror. **Limitaciones documentadas:** comparación solo de sensibilidad (sin gyro / fire button / HUD / headshot-engine / calibration-engine); legacy congelado; `customDpi`/`userRam`/`userHz` no usados; sin DB ni HTTP. Mapeo preset→estilo legacy:

| v6 preset | legacy style | nota |
|---|---|---|
| STANDARD_PRO | BALANCED | baseline ≈ balanced |
| TODO_ROJO / X_METHOD / ONE_TAP / BRAZIL_RUSH / SHOTGUN_DRAG / FREESTYLE_CLIPS | AGGRESSIVE | headshot/rush |
| SNIPER_AWM / AR_RECOIL_CONTROL | SNIPER | largo alcance |
| LOW_END_STABLE / CLASH_SQUAD / BATTLE_ROYALE / THREE_FINGER_COMPETITIVE / IPHONE_SMOOTH / ANDROID_BUDGET / SMG_TRACKING | BALANCED | — |
| FOUR_FINGER_PRO / GYRO_LIGHT / GYRO_PRO / CUSTOM_LAB | — | `NO_LEGACY_EQUIVALENT` (sin análogo en el modelo de 3 estilos) |

---

## 4. Umbrales + GO/NO-GO (`evidence-thresholds.ts`)

Umbrales versionados (`ARES_V6_EVIDENCE_THRESHOLDS_VERSION`). `evaluateAresV6GoNoGo` es puro y determinístico. **Precedencia:** `INFRA` → `MORE_DATA` → `FIX_ENGINE`.

| Categoría | Criterios |
|---|---|
| `NO_GO_INFRA` | p95 > 700ms, error rate > 1%, persistencia degradada > 0 |
| `NO_GO_MORE_DATA` | celdas device×preset insuficientes, generaciones/feedback bajo el piso, fixtureCoverage < 0.8, feedbackCoverage < 0.3, suspiciousRate > 0.2 |
| `NO_GO_FIX_ENGINE` | HIGH/LAB_VERIFIED < 0.8, fallbackPpiRate > 0.05, averageRating < 4.3, worseRate > 0.15, filas DANGEROUS > 0 |
| `GO_INTERNAL_UI_EXPERIMENT` | ninguno falla (la decisión de activar UI sigue siendo **humana**) |

---

## 5. Evidence snapshot (`evidence-snapshot.ts`)

Ensambla: lab metrics + conteos por device×preset + resumen de feedback TRUSTED + conteo SUSPICIOUS + comparación legacy-vs-v6 + umbrales + GO/NO-GO + próximas acciones.

- **SUSPICIOUS excluido por defecto** (las lab metrics ya lo excluyen; `includeSuspicious` solo si explícito).
- **LEGACY-FREE en runtime:** importa el comparador solo por tipos; las filas de comparación las calcula el caller (CLI/endpoint) y se inyectan, así el snapshot nunca empaqueta el motor legacy.
- `fixtureCoverage` = fixtures distintos en la comparación / total de fixtures de calibración.

---

## 6. Feedback TRUSTED vs SUSPICIOUS

Hereda de Fase 3C: `feedback-quality.ts` marca SUSPICIOUS por `LOW_RATING_VOLUME`, `OUTCOME_SYMPTOM_CONFLICT`, `OUTCOME_RESOLVED_CONFLICT`. **Feedback es evidencia, NO verdad automática.** El tribunal usa solo TRUSTED por defecto y reporta el conteo SUSPICIOUS excluido.

---

## 7. Propuestas human-gated (`calibration-proposals.ts`)

`generateAresV6CalibrationProposals(snapshot)` GENERA, nunca APLICA. Invariantes: `humanReviewRequired: true`, `autoApplyAllowed: false` (siempre). Gates duros que devuelven `NO_CHANGE_RECOMMENDED`:

- `INFRA_UNHEALTHY` (infra falla) · `INSUFFICIENT_SAMPLE` (muestra baja) · `SUSPICIOUS_FEEDBACK_DOMINANT` · `FALLBACK_PPI_DOMINANT`.

Con evidencia buena (GO) ⇒ `NO_CHANGE_RECOMMENDED`. Con `NO_GO_FIX_ENGINE` y muestra limpia ⇒ propuestas `PENDING_HUMAN_REVIEW` (tipo `PRESET_BIAS_ADJUSTMENT` / `CONFIDENCE_RULE_ADJUSTMENT`), con `suggestedDelta` solo como pista (o `null`) y `requiredEvidence`. Detalle en `CALIBRATION-GOVERNANCE.md`.

---

## 8. Artefactos

- `ares-v6-evidence-summary.json` — reporte completo (snapshot + comparación + propuestas).
- `ares-v6-evidence-report.md` — versión legible.
- Sin tokens, sin IP cruda, sin user-agent, sin body, sin cookies (el modelo de evidencia no tiene esos campos).

CLI: `npm run ares:v6:evidence -- [--from-db | --fixtures-only] [--legacy-compare] [--proposals] [--json|--markdown] [--output f] [--since|--until|--preset|--fixture]`. Default: **safe dry-run** (fixtures-only, sin escrituras a DB).

---

## 9. Endpoint opcional (`GET /api/lab/v6/evidence`)

READ-ONLY, **OFF por defecto** (`ARES_V6_LAB_EVIDENCE_ENABLED`), internal-token gated (es una **surface flag** 3C.1 → exige token en prod), rate-limit propio (ns `evidence`), ventana acotada (7d default / 90d máx). Devuelve **snapshot agregado** (GO/NO-GO + métricas + resumen TRUSTED + resumen de comparación + filas de alto riesgo), sin filas crudas ni PII. `?includeLegacyCompare=true` carga el comparador (y el motor legacy) de forma **perezosa** solo bajo demanda.

---

## 10. Integración CI / workflow

- **Gate bloqueante** `Phase 0.1B ARES v6 Gate`: lint + `tsc -p tsconfig.ares-v6.json` + vitest cubren los módulos nuevos, el endpoint y el script por globs; además corre la CLI fixtures-only y sube `ares-v6-evidence-summary.json` + `.md`.
- **Workflow manual** `ares-v6-internal-lab.yml`: inputs `runEvidenceReview` (default true), `includeLegacyCompare` (default true), `includeProposals` (default false). Tras el lab runner corre la evidencia `--from-db` y sube los artefactos. `legacy-audit` sigue **no bloqueante**.

---

## 11. Qué sigue OFF / no tocado

Sin UI pública, sin rollout, sin reemplazo de legacy, sin auto-calibración. No se tocó: pagos/Stripe/MercadoPago/webhooks, auth/NextAuth, middleware, command-center, admin, pricing, landing, academy, UI del generador, rutas legacy (`/api/generate`, `/all`, `/headshot`, `/export`), ni el engine/presets/research-matrix de v6. Kill switch: `ARES_V6_LAB_EVIDENCE_ENABLED=false` ⇒ 404 total del endpoint.
