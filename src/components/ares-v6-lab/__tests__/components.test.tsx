import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';

import {
  getAresV6EvidencePanelData,
  getAresV6GenerationPreview,
  getAresV6ReadOnlyProposalData,
  type AresV6EvidencePanelData,
  type AresV6GenerationPreview,
  type AresV6ProposalPanelData,
} from '@/lib/ares-v6/internal-ui-service';

import { AresV6GoNoGoBadge, AresV6RiskBadge } from '../badges';
import {
  AresV6CoverageCard,
  AresV6LegacyComparisonSummary,
  AresV6StructuralRiskCard,
} from '../evidence-cards';
import { AresV6GenerationPreviewCard, AresV6SensitivityGrid } from '../generation-preview-card';
import { AresV6EmptyState } from '../primitives';
import { AresV6ProposalReadOnlyPanel } from '../proposal-panel';

// ═══════════════════════════════════════════════════════════════
// Fase 3E — component render tests via react-dom/server (no jsdom needed).
// Proves the cards render real engine/evidence data, keep evidence vs comparison
// coverage separate, surface BLOCKING, keep proposals read-only, and never leak
// a token/secret into the HTML.
// ═══════════════════════════════════════════════════════════════

function html(node: ReactElement): string {
  return renderToStaticMarkup(node);
}

const NOW = () => 1_717_000_000_000;

let evidence: AresV6EvidencePanelData;
let proposals: AresV6ProposalPanelData;
let preview: AresV6GenerationPreview;

beforeAll(async () => {
  evidence = await getAresV6EvidencePanelData({ now: NOW });
  proposals = await getAresV6ReadOnlyProposalData({ now: NOW });
  preview = getAresV6GenerationPreview({ fixtureId: 'samsung-galaxy-a14', presetId: 'STANDARD_PRO' });
});

describe('AresV6SensitivityGrid', () => {
  it('renders the six sensitivity sliders', () => {
    const markup = html(
      <AresV6SensitivityGrid
        sensitivity={{ general: 175, redPoint: 170, scope2x: 130, scope4x: 100, sniperScope: 80, freeView: 180 }}
        gyroscope={null}
      />,
    );
    for (const label of ['General', 'Punto Rojo', 'Mira 2x', 'Mira 4x', 'Mira Francotirador', 'Vista Libre']) {
      expect(markup).toContain(label);
    }
  });
});

describe('AresV6CoverageCard', () => {
  it('renders EVIDENCE and COMPARISON coverage as separate blocks', () => {
    const markup = html(<AresV6CoverageCard evidence={evidence} />);
    expect(markup).toContain('Cobertura de EVIDENCIA');
    expect(markup).toContain('Cobertura de COMPARACIÓN');
    // The comparison block must explicitly disclaim it is not evidence.
    expect(markup).toContain('NO es evidencia');
  });
});

describe('AresV6StructuralRiskCard', () => {
  it('shows the BLOCKING warning when risk is blocking', () => {
    const blocking: AresV6EvidencePanelData = {
      ...evidence,
      structuralRisk: { ...evidence.structuralRisk, decision: 'BLOCKING' as const, dangerousRows: 2 },
    };
    const markup = html(<AresV6StructuralRiskCard evidence={blocking} />);
    expect(markup).toContain('BLOQUEANTE');
    expect(markup).toContain('Revisión humana obligatoria');
  });

  it('does not show the BLOCKING warning when risk is clear', () => {
    const clear: AresV6EvidencePanelData = {
      ...evidence,
      structuralRisk: { ...evidence.structuralRisk, decision: 'CLEAR' as const, dangerousRows: 0 },
    };
    const markup = html(<AresV6StructuralRiskCard evidence={clear} />);
    expect(markup).not.toContain('BLOQUEANTE');
  });
});

describe('AresV6ProposalReadOnlyPanel', () => {
  it('renders the read-only / human-gated posture', () => {
    const markup = html(<AresV6ProposalReadOnlyPanel proposals={proposals} />);
    expect(markup).toContain('Nunca auto-aplicar');
    expect(markup).toContain('Auto-aplicar: NO');
    expect(markup).toContain('Revisión humana');
    // No apply/approve/publish control should exist.
    expect(markup).not.toMatch(/aplicar propuesta/i);
    expect(markup).not.toMatch(/aprobar/i);
  });
});

describe('AresV6EmptyState', () => {
  it('renders a title and message', () => {
    const markup = html(<AresV6EmptyState title="Sin datos" message="Nada que mostrar" />);
    expect(markup).toContain('Sin datos');
    expect(markup).toContain('Nada que mostrar');
  });
});

describe('badges', () => {
  it('render decision and risk labels', () => {
    expect(html(<AresV6GoNoGoBadge decision="GO_INTERNAL_UI_EXPERIMENT" />)).toContain('GO');
    expect(html(<AresV6RiskBadge decision="BLOCKING" />)).toContain('Bloqueante');
  });
});

describe('no secret leaks in rendered HTML', () => {
  it('renders real data without any token / secret pattern', () => {
    const markup =
      html(<AresV6GenerationPreviewCard preview={preview} />) +
      html(<AresV6CoverageCard evidence={evidence} />) +
      html(<AresV6LegacyComparisonSummary evidence={evidence} />) +
      html(<AresV6ProposalReadOnlyPanel proposals={proposals} />);

    expect(markup).not.toMatch(/sha256/i);
    expect(markup).not.toMatch(/bearer /i);
    expect(markup).not.toContain('x-ares-v6-lab-token');
    expect(markup).not.toContain('ARES_V6_INTERNAL_ACCESS_TOKEN');
    expect(markup).not.toMatch(/\b[a-f0-9]{64}\b/);
  });
});
