import {
  AlertTriangle,
  Database,
  GitCompareArrows,
  Layers,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';

import type { AresV6InternalUiFlagState } from '@/lib/ares-v6/internal-ui-flags';
import type { AresV6EvidencePanelData } from '@/lib/ares-v6/internal-ui-service';

import { AresV6GoNoGoBadge, AresV6RiskBadge } from './badges';
import {
  expectednessLabel,
  expectednessTone,
  formatCoverage,
  formatRate,
  goNoGoCategoryLabel,
  isBlockingRisk,
  structuralRiskTone,
  toneBadgeClass,
} from './presenters';
import { AresV6Badge, AresV6Bar, AresV6EmptyState, AresV6SectionCard, AresV6StatPill } from './primitives';

// ═══════════════════════════════════════════════════════════════
// ARES v6 lab — Evidence cards (Fase 3E)
//
// Read-only views over the fixtures-only evidence snapshot. Coverage cards keep
// EVIDENCE (gates GO) and COMPARISON (informational) visually separate; the
// structural-risk card surfaces BLOCKING even when the GO/NO-GO is MORE_DATA.
// ═══════════════════════════════════════════════════════════════

export function AresV6HeroStatusCard({
  evidence,
  flags,
}: {
  evidence: AresV6EvidencePanelData;
  flags: AresV6InternalUiFlagState;
}) {
  const { goNoGo, structuralRisk, coverage, source } = evidence;
  return (
    <section className="overflow-hidden rounded-gaming border border-white/10 bg-gradient-to-br from-[#0a0f1e] to-[#0a1428] shadow-card">
      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#ff6a00]/40 bg-[#ff6a00]/10 px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff6a00]">
              SensiPRO Command Lab
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
              Solo lectura
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
              Interno · oculto
            </span>
          </div>
          <h1 className="font-display text-xl font-bold text-slate-50">ARES v6 · Cabina de laboratorio</h1>
          <p className="max-w-xl text-xs text-slate-400">
            Evidencia interna de refundación. No reemplaza el generador legacy, no se muestra al público y
            no aplica cambios al motor. Fuente actual:{' '}
            <span className="font-mono text-slate-300">
              {source === 'FIXTURES_ONLY' ? 'fixtures-only (sin DB real)' : 'evidencia DB'}
            </span>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
          <AresV6GoNoGoBadge decision={goNoGo.decision} />
          <AresV6RiskBadge decision={structuralRisk.decision} />
          <p className="font-mono text-[11px] text-slate-500">modo: {flags.mode.toLowerCase()}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px border-t border-white/5 bg-white/5 md:grid-cols-4">
        <HeroCell label="Cobertura evidencia" value={formatRate(coverage.evidence)} hint={`${coverage.evidenceCovered}/${coverage.total} fixtures`} />
        <HeroCell label="Cobertura comparación" value={formatRate(coverage.comparison)} hint="referencia, no evidencia" />
        <HeroCell label="Filas peligrosas" value={String(structuralRisk.dangerousRows)} hint="estructural" />
        <HeroCell label="Generaciones" value={String(evidence.metrics.totalGenerations)} hint="muestra real" />
      </div>
    </section>
  );
}

function HeroCell({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-[#0a0f1e] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-0.5 font-mono text-lg font-semibold text-slate-100">{value}</p>
      <p className="text-[10px] text-slate-500">{hint}</p>
    </div>
  );
}

export function AresV6EvidenceOverviewCard({ evidence }: { evidence: AresV6EvidencePanelData }) {
  const { goNoGo, metrics, recommendedNextActions, warnings } = evidence;
  return (
    <AresV6SectionCard
      title="Veredicto GO / NO-GO"
      subtitle={`thresholds ${goNoGo.thresholdsVersion} · decisión humana siempre`}
      icon={ShieldCheck}
      badge={<AresV6GoNoGoBadge decision={goNoGo.decision} />}
    >
      <div className="space-y-4">
        <ul className="space-y-1">
          {goNoGo.rationale.map((line, index) => (
            <li key={index} className="text-xs text-slate-300">
              {line}
            </li>
          ))}
        </ul>

        {goNoGo.failedCriteria.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Criterios fallidos</p>
            {goNoGo.failedCriteria.map((criterion, index) => (
              <div
                key={`${criterion.criterion}-${index}`}
                className="flex items-center justify-between gap-2 rounded-md border border-white/5 bg-white/[0.02] px-2.5 py-1.5"
              >
                <span className="flex items-center gap-2">
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${toneBadgeClass('warn')}`}>
                    {goNoGoCategoryLabel(criterion.category)}
                  </span>
                  <span className="font-mono text-[11px] text-slate-300">{criterion.criterion}</span>
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {criterion.actual} {criterion.comparison === 'gt' ? '>' : '<'} {criterion.threshold}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <AresV6StatPill label="Generaciones" value={metrics.totalGenerations} />
          <AresV6StatPill label="Feedback TRUSTED" value={metrics.totalFeedback} />
          <AresV6StatPill label="p95 (ms)" value={metrics.p95TotalDurationMs} />
          <AresV6StatPill label="Fallback PPI" value={formatRate(metrics.fallbackPpiRate)} />
        </div>

        {warnings.length > 0 ? (
          <div className="space-y-1 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">Advertencias</p>
            {warnings.map((warning, index) => (
              <p key={index} className="text-xs text-amber-200/90">
                {warning}
              </p>
            ))}
          </div>
        ) : null}

        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Próximas acciones recomendadas
          </p>
          <ul className="space-y-1.5">
            {recommendedNextActions.map((action, index) => (
              <li key={index} className="flex gap-2 text-xs text-slate-300">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#00c8ff]" aria-hidden />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AresV6SectionCard>
  );
}

export function AresV6CoverageCard({ evidence }: { evidence: AresV6EvidencePanelData }) {
  const { coverage, thresholds } = evidence;
  return (
    <AresV6SectionCard
      title="Cobertura de fixtures"
      subtitle="Evidencia real y comparación son métricas distintas"
      icon={Layers}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* EVIDENCE — gates GO */}
        <div className="rounded-lg border border-[#00c8ff]/25 bg-[#00c8ff]/[0.04] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Database className="h-4 w-4 text-[#00c8ff]" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">Cobertura de EVIDENCIA</span>
          </div>
          <AresV6Bar
            label="DB real · gatea GO"
            value={formatCoverage(coverage.evidence, coverage.evidenceCovered, coverage.total)}
            barPercent={coverage.evidence * 100}
            tone="info"
          />
          <p className="mt-2 text-[11px] text-slate-400">
            Solo generaciones persistidas cuentan. Umbral GO ≥ {formatRate(thresholds.minFixtureCoverage)}.
          </p>
        </div>

        {/* COMPARISON — informational only */}
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <div className="mb-2 flex items-center gap-2">
            <GitCompareArrows className="h-4 w-4 text-slate-400" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Cobertura de COMPARACIÓN</span>
          </div>
          <AresV6Bar
            label="fixtures-only · informativa"
            value={formatCoverage(coverage.comparison, coverage.comparisonCovered, coverage.total)}
            barPercent={coverage.comparison * 100}
            tone="neutral"
          />
          <p className="mt-2 text-[11px] text-slate-500">
            Referencia fixtures-vs-legacy. <span className="text-amber-300/80">NO es evidencia</span> y no gatea
            la decisión.
          </p>
        </div>
      </div>
    </AresV6SectionCard>
  );
}

export function AresV6StructuralRiskCard({ evidence }: { evidence: AresV6EvidencePanelData }) {
  const { structuralRisk } = evidence;
  const blocking = isBlockingRisk(structuralRisk.decision);
  return (
    <AresV6SectionCard
      title="Riesgo estructural"
      subtitle="Independiente del tamaño de muestra"
      icon={blocking ? TriangleAlert : ShieldCheck}
      badge={<AresV6RiskBadge decision={structuralRisk.decision} />}
    >
      <div className="space-y-3">
        {blocking ? (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" aria-hidden />
            <p className="text-xs font-medium text-red-200">
              BLOQUEANTE: {structuralRisk.dangerousRows} fila(s) DANGEROUS. Revisión humana obligatoria antes de
              cualquier activación. Nunca auto-aplicar.
            </p>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <AresV6StatPill label="Peligrosas" value={structuralRisk.dangerousRows} tone={structuralRisk.dangerousRows > 0 ? 'danger' : 'ok'} />
          <AresV6StatPill label="A revisar" value={structuralRisk.needsReviewRows} tone={structuralRisk.needsReviewRows > 0 ? 'warn' : 'ok'} />
          <AresV6StatPill label="PPI fallback" value={structuralRisk.fallbackPpiRows} tone={structuralRisk.fallbackPpiRows > 0 ? 'warn' : 'ok'} />
          <AresV6StatPill label="Sin legacy" value={structuralRisk.noLegacyEquivalentRows} />
        </div>

        <ul className="space-y-1">
          {structuralRisk.rationale.map((line, index) => (
            <li key={index} className={`text-xs ${structuralRiskTone(structuralRisk.decision) === 'ok' ? 'text-slate-400' : 'text-slate-300'}`}>
              {line}
            </li>
          ))}
        </ul>
      </div>
    </AresV6SectionCard>
  );
}

export function AresV6LegacyComparisonSummary({ evidence }: { evidence: AresV6EvidencePanelData }) {
  const { comparisonSummary, highRiskSummaryRows } = evidence;
  const byPreset = Object.entries(comparisonSummary.byPreset);
  return (
    <AresV6SectionCard
      title="Comparación legacy vs v6"
      subtitle="Resumen fixtures-only · sin vectores crudos"
      icon={GitCompareArrows}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <AresV6StatPill label="Total" value={comparisonSummary.total} />
          <AresV6StatPill label="Esperadas" value={comparisonSummary.expected} tone="ok" />
          <AresV6StatPill label="A revisar" value={comparisonSummary.needsReview} tone={comparisonSummary.needsReview > 0 ? 'warn' : 'ok'} />
          <AresV6StatPill label="Peligrosas" value={comparisonSummary.dangerous} tone={comparisonSummary.dangerous > 0 ? 'danger' : 'ok'} />
          <AresV6StatPill label="Con legacy" value={comparisonSummary.legacyComparable} />
          <AresV6StatPill label="Sin legacy" value={comparisonSummary.noLegacyEquivalent} />
        </div>

        {byPreset.length > 0 ? (
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Por preset</p>
            <div className="flex flex-wrap gap-1.5">
              {byPreset.map(([presetId, bucket]) => (
                <span
                  key={presetId}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-2 py-1 text-[11px]"
                >
                  <span className="font-mono text-slate-300">{presetId}</span>
                  <span className="text-slate-500">{bucket.total}</span>
                  {bucket.dangerous > 0 ? <span className="text-red-300">·{bucket.dangerous}⚠</span> : null}
                  {bucket.needsReview > 0 ? <span className="text-amber-300">·{bucket.needsReview}?</span> : null}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Filas de alto riesgo ({highRiskSummaryRows.length})
          </p>
          {highRiskSummaryRows.length > 0 ? (
            <ul className="space-y-1.5">
              {highRiskSummaryRows.slice(0, 12).map((row, index) => (
                <li
                  key={`${row.fixtureId}-${row.presetId}-${index}`}
                  className="rounded-md border border-white/5 bg-white/[0.02] px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-200">
                      {row.brand} {row.model} · <span className="font-mono text-slate-400">{row.presetId}</span>
                    </span>
                    <AresV6Badge tone={expectednessTone(row.expectedness)}>{expectednessLabel(row.expectedness)}</AresV6Badge>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    PPI {row.ppi} · {row.ppiSource}
                    {row.fallbackPpi ? ' · fallback' : ''}
                    {!row.legacyEquivalent ? ' · sin legacy' : ''}
                  </p>
                  {row.rationale.length > 0 ? (
                    <p className="mt-1 text-[11px] text-slate-400">{row.rationale[0]}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <AresV6EmptyState
              title="Sin filas de alto riesgo"
              message="Ninguna comparación fixtures-only requiere revisión humana."
            />
          )}
          {highRiskSummaryRows.length > 12 ? (
            <p className="mt-2 text-[11px] text-slate-500">
              +{highRiskSummaryRows.length - 12} fila(s) adicionales no mostradas (límite de UI).
            </p>
          ) : null}
        </div>
      </div>
    </AresV6SectionCard>
  );
}
