# SensiPRO — Rollback & Governance Protocol

**Fase:** 0 — Nuclear Refoundation  
**Objetivo:** que la reconstrucción de SensiPRO pueda avanzar rápido sin poner en riesgo producción, pagos ni confianza del usuario.

---

## 1. Regla de producción

ARES Engine v6 no reemplaza legacy hasta que existan:

- tests por fixtures P0;
- endpoint v6 aislado;
- feature flags;
- comparativa legacy vs v6;
- métricas de feedback;
- rollback en un click.

---

## 2. Feature flags obligatorias

```txt
ARES_V6_API_ENABLED=false
NEXT_PUBLIC_ARES_V6_ENABLED=false
ARES_V6_WRITE_FEEDBACK=false
ARES_V6_LAB_MODE=false
```

Significado:

- `ARES_V6_API_ENABLED`: habilita endpoint v6.
- `NEXT_PUBLIC_ARES_V6_ENABLED`: habilita UI v6.
- `ARES_V6_WRITE_FEEDBACK`: permite escritura de feedback.
- `ARES_V6_LAB_MODE`: permite resultados experimentales a usuarios internos.

---

## 3. Rollback inmediato

Si cualquier métrica se degrada:

```txt
ARES_V6_API_ENABLED=false
NEXT_PUBLIC_ARES_V6_ENABLED=false
ARES_V6_WRITE_FEEDBACK=false
```

El sistema vuelve a legacy sin revertir commits.

---

## 4. Métricas de go/no-go

### Go

```txt
rating promedio >= 4.3
p95 latency endpoint v6 < 700ms
0 outputs fuera de rango 1-200
0 generaciones sin confidenceScore
>= 30 muestras por fixture P0 antes de activar global
```

### No-Go

```txt
> 15% usuarios reportan "muy lento"
> 15% usuarios reportan "se pasa"
> 5% outputs con PPI fallback en dispositivos populares con screenDpi conocido
cualquier error de pago/auth causado por v6
cualquier claim de marketing no respaldado por engine
```

---

## 5. Gobernanza de cambios

Todo cambio de engine debe declarar:

```txt
qué curva cambia
qué dispositivos afecta
qué preset afecta
qué síntomas pretende corregir
qué fixture lo cubre
cómo se revierte
```

---

## 6. Política de claims

No se puede publicar un claim como:

```txt
"la sensibilidad perfecta"
"garantiza todo rojo"
"mejor que X"
"calibración forense exacta"
```

A menos que tenga:

- test automatizado;
- fuente de investigación;
- fixture;
- explicación de confianza;
- margen de error.

Claims permitidos durante v6 beta:

```txt
"calibración por PPI/DPI real"
"valores manuales para aplicar en ajustes oficiales"
"no modifica Free Fire"
"incluye protocolo de prueba y ajuste"
"resultado con score de confianza"
```

---

## 7. Seguridad y fair play

SensiPRO es una herramienta educativa y de configuración manual. No debe:

- modificar Free Fire;
- distribuir APKs;
- prometer automatización;
- crear macros;
- interceptar pantalla;
- pedir credenciales de Free Fire;
- superar controles de seguridad.

---

## 8. Cierre de Fase 0

Fase 0 queda lista para Fase 1 cuando:

- docs de investigación están creados;
- engine-v6 tiene contratos;
- presets están definidos;
- matriz de investigación existe;
- fixtures P0 existen;
- migración API está planificada;
- rollback está documentado.
