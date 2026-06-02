import type { Prisma } from '@prisma/client';

import type { AresV6GenerationOutput } from '@ares/algorithms/engine-v6';

import { toAresV6Json } from './json-util';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Controlled generation persistence (Fase 3C)
//
// Stores internal evidence of a generation when the flag is on. NEVER stores
// PII: no raw IP (not even the hash by default), no user-agent, no token, no
// request body. The device finder is at the service layer; here we only build
// and write the minimized record. Failure handling (required vs degraded) is
// decided by the route.
// ═══════════════════════════════════════════════════════════════

export function shouldPersistAresV6Generations(): boolean {
  return process.env.ARES_V6_PERSIST_GENERATIONS === 'true';
}

export function isAresV6PersistenceRequired(): boolean {
  return process.env.ARES_V6_PERSIST_GENERATIONS_REQUIRED === 'true';
}

export type AresV6GenerationRecord = Prisma.AresV6GenerationCreateInput;

export interface AresV6GenerationRecordInput {
  requestId: string;
  device: { id: string; brand: string; model: string; slug?: string | null };
  generation: AresV6GenerationOutput;
  player: { playstyle: string; mode: string; fingers: number; primaryWeaponCategory?: string };
  rate?: {
    scopesApplied?: readonly string[];
    degraded?: boolean;
    proxyTrusted?: boolean;
    proxyIpSource?: string;
  };
  timings?: { dbDurationMs?: number; engineDurationMs?: number; totalDurationMs?: number };
  labMode: boolean;
}

export function buildAresV6GenerationRecord(input: AresV6GenerationRecordInput): AresV6GenerationRecord {
  const g = input.generation;
  return {
    requestId: input.requestId,
    deviceId: input.device.id,
    deviceBrand: input.device.brand,
    deviceModel: input.device.model,
    deviceSlug: input.device.slug ?? null,
    presetId: g.presetId,
    playstyle: input.player.playstyle,
    mode: input.player.mode,
    fingers: input.player.fingers,
    primaryWeaponCategory: input.player.primaryWeaponCategory ?? null,
    ppiSource: g.dpi.source,
    detectedPpi: g.dpi.detectedPpi ?? null,
    confidenceScore: g.confidence.score,
    confidenceGrade: g.confidence.grade,
    sensitivity: toAresV6Json(g.sensitivity),
    gyroscope: g.gyroscope ? toAresV6Json(g.gyroscope) : undefined,
    dpi: toAresV6Json(g.dpi),
    fireButton: toAresV6Json(g.fireButton),
    hud: toAresV6Json(g.hud),
    tuningSteps: toAresV6Json(g.firstTuningSteps),
    warnings: toAresV6Json(g.confidence.warnings),
    rateLimitScopes: input.rate?.scopesApplied ? toAresV6Json(input.rate.scopesApplied) : undefined,
    rateLimitDegraded: input.rate?.degraded ?? false,
    proxyTrusted: input.rate?.proxyTrusted ?? null,
    proxyIpSource: input.rate?.proxyIpSource ?? null,
    dbDurationMs: input.timings?.dbDurationMs ?? null,
    engineDurationMs: input.timings?.engineDurationMs ?? null,
    totalDurationMs: input.timings?.totalDurationMs ?? null,
    labMode: input.labMode,
    source: 'INTERNAL_LAB',
  };
}

export interface AresV6PersistenceDeps {
  create(data: AresV6GenerationRecord): Promise<{ id: string }>;
}

async function defaultCreate(data: AresV6GenerationRecord): Promise<{ id: string }> {
  const { prisma } = await import('@ares/database');
  const row = await prisma.aresV6Generation.create({ data, select: { id: true } });
  return { id: row.id };
}

const DEFAULT_DEPS: AresV6PersistenceDeps = { create: defaultCreate };

/** Persist a generation record. Throws on write failure (route decides policy). */
export async function persistAresV6Generation(
  record: AresV6GenerationRecord,
  deps: AresV6PersistenceDeps = DEFAULT_DEPS,
): Promise<{ id: string }> {
  return deps.create(record);
}
