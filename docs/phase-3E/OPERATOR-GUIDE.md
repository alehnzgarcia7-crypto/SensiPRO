# Fase 3E — Guía del Operador · ARES v6 Command Lab

Cómo activar, ver y razonar sobre la UI interna oculta de ARES v6.
**Todo es solo lectura.** La decisión de activar UI experimental pública sigue
siendo **humana**.

---

## 1. Ruta

```
/internal/ares-v6
```

OFF por defecto ⇒ responde **404** (stealth, indistinguible de una página
inexistente). No hay link en ningún nav; no está en el sitemap; `noindex,nofollow`.

---

## 2. Flags (server-side)

| Flag | Efecto | Default |
|---|---|---|
| `ARES_V6_INTERNAL_UI_ENABLED` | **Gate único** de la ruta. `true` ⇒ visible (según entorno). Off ⇒ 404. | `false` |
| `ARES_V6_INTERNAL_UI_ALLOW_PRODUCTION` | En `NODE_ENV=production`, **acuse** de que hay protección de deployment (Vercel password / protected preview). Sin él ⇒ 404 en prod. | `false` |
| `NEXT_PUBLIC_ARES_V6_ENABLED` | **Solo hint de cliente.** NUNCA seguridad. Solo puede *suprimir* un link (que de todos modos no existe). | `false` |
| `ARES_V6_LAB_EVIDENCE_ENABLED` | (3D) Surface flag. Solo se **muestra** su estado en el footer de operador. | `false` |
| `ARES_V6_API_ENABLED` / `ARES_V6_LAB_METRICS_ENABLED` | (3C) Surface flags. Solo informativos en la UI. | `false` |

> **Regla de oro:** poner `NEXT_PUBLIC_ARES_V6_ENABLED=true` **no** da acceso. Solo
> `ARES_V6_INTERNAL_UI_ENABLED=true` (server) abre la ruta.

### Activación local (lab / dev)

```bash
ARES_V6_INTERNAL_UI_ENABLED=true npm run dev
# abrir http://localhost:3000/internal/ares-v6
```

### Activación en producción (protegida)

1. Poner deployment protection delante (Vercel password / protected preview).
2. Setear ambos:
   ```
   ARES_V6_INTERNAL_UI_ENABLED=true
   ARES_V6_INTERNAL_UI_ALLOW_PRODUCTION=true
   ```
3. Sin el acuse (`_ALLOW_PRODUCTION`), prod responde **404** aunque el gate esté on.

---

## 3. Qué ves (secciones)

| Sección | Muestra |
|---|---|
| **Hero** | GO/NO-GO global, riesgo estructural, cobertura evidencia vs comparación, modo, postura. |
| **Consola de generación** | Selector fixture × preset → preview read-only (sin persistir). |
| **Preview** | Sensibilidad (6 sliders) + giroscopio, HUD + botón de disparo, confianza + DPI/PPI, explicación, primeros ajustes. |
| **Veredicto GO/NO-GO** | Decisión + razonamiento + criterios fallidos (categoría) + métricas + advertencias + próximas acciones. |
| **Riesgo estructural** | CLEAR / REVIEW_REQUIRED / BLOCKING + conteos + rationale. BLOCKING ⇒ banner de alerta. |
| **Cobertura de fixtures** | **EVIDENCIA** (DB real, gatea GO) y **COMPARACIÓN** (fixtures-only, informativa) **separadas visualmente**. |
| **Comparación legacy vs v6** | Resumen (esperadas/revisar/peligrosas), por preset, filas de alto riesgo (sin vectores crudos). |
| **Propuestas** | Read-only, human-gated: `autoApplyAllowed=false`, `humanReviewRequired=true`, blockedReasons. **Sin botón de aplicar.** |
| **Contexto del operador** | Modo/entorno, postura, superficies v6 activas (solo nombres de flag). |

---

## 4. Cómo leer la evidencia (lo crítico)

- **Cobertura de EVIDENCIA ≠ Cobertura de COMPARACIÓN.** Solo la EVIDENCIA (DB real)
  gatea GO. La COMPARACIÓN fixtures-only es referencia; **NO es evidencia**.
- **Riesgo estructural es independiente** del tamaño de muestra. Un `BLOCKING`
  (filas DANGEROUS) se ve **aunque** el veredicto sea `NO_GO_MORE_DATA`.
- **GO/NO-GO es asesor, no autoridad.** Incluso `GO_INTERNAL_UI_EXPERIMENT`
  requiere decisión humana para activar UI experimental.
- **Las propuestas son evidencia para humanos, nunca acciones.** No hay aplicar /
  aprobar / publicar. `autoApplyAllowed` es **siempre** `false`.

Estado actual (fixtures-only, sin lab activado): `evidenceCoverage = 0`,
fuente **FIXTURES_ONLY**, decisión `NO_GO_MORE_DATA`. Esto es **esperado** hasta
recolectar evidencia real persistida.

---

## 5. Prueba manual (smoke de UI)

Sin infra de e2e nueva; verificación manual:

1. **OFF ⇒ 404:** sin flag, `GET /internal/ares-v6` ⇒ 404 genérico.
2. **ON dev ⇒ render:** `ARES_V6_INTERNAL_UI_ENABLED=true npm run dev` ⇒ dashboard.
3. **Preview:** cambiar fixture/preset ⇒ el preview cambia sin recargar (server action).
4. **Coverage separada:** "Cobertura de EVIDENCIA" y "Cobertura de COMPARACIÓN" en bloques distintos; la comparación dice "NO es evidencia".
5. **Riesgo estructural visible** incluso bajo NO_GO.
6. **Propuestas:** sin botón de aplicar; dice "Nunca auto-aplicar" / "Auto-aplicar: NO".
7. **HTML sin secretos:** ver-fuente no contiene token/hash/IP/body.

(No se requieren screenshots.)

---

## 6. Límites (no-go conocidos)

- **NO** es UI pública. No exponer en nav/sitemap/SEO.
- **NO** persiste, **NO** escribe feedback, **NO** aplica propuestas, **NO** toca el motor.
- La evidencia es fixtures-only hasta activar el lab interno real (3C runbook).
- En navegador no se porta el token interno: la protección de prod es por
  deployment + env, no por header-token (ese sigue para la API).

---

## 7. GO / NO-GO de esta fase

- ✅ **GO** para **UI interna oculta read-only** (esta entrega).
- ⛔ **NO-GO** para **UI pública**. Requiere, como mínimo: lab interno activado con
  evidencia real, `evidenceFixtureCoverage ≥ 0.8`, `structuralRisk = CLEAR`,
  `decision = GO_INTERNAL_UI_EXPERIMENT`, y **decisión humana explícita**.

---

## 8. Fase 3F — Ejecución de sesión real (siguiente capa)

Para correr una **sesión interna real** (readiness + lab + evidencia + smoke +
human review packet + decisión), ver `docs/phase-3F/`:

```bash
npm run ares:v6:ui-readiness -- --strict --target preview        # ¿entorno listo?
npm run ares:v6:ui:smoke                                          # browser smoke (manual)
npm run ares:v6:human-review -- --evidence-json ev.json --operator <tú> --json --markdown
```

Flags nuevos 3F: `ARES_V6_INTERNAL_UI_ALLOW_PRODUCTION` (ack de protección, ya en 3E);
el resto reutiliza los flags 3C/3D. La protección de deployment (Vercel
auth/password/trusted IPs) es un **checklist humano**, no un flag. Workflow manual:
`ares-v6-internal-review-session.yml`. Decisión: `docs/phase-3F/GO-NO-GO-DECISION-TEMPLATE.md`.

**Antes de ejecutar 3G real:** `docs/phase-3F/PRE-ACTIVATION-SEAL.md` (seal técnico)
y `docs/phase-3F/OPERATOR-PRE-3G-CHECKLIST.md` (21 ítems). Recuerda: **CI verde =
tooling correcto; Human Review Packet FINAL = decisión humana.**
