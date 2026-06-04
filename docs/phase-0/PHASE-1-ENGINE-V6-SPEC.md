# Fase 1 — ARES Engine V6 Execution Spec

**Objetivo:** construir el nuevo motor determinístico de SensiPRO antes de tocar producción.

---

## 1. Resultado esperado de Fase 1

Al terminar Fase 1, SensiPRO debe poder generar un paquete completo:

```txt
Sensibilidad 1-200
Giroscopio opcional
DPI/PPI usado
Botón de disparo
HUD recomendado
Preset aplicado
Arma/modo/dedos considerados
Score de confianza
Explicación humana
Primeros ajustes si falla
```

---

## 2. Entradas obligatorias del motor

```ts
device: {
  brand,
  model,
  screenSize,
  ramGb,
  screenHz,
  panelType,
  tier,
  ppi | screenDpi,
  chipset?,
  releaseYear?,
  os?,
  client?,
  graphicsQuality?,
  highFpsMode?,
  frameBoostEnabled?,
  thermalState?,
  pingMs?,
  inputLagHint?
}

player: {
  fingers,
  playstyle,
  mode,
  preferredRange?,
  primaryWeaponCategory?,
  secondaryWeaponCategory?,
  usesGyroscope?,
  currentRank?,
  symptoms?
}

presetId
```

---

## 3. Pipeline v6

### Paso 1 — Resolver PPI efectivo

Prioridad:

```txt
ppi explícito > screenDpi de DB > fallback por tier
```

Si cae a fallback, bajar confianza y mostrar advertencia.

### Paso 2 — Base por banda PPI

Usar `ARES_V6_PPI_CALIBRATION_BANDS` como norte:

```txt
320–359 → General 185–200
360–389 → General 175–190
390–449 → General 168–182
450–519 → General 155–172
520+    → General 140–152
```

### Paso 3 — Ajustes por dispositivo

Aplicar reglas de:

```txt
RAM
Hz
panel
screenSize
thermalState
client Free Fire/MAX
frameBoostEnabled
releaseYear
```

### Paso 4 — Preset

Aplicar sesgo del preset seleccionado:

```txt
Standard Pro
Todo Rojo
X Method
One Tap
Brazil Rush
Clash Squad
Battle Royale
Sniper/AWM
Low-End Stable
Android Budget
iPhone Smooth
4 Dedos Pro
3 Dedos Competitivo
Gyro Light
Gyro Pro
SMG Tracking
Shotgun Drag
AR Recoil Control
Freestyle Clips
Custom Lab
```

### Paso 5 — Arma y modo

Si `primaryWeaponCategory` existe, ajustar según `ARES_V6_WEAPON_CALIBRATION_RULES`.

### Paso 6 — Síntomas

Si el jugador reporta síntomas, no se aplica todo de golpe al output base. Se generan `firstTuningSteps` con protocolo de prueba.

### Paso 7 — HUD + botón

Generar:

```txt
layoutFamily
priorityButtons
riskNotes
nextUpgradePath
fireButton.sizePercent
fireButton.opacityPercent
fireButton.dragZone
```

### Paso 8 — Confianza y explicación

Calcular:

```txt
score 0-100
grade LOW/MEDIUM/HIGH/LAB_VERIFIED
missingSignals
warnings
explanation bullets
technicalNotes
```

---

## 4. Archivos a crear en Fase 1

```txt
packages/algorithms/src/engine-v6/device-profile.ts
packages/algorithms/src/engine-v6/sensitivity.ts
packages/algorithms/src/engine-v6/gyro.ts
packages/algorithms/src/engine-v6/fire-button.ts
packages/algorithms/src/engine-v6/hud.ts
packages/algorithms/src/engine-v6/weapons.ts
packages/algorithms/src/engine-v6/tuning.ts
packages/algorithms/src/engine-v6/confidence.ts
packages/algorithms/src/engine-v6/explain.ts
packages/algorithms/src/engine-v6/generate.ts
packages/algorithms/src/engine-v6/__tests__/dpi-curve.test.ts
packages/algorithms/src/engine-v6/__tests__/fixtures.test.ts
packages/algorithms/src/engine-v6/__tests__/presets.test.ts
packages/algorithms/src/engine-v6/__tests__/generate.test.ts
```

---

## 5. Tests mínimos para aprobar Fase 1

### Device fixtures

Debe pasar en:

```txt
Samsung Galaxy A14
Samsung Galaxy A15
Samsung Galaxy A24
Samsung Galaxy A54
Redmi Note 12
Redmi Note 13
POCO X5 Pro
Moto G54
iPhone 11
iPhone 14
iPhone 16 Pro Max
Galaxy S24 Ultra
```

### Reglas duras

```txt
No output fuera de 1-200.
PPI real debe cambiar el resultado.
Fallback por tier debe bajar confianza.
Galaxy A54 Standard no puede dar General ~100.
iPhone 14 debe dar menos General que Redmi Note 13.
Galaxy S24 Ultra debe dar menos General que Galaxy A14.
Todo Rojo debe subir Punto Rojo vs Standard.
Sniper/AWM debe bajar AWM vs Standard.
Low-End debe proteger 4x/AWM.
```

---

## 6. Rango de aceptación de Fase 1

Una generación v6 se considera lista para UI cuando:

1. usa `screenDpi/ppi` real;
2. tiene `confidenceScore`;
3. devuelve explicación;
4. devuelve ajustes sugeridos;
5. no toca producción legacy;
6. está cubierta por fixtures P0.

---

## 7. No negociables

- No APK.
- No hacks.
- No auto-headshot.
- No macros.
- No GFX tools.
- No promesas mágicas.
- Todo manual y aplicado dentro de configuración oficial.
