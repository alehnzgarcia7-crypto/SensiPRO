# ARES v6 — Lab Metrics Spec (Fase 3C)

Modelo de métricas internas (inspirado en el modelo OpenTelemetry: counters acumulados, histogramas de latencia, distribuciones de estado) — **sin** meter el SDK de OTel todavía. Sólo agregados, **sin PII**, nunca expuesto públicamente.

---

## 1. Fuente

- `AresV6Generation` (evidencia de generación) y `AresV6Feedback` (evidencia de feedback).
- Calculadoras puras en `src/lib/ares-v6/lab-metrics.ts`; entrada DB inyectable.
- Endpoint interno `GET /api/lab/v6/metrics` (flag `ARES_V6_LAB_METRICS_ENABLED`, internal-access).

---

## 2. Métricas

| Métrica | Tipo | Definición |
|---|---|---|
| `totalGenerations` | counter | filas de generación en el rango |
| `totalFeedback` | counter | feedback confiable (excluye SUSPICIOUS por defecto) |
| `p50/p95/p99TotalDurationMs` | histograma | percentiles nearest-rank de `totalDurationMs` |
| `avgDbDurationMs` / `avgEngineDurationMs` | gauge | promedios redondeados |
| `fallbackPpiRate` | ratio 0–1 | `detectedPpi == null || ppiSource == TIER_FALLBACK` / total |
| `confidenceDistribution` | distribución | conteo por grade (LOW/MEDIUM/HIGH/LAB_VERIFIED) |
| `presetDistribution` / `modeDistribution` / `deviceDistribution` | distribución | conteo por dimensión |
| `ratingDistribution` / `outcomeDistribution` | distribución | conteo por rating / outcome |
| `unresolvedProblemRate` | ratio 0–1 | `problemResolved == false` / con `problemResolved` conocido |
| `feedbackCoverageRate` | ratio 0–1 | `min(1, totalFeedback / totalGenerations)` |
| `rateLimitDegradedCount` | counter | generaciones con `rateLimitDegraded` |
| `labModeCount` | counter | generaciones en lab mode |
| `suspiciousFeedbackExcluded` | counter | feedback excluido por SUSPICIOUS |

---

## 3. Dimensiones permitidas (baja cardinalidad)

`presetId`, `mode`, `confidenceGrade`, `ppiSource`, `outcome`, `rating`, `deviceId`.

- **Cardinalidad:** las dimensiones son enums/ids acotados. `deviceId` es el cuello de cardinalidad más alto (catálogo ≈ cientos); aceptable para agregados internos.
- Filtros de query: `since`, `until` (ISO 8601), `deviceId`, `presetId`, `includeSuspicious`.

---

## 4. Política PII

- **Prohibido** en métricas y filas: IP cruda, ipHash, user-agent, cookies, tokens, emails, comentarios crudos en agregados.
- Las filas de generación no guardan IP ni UA. El feedback guarda comentario (saneado, sin PII) pero las métricas **no** lo exponen.

---

## 5. Cálculo de percentiles

Nearest-rank: `idx = ceil(p/100 * n) - 1` sobre el array ordenado; 0 si vacío. Determinístico y testeado.

---

## 6. Retención de datos

| Dato | Retención | Acción |
|---|---|---|
| `AresV6Generation` | 90 días (env `ARES_V6_GENERATION_RETENTION_DAYS`) | borrar > cutoff |
| `AresV6Feedback` | 180 días (env `ARES_V6_FEEDBACK_RETENTION_DAYS`) | borrar > cutoff |
| `AresV6LabRun` | se conserva | — |

- Script: `scripts/ares-v6-lab-cleanup.ts` (`--dry-run` por defecto, `--execute` borra).
- **Sin cron automático** todavía (invocación manual).

---

## 7. Fase 3C.1 — Safety

- **Rate limit:** `GET /api/lab/v6/metrics` se limita por bucket `metrics` (IP) **antes** de cualquier query; 429 si excede, 503 si el store cae en fail-closed.
- **Ventana temporal:** sin `since` ⇒ `until - 7 días`; `until` por defecto = ahora. Rango **máximo 90 días**; `until < since` ⇒ 400; rango > 90d ⇒ 400. La meta de la respuesta incluye la ventana efectiva.
- **Límite de filas:** cada tabla procesa máximo `ARES_V6_LAB_METRICS_MAX_ROWS = 10 000` (`orderBy createdAt desc`). Lab v0; los rollups SQL vienen después.
- **Sin filas por API:** la respuesta sólo expone agregados — nunca filas individuales ni PII.
