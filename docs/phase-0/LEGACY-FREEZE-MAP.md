# SensiPRO — Legacy Freeze Map

**Rama:** `refactor/phase-0-nuclear-refoundation`  
**Objetivo:** congelar el producto anterior sin romper producción y declarar qué se reemplaza por ARES Engine v6.

---

## 1. Regla de oro

Nada legacy se borra todavía. Todo se mantiene operativo hasta que v6 tenga:

1. fixtures reales por dispositivo;
2. tests de calibración;
3. rutas v6 aisladas;
4. UI de laboratorio;
5. feedback loop mínimo;
6. plan de rollback.

---

## 2. Legacy: sensibilidad

| Archivo | Estado | Motivo | Reemplazo |
|---|---|---|---|
| `packages/algorithms/src/sensitivity-engine.ts` | LEGACY | Mezcla escala 0–100/0–200 y no representa rangos modernos; depende de fallbacks si no se pasa PPI. | `packages/algorithms/src/engine-v6/*` |
| `packages/algorithms/src/calibration-engine.ts` | LEGACY | Genera 6 combinaciones útiles, pero está acoplado al motor anterior y a offsets fijos. | `engine-v6/calibration.ts` |
| `packages/algorithms/src/gyroscope-engine.ts` | LEGACY | Funciona como helper, pero no considera perfil de dedos, modo, arma, síntoma ni rendimiento. | `engine-v6/gyro.ts` |
| `packages/algorithms/src/headshot-engine.ts` | LEGACY | Headshot vive separado del motor principal y duplica lógica. | `engine-v6/headshot.ts` |
| `packages/algorithms/src/headshot-finger-engine.ts` | RECUPERAR COMO INSUMO | Tiene datos de dedos útiles; debe convertirse en señal del motor central. | `engine-v6/fingers.ts` |
| `packages/algorithms/src/finger-profiles.ts` | RECUPERAR COMO INSUMO | Buen punto de partida para HUD/dedos. | `engine-v6/hud/finger-profiles.ts` |
| `packages/algorithms/src/weapon-categories.ts` | RECUPERAR COMO INSUMO | Útil para Weapon Lab, pero necesita versionado por patch/meta. | `engine-v6/weapons.ts` |

---

## 3. Legacy: rutas API

| Ruta | Estado | Problema | Acción |
|---|---|---|---|
| `src/app/api/generate/route.ts` | LEGACY | No pasa `screenDpi`; genera y cachea sensibilidad antigua. | Crear `/api/generate/v6` y luego migrar. |
| `src/app/api/generate/all/route.ts` | LEGACY | No pasa `screenDpi`; 6 combinaciones sin feedback real. | Reemplazar por `/api/generate/v6/all`. |
| `src/app/api/generate/headshot/route.ts` | LEGACY | No pasa `screenDpi`; headshot separado del contexto completo. | Integrar como preset v6. |
| `src/app/api/export/route.ts` | LEGACY PARCIAL | Exporta valores antiguos. | Export v6 debe incluir explicación, HUD y tuning. |
| `src/app/api/payments/*` | NO TOCAR EN FASE 0 | Pagos no forman parte del motor, pero luego requieren hardening. | Fase Seguridad. |

---

## 4. Legacy: marketing y claims

| Área | Estado | Problema | Acción |
|---|---|---|---|
| Landing testimonials | LEGACY | Valores y claims ligados a motor viejo; pueden prometer algo que ya no calcula el engine actual. | Reescribir después de v6. |
| `src/lib/landing-data.ts` | LEGACY PARCIAL | Conteos útiles, narrativa de tapering antigua. | Conservar conteos reales, cambiar narrativa. |
| `ALGORITHM-AUDIT.md` | HISTÓRICO | Audita v4, no v6. | Mantener como evidencia histórica; crear auditoría v6. |
| `CLAUDE.md` | LEGACY DOCUMENTATION | Arquitectura gigante pero no refleja refundación. | Crear apéndice v6 o nuevo master plan. |

---

## 5. Legacy: datos

| Dataset | Estado | Acción |
|---|---|---|
| Device DB | RECUPERAR | Auditar specs y asegurar `screenDpi/ppi` en todas las rutas. |
| HUD codes | RECUPERAR | Convertir a HUD Lab con rating y filtros. |
| Weapon categories | RECUPERAR | Versionar por patch OB/meta. |
| Guides/tips | RECUPERAR PARCIAL | Reescribir academia como entrenamiento + laboratorio. |
| Testimonials | REEMPLAZAR | Usar feedback real cuando exista. |

---

## 6. Nuevos módulos v6 obligatorios

```txt
packages/algorithms/src/engine-v6/types.ts
packages/algorithms/src/engine-v6/presets.ts
packages/algorithms/src/engine-v6/dpi-curve.ts
packages/algorithms/src/engine-v6/device-profile.ts
packages/algorithms/src/engine-v6/sensitivity.ts
packages/algorithms/src/engine-v6/gyro.ts
packages/algorithms/src/engine-v6/fire-button.ts
packages/algorithms/src/engine-v6/hud.ts
packages/algorithms/src/engine-v6/weapons.ts
packages/algorithms/src/engine-v6/tuning.ts
packages/algorithms/src/engine-v6/confidence.ts
packages/algorithms/src/engine-v6/explain.ts
packages/algorithms/src/engine-v6/index.ts
```

---

## 7. Rutas v6 objetivo

```txt
POST /api/generate/v6
POST /api/generate/v6/tune
POST /api/hud/v6/generate
POST /api/feedback/v6
GET  /api/meta/v6
```

---

## 8. Criterio para declarar Fase 0 terminada

- [x] Rama de refundación creada.
- [x] Dossier de investigación creado.
- [x] Contratos de dominio v6 creados.
- [x] Taxonomía de presets creada.
- [x] Export público de engine-v6 creado.
- [ ] Matriz de investigación técnica creada.
- [ ] Spec de Fase 1 creada.
- [ ] Fixtures de dispositivos reales definidos.
- [ ] Plan de migración API definido.

---

## 9. Criterio para tocar producción

No se toca producción hasta que:

1. el motor v6 genere rangos modernos 1–200;
2. el output use `screenDpi/ppi` real;
3. existan tests por dispositivos populares LATAM;
4. el usuario reciba explicación y tuning;
5. el resultado sea comparable contra investigación externa;
6. exista rollback al legacy.
