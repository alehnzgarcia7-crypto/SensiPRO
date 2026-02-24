import { NextResponse } from 'next/server';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';

import { requireRole } from '@/lib/auth/auth.middleware';

// ══════════════════════════════════════════════════════════
// GET /api/admin/users/export — Exportar todos los usuarios como CSV
// ══════════════════════════════════════════════════════════

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  try {
    const session = await requireRole('ADMIN');

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        tier: true,
        role: true,
        isActive: true,
        totalSearches: true,
        totalFavorites: true,
        totalShares: true,
        referralCount: true,
        createdAt: true,
        tierExpiresAt: true,
        lastLoginAt: true,
      },
    });

    const header = 'id,username,email,tier,role,active,searches,favorites,shares,referrals,created,tier_expires,last_login';
    const rows = users.map((u) =>
      [
        u.id,
        escapeCsvField(u.username),
        escapeCsvField(u.email),
        u.tier,
        u.role,
        u.isActive ? 'true' : 'false',
        String(u.totalSearches),
        String(u.totalFavorites),
        String(u.totalShares),
        String(u.referralCount),
        u.createdAt.toISOString(),
        u.tierExpiresAt?.toISOString() ?? '',
        u.lastLoginAt?.toISOString() ?? '',
      ].join(','),
    );
    const csv = [header, ...rows].join('\n');

    logger.info('Admin exported users CSV', {
      adminId: session.user.id,
      totalExported: users.length,
    });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="ares-users-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
