# ARES v6 — Plantilla de Decisión GO/NO-GO (Fase 3F)

> Copiar este bloque, llenarlo a mano tras revisar el `human-review-packet.md`.
> El packet trae una **recomendación**; esta plantilla la convierte en **decisión
> FINAL** sólo con `decidedBy` + `rationale`. Ninguna propuesta se auto-aplica.

---

## Sesión

- **Label:** `____`
- **Operador / decididor (decidedBy):** `____`
- **Fecha (decidedAt):** `____`
- **Commit:** `____`
- **Entorno / target:** `____`
- **Recomendación del sistema:** `____` (del packet)

## Evidencia (del packet)

- Modo: `from-db | fixtures-only`
- GO/NO-GO: `____`
- Riesgo estructural: `CLEAR | REVIEW_REQUIRED | BLOCKING`
- evidenceFixtureCoverage: `____`  ·  comparisonFixtureCoverage: `____`
- feedbackCoverage: `____`  ·  generaciones: `____`  ·  feedback TRUSTED: `____`

## Checklist humano (marcar)

- [ ] Protección de deployment verificada (Vercel auth/password/trusted IPs)
- [ ] /internal/ares-v6 oculta (sin nav/sitemap/SEO)
- [ ] Sin link público
- [ ] Sin botón aplicar/aprobar/publicar
- [ ] Preview funciona (sin persistencia)
- [ ] evidenceFixtureCoverage ≥ 0.8
- [ ] structuralRisk = CLEAR
- [ ] feedbackCoverage ≥ 0.3
- [ ] UI smoke aprobada

## Decisión (elegir UNA)

- [ ] **NO_GO_FIX_BLOCKERS** — hay bloqueadores (smoke/readiness/estructural/infra/motor).
- [ ] **NO_GO_MORE_EVIDENCE** — falta evidencia/feedback real.
- [ ] **GO_HIDDEN_UI_CONTINUE** — seguir iterando interno (sin closed-beta aún).
- [ ] **GO_PREPARE_CLOSED_BETA_DESIGN** — diseñar closed-beta (Fase 3G), sigue interno hasta nueva decisión humana.

## Rationale (obligatorio para FINAL)

- `____`
- `____`

## Follow-ups requeridos

- `____`

## Riesgos aceptados

- `____`

## Acciones rechazadas

- `____`

---

**Invariantes (no negociables):**

- **CI verde ≠ aprobación.** CI success = tooling correcto; Human Review Packet
  FINAL = decisión humana (con `decidedBy` + `rationale`).
- El sistema RECOMIENDA, no aprueba. Sin `decidedBy` + `rationale` ⇒ DRAFT.
- `evidenceCoverage=0` o `structuralRisk≠CLEAR` ⇒ **no** se recomienda closed-beta.
- Ningún feedback/propuesta modifica el motor (autoApply SIEMPRE false).
- `GO_PREPARE_CLOSED_BETA_DESIGN` ≠ producción pública. Es diseño, detrás de flag y
  de otra decisión humana.
