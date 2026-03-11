import { prisma } from '@ares/database';
import { logger } from '@ares/logger';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';

const ADMIN_EMAIL = 'alehnzgarcia7@gmail.com';

async function verifyAccess(req: NextRequest): Promise<string | null> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email || token.email !== ADMIN_EMAIL) {
    return null;
  }
  return token.email;
}

const ActionSchema = z.object({
  action: z.enum(['grant-premium', 'revoke-premium']),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const email = await verifyAccess(req);
  if (!email) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Acceso denegado' } }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        tier: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        totalSearches: true,
        totalFavorites: true,
        totalShares: true,
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Usuario no encontrado' } },
        { status: 404 },
      );
    }

    // Obtener licencia premium, historial de busquedas reciente y pagos
    const [premiumLicense, recentSearches, paymentAttempts] = await Promise.all([
      prisma.premiumLicense.findUnique({
        where: { email: user.email },
        select: {
          id: true,
          isActive: true,
          activatedAt: true,
          paymentProvider: true,
          paymentMethod: true,
          amountPaid: true,
          currency: true,
          createdAt: true,
        },
      }),

      prisma.searchHistory.findMany({
        where: { userId: id },
        orderBy: { searchedAt: 'desc' },
        take: 20,
        include: {
          device: {
            select: { brand: true, model: true },
          },
        },
      }),

      prisma.paymentAttempt.findMany({
        where: { email: user.email },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          provider: true,
          method: true,
          status: true,
          amount: true,
          currency: true,
          createdAt: true,
        },
      }),
    ]);

    logger.info('Command center user detail fetched', { adminEmail: email, userId: id });

    return NextResponse.json({
      success: true,
      data: {
        user,
        premiumLicense,
        recentSearches,
        paymentAttempts,
      },
    });
  } catch (err) {
    logger.error('Failed to fetch user detail', {
      error: err instanceof Error ? err.message : 'Unknown',
    });
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al obtener detalle del usuario' } },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  const email = await verifyAccess(req);
  if (!email) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Acceso denegado' } }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await req.json();
    const parsed = ActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'action debe ser grant-premium o revoke-premium' } },
        { status: 400 },
      );
    }

    const { action } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, username: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Usuario no encontrado' } },
        { status: 404 },
      );
    }

    if (action === 'grant-premium') {
      // Verificar si ya tiene licencia activa
      const existing = await prisma.premiumLicense.findUnique({
        where: { email: user.email },
      });

      if (existing?.isActive) {
        return NextResponse.json(
          { success: false, error: { code: 'ALREADY_PREMIUM', message: 'El usuario ya tiene licencia premium activa' } },
          { status: 409 },
        );
      }

      if (existing) {
        // Reactivar licencia existente
        await prisma.premiumLicense.update({
          where: { email: user.email },
          data: { isActive: true },
        });
      } else {
        // Crear nueva licencia admin-granted
        await prisma.premiumLicense.create({
          data: {
            email: user.email,
            isActive: true,
            paymentProvider: 'admin',
            paymentId: `admin-grant-${id}-${Date.now()}`,
            paymentMethod: 'admin-grant',
            amountPaid: 0,
            currency: 'MXN',
          },
        });
      }

      // Actualizar tier del usuario
      await prisma.user.update({
        where: { id },
        data: { tier: 'PREMIUM' },
      });

      logger.info('Premium granted via command center', { adminEmail: email, userId: id, userEmail: user.email });

      // Registrar en log del command center
      await prisma.commandCenterLog.create({
        data: {
          email,
          action: 'GRANT_PREMIUM',
          path: `/api/command-center/users/${id}`,
          ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
          userAgent: req.headers.get('user-agent') || null,
        },
      });

      return NextResponse.json({
        success: true,
        data: { message: `Premium otorgado a ${user.email}` },
      });
    }

    if (action === 'revoke-premium') {
      const license = await prisma.premiumLicense.findUnique({
        where: { email: user.email },
      });

      if (!license || !license.isActive) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_PREMIUM', message: 'El usuario no tiene licencia premium activa' } },
          { status: 409 },
        );
      }

      await prisma.premiumLicense.update({
        where: { email: user.email },
        data: { isActive: false },
      });

      await prisma.user.update({
        where: { id },
        data: { tier: 'FREE' },
      });

      logger.info('Premium revoked via command center', { adminEmail: email, userId: id, userEmail: user.email });

      await prisma.commandCenterLog.create({
        data: {
          email,
          action: 'REVOKE_PREMIUM',
          path: `/api/command-center/users/${id}`,
          ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
          userAgent: req.headers.get('user-agent') || null,
        },
      });

      return NextResponse.json({
        success: true,
        data: { message: `Premium revocado a ${user.email}` },
      });
    }

    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ACTION', message: 'Accion no reconocida' } },
      { status: 400 },
    );
  } catch (err) {
    logger.error('Failed to execute user action', {
      error: err instanceof Error ? err.message : 'Unknown',
    });
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al ejecutar accion' } },
      { status: 500 },
    );
  }
}
