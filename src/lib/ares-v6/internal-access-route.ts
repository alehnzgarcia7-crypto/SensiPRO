import type { NextResponse } from 'next/server';

import { aresV6ErrorResponse } from './api-errors';
import { checkAresV6InternalAccess } from './internal-access';
import { logAresV6Event, type AresV6RequestContext } from './observability';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Unified internal access enforcement for routes (Fase 3C.1)
//
// Single chokepoint so every v6 surface enforces internal access identically:
// check → log a non-sensitive denial → return the stealth error response.
// No auth/NextAuth; the token is never exposed.
// ═══════════════════════════════════════════════════════════════

export type AresV6InternalAccessGuard = { ok: true } | { ok: false; response: NextResponse };

export function enforceAresV6InternalAccess(
  request: Request,
  ctx: AresV6RequestContext,
): AresV6InternalAccessGuard {
  const access = checkAresV6InternalAccess(request);
  if (access.ok) return { ok: true };

  logAresV6Event({
    type: 'ares_v6.internal_access_denied',
    ctx,
    data: {
      reason: access.reason,
      ...(access.unsafeModeIgnored ? { unsafeModeIgnored: access.unsafeModeIgnored } : {}),
    },
  });

  return {
    ok: false,
    response: aresV6ErrorResponse(
      access.code ?? 'NOT_FOUND',
      access.status === 403 ? 'Acceso no autorizado.' : 'Recurso no encontrado.',
      access.status ?? 404,
      { ctx },
    ),
  };
}
