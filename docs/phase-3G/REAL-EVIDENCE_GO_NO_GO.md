# Fase 3G — Plantilla de Decisión GO/NO-GO (Real Evidence)

> Llena esta plantilla a partir del Human Review Packet (`human-review-packet.md`) y
> de `ares-v6-real-evidence-validation.json`. El sistema RECOMIENDA; el humano DECIDE.
> Sin `decidedBy` + `rationale`, la decisión queda en **DRAFT**.

## Sesión

- Operador: ____
- Label: ____
- Fecha: ____
- Commit: ____
- Modo de ejecución (`execution.executionMode`): `real-http | dry-run-local`
- Target (redacted): ____
- Deployment protection verificada (humano): `sí | no`

## Evidencia (del packet + validación)

- `real-evidence-validation.passed`: `true | false`
- Modo evidencia (`snapshot.mode`): `from-db | fixtures-only`
- GO/NO-GO de muestra (`goNoGo.decision`): ____
- Riesgo estructural (`structuralRisk.decision`): `CLEAR | REVIEW_REQUIRED | BLOCKING`
- `evidenceFixtureCoverage` (gatea GO): ____
- `comparisonFixtureCoverage` (informativo): ____
- `totalGenerations`: ____  ·  feedback TRUSTED: ____  ·  feedbackCoverage: ____
- UI smoke (`ui-smoke.json`): `ran=__ passed=__`

## Checklist humano (marcar)

- [ ] Protección de deployment verificada (Vercel auth/password/trusted IPs).
- [ ] `/internal/ares-v6` oculta: sin nav, sin sitemap, sin SEO.
- [ ] Sin link público (navbar/footer/mobile-nav).
- [ ] Sin botón de aplicar/aprobar/publicar propuestas.
- [ ] El preview cambia al seleccionar fixture/preset (sin persistencia en la UI).
- [ ] `real-evidence-validation.passed = true`.
- [ ] `evidenceFixtureCoverage ≥ 0.8`.
- [ ] `structuralRisk = CLEAR`.
- [ ] `feedbackCoverage ≥ umbral`.
- [ ] UI smoke aprobada.
- [ ] Sin secretos en los artifacts.

## Decisión (elegir UNA)

- [ ] **NO_GO_FIX_BLOCKERS** — hay bloqueadores (smoke/readiness/BLOCKING/infra/motor).
- [ ] **NO_GO_MORE_EVIDENCE** — falta evidencia/feedback real (o modo dry-run-local).
- [ ] **GO_HIDDEN_UI_CONTINUE** — seguir iterando interno (sin closed-beta aún).
- [ ] **GO_PREPARE_CLOSED_BETA_DESIGN** — diseñar closed-beta (Fase 3H), sigue interno
  hasta nueva decisión humana.

## Rationale (obligatorio para FINAL)

- ____

## Firma (para FINAL)

- decidedBy: ____
- decidedAt: ____
- Follow-ups requeridos: ____
- Riesgos aceptados: ____
- Acciones rechazadas: ____

---

## Invariantes (no negociables)

1. **CI verde ≠ aprobación.** CI success = tooling correcto; packet **FINAL** (con
   `decidedBy` + `rationale`) = decisión humana.
2. El sistema RECOMIENDA, no aprueba. Sin `decidedBy` + `rationale` ⇒ DRAFT.
3. `evidenceFixtureCoverage = 0`, `structuralRisk ≠ CLEAR`, deployment protection no
   verificada, UI smoke en fallo, o modo dry-run-local ⇒ **no** se recomienda ni se
   puede FINALIZAR closed-beta (el packet lo bloquea: `finalizationBlockedReasons`).
4. Ningún feedback/propuesta modifica el motor (`autoApplyAllowed` SIEMPRE false).
5. `GO_PREPARE_CLOSED_BETA_DESIGN` ≠ producción pública. Es **diseño**, detrás de flag
   y de otra decisión humana.
6. Real mode con evidencia fixtures-only / evCov=0 / 0 generaciones ⇒ el
   `validate-real-evidence` falla el run. **Eso es un NO-GO honesto, no un error.**
