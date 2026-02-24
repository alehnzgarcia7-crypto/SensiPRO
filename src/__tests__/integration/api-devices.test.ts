import { describe, it, expect } from 'vitest';

const BASE = 'http://localhost:3000';

// ═══════════════════════════════════════════════════════════════
// ARES-805 — Integration tests: /api/devices
// Requiere dev server corriendo en localhost:3000 con DB seeded
// ═══════════════════════════════════════════════════════════════

describe('GET /api/devices', () => {
  it('returns device list with pagination meta', async () => {
    const res = await fetch(`${BASE}/api/devices`);
    const json: { success: boolean; data: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } } = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.meta).toHaveProperty('page');
    expect(json.meta).toHaveProperty('limit');
    expect(json.meta).toHaveProperty('total');
    expect(json.meta).toHaveProperty('totalPages');
  });

  it('filters by brand', async () => {
    const res = await fetch(`${BASE}/api/devices?brand=Samsung`);
    const json: { success: boolean; data: Array<{ brand: string }> } = await res.json();

    expect(json.success).toBe(true);
    if (json.data.length > 0) {
      expect(json.data[0].brand).toBe('Samsung');
    }
  });

  it('filters by tier', async () => {
    const res = await fetch(`${BASE}/api/devices?tier=GAMING`);
    const json: { success: boolean; data: Array<{ tier: string }> } = await res.json();

    expect(json.success).toBe(true);
    json.data.forEach((d) => {
      expect(d.tier).toBe('GAMING');
    });
  });

  it('filters popular devices', async () => {
    const res = await fetch(`${BASE}/api/devices?popular=true`);
    const json: { success: boolean; data: Array<{ isPopular: boolean }> } = await res.json();

    expect(json.success).toBe(true);
    json.data.forEach((d) => {
      expect(d.isPopular).toBe(true);
    });
  });

  it('paginates correctly', async () => {
    const page1Res = await fetch(`${BASE}/api/devices?page=1&limit=5`);
    const page1: { data: Array<{ id: string }> } = await page1Res.json();

    const page2Res = await fetch(`${BASE}/api/devices?page=2&limit=5`);
    const page2: { data: Array<{ id: string }> } = await page2Res.json();

    expect(page1.data.length).toBeLessThanOrEqual(5);
    if (page2.data.length > 0) {
      expect(page1.data[0].id).not.toBe(page2.data[0].id);
    }
  });

  it('searches by text', async () => {
    const res = await fetch(`${BASE}/api/devices?search=Galaxy`);
    const json: { success: boolean; data: Array<{ model: string; brand: string }> } = await res.json();

    expect(json.success).toBe(true);
    // Si hay resultados, al menos uno deberia contener "Galaxy" en brand o model
    if (json.data.length > 0) {
      const hasMatch = json.data.some(
        (d) =>
          d.model.toLowerCase().includes('galaxy') ||
          d.brand.toLowerCase().includes('galaxy'),
      );
      expect(hasMatch).toBe(true);
    }
  });

  it('rejects invalid tier parameter', async () => {
    const res = await fetch(`${BASE}/api/devices?tier=INVALID`);
    const json: { success: boolean; error: { code: string } } = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns correct device shape', async () => {
    const res = await fetch(`${BASE}/api/devices?limit=1`);
    const json: { data: Array<Record<string, unknown>> } = await res.json();

    if (json.data.length > 0) {
      const device = json.data[0];
      expect(device).toHaveProperty('id');
      expect(device).toHaveProperty('brand');
      expect(device).toHaveProperty('model');
      expect(device).toHaveProperty('slug');
      expect(device).toHaveProperty('screenHz');
      expect(device).toHaveProperty('screenSize');
      expect(device).toHaveProperty('ramGb');
      expect(device).toHaveProperty('panelType');
      expect(device).toHaveProperty('tier');
      expect(device).toHaveProperty('isPopular');
    }
  });
});

describe('GET /api/devices/[slug]', () => {
  it('returns device by slug', async () => {
    // Obtener un slug valido del listado
    const listRes = await fetch(`${BASE}/api/devices?limit=1`);
    const list: { data: Array<{ slug: string }> } = await listRes.json();
    if (list.data.length === 0) return;

    const slug = list.data[0].slug;
    const res = await fetch(`${BASE}/api/devices/${slug}`);
    const json: { success: boolean; data: { slug: string; brand: string; model: string } } = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.slug).toBe(slug);
    expect(json.data).toHaveProperty('brand');
    expect(json.data).toHaveProperty('model');
  });

  it('returns 404 for nonexistent slug', async () => {
    const res = await fetch(`${BASE}/api/devices/nonexistent-device-xyz-999`);
    const json: { success: boolean; error: { code: string } } = await res.json();

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('NOT_FOUND');
  });
});

describe('GET /api/devices/brands', () => {
  it('returns list of brands', async () => {
    const res = await fetch(`${BASE}/api/devices/brands`);
    const json: { success: boolean; data: Array<{ name: string; slug: string; count: number }> } = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    if (json.data.length > 0) {
      expect(json.data[0]).toHaveProperty('name');
      expect(json.data[0]).toHaveProperty('slug');
      expect(json.data[0]).toHaveProperty('count');
      expect(typeof json.data[0].count).toBe('number');
    }
  });
});
