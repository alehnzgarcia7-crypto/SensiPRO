import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  validateCode,
  redeemCode,
  generateActivationCode,
  bulkGenerateCodes,
  getCodeTypeInfo,
} from '@/lib/payments/activation-codes';

// ══════════════════════════════════════════════════════════
// Mock Prisma
// ══════════════════════════════════════════════════════════

const mockActivationCode = {
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
};

const mockUser = {
  update: vi.fn(),
};

const mockPayment = {
  create: vi.fn(),
};

const mockSubscription = {
  create: vi.fn(),
};

const mockTransaction = vi.fn();

vi.mock('@ares/database', () => ({
  prisma: {
    activationCode: {
      findUnique: (...args: unknown[]) => mockActivationCode.findUnique(...args),
      create: (...args: unknown[]) => mockActivationCode.create(...args),
      update: (...args: unknown[]) => mockActivationCode.update(...args),
    },
    user: {
      update: (...args: unknown[]) => mockUser.update(...args),
    },
    payment: {
      create: (...args: unknown[]) => mockPayment.create(...args),
    },
    subscription: {
      create: (...args: unknown[]) => mockSubscription.create(...args),
    },
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => mockTransaction(fn),
  },
}));

vi.mock('@ares/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// ══════════════════════════════════════════════════════════
// Tests
// ══════════════════════════════════════════════════════════

beforeEach(() => {
  vi.clearAllMocks();
});

// ──────────────────────────────────────────────────────────
// getCodeTypeInfo
// ──────────────────────────────────────────────────────────

describe('getCodeTypeInfo', () => {
  it('devuelve tier PREMIUM y 30 dias para PREMIUM_30', () => {
    const info = getCodeTypeInfo('PREMIUM_30');
    expect(info.tier).toBe('PREMIUM');
    expect(info.days).toBe(30);
  });

  it('devuelve tier VIP y 365 dias para VIP_365', () => {
    const info = getCodeTypeInfo('VIP_365');
    expect(info.tier).toBe('VIP');
    expect(info.days).toBe(365);
  });

  it('devuelve label descriptivo para PREMIUM_90', () => {
    const info = getCodeTypeInfo('PREMIUM_90');
    expect(info.label).toContain('PREMIUM');
    expect(info.label).toContain('90');
  });

  it('mapea todos los CodeTypes correctamente', () => {
    const types = [
      'PREMIUM_30',
      'PREMIUM_90',
      'PREMIUM_365',
      'VIP_30',
      'VIP_90',
      'VIP_365',
    ] as const;

    for (const type of types) {
      const info = getCodeTypeInfo(type);
      expect(info.tier).toMatch(/^(PREMIUM|VIP)$/);
      expect(info.days).toBeGreaterThan(0);
      expect(info.label).toBeTruthy();
    }
  });
});

// ──────────────────────────────────────────────────────────
// validateCode
// ──────────────────────────────────────────────────────────

describe('validateCode', () => {
  it('lanza NotFoundError si el codigo no existe', async () => {
    mockActivationCode.findUnique.mockResolvedValue(null);

    await expect(validateCode('ARES-XXXX-XXXX-XXXX')).rejects.toThrow(
      /not found/i,
    );
  });

  it('lanza BusinessError si el codigo ya fue usado', async () => {
    mockActivationCode.findUnique.mockResolvedValue({
      id: 'code-1',
      code: 'ARES-ABCD-EFGH-JKLM',
      type: 'PREMIUM_30',
      status: 'USED',
      usedAt: new Date(),
      expiresAt: null,
    });

    await expect(validateCode('ARES-ABCD-EFGH-JKLM')).rejects.toThrow(
      /ya fue utilizado/i,
    );
  });

  it('lanza BusinessError si el codigo esta expirado por status', async () => {
    mockActivationCode.findUnique.mockResolvedValue({
      id: 'code-2',
      code: 'ARES-ABCD-EFGH-JKLM',
      type: 'PREMIUM_30',
      status: 'EXPIRED',
      expiresAt: null,
    });

    await expect(validateCode('ARES-ABCD-EFGH-JKLM')).rejects.toThrow(
      /expirado/i,
    );
  });

  it('lanza BusinessError si el codigo tiene fecha de expiracion pasada', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    mockActivationCode.findUnique.mockResolvedValue({
      id: 'code-3',
      code: 'ARES-ABCD-EFGH-JKLM',
      type: 'VIP_30',
      status: 'AVAILABLE',
      expiresAt: pastDate,
    });

    mockActivationCode.update.mockResolvedValue({});

    await expect(validateCode('ARES-ABCD-EFGH-JKLM')).rejects.toThrow(
      /expirado/i,
    );
  });

  it('retorna validacion correcta para un codigo PREMIUM_30 valido', async () => {
    mockActivationCode.findUnique.mockResolvedValue({
      id: 'code-4',
      code: 'ARES-ABCD-EFGH-JKLM',
      type: 'PREMIUM_30',
      status: 'AVAILABLE',
      expiresAt: null,
    });

    const result = await validateCode('ARES-ABCD-EFGH-JKLM');

    expect(result.valid).toBe(true);
    expect(result.tier).toBe('PREMIUM');
    expect(result.days).toBe(30);
    expect(result.codeType).toBe('PREMIUM_30');
  });

  it('retorna validacion correcta para VIP_365', async () => {
    mockActivationCode.findUnique.mockResolvedValue({
      id: 'code-5',
      code: 'ARES-VVVV-IIII-PPPP',
      type: 'VIP_365',
      status: 'AVAILABLE',
      expiresAt: null,
    });

    const result = await validateCode('ares-vvvv-iiii-pppp'); // lowercase

    expect(result.valid).toBe(true);
    expect(result.tier).toBe('VIP');
    expect(result.days).toBe(365);
  });

  it('normaliza el codigo a mayusculas y trim', async () => {
    mockActivationCode.findUnique.mockResolvedValue({
      id: 'code-6',
      code: 'ARES-TEST-CODE-HERE',
      type: 'PREMIUM_90',
      status: 'AVAILABLE',
      expiresAt: null,
    });

    await validateCode('  ares-test-code-here  ');

    expect(mockActivationCode.findUnique).toHaveBeenCalledWith({
      where: { code: 'ARES-TEST-CODE-HERE' },
    });
  });
});

// ──────────────────────────────────────────────────────────
// generateActivationCode
// ──────────────────────────────────────────────────────────

describe('generateActivationCode', () => {
  it('genera un codigo con formato ARES-XXXX-XXXX-XXXX', async () => {
    mockActivationCode.findUnique.mockResolvedValue(null);
    mockActivationCode.create.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) => ({
        id: 'generated-id',
        code: data['code'],
        type: data['type'],
        status: 'AVAILABLE',
        expiresAt: null,
        createdAt: new Date(),
      }),
    );

    const result = await generateActivationCode(
      'PREMIUM_30',
      'admin-user-id',
    );

    expect(result.code).toMatch(/^ARES-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    expect(result.type).toBe('PREMIUM_30');
    expect(result.status).toBe('AVAILABLE');
  });

  it('no usa caracteres confusos (I, O, 0, 1)', async () => {
    mockActivationCode.findUnique.mockResolvedValue(null);
    mockActivationCode.create.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) => ({
        id: 'id',
        code: data['code'],
        type: data['type'],
        status: 'AVAILABLE',
        expiresAt: null,
        createdAt: new Date(),
      }),
    );

    // Generar multiples codigos y verificar que no contienen chars prohibidos
    for (let i = 0; i < 10; i++) {
      const result = await generateActivationCode('VIP_30', 'admin-id');
      const body = result.code.replace(/^ARES-/, '').replace(/-/g, '');
      expect(body).not.toMatch(/[IO01]/);
    }
  });

  it('reintenta si el codigo ya existe', async () => {
    // Primera llamada: codigo duplicado
    mockActivationCode.findUnique
      .mockResolvedValueOnce({ id: 'existing' })
      .mockResolvedValueOnce(null);

    mockActivationCode.create.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) => ({
        id: 'new-id',
        code: data['code'],
        type: data['type'],
        status: 'AVAILABLE',
        expiresAt: null,
        createdAt: new Date(),
      }),
    );

    const result = await generateActivationCode('PREMIUM_30', 'admin-id');

    expect(result.code).toMatch(/^ARES-/);
    expect(mockActivationCode.findUnique).toHaveBeenCalledTimes(2);
  });

  it('lanza error si no puede generar un codigo unico despues de 10 intentos', async () => {
    mockActivationCode.findUnique.mockResolvedValue({ id: 'always-exists' });

    await expect(
      generateActivationCode('PREMIUM_30', 'admin-id'),
    ).rejects.toThrow(/codigo unico/i);
  });
});

// ──────────────────────────────────────────────────────────
// bulkGenerateCodes
// ──────────────────────────────────────────────────────────

describe('bulkGenerateCodes', () => {
  it('genera la cantidad exacta de codigos solicitados', async () => {
    mockActivationCode.findUnique.mockResolvedValue(null);
    mockActivationCode.create.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) => ({
        id: `id-${Date.now()}-${Math.random()}`,
        code: data['code'],
        type: data['type'],
        status: 'AVAILABLE',
        expiresAt: null,
        createdAt: new Date(),
      }),
    );

    const codes = await bulkGenerateCodes('VIP_90', 5, 'admin-id');

    expect(codes).toHaveLength(5);
    for (const code of codes) {
      expect(code.code).toMatch(/^ARES-/);
      expect(code.type).toBe('VIP_90');
    }
  });

  it('lanza error si count es menor a 1', async () => {
    await expect(
      bulkGenerateCodes('PREMIUM_30', 0, 'admin-id'),
    ).rejects.toThrow(/entre 1 y 100/i);
  });

  it('lanza error si count es mayor a 100', async () => {
    await expect(
      bulkGenerateCodes('PREMIUM_30', 101, 'admin-id'),
    ).rejects.toThrow(/entre 1 y 100/i);
  });
});

// ──────────────────────────────────────────────────────────
// redeemCode
// ──────────────────────────────────────────────────────────

describe('redeemCode', () => {
  it('canjea un codigo valido y retorna tier + expiresAt', async () => {
    const mockCode = {
      id: 'code-redeem-1',
      code: 'ARES-AAAA-BBBB-CCCC',
      type: 'PREMIUM_30',
      status: 'AVAILABLE',
      expiresAt: null,
    };

    // validateCode necesita findUnique
    mockActivationCode.findUnique.mockResolvedValue(mockCode);

    // Transaction mock
    mockTransaction.mockImplementation(
      async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          activationCode: {
            update: vi.fn().mockResolvedValue({ ...mockCode, status: 'USED' }),
          },
          user: {
            update: vi.fn().mockResolvedValue({}),
          },
          payment: {
            create: vi.fn().mockResolvedValue({ id: 'payment-1' }),
          },
          subscription: {
            create: vi.fn().mockResolvedValue({ id: 'sub-1' }),
          },
        };
        return fn(tx);
      },
    );

    const result = await redeemCode('ARES-AAAA-BBBB-CCCC', 'user-1');

    expect(result.tier).toBe('PREMIUM');
    expect(result.expiresAt).toBeInstanceOf(Date);
    expect(result.codeType).toBe('PREMIUM_30');

    // Verificar que la fecha de expiracion es ~30 dias en el futuro
    const daysDiff = Math.round(
      (result.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    expect(daysDiff).toBeGreaterThanOrEqual(29);
    expect(daysDiff).toBeLessThanOrEqual(31);
  });

  it('rechaza un codigo ya usado', async () => {
    mockActivationCode.findUnique.mockResolvedValue({
      id: 'code-used',
      code: 'ARES-USED-CODE-HERE',
      type: 'VIP_30',
      status: 'USED',
      usedAt: new Date(),
    });

    await expect(
      redeemCode('ARES-USED-CODE-HERE', 'user-2'),
    ).rejects.toThrow(/ya fue utilizado/i);
  });

  it('rechaza un codigo inexistente', async () => {
    mockActivationCode.findUnique.mockResolvedValue(null);

    await expect(
      redeemCode('ARES-NOPE-NOPE-NOPE', 'user-3'),
    ).rejects.toThrow(/not found/i);
  });
});
