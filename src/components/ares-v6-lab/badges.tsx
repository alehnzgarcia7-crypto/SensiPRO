import type { AresV6StructuralRiskDecision } from '@/lib/ares-v6/evidence-snapshot';
import type { AresV6GoNoGoDecision } from '@/lib/ares-v6/evidence-thresholds';

import {
  goNoGoLabel,
  goNoGoTone,
  structuralRiskLabel,
  structuralRiskTone,
} from './presenters';
import { AresV6Badge } from './primitives';

// ═══════════════════════════════════════════════════════════════
// ARES v6 lab — Status badges (Fase 3E)
// Pure mappings from a decision enum to a toned pill. SSR-renderable.
// ═══════════════════════════════════════════════════════════════

export function AresV6GoNoGoBadge({ decision }: { decision: AresV6GoNoGoDecision }) {
  return <AresV6Badge tone={goNoGoTone(decision)}>{goNoGoLabel(decision)}</AresV6Badge>;
}

export function AresV6RiskBadge({ decision }: { decision: AresV6StructuralRiskDecision }) {
  return <AresV6Badge tone={structuralRiskTone(decision)}>{structuralRiskLabel(decision)}</AresV6Badge>;
}
