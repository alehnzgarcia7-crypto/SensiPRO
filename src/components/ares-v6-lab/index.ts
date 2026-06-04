// ═══════════════════════════════════════════════════════════════
// ARES v6 lab — Component barrel (Fase 3E)
// Hidden internal read-only UI. Not referenced by any public surface.
// ═══════════════════════════════════════════════════════════════

export { AresV6GoNoGoBadge, AresV6RiskBadge } from './badges';
export {
  AresV6CoverageCard,
  AresV6EvidenceOverviewCard,
  AresV6HeroStatusCard,
  AresV6LegacyComparisonSummary,
  AresV6StructuralRiskCard,
} from './evidence-cards';
export { AresV6FixturePresetSelector } from './fixture-preset-selector';
export { AresV6GenerationConsole } from './generation-console';
export {
  AresV6ConfidenceCard,
  AresV6ExplanationPanel,
  AresV6GenerationPreviewCard,
  AresV6HudFireButtonCard,
  AresV6SensitivityGrid,
  AresV6TuningStepsPanel,
} from './generation-preview-card';
export { AresV6LabShell } from './lab-shell';
export {
  AresV6Badge,
  AresV6Bar,
  AresV6EmptyState,
  AresV6KeyValue,
  AresV6SectionCard,
  AresV6StatPill,
} from './primitives';
export { AresV6ProposalReadOnlyPanel } from './proposal-panel';
export * from './presenters';
