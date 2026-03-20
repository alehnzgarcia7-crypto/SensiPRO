import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || '';

    // Si es localhost o IP privada, default a MX
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168') || ip.startsWith('10.')) {
      return NextResponse.json({ countryCode: 'MX' });
    }

    // ip-api.com (gratis, 45 req/min, HTTP only desde server)
    const geoRes = await fetch(
      `http://ip-api.com/json/${ip}?fields=countryCode`,
      { next: { revalidate: 86400 } } // Cache 24 horas
    );

    if (!geoRes.ok) {
      return NextResponse.json({ countryCode: 'MX' });
    }

    const geoData: { countryCode?: string } = await geoRes.json();
    return NextResponse.json({
      countryCode: geoData.countryCode || 'MX',
    });
  } catch {
    return NextResponse.json({ countryCode: 'MX' });
  }
}
