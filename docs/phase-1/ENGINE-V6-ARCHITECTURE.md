# ARES Engine v6 — Arquitectura (Fase 1)

**Rama:** `refactor/phase-0-nuclear-refoundation`
**Estado:** Fase 1 completada — núcleo modular, testeable y aislado de producción.
**Fuente de verdad:** `packages/algorithms/src/engine-v6/`

> El motor v6 **no** está conectado a producción. No reemplaza `/api/generate`, no toca pagos, auth, middleware, Prisma schema, UI ni rutas legacy. Es un laboratorio de cálculo puro y determinístico.

---

## 1. Qué cambió en Fase 1

Fase 0 dejó un único archivo `generate.ts` (~311 líneas) con **toda** la lógica adentro (math, señales de dispositivo, armas, botón, HUD, gyro, tuning, confianza y explicación). Fase 1 descompone ese monolito en módulos con una sola responsabilidad cada uno, sin cambiar el comportamiento calibrado de las rutas ya cubiertas por tests.

`generate.ts` quedó como **orquestador delgado** (~50 líneas): resuelve preset + perfil de dispositivo, corre el pipeline de sensibilidad y ensambla el paquete. No contiene lógica de calibración.

---

## 2. Mapa de módulos

```
engine-v6/
├── types.ts            (Fase 0) Contratos de dominio — sin dependencias
├── presets.ts          (Fase 0) 20 presets + lookup
├── research-matrix.ts  (Fase 0) Bandas PPI, reglas de señal, síntomas, armas
├── dpi-curve.ts        (Fase 0) Resolución de PPI efectivo + base por banda
├── fixtures.ts         (Fase 0 + F1) 12 fixtures LATAM + matcher por dispositivo
│
├── math.ts             (F1) clamp/round/lerp/applyDelta/mergeDelta/enforceScopeCascade
├── device-profile.ts   (F1) PPI efectivo, delta por hardware, edad, riesgos, penalización
├── sensitivity.ts      (F1) generateBase → applyPreset → applyWeapon → finalize
├── weapons.ts          (F1) delta/drag/fireButton/training/riesgo por arma (+ fallbacks)
├── gyro.ts             (F1) giroscopio derivado de la sensibilidad final
├── fire-button.ts      (F1) tamaño/opacidad/posición/drag del botón de disparo
├── hud.ts              (F1) layout family + botones prioritarios por modo/intención
├── tuning.ts           (F1) síntomas → pasos de tuning (máx 3) con protocolo
├── confidence.ts       (F1) score 0-100 + grade con tope por fuente de PPI
├── explain.ts          (F1) explicación humana (preset, modo, dedos, PPI, protocolo)
├── generate.ts         (F1) orquestador
└── index.ts            (F1) API pública
```

Cada módulo depende solo "hacia abajo" (sin ciclos): `math` y `types` son hojas; `generate` es la raíz.

---

## 3. Pipeline de generación

```
generateAresV6(input)
  │
  ├─ getAresV6Preset(presetId)                 → preset
  ├─ resolveDeviceProfile(device)              → { effectivePpi, signalDelta, riskNotes, confidencePenalty, deviceAgeYears, ... }
  │
  ├─ SENSIBILIDAD (sensitivity.ts + math.ts)
  │    base      = generateBaseSensitivity(effectivePpi.ppi)     // banda PPI
  │    +device   = applyDelta(base, profile.signalDelta)         // RAM/Hz/panel/pantalla/térmico/cliente/boost/ping
  │    +preset   = applyPresetToSensitivity(+device, preset)     // sesgo aditivo del preset
  │    +arma     = applyWeaponToSensitivity(+preset, weapon)     // sesgo por categoría de arma
  │    final     = finalizeSensitivity(+arma)                    // cascada de miras
  │
  ├─ gyroscope   = buildGyroscope(input, final)                 // null si no usa gyro
  ├─ dpi         = buildDpiRecommendation(effectivePpi)
  ├─ fireButton  = buildFireButton(input)
  ├─ hud         = buildHud(input)
  ├─ confidence  = buildConfidence(input, effectivePpi, devicePenalty)
  ├─ explanation = buildExplanation(input, { preset, effectivePpi, sensitivity, deviceProfile })
  └─ firstTuningSteps = buildTuningSteps(input)                 // máx 3, NO mutan la base
```

Salida: `AresV6GenerationOutput` (sensibilidad, giroscopio opcional, dpi, botón, hud, confianza, explicación, pasos de tuning, versión de motor).

---

## 4. Cómo se calcula el PPI (driver principal)

`dpi-curve.ts → resolveEffectivePpi(device)`:

| Prioridad | Fuente | Penalización confianza | Grade máximo permitido |
|---|---|---:|---|
| 1 | `ppi` explícito | 0 | LAB_VERIFIED |
| 2 | `screenDpi` de la DB | 4 | HIGH |
| 3 | Fallback por `tier` | 18 | MEDIUM |

La base se interpola **dentro** de la banda PPI con relación **inversa**: más PPI → menos sensibilidad cruda. `valueFromRange = high − (high − low) × progress`, donde `progress` es la posición del PPI dentro de su banda. Por eso dos equipos en la misma banda no dan el mismo número, y un cambio de PPI real siempre cambia el resultado.

Bandas (de `research-matrix.ts`, basadas en investigación de mercado 2026):

```
0–319   General 190–200
320–359 General 185–200
360–389 General 175–190
390–449 General 168–182   ← sweet spot LATAM FHD+
450–519 General 155–172
520+    General 140–152
```

---

## 5. Cómo se aplican los presets

Cada preset (`presets.ts`) define un `sensitivityBias` **aditivo** (un delta por valor), más `fireButtonBias` y `gyroBias`. `STANDARD_PRO` es el baseline neutro (todos los sesgos en 0). Ejemplos:

- `TODO_ROJO`: redPoint **+10** (sube punto rojo para drag a cabeza), sniperScope −6.
- `SNIPER_AWM`: sniperScope **−14** (control de largo alcance), gyroBias +4.
- `LOW_END_STABLE`: scope4x −6, sniperScope −8 (protege miras largas en gama baja).

El sesgo se suma a la base+dispositivo y se vuelve a clampear (1–200).

---

## 6. Cómo se aplican las armas

`weapons.ts` usa `ARES_V6_WEAPON_CALIBRATION_RULES` como fuente de verdad para las 5 categorías cubiertas (SHOTGUN, SMG, AR_HEAVY, SNIPER, PISTOL). Las **3 categorías sin regla** (AR_FAST, MARKSMAN, SPECIAL) resuelven a *fallbacks seguros* documentados — el motor nunca ignora silenciosamente un arma:

- `AR_FAST`: delta suave de tracking (`general +2, scope2x +2, scope4x −2`).
- `MARKSMAN`: protege largo alcance (`general −3, scope4x −4, sniperScope −4`).
- `SPECIAL`: neutro (`{}`), uso situacional.

Cada arma aporta: `sensitivityBias`, `fireButtonDelta`, `preferredDrag`, `trainingFocus` y notas de riesgo.

---

## 7. Cómo funciona la confianza

`confidence.ts` calcula:

```
score = 100 − penalizaciónPPI − penalizaciónDispositivo − 3 × (#señalesFaltantes)
```

Señales que penalizan si faltan: `ppi/screenDpi`, `releaseYear`, `chipset`, `primaryWeaponCategory`, `thermalState`. Penalización extra de dispositivo por térmico HOT/THROTTLING, ping ≥120/≥150 e input lag alto.

**Grade** con tope por fuente de PPI:

- `LAB_VERIFIED` solo si: PPI confirmado (`source === 'PPI'`) **y** el equipo es un fixture de calibración **y** score ≥ 85 **y** ≤ 1 señal faltante.
- Fallback por tier → máximo `MEDIUM`.
- screenDpi/PPI sin fixture → máximo `HIGH`.

Esto garantiza que **sin PPI real nunca hay LAB_VERIFIED** y que el fallback siempre baja la confianza.

---

## 8. Cómo funciona el tuning

`tuning.ts` convierte los síntomas reportados en **máximo 3 pasos** (`firstTuningSteps`). Los síntomas **nunca** mutan la base: cada paso trae `symptom`, `adjustment` (delta + `fireButtonDelta`/`presetFallback` opcionales), `instruction` y `testProtocol`. Reglas clave (de `research-matrix.ts`):

- `DEVICE_LAGS` → sugiere `fireButtonDelta +3`, baja 4x/AWM, fallback a `LOW_END_STABLE`.
- `SCOPE_4X_UNCONTROLLABLE` → baja 4x/AWM, **no toca Punto Rojo**.
- `CROSSHAIR_DOES_NOT_REACH_HEAD` → sube Punto Rojo primero (CRITICAL).

---

## 9. Cómo se validan los fixtures

`fixtures.ts` define 12 dispositivos LATAM (P0/P1) con specs reales y rango esperado de General. `__tests__/fixtures.test.ts` genera cada fixture y valida rango (con tolerancia documentada por señales de dispositivo), completitud del paquete y el ordenamiento entre equipos. Ver `ENGINE-V6-VALIDATION-REPORT.md` para la tabla de salidas reales.

---

## 10. Qué queda pendiente para Fase 2

1. **Endpoint aislado** `/api/generate/v6` detrás de feature flags (`ARES_V6_API_ENABLED`).
2. **Adapter Prisma→v6** que garantice `screenDpi/ppi` en cada ruta (deuda nuclear 4.1).
3. **Feedback loop**: persistir dispositivo+preset+síntoma+ajuste+rating.
4. **HUD export** (QR/link) y **Meta Lab** versionado por OB.
5. **Más fixtures** y captura de PPI real para subir equipos a `LAB_VERIFIED`.
6. **Comparativa legacy vs v6** y rollout gradual (5% → 25% → reemplazo).
