# ARES v6 — Internal Controlled Activation Runbook (Fase 3C)

**Objetivo:** activar `/api/generate/v6` (+ feedback + métricas) SÓLO para internos en un entorno preview/interno protegido, sin exponer producción pública.

> Nunca activar en producción pública en esta fase. Sin UI pública. El feedback no recalibra el motor.

---

## 1. GitHub environment

- Environment: **`ares-v6-internal-lab`** (Settings → Environments).
- Recomendado: **Required reviewers** (al menos 1) + restringir a la rama de refundación.
- **Secrets:**
  - `ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256` — `sha256(<token-fuerte>)` en hex (64 chars).
  - `ARES_V6_INTERNAL_ACCESS_TOKEN` — el token en claro (sólo para el runner http del workflow).
  - `ARES_V6_LOG_SALT` — ≥16 chars, único por deploy.
  - `DATABASE_URL`, `REDIS_URL` — del entorno interno/preview.
- **Vars (activación):**
  - `ARES_V6_API_ENABLED=true`
  - `ARES_V6_INTERNAL_ACCESS_MODE=header`
  - `ARES_V6_LAB_MODE=true`
  - `ARES_V6_PERSIST_GENERATIONS=true`
  - `ARES_V6_PERSIST_GENERATIONS_REQUIRED=true`
  - `ARES_V6_WRITE_FEEDBACK=false` (inicialmente; subir cuando se valide)
  - `ARES_V6_LAB_METRICS_ENABLED=true`
  - `ARES_V6_RATE_LIMIT_FAIL_MODE=closed`
  - `ARES_V6_PROXY_TRUST_MODE=strict`

Generar el hash del token: `node -e "console.log(require('crypto').createHash('sha256').update(process.argv[1]).digest('hex'))" <token>`.

---

## 2. Kill switch (sin revertir commits)

```
ARES_V6_API_ENABLED=false
ARES_V6_WRITE_FEEDBACK=false
ARES_V6_PERSIST_GENERATIONS=false
ARES_V6_LAB_METRICS_ENABLED=false
```

Cualquiera apaga su superficie al instante. `ARES_V6_API_ENABLED=false` ⇒ 404 total.

---

## 3. Checklist pre-activación

- [ ] CI verde (`Phase 0.1B ARES v6 Gate` + `ARES v6 Real-Infra Smoke`).
- [ ] Redis y Postgres del entorno sanos.
- [ ] `ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256` (64 hex) y token fuerte guardados.
- [ ] `ARES_V6_LOG_SALT` fuerte (≥16).
- [ ] `ARES_V6_PROXY_TRUST_MODE=strict`, `ARES_V6_RATE_LIMIT_FAIL_MODE=closed`.
- [ ] Migración aditiva aplicada (`20260602000000_ares_v6_lab`) o `db push` en el lab.
- [ ] Ninguna UI pública conectada.

---

## 4. Pasos de activación

1. Configurar el environment + secrets/vars (sección 1).
2. Disparar el workflow manual **ARES v6 Internal Lab** (`workflow_dispatch`) con `allFixtures=true`, `dryRun=true` (o `targetUrl` del preview).
3. Revisar `ares-v6-internal-lab-report.json` (artifact): `successCount`, `p95`, `fallbackPpiRate`, `confidenceDistribution`.
4. `GET /api/lab/v6/metrics` con el token → confirmar métricas.
5. Enviar feedback controlado para 3–5 generaciones (`ARES_V6_WRITE_FEEDBACK=true` temporalmente).
6. Revisar logs: **cero IP/UA/token/body crudo**.
7. Revisar contadores de rate-limit (`rateLimitDegradedCount` debe ser 0).
8. Si algún umbral falla → kill switch.

---

## 5. Umbrales go/no-go

| Métrica | Umbral |
|---|---|
| 5xx | 0 |
| p95 totalDurationMs | < 700ms |
| fallbackPpiRate (fixtures) | < 5% |
| detectedPpi en fixtures | presente |
| confidence HIGH/LAB_VERIFIED (fixture set) | ≥ 80% |
| fallos de persistencia | 0 |
| rateLimitDegraded | 0 |
| feedbackCoverageRate (muestra interna) | ≥ 30% |
| IP/UA/token/body crudo en logs | 0 |
| feedback duplicado aceptado | 0 |

---

## 6. Post-run

- Reporte de métricas (`GET /api/lab/v6/metrics`) + resumen de feedback.
- Lista de incidencias.
- Decisión: continuar a Fase 3D o ajustar.
- Cleanup: `npm run ares:v6:lab:cleanup -- --dry-run` (revisar) → `--execute` si procede.
