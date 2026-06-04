# ARES v6 — Checklist del Operador antes de 3G

Obligatorio **antes** de ejecutar el workflow manual con un `targetUrl` real.
Marca cada ítem. Si alguno falla, **no** ejecutes 3G.

Procedimiento completo de 3G: `docs/phase-3G/REAL-EVIDENCE-ACTIVATION-RUNBOOK.md`,
`docs/phase-3G/REAL-EVIDENCE_OPERATOR_GUIDE.md` y la plantilla
`docs/phase-3G/REAL-EVIDENCE_GO_NO_GO.md`.

> Recordatorio: **CI verde = tooling correcto. Human Review Packet FINAL = decisión
> humana.** Ninguno de estos ítems se valida solo por tener el gate en verde.

---

## Environment y secrets

- [ ] 1. GitHub environment **`ares-v6-internal-lab`** existe.
- [ ] 2. **Required reviewers** configurados en el environment.
- [ ] 3. **Prevent self-review** activado (si aplica a tu org/plan).
- [ ] 4. Secrets configurados en el environment:
  - [ ] `ARES_V6_INTERNAL_ACCESS_TOKEN`
  - [ ] `ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256`
  - [ ] `ARES_V6_LOG_SALT`
  - [ ] `DATABASE_URL`
  - [ ] `REDIS_URL`
- [ ] 5. `ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256` es un **SHA-256 hex real**
  (`/^[a-f0-9]{64}$/i`) y es el hash del `ARES_V6_INTERNAL_ACCESS_TOKEN`.

## Protección de deployment (no es un flag — es verificación humana)

- [ ] 6. **Vercel Deployment Protection** activo (Authentication / Password / Trusted IPs).
- [ ] 7. **Preview URL protegido** (no accesible sin la protección anterior).
- [ ] 8. `/internal/ares-v6` **no aparece** en ningún nav (navbar/footer/mobile).
- [ ] 9. `/internal/ares-v6` **no aparece** en el sitemap.

## Flags (preview/lab, nunca producción pública)

- [ ] 10. `ARES_V6_INTERNAL_UI_ENABLED=true` **sólo** en preview/lab.
- [ ] 11. `ARES_V6_API_ENABLED=true` **sólo** para el lab (modo http).
- [ ] 12. `ARES_V6_PERSIST_GENERATIONS=true` (para evidencia real).
- [ ] 13. `ARES_V6_WRITE_FEEDBACK=false` en el **primer batch** (abrir feedback sólo después).
- [ ] 14. `ARES_V6_RATE_LIMIT_FAIL_MODE=closed`.
- [ ] 15. `ARES_V6_PROXY_TRUST_MODE=strict`.
- [ ] 16. `ARES_V6_LOG_SALT` fuerte (≥16 chars, aleatorio).

## Ejecución y revisión

- [ ] 17. Workflow manual **`ares-v6-internal-review-session`** ejecutado con `targetUrl`.
- [ ] 18. Artifacts descargados (`ares-v6-real-execution-mode.json`,
  `ares-v6-target-url-check.json`, `ares-v6-internal-lab-report.json`,
  `ares-v6-evidence-summary.json` + `.md`, `ares-v6-ui-smoke.json`,
  `ares-v6-real-evidence-validation.json`, `human-review-packet.json` + `.md`).
- [ ] 19. **Human Review Packet revisado** (evidencia, riesgo estructural, smoke, hallazgos).
- [ ] 19b. `ares-v6-real-execution-mode.json` dice `mode=real-http` y
  `ares-v6-real-evidence-validation.json` dice `passed=true`.
- [ ] 20. La decisión sigue **DRAFT** si **no** hay humano (`decidedBy` + `rationale`).
- [ ] 21. **No** se diseña closed-beta si `evidenceFixtureCoverage = 0` (o `< umbral`),
  `structuralRisk ≠ CLEAR`, deployment protection no verificada, UI smoke en fallo, o
  `ares-v6-real-evidence-validation.json` con `passed=false`.

---

## Pre-flight automatizable (corre antes de ejecutar)

```bash
# Preview readiness (debe PASS antes de activar):
npm run ares:v6:verify-env -- --strict --for-workflow --target preview
npm run ares:v6:ui-readiness -- --strict --target preview --with-persistence
# Contrato del targetUrl (debe PASS; emite el modo de ejecución):
npm run ares:v6:target-check -- --target-url "$TARGET_URL" --for-workflow --probe \
  --emit-mode ares-v6-real-execution-mode.json
```

Si cualquiera sale con exit 1 → corrige antes de 3G. La protección de deployment
(ítems 6–7) **no** la detecta el preflight ni el target-check (el probe es sólo
warning, un preview protegido responde 401/403): es verificación **humana**. Dentro
del workflow, `ares:v6:validate-real-evidence` audita los artifacts y **falla el run**
en modo real sin evidencia real (eso es un NO-GO honesto, no un error).
