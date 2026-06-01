import type { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from '../route';

// ═══════════════════════════════════════════════════════════════
// POST /api/generate/v6 — route handler tests
//
// Prisma is mocked (no DB) and the feature flag is driven via env. The route
// must stay invisible (404) when the flag is off and never touch legacy.
// ═══════════════════════════════════════════════════════════════

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock('@ares/database', () => ({ prisma: { device: { findUnique } } }));

interface SuccessBody {
  success: boolean;
  data: {
    device: { id: string; brand: string; model: string; slug: string; screenDpi: number | null };
    generation: {
      algorithmVersion: string;
      dpi: { detectedPpi: number | null };
      sensitivity: Record<string, number>;
      confidence: { grade: string };
      firstTuningSteps: unknown[];
    };
  };
  meta: { engine: string; labMode: boolean };
}

const DEVICE_ID = 'ckdevicea1b2c3d4e5f6g7h8';

const MOCK_DEVICE = {
  id: DEVICE_ID,
  brand: 'Redmi',
  model: 'Note 13',
  slug: 'redmi-note-13',
  screenSize: 6.67,
  ramGb: 6,
  screenHz: 120,
  panelType: 'AMOLED',
  tier: 'MID',
  screenDpi: 395,
  chipset: 'Snapdragon 685',
  releaseYear: 2024,
};

const VALID_BODY = {
  deviceId: DEVICE_ID,
  presetId: 'STANDARD_PRO',
  player: { fingers: 3, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false },
};

const FLAG = 'ARES_V6_API_ENABLED';
let originalFlag: string | undefined;

function setFlag(value: string | undefined): void {
  if (value === undefined) {
    delete process.env[FLAG];
  } else {
    process.env[FLAG] = value;
  }
}

function makeRequest(body: string): NextRequest {
  return new Request('http://localhost/api/generate/v6', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  }) as unknown as NextRequest;
}

beforeEach(() => {
  originalFlag = process.env[FLAG];
  findUnique.mockReset();
  setFlag('true');
});

afterEach(() => {
  setFlag(originalFlag);
});

describe('POST /api/generate/v6', () => {
  it('returns 404 when the feature flag is off', async () => {
    setFlag(undefined);
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(404);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('returns 400 for an invalid request body', async () => {
    const res = await POST(makeRequest(JSON.stringify({ deviceId: DEVICE_ID, presetId: 'STANDARD_PRO', player: {} })));
    expect(res.status).toBe(400);
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await POST(makeRequest('{ not json'));
    expect(res.status).toBe(400);
  });

  it('returns 404 when the device does not exist', async () => {
    findUnique.mockResolvedValue(null);
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(404);
  });

  it('returns 200 with a complete generation built from the DB screenDpi', async () => {
    findUnique.mockResolvedValue(MOCK_DEVICE);
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(200);

    const body = (await res.json()) as SuccessBody;
    expect(body.success).toBe(true);
    expect(body.data.device.screenDpi).toBe(395);
    expect(body.data.generation.dpi.detectedPpi).toBe(395);
    expect(body.data.generation.sensitivity.general).toBeGreaterThan(0);
    expect(body.data.generation.confidence.grade).toBeTruthy();
    expect(Array.isArray(body.data.generation.firstTuningSteps)).toBe(true);
    expect(body.meta.engine).toBe('ARES-v6-refoundation');
  });

  it('lets an override ppi win over the DB screenDpi', async () => {
    findUnique.mockResolvedValue(MOCK_DEVICE);
    const res = await POST(makeRequest(JSON.stringify({ ...VALID_BODY, overrides: { ppi: 460 } })));
    const body = (await res.json()) as SuccessBody;
    expect(body.data.generation.dpi.detectedPpi).toBe(460);
  });
});
