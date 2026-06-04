import type { AresV6LabMetricsFilter } from './lab-metrics';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Evidence repository (Fase 3D.1)
//
// Reads per device×preset sample counts WITH enough device context
// (brand/model/slug) to map evidence back to a known calibration fixture.
// groupBy aggregates server-side (≤ devices×presets groups, not row-by-row),
// respects the date/device/preset filter and caps the number of groups.
// No PII: only device identifiers + counts. No raw IP/UA/token/body.
// ═══════════════════════════════════════════════════════════════

/** Defensive cap on distinct device×preset groups returned. */
export const ARES_V6_EVIDENCE_MAX_CELLS = 5000;

export interface AresV6DevicePresetCount {
  deviceId: string;
  presetId: string;
  generations: number;
  trustedFeedback: number;
  deviceBrand?: string | null;
  deviceModel?: string | null;
  deviceSlug?: string | null;
}

function createdAtWhere(filter: AresV6LabMetricsFilter): { gte?: Date; lte?: Date } | undefined {
  const where: { gte?: Date; lte?: Date } = {};
  if (filter.since) where.gte = filter.since;
  if (filter.until) where.lte = filter.until;
  return Object.keys(where).length > 0 ? where : undefined;
}

/**
 * Fetch device×preset counts enriched with brand/model/slug from
 * AresV6Generation, merged with TRUSTED feedback counts from AresV6Feedback.
 * SUSPICIOUS feedback is excluded unless includeSuspicious is true.
 */
export async function getAresV6DevicePresetCounts(
  filter: AresV6LabMetricsFilter,
  includeSuspicious: boolean,
): Promise<AresV6DevicePresetCount[]> {
  const { prisma } = await import('@ares/database');
  const createdAt = createdAtWhere(filter);
  const where = {
    ...(createdAt ? { createdAt } : {}),
    ...(filter.deviceId ? { deviceId: filter.deviceId } : {}),
    ...(filter.presetId ? { presetId: filter.presetId } : {}),
  };

  const [generations, feedback] = await Promise.all([
    prisma.aresV6Generation.groupBy({
      by: ['deviceId', 'presetId', 'deviceBrand', 'deviceModel', 'deviceSlug'],
      _count: { _all: true },
      where,
      orderBy: [{ deviceId: 'asc' }, { presetId: 'asc' }],
      take: ARES_V6_EVIDENCE_MAX_CELLS,
    }),
    prisma.aresV6Feedback.groupBy({
      by: ['deviceId', 'presetId'],
      _count: { _all: true },
      where: { ...where, ...(includeSuspicious ? {} : { qualityFlag: { not: 'SUSPICIOUS' } }) },
      orderBy: [{ deviceId: 'asc' }, { presetId: 'asc' }],
      take: ARES_V6_EVIDENCE_MAX_CELLS,
    }),
  ]);

  const cells = new Map<string, AresV6DevicePresetCount>();
  for (const row of generations) {
    cells.set(`${row.deviceId}:${row.presetId}`, {
      deviceId: row.deviceId,
      presetId: row.presetId,
      generations: row._count._all,
      trustedFeedback: 0,
      deviceBrand: row.deviceBrand,
      deviceModel: row.deviceModel,
      deviceSlug: row.deviceSlug,
    });
  }
  for (const row of feedback) {
    const key = `${row.deviceId}:${row.presetId}`;
    const existing = cells.get(key) ?? {
      deviceId: row.deviceId,
      presetId: row.presetId,
      generations: 0,
      trustedFeedback: 0,
    };
    existing.trustedFeedback = row._count._all;
    cells.set(key, existing);
  }
  return [...cells.values()];
}
