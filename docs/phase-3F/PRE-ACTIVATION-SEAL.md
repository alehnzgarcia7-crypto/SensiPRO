# Fase 3F.1 — Pre-Activation Seal (antes de evidencia real)

Cierra detalles técnicos y operativos **antes** de ejecutar 3G con un preview real.
Esta fase **NO** ejecuta la activación, **NO** corre el workflow con `targetUrl`,
**NO** abre beta, **NO** hace UI pública, **NO** toca legacy/pagos/auth/middleware,
**NO** modifica el motor ni recalibra nada.

**Fecha:** 2026-06-04

---

## 1. Qué corrige 3F.1

| # | Corrección | Resultado |
|---|---|---|
| 1 | **server-only seal completo** (12 módulos) | Un Client Component que runtime-importe cualquiera falla en build. |
| 2 | **Token hash hex real** | El readiness ya no acepta cualquier string de 64 chars; exige SHA-256 hex. |
| 3 | **Workflow argv safety** | Inputs del operador sólo como argv citado (arrays bash); sin word-splitting/inyección. |
| 4 | **Checklist operativo** | `OPERATOR-PRE-3G-CHECKLIST.md` (21 ítems) obligatorio antes de 3G. |
| 5 | **CI verde sostenido** | 457 tests v6 (438 unit + 19 smoke); gate y smoke success. |

---

## 2. Server-only seal (12 módulos) + cómo conviven con los CLIs

`import 'server-only'` está ahora en **los 12 módulos críticos**:

```
internal-ui-flags        internal-ui-readiness     lab-metrics
internal-ui-access       human-review-session      evidence-route-service
internal-ui-service      human-review-cli          evidence-snapshot
internal-preview-service generation-persistence    feedback-service
```

**El reto:** 5 de ellos (`internal-ui-readiness`, `human-review-session`,
`human-review-cli`, `lab-metrics`, `evidence-snapshot`) los importan **CLIs que
corren bajo tsx**. El paquete `server-only` resuelve por condición de export:

```jsonc
"exports": { ".": { "react-server": "./empty.js", "default": "./index.js" /* throws */ } }
```

En Next (server) se usa la condición `react-server` → no-op. En **tsx/node SIN esa
condición** → el `default` **lanza** al importar. Por eso, en 3F estos 5 estaban
excluidos: marcarlos rompía `npm run ares:v6:evidence` (¡que corre en el gate!).

**Solución 3F.1:** los 4 scripts CLI que importan (transitivamente) un módulo
server-only ahora corren con la condición explícita:

```jsonc
"ares:v6:evidence":     "npx tsx --conditions=react-server scripts/ares-v6-evidence-review.ts",
"ares:v6:lab:run":      "npx tsx --conditions=react-server scripts/ares-v6-internal-lab-runner.ts",
"ares:v6:ui-readiness": "npx tsx --conditions=react-server scripts/ares-v6-ui-readiness.ts",
"ares:v6:human-review": "npx tsx --conditions=react-server scripts/ares-v6-human-review-session.ts",
```

`--conditions=react-server` hace que `server-only` sea no-op **dentro del proceso
CLI** (verificado: `tsx --conditions=react-server` importa limpio; `tsx` solo
lanza). Sólo `react`/`react-dom`/`server-only`/`client-only` declaran esa condición
y **ninguno de estos CLIs importa React**, así que la salida de evidencia es
**byte-idéntica** (mismo `NO_GO_MORE_DATA · evCov=0 · cmp=45`): cero cambio de
números, cero toque al motor.

- **Vitest:** alias `server-only` → stub vacío (`tests/stubs/server-only.ts`).
- **Next build:** condición real → protección real en el bundle del cliente.
- **Test de frontera:** `server-only-boundary.test.ts` prueba estáticamente que
  (a) los 12 módulos tienen el marcador y (b) ningún Client Component los
  runtime-importa (sólo `import type`, borrado en compilación).

`calibration-proposals` se mantiene **sin** server-only a propósito: sólo se importa
desde CLIs/servidor y type-importa `evidence-snapshot`; no es superficie de cliente.

---

## 3. Token hash hex real

`internal-ui-readiness.ts` ahora usa:

```ts
function isSha256Hex(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);
}
```

Copy: válido → `configured (64 hex)`; inválido → `missing or not valid 64-hex SHA-256`.
Tests: 64-no-hex falla, 63 hex falla, 65 hex falla, 64 hex lower/upper/mixto pasan,
ausente falla, y el JSON **no** contiene el hash. (Regex lineal y acotada — sin
backtracking catastrófico.)

---

## 4. Workflow argv safety

`ci-runner.mjs` usa `spawn(cmd, { shell: true })` con join por espacios → un input
con `;` se vuelve separador de comando. Por eso los steps con inputs del operador
**ya no pasan por ci-runner**; corren `npm` directo con **arrays bash citados** +
`| tee` (GH Actions usa `bash -eo pipefail`, así que el código de salida de npm se
preserva):

```bash
LAB_ARGS=(--preset "$INPUT_PRESET" --all-fixtures --json --output ares-v6-internal-lab-report.json --label ci-internal-review)
if [ -n "$INPUT_TARGET_URL" ]; then LAB_ARGS+=(--url "$INPUT_TARGET_URL"); fi
npm run ares:v6:lab:run -- "${LAB_ARGS[@]}" 2>&1 | tee ci-logs/review-internal-lab.log
```

Sin `bash -c`, sin `eval`, sin `-- $VAR` (word-splitting), `if/fi` en vez de `&&`
(no rompe `set -e`). `workflow-safety.test.ts` lo verifica estáticamente.

---

## 5. CI verde NO equivale a aprobación humana

> **CI success = el tooling es correcto.**
> **Human Review Packet FINAL = la decisión humana.**

El gate verde sólo dice que lint/tsc/test/smoke pasan. **No** dice que ARES v6 esté
listo para beta ni público. La closed-beta sólo se diseña si, sobre **evidencia
real**:

```
evidenceFixtureCoverage ≥ umbral
AND structuralRisk = CLEAR
AND UI smoke passed
AND deployment protection verificada (humano)
AND decidedBy + rationale presentes (FINAL, no DRAFT)
```

Con fixtures-only `evidenceFixtureCoverage = 0` ⇒ recomendación
**NO_GO_MORE_EVIDENCE**. No se maquilla.

---

## 6. Qué debe validar el operador antes de 3G

Ver `OPERATOR-PRE-3G-CHECKLIST.md` (21 ítems): environment protegido + secrets,
token hash SHA-256 real, Vercel Deployment Protection activo, preview protegido,
ruta oculta sin nav/sitemap, flags correctos, primer batch sin feedback, y la regla
de oro: **DRAFT sigue DRAFT sin humano; no se diseña closed-beta con evCov=0**.

---

## 7. Estado

Pre-Activation Seal listo. 3G queda como **ejecución real** (operador corre el
workflow con `targetUrl`), no más preparación. La UI sigue OFF/oculta/read-only.
