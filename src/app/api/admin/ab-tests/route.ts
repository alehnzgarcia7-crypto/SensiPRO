import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';

import { requireRole } from '@/lib/auth/auth.middleware';
import { createExperiment } from '@/lib/ab-testing/ab-engine';

const createExperimentSchema = z.object({
  key: z
    .string()
    .min(2)
    .max(50)
    .regex(
      /^[a-z0-9_-]+$/,
      'Solo minúsculas, números, guiones y guiones bajos',
    ),
  name: z.string().min(2).max(200),
  description: z.string().max(500).optional(),
  variants: z
    .array(
      z.object({
        key: z.string().min(1).max(50),
        label: z.string().min(1).max(100),
        weight: z.number().int().min(1).max(100).default(50),
      }),
    )
    .min(2, 'Se requieren al menos 2 variantes')
    .max(5, 'Máximo 5 variantes'),
});

// GET /api/admin/ab-tests — Lista todos los experimentos
export async function GET() {
  try {
    await requireRole('ADMIN');

    const experiments = await prisma.aBExperiment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        variants: true,
        _count: { select: { assignments: true } },
      },
    });

    return NextResponse.json({ success: true, data: experiments });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/admin/ab-tests — Crea un nuevo experimento
export async function POST(request: NextRequest) {
  try {
    await requireRole('ADMIN');

    const body = await request.json();
    const parsed = createExperimentSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: firstIssue?.message ?? 'Datos inválidos',
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }

    const experimentId = await createExperiment(parsed.data);

    return NextResponse.json(
      { success: true, data: { id: experimentId } },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
