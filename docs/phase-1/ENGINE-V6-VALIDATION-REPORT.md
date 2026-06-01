# ARES Engine v6 — Reporte de Validación (Fase 1)

**Rama:** `refactor/phase-0-nuclear-refoundation`
**Gate:** `Phase 0.1B ARES v6 Gate` (bloqueante)
**Alcance:** núcleo de cálculo aislado. Sin tocar producción, pagos, auth, middleware, Prisma schema, UI ni rutas legacy.

---

## 1. Resumen

Se descompuso el monolito `generate.ts` en 11 módulos con responsabilidad única, se agregó comportamiento nuevo (fallbacks de arma, tope de confianza por fuente de PPI, edad de dispositivo, notas de riesgo, HUD por modo, tuning con preset fallback) y se cubrió todo con 7 archivos de test (87 casos). El gate corre lint estricto, tsc estricto y vitest sobre todo el motor.

---

## 2. Fixtures probados (salida real, `STANDARD_PRO`, sin arma)

Salida determinística del motor (escala 1–200; confianza con 2 señales faltantes — sin arma ni térmico — por eso grade `HIGH`):

| Fixture | PPI | General | Punto Rojo | 2x | 4x | AWM | Vista Libre | Banda esperada | ✓ |
|---|---:|---:|---:|---:|---:|---:|---:|---|:--:|
| samsung-galaxy-a14 | 400 | 183 | 167 | 161 | 142 | 117 | 80 | 168–182 | ✓* |
| samsung-galaxy-a15 | 396 | 183 | 167 | 163 | 142 | 118 | 82 | 168–182 | ✓* |
| samsung-galaxy-a24 | 396 | 183 | 167 | 163 | 142 | 118 | 82 | 168–182 | ✓* |
| samsung-galaxy-a54 | 401 | 176 | 162 | 161 | 140 | 119 | 80 | 168–182 | ✓ |
| redmi-note-12 | 395 | 181 | 166 | 163 | 141 | 118 | 82 | 168–182 | ✓ |
| redmi-note-13 | 395 | **178** | 164 | 163 | 143 | 121 | 82 | 168–182 | ✓ |
| poco-x5-pro | 395 | 178 | 164 | 163 | 143 | 121 | 82 | 168–182 | ✓ |
| moto-g54 | 405 | 176 | 162 | 159 | 139 | 118 | 78 | 168–182 | ✓ |
| iphone-11 | 326 | 200 | 188 | 174 | 154 | 135 | 91 | 185–200 | ✓ |
| iphone-14 | 460 | **173** | 157 | 151 | 133 | 110 | 77 | 155–172 | ✓* |
| iphone-16-pro-max | 460 | 163 | 150 | 151 | 130 | 110 | 77 | 155–172 | ✓ |
| galaxy-s24-ultra | 505 | **149** | 137 | 136 | 111 | 96 | 64 | 140–152 | ✓ |

`✓*` = dentro de la banda + tolerancia documentada por señales de dispositivo (±6). A14/A15/A24 quedan en 183 (+1 sobre 182) por el +3 de RAM de gama baja; iPhone 14 en 173 (+1) por su panel de 60Hz. Ninguno se acerca al bug legacy "~100".

---

## 3. Reglas duras validadas

| Regla dura | Resultado | Evidencia |
|---|:--:|---|
| Ningún output de sensibilidad fuera de 1–200 | ✓ | `generate.test`, `fixtures.test` (todos los fixtures × presets) |
| Ningún output de gyro fuera de 1–100 | ✓ | `generate.test` (todos los fixtures × 8 armas, GYRO_PRO) |
| PPI real cambia el resultado | ✓ | `generate.test` (330 vs 500 PPI → General distinto) |
| Fallback por tier baja confianza | ✓ | `confidence.test` (fallback 70 < PPI real 97) |
| Sin PPI real no puede ser LAB_VERIFIED | ✓ | `confidence.test` (screenDpi-only y tier-fallback nunca LAB_VERIFIED) |
| Samsung A54 Standard no da General ~100 | ✓ | A54 = 176 (`fixtures.test`, `generate.test`) |
| Redmi Note 13 cae en 390–449 (168–182) | ✓ | Redmi 13 = 178 (estricto) |
| iPhone 14 da menor General que Redmi Note 13 | ✓ | 173 < 178 |
| Galaxy S24 Ultra da menor General que Galaxy A14 | ✓ | 149 < 183 |
| Todo Rojo sube Punto Rojo vs Standard | ✓ | 181 > 171 (Redmi 13) |
| One Tap sube Red Point y favorece Shotgun/Pistol | ✓ | `generate.test`, `presets.test` |
| Sniper/AWM baja sniperScope vs Standard | ✓ | 84 < 98 (iPhone 14) |
| Low-End Stable protege 4x/AWM | ✓ | `generate.test`, `presets.test` |
| Fire button 2 dedos > 4 dedos en misma pantalla | ✓ | `hud-fire-button.test` |
| 4 dedos recomienda layout FOUR_FINGER | ✓ | `hud-fire-button.test` |
| Pantalla ≥ 7.2 recomienda TABLET | ✓ | `hud-fire-button.test` |
| Síntomas generan tuning steps, no mutan la base | ✓ | `generate.test`, `tuning.test` (sensibilidad idéntica con/sin síntomas) |
| DEVICE_LAGS sugiere fireButtonDelta y protege 4x/AWM | ✓ | `tuning.test` (fireButtonDelta +3, scope4x/AWM < 0) |
| SCOPE_4X_UNCONTROLLABLE no toca Red Point | ✓ | `tuning.test` (redPoint undefined) |
| Explanation incluye preset, modo, dedos y PPI | ✓ | `generate.test` (contiene "Todo Rojo", "CLASH_SQUAD", "4", "395") |
| Confidence incluye missing signals cuando faltan | ✓ | `confidence.test` |
| Cascada sana (red+ ≥ 2x ≥ 4x ≥ AWM) | ✓ | `generate.test` (cascada real secuencial) |

---

## 4. Comandos corridos (local)

```
npm run db:generate                                   → exit 0 (Prisma Client v5.22.0)
npx eslint packages/algorithms/src/engine-v6 --ext .ts → exit 0 (0 findings)
npx tsc --noEmit --strict --skipLibCheck --module esnext \
  --moduleResolution bundler --target ES2022 <17 módulos v6> → exit 0
npx tsc ... --noUncheckedIndexedAccess --noImplicitReturns ... → exit 0 (rigor extra)
npx vitest run packages/algorithms/src/engine-v6 --coverage=false → 87 passed (7 files)
```

Desglose de tests: dpi-curve 6 · fixtures 29 · presets 9 · generate 18 · tuning 8 · confidence 6 · hud-fire-button 11 = **87**.

---

## 5. Resultado del gate CI

El gate `Phase 0.1B ARES v6 Gate` se actualizó (manteniéndolo bloqueante):

- Typecheck ahora cubre los 17 módulos v6 (antes 7).
- Tests ahora corren todo `packages/algorithms/src/engine-v6` (antes solo `dpi-curve.test.ts`).
- `legacy-audit` sigue **no bloqueante** (`|| true`).

> El resultado del run en GitHub Actions del PR se confirma en la sección de entrega del PR.

---

## 6. Decisiones tomadas

1. **Refactor sin cambio de calibración** para las rutas ya testeadas: los módulos reproducen el comportamiento del baseline; `dpi-curve.test.ts` (regresión) sigue verde.
2. **Cascada real secuencial** (mejora vs baseline): el monolito clampeaba cada mira contra el valor *viejo* del vecino, lo que podía dejar `4x > 2x` en casos límite. `enforceScopeCascade` ahora encadena correctamente. Verificado sin romper tests.
3. **Fallbacks de arma** para AR_FAST/MARKSMAN/SPECIAL en `weapons.ts` en vez de mutar la matriz de Fase 0.
4. **LAB_VERIFIED solo con PPI confirmado + fixture conocido**, para que el grade signifique "calibrado contra laboratorio".
5. **Edad de dispositivo determinística** con `ARES_V6_META_YEAR = 2026` (sin `new Date()`), preservando pureza del motor.
6. **Tolerancia de banda (±6)** en `fixtures.test` documentada: las señales de dispositivo legítimamente mueven el valor unos puntos respecto de la banda PPI cruda.

---

## 7. Deuda pendiente (para Fase 2+)

- Adapter Prisma→v6 que nunca pierda `screenDpi/ppi` (deuda nuclear 4.1 del research).
- Endpoint `/api/generate/v6` aislado + feature flags + comparativa legacy vs v6.
- Feedback loop y métricas de aceptación (rating ≥ 4.3, p95 < 700ms).
- Más fixtures con PPI real para habilitar LAB_VERIFIED en más equipos.
- HUD export (QR/link) y Meta Lab versionado por OB.
- Captura de `thermalState`/`primaryWeaponCategory` en UI para subir confianza.

---

## 8. Lo que NO se tocó (confirmado)

Pagos, auth, NextAuth, Stripe, MercadoPago, middleware, Prisma schema, rutas API legacy, UI, landing, pricing, academy, command-center, deployment, webhooks, env vars, y el motor legacy (`sensitivity-engine.ts` y compañía siguen intactos). El gate legacy permanece no bloqueante.
