import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';

import { requireRole } from '@/lib/auth/auth.middleware';
import {
  generateActivationCode,
  bulkGenerateCodes,
} from '@/lib/payments/activation-codes';

// ══════════════════════════════════════════════════════════
// GET /api/admin/codes — Listar codigos de activacion
// POST /api/admin/codes — Generar codigos (individual o bulk)
// ══════════════════════════════════════════════════════════

const ListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['AVAILABLE', 'USED', 'EXPIRED']).optional(),
  type: z
    .enum([
      'PREMIUM_30',
      'PREMIUM_90',
      'PREMIUM_365',
      'VIP_30',
      'VIP_90',
      'VIP_365',
    ])
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireRole('ADMIN');

    const { searchParams } = new URL(request.url);
    const parsed = ListSchema.safeParse({
      page: searchParams.get('page') ?? 1,
      limit: searchParams.get('limit') ?? 20,
      status: searchParams.get('status') ?? undefined,
      type: searchParams.get('type') ?? undefined,
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

    const { page, limit, status, type } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where['status'] = status;
    if (type) where['type'] = type;

    const [codes, total] = await Promise.all([
      prisma.activationCode.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          createdBy: { select: { id: true, username: true } },
          usedBy: { select: { id: true, username: true, email: true } },
        },
      }),
      prisma.activationCode.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: codes,
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

const GenerateSchema = z.object({
  type: z.enum([
    'PREMIUM_30',
    'PREMIUM_90',
    'PREMIUM_365',
    'VIP_30',
    'VIP_90',
    'VIP_365',
  ]),
  count: z.number().int().min(1).max(100).default(1),
  expiresAt: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole('ADMIN');
    const body: unknown = await request.json();
    const parsed = GenerateSchema.safeParse(body);

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

    const { type, count, expiresAt } = parsed.data;
    const expDate = expiresAt ? new Date(expiresAt) : undefined;

    if (count === 1) {
      const code = await generateActivationCode(
        type,
        session.user.id,
        expDate,
      );
      return NextResponse.json({ success: true, data: code });
    }

    const codes = await bulkGenerateCodes(
      type,
      count,
      session.user.id,
      expDate,
    );

    return NextResponse.json({
      success: true,
      data: codes,
      meta: { count: codes.length },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
