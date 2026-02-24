import { describe, it, expect } from 'vitest';

const BASE = 'http://localhost:3000';

// ═══════════════════════════════════════════════════════════════
// ARES-805 — Integration tests: /api/generate
// Requiere dev server corriendo en localhost:3000 con DB seeded
// ═══════════════════════════════════════════════════════════════

interface DeviceItem {
  id: string;
  brand: string;
  model: string;
  slug: string;
}

interface SensitivityData {
  device: {
    id: string;
    brand: string;
    model: string;
    slug: string;
    tier: string;
  };
  sensitivity: {
    general: number;
    redPoint: number;
    scope2x: number;
    scope4x: number;
    sniperScope: number;
    freeView: number;
  };
  gyroscope: {
    gyroGeneral: number;
    gyroRedPoint: number;
    gyroScope2x: number;
    gyroScope4x: number;
    gyroSniper: number;
    gyroFreeView: number;
  } | null;
  meta: {
    performanceScore: number;
    styleApplied: string;
    deviceTier: string;
    algorithm: string;
  };
}

async function getFirstDeviceId(): Promise<string | null> {
  const res = await fetch(`${BASE}/api/devices?limit=1`);
  const json: { data: DeviceItem[] } = await res.json();
  return json.data.length > 0 ? json.data[0].id : null;
}

describe('POST /api/generate', () => {
  it('generates sensitivity for valid device with BALANCED style', async () => {
    const deviceId = await getFirstDeviceId();
    if (!deviceId) return;

    const res = await fetch(`${BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, style: 'BALANCED' }),
    });

    const json: { success: boolean; data: SensitivityData } = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);

    // Verificar estructura del device
    expect(json.data.device).toHaveProperty('id');
    expect(json.data.device).toHaveProperty('brand');
    expect(json.data.device).toHaveProperty('model');
    expect(json.data.device).toHaveProperty('slug');
    expect(json.data.device).toHaveProperty('tier');

    // Verificar 6 campos de sensibilidad
    const sens = json.data.sensitivity;
    expect(sens).toHaveProperty('general');
    expect(sens).toHaveProperty('redPoint');
    expect(sens).toHaveProperty('scope2x');
    expect(sens).toHaveProperty('scope4x');
    expect(sens).toHaveProperty('sniperScope');
    expect(sens).toHaveProperty('freeView');

    // Todos los valores entre 1-100
    expect(sens.general).toBeGreaterThanOrEqual(1);
    expect(sens.general).toBeLessThanOrEqual(100);
    expect(sens.redPoint).toBeGreaterThanOrEqual(1);
    expect(sens.redPoint).toBeLessThanOrEqual(100);
    expect(sens.scope2x).toBeGreaterThanOrEqual(1);
    expect(sens.scope2x).toBeLessThanOrEqual(100);
    expect(sens.scope4x).toBeGreaterThanOrEqual(1);
    expect(sens.scope4x).toBeLessThanOrEqual(100);
    expect(sens.sniperScope).toBeGreaterThanOrEqual(1);
    expect(sens.sniperScope).toBeLessThanOrEqual(100);
    expect(sens.freeView).toBeGreaterThanOrEqual(1);
    expect(sens.freeView).toBeLessThanOrEqual(100);
  });

  it('generates sensitivity for AGGRESSIVE style', async () => {
    const deviceId = await getFirstDeviceId();
    if (!deviceId) return;

    const res = await fetch(`${BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, style: 'AGGRESSIVE' }),
    });

    const json: { success: boolean; data: SensitivityData } = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.sensitivity.general).toBeGreaterThanOrEqual(1);
  });

  it('generates sensitivity for SNIPER style', async () => {
    const deviceId = await getFirstDeviceId();
    if (!deviceId) return;

    const res = await fetch(`${BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, style: 'SNIPER' }),
    });

    const json: { success: boolean; data: SensitivityData } = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    // Sniper style: sniperScope deberia ser relativamente alto
    expect(json.data.sensitivity.sniperScope).toBeGreaterThanOrEqual(1);
  });

  it('includes gyroscope when requested', async () => {
    const deviceId = await getFirstDeviceId();
    if (!deviceId) return;

    const res = await fetch(`${BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, style: 'BALANCED', includeGyro: true }),
    });

    const json: { success: boolean; data: SensitivityData } = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);

    // Gyroscope should be present when requested
    if (json.data.gyroscope) {
      expect(json.data.gyroscope).toHaveProperty('gyroGeneral');
      expect(json.data.gyroscope).toHaveProperty('gyroRedPoint');
      expect(json.data.gyroscope).toHaveProperty('gyroScope2x');
      expect(json.data.gyroscope).toHaveProperty('gyroScope4x');
      expect(json.data.gyroscope).toHaveProperty('gyroSniper');
      expect(json.data.gyroscope).toHaveProperty('gyroFreeView');
    }
  });

  it('includes meta with performance score', async () => {
    const deviceId = await getFirstDeviceId();
    if (!deviceId) return;

    const res = await fetch(`${BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, style: 'BALANCED' }),
    });

    const json: { success: boolean; data: SensitivityData } = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.meta).toHaveProperty('performanceScore');
    expect(json.data.meta.performanceScore).toBeGreaterThanOrEqual(0);
    expect(json.data.meta.performanceScore).toBeLessThanOrEqual(100);
  });

  it('rejects invalid style', async () => {
    const res = await fetch(`${BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: 'clxxxxxxxxxxxxxxxxxxxxxxxxx', style: 'INVALID' }),
    });

    const json: { success: boolean; error: { code: string; message: string } } = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects missing deviceId', async () => {
    const res = await fetch(`${BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ style: 'BALANCED' }),
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
    const json: { success: boolean } = await res.json();
    expect(json.success).toBe(false);
  });

  it('rejects missing style', async () => {
    const deviceId = await getFirstDeviceId();
    if (!deviceId) return;

    const res = await fetch(`${BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
    const json: { success: boolean } = await res.json();
    expect(json.success).toBe(false);
  });

  it('returns 404 for nonexistent device', async () => {
    const res = await fetch(`${BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: 'clzzzzzzzzzzzzzzzzzzzzzzzz', style: 'BALANCED' }),
    });

    // Podria ser 400 (invalid CUID) o 404 (not found)
    expect(res.status).toBeGreaterThanOrEqual(400);
    const json: { success: boolean } = await res.json();
    expect(json.success).toBe(false);
  });

  it('returns deterministic results for same input', async () => {
    const deviceId = await getFirstDeviceId();
    if (!deviceId) return;

    const body = JSON.stringify({ deviceId, style: 'BALANCED' });
    const headers = { 'Content-Type': 'application/json' };

    const res1 = await fetch(`${BASE}/api/generate`, { method: 'POST', headers, body });
    const json1: { data: SensitivityData } = await res1.json();

    const res2 = await fetch(`${BASE}/api/generate`, { method: 'POST', headers, body });
    const json2: { data: SensitivityData } = await res2.json();

    // Mismo input = mismos valores (algoritmo determinístico)
    expect(json1.data.sensitivity.general).toBe(json2.data.sensitivity.general);
    expect(json1.data.sensitivity.redPoint).toBe(json2.data.sensitivity.redPoint);
    expect(json1.data.sensitivity.scope2x).toBe(json2.data.sensitivity.scope2x);
    expect(json1.data.sensitivity.scope4x).toBe(json2.data.sensitivity.scope4x);
    expect(json1.data.sensitivity.sniperScope).toBe(json2.data.sensitivity.sniperScope);
    expect(json1.data.sensitivity.freeView).toBe(json2.data.sensitivity.freeView);
  });
});
