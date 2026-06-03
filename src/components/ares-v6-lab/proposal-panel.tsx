import { Ban, GitPullRequestArrow, Lock, UserCheck } from 'lucide-react';

import type { AresV6CalibrationProposal } from '@/lib/ares-v6/calibration-proposals';
import type { AresV6ProposalPanelData } from '@/lib/ares-v6/internal-ui-service';

import {
  blockedReasonLabel,
  proposalStatusLabel,
  proposalStatusTone,
  proposalTypeLabel,
  riskLevelTone,
  toneBadgeClass,
} from './presenters';
import { AresV6Badge, AresV6EmptyState, AresV6SectionCard } from './primitives';

// ═══════════════════════════════════════════════════════════════
// ARES v6 lab — Read-only proposal panel (Fase 3E)
//
// Calibration proposals are EVIDENCE for humans, never actions. This panel has
// NO apply / approve / publish control. Every proposal is shown with its
// invariants made explicit: autoApplyAllowed=false, humanReviewRequired=true.
// ═══════════════════════════════════════════════════════════════

function targetSummary(proposal: AresV6CalibrationProposal): string {
  const parts: string[] = [];
  if (proposal.target.presetId) parts.push(proposal.target.presetId);
  if (proposal.target.fixtureId) parts.push(proposal.target.fixtureId);
  if (proposal.target.ppiBand) parts.push(`PPI ${proposal.target.ppiBand}`);
  if (proposal.target.weaponCategory) parts.push(proposal.target.weaponCategory);
  if (proposal.target.slider) parts.push(proposal.target.slider);
  return parts.length > 0 ? parts.join(' · ') : 'global';
}

function ProposalCard({ proposal }: { proposal: AresV6CalibrationProposal }) {
  return (
    <li className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-sm font-semibold text-slate-100">
          {proposalTypeLabel(proposal.proposalType)}
        </span>
        <div className="flex items-center gap-1.5">
          <AresV6Badge tone={riskLevelTone(proposal.riskLevel)}>{proposal.riskLevel}</AresV6Badge>
          <AresV6Badge tone={proposalStatusTone(proposal.status)}>{proposalStatusLabel(proposal.status)}</AresV6Badge>
        </div>
      </div>

      <p className="mt-1 font-mono text-[11px] text-slate-500">objetivo: {targetSummary(proposal)}</p>

      {proposal.rationale.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {proposal.rationale.map((line, index) => (
            <li key={index} className="text-xs text-slate-300">
              {line}
            </li>
          ))}
        </ul>
      ) : null}

      {proposal.blockedReasons.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {proposal.blockedReasons.map((reason, index) => (
            <span
              key={`${reason}-${index}`}
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${toneBadgeClass('danger')}`}
            >
              {blockedReasonLabel(reason)}
            </span>
          ))}
        </div>
      ) : null}

      {proposal.requiredEvidence.length > 0 ? (
        <div className="mt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Evidencia requerida</p>
          <ul className="mt-1 space-y-0.5">
            {proposal.requiredEvidence.map((line, index) => (
              <li key={index} className="text-[11px] text-slate-400">
                · {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-white/5 pt-2 text-[11px]">
        <span className="inline-flex items-center gap-1 text-red-300">
          <Ban className="h-3.5 w-3.5" aria-hidden />
          Auto-aplicar: NO
        </span>
        <span className="inline-flex items-center gap-1 text-amber-300">
          <UserCheck className="h-3.5 w-3.5" aria-hidden />
          Revisión humana: SÍ
        </span>
        <span className="font-mono text-slate-600">{proposal.id}</span>
      </div>
    </li>
  );
}

export function AresV6ProposalReadOnlyPanel({ proposals }: { proposals: AresV6ProposalPanelData }) {
  const { posture } = proposals;
  return (
    <AresV6SectionCard
      title="Propuestas de calibración"
      subtitle={`Generadas desde ${proposals.generatedFrom.decision} · solo lectura`}
      icon={GitPullRequestArrow}
      badge={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
          <Lock className="h-3 w-3" aria-hidden />
          Nunca auto-aplicar
        </span>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-3 sm:grid-cols-3">
          <Invariant label="Auto-aplicar permitido" value={posture.autoApplyAllowed ? 'sí' : 'NO'} ok={!posture.autoApplyAllowed} />
          <Invariant label="Revisión humana" value={posture.humanReviewRequired ? 'obligatoria' : 'no'} ok={posture.humanReviewRequired} />
          <Invariant label="Modo" value={posture.readOnly ? 'solo lectura' : 'editable'} ok={posture.readOnly} />
        </div>

        {proposals.proposals.length > 0 ? (
          <ul className="space-y-3">
            {proposals.proposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </ul>
        ) : (
          <AresV6EmptyState
            title="Sin propuestas"
            message="La evidencia actual no genera propuestas de calibración accionables."
          />
        )}

        {proposals.truncated > 0 ? (
          <p className="text-[11px] text-slate-500">+{proposals.truncated} propuesta(s) truncada(s).</p>
        ) : null}
      </div>
    </AresV6SectionCard>
  );
}

function Invariant({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-slate-400">{label}</span>
      <span className={`font-mono text-[11px] font-semibold ${ok ? 'text-emerald-300' : 'text-red-300'}`}>{value}</span>
    </div>
  );
}
