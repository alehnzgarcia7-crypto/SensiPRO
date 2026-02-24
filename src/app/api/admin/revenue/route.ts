import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { handleApiError } from '@ares/errors';

import { requireRole } from '@/lib/auth/auth.middleware';
import {
  getRevenueAnalytics,
  getMonthlyRevenue,
  getConversionTrend,
} from '@/lib/analytics/revenue';

// ══════════════════════════════════════════════════════════
// GET /api/admin/revenue — Revenue analytics dashboard
// Query params opcionales: ?monthly=2026-02 o ?trend=true
// Sin params: devuelve overview completo
// ══════════════════════════════════════════════════════════

const MonthlySchema = z.object({
  year: z.coerce.number().int().min(2024).max(2030),
  month: z.coerce.number().int().min(1).max(12),
});

export async function GET(request: NextRequest) {
  try {
    await requireRole('ADMIN');

    const { searchParams } = new URL(request.url);
    const monthlyParam = searchParams.get('monthly');
    const trendParam = searchParams.get('trend');

    // Modo: revenue mensual específico
    if (monthlyParam) {
      const parts = monthlyParam.split('-');
      const parsed = MonthlySchema.safeParse({
        year: parts[0],
        month: parts[1],
      });

      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Formato de mes invalido. Usar YYYY-MM (ej: 2026-02)',
              statusCode: 400,
            },
          },
          { status: 400 },
        );
      }

      const monthly = await getMonthlyRevenue(parsed.data.year, parsed.data.month);
      return NextResponse.json({ success: true, data: monthly });
    }

    // Modo: tendencia de conversión (últimos 6 meses)
    if (trendParam === 'true') {
      const trend = await getConversionTrend();
      return NextResponse.json({ success: true, data: trend });
    }

    // Modo default: dashboard completo
    const analytics = await getRevenueAnalytics();
    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    return handleApiError(error);
  }
}
