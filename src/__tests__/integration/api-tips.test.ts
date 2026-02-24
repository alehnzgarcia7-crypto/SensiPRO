import { describe, it, expect } from 'vitest';

const BASE = 'http://localhost:3000';

// ═══════════════════════════════════════════════════════════════
// ARES-805 — Integration tests: /api/v1/academy/tips
// Requiere dev server corriendo en localhost:3000 con DB seeded
// ═══════════════════════════════════════════════════════════════

interface TipItem {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: string;
}

interface PaginatedResponse {
  success: boolean;
  data: TipItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

describe('GET /api/v1/academy/tips', () => {
  it('returns paginated tips list', async () => {
    const res = await fetch(`${BASE}/api/v1/academy/tips`);
    const json: PaginatedResponse = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.meta).toHaveProperty('page');
    expect(json.meta).toHaveProperty('limit');
    expect(json.meta).toHaveProperty('total');
    expect(json.meta).toHaveProperty('totalPages');
  });

  it('returns tips with correct shape', async () => {
    const res = await fetch(`${BASE}/api/v1/academy/tips?limit=1`);
    const json: PaginatedResponse = await res.json();

    expect(res.status).toBe(200);
    if (json.data.length > 0) {
      const tip = json.data[0];
      expect(tip).toHaveProperty('id');
      expect(tip).toHaveProperty('title');
      expect(tip).toHaveProperty('content');
      expect(typeof tip.title).toBe('string');
      expect(typeof tip.content).toBe('string');
    }
  });

  it('returns random tips', async () => {
    const res = await fetch(`${BASE}/api/v1/academy/tips?random=3`);
    const json: { success: boolean; data: TipItem[] } = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeLessThanOrEqual(3);
  });

  it('filters tips by category SENSITIVITY', async () => {
    const res = await fetch(`${BASE}/api/v1/academy/tips?category=SENSITIVITY`);
    const json: PaginatedResponse = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    // Si hay resultados, todos deberian ser de la categoria pedida
    json.data.forEach((tip) => {
      expect(tip.category).toBe('SENSITIVITY');
    });
  });

  it('filters tips by category AIM', async () => {
    const res = await fetch(`${BASE}/api/v1/academy/tips?category=AIM`);
    const json: PaginatedResponse = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    json.data.forEach((tip) => {
      expect(tip.category).toBe('AIM');
    });
  });

  it('filters tips by difficulty BEGINNER', async () => {
    const res = await fetch(`${BASE}/api/v1/academy/tips?difficulty=BEGINNER`);
    const json: PaginatedResponse = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    json.data.forEach((tip) => {
      expect(tip.difficulty).toBe('BEGINNER');
    });
  });

  it('paginates correctly', async () => {
    const page1Res = await fetch(`${BASE}/api/v1/academy/tips?page=1&limit=3`);
    const page1: PaginatedResponse = await page1Res.json();

    const page2Res = await fetch(`${BASE}/api/v1/academy/tips?page=2&limit=3`);
    const page2: PaginatedResponse = await page2Res.json();

    expect(page1.data.length).toBeLessThanOrEqual(3);
    if (page2.data.length > 0 && page1.data.length > 0) {
      expect(page1.data[0].id).not.toBe(page2.data[0].id);
    }
  });

  it('combines category and difficulty filters', async () => {
    const res = await fetch(`${BASE}/api/v1/academy/tips?category=SENSITIVITY&difficulty=BEGINNER`);
    const json: PaginatedResponse = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    json.data.forEach((tip) => {
      expect(tip.category).toBe('SENSITIVITY');
      expect(tip.difficulty).toBe('BEGINNER');
    });
  });

  it('rejects invalid category', async () => {
    const res = await fetch(`${BASE}/api/v1/academy/tips?category=INVALID`);
    const json: { success: boolean; error: { code: string } } = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects invalid difficulty', async () => {
    const res = await fetch(`${BASE}/api/v1/academy/tips?difficulty=INVALID`);
    const json: { success: boolean; error: { code: string } } = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('respects limit parameter', async () => {
    const res = await fetch(`${BASE}/api/v1/academy/tips?limit=2`);
    const json: PaginatedResponse = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.length).toBeLessThanOrEqual(2);
    expect(json.meta.limit).toBe(2);
  });

  it('returns empty array for high page number', async () => {
    const res = await fetch(`${BASE}/api/v1/academy/tips?page=9999`);
    const json: PaginatedResponse = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
  });
});
