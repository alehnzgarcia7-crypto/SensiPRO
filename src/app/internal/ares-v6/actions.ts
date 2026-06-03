'use server';

import {
  previewAresV6Generation,
  type AresV6PreviewResult,
} from '@/lib/ares-v6/internal-preview-service';
import { assertCanViewAresV6InternalUi } from '@/lib/ares-v6/internal-ui-access';

// ═══════════════════════════════════════════════════════════════
// ARES v6 internal lab — Server Action (Fase 3E)
//
// READ-ONLY preview action for the hidden console. Re-asserts the UI access gate
// at the action boundary (defense in depth — a denied UI 404s here too), then
// delegates to the validated, persistence-free preview service. The internal
// token / DB never reach the client; the client only receives a plain Result.
// ═══════════════════════════════════════════════════════════════

export async function previewAresV6GenerationAction(input: {
  fixtureId: string;
  presetId: string;
}): Promise<AresV6PreviewResult> {
  // 404 (notFound) when the UI is off or production is unprotected.
  assertCanViewAresV6InternalUi();
  // The service re-checks access and validates the untrusted ids against the
  // real enums; it never persists, never writes feedback, never mutates state.
  return previewAresV6Generation({ fixtureId: input.fixtureId, presetId: input.presetId });
}
