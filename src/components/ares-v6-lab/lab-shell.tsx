import { Cpu, Radio, ShieldHalf } from 'lucide-react';

import type { AresV6PreviewResult } from '@/lib/ares-v6/internal-preview-service';
import type { AresV6InternalUiOperatorContext } from '@/lib/ares-v6/internal-ui-access';
import type { AresV6InternalDashboardData } from '@/lib/ares-v6/internal-ui-service';

import {
  AresV6CoverageCard,
  AresV6EvidenceOverviewCard,
  AresV6HeroStatusCard,
  AresV6LegacyComparisonSummary,
  AresV6StructuralRiskCard,
} from './evidence-cards';
import { AresV6GenerationConsole } from './generation-console';
import { AresV6SectionCard } from './primitives';
import { AresV6ProposalReadOnlyPanel } from './proposal-panel';

// ═══════════════════════════════════════════════════════════════
// ARES v6 lab — Dashboard shell (Fase 3E) — SERVER presentational
//
// Assembles the read-only command-lab from the dashboard view model. The only
// interactive island is the generation console; everything else is static SSR.
// ═══════════════════════════════════════════════════════════════

export interface AresV6LabShellProps {
  data: AresV6InternalDashboardData;
  operator: AresV6InternalUiOperatorContext;
  previewAction: (input: { fixtureId: string; presetId: string }) => Promise<AresV6PreviewResult>;
}

export function AresV6LabShell({ data, operator, previewAction }: AresV6LabShellProps) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 md:px-6">
      <AresV6HeroStatusCard evidence={data.evidence} flags={data.flags} />

      <AresV6GenerationConsole
        fixtures={data.fixtures}
        presets={data.presets}
        initialPreview={data.preview}
        initialPresetId={data.defaultSelection.presetId}
        previewAction={previewAction}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <AresV6EvidenceOverviewCard evidence={data.evidence} />
        <AresV6StructuralRiskCard evidence={data.evidence} />
      </div>

      <AresV6CoverageCard evidence={data.evidence} />

      <AresV6LegacyComparisonSummary evidence={data.evidence} />

      <AresV6ProposalReadOnlyPanel proposals={data.proposals} />

      <AresV6OperatorFooter operator={operator} posture={data.posture} />
    </div>
  );
}

function AresV6OperatorFooter({
  operator,
  posture,
}: {
  operator: AresV6InternalUiOperatorContext;
  posture: AresV6InternalDashboardData['posture'];
}) {
  return (
    <AresV6SectionCard title="Contexto del operador" subtitle="Sin secretos · solo nombres de flag" icon={ShieldHalf}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-200">
            <Cpu className="h-4 w-4 text-[#00c8ff]" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wider">Entorno</span>
          </div>
          <p className="font-mono text-[11px] text-slate-400">
            modo: {operator.mode.toLowerCase()} · env: {operator.environment} · protección prod:{' '}
            {operator.productionProtectionAcknowledged ? 'reconocida' : 'no'}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { label: 'solo lectura', on: posture.readOnly },
              { label: 'off por defecto', on: posture.offByDefault },
              { label: 'sin UI pública', on: !posture.publicUi },
              { label: 'no aplica propuestas', on: !posture.appliesProposals },
              { label: 'no escribe feedback', on: !posture.writesFeedback },
              { label: 'no toca el motor', on: !posture.touchesEngine },
            ].map((item) => (
              <span
                key={item.label}
                className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300"
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-200">
            <Radio className="h-4 w-4 text-[#ff6a00]" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wider">Superficies v6 activas</span>
          </div>
          {operator.enabledSurfaces.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {operator.enabledSurfaces.map((surface) => (
                <span
                  key={surface}
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-300"
                >
                  {surface}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500">Ninguna superficie backend activa (todo OFF por defecto).</p>
          )}
        </div>
      </div>
    </AresV6SectionCard>
  );
}
