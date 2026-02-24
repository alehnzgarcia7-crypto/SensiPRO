import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';

import { requireRole } from '@/lib/auth/auth.middleware';

// ══════════════════════════════════════════════════════════
// GET /api/admin/devices — Listar dispositivos con filtros
// POST /api/admin/devices — Crear nuevo dispositivo
// ══════════════════════════════════════════════════════════

const ListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().optional(),
  brand: z.string().optional(),
  tier: z.enum(['LOW', 'MID', 'HIGH', 'ULTRA', 'GAMING']).optional(),
});

const CreateDeviceSchema = z.object({
  brand: z.string().min(2, 'Minimo 2 caracteres').max(50),
  model: z.string().min(2, 'Minimo 2 caracteres').max(100),
  slug: z
    .string()
    .min(3)
    .max(150)
    .regex(/^[a-z0-9-]+$/, 'Solo letras minusculas, numeros y guiones'),
  screenHz: z.number().int().min(30).max(240),
  screenSize: z.number().min(4).max(8),
  ramGb: z.number().int().min(1).max(24),
  panelType: z.enum(['LCD', 'IPS', 'AMOLED', 'OLED', 'LTPO']),
  tier: z.enum(['LOW', 'MID', 'HIGH', 'ULTRA', 'GAMING']),
  chipset: z.string().max(100).optional(),
  releaseYear: z.number().int().min(2015).max(2030).optional(),
  isPopular: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    await requireRole('ADMIN');

    const { searchParams } = new URL(request.url);
    const parsed = ListSchema.safeParse({
      page: searchParams.get('page') ?? 1,
      limit: searchParams.get('limit') ?? 50,
      search: searchParams.get('search') ?? undefined,
      brand: searchParams.get('brand') ?? undefined,
      tier: searchParams.get('tier') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Datos invalidos',
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }

    const { page, limit, search, brand, tier } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where['OR'] = [
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { chipset: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (brand) where['brand'] = brand;
    if (tier) where['tier'] = tier;

    const [devices, total] = await Promise.all([
      prisma.device.findMany({
        where,
        orderBy: [{ brand: 'asc' }, { model: 'asc' }],
        skip,
        take: limit,
        select: {
          id: true,
          brand: true,
          model: true,
          slug: true,
          screenHz: true,
          screenSize: true,
          ramGb: true,
          panelType: true,
          tier: true,
          chipset: true,
          isPopular: true,
          isActive: true,
          _count: { select: { sensitivities: true } },
        },
      }),
      prisma.device.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: devices,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole('ADMIN');

    const body: unknown = await request.json();
    const parsed = CreateDeviceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Datos invalidos',
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }

    const device = await prisma.device.create({ data: parsed.data });

    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: 'CREATE_DEVICE',
        target: device.id,
        details: { brand: device.brand, model: device.model },
      },
    });

    logger.info('Admin created device', {
      adminId: session.user.id,
      deviceId: device.id,
      brand: device.brand,
      model: device.model,
    });

    return NextResponse.json({ success: true, data: device }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
