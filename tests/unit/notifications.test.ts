import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de Prisma
const mockCreate = vi.fn();
vi.mock('@ares/database', () => ({
  prisma: {
    notification: {
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

import {
  sendNotification,
  sendAchievementNotification,
  sendSubscriptionNotification,
  sendExpirationWarning,
  sendTournamentNotification,
  sendReferralNotification,
  sendSystemNotification,
} from '@/lib/notifications/send-notification';

describe('sendNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({ id: 'notif-1' });
  });

  it('crea notificación con todos los campos', async () => {
    await sendNotification({
      userId: 'user-1',
      type: 'SYSTEM',
      title: 'Test',
      message: 'Mensaje de prueba',
      link: '/test',
    });

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        type: 'SYSTEM',
        title: 'Test',
        message: 'Mensaje de prueba',
        link: '/test',
      },
    });
  });

  it('usa link null cuando no se proporciona', async () => {
    await sendNotification({
      userId: 'user-1',
      type: 'SYSTEM',
      title: 'Sin link',
      message: 'Sin link',
    });

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ link: null }),
    });
  });
});

describe('sendAchievementNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({ id: 'notif-2' });
  });

  it('envía notificación de logro con icono y nombre', async () => {
    await sendAchievementNotification('user-1', 'Primera Búsqueda', '🔍');

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        type: 'ACHIEVEMENT',
        title: '🔍 ¡Nuevo logro!',
        message: 'Desbloqueaste "Primera Búsqueda"',
        link: '/achievements',
      },
    });
  });
});

describe('sendSubscriptionNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({ id: 'notif-3' });
  });

  it('notifica upgrade a PREMIUM', async () => {
    await sendSubscriptionNotification('user-1', 'PREMIUM');

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'SUBSCRIPTION',
        message: 'Tu cuenta ahora es PREMIUM. Disfruta todas las funciones.',
        link: '/profile/subscription',
      }),
    });
  });

  it('notifica upgrade a VIP', async () => {
    await sendSubscriptionNotification('user-1', 'VIP');

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        message: 'Tu cuenta ahora es VIP. Disfruta todas las funciones.',
      }),
    });
  });
});

describe('sendExpirationWarning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({ id: 'notif-4' });
  });

  it('muestra días restantes en el mensaje', async () => {
    await sendExpirationWarning('user-1', 3);

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'SUBSCRIPTION',
        message: 'Te quedan 3 días. Renueva para no perder acceso.',
        link: '/pricing',
      }),
    });
  });

  it('funciona con 1 día restante', async () => {
    await sendExpirationWarning('user-1', 1);

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        message: 'Te quedan 1 días. Renueva para no perder acceso.',
      }),
    });
  });
});

describe('sendTournamentNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({ id: 'notif-5' });
  });

  it('notifica torneo iniciado', async () => {
    await sendTournamentNotification('user-1', 'Copa ARES', 'started');

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'TOURNAMENT',
        message: 'El torneo "Copa ARES" ha comenzado. ¡Participa ahora!',
        link: '/tournaments',
      }),
    });
  });

  it('notifica torneo finalizado', async () => {
    await sendTournamentNotification('user-1', 'Copa ARES', 'ended');

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        message: 'El torneo "Copa ARES" ha finalizado. Revisa los resultados.',
      }),
    });
  });

  it('notifica inscripción a torneo', async () => {
    await sendTournamentNotification('user-1', 'Copa ARES', 'joined');

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        message: 'Te inscribiste al torneo "Copa ARES". ¡Buena suerte!',
      }),
    });
  });
});

describe('sendReferralNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({ id: 'notif-6' });
  });

  it('notifica referido exitoso con username', async () => {
    await sendReferralNotification('user-1', 'ProGamer99');

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        type: 'REFERRAL',
        title: '🎁 ¡Referido exitoso!',
        message: 'ProGamer99 se registró con tu código. ¡Gracias por compartir!',
        link: '/profile',
      },
    });
  });
});

describe('sendSystemNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({ id: 'notif-7' });
  });

  it('envía notificación de sistema sin link', async () => {
    await sendSystemNotification('user-1', 'Mantenimiento', 'El sistema estará en mantenimiento.');

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        type: 'SYSTEM',
        title: 'Mantenimiento',
        message: 'El sistema estará en mantenimiento.',
        link: null,
      },
    });
  });
});
