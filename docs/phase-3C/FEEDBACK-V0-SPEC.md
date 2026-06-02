# ARES v6 — Feedback v0 Spec (Fase 3C)

> **Feedback es evidencia, NO verdad.** En Fase 3C el feedback NUNCA recalibra el motor automáticamente. Sólo se recolecta, sanea, clasifica (TRUSTED/SUSPICIOUS) y mide.

---

## 1. Endpoint

`POST /api/feedback/v6` — OFF por defecto (`ARES_V6_WRITE_FEEDBACK !== 'true'` ⇒ 404). Internal-access obligatorio. Rate-limit propio (namespace `fb`) **antes** de cualquier escritura. Sin UI pública.

---

## 2. Contrato (Zod strict)

```ts
{
  generationId: string.cuid(),     // debe existir una generación persistida
  requestId?: string (<=64),
  rating: 1..5 (int),
  outcome: 'BETTER' | 'SAME' | 'WORSE' | 'UNSURE',
  problemResolved?: boolean,
  symptoms?: AresV6Symptom[]        // máx 5, deduplicado
  adjustmentsApplied?: Record<string(<=40), int(-200..200)>  // máx 24 claves
  comment?: string (<=280)          // saneado; PII ⇒ 400
}
```

Claves desconocidas ⇒ 400 (strict).

---

## 3. Reglas

| Caso | Respuesta |
|---|---|
| flag off | 404 |
| internal access faltante | 404 (stealth) / 403 (lab) |
| body inválido / clave desconocida | 400 |
| comentario con URL/email/teléfono | 400 |
| rate limit excedido | 429 (sin tocar DB) |
| generación inexistente | 404 |
| feedback duplicado (mismo `generationId`) | **409** |
| válido | **201** `{ feedbackId, qualityFlag }` |

- `deviceId`/`presetId` se toman de la **generación almacenada**, no del cliente (anti-spoofing).
- Un feedback por generación (v0): unicidad por `generationId`.

---

## 4. Anti-data-poisoning

- **Comentarios:** strip de control chars, colapso de espacios, recorte 280; rechazo (400) si contienen URL/email/teléfono.
- **qualityFlag:** `TRUSTED` por defecto; `SUSPICIOUS` (+ `qualityReasons`) si:
  - `LOW_RATING_VOLUME`: ≥5 ratings bajos (≤2) para el mismo device+preset en 10 min.
  - `OUTCOME_SYMPTOM_CONFLICT`: `BETTER` + `problemResolved` + síntomas presentes.
  - `OUTCOME_RESOLVED_CONFLICT`: `WORSE` + `problemResolved`.
- El feedback `SUSPICIOUS` **se guarda** pero **se excluye** de las métricas confiables por defecto (`includeSuspicious=true` para verlo).

---

## 5. Persistencia (`AresV6Feedback`)

Campos: `generationId`, `requestId?`, `deviceId`, `presetId`, `rating`, `outcome`, `problemResolved?`, `symptoms?` (Json), `adjustmentsApplied?` (Json), `comment?` (≤280, saneado), `qualityFlag`, `qualityReasons?` (Json), `source='INTERNAL_LAB'`, `createdAt`. Unicidad: `generationId`.

**No** se guarda IP, user-agent, cookies, tokens ni body crudo.

---

## 6. Retención

180 días (`ARES_V6_FEEDBACK_RETENTION_DAYS`), limpiado por `scripts/ares-v6-lab-cleanup.ts`. Ver `LAB-METRICS-SPEC.md`.

---

## 7. Fuera de alcance (3C)

- No hay UI de feedback.
- No hay edición/borrado por el cliente.
- No hay agregación que modifique el engine.
- No hay identidad de usuario (v0 es por generación + IP rate-limit).
