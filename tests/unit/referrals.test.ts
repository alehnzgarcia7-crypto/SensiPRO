import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  processReferral,
  getReferralStats,
} from '@/lib/payments/referrals';

// ══════════════════════════════════════════════════════════
// Mock Prisma
// ══════════════════════════════════════════════════════════

const mockUserFindUnique = vi.fn();
const mockUserFindMany = vi.fn();
const mockUserUpdate = vi.fn();
const mockNotificationCreate = vi.fn();
const mockTransaction = vi.fn();

vi.mock('@ares/database', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      findMany: (...args: unknown[]) => mockUserFindMany(...args),
      update: (...args: unknown[]) => mockUserUpdate(...args),
    },
    notification: {
      create: (...args: unknown[]) => mockNotificationCreate(...args),
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
// processReferral
// ══════════════════════════════════════════════════════════

describe('processReferral', () => {
  it('devuelve null si el código de referido no existe', async () => {
    mockUserFindUnique.mockResolvedValueOnce(null);

    const result = await processReferral('newUser1', 'INVALID_CODE');

    expect(result).toBeNull();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('devuelve null si el referente es el mismo usuario', async () => {
    mockUserFindUnique.mockResolvedValueOnce({
      id: 'sameUser',
      tier: 'FREE',
      tierExpiresAt: null,
    });

    const result = await processReferral('sameUser', 'REF123');

    expect(result).toBeNull();
  });

  it('devuelve null si el nuevo usuario no existe', async () => {
    // Primer findUnique: referrer encontrado
    mockUserFindUnique.mockResolvedValueOnce({
      id: 'referrer1',
      tier: 'PREMIUM',
      tierExpiresAt: new Date(Date.now() + 86400000 * 10),
    });
    // Segundo findUnique: nuevo usuario no encontrado
    mockUserFindUnique.mockResolvedValueOnce(null);

    const result = await processReferral('nonexistent', 'REF123');

    expect(result).toBeNull();
  });

  it('da 7 días Premium al nuevo usuario FREE y al referente FREE', async () => {
    // Referrer encontrado (FREE)
    mockUserFindUnique.mockResolvedValueOnce({
      id: 'referrer1',
      tier: 'FREE',
      tierExpiresAt: null,
    });
    // Nuevo usuario (FREE)
    mockUserFindUnique.mockResolvedValueOnce({
      id: 'newUser1',
      tier: 'FREE',
      tierExpiresAt: null,
    });
    mockTransaction.mockResolvedValueOnce([{}, {}, {}, {}]);

    const result = await processReferral('newUser1', 'REF_CODE');

    expect(result).not.toBeNull();
    expect(result?.referrerId).toBe('referrer1');
    expect(result?.bonusDays).toBe(7);
    expect(mockTransaction).toHaveBeenCalledTimes(1);

    // Verificar que la transacción recibe 4 operaciones (2 updates + 2 notifications)
    const transactionArgs = mockTransaction.mock.calls[0][0] as unknown[];
    expect(transactionArgs).toHaveLength(4);
  });

  it('extiende la expiración del referente que ya tiene tier activo', async () => {
    const futureExpiry = new Date(Date.now() + 86400000 * 15);

    // Referrer con PREMIUM activo
    mockUserFindUnique.mockResolvedValueOnce({
      id: 'referrer1',
      tier: 'PREMIUM',
      tierExpiresAt: futureExpiry,
    });
    // Nuevo usuario FREE
    mockUserFindUnique.mockResolvedValueOnce({
      id: 'newUser1',
      tier: 'FREE',
      tierExpiresAt: null,
    });
    mockTransaction.mockResolvedValueOnce([{}, {}, {}, {}]);

    const result = await processReferral('newUser1', 'REF_CODE');

    expect(result).not.toBeNull();
    expect(result?.bonusDays).toBe(7);
  });

  it('no degrada VIP del referente a PREMIUM', async () => {
    // Referrer con VIP activo
    mockUserFindUnique.mockResolvedValueOnce({
      id: 'referrer1',
      tier: 'VIP',
      tierExpiresAt: new Date(Date.now() + 86400000 * 20),
    });
    // Nuevo usuario FREE
    mockUserFindUnique.mockResolvedValueOnce({
      id: 'newUser1',
      tier: 'FREE',
      tierExpiresAt: null,
    });
    mockTransaction.mockResolvedValueOnce([{}, {}, {}, {}]);

    const result = await processReferral('newUser1', 'REF_CODE');

    expect(result).not.toBeNull();
    // El referente VIP mantiene su tier VIP (no se degrada a PREMIUM)
    expect(result?.bonusDays).toBe(7);
  });

  it('no degrada VIP del nuevo usuario a PREMIUM', async () => {
    // Referrer FREE
    mockUserFindUnique.mockResolvedValueOnce({
      id: 'referrer1',
      tier: 'FREE',
      tierExpiresAt: null,
    });
    // Nuevo usuario ya tiene VIP
    mockUserFindUnique.mockResolvedValueOnce({
      id: 'newUser1',
      tier: 'VIP',
      tierExpiresAt: new Date(Date.now() + 86400000 * 30),
    });
    mockTransaction.mockResolvedValueOnce([{}, {}, {}, {}]);

    const result = await processReferral('newUser1', 'REF_CODE');

    expect(result).not.toBeNull();
  });
});

// ══════════════════════════════════════════════════════════
// getReferralStats
// ══════════════════════════════════════════════════════════

describe('getReferralStats', () => {
  it('devuelve null si el usuario no existe', async () => {
    mockUserFindUnique.mockResolvedValueOnce(null);

    const result = await getReferralStats('nonexistent');

    expect(result).toBeNull();
  });

  it('devuelve stats correctas para usuario sin referidos', async () => {
    mockUserFindUnique.mockResolvedValueOnce({
      referralCode: 'ABC123',
      referralCount: 0,
    });
    mockUserFindMany.mockResolvedValueOnce([]);

    const result = await getReferralStats('user1');

    expect(result).not.toBeNull();
    expect(result?.referralCode).toBe('ABC123');
    expect(result?.totalReferrals).toBe(0);
    expect(result?.referredUsers).toHaveLength(0);
    expect(result?.bonusDaysPerReferral).toBe(7);
    expect(result?.totalBonusDaysEarned).toBe(0);
  });

  it('devuelve stats correctas con referidos', async () => {
    mockUserFindUnique.mockResolvedValueOnce({
      referralCode: 'XYZ789',
      referralCount: 3,
    });
    mockUserFindMany.mockResolvedValueOnce([
      { id: 'ref1', username: 'player1', createdAt: new Date('2026-02-20') },
      { id: 'ref2', username: 'player2', createdAt: new Date('2026-02-18') },
      { id: 'ref3', username: 'player3', createdAt: new Date('2026-02-15') },
    ]);

    const result = await getReferralStats('user1');

    expect(result?.totalReferrals).toBe(3);
    expect(result?.referredUsers).toHaveLength(3);
    expect(result?.totalBonusDaysEarned).toBe(21); // 3 * 7
    expect(result?.bonusDaysPerReferral).toBe(7);
  });

  it('calcula totalBonusDaysEarned correctamente', async () => {
    mockUserFindUnique.mockResolvedValueOnce({
      referralCode: 'TOP100',
      referralCount: 10,
    });
    mockUserFindMany.mockResolvedValueOnce([]);

    const result = await getReferralStats('user1');

    expect(result?.totalBonusDaysEarned).toBe(70); // 10 * 7
  });

  it('busca referidos por referralCode del usuario', async () => {
    mockUserFindUnique.mockResolvedValueOnce({
      referralCode: 'MY_CODE',
      referralCount: 2,
    });
    mockUserFindMany.mockResolvedValueOnce([]);

    await getReferralStats('user1');

    // Verifica que findMany busca por referredBy con el código del usuario
    const findManyArgs = mockUserFindMany.mock.calls[0][0] as { where: { referredBy: string } };
    expect(findManyArgs.where.referredBy).toBe('MY_CODE');
  });

  it('limita referidos a 20 resultados', async () => {
    mockUserFindUnique.mockResolvedValueOnce({
      referralCode: 'POPULAR',
      referralCount: 50,
    });
    mockUserFindMany.mockResolvedValueOnce([]);

    await getReferralStats('user1');

    const findManyArgs = mockUserFindMany.mock.calls[0][0] as { take: number };
    expect(findManyArgs.take).toBe(20);
  });
});
