import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  expireSubscriptions,
  getSubscriptionStatus,
  cancelSubscription,
  renewSubscription,
  getExpiringSubscriptions,
  getCodeTypeLabel,
} from '@/lib/payments/subscription';

// ══════════════════════════════════════════════════════════
// Mock Prisma
// ══════════════════════════════════════════════════════════

const mockUserFindMany = vi.fn();
const mockUserFindUnique = vi.fn();
const mockUserUpdateMany = vi.fn();
const mockSubscriptionUpdateMany = vi.fn();
const mockSubscriptionFindFirst = vi.fn();
const mockSubscriptionUpdate = vi.fn();
const mockNotificationCreateMany = vi.fn();
const mockTransaction = vi.fn();

vi.mock('@ares/database', () => ({
  prisma: {
    user: {
      findMany: (...args: unknown[]) => mockUserFindMany(...args),
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      updateMany: (...args: unknown[]) => mockUserUpdateMany(...args),
      update: vi.fn(),
    },
    subscription: {
      updateMany: (...args: unknown[]) => mockSubscriptionUpdateMany(...args),
      findFirst: (...args: unknown[]) => mockSubscriptionFindFirst(...args),
      update: (...args: unknown[]) => mockSubscriptionUpdate(...args),
      create: vi.fn(),
    },
    notification: {
      createMany: (...args: unknown[]) => mockNotificationCreateMany(...args),
    },
    $transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

vi.mock('@ares/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ══════════════════════════════════════════════════════════
// getCodeTypeLabel
// ══════════════════════════════════════════════════════════

describe('getCodeTypeLabel', () => {
  it('devuelve label correcto para PREMIUM_30', () => {
    expect(getCodeTypeLabel('PREMIUM_30')).toBe('Premium 1 mes');
  });

  it('devuelve label correcto para VIP_365', () => {
    expect(getCodeTypeLabel('VIP_365')).toBe('VIP 12 meses');
  });

  it('devuelve "Pago directo" para null', () => {
    expect(getCodeTypeLabel(null)).toBe('Pago directo');
  });

  it('devuelve label correcto para PREMIUM_90', () => {
    expect(getCodeTypeLabel('PREMIUM_90')).toBe('Premium 3 meses');
  });

  it('devuelve label correcto para VIP_30', () => {
    expect(getCodeTypeLabel('VIP_30')).toBe('VIP 1 mes');
  });
});

// ══════════════════════════════════════════════════════════
// expireSubscriptions
// ══════════════════════════════════════════════════════════

describe('expireSubscriptions', () => {
  it('no hace nada si no hay suscripciones expiradas', async () => {
    mockUserFindMany.mockResolvedValueOnce([]);

    const result = await expireSubscriptions();

    expect(result.expired).toBe(0);
    expect(result.users).toHaveLength(0);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('expira suscripciones vencidas y baja usuarios a FREE', async () => {
    const expiredUsers = [
      { id: 'user1', username: 'player1', tier: 'PREMIUM', tierExpiresAt: new Date('2026-01-01') },
      { id: 'user2', username: 'player2', tier: 'VIP', tierExpiresAt: new Date('2026-01-15') },
    ];

    mockUserFindMany.mockResolvedValueOnce(expiredUsers);
    mockTransaction.mockResolvedValueOnce([{ count: 2 }, { count: 2 }]);
    mockNotificationCreateMany.mockResolvedValueOnce({ count: 2 });

    const result = await expireSubscriptions();

    expect(result.expired).toBe(2);
    expect(result.users).toHaveLength(2);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockNotificationCreateMany).toHaveBeenCalledTimes(1);
  });

  it('crea notificaciones para cada usuario expirado', async () => {
    const expiredUsers = [
      { id: 'user1', username: 'player1', tier: 'PREMIUM', tierExpiresAt: new Date('2026-01-01') },
    ];

    mockUserFindMany.mockResolvedValueOnce(expiredUsers);
    mockTransaction.mockResolvedValueOnce([{ count: 1 }, { count: 1 }]);
    mockNotificationCreateMany.mockResolvedValueOnce({ count: 1 });

    await expireSubscriptions();

    const createCall = mockNotificationCreateMany.mock.calls[0][0] as { data: Array<{ userId: string; type: string }> };
    expect(createCall.data).toHaveLength(1);
    const firstNotif = createCall.data[0];
    expect(firstNotif).toBeDefined();
    expect(firstNotif!.userId).toBe('user1');
    expect(firstNotif!.type).toBe('subscription');
  });
});

// ══════════════════════════════════════════════════════════
// getSubscriptionStatus
// ══════════════════════════════════════════════════════════

describe('getSubscriptionStatus', () => {
  it('devuelve null si el usuario no existe', async () => {
    mockUserFindUnique.mockResolvedValueOnce(null);

    const result = await getSubscriptionStatus('nonexistent');

    expect(result).toBeNull();
  });

  it('devuelve estado correcto para usuario FREE', async () => {
    mockUserFindUnique.mockResolvedValueOnce({
      tier: 'FREE',
      tierExpiresAt: null,
      payments: [],
      subscriptions: [],
    });

    const result = await getSubscriptionStatus('user1');

    expect(result).not.toBeNull();
    expect(result?.tier).toBe('FREE');
    expect(result?.daysRemaining).toBeNull();
    expect(result?.isExpiringSoon).toBe(false);
    expect(result?.isExpired).toBe(false);
    expect(result?.activeSubscription).toBeNull();
  });

  it('calcula días restantes correctamente para PREMIUM', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15);

    mockUserFindUnique.mockResolvedValueOnce({
      tier: 'PREMIUM',
      tierExpiresAt: futureDate,
      payments: [],
      subscriptions: [],
    });

    const result = await getSubscriptionStatus('user1');

    expect(result?.tier).toBe('PREMIUM');
    expect(result?.daysRemaining).toBe(15);
    expect(result?.isExpiringSoon).toBe(false);
  });

  it('marca isExpiringSoon cuando quedan <= 7 días', async () => {
    const soonDate = new Date();
    soonDate.setDate(soonDate.getDate() + 3);

    mockUserFindUnique.mockResolvedValueOnce({
      tier: 'PREMIUM',
      tierExpiresAt: soonDate,
      payments: [],
      subscriptions: [],
    });

    const result = await getSubscriptionStatus('user1');

    expect(result?.isExpiringSoon).toBe(true);
    expect(result?.daysRemaining).toBeLessThanOrEqual(7);
  });

  it('incluye pagos recientes en el resultado', async () => {
    const payments = [
      { id: 'pay1', provider: 'MERCADOPAGO', amount: 4900, status: 'COMPLETED', codeType: null, createdAt: new Date() },
      { id: 'pay2', provider: 'CODE', amount: 0, status: 'COMPLETED', codeType: 'PREMIUM_30', createdAt: new Date() },
    ];

    mockUserFindUnique.mockResolvedValueOnce({
      tier: 'PREMIUM',
      tierExpiresAt: new Date(Date.now() + 86400000 * 20),
      payments,
      subscriptions: [],
    });

    const result = await getSubscriptionStatus('user1');

    expect(result?.recentPayments).toHaveLength(2);
    const firstPayment = result?.recentPayments[0];
    expect(firstPayment).toBeDefined();
    expect(firstPayment!.provider).toBe('MERCADOPAGO');
  });

  it('incluye suscripción activa', async () => {
    const sub = {
      id: 'sub1',
      tier: 'VIP',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-03-01'),
    };

    mockUserFindUnique.mockResolvedValueOnce({
      tier: 'VIP',
      tierExpiresAt: new Date('2026-03-01'),
      payments: [],
      subscriptions: [sub],
    });

    const result = await getSubscriptionStatus('user1');

    expect(result?.activeSubscription).not.toBeNull();
    expect(result?.activeSubscription?.tier).toBe('VIP');
  });
});

// ══════════════════════════════════════════════════════════
// cancelSubscription
// ══════════════════════════════════════════════════════════

describe('cancelSubscription', () => {
  it('devuelve success: false si no hay suscripción activa', async () => {
    mockSubscriptionFindFirst.mockResolvedValueOnce(null);

    const result = await cancelSubscription('user1');

    expect(result.success).toBe(false);
    expect(result.expiresAt).toBeNull();
  });

  it('desactiva suscripción y devuelve fecha de expiración', async () => {
    const endDate = new Date('2026-03-15');
    mockSubscriptionFindFirst.mockResolvedValueOnce({
      id: 'sub1',
      userId: 'user1',
      isActive: true,
      endDate,
    });
    mockSubscriptionUpdate.mockResolvedValueOnce({ id: 'sub1', isActive: false });

    const result = await cancelSubscription('user1');

    expect(result.success).toBe(true);
    expect(result.expiresAt).toEqual(endDate);
    expect(mockSubscriptionUpdate).toHaveBeenCalledWith({
      where: { id: 'sub1' },
      data: { isActive: false },
    });
  });
});

// ══════════════════════════════════════════════════════════
// renewSubscription
// ══════════════════════════════════════════════════════════

describe('renewSubscription', () => {
  it('lanza error si el usuario no existe', async () => {
    mockUserFindUnique.mockResolvedValueOnce(null);

    await expect(renewSubscription('nonexistent', 'PREMIUM', 30)).rejects.toThrow('USER_NOT_FOUND');
  });

  it('crea nueva suscripción desde ahora para usuario FREE', async () => {
    mockUserFindUnique.mockResolvedValueOnce({
      tier: 'FREE',
      tierExpiresAt: null,
    });

    const mockSub = { id: 'sub1' };
    mockTransaction.mockResolvedValueOnce([{}, mockSub]);

    const result = await renewSubscription('user1', 'PREMIUM', 30);

    expect(result.subscriptionId).toBe('sub1');
    expect(result.expiresAt).toBeInstanceOf(Date);

    // La expiración debe ser ~30 días desde ahora
    const diffDays = Math.round((result.expiresAt.getTime() - Date.now()) / 86400000);
    expect(diffDays).toBeGreaterThanOrEqual(29);
    expect(diffDays).toBeLessThanOrEqual(31);
  });

  it('extiende desde fecha actual de expiración si aún está activa', async () => {
    const futureExpiry = new Date();
    futureExpiry.setDate(futureExpiry.getDate() + 10);

    mockUserFindUnique.mockResolvedValueOnce({
      tier: 'PREMIUM',
      tierExpiresAt: futureExpiry,
    });

    const mockSub = { id: 'sub2' };
    mockTransaction.mockResolvedValueOnce([{}, mockSub]);

    const result = await renewSubscription('user1', 'PREMIUM', 30);

    // Debe expirar ~40 días desde ahora (10 restantes + 30 nuevos)
    const diffDays = Math.round((result.expiresAt.getTime() - Date.now()) / 86400000);
    expect(diffDays).toBeGreaterThanOrEqual(39);
    expect(diffDays).toBeLessThanOrEqual(41);
  });
});

// ══════════════════════════════════════════════════════════
// getExpiringSubscriptions
// ══════════════════════════════════════════════════════════

describe('getExpiringSubscriptions', () => {
  it('busca usuarios con suscripción que expira en N días', async () => {
    mockUserFindMany.mockResolvedValueOnce([
      { id: 'user1', username: 'player1', email: 'p1@test.com', tier: 'PREMIUM', tierExpiresAt: new Date() },
    ]);

    const result = await getExpiringSubscriptions(3);

    expect(result).toHaveLength(1);
    expect(mockUserFindMany).toHaveBeenCalledTimes(1);
  });

  it('usa valor por defecto de 3 días', async () => {
    mockUserFindMany.mockResolvedValueOnce([]);

    await getExpiringSubscriptions();

    expect(mockUserFindMany).toHaveBeenCalledTimes(1);
    const callArgs = mockUserFindMany.mock.calls[0][0] as { where: { tierExpiresAt: { lte: Date } } };
    const cutoff = callArgs.where.tierExpiresAt.lte;
    const diffDays = Math.round((cutoff.getTime() - Date.now()) / 86400000);
    expect(diffDays).toBeLessThanOrEqual(4);
    expect(diffDays).toBeGreaterThanOrEqual(2);
  });
});
