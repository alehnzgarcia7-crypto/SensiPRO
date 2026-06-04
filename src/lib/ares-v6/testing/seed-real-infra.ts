import type { PrismaClient } from '@prisma/client';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Minimal smoke seed (REAL INFRA ONLY)
//
// Upserts exactly two devices for the real-infra smoke test: one active and
// one inactive (to validate the access-policy 404 path). It touches no users,
// payments, premium or the general seed. Idempotent (upsert by slug). Intended
// to run only against an ephemeral smoke database (service container / local
// throwaway DB), never production.
// ═══════════════════════════════════════════════════════════════

export const ARES_V6_SMOKE_ACTIVE_SLUG = 'redmi-note-13-smoke';
export const ARES_V6_SMOKE_INACTIVE_SLUG = 'redmi-note-13-smoke-inactive';
export const ARES_V6_SMOKE_SCREEN_DPI = 395;

export interface AresV6SmokeSeedResult {
  activeId: string;
  inactiveId: string;
}

export async function seedAresV6SmokeDevices(prisma: PrismaClient): Promise<AresV6SmokeSeedResult> {
  const active = await prisma.device.upsert({
    where: { slug: ARES_V6_SMOKE_ACTIVE_SLUG },
    update: { isActive: true, screenDpi: ARES_V6_SMOKE_SCREEN_DPI },
    create: {
      brand: 'Redmi',
      model: 'Note 13 Smoke',
      slug: ARES_V6_SMOKE_ACTIVE_SLUG,
      screenHz: 120,
      screenSize: 6.67,
      ramGb: 6,
      screenDpi: ARES_V6_SMOKE_SCREEN_DPI,
      panelType: 'AMOLED',
      tier: 'MID',
      chipset: 'Snapdragon 685',
      releaseYear: 2024,
      isActive: true,
    },
    select: { id: true },
  });

  const inactive = await prisma.device.upsert({
    where: { slug: ARES_V6_SMOKE_INACTIVE_SLUG },
    update: { isActive: false, screenDpi: ARES_V6_SMOKE_SCREEN_DPI },
    create: {
      brand: 'Redmi',
      model: 'Note 13 Smoke Inactive',
      slug: ARES_V6_SMOKE_INACTIVE_SLUG,
      screenHz: 120,
      screenSize: 6.67,
      ramGb: 6,
      screenDpi: ARES_V6_SMOKE_SCREEN_DPI,
      panelType: 'AMOLED',
      tier: 'MID',
      isActive: false,
    },
    select: { id: true },
  });

  return { activeId: active.id, inactiveId: inactive.id };
}

// Devices whose slug equals a known calibration fixture id, so persisted
// generations map to fixtures and exercise EVIDENCE coverage (Fase 3D.1).
const ARES_V6_FIXTURE_KNOWN_DEVICES = [
  {
    fixtureId: 'redmi-note-13',
    brand: 'Redmi',
    model: 'Note 13',
    screenHz: 120,
    screenSize: 6.67,
    ramGb: 6,
    screenDpi: 395,
    panelType: 'AMOLED' as const,
    tier: 'MID' as const,
  },
  {
    fixtureId: 'samsung-galaxy-a14',
    brand: 'Samsung',
    model: 'Galaxy A14',
    screenHz: 90,
    screenSize: 6.6,
    ramGb: 4,
    screenDpi: 400,
    panelType: 'LCD' as const,
    tier: 'LOW' as const,
  },
];

export interface AresV6FixtureKnownSeedResult {
  deviceId: string;
  fixtureId: string;
}

/** Upsert fixture-known devices (slug === fixtureId). Returns their ids + fixture ids. */
export async function seedAresV6FixtureKnownDevices(prisma: PrismaClient): Promise<AresV6FixtureKnownSeedResult[]> {
  const results: AresV6FixtureKnownSeedResult[] = [];
  for (const device of ARES_V6_FIXTURE_KNOWN_DEVICES) {
    const row = await prisma.device.upsert({
      where: { slug: device.fixtureId },
      update: { isActive: true, screenDpi: device.screenDpi },
      create: {
        brand: device.brand,
        model: device.model,
        slug: device.fixtureId,
        screenHz: device.screenHz,
        screenSize: device.screenSize,
        ramGb: device.ramGb,
        screenDpi: device.screenDpi,
        panelType: device.panelType,
        tier: device.tier,
        isActive: true,
      },
      select: { id: true },
    });
    results.push({ deviceId: row.id, fixtureId: device.fixtureId });
  }
  return results;
}
