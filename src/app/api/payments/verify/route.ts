/**
 * POST /api/payments/verify
 *
 * Verifica si un email tiene licencia premium.
 * Body: { email }
 * Returns: { isPremium, activatedAt?, paymentMethod? }
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { isAdminEmail } from '@/lib/constants/admin';
import { checkPremiumStatus } from '@/lib/payments/payment-service';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ isPremium: false }, { status: 200 });
    }

    // Admin override — respuesta inmediata sin DB
    if (isAdminEmail(email)) {
      return NextResponse.json({
        isPremium: true,
        isAdmin: true,
        email: email.toLowerCase().trim(),
        activatedAt: new Date('2024-01-01'),
        paymentMethod: 'admin_override',
      });
    }

    const status = await checkPremiumStatus(email);
    return NextResponse.json(status);
  } catch (error) {
    console.error('[SensiPRO] Premium verify error:', error);
    return NextResponse.json({ isPremium: false }, { status: 200 });
  }
}
