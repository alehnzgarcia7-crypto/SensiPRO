import { describe, it, expect } from 'vitest';

import { assignVariant } from '@/lib/ab-testing/ab-engine';

// ═══════════════════════════════════════════════════════════════
// Tests para el motor de A/B Testing
// ═══════════════════════════════════════════════════════════════

describe('assignVariant', () => {
  const twoVariants = [
    { key: 'control', weight: 50 },
    { key: 'variant_a', weight: 50 },
  ];

  it('retorna un variant key válido', () => {
    const result = assignVariant('user-1', 'test-exp', twoVariants);
    expect(['control', 'variant_a']).toContain(result);
  });

  it('es determinístico — mismo input = mismo output', () => {
    const result1 = assignVariant('user-123', 'pricing-test', twoVariants);
    const result2 = assignVariant('user-123', 'pricing-test', twoVariants);
    const result3 = assignVariant('user-123', 'pricing-test', twoVariants);

    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
  });

  it('diferentes usuarios pueden obtener diferentes variantes', () => {
    const results = new Set<string>();
    // Con suficientes usuarios, deberíamos ver ambas variantes
    for (let i = 0; i < 100; i++) {
      results.add(assignVariant(`user-${i}`, 'test-exp', twoVariants));
    }
    expect(results.size).toBe(2);
  });

  it('diferentes experimentos pueden dar diferentes variantes al mismo usuario', () => {
    const results = new Set<string>();
    for (let i = 0; i < 50; i++) {
      results.add(assignVariant('fixed-user', `experiment-${i}`, twoVariants));
    }
    // Con 50 experimentos diferentes, deberíamos ver ambas variantes
    expect(results.size).toBe(2);
  });

  it('respeta pesos desiguales en distribución', () => {
    const heavyVariants = [
      { key: 'control', weight: 90 },
      { key: 'variant_a', weight: 10 },
    ];

    let controlCount = 0;
    const totalUsers = 1000;

    for (let i = 0; i < totalUsers; i++) {
      const result = assignVariant(`user-${i}`, 'weighted-test', heavyVariants);
      if (result === 'control') controlCount++;
    }

    // Con peso 90/10, control debería tener ~90% (+/- margen)
    const controlRatio = controlCount / totalUsers;
    expect(controlRatio).toBeGreaterThan(0.8);
    expect(controlRatio).toBeLessThan(0.98);
  });

  it('funciona con 3+ variantes', () => {
    const threeVariants = [
      { key: 'control', weight: 33 },
      { key: 'variant_a', weight: 33 },
      { key: 'variant_b', weight: 34 },
    ];

    const results = new Set<string>();
    for (let i = 0; i < 200; i++) {
      results.add(assignVariant(`user-${i}`, 'three-way', threeVariants));
    }
    expect(results.size).toBe(3);
  });

  it('retorna la primera variante como fallback', () => {
    const singleVariant = [{ key: 'only_one', weight: 100 }];
    const result = assignVariant('any-user', 'single-test', singleVariant);
    expect(result).toBe('only_one');
  });

  it('distribución 50/50 es aproximadamente uniforme', () => {
    let controlCount = 0;
    const total = 10000;

    for (let i = 0; i < total; i++) {
      const result = assignVariant(`user-dist-${i}`, 'dist-test', twoVariants);
      if (result === 'control') controlCount++;
    }

    const ratio = controlCount / total;
    // Esperamos ~50% con +/- 5% de margen
    expect(ratio).toBeGreaterThan(0.45);
    expect(ratio).toBeLessThan(0.55);
  });
});
