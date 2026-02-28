/**
 * POST /api/payments/capture-email
 *
 * Captura un email para remarketing (antes del paywall).
 * Body: { email, source, device?, style?, fingerCount? }
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { captureEmail } from '@/lib/payments/payment-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email || !body.email.includes('@')) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const success = await captureEmail({
      email: body.email,
      source: body.source || 'unknown',
      device: body.device,
      style: body.style,
      fingerCount: body.fingerCount,
    });

    return NextResponse.json({ success });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
