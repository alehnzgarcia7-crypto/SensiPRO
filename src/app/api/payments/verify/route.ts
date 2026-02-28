/**
 * POST /api/payments/verify
 *
 * Verifica si un email tiene licencia premium.
 * Body: { email }
 * Returns: { isPremium, activatedAt?, paymentMethod? }
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { checkPremiumStatus } from '@/lib/payments/payment-service';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ isPremium: false }, { status: 200 });
    }

    const status = await checkPremiumStatus(email);
    return NextResponse.json(status);
  } catch (error) {
    console.error('[SensiPRO] Premium verify error:', error);
    return NextResponse.json({ isPremium: false }, { status: 200 });
  }
}
