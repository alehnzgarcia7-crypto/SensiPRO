import { prisma } from '@ares/database';
import { logger } from '@ares/logger';
import type { AnalyticsEventType } from '@prisma/client';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const ADMIN_EMAIL = 'alehnzgarcia7@gmail.com';

async function verifyAccess(req: NextRequest): Promise<string | null> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email || token.email !== ADMIN_EMAIL) {
    return null;
  }
  return token.email;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@***';
  const masked = local.charAt(0) + '***';
  return `${masked}@${domain}`;
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  metadata: Record<string, unknown> | null;
}

function formatEventToActivity(event: {
  id: string;
  eventType: AnalyticsEventType;
  metadata: unknown;
  path: string | null;
  createdAt: Date;
}): ActivityItem {
  const meta = (event.metadata as Record<string, unknown>) ?? {};

  const typeIcons: Record<string, string> = {
    SIGNUP: 'user-plus',
    LOGIN: 'log-in',
    SENSI_GENERATED: 'crosshair',
    PAYMENT_COMPLETED: 'dollar-sign',
    PAYMENT_STARTED: 'credit-card',
    PAYMENT_FAILED: 'alert-triangle',
    PAYWALL_SHOWN: 'lock',
    PAYWALL_CLICKED: 'unlock',
    PAGE_VIEW: 'eye',
    DEVICE_SEARCHED: 'search',
    HEADSHOT_MODE_USED: 'target',
    ACADEMY_VIEWED: 'book-open',
    PREMIUM_ACTIVATED: 'star',
  };

  const iconType = typeIcons[event.eventType] ?? 'activity';

  let message: string;

  switch (event.eventType) {
    case 'SIGNUP': {
      const email = typeof meta.email === 'string' ? maskEmail(meta.email) : 'usuario';
      message = `Nuevo usuario: ${email}`;
      break;
    }
    case 'LOGIN': {
      const email = typeof meta.email === 'string' ? maskEmail(meta.email) : 'usuario';
      message = `Inicio de sesion: ${email}`;
      break;
    }
    case 'SENSI_GENERATED': {
      const device = typeof meta.device === 'string' ? meta.device : 'dispositivo';
      message = `Sensibilidad generada: ${device}`;
      break;
    }
    case 'PAYMENT_COMPLETED': {
      const amount = typeof meta.amount === 'number' ? meta.amount : 199;
      const method = typeof meta.method === 'string' ? meta.method : '';
      message = `PAGO COMPLETADO: $${amount} MXN${method ? ` via ${method}` : ''}`;
      break;
    }
    case 'PAYMENT_STARTED': {
      const method = typeof meta.method === 'string' ? meta.method : '';
      message = `Pago iniciado${method ? ` via ${method}` : ''}`;
      break;
    }
    case 'PAYMENT_FAILED': {
      const reason = typeof meta.reason === 'string' ? meta.reason : 'error desconocido';
      message = `Pago fallido: ${reason}`;
      break;
    }
    case 'PAYWALL_SHOWN':
      message = 'Paywall mostrado';
      break;
    case 'PAYWALL_CLICKED':
      message = 'Paywall: click en comprar';
      break;
    case 'PAGE_VIEW': {
      const path = event.path || (typeof meta.path === 'string' ? meta.path : '/');
      message = `Visita: ${path}`;
      break;
    }
    case 'DEVICE_SEARCHED': {
      const device = typeof meta.device === 'string' ? meta.device : 'dispositivo';
      message = `Busqueda: ${device}`;
      break;
    }
    case 'HEADSHOT_MODE_USED':
      message = 'Modo headshot utilizado';
      break;
    case 'ACADEMY_VIEWED': {
      const guide = typeof meta.guide === 'string' ? meta.guide : 'guia';
      message = `Academia vista: ${guide}`;
      break;
    }
    case 'PREMIUM_ACTIVATED': {
      const email = typeof meta.email === 'string' ? maskEmail(meta.email) : 'usuario';
      message = `Premium activado: ${email}`;
      break;
    }
    default:
      message = `Evento: ${event.eventType}`;
  }

  return {
    id: event.id,
    type: iconType,
    message,
    timestamp: event.createdAt,
    metadata: meta,
  };
}

export async function GET(req: NextRequest) {
  const email = await verifyAccess(req);
  if (!email) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Acceso denegado' } }, { status: 401 });
  }

  try {
    const events = await prisma.analyticsEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        eventType: true,
        metadata: true,
        path: true,
        createdAt: true,
      },
    });

    const activity = events.map(formatEventToActivity);

    logger.info('Command center activity feed fetched', { email, count: activity.length });

    return NextResponse.json({
      success: true,
      data: activity,
    });
  } catch (err) {
    logger.error('Failed to fetch activity feed', {
      error: err instanceof Error ? err.message : 'Unknown',
    });
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al obtener actividad' } },
      { status: 500 },
    );
  }
}
