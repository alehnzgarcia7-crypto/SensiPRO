# ARES v6 — Calibration Governance (Fase 3D)

**Rama:** `refactor/phase-0-nuclear-refoundation`

> **El feedback es evidencia, NO verdad automática.** Ninguna propuesta de calibración se aplica al motor de forma automática. Toda propuesta exige aprobación HUMANA. El motor, los presets y la research-matrix NUNCA se modifican por feedback en esta fase.

---

## 1. Principio rector

Una muestra pequeña produce **hipótesis**, no cambios de motor. Cada ajuste posible se expresa como una **propuesta** con justificación, evidencia requerida y revisión humana obligatoria. `calibration-proposals.ts` GENERA propuestas; no existe código que muten curvas/presets/research-matrix.

Invariantes (verificados por tests):

- `humanReviewRequired: true` — SIEMPRE.
- `autoApplyAllowed: false` — SIEMPRE.

---

## 2. El feedback como evidencia

| qualityFlag | Uso |
|---|---|
| `TRUSTED` | Evidencia válida para hipótesis (nunca cambio automático). |
| `SUSPICIOUS` | Se guarda, pero **excluido por defecto** de métricas y propuestas. |

SUSPICIOUS se marca en Fase 3C (`feedback-quality.ts`): `LOW_RATING_VOLUME` (≥5 ratings ≤2 mismo device+preset en 10 min), `OUTCOME_SYMPTOM_CONFLICT` (BETTER + resuelto + síntomas), `OUTCOME_RESOLVED_CONFLICT` (WORSE + resuelto). Protege contra spam / manipulación de ratings / data poisoning (OWASP API6).

---

## 3. Ciclo de vida de una propuesta

```
DRAFT ──► PENDING_HUMAN_REVIEW ──► APPROVED  (acción humana fuera de banda)
                              └──► REJECTED  (acción humana fuera de banda)
```

- El generador emite SOLO `DRAFT` (no-change / bloqueada) o `PENDING_HUMAN_REVIEW` (accionable).
- `APPROVED` / `REJECTED` los fija un humano; aplicar un APPROVED es un cambio de motor **separado, manual y revisado** (fuera del alcance de 3D).

Tipos: `PPI_BAND_ADJUSTMENT`, `PRESET_BIAS_ADJUSTMENT`, `WEAPON_BIAS_ADJUSTMENT`, `HUD_BUTTON_ADJUSTMENT`, `CONFIDENCE_RULE_ADJUSTMENT`, `NO_CHANGE_RECOMMENDED`. Riesgo: `LOW | MEDIUM | HIGH`.

---

## 4. Reglas de aprobación / bloqueo

| Condición | Resultado | blockedReason |
|---|---|---|
| Infra no sana (`NO_GO_INFRA`) | `NO_CHANGE_RECOMMENDED` | `INFRA_UNHEALTHY` |
| Feedback SUSPICIOUS dominante (> 0.2) | `NO_CHANGE_RECOMMENDED` | `SUSPICIOUS_FEEDBACK_DOMINANT` |
| PPI fallback dominante (> 0.05) | `NO_CHANGE_RECOMMENDED` | `FALLBACK_PPI_DOMINANT` |
| Muestra insuficiente (celdas device×preset bajo el piso) | `NO_CHANGE_RECOMMENDED` | `INSUFFICIENT_SAMPLE` |
| Cobertura de EVIDENCIA real insuficiente (3D.1) | `NO_CHANGE_RECOMMENDED` | `EVIDENCE_COVERAGE_INSUFFICIENT` |
| Riesgo estructural BLOCKING + datos insuficientes (3D.1) | `NO_CHANGE_RECOMMENDED` | `STRUCTURAL_RISK_REVIEW_REQUIRED` (+ sample/coverage) |
| Riesgo estructural BLOCKING + evidencia suficiente (3D.1) | `PENDING_HUMAN_REVIEW` | — |
| Evidencia buena (`GO`), deltas esperados | `NO_CHANGE_RECOMMENDED` | — |
| `NO_GO_FIX_ENGINE` con muestra limpia | `PENDING_HUMAN_REVIEW` | — |

Reglas adicionales:

- Nunca proponer desde feedback SUSPICIOUS.
- Nunca proponer cuando `fallbackPpi` domina (corregir specs del device, no el motor).
- Las filas `fallbackPpi` de la comparación NUNCA generan propuesta automática (solo revisión).
- `suggestedDelta` es una **pista conservadora** o `null`; el humano decide el número final.

---

## 5. Requisitos de tamaño de muestra

| Umbral | Valor |
|---|---|
| `minTrustedFeedbackPerDevicePreset` | 5 |
| `minGenerationsPerDevicePreset` | 5 |
| `minFeedbackCoverageRate` | 0.3 |
| `minFixtureCoverage` | 0.8 |
| `maxSuspiciousFeedbackRate` | 0.2 |

Por debajo de cualquiera ⇒ `INSUFFICIENT_SAMPLE` / `NO_GO_MORE_DATA`. Versionados en `evidence-thresholds.ts` (`ARES_V6_EVIDENCE_THRESHOLDS_VERSION`); las conclusiones de Free Fire son **versionables por parche (OB53)**, no absolutas.

---

## 6. Persistencia: artefacto JSON primero

Las propuestas son **artefactos JSON** (`ares-v6-evidence-summary.json`), no filas de DB. No se añadió modelo Prisma `AresV6CalibrationProposal`: un DRAFT efímero no tiene necesidad clara de persistencia y evitar la tabla mantiene el schema mínimo y aditivo. Si en el futuro se requiere historial auditable de propuestas, se podrá añadir un modelo **aditivo** (`status/proposalType/createdAt` indexados) sin ALTER/DROP — decisión diferida hasta que la necesidad sea real.

---

## 7. Sin mutación automática del motor

No existe ruta de código que escriba en `engine-v6/`, `presets.ts` o `research-matrix.ts` a partir de evidencia o feedback. La aplicación de una propuesta APPROVED es un cambio de ingeniería manual, revisado y fuera del alcance de Fase 3D.

> **Nota 3D.1B:** el patch de contrato del endpoint (`EVIDENCE-INTEGRITY-PATCH.md §8`) NO cambia la gobernanza de propuestas: los bloqueos, el `humanReviewRequired:true` y el `autoApplyAllowed:false` se mantienen idénticos. Sólo se endureció el contrato/serialización del endpoint de evidencia y su cobertura de tests.
