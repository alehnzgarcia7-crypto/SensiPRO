import 'server-only';

import type { AresV6PresetId } from '@ares/algorithms/engine-v6';

import {
  getAresV6InternalUiAccessState,
  type AresV6InternalUiAccessState,
} from './internal-ui-access';
import {
  getAresV6GenerationPreview,
  isAresV6FixtureId,
  isAresV6PresetId,
  type AresV6GenerationPreview,
} from './internal-ui-service';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Internal preview service (Fase 3E) — SERVER ONLY
//
// The Result-typed core behind the read-only preview Server Action. It re-checks
// access (defense-in-depth — the page already gated, the action gates again),
// validates the UNTRUSTED fixtureId/presetId against the real enums (OWASP API1),
// and returns a generation preview. It NEVER persists, NEVER writes feedback and
// NEVER touches the engine state — it only runs the pure engine on a known
// fixture. Deps are injected so the 200-path is unit-tested without Next.
// ═══════════════════════════════════════════════════════════════

export type AresV6PreviewErrorCode = 'ACCESS_DENIED' | 'UNKNOWN_FIXTURE' | 'UNKNOWN_PRESET';

export interface AresV6PreviewError {
  ok: false;
  code: AresV6PreviewErrorCode;
  message: string;
}

export type AresV6PreviewResult =
  | { ok: true; preview: AresV6GenerationPreview }
  | AresV6PreviewError;

export interface AresV6PreviewDeps {
  getAccessState: () => AresV6InternalUiAccessState;
  buildPreview: (input: { fixtureId: string; presetId: AresV6PresetId }) => AresV6GenerationPreview;
}

const DEFAULT_DEPS: AresV6PreviewDeps = {
  getAccessState: getAresV6InternalUiAccessState,
  buildPreview: getAresV6GenerationPreview,
};

/**
 * Validate input and produce a read-only generation preview, or a typed error.
 * Order: access → fixture → preset → build. No persistence, no feedback, no
 * engine mutation. A denied access returns a neutral message (stealth).
 */
export function previewAresV6Generation(
  input: { fixtureId: string; presetId: string },
  deps: AresV6PreviewDeps = DEFAULT_DEPS,
): AresV6PreviewResult {
  const access = deps.getAccessState();
  if (!access.ok) {
    return { ok: false, code: 'ACCESS_DENIED', message: 'Recurso no disponible.' };
  }

  if (!isAresV6FixtureId(input.fixtureId)) {
    return { ok: false, code: 'UNKNOWN_FIXTURE', message: 'Dispositivo de laboratorio no reconocido.' };
  }

  if (!isAresV6PresetId(input.presetId)) {
    return { ok: false, code: 'UNKNOWN_PRESET', message: 'Preset de ARES v6 no reconocido.' };
  }

  const preview = deps.buildPreview({ fixtureId: input.fixtureId, presetId: input.presetId });
  return { ok: true, preview };
}
