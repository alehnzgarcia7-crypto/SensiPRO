# SensiPRO — API Migration Plan to ARES Engine v6

**Objetivo:** mover generación de sensibilidad a v6 sin romper el flujo actual.

---

## 1. Estrategia

No se reemplaza `/api/generate` de inmediato. Primero se crea una familia aislada:

```txt
POST /api/generate/v6
POST /api/generate/v6/tune
POST /api/hud/v6/generate
POST /api/feedback/v6
GET  /api/meta/v6
```

Luego se conecta UI experimental con feature flag.

---

## 2. Contrato mínimo de `/api/generate/v6`

Entrada:

```ts
{
  deviceId: string;
  presetId: AresV6PresetId;
  player: {
    fingers: 2 | 3 | 4 | 5;
    playstyle: AresV6Playstyle;
    mode: AresV6GameMode;
    primaryWeaponCategory?: AresV6WeaponCategory;
    usesGyroscope?: boolean;
    symptoms?: AresV6Symptom[];
  };
  overrides?: {
    ramGb?: number;
    screenHz?: number;
    ppi?: number;
    client?: 'FREE_FIRE' | 'FREE_FIRE_MAX';
    thermalState?: AresV6ThermalState;
    pingMs?: number;
  };
}
```

Salida:

```ts
AresV6GenerationOutput
```

---

## 3. Señales obligatorias desde DB

Al cargar `device`, la ruta debe pasar:

```txt
brand
model
screenSize
ramGb
screenHz
panelType
tier
screenDpi -> ppi/screenDpi
chipset
releaseYear
```

`screenDpi` ya no puede perderse en el adapter.

---

## 4. Feature flags

```txt
NEXT_PUBLIC_ARES_V6_ENABLED=false
ARES_V6_API_ENABLED=false
ARES_V6_WRITE_FEEDBACK=false
```

Primero solo lectura/generación. Después feedback.

---

## 5. Rollout

1. Crear endpoint v6 aislado.
2. Crear tests de fixtures.
3. Crear UI experimental oculta.
4. Comparar output legacy vs v6.
5. Probar con dispositivos P0.
6. Activar a 5% de usuarios.
7. Medir feedback.
8. Subir a 25%.
9. Reemplazar legacy cuando v6 gane en rating.

---

## 6. Rollback

Si falla:

```txt
ARES_V6_API_ENABLED=false
NEXT_PUBLIC_ARES_V6_ENABLED=false
```

El legacy sigue intacto porque Fase 0 no borra ni reemplaza rutas actuales.

---

## 7. Métricas de aceptación

```txt
rating promedio >= 4.3
menos de 15% reporta "se siente lento"
menos de 15% reporta "se pasa"
feedback por fixture P0 >= 30 muestras
0 errores de rango fuera de 1-200
0 generaciones sin confidenceScore
```
