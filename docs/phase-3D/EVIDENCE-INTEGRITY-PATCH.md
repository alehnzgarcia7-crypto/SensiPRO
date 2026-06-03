# ARES v6 — Evidence Integrity Patch (Fase 3D.1)

**Rama:** `refactor/phase-0-nuclear-refoundation`
**Estado:** parche de integridad semántica del tribunal de evidencia. NO es UI, NO es rollout, NO auto-aplica nada.

> El tribunal de evidencia no debe poder engañarse a sí mismo: cobertura de comparación ≠ cobertura de evidencia, y un riesgo estructural nunca puede quedar oculto bajo "falta muestra".

---

## 1. Hallazgos corregidos

| # | Bug 3D | Fix 3D.1 |
|---|---|---|
| 1 | `fixtureCoverage` se calculaba desde `comparisonRows` (referencia), no desde evidencia DB. | **Cobertura separada:** `evidenceFixtureCoverage` (DB) vs `comparisonFixtureCoverage` (fixtures-only). GO gatea en evidencia. |
| 2 | El endpoint ignoraba `presetId` al construir `comparisonRows`. | `compareScope=filtered` (default) filtra por preset; `compareScope=all` lo ignora **y avisa**. |
| 3 | El endpoint decía "aggregated only" pero devolvía `highRiskRows` completos. | Default devuelve `highRiskSummaryRows` (sin vectores/deltas). `includeRows=true` (interno) devuelve filas completas **cap 100**. |
| 4 | Filas DANGEROUS estructurales quedaban ocultas bajo `NO_GO_MORE_DATA`. | **`structuralRisk`** es un campo separado (CLEAR/REVIEW_REQUIRED/BLOCKING), visible aunque la decisión sea MORE_DATA; va **primero** en `recommendedNextActions`. |
| 5 | `presetId` del endpoint era string libre. | Validado contra `ARES_V6_PRESETS` (type guard) ⇒ 400 si inválido. |

---

## 2. Por qué comparison coverage ≠ evidence coverage

- **Comparison coverage** mide cuánto de la matriz de referencia legacy-vs-v6 (fixtures-only, pura, sin DB) se computó. Es una **referencia**, no evidencia: existe aunque no haya ni una sola generación real.
- **Evidence coverage** mide cuántos fixtures de calibración tienen **generaciones persistidas reales** que mapean a un fixture conocido (por slug == fixtureId o brand+model). Es la **muestra**.

Colapsarlas dejaba que un `--legacy-compare` completo (cmpCov=1) simulara un GO sin una sola pieza de evidencia real. Ahora `evidenceFixtureCoverage` gatea el GO/NO-GO (`minFixtureCoverage`); `comparisonFixtureCoverage` sólo informa. Disciplina científica: comparación = referencia, evidencia = muestra; no son lo mismo (OWASP API1: no mezclar contexto de objetos no solicitados).

Mapeo de evidencia→fixture en `evidence-fixture-coverage.ts`:
- `matchAresV6FixtureFromGeneration({deviceSlug, deviceBrand, deviceModel})` → fixtureId | null.
- Devices desconocidos NO cuentan como cubiertos (`unknownCount`).
- `evidence-repository.ts` trae los conteos device×preset **con** brand/model/slug (groupBy server-side, ventana + tope `ARES_V6_EVIDENCE_MAX_CELLS`).

---

## 3. Nuevos campos del snapshot

```
evidenceFixtureCoverage / evidenceCoveredFixtures      // DB real (gatea GO)
comparisonFixtureCoverage / comparisonCoveredFixtures  // referencia (informativo)
totalFixtures
fixtureCoverage / coveredFixtures                      // @deprecated alias de evidence*
structuralRisk { decision, dangerousRows, needsReviewRows, fallbackPpiRows, noLegacyEquivalentRows, rationale }
highRiskSummaryRows[]                                   // sin vectores/deltas (safe para endpoints)
```

`AresV6GoNoGoMetrics` añade `evidenceFixtureCoverage`, `comparisonFixtureCoverage`, `dangerousStructuralRows`, `reviewStructuralRows` (antes `dangerousComparisonRows`/`fixtureCoverage`).

---

## 4. StructuralRisk model

`computeAresV6StructuralRisk(rows)` (puro, sobre filas inyectadas):

| decision | Cuándo |
|---|---|
| `BLOCKING` | hay ≥1 fila DANGEROUS (cascada/relación de sliders inválida) |
| `REVIEW_REQUIRED` | hay NEEDS_REVIEW / fallbackPpi / sin-equivalente-legacy |
| `CLEAR` | todas las filas comparables son EXPECTED |

`structuralRisk` es **independiente** del GO/NO-GO. La decisión mantiene su precedencia (INFRA → MORE_DATA → FIX_ENGINE) y `dangerousStructuralRows` sigue siendo criterio FIX_ENGINE; pero aunque MORE_DATA "gane" la decisión, `structuralRisk=BLOCKING` queda visible y es la **primera** acción recomendada.

---

## 5. Endpoint: compareScope / includeRows

`GET /api/lab/v6/evidence` (OFF por defecto, surface flag, rate-limit ns `evidence`, ventana 7d/90d):

| Query | Default | Efecto |
|---|---|---|
| `presetId` | — | Validado contra ARES_V6_PRESETS (400 si inválido). |
| `compareScope` | `filtered` | `filtered` filtra la comparación por preset; `all` la ignora + warning en meta. |
| `includeLegacyCompare` | `false` | Carga el comparador (motor legacy) de forma **perezosa** sólo si `true`. |
| `includeRows` | `false` | `false` → `highRiskSummaryRows` (sin vectores/deltas). `true` → `highRiskRows` cap 100 (interno). |
| `includeSuspicious` | `false` | Incluye SUSPICIOUS sólo si explícito. |

OWASP API4: ventana acotada, filas acotadas (cap 100), sin filas completas por default, sin PII. El CLI replica los semantics con `--compare-scope` / `--include-rows` / `--summary-only`.

---

## 6. Por qué el GO/NO-GO sigue siendo HUMANO

El tribunal sólo **recomienda** (GO/NO-GO), **bloquea** (gates de propuesta) o **exige revisión** (structuralRisk, proposals PENDING_HUMAN_REVIEW). Nunca modifica el engine, presets ni research-matrix. Las propuestas mantienen `autoApplyAllowed:false` y `humanReviewRequired:true` SIEMPRE, con dos nuevos bloqueos: `STRUCTURAL_RISK_REVIEW_REQUIRED` y `EVIDENCE_COVERAGE_INSUFFICIENT`.

---

## 7. Por qué 3D.1 bloquea la UI hasta tener evidencia real

Antes, `cmpCov=1` (referencia) podía leerse como cobertura suficiente y abrir la puerta a un GO falso. Con 3D.1, **sólo evidencia real** (generaciones persistidas que mapean a fixtures) cuenta para `minFixtureCoverage`. Sin lab interno activado, `evidenceFixtureCoverage=0` ⇒ `NO_GO_MORE_DATA` por diseño. La UI experimental (Fase 3E) sólo se evalúa cuando hay evidencia real suficiente y la decisión sigue siendo humana.

Versiones bumpeadas: snapshot/thresholds/report/proposal `3D.1 → 3D.2`. `fixtureCoverage`/`coveredFixtures` quedan como alias **deprecated** de los campos de evidencia (back-compat sin mantener la semántica vieja en silencio).
