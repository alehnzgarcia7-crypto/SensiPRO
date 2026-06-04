import 'server-only';

import {
  ARES_V6_LATAM_CALIBRATION_FIXTURES,
  ARES_V6_PRESETS,
  generateAresV6,
  getAresV6CalibrationFixture,
  type AresV6DeviceSignal,
  type AresV6DeviceTier,
  type AresV6GenerationOutput,
  type AresV6PanelType,
  type AresV6PlayerSignal,
  type AresV6Preset,
  type AresV6PresetId,
} from '@ares/algorithms/engine-v6';

import {
  generateAresV6CalibrationProposals,
  type AresV6CalibrationProposal,
  type AresV6CalibrationProposalResult,
} from './calibration-proposals';
import type { AresV6DevicePresetCount } from './evidence-repository';
import {
  buildAresV6EvidenceSnapshot,
  type AresV6EvidenceComparisonSummary,
  type AresV6EvidenceSnapshot,
  type AresV6EvidenceSnapshotDeps,
  type AresV6HighRiskSummaryRow,
  type AresV6StructuralRisk,
  type AresV6TrustedFeedbackSummary,
} from './evidence-snapshot';
import type { AresV6EvidenceThresholds, AresV6GoNoGoResult } from './evidence-thresholds';
import {
  getAresV6InternalUiFlagState,
  type AresV6InternalUiFlagState,
} from './internal-ui-flags';
import { computeAresV6LabMetrics, type AresV6LabMetrics } from './lab-metrics';
import { buildAresV6ComparisonMatrix } from './legacy-vs-v6-comparator';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Internal UI service layer (Fase 3E) — SERVER ONLY
//
// The ONLY data source for the hidden internal lab UI. Everything here runs on
// the server and returns presentation-ready, NON-SENSITIVE view models:
//   • engine output for a fixture × preset (pure, no DB),
//   • a fixtures-only evidence snapshot (DB-free metrics deps),
//   • a fixtures-only legacy-vs-v6 comparison + structural risk,
//   • read-only, human-gated calibration proposals.
//
// Invariants (OWASP API1/API4/API6):
//   • No DB writes, no feedback writes, no proposal application.
//   • No tokens / IPs / secrets ever cross into a view model.
//   • Evidence rows are ALWAYS the summary projection (no legacy/v6 vectors or
//     deltas) — the same safe default as GET /api/lab/v6/evidence.
//   • The page is responsible for the access guard; this layer only assembles
//     non-sensitive data and never bypasses any gate to obtain it.
// ═══════════════════════════════════════════════════════════════

// ── Neutral lab player. Gyro is requested so operators can inspect gyro output;
//    components still render an empty state when the engine returns null. ──
const LAB_PREVIEW_PLAYER: AresV6PlayerSignal = {
  fingers: 3,
  playstyle: 'STANDARD',
  mode: 'BATTLE_ROYALE',
  preferredRange: 'MID',
  usesGyroscope: true,
};

export const ARES_V6_INTERNAL_UI_DEFAULT_PRESET: AresV6PresetId = 'STANDARD_PRO';

// ── Option list view models ──────────────────────────────────────

export interface AresV6FixtureOption {
  id: string;
  label: string;
  brand: string;
  model: string;
  priority: 'P0' | 'P1' | 'P2';
  tier: AresV6DeviceTier;
  ppi: number | null;
  screenHz: number;
  panelType: AresV6PanelType;
  ramGb: number;
  marketReason: string;
  primaryPresets: AresV6PresetId[];
}

export interface AresV6PresetOption {
  id: AresV6PresetId;
  publicName: string;
  category: AresV6Preset['category'];
  riskLevel: AresV6Preset['riskLevel'];
  validationStatus: AresV6Preset['validationStatus'];
  description: string;
}

/** Read the effective PPI from a device signal (ppi → screenDpi → null). */
function readDevicePpi(device: AresV6DeviceSignal): number | null {
  return device.ppi ?? device.screenDpi ?? null;
}

export function getAresV6FixtureOptions(): AresV6FixtureOption[] {
  return ARES_V6_LATAM_CALIBRATION_FIXTURES.map((fixture) => ({
    id: fixture.id,
    label: `${fixture.device.brand} ${fixture.device.model}`,
    brand: fixture.device.brand,
    model: fixture.device.model,
    priority: fixture.priority,
    tier: fixture.device.tier,
    ppi: readDevicePpi(fixture.device),
    screenHz: fixture.device.screenHz,
    panelType: fixture.device.panelType,
    ramGb: fixture.device.ramGb,
    marketReason: fixture.marketReason,
    primaryPresets: [...fixture.primaryPresets],
  }));
}

export function getAresV6PresetOptions(): AresV6PresetOption[] {
  return ARES_V6_PRESETS.map((preset) => ({
    id: preset.id,
    publicName: preset.publicName,
    category: preset.category,
    riskLevel: preset.riskLevel,
    validationStatus: preset.validationStatus,
    description: preset.description,
  }));
}

/** First P0 fixture (stable default for the dashboard); falls back to the first. */
export function getAresV6DefaultFixtureId(): string {
  const p0 = ARES_V6_LATAM_CALIBRATION_FIXTURES.find((fixture) => fixture.priority === 'P0');
  const fallback = ARES_V6_LATAM_CALIBRATION_FIXTURES[0];
  return p0?.id ?? fallback?.id ?? 'samsung-galaxy-a14';
}

// ── Generation preview view model ────────────────────────────────

export interface AresV6PreviewDevice {
  brand: string;
  model: string;
  label: string;
  tier: AresV6DeviceTier;
  ppi: number | null;
  screenHz: number;
  panelType: AresV6PanelType;
  ramGb: number;
  chipset: string | null;
}

export interface AresV6PreviewPreset {
  id: AresV6PresetId;
  publicName: string;
  category: AresV6Preset['category'];
  riskLevel: AresV6Preset['riskLevel'];
  validationStatus: AresV6Preset['validationStatus'];
  description: string;
}

export interface AresV6GenerationPreview {
  fixtureId: string;
  device: AresV6PreviewDevice;
  preset: AresV6PreviewPreset;
  generation: AresV6GenerationOutput;
}

export function isAresV6PresetId(value: string): value is AresV6PresetId {
  return ARES_V6_PRESETS.some((preset) => preset.id === value);
}

export function isAresV6FixtureId(value: string): boolean {
  return getAresV6CalibrationFixture(value) !== undefined;
}

/**
 * Build the full engine package for a fixture × preset. Pure (no DB). Throws on
 * an unknown fixture/preset — callers facing untrusted input must validate first
 * (see internal-preview-service for the Result-typed boundary).
 */
export function getAresV6GenerationPreview(input: {
  fixtureId: string;
  presetId: AresV6PresetId;
}): AresV6GenerationPreview {
  const fixture = getAresV6CalibrationFixture(input.fixtureId);
  if (!fixture) {
    throw new Error(`ARES v6 internal UI: unknown fixture "${input.fixtureId}"`);
  }
  const preset = ARES_V6_PRESETS.find((item) => item.id === input.presetId);
  if (!preset) {
    throw new Error(`ARES v6 internal UI: unknown preset "${input.presetId}"`);
  }

  const generation = generateAresV6({
    device: fixture.device,
    presetId: input.presetId,
    player: LAB_PREVIEW_PLAYER,
  });

  return {
    fixtureId: fixture.id,
    device: {
      brand: fixture.device.brand,
      model: fixture.device.model,
      label: `${fixture.device.brand} ${fixture.device.model}`,
      tier: fixture.device.tier,
      ppi: readDevicePpi(fixture.device),
      screenHz: fixture.device.screenHz,
      panelType: fixture.device.panelType,
      ramGb: fixture.device.ramGb,
      chipset: fixture.device.chipset ?? null,
    },
    preset: {
      id: preset.id,
      publicName: preset.publicName,
      category: preset.category,
      riskLevel: preset.riskLevel,
      validationStatus: preset.validationStatus,
      description: preset.description,
    },
    generation,
  };
}

// ── Evidence panel view model (summary-only, fixtures-only) ───────

export type AresV6EvidenceSource = 'FIXTURES_ONLY' | 'DB_EVIDENCE';

export interface AresV6EvidencePanelData {
  generatedAt: string;
  schemaVersion: string;
  source: AresV6EvidenceSource;
  thresholds: AresV6EvidenceThresholds;
  goNoGo: AresV6GoNoGoResult;
  structuralRisk: AresV6StructuralRisk;
  metrics: AresV6LabMetrics;
  coverage: {
    evidence: number;
    evidenceCovered: number;
    comparison: number;
    comparisonCovered: number;
    total: number;
  };
  trustedFeedback: AresV6TrustedFeedbackSummary;
  comparisonSummary: AresV6EvidenceComparisonSummary;
  /** ALWAYS the safe summary projection — never legacy/v6 vectors or deltas. */
  highRiskSummaryRows: AresV6HighRiskSummaryRow[];
  insufficientEvidenceRows: AresV6DevicePresetCount[];
  recommendedNextActions: string[];
  warnings: string[];
}

/** DB-free deps so the panel never needs Postgres: empty metrics, zero counts. */
function fixturesOnlySnapshotDeps(now: () => number): AresV6EvidenceSnapshotDeps {
  return {
    getMetrics: async () => computeAresV6LabMetrics([], []),
    getDevicePresetCounts: async () => [],
    now,
  };
}

/**
 * Build a fixtures-only evidence snapshot: real fixtures-vs-legacy comparison
 * (pure) + DB-free metrics. evidenceCoverage will be 0 because there is no real
 * persisted evidence yet — that is the HONEST state surfaced as FIXTURES_ONLY.
 */
export async function buildAresV6FixturesOnlyEvidenceSnapshot(
  now: () => number = () => Date.now(),
): Promise<AresV6EvidenceSnapshot> {
  const comparisonRows = buildAresV6ComparisonMatrix({});
  return buildAresV6EvidenceSnapshot({ comparisonRows }, fixturesOnlySnapshotDeps(now));
}

/** Shape a snapshot into the read-only panel view model. Summary rows only. */
export function shapeAresV6EvidencePanel(
  snapshot: AresV6EvidenceSnapshot,
  source: AresV6EvidenceSource = 'FIXTURES_ONLY',
): AresV6EvidencePanelData {
  return {
    generatedAt: snapshot.generatedAt,
    schemaVersion: snapshot.schemaVersion,
    source,
    thresholds: snapshot.thresholds,
    goNoGo: snapshot.goNoGo,
    structuralRisk: snapshot.structuralRisk,
    metrics: snapshot.metrics,
    coverage: {
      evidence: snapshot.evidenceFixtureCoverage,
      evidenceCovered: snapshot.evidenceCoveredFixtures,
      comparison: snapshot.comparisonFixtureCoverage,
      comparisonCovered: snapshot.comparisonCoveredFixtures,
      total: snapshot.totalFixtures,
    },
    trustedFeedback: snapshot.trustedFeedbackSummary,
    comparisonSummary: snapshot.comparisonSummary,
    // SAFE projection only — never snapshot.highRiskRows (which carry vectors).
    highRiskSummaryRows: snapshot.highRiskSummaryRows,
    insufficientEvidenceRows: snapshot.insufficientEvidenceRows,
    recommendedNextActions: snapshot.recommendedNextActions,
    warnings: snapshot.goNoGo.warnings,
  };
}

export async function getAresV6EvidencePanelData(
  input: { snapshot?: AresV6EvidenceSnapshot; now?: () => number } = {},
): Promise<AresV6EvidencePanelData> {
  const snapshot = input.snapshot ?? (await buildAresV6FixturesOnlyEvidenceSnapshot(input.now));
  return shapeAresV6EvidencePanel(snapshot);
}

// ── Read-only proposal view model (human-gated) ──────────────────

export interface AresV6ProposalPosture {
  readOnly: true;
  autoApplyAllowed: false;
  humanReviewRequired: true;
}

export interface AresV6ProposalPanelData {
  generatedFrom: AresV6CalibrationProposalResult['generatedFrom'];
  truncated: number;
  proposals: AresV6CalibrationProposal[];
  posture: AresV6ProposalPosture;
}

export async function getAresV6ReadOnlyProposalData(
  input: { snapshot?: AresV6EvidenceSnapshot; now?: () => number } = {},
): Promise<AresV6ProposalPanelData> {
  const snapshot = input.snapshot ?? (await buildAresV6FixturesOnlyEvidenceSnapshot(input.now));
  const result = generateAresV6CalibrationProposals(snapshot);
  return {
    generatedFrom: result.generatedFrom,
    truncated: result.truncated,
    proposals: result.proposals,
    posture: { readOnly: true, autoApplyAllowed: false, humanReviewRequired: true },
  };
}

// ── Full dashboard view model ────────────────────────────────────

export interface AresV6DashboardPosture {
  readOnly: true;
  offByDefault: true;
  publicUi: false;
  appliesProposals: false;
  writesFeedback: false;
  touchesEngine: false;
}

export interface AresV6InternalDashboardData {
  flags: AresV6InternalUiFlagState;
  posture: AresV6DashboardPosture;
  fixtures: AresV6FixtureOption[];
  presets: AresV6PresetOption[];
  defaultSelection: { fixtureId: string; presetId: AresV6PresetId };
  preview: AresV6GenerationPreview;
  evidence: AresV6EvidencePanelData;
  proposals: AresV6ProposalPanelData;
}

const DASHBOARD_POSTURE: AresV6DashboardPosture = {
  readOnly: true,
  offByDefault: true,
  publicUi: false,
  appliesProposals: false,
  writesFeedback: false,
  touchesEngine: false,
};

/**
 * Assemble the entire internal dashboard view model. The evidence snapshot is
 * built ONCE and reused for both the evidence panel and the proposals so the
 * fixtures-vs-legacy comparison runs a single time. All data is non-sensitive.
 */
export async function getAresV6InternalDashboardData(
  options: { now?: () => number } = {},
): Promise<AresV6InternalDashboardData> {
  const now = options.now ?? (() => Date.now());
  const fixtureId = getAresV6DefaultFixtureId();
  const presetId = ARES_V6_INTERNAL_UI_DEFAULT_PRESET;

  const snapshot = await buildAresV6FixturesOnlyEvidenceSnapshot(now);
  const [evidence, proposals] = await Promise.all([
    getAresV6EvidencePanelData({ snapshot }),
    getAresV6ReadOnlyProposalData({ snapshot }),
  ]);

  return {
    flags: getAresV6InternalUiFlagState(),
    posture: DASHBOARD_POSTURE,
    fixtures: getAresV6FixtureOptions(),
    presets: getAresV6PresetOptions(),
    defaultSelection: { fixtureId, presetId },
    preview: getAresV6GenerationPreview({ fixtureId, presetId }),
    evidence,
    proposals,
  };
}
