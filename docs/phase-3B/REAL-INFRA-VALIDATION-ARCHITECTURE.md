# ARES v6 — Real-Infra Validation Architecture (Fase 3B)

**Rama:** `refactor/phase-0-nuclear-refoundation`
**Estado:** Endpoint v6 validado contra **infraestructura real** (Redis + Postgres) pero **apagado por defecto**. Sin UI, sin feedback persistente, sin tocar legacy/pagos/auth/middleware/schema.

> Fase 3A endureció el endpoint con mocks. Fase 3B lo prueba contra Redis y Postgres reales, cierra el bypass por rotación de deviceId, hace el limiter atómico, define una política de confianza de proxy y de fail-open/closed, y exige un salt de logs en producción. Objetivo: poder activar `ARES_V6_API_ENABLED` a internos sin engañarnos con mocks.

---

## 1. Por qué existe Fase 3B

| Riesgo abierto de 3A | Mitigación 3B |
|---|---|
| Bypass rotando `deviceId` (sólo bucket IP+device) | **Doble bucket**: IP_GLOBAL/UNKNOWN_GLOBAL además de *_DEVICE |
| INCR + EXPIRE no atómico | **Lua EVAL** atómico, TTL garantizado |
| `x-forwarded-for` spoofeable | **Proxy trust policy** (vercel/strict/lab) |
| Fail-open siempre (decisión de lab) | **Fail mode configurable** (open/closed) |
| Sin smoke real | **CI service containers** (Postgres 16 + Redis 7) + smoke local |
| `ARES_V6_LOG_SALT` cae a default | **Salt requerido** en prod con API on → 503 si falta |

---

## 2. Dual-bucket rate limiting (cierra el bypass de deviceId)

`rate-limit.ts` evalúa **varios buckets** y bloquea si **cualquiera** excede:

| Scope | Clave | Default |
|---|---|---|
| IP_GLOBAL | `ares:v6:rl:ip:<ipHash>` | 60 / 60s |
| IP_DEVICE | `ares:v6:rl:ip-device:<ipHash>:<deviceId>` | 20 / 60s |
| UNKNOWN_GLOBAL | `ares:v6:rl:unknown` | 12 / 60s |
| UNKNOWN_DEVICE | `ares:v6:rl:unknown-device:<deviceId>` | 8 / 60s |

- IP confiable → evalúa IP_GLOBAL (+ IP_DEVICE si hay deviceId).
- IP no confiable → evalúa UNKNOWN_GLOBAL (+ UNKNOWN_DEVICE).
- `allowed` = todos allowed; `remaining` = mínimo entre buckets; `resetAt`/`retryAfter` del bucket bloqueante; headers reflejan el bucket más restrictivo.
- **Rotar `deviceId` ya no evade**: IP_GLOBAL cuenta todas las requests de esa IP sin importar el device. Las claves usan el **IP hasheado**, nunca la IP cruda.

Límites configurables vía env (`ARES_V6_RATE_LIMIT_*`); valores inválidos caen a defaults seguros (`rate-limit-policy.ts`).

---

## 3. Redis atómico (Lua EVAL)

`redis-rate-limit-store.ts` corre INCR + EXPIRE-condicional + TTL como **un solo script**:

```lua
local current = redis.call("INCR", KEYS[1])
if current == 1 then redis.call("EXPIRE", KEYS[1], ARGV[1]) end
local ttl = redis.call("TTL", KEYS[1])
if ttl < 0 then redis.call("EXPIRE", KEYS[1], ARGV[1]); ttl = tonumber(ARGV[1]) end
return { current, ttl }
```

- Una key **nunca** queda sin TTL (evita un contador permanente que throttlee para siempre).
- Reutiliza el cliente **ioredis** compartido (`getRedisClient`); no abre una tercera conexión.
- La respuesta se parsea tipada (`parseLuaHitResult`); una forma inesperada lanza y cae en la política de fail.

---

## 4. Fail-open vs fail-closed (`rate-limit-policy.ts`)

- `ARES_V6_RATE_LIMIT_FAIL_MODE` = `open` | `closed`.
- Default: producción con API on → `closed`; el resto → `open`.
- **open** (lab): si el store cae, `allowed:true` + `degraded:true` + log warn (disponibilidad > bloqueo).
- **closed** (beta/prod): si el store cae, `allowed:false` + `storeUnavailable:true` → la ruta responde **503** con `Retry-After`. Nunca consulta Prisma.
- El error de Redis nunca se expone al cliente.

---

## 5. Proxy trust policy (`proxy-trust.ts`)

`ARES_V6_PROXY_TRUST_MODE` = `vercel` | `strict` | `lab` (default: `vercel` si `VERCEL=1`, si no `lab`).

| Modo | Confía en |
|---|---|
| vercel | `x-vercel-forwarded-for` (preferido) → `x-forwarded-for` → `x-real-ip` |
| strict | **sólo** `x-vercel-forwarded-for` (header de plataforma); `x-forwarded-for` se marca `trusted:false` |
| lab | `x-forwarded-for` / `x-real-ip` (local/dev) |

- IP malformada → `null`. Múltiples hops → se toma el **left-most** (cliente).
- Una IP no confiable nunca otorga el budget alto: cae a los buckets `UNKNOWN_*` y **nunca se hashea ni se loggea**.
- `observability.ts` y `rate-limit.ts` resuelven la IP vía esta policy (una sola vez por request).

---

## 6. Log salt policy (`observability-policy.ts`)

- En `NODE_ENV=production` **y** `ARES_V6_API_ENABLED=true`, `ARES_V6_LOG_SALT` debe existir y medir ≥ 16 chars.
- Si falta/es corto: `checkAresV6RuntimeConfig()` devuelve un error → la ruta responde **503 CONFIGURATION_ERROR** antes de procesar (fail-safe).
- En dev/test se permite el salt default. El valor del salt **nunca** aparece en logs (clave `salt` redactada).

---

## 7. Real-infra smoke (`__tests__/real-infra.smoke.test.ts`)

- Corre **sólo** con `ARES_V6_REAL_INFRA_SMOKE=true` (`describe.skipIf`); en el gate unitario se salta.
- Usa Redis y Postgres **reales** (sin mocks). Siembra dos devices (activo + inactivo) vía `testing/seed-real-infra.ts`.
- Valida: Redis incrementa + TTL>0 + bloqueo IP_DEVICE + bloqueo IP_GLOBAL con deviceId rotando; Prisma device activo→`detectedPpi`, inactivo→NotFound, inexistente→NotFound; ruta E2E 200/404/429.
- IPs únicas por corrida (derivadas de un token de arranque) para no colisionar claves Redis entre ejecuciones.

---

## 8. CI service containers (`.github/workflows/ci.yml`)

Job nuevo `ares-v6-real-infra-smoke` (además del gate bloqueante y el legacy no bloqueante):

- `services: postgres:16` + `redis:7` con health checks.
- env: `DATABASE_URL`/`REDIS_URL` a los servicios, `ARES_V6_API_ENABLED=true`, `ARES_V6_REAL_INFRA_SMOKE=true`, `ARES_V6_LOG_SALT`, `ARES_V6_RATE_LIMIT_FAIL_MODE=closed`, `ARES_V6_PROXY_TRUST_MODE=lab`.
- pasos: npm ci → db:generate → `db:push:test` → `ares:v6:seed:smoke` → vitest del smoke → artifact de logs.
- `tests/setup.ts` ahora usa `??=` para `DATABASE_URL`/`REDIS_URL` para que el entorno real (CI/local) gane sobre los defaults de test.

---

## 9. Cambios de contrato de respuesta (`api-errors.ts`)

- Headers `X-RateLimit-Limit/Remaining/Reset` (bucket más restrictivo) y `Retry-After` en 429/503.
- `meta.rateLimit` (limit/remaining/resetAt/scopes/degraded) también en 429/503 — nunca `key`/`ipHash`.
- 503 SERVICE_UNAVAILABLE para store-unavailable fail-closed y para config error.

---

## 10. Qué sigue OFF / rollback

- Endpoint OFF por defecto (404). Sin feedback, sin UI, sin rollout.
- Rollback en un flag: `ARES_V6_API_ENABLED=false`.
- Fail posture endurecible sin deploy: `ARES_V6_RATE_LIMIT_FAIL_MODE`, `ARES_V6_PROXY_TRUST_MODE`.

SensiPRO **no** modifica Free Fire ni usa APK/hacks/macros/auto-headshot/GFX.
