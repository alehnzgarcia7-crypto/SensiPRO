import { NextResponse } from 'next/server';

import { handleApiError } from '@ares/errors';

import { getRequiredSession } from '@/lib/auth/auth.middleware';
import { getReferralStats } from '@/lib/payments/referrals';

/**
 * GET /api/referrals — Obtener estadísticas de referidos del usuario autenticado
 */
export async function GET(): Promise<NextResponse> {
  try {
    const session = await getRequiredSession();
    const userId = session.user.id as string;
    const stats = await getReferralStats(userId);

    return NextResponse.json({ success: true, data: stats });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
