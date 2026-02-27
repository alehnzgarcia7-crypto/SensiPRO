import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';


import { getOptionalSession } from '@/lib/auth/auth.middleware';

const createTicketSchema = z.object({
  subject: z.string().min(5, 'Mínimo 5 caracteres').max(200, 'Máximo 200 caracteres'),
  message: z.string().min(10, 'Mínimo 10 caracteres').max(2000, 'Máximo 2000 caracteres'),
  email: z.string().email('Email inválido'),
  category: z.enum(['BUG', 'PAYMENT', 'ACCOUNT', 'FEATURE', 'OTHER']).optional().default('OTHER'),
});

// POST /api/support — Crear ticket de soporte (público)
export async function POST(request: NextRequest) {
  try {
    const session = await getOptionalSession();
    const userId = session?.id ?? null;

    const body: unknown = await request.json();
    const parsed = createTicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Datos inválidos', statusCode: 400 } },
        { status: 400 },
      );
    }

    const { subject, message, email, category } = parsed.data;

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        email,
        subject,
        message,
        category,
        status: 'OPEN',
      },
    });

    logger.info('Support ticket created', {
      ticketId: ticket.id,
      category,
      userId: userId ?? 'anonymous',
    });

    return NextResponse.json(
      { success: true, data: { ticketId: ticket.id } },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
