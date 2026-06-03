# Fase 3E — Hidden Internal Read-Only UI · Arquitectura

**Nombre:** SensiPRO ARES v6 · Command Lab
**Ruta:** `/internal/ares-v6`
**Postura:** interna · oculta · **solo lectura** · OFF por defecto · `noindex`
**Fecha:** 2026-06-03

---

## 1. Qué es (y qué NO es)

La Fase 3E entrega la **primera UI experimental de ARES v6**: una cabina de
laboratorio para que un operador interno **vea** la generación v6, la evidencia,
la comparación legacy-vs-v6, el riesgo estructural, el veredicto GO/NO-GO y las
propuestas de calibración **human-gated**.

Es **read-only por diseño**. No reemplaza el generador legacy, no se muestra al
público, no toca el motor, no aplica propuestas, no abre feedback público y no se
conecta al generador principal. Es una **cabina de decisión**, no marketing.

| Hace | NO hace |
|---|---|
| Render server-side de generación/evidencia/propuestas | Escribir a la DB / feedback / motor |
| Preview interactivo fixture×preset (server action read-only) | Persistir generaciones |
| Mostrar GO/NO-GO + riesgo estructural + cobertura | Aplicar / aprobar / publicar propuestas |
| Separar cobertura de EVIDENCIA vs COMPARACIÓN | Exponer token/secretos al cliente |
| 404 stealth cuando está OFF | Aparecer en nav público / sitemap / SEO |

---

## 2. Modelo de seguridad (la parte que importa)

### 2.1 NEXT_PUBLIC no es seguridad

`NEXT_PUBLIC_ARES_V6_ENABLED` viaja al navegador, así que **nunca** protege nada.
Solo puede usarse como *hint* de visibilidad de nav (y la 3E **no** renderiza
ningún nav público de todos modos). La seguridad real es **server-side**.

### 2.2 Capas de gate

```
Request a /internal/ares-v6
        │
        ▼
┌─────────────────────────────────────────────┐
│ assertCanViewAresV6InternalUi()  (server)    │
│  1. ARES_V6_INTERNAL_UI_ENABLED === 'true' ? │ ── no → notFound() (404 stealth)
│  2. NODE_ENV === 'production' ?              │
│       └─ ARES_V6_INTERNAL_UI_ALLOW_PRODUCTION│ ── falta → notFound()
│          === 'true' (ack de protección)      │
│  3. ok → render                              │
└─────────────────────────────────────────────┘
```

- **Gate único server:** `ARES_V6_INTERNAL_UI_ENABLED`. Si está off ⇒ `notFound()`.
- **Producción:** como una página de navegador **no puede portar el token interno
  de forma segura**, NO usamos el guard de header-token (ese sigue para la API).
  En su lugar exigimos un **acuse explícito** de que hay protección a nivel de
  deployment (Vercel password / protected preview): `ARES_V6_INTERNAL_UI_ALLOW_PRODUCTION`.
  Sin él, producción **404**. Nunca dependemos de la oscuridad ni inventamos auth.
- **Server Action** (`previewAresV6GenerationAction`) re-verifica el gate en su
  propio borde (defensa en profundidad) y valida los ids no confiables contra los
  enums reales (OWASP API1).

### 2.3 Nada sensible cruza al cliente

- El servicio de UI es **server-only**: corre el motor y el comparador en el
  servidor y devuelve **view models no sensibles**.
- El cliente nunca recibe token, IP, user-agent, body ni env de servidor.
- Las superficies activas se reportan **solo por nombre de flag** (vía
  `getAresV6EnabledSurfaces()`), nunca por valor.
- Las filas de evidencia son **siempre** la proyección *summary* (sin vectores
  legacy/v6 ni deltas) — el mismo default seguro de `GET /api/lab/v6/evidence`.

### 2.4 noindex / no sitemap / no nav

- `metadata.robots = { index:false, follow:false, nocache:true, googleBot:{...} }`
  en el layout (cascada a hijos) y en la page.
- `/internal/` añadido al `disallow` de `robots.ts` (higiene de crawler; consistente
  con `/admin/`).
- El sitemap es **manual** (lista explícita): `/internal/ares-v6` jamás se auto-incluye.
- **Cero** links en navbar/footer/mobile-nav.
- La page es `dynamic = 'force-dynamic'`: el flag se lee **por request**, nunca se
  cachea ni se exporta estáticamente.

### 2.5 Stealth 404

Cuando el gate niega, `notFound()` renderiza un 404 **genérico** que no menciona
ARES v6. El layout es **neutral** (sin banner revelador); la marca "interno /
solo lectura" vive en el *shell* del dashboard, que solo se renderiza cuando el
acceso ya está concedido. Así, el 404 nunca delata la existencia del lab.

---

## 3. Capas (server → cliente)

```
src/app/internal/ares-v6/
  layout.tsx        Server · noindex metadata · wrapper neutral
  page.tsx          Server · force-dynamic · assert guard → dashboard data → <AresV6LabShell>
  actions.ts        'use server' · previewAresV6GenerationAction (re-gate + read-only)
  loading.tsx       Skeleton
  not-found.tsx     Stealth 404 genérico (no revela el lab)
  error.tsx         'use client' · error seguro (solo digest, sin stack)

src/lib/ares-v6/  (SERVER ONLY)
  internal-ui-flags.ts      isAresV6InternalUiEnabled / shouldShow…Link / getMode / getFlagState
  internal-ui-access.ts     assertCanView… / getAccessState / maybeGetOperatorContext (deny inyectable)
  internal-ui-service.ts    getAresV6InternalDashboardData / …GenerationPreview / …EvidencePanelData /
                            …ReadOnlyProposalData / fixture+preset options  (view models)
  internal-preview-service.ts  previewAresV6Generation (Result-typed, valida enums, sin persistencia)

src/components/ares-v6-lab/  (presentacional; un solo island cliente)
  presenters.ts             PURO: tonos, labels MX, barras (testeable en node)
  primitives.tsx            SectionCard, Badge, Bar, StatPill, KeyValue, EmptyState
  badges.tsx                AresV6GoNoGoBadge, AresV6RiskBadge
  generation-preview-card.tsx  SensitivityGrid, HudFireButton, Confidence, Explanation, TuningSteps
  evidence-cards.tsx        Hero, Overview, Coverage (ev≠cmp), StructuralRisk, LegacyComparison
  proposal-panel.tsx        ProposalReadOnlyPanel (humanReviewRequired / autoApplyAllowed=false)
  fixture-preset-selector.tsx  'use client' · selects accesibles
  generation-console.tsx       'use client' · estado local + llama al server action
  lab-shell.tsx             Server · ensambla todo
```

**Server Components por defecto** (carga de datos + protección de secretos).
**Client Components solo** para interactividad local: la consola y el selector.
El resto es presentacional y SSR-renderable (probado con `react-dom/server`).

---

## 4. Flujo de datos

```
page.tsx (server)
  └─ assertCanViewAresV6InternalUi()           → 404 si OFF / prod sin ack
  └─ getAresV6InternalDashboardData()          → construye snapshot fixtures-only UNA vez
       ├─ getAresV6GenerationPreview(default)  → generateAresV6() (puro, sin DB)
       ├─ getAresV6EvidencePanelData(snapshot) → shape summary-only (sin vectores)
       └─ getAresV6ReadOnlyProposalData(snapshot) → generateAresV6CalibrationProposals()
  └─ <AresV6LabShell data operator previewAction/>

Operador cambia fixture/preset (cliente)
  └─ AresV6GenerationConsole → previewAresV6GenerationAction({fixtureId,presetId})  (server)
       └─ assertCanViewAresV6InternalUi()  (re-gate)
       └─ previewAresV6Generation()        (valida enums, sin persistencia)
       └─ Result { ok, preview } | { ok:false, code }
  └─ setPreview(result.preview)            (swap en cliente, sin recarga)
```

La evidencia es **fixtures-only** por defecto: métricas DB-free (vacías) +
comparación real fixtures-vs-legacy (pura). Por eso `evidenceCoverage = 0` y la
fuente se etiqueta **FIXTURES_ONLY** — el estado honesto hasta que se active el
lab interno con evidencia real persistida.

---

## 5. Reutilización de contratos 3D

La UI **no reimplementa** lógica: consume los mismos módulos del tribunal de
evidencia 3D, garantizando consistencia con el endpoint y la CLI.

| UI usa | De |
|---|---|
| `generateAresV6` | `@ares/algorithms/engine-v6` |
| `buildAresV6ComparisonMatrix` | `legacy-vs-v6-comparator.ts` (fixtures-only, puro) |
| `buildAresV6EvidenceSnapshot` | `evidence-snapshot.ts` (deps DB-free inyectadas) |
| `generateAresV6CalibrationProposals` | `calibration-proposals.ts` (`autoApplyAllowed:false`) |
| `getAresV6EnabledSurfaces` | `internal-access.ts` (nombres de flag, sin secretos) |

---

## 6. Decisiones de diseño

- **Sin librería de charts** (no Recharts): barras CSS simples (`role="meter"`
  con `aria-valuenow/min/max`). Bundle ligero.
- **Sin framer-motion** en los componentes presentacionales testeables (animación
  vía clases Tailwind), para que `renderToStaticMarkup` sea robusto y el bundle no crezca.
- **Presenters puros** separados de los componentes: la lógica (tonos/labels/barras)
  se prueba en el entorno node sin jsdom; los componentes se prueban con
  `react-dom/server` (`renderToStaticMarkup`) — sin agregar `@testing-library`/jsdom.
- **`metadata` sin tipo `Metadata`** (convención del repo, e.g. command-center):
  evita arrastrar los tipos root de `next` al tsconfig aislado de ares-v6 (que
  harían `NODE_ENV` requerido y romperían tests existentes).

Ver `OPERATOR-GUIDE.md` (flags, cómo activar) y `HIDDEN-UI-VALIDATION.md`
(tests, comandos, GO/NO-GO).
