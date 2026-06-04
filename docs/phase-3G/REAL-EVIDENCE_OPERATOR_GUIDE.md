# Fase 3G — Guía del Operador (Real Evidence)

Esta guía es la secuencia paso a paso para el humano que ejecuta y revisa la sesión
de evidencia real. Léela junto con `REAL-EVIDENCE-ACTIVATION-RUNBOOK.md` (cómo está
construido) y `REAL-EVIDENCE_GO_NO_GO.md` (la plantilla de decisión).

> Regla #0: **CI verde ≠ aprobación.** Un run verde significa que el tooling corrió
> bien. La aprobación es el Human Review Packet en estado **FINAL**, con `decidedBy`
> + `rationale`. Sin eso, no hay decisión.

---

## 1. Antes de ejecutar (pre-flight humano)

Completa primero `docs/phase-3F/OPERATOR-PRE-3G-CHECKLIST.md`. En resumen:

- [ ] Environment `ares-v6-internal-lab` existe, con required reviewers + prevent self-review.
- [ ] Secrets cargados (token, token SHA-256 hex real, log salt, DATABASE_URL, REDIS_URL).
- [ ] Vercel Deployment Protection activa y **verificada a mano** (401/403 anónimo).
- [ ] `targetUrl` del preview a la mano (HTTPS, sin localhost/creds/secret-query).
- [ ] DB del target sembrada con los devices de las fixtures.

Si algo falta: NO ejecutes en modo real. Corre primero el dry-run (sin `targetUrl`).

## 2. Ejecutar

Actions → **ARES v6 Internal Review Session** → Run workflow, con los inputs del
runbook (§6). El environment pedirá aprobación de un revisor antes de correr.

## 3. Leer la evidencia (en orden)

### 3.1 Modo de ejecución — `ares-v6-real-execution-mode.json`
```
mode = "real-http"        ⇒ activación real (hay targetUrl válido)
mode = "dry-run-local"    ⇒ NO hay evidencia real; el packet será NO_GO_MORE_EVIDENCE
```
Si esperabas real y dice dry-run, faltó el `targetUrl` o no pasó el target-check.

### 3.2 Target check — `ares-v6-target-url-check.json`
`passed` debe ser `true`. `errors[]` lista violaciones del contrato (HTTPS, localhost,
credenciales, query sensible). `redactedTargetUrl` es seguro de pegar en notas.
`probe.note` es informativo: un 401/403 es **bueno** (protección trabajando).

### 3.3 Cobertura de evidencia — `ares-v6-evidence-summary.json`
- **`snapshot.evidenceFixtureCoverage`** (gatea GO): fracción de fixtures con
  generaciones **reales persistidas**. `0` = sin evidencia real ⇒ NO-GO. El umbral
  para closed-beta es `minFixtureCoverage` (0.8 por defecto).
- `snapshot.comparisonFixtureCoverage`: cobertura de la matriz fixtures-only. **Es
  informativa**, NO es evidencia — un `--legacy-compare` completo da 1.0 sin probar nada.
- `snapshot.metrics.totalGenerations`: en modo real debe ser `> 0`.
- `mode`: `from-db` (real) vs `fixtures-only`.

### 3.4 Riesgo estructural — `snapshot.structuralRisk.decision`
```
CLEAR            ⇒ todas las filas comparables son EXPECTED.
REVIEW_REQUIRED  ⇒ filas NEEDS_REVIEW / PPI fallback / sin legacy — revisar antes de subir el bar.
BLOCKING         ⇒ filas DANGEROUS (cascada/sliders inválida) — revisión HUMANA obligatoria, bloquea todo.
```
Es independiente del GO/NO-GO de muestra: visible aunque la decisión sea MORE_DATA.

### 3.5 UI smoke — `ares-v6-ui-smoke.json`
`{ ran: true, passed: true }` esperado si corriste `runUiSmoke=true`. Un smoke en
fallo es un **bloqueador** (NO_GO_FIX_BLOCKERS).

### 3.6 Validación de evidencia real — `ares-v6-real-evidence-validation.json`
El auditor escéptico. `passed=false` con `checks[]` explicando por qué. En modo real
falla si: evidencia fixtures-only, evCov=0, totalGenerations=0, packet ausente,
recomendación no basada en evidencia real, packet FINAL sin humano, gates de
closed-beta no cumplidos, o **cualquier secreto** filtrado en un artifact.

### 3.7 Human Review Packet — `human-review-packet.md`
Léelo completo. Campos clave:
- `execution.executionMode` / `targetUrlRedacted` / `deploymentProtectionVerified`.
- `readiness.recommendedDecision` (recomendación del sistema, ver §4).
- `decision.status` = **DRAFT** hasta que un humano firme.
- `decision.finalizationBlockedReasons` = por qué una decisión humana NO pudo ser FINAL.

## 4. La recomendación del sistema (NO es la decisión)

```
NO_GO_FIX_BLOCKERS            smoke en fallo / readiness en fallo / structuralRisk=BLOCKING / infra/motor NO-GO
NO_GO_MORE_EVIDENCE           cobertura/feedback < umbral / NO_GO_MORE_DATA / REVIEW_REQUIRED / dry-run-local
GO_HIDDEN_UI_CONTINUE         sano, sin bloqueadores, pero aún no llega al bar de closed-beta → seguir interno
GO_PREPARE_CLOSED_BETA_DESIGN GO_INTERNAL_UI_EXPERIMENT + structuralRisk=CLEAR + cobertura/feedback ≥ umbral + smoke OK + deployment protection verificada
```

## 5. Tomar la decisión (humano)

1. Si el packet queda **DRAFT** ⇒ **no avances**. Recolecta lo que falte.
2. Si `recommendedDecision = NO_GO_MORE_EVIDENCE` ⇒ recolectar más evidencia real
   (más fixtures con generaciones persistidas / feedback TRUSTED). Repite la sesión.
3. Si `NO_GO_FIX_BLOCKERS` ⇒ arregla los bloqueadores antes de re-evaluar.
4. Si `GO_HIDDEN_UI_CONTINUE` ⇒ sigue iterando **interno** (sin closed-beta).
5. Sólo si `GO_PREPARE_CLOSED_BETA_DESIGN` **sostenido** + firma humana FINAL
   (`decidedBy` + `rationale` + `decision`), se diseña la closed-beta (Fase 3H,
   detrás de flag, NO pública).

Para firmar FINAL, usa la plantilla `REAL-EVIDENCE_GO_NO_GO.md`. Recuerda: el packet
**rechaza** ser FINAL para un closed-beta si los gates no se cumplen (lo verás en
`finalizationBlockedReasons`).

## 6. Qué bloquea la closed-beta (resumen)

- `evidenceFixtureCoverage` = 0 (o por debajo del umbral).
- `structuralRisk` ≠ CLEAR.
- `deploymentProtectionVerified` ≠ true.
- UI smoke no ejecutada o en fallo.
- Cualquier secreto filtrado en un artifact.
- Modo dry-run-local (nunca produce evidencia real).

## 7. Si algo sale mal

- Run rojo en el step **target-check**: el `targetUrl` viola el contrato (lee
  `ares-v6-target-url-check.json` → `errors[]`). Corrige la URL/protección.
- Run rojo en **validate real evidence**: NO-GO honesto — la evidencia no es real
  todavía. Lee `ares-v6-real-evidence-validation.json` → `checks[]`.
- Kill switch / rollback: ver el runbook §9.
