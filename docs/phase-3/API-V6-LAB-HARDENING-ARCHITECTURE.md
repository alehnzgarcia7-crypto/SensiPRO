# ARES v6 — Lab Hardening Architecture (Fase 3A)

**Rama:** `refactor/phase-0-nuclear-refoundation`
**Estado:** Endpoint v6 **endurecido** pero **apagado por defecto**. No conectado a UI ni a producción; no escribe feedback.

> El endpoint `POST /api/generate/v6` sigue invisible (404) salvo que `ARES_V6_API_ENABLED === 'true'`. Fase 3A lo prepara para pruebas internas controladas: contratos estrictos, guardia anti-abuso, observabilidad sin PII y un boundary de autorización — sin tocar legacy, pagos, auth, middleware, UI ni el schema de Prisma.

---

## 1. Por qué existe Fase 3A

Antes de exponer el motor v6 (aunque sea a internos), necesita ser **defendible y medible**:

| # | Amenaza / brecha | Mitigación de Fase 3A |
|---|---|---|
| API4:2023 | **Unrestricted Resource Consumption** — abuso repetido = DB reads + engine + logs | Rate limit por IP+deviceId, payload guard (413), endpoint OFF por defecto |
| API1:2023 | **Broken Object Level Authorization** — futuros objetos privados | `access-policy.ts` como chokepoint único (hoy público/activo; mañana premium) |
| Inyección | **Unknown-key injection** — campos no declarados | `z.strictObject` en root/player/overrides → 400 |
| Enumeración | **Device-ID enumeration** | device inactivo ⇒ 404 idéntico a inexistente; mensajes de error genéricos (sin valores) |
| Ceguera | **Observability gap** — no se podía medir el rollout | Eventos + métricas estructuradas, sin PII |

---

## 2. Módulos nuevos / modificados

```
src/lib/ares-v6/
├── request-schema.ts     (MOD)  z.strictObject + dedupe de síntomas
├── rate-limit.ts         (NEW)  abuse guard por IP+deviceId sobre Redis
├── observability.ts      (NEW)  requestId, hashes, eventos, métricas, redacción
├── access-policy.ts      (NEW)  boundary de autorización (sin auth todavía)
├── api-errors.ts         (NEW)  envelopes consistentes + headers de rate limit
└── generate-service.ts   (MOD)  aplica access-policy + lee Device.isActive

src/app/api/generate/v6/route.ts   (MOD)  pipeline endurecido
src/lib/cache/redis.ts             (MOD)  export getRedisClient() (reusa ioredis)
packages/algorithms/src/engine-v6/
├── types.ts              (MOD)  AresV6DpiRecommendation.source (provenance)
└── device-profile.ts     (MOD)  expone effective.source en la recomendación DPI
scripts/ares-v6-compare-fixtures.ts (MOD)  harness lab con flags
```

---

## 3. Pipeline del endpoint (barato → caro)

```
POST /api/generate/v6
  │  createAresV6RequestContext()            requestId + ipHash + uaHash (no PII)
  ├─ ARES_V6_API_ENABLED !== 'true'  ─→ 404  (event: request_blocked_flag_off)
  ├─ Content-Length > 20KB           ─→ 413  (event: validation_failed/payload_too_large)
  ├─ request.json() inválido         ─→ 400  (event: validation_failed/invalid_json)
  ├─ strict Zod safeParse inválido   ─→ 400  (event: validation_failed/schema)  ← solo code+path, nunca valores
  ├─ checkAresV6RateLimit()  bloquea ─→ 429  (event: rate_limited, headers + Retry-After)   ← ANTES de Prisma
  ├─ generateAresV6ForDeviceId()
  │     ├─ findDevice (Prisma select acotado, incl. isActive)
  │     ├─ assertCanGenerateForDevice()  inactivo ─→ NotFound ─→ 404 (event: device_not_found)
  │     └─ adapt (screenDpi→ppi) + generateAresV6()
  └─ 200  (event: generated + métricas)  envelope + headers de rate limit
```

El rate limit se ejecuta **después** de la validación (deviceId ya conocido) y **antes** de cualquier lectura de DB o ejecución del motor → un request bloqueado nunca consulta Prisma.

---

## 4. Strict contracts (Task 1)

- `aresV6GenerateRequestSchema`, `player` y `overrides` son `z.object(...).strict()`.
- Una clave desconocida en cualquiera de los tres niveles ⇒ `unrecognized_keys` ⇒ 400.
- `symptoms`: `.max(5)` sobre el input crudo, luego `.transform()` deduplica preservando orden (`[...new Set()]`). Síntomas duplicados ⇒ el motor recibe la lista única ⇒ **sin tuning steps duplicados**.
- Enums exhaustivos (helper `zEnumFromUnion(Record<Union, true>)`): un miembro faltante es error de compilación.
- Mensajes 400: sólo `code` + `path` del primer issue al log; al cliente, mensaje genérico con el nombre del campo (nunca el valor enviado).

---

## 5. Rate limit / abuse guard (Task 2)

**Store = Redis.** Reusa el cliente **ioredis** compartido de `src/lib/cache/redis.ts` vía el nuevo `getRedisClient()` — no se abre una tercera conexión. (El limiter de `src/lib/security/rate-limiter.ts` no sirve: está keyed por `userId+tier` en ventana de 24h; este endpoint es anónimo.)

| Parámetro | Valor |
|---|---|
| Clave | `ares:v6:rl:<ipHash>:<deviceId>` (IP **hasheada**, nunca cruda) |
| Ventana | 60 s (INCR + EXPIRE + TTL) |
| Límite IP+deviceId | 20 / 60 s |
| Límite unknown-ip | 8 / 60 s (más estricto) |
| Headers | `X-RateLimit-Limit/Remaining/Reset`; `Retry-After` en 429 |
| Buckets | distinto deviceId en la misma IP ⇒ bucket independiente |

**Degradación explícita:** si Redis no está disponible o falla, el limiter **falla en abierto** (lab) con `logger.warn` y `degraded: true`. Un `Map` en memoria **no** es el camino de producción (no protege entre instancias serverless ni sobrevive reinicios) — por eso no se usa como fallback silencioso; sólo los tests inyectan un store en memoria determinístico.

---

## 6. Payload & error hardening (Task 3)

- `Content-Length > 20480` ⇒ 413 antes de leer el body (no se lee dos veces).
- Sin `Content-Length`: se continúa; el schema estricto rechaza lo inesperado.
- Errores vía `api-errors.ts`: `{ success:false, error:{code,message,statusCode}, meta:{requestId} }`.
- Nunca se expone stack trace ni mensaje interno (500 genérico fuera de development).
- Los detalles de Zod no se devuelven crudos: sólo el nombre del campo.

---

## 7. Observabilidad sin PII (Task 4)

- `createAresV6RequestContext`: `requestId` (`crypto.randomUUID()`), `ipHash`/`userAgentHash` (`sha256(salt+valor)` recortado a 16 hex), `startedAt`.
- Eventos: `ares_v6.request_blocked_flag_off | validation_failed | rate_limited | device_not_found | generated | failed`.
- Métricas de éxito: `status, durationMs, deviceId, presetId, mode, fingers, ppiSource, detectedPpi, fallbackPpi, confidenceGrade, confidenceScore, usedGyro, symptomsCount, tuningStepsCount`.
- `redactAresV6LogPayload`: enmascara recursivamente claves sensibles (ip, email, token, cookie, user-agent, body, stack, …) y recorta strings largos.
- **Nunca** se loggea: IP cruda, user-agent crudo, body completo, stack, emails, tokens, cookies.
- `ppiSource`: el adapter promueve `screenDpi` de DB a `ppi` (regla de oro Fase 2), así que un request por API reporta `PPI` cuando hay un valor concreto y `TIER_FALLBACK` cuando se estimó por gama. `SCREEN_DPI` sólo aparece en llamadas directas al motor sin `ppi`.

---

## 8. Access policy boundary (Task 5)

- `canGenerateForDevice({ device, user? })`: hoy `device.isActive !== false`. Todos los devices buscables/activos son públicos en Fase 3A.
- `assertCanGenerateForDevice`: lanza **NotFound** (no Forbidden) para no revelar la existencia de un device inactivo/privado (anti-enumeración).
- El argumento `user` se acepta y se ignora a propósito: Fase 3B/4 añadirá premium/objetos privados **aquí**, en un solo punto, sin reescribir el endpoint.
- No se inventa auth, no se importa NextAuth, no se toca sesión.

---

## 9. Lab mode contract (Task 6)

`meta` siempre incluye: `engine`, `labMode`, `requestId`, `rateLimit { limit, remaining, resetAt }`.
Con `ARES_V6_LAB_MODE === 'true'` se añade además `warnings: string[]` (no sensibles, vienen de `confidence.warnings`).
`meta` **nunca** incluye `ipHash`, `userAgentHash`, claves internas ni errores crudos.

---

## 10. Qué sigue OFF / rollback

- Endpoint OFF por defecto (`ARES_V6_API_ENABLED` ausente o `!== 'true'` ⇒ 404).
- No escribe feedback (`ARES_V6_WRITE_FEEDBACK` reservado para Fase 3B).
- No hay UI conectada (`NEXT_PUBLIC_ARES_V6_ENABLED` ⇒ Fase 3B).
- **Rollback en un flag, sin revertir commits:** `ARES_V6_API_ENABLED=false`.

---

## 11. Seguridad y fair play

SensiPRO **no** modifica Free Fire, **no** usa APK/hacks/macros/auto-headshot/GFX. El endpoint sólo devuelve valores manuales para aplicar en los ajustes oficiales, con score de confianza y protocolo de prueba.
