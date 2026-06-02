# ARES v6 — Real-Infra Validation Report (Fase 3B)

**Rama:** `refactor/phase-0-nuclear-refoundation`
**Gates:** `Phase 0.1B ARES v6 Gate` (unit, bloqueante) + `ARES v6 Real-Infra Smoke` (Redis + Postgres reales)

---

## 1. Resumen

- **Dual bucket**: IP_GLOBAL + IP_DEVICE (trusted) / UNKNOWN_GLOBAL + UNKNOWN_DEVICE (untrusted). Rotar `deviceId` ya no evade el límite por IP.
- **Redis atómico**: INCR + EXPIRE-condicional + TTL en un Lua EVAL; TTL siempre garantizado; reutiliza el ioredis compartido.
- **Proxy trust policy**: vercel/strict/lab; `x-forwarded-for` no se confía ciegamente; IP no confiable → buckets unknown, sin hash/log.
- **Fail mode**: open (lab) vs closed (beta/prod); store caído en closed → **503**, sin Prisma.
- **Log salt policy**: salt requerido (≥16) en prod con API on; si falta → **503 config error** antes de procesar.
- **Real infra smoke**: Redis 7 + Postgres 16 reales (CI service containers + validación local). 200/404/429 reales + path Redis/Postgres real.
- Endpoint **OFF por defecto**; sin feedback, sin UI, legacy intacto.

---

## 2. Tests añadidos

| Suite | Casos | Tipo |
|---|---:|---|
| `proxy-trust.test.ts` | 10 | unit |
| `observability-policy.test.ts` | 7 | unit |
| `rate-limit.test.ts` (reescrito) | 13 | unit (dual bucket + atomic store parse) |
| `observability.test.ts` (reescrito) | 7 | unit (proxy fields + redacción salt) |
| `route.test.ts` (reescrito) | 16 | unit (429/503/config-error/no-leak) |
| `real-infra.smoke.test.ts` | 9 | **integration (real Redis + Postgres)** |

**Total v6: 190** — 181 unit (18 archivos, smoke saltado en el gate) + 9 smoke real.

---

## 3. Comandos corridos (local) y resultados

```
npm run db:generate                                          → exit 0 (Prisma 5.22.0)
npx eslint <3 dirs v6> --ext .ts,.tsx                        → exit 0 (0 findings)
npx tsc -p tsconfig.ares-v6.json                             → exit 0
npx vitest run <3 dirs v6> --coverage=false                  → 181 passed | 9 skipped (18 files)
npm run ares:v6:fixtures -- --json / --fixture redmi-note-13 → tabla OK (General 178, src PPI)
```

**Smoke real (local, Postgres 16 + Redis 7 nativos):**
```
createdb sensipro_ares_v6_smoke (DB efímera y aislada)
DATABASE_URL=<smoke> npm run db:push:test                    → schema en sync
DATABASE_URL=<smoke> npm run ares:v6:seed:smoke              → {"activeId":"cmpw1vd3w…","inactiveId":"cmpw1vd58…"}
ARES_V6_REAL_INFRA_SMOKE=true … npx vitest run real-infra.smoke.test.ts → 9 passed (1 file)
dropdb sensipro_ares_v6_smoke (cleanup)
```

> Nota: las ids reales de Device (`cmpw1vd3w0000vs88ghis3gmy`) son cuid v1 y **pasan** `z.string().cuid()` — se cierra el riesgo (b) de fases previas.

### Resultados del smoke real

- **Redis**: contador real incrementa (count=1 en primer hit), TTL > 0; bloqueo por IP_DEVICE tras el límite; bloqueo por IP_GLOBAL aunque el `deviceId` rote.
- **Postgres**: device activo → `detectedPpi = 395` (screenDpi preservado); device inactivo → NotFound; id inexistente → NotFound.
- **Ruta E2E**: 200 (activo), 404 (inactivo), 429 (tras agotar el límite por device).

---

## 4. Resultado de CI

> **Pendiente de registrar tras el push.** Se actualiza con los run ids/conclusión de `Phase 0.1B ARES v6 Gate` y `ARES v6 Real-Infra Smoke` una vez ejecutado el workflow sobre el HEAD de Fase 3B.

---

## 5. Riesgos restantes

- **UNKNOWN_GLOBAL es un cap compartido** para todo el tráfico no confiable: bajo carga real podría ser ruidoso. Revisar cuando se exponga públicamente.
- **Proxy trust**: en producción detrás de Cloudflare→Vercel hay que fijar `strict` o un header confiable configurado; `lab`/`vercel` aceptan `x-forwarded-for`.
- **Fail-closed depende de Redis**: si Redis cae en prod, el endpoint responde 503 (correcto, pero es una dependencia dura). Considerar health-checks/alertas.
- **Smoke usa `prisma db push`** (no migraciones) contra DB efímera; el flujo de migraciones productivas no se toca aquí.
- **Hook Semgrep local** falla por falta de `SEMGREP_APP_TOKEN` (cosmético; no afecta el gate).

---

## 6. Recomendación para Fase 3C

**Fase 3C = "Internal Controlled Activation"**: activar `ARES_V6_API_ENABLED=true` SÓLO en un entorno interno/preview (no producción pública) con `ARES_V6_RATE_LIMIT_FAIL_MODE=closed`, `ARES_V6_PROXY_TRUST_MODE=strict` y `ARES_V6_LOG_SALT` fuerte; añadir dashboards sobre los eventos/métricas ya emitidos (sin PII), correr el feedback loop `/api/feedback/v6` detrás de `ARES_V6_WRITE_FEEDBACK`, y recolectar las primeras muestras por fixture antes de cualquier exposición pública. Ver runbook en la arquitectura.

---

## 7. Lo que NO se tocó (confirmado)

Pagos, Stripe, MercadoPago, webhooks, auth, NextAuth, middleware, command-center, admin APIs, pricing, landing, academy, UI del generador, schema Prisma productivo, migraciones productivas, y las rutas legacy `/api/generate`, `/api/generate/all`, `/api/generate/headshot`, `/api/export`.
