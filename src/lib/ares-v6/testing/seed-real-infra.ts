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
