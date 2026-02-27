import { prisma } from '@ares/database';
import { handleApiError, NotFoundError } from '@ares/errors';
import { logger } from '@ares/logger';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';


import { requireRole } from '@/lib/auth/auth.middleware';

const updateSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  adminResponse: z.string().min(1, 'Respuesta no puede estar vacía').max(2000, 'Máximo 2000 caracteres').optional(),
});

// PATCH /api/admin/support/[id] — Actualizar ticket (admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRole('ADMIN');
    const { id } = await params;

    const ticket = await prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundError('Ticket', id);

    const body: unknown = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Datos inválidos', statusCode: 400 } },
        { status: 400 },
      );
    }

    const { status, adminResponse } = parsed.data;

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(adminResponse ? { adminResponse, respondedAt: new Date() } : {}),
      },
    });

    logger.info('Support ticket updated', {
      ticketId: id,
      adminId: session.user.id,
      status: status ?? 'unchanged',
      hasResponse: !!adminResponse,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
