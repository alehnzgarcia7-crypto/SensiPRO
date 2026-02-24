import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';

import { requireRole } from '@/lib/auth/auth.middleware';

// ══════════════════════════════════════════════════════════
// GET /api/admin/guides — Listar guias con filtros
// POST /api/admin/guides — Crear guia con secciones
// ══════════════════════════════════════════════════════════

const ListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z
    .enum(['SENSITIVITY', 'MOVEMENT', 'AIM', 'STRATEGY', 'DEVICE', 'META'])
    .optional(),
  published: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

const CreateGuideSchema = z.object({
  title: z.string().min(5, 'Minimo 5 caracteres').max(200),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Solo letras minusculas, numeros y guiones'),
  description: z.string().min(10, 'Minimo 10 caracteres').max(500),
  category: z.enum([
    'SENSITIVITY',
    'MOVEMENT',
    'AIM',
    'STRATEGY',
    'DEVICE',
    'META',
  ]),
  content: z.string().min(10, 'Minimo 10 caracteres'),
  readTimeMin: z.number().int().min(1).max(60).default(5),
  isPremium: z.boolean().default(false),
  sections: z
    .array(
      z.object({
        title: z.string().min(3),
        content: z.string().min(10),
        orderIndex: z.number().int().min(0),
        isPremium: z.boolean().default(false),
      }),
    )
    .optional()
    .default([]),
});

export async function GET(request: NextRequest) {
  try {
    await requireRole('ADMIN');

    const { searchParams } = new URL(request.url);
    const parsed = ListSchema.safeParse({
      page: searchParams.get('page') ?? 1,
      limit: searchParams.get('limit') ?? 20,
      search: searchParams.get('search') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      published: searchParams.get('published') ?? undefined,
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

    const { page, limit, search, category, published } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where['OR'] = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) where['category'] = category;
    if (published !== undefined) where['isPublished'] = published;

    const [guides, total] = await Promise.all([
      prisma.guide.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          isPremium: true,
          isPublished: true,
          viewCount: true,
          readTimeMin: true,
          updatedAt: true,
          _count: { select: { sections: true, comments: true } },
        },
      }),
      prisma.guide.count({ where }),
    ]);

    logger.info('Admin listed guides', { page, limit, search, category, total });

    return NextResponse.json({
      success: true,
      data: guides,
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
    const parsed = CreateGuideSchema.safeParse(body);

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

    const { sections, ...guideData } = parsed.data;

    const guide = await prisma.guide.create({
      data: {
        ...guideData,
        isPublished: false,
        authorId: session.user.id,
        sections: {
          create: sections.map((s) => ({
            title: s.title,
            content: s.content,
            orderIndex: s.orderIndex,
            isPremium: s.isPremium,
          })),
        },
      },
      include: {
        sections: { orderBy: { orderIndex: 'asc' } },
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: 'CREATE_GUIDE',
        target: guide.id,
        details: { title: guide.title, slug: guide.slug },
      },
    });

    logger.info('Admin created guide', {
      adminId: session.user.id,
      guideId: guide.id,
      title: guide.title,
    });

    return NextResponse.json({ success: true, data: guide }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
