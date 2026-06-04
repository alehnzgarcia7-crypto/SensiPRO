import { NotFoundError } from '@ares/errors';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Access policy boundary
//
// Phase 3A establishes the authorization boundary WITHOUT introducing auth.
// Today every searchable (active) Device is public, so generation needs no
// login. Inactive/unpublished devices are treated as non-existent to deny
// device-id enumeration. The `user` argument is intentionally accepted (and
// unused) so Phase 3B/4 can layer premium/private objects here — at one
// chokepoint — instead of rewriting the endpoint.
// ═══════════════════════════════════════════════════════════════

export interface AresV6AccessPrincipal {
  id?: string;
  tier?: 'FREE' | 'PREMIUM' | 'VIP';
  role?: 'USER' | 'MODERATOR' | 'ADMIN';
}

export interface AresV6AccessDevice {
  id?: string;
  /** Maps to Prisma `Device.isActive`. Undefined is treated as active. */
  isActive?: boolean | null;
}

export interface AresV6DeviceAccessInput {
  device: AresV6AccessDevice;
  user?: AresV6AccessPrincipal;
}

/** True when the principal may generate a config for this device. */
export function canGenerateForDevice({ device }: AresV6DeviceAccessInput): boolean {
  // Active devices are public in Phase 3A. Only an explicit `isActive === false`
  // denies access; unknown/undefined is allowed (back-compat for partial reads).
  return device.isActive !== false;
}

/**
 * Throw {@link NotFoundError} (not Forbidden) when access is denied, so a
 * private/inactive device is indistinguishable from a non-existent one.
 */
export function assertCanGenerateForDevice(input: AresV6DeviceAccessInput): void {
  if (!canGenerateForDevice(input)) {
    throw new NotFoundError('Device', input.device.id);
  }
}
