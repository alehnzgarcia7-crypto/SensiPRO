/**
 * GET /api/offer-countdown
 *
 * Endpoint PÚBLICO que retorna la fecha de fin de la oferta.
 * Si la oferta ya expiró, auto-renueva a HOY + 6 días.
 * El precio SIEMPRE es $199 MXN — el contador es un loop
 * infinito de urgencia.
 *
 * Returns: { endDate: string, active: boolean }
 */

import { prisma } from '@ares/database';
import { NextResponse } from 'next/server';

const OFFER_DURATION_DAYS = 6;

export async function GET() {
  try {
    // Leer config de la DB
    const rows = await prisma.appConfig.findMany({
      where: { key: { in: ['offerEndDate', 'offerActive'] } },
    });

    let endDate: string | null = null;
    let active = true;

    for (const row of rows) {
      if (row.key === 'offerEndDate') endDate = row.value;
      if (row.key === 'offerActive') active = row.value === 'true';
    }

    const now = new Date();

    // Si no existe o ya expiró → auto-renovar
    if (!endDate || new Date(endDate) <= now) {
      const newEndDate = new Date(now.getTime() + OFFER_DURATION_DAYS * 24 * 60 * 60 * 1000);
      endDate = newEndDate.toISOString();

      // Upsert en la DB
      await prisma.appConfig.upsert({
        where: { key: 'offerEndDate' },
        update: { value: endDate },
        create: { key: 'offerEndDate', value: endDate, description: 'Fecha fin de oferta (auto-renovable cada 6 días)' },
      });

      // Asegurar que offerActive existe
      await prisma.appConfig.upsert({
        where: { key: 'offerActive' },
        update: {},
        create: { key: 'offerActive', value: 'true', description: 'Toggle de oferta activa' },
      });
    }

    return NextResponse.json({
      endDate,
      active,
    }, {
      headers: {
        // Cache por 5 minutos — no necesitamos consultar la DB en cada request
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch {
    // Fallback: retornar fecha a 6 días sin tocar DB
    const fallbackEnd = new Date(Date.now() + OFFER_DURATION_DAYS * 24 * 60 * 60 * 1000);
    return NextResponse.json({
      endDate: fallbackEnd.toISOString(),
      active: true,
    });
  }
}
