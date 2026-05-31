# SensiPRO — Investigación Nuclear de Refundación

**Fecha:** 2026-05-31  
**Estado:** Fase 0 / Refundación desde cero  
**Decisión ejecutiva:** El SensiPRO actual se congela como `legacy`. No se elimina todavía, pero deja de ser fuente de verdad para sensibilidad, HUD, claims de marketing y producto premium.

---

## 0. Tesis de refundación

SensiPRO no debe competir como “otra calculadora de sensibilidad”. El mercado ya tiene generadores por DPI, páginas de HUD y tablas de valores. La apuesta de millones de dólares es convertir SensiPRO en el **sistema operativo de calibración de Free Fire**:

> Dispositivo + DPI/PPI + Hz + RAM + panel + edad del equipo + modo de juego + dedos + HUD + botón + arma + personaje + problema del jugador + entrenamiento + feedback real.

El producto ganador no entrega seis números. Entrega una **configuración completa, explicada, ajustable y aprendible**.

---

## 1. Señales oficiales del juego

### 1.1 Free Fire avanza hacia presets y loadouts dentro de la partida

Fuente oficial Garena OB53: `https://ff.garena.com/en/article/1640/`

Garena agregó selección de presets y loadouts dentro de BR/CS. Los jugadores pueden cambiar Presets 1-5 durante la preparación y, para Heroic+, la página de preset se abre automáticamente al inicio. Implicación: SensiPRO debe dejar de generar una sola sensibilidad universal y empezar a generar **paquetes por modo/preset**.

Implementar:

- Preset Battle Royale.
- Preset Clash Squad.
- Preset Rush.
- Preset Sniper.
- Preset One Tap.
- Preset Low-End.
- Preset 4 dedos.
- Preset Gyro.
- Recalibración por modo.

### 1.2 Garena hizo oficial que el HUD es una capa estratégica

Fuente oficial Garena OB53: `https://ff.garena.com/en/article/1640/`

OB53 agregó nuevas formas de compartir HUD por redes, amigos, link y QR. También agregó **Smart Adjust**, que sugiere ajustes analizando datos de toques y patrones de uso del HUD. Esto valida la dirección de SensiPRO:

> Sensibilidad sin HUD es un producto incompleto.

Implementar:

- HUD Engine.
- HUD Analyzer.
- HUD QR/link export.
- HUD por dedos.
- HUD por pantalla.
- HUD por estilo.
- Botón de disparo dinámico.
- Zona de drag limpia.
- Mapa de calor de controles.

### 1.3 OB53 trae Frame Rate Enhancement

Fuente oficial Garena OB53: `https://ff.garena.com/en/article/1640/`

Garena agregó Frame Rate Boost experimental dentro de High FPS Mode. Implicación: el motor debe saber si el usuario juega en 60/90/120Hz y si tiene boost activo. No basta con specs teóricas: debe existir el concepto de **rendimiento percibido**.

Implementar:

- Campo `highFpsMode`.
- Campo `frameBoostEnabled`.
- Perfil térmico: frío / normal / caliente.
- Ajuste si el usuario reporta lag o input delay.

### 1.4 El meta cambia por patch, armas y personajes

Fuente oficial Garena OB53: `https://ff.garena.com/en/article/1640/`

OB53 cambió armas y personajes: Ray favorece rushers, Dasha/Shani/Jota recibieron buffs, Koda/Moco/Otho/Shirou/Nero recibieron nerfs o cambios, AC80/SKS/snipers/MAG-7/UMP cambiaron. Implicación: SensiPRO debe tener un **Meta Lab** versionado por OB.

Implementar:

- `PatchMetaChange`.
- `WeaponMeta`.
- `CharacterBuild`.
- Meta actual por modo.
- Recalibración post update.

---

## 2. Señales de competidores

### 2.1 FreeFireMania

Fuente: `https://www.freefiremania.com.br/generador-sensibilidad-free-fire.html`

Lo que hace bien:

- Genera sensibilidad por modelo de celular.
- Tiene modo sin DPI y con DPI sugerido.
- Usa edad del dispositivo.
- Genera General, Punto Rojo, 2x, 4x, AWM, Cámara Libre y tamaño del botón.
- Posiciona seguridad: sin APK, sin modificar archivos, valores manuales.
- Explica que DPI bajo requiere sensibilidad alta y DPI alto requiere sensibilidad más baja.
- Publica rangos por DPI/PPI.

Rangos publicados que debemos usar como referencia de calibración, no como copia ciega:

| DPI/PPI | General | Punto Rojo | AWM |
|---:|---:|---:|---:|
| 320–359 | 185–200 | 170–185 | 125–140 |
| 360–389 | 175–190 | 160–175 | 117–132 |
| 390–449 | 168–182 | 153–167 | 108–122 |
| 450–519 | 155–172 | 140–157 | 95–112 |
| 520+ | 140–152 | 125–137 | 80–92 |

Cómo superarlo:

- No solo valores: configuración completa.
- Tuning Wizard posterior a la prueba.
- HUD + botón + arma + entrenamiento.
- Feedback loop por dispositivo.
- Explicación técnica por valor.
- Score de confianza.

### 2.2 FreeFireSensi

Fuente: `https://freefiresensi.com/`

Lo que vende:

- “AI-Powered Sensitivity Calculator”.
- Device + settings.
- 6 playstyles.
- Ping Optimized.
- Rango 1–200.
- Playstyles: Freestyle, Instaplayer, Rusher, Balanced, One-Tap, Sniper.

Cómo superarlo:

- Más presets y mejor naming en español/LATAM.
- Ping no como gimmick, sino como input que modifica recoil/estabilidad.
- Presets por arma y modo.
- Laboratorio de feedback.

### 2.3 Xenkzone / Xenzone

Fuente comparativa: `https://www.freefiremania.com.br/generador-sensibilidad-free-fire.html`

Xenkzone aparece como intención de búsqueda por metodología popular. No debe copiarse como marca ni implicar afiliación. SensiPRO debe ofrecer un preset legal y descriptivo:

- `TODO_ROJO`.
- `X_METHOD` como nombre interno técnico, no marca pública si hay riesgo legal.
- En UI: “Modo Rojo / Drag calibrado”.

---

## 3. Límites legales y de seguridad

Fuente Garena TOS: `https://content.garena.com/legal/tos/tos_en.html`

Garena prohíbe modificar, crear derivados sin permiso, reverse engineer, hackear, superar medidas de seguridad, usar versiones modificadas/no autorizadas y hacer trampa para obtener ventaja injusta.

Política SensiPRO obligatoria:

- No APK.
- No hacks.
- No macros.
- No overlays invasivos.
- No modificación de cliente.
- No acceso a cuenta Free Fire.
- No prometer auto-headshot.
- No vender “hacker sensitivity”.
- Todo es manual, educativo, seguro y aplicado dentro de la configuración oficial del juego.

---

## 4. Defectos nucleares detectados en el SensiPRO actual

### 4.1 El motor dice DPI-first, pero las rutas no pasan `screenDpi`

En la DB y seed existe `screenDpi`, pero las rutas principales construyen `specs` sin pasar `screenDpi`/`ppi`. Esto destruye la promesa de “calibración por hardware real”.

Rutas afectadas:

- `src/app/api/generate/route.ts`
- `src/app/api/generate/all/route.ts`
- `src/app/api/generate/headshot/route.ts`
- `src/app/api/export/route.ts`
- `src/app/devices/[slug]/page.tsx`
- `packages/algorithms/src/comparator.ts`

### 4.2 El engine actual mezcla escala 0–100 con 0–200

El engine v5 calibra `400 DPI ≈ General 100`, pero la investigación de mercado 2026 ubica un móvil de 390–449 DPI cerca de `General 168–182`. Esto explica por qué la sensibilidad se siente “muerta” o demasiado baja.

### 4.3 Marketing y algoritmo se contradicen

La landing habla de tapering `-15`, valores v4 y claims de precisión. El engine v5 usa ratios por estilo y `tapering = 0`. Todo claim debe congelarse y reemplazarse por claims verificables del engine v6.

### 4.4 Headshot, dedos, armas y HUD existen como piezas sueltas

Hay módulos útiles: finger profiles, weapon categories, HUD layouts, drag techniques, training plans. Pero no están integrados como un paquete final.

### 4.5 El producto actual no aprende

No hay feedback loop central para guardar: dispositivo, preset, problema, ajuste, rating, arma, modo y resultado. Sin feedback, SensiPRO siempre será una tabla bonita.

---

## 5. Principios de SensiPRO V6

1. **DPI/PPI real es input obligatorio.** Si falta, debe existir `confidenceScore` menor.
2. **La salida debe estar en escala Free Fire 1–200 moderna.**
3. **El usuario nunca recibe una verdad absoluta.** Recibe base + explicación + protocolo de prueba.
4. **El Punto Rojo es el primer control de headshot.** No se cambia todo al mismo tiempo.
5. **HUD y botón son parte del resultado.** Sin HUD, la sensi está incompleta.
6. **La sensibilidad debe ser versionada.** Cada ajuste crea una versión.
7. **Los presets deben mapear intención real del jugador.** Rusher, One Tap, Sniper, Clash, BR, Low-End, etc.
8. **La seguridad es producto.** Nada de APK, nada de hacks, nada de promesas imposibles.
9. **La app debe explicar por qué.** No solo números.
10. **Feedback real > opinión.** SensiPRO debe aprender por dispositivo.

---

## 6. Producto objetivo

El resultado final de una generación SensiPRO V6 debe incluir:

- Sensibilidad completa.
- DPI/PPI usado.
- Modo sin DPI / con DPI sugerido.
- Botón de disparo.
- HUD recomendado.
- Dedos recomendados.
- Armas ideales.
- Técnica de drag.
- Entrenamiento inicial.
- Problemas esperados.
- Ajustes si falla.
- Score de confianza.
- Explicación por valor.
- Versión guardable.

---

## 7. Decisión ejecutiva de Fase 0

A partir de esta rama:

- Todo motor viejo queda clasificado como `LEGACY`.
- Se crea `engine-v6` como nueva fuente de verdad.
- Se documenta la refundación.
- Se crea un contrato de tipos y presets para construir Fase 1 sin improvisar.
- No se conecta aún a producción hasta tener tests de calibración por dispositivos reales.
