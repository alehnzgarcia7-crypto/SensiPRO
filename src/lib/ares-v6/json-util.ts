import type { Prisma } from '@prisma/client';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — JSON helper for Prisma Json columns
//
// Deep-clones a value into a plain JSON value so readonly arrays / branded
// engine types are accepted by Prisma's Json input without `any`.
// ═══════════════════════════════════════════════════════════════

export function toAresV6Json(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
