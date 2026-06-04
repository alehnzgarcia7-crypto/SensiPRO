# Fase 3F — Protocolo de Revisión Humana

Cómo se conduce una sesión interna real de ARES v6 y cómo se decide.
**El sistema recomienda; un humano decide.** Ninguna propuesta se auto-aplica;
el motor no se modifica.

---

## 1. Flujo de la sesión

```
1. Operador prepara entorno protegido (secrets del environment ares-v6-internal-lab).
2. Preflight env        → npm run ares:v6:verify-env -- --strict --target <t>
3. UI readiness         → npm run ares:v6:ui-readiness -- --strict --target <t>
4. Lab runner           → npm run ares:v6:lab:run -- ... --json --output lab.json
5. (http target) persiste generaciones reales vía la ruta.
6. Evidence report      → npm run ares:v6:evidence -- --from-db --legacy-compare --summary-only --json --output ev.json
7. UI smoke (browser)   → npm run ares:v6:ui:smoke      (opcional, manual)
8. Human review packet  → npm run ares:v6:human-review -- --evidence-json ev.json ...
9. Un humano llena la decisión (decidedBy + rationale) → FINAL.
```

Todo lo anterior está orquestado por el workflow manual
`.github/workflows/ares-v6-internal-review-session.yml` (workflow_dispatch only).

---

## 2. El Human Review Packet

`human-review-packet.json` + `.md`. Secciones:

1. Metadata de sesión (label, operador, entorno, commit, target).
2. Evidencia · GO/NO-GO.
3. Cobertura **EVIDENCIA** vs **COMPARACIÓN** (separadas).
4. Filas de alto riesgo (resumen, sin vectores).
5. Prueba de humo de la UI.
6. Checklist humano (auto + manual).
7. Hallazgos (findings derivados + los que agregue el humano).
8. Próximas acciones (de la evidencia).
9. **Bloque de decisión** (DRAFT por defecto).

**Sin secretos** (sanitizer redacta tokens / 64-hex / Bearer). **Sin DB write.**

---

## 3. Checklist humano

| Ítem | Tipo |
|---|---|
| Protección de deployment verificada (Vercel auth/password/trusted IPs) | humano |
| /internal/ares-v6 oculta: sin nav/sitemap/SEO | humano |
| Sin link público | humano |
| Sin botón aplicar/aprobar/publicar | humano |
| Preview cambia al seleccionar fixture/preset (sin persistencia) | humano |
| `evidenceFixtureCoverage ≥ umbral` | auto |
| `structuralRisk = CLEAR` | auto |
| `feedbackCoverage ≥ umbral` | auto |
| Prueba de humo de la UI aprobada | auto |

---

## 4. Estados de decisión

| Decisión | Cuándo |
|---|---|
| **NO_GO_FIX_BLOCKERS** | Smoke falló · readiness falló · `structuralRisk=BLOCKING` · `NO_GO_INFRA` · `NO_GO_FIX_ENGINE`. |
| **NO_GO_MORE_EVIDENCE** | `evidenceCoverage < umbral` · `feedbackCoverage < umbral` · `NO_GO_MORE_DATA` · `structuralRisk=REVIEW_REQUIRED`. |
| **GO_HIDDEN_UI_CONTINUE** | UI sana, sin bloqueadores, pero aún sin alcanzar el bar de closed-beta (seguir iterando interno). |
| **GO_PREPARE_CLOSED_BETA_DESIGN** | `GO_INTERNAL_UI_EXPERIMENT` + `structuralRisk=CLEAR` + cobertura/feedback ≥ umbral + smoke OK + protección de deployment verificada. |

**Precedencia:** blockers → more-evidence → closed-beta-ready → continue.
**Default (sin métricas reales / fixtures-only):** `NO_GO_MORE_EVIDENCE`.

### Matriz de decisión

```
                          ┌─────────────────────────────────────────────┐
                          │ ¿smoke fail / readiness fail / BLOCKING /    │
                          │  NO_GO_INFRA / NO_GO_FIX_ENGINE?             │
                          └───────────────┬─────────────────────────────┘
                            sí            │ no
                  ┌─────────▼─────────┐   │
                  │ NO_GO_FIX_BLOCKERS│   │
                  └───────────────────┘   ▼
                          ┌─────────────────────────────────────────────┐
                          │ ¿evCov<u / fbCov<u / NO_GO_MORE_DATA /       │
                          │  REVIEW_REQUIRED?                           │
                          └───────────────┬─────────────────────────────┘
                            sí            │ no
                  ┌─────────▼─────────┐   │
                  │ NO_GO_MORE_EVIDENCE│  │
                  └───────────────────┘   ▼
                          ┌─────────────────────────────────────────────┐
                          │ ¿GO + CLEAR + cobertura + feedback + smoke + │
                          │  deployment-protection-verified?            │
                          └───────────┬───────────────┬─────────────────┘
                          sí          │            no │
              ┌───────────▼─────────┐ │  ┌────────────▼──────────┐
              │GO_PREPARE_CLOSED_BETA│ │  │ GO_HIDDEN_UI_CONTINUE  │
              └─────────────────────┘ │  └───────────────────────┘
```

---

## 5. Regla de decisión final

- El packet nace **DRAFT** con una **recomendación** del sistema.
- Pasa a **FINAL** sólo cuando un humano registra `decidedBy` + `rationale`
  (+ `decision`). Sin eso, **no hay decisión final**.
- `GO_PREPARE_CLOSED_BETA_DESIGN` jamás es público por sí mismo: habilita el
  **diseño** de la closed-beta (Fase 3G), siempre detrás de decisión humana.

> **No autocalibración:** ningún feedback ni propuesta modifica engine, presets,
> research-matrix o fixtures. Las propuestas son `autoApplyAllowed=false`,
> `humanReviewRequired=true`.

Plantilla de decisión: `GO-NO-GO-DECISION-TEMPLATE.md`.
