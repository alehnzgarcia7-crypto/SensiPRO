# SensiPRO ARES v6 — Session Handoff

**Fecha:** 2026-06-01
**Rama:** `refactor/phase-0-nuclear-refoundation`
**PR:** [#1](https://github.com/alehnzgarcia7-crypto/SensiPRO/pull/1) — DRAFT, **MERGEABLE**
**HEAD:** `56fe7ce`

---

## Estado

- Working tree limpio, al día con `origin` (ahead=0, behind=0).
- Salud verde: `npx tsc -p tsconfig.ares-v6.json` → exit 0.
- Tests: **114 passed (11 files)** — `npx vitest run packages/algorithms/src/engine-v6 src/lib/ares-v6 src/app/api/generate/v6 --coverage=false`.
- CI: GitHub Actions run **26745234633** → conclusión **success**
  ([link](https://github.com/alehnzgarcia7-crypto/SensiPRO/actions/runs/26745234633)).
  `Phase 0.1B ARES v6 Gate` = success (bloqueante); `legacy-audit` = success (no bloqueante, `|| true`); `E2E Tests` = skipped.

---

## Fases completas

- **Fase 0** — Refundación nuclear: `docs/phase-0/*` (research, legacy-freeze-map, phase-1 spec, API-migration, rollback/governance) + contratos del motor v6 (`types`, `presets`, `research-matrix`, `dpi-curve`, `fixtures`) + `index`.
- **Fase 0.1** — Infra CI: `scripts/ci-runner.mjs` (logs determinísticos) + captura de artifacts por job.
- **Fase 0.1B** — Gate v6 verde: split del job bloqueante `Phase 0.1B ARES v6 Gate` vs `legacy-audit` no bloqueante; tsc estricto sobre engine-v6.
- **Fase 1** — Motor modular: monolito `generate.ts` → orquestador delgado + 10 módulos (`math`, `device-profile`, `sensitivity`, `weapons`, `gyro`, `fire-button`, `hud`, `tuning`, `confidence`, `explain`) + 7 suites de test.
- **Fase 1.5** — Quality gate patch: `tsconfig.ares-v6.json` (typecheck del motor **y sus tests**); `LAB_VERIFIED` exige PPI dentro de tolerancia (`ARES_V6_LAB_VERIFIED_PPI_TOLERANCE = 15`) vs el fixture; fix banda Galaxy S24 Ultra (`'520+'` → `'450-519'`); helper tipado `getFixturePpi`.
- **Fase 2 Foundation** — Backend aislado: `src/lib/ares-v6/` (`feature-flags`, `device-adapter` que nunca pierde `screenDpi`, `request-schema` Zod, `generate-service` con finder inyectable) + endpoint `POST /api/generate/v6`; alias `@ares/algorithms/engine-v6`; script `npm run ares:v6:fixtures`.

---

## Endpoint v6

- `POST /api/generate/v6` — **apagado por defecto**: si `ARES_V6_API_ENABLED !== 'true'` responde **404** (invisible en producción).
- No toca rutas legacy (`/api/generate`, `/api/generate/all`, `/api/generate/headshot`, `/api/export`) ni pagos/auth/middleware/UI/schema Prisma.
- **No escribe feedback** (Fase 2 es solo lectura/generación; `ARES_V6_WRITE_FEEDBACK` reservado para más adelante).

---

## SIGUIENTE: Fase 3A — Lab Hardening

Endurecer el endpoint antes de exponerlo (sigue apagado/lab). Prompt ya escrito, **pendiente de pegar**. Cubre:

- **Strict Zod** (`z.strictObject` / `.strict()`) para rechazar campos desconocidos en body/player/overrides.
- **Rate limit** por IP/identidad.
- **Payload guard** (límite de tamaño del body / símbolos / profundidad).
- **Observabilidad sin PII** (logs/metrics estructurados, nada sensible).
- **Access policy** (quién puede llamar; lab vs público).
- **Lab mode** (`ARES_V6_LAB_MODE`) para resultados experimentales a internos.

---

## Riesgos abiertos

- **(a) Rate limiter:** el de Fase 3A **DEBE** reutilizar el Redis existente
  (`src/lib/security/rate-limiter.ts` + `src/lib/cache/redis.ts`), **no** un `Map`
  en memoria (no escala entre instancias serverless ni sobrevive reinicios).
- **(b) Formato del id de Device:** `schema.prisma` declara `id String @id @default(cuid())`
  (cuid v1), consistente con el `z.string().cuid()` actual. Confirmar contra ids
  reales en DB antes de fijarlo (zod `.cuid()` valida cuid v1, no cuid2).
- **(c) Solo mock-tested:** el endpoint está probado con Prisma mockeado; falta un
  **smoke test contra DB real** (el bug original era `screenDpi` perdido en el adapter
  de rutas) — a más tardar en **Fase 3B**.
