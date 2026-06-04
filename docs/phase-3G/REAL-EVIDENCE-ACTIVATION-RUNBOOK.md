# Fase 3G — Real Evidence Activation · Runbook

**Rama:** `refactor/phase-0-nuclear-refoundation` · PR #1 (DRAFT)
**Postura:** interna · oculta · **solo lectura** · OFF por defecto · evidencia-primero · decisión humana
**Nombre:** Real Evidence Activation + Protected Preview Human Review

> 3G NO es más preparación, NO es más UI, NO es beta pública, NO reemplaza legacy, NO
> modifica el motor, NO aplica propuestas, NO recalibra por feedback, NO toca
> pagos/auth/middleware/webhooks y NO abre la UI al público. 3G es la **primera
> activación real controlada** contra un **preview protegido**, para mover
> `evidenceFixtureCoverage` de 0 a evidencia real y producir un Human Review Packet
> con datos reales — que un humano firma (o no).

---

## 1. Qué entrega 3G

3G NO cambia el runtime de los endpoints ni el motor. Añade el **contrato de activación real**:

| Pieza | Archivo | Rol |
|---|---|---|
| Target URL contract | `src/lib/ares-v6/target-url-check.ts` | Valida el `targetUrl` (HTTPS, no localhost, no creds, no secret query). Puro. Redacción primero. |
| Target check CLI | `scripts/ares-v6-target-url-check.ts` (`ares:v6:target-check`) | Gatea el `targetUrl` y emite `ares-v6-real-execution-mode.json`. |
| Real-evidence validator | `src/lib/ares-v6/real-evidence-validation.ts` | Auditor escéptico de los artifacts (real-http exige evidencia real; dry-run no puede reclamarla). Puro. |
| Validate CLI | `scripts/ares-v6-validate-real-evidence.ts` (`ares:v6:validate-real-evidence`) | Corre el validador sobre los artifacts; **falla el run** en modo real sin evidencia real. |
| Packet hardening | `src/lib/ares-v6/human-review-session.ts` | `execution` block (mode + targetUrlRedacted + deploymentProtectionVerified), dry-run nunca recomienda closed-beta, FINAL bloqueado si los gates no se cumplen. |
| Workflow | `.github/workflows/ares-v6-internal-review-session.yml` | Modo de ejecución real cuando hay `targetUrl`; corre target-check + validate-real-evidence. |

**El resultado esperado NO es "CI verde".** Es un **paquete de evidencia real** + una
recomendación GO/NO-GO basada en evidencia persistida + (sólo si un humano firma)
una decisión FINAL. Si no hay `targetUrl` protegido, 3G queda en **NO-GO operativo**.

---

## 2. Configurar el environment de GitHub

El workflow corre en el environment protegido **`ares-v6-internal-lab`**. El YAML NO
lo protege solo — hay que crearlo y protegerlo a mano:

1. Repo → **Settings → Environments → New environment** → `ares-v6-internal-lab`.
2. **Required reviewers**: agrega al menos 1 revisor humano (no el mismo que dispara).
3. **Prevent self-review** (si tu plan lo permite): actívalo.
4. (Opcional) **Deployment branches**: restringe a `refactor/phase-0-nuclear-refoundation`.

## 3. Cargar los secrets (en el environment, NO en el repo)

Settings → Environments → `ares-v6-internal-lab` → **Environment secrets**:

| Secret | Qué es | Nota |
|---|---|---|
| `ARES_V6_INTERNAL_ACCESS_TOKEN` | Token interno en claro (header). | Lo usa el lab runner http para el header. |
| `ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256` | SHA-256 **hex real** del token (`/^[a-f0-9]{64}$/i`). | `printf %s "$TOKEN" \| shasum -a 256`. Debe HASHEAR al token de arriba. |
| `ARES_V6_LOG_SALT` | Salt de logs (≥ 16 chars, aleatorio). | Sin él, prod-con-API responde 503. |
| `DATABASE_URL` | Postgres del **target** (el preview persiste aquí). | El runner http depende de devices sembrados en esta DB. |
| `REDIS_URL` | Redis para rate limit/cache. | |

> Nunca imprimas estos valores. El target-check, el readiness, el preflight y el
> packet están diseñados para NO emitir secretos; el sanitizer del packet es
> defensa en profundidad.

## 4. Configurar Vercel Deployment Protection (verificación HUMANA)

`ARES_V6_INTERNAL_UI_ALLOW_PRODUCTION` es **sólo un acuse**, NO protección real.
`NEXT_PUBLIC_*` **no es seguridad**. La protección real se configura en Vercel:

1. Vercel → Project → **Settings → Deployment Protection**.
2. Activa **Vercel Authentication** (o **Password Protection**, o **Trusted IPs**).
3. Confirma a mano que un request anónimo a `https://<preview>/internal/ares-v6`
   responde **401/403** (eso es la protección trabajando). El target-check lo
   sondea (`--probe`) pero **sólo como warning** — un 401 es lo esperado y el probe
   nunca puede ser el gate.

## 5. Conseguir un targetUrl protegido

- Despliega el branch en un **preview** de Vercel (NO producción pública).
- El `targetUrl` es la URL base del preview, p.ej. `https://sensipro-git-<branch>-<org>.vercel.app`.
- Debe ser **HTTPS**, sin `localhost`/`127.0.0.1`/`0.0.0.0`, sin `user:pass@`, sin
  `?token=`/`?secret=`/`?session=`/`?bearer=`/`?auth=` en la query.
- En la DB del target deben existir los **devices** de las fixtures LATAM (sembrar
  con el seed correspondiente) — si no, el runner http persistirá 0 ⇒ evCov=0 ⇒ NO-GO.

## 6. Ejecutar el workflow

Actions → **ARES v6 Internal Review Session** → **Run workflow**. Inputs sugeridos
para una sesión de evidencia real:

```
operator            = <tu-nombre>          (obligatorio, queda en el packet)
label               = fase-3g-real         (libre)
targetUrl           = https://<preview>    (REQUERIDO para modo real; vacío = dry-run)
preset              = STANDARD_PRO
runUiSmoke          = true
runEvidence         = true
includeProposals    = true                 (DRAFT, nunca auto-aplicadas)
enableFeedback      = false                (abrir sólo tras el primer batch)
persistGenerations  = true                 (necesario para evidencia real)
```

Con `targetUrl` presente el run es **REAL EVIDENCE MODE**: el target-check gatea,
`ARES_V6_API_ENABLED=true`, persiste generaciones y el validate-real-evidence exige
evidencia real (si falta, el run se pone **rojo** — eso es un NO-GO honesto).

Con `targetUrl` vacío el run es **dry-run-local**: el packet queda
`NO_GO_MORE_EVIDENCE` y NO puede reclamar evidencia real.

## 7. Variables de entorno exactas (las pone el workflow)

```
ARES_V6_INTERNAL_UI_ENABLED=true
ARES_V6_INTERNAL_UI_ALLOW_PRODUCTION=false   # preview, NO producción
ARES_V6_API_ENABLED=<true si hay targetUrl, si no false>
ARES_V6_PERSIST_GENERATIONS=<input persistGenerations>   # default true
ARES_V6_WRITE_FEEDBACK=<input enableFeedback>            # default false
ARES_V6_LAB_EVIDENCE_ENABLED=true
ARES_V6_LAB_METRICS_ENABLED=true
ARES_V6_RATE_LIMIT_FAIL_MODE=closed
ARES_V6_PROXY_TRUST_MODE=strict
ARES_V6_INTERNAL_ACCESS_MODE=header
ARES_V6_LOG_SALT / ARES_V6_INTERNAL_ACCESS_TOKEN / *_SHA256 / DATABASE_URL / REDIS_URL  # secrets
```

## 8. Descargar y leer los artifacts

El run sube el artifact `ares-v6-internal-review-session` con:

```
ares-v6-real-execution-mode.json      # { mode, targetUrlPresent, targetUrlRedacted, feedbackEnabled, persistGenerations, requiresHumanDecision }
ares-v6-target-url-check.json         # { passed, errors[], warnings[], redactedTargetUrl, probe, executionMode }
ares-v6-internal-lab-report.json      # resumen del lab run (no persiste secretos)
ares-v6-evidence-summary.json         # snapshot de evidencia (sin filas crudas)
ares-v6-evidence-report.md            # reporte legible
ares-v6-ui-smoke.json                 # { ran, passed }
ares-v6-real-evidence-validation.json # veredicto del auditor (passed, checks[], summary)
human-review-packet.json / .md        # el packet (DRAFT por defecto)
ci-logs/                              # logs por step
```

Cómo leerlos: ver `REAL-EVIDENCE_OPERATOR_GUIDE.md` (§ "Leer la evidencia") y la
plantilla `REAL-EVIDENCE_GO_NO_GO.md`.

## 9. Kill switch / rollback

- **Kill switch UI:** `ARES_V6_INTERNAL_UI_ENABLED=false` ⇒ `/internal/ares-v6`
  responde **404** de inmediato (la página es dinámica; el flag se lee por request).
- **Endpoints:** `generate/feedback/metrics/evidence` siguen OFF por flag.
- **Rollback:** 3G es aditivo y sin estado nuevo que revertir. Los artifacts son
  JSON/MD descartables; el schema NO cambia; el motor/legacy NO se tocan. Para
  abortar, baja el preview en Vercel y/o pon los flags en `false`.

## 10. Qué NO toca 3G

Pagos/Stripe/MercadoPago/webhooks, auth/NextAuth, middleware global, command-center,
admin APIs, pricing, landing, academy, UI del generador legacy, rutas legacy
(`/api/generate`, `/all`, `/headshot`, `/export`), engine-v6 (curves/presets/
research-matrix/calibration) y el motor legacy. Sin modelos Prisma nuevos. Sin
exposición pública.
