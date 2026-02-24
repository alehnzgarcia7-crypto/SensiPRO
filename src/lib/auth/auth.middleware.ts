import type { UserRole, UserTier } from '@prisma/client';

import { AuthError, ForbiddenError } from '@ares/errors';

import { auth } from './index';

export async function getRequiredSession() {
  const session = await auth();

  if (!session?.user) {
    throw new AuthError('UNAUTHORIZED', 'Debes iniciar sesion');
  }

  return session;
}

export async function getOptionalSession() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireRole(role: UserRole) {
  const session = await getRequiredSession();
  const userRole = session.user.role as UserRole;

  if (userRole !== role && userRole !== 'ADMIN') {
    throw new ForbiddenError('No tienes permisos para esta accion');
  }

  return session;
}

export async function requireTier(requiredTier: UserTier) {
  const session = await getRequiredSession();
  const userTier = session.user.tier as UserTier;

  const tierLevel: Record<UserTier, number> = {
    FREE: 0,
    PREMIUM: 1,
    VIP: 2,
  };

  if (tierLevel[userTier] < tierLevel[requiredTier]) {
    throw new ForbiddenError(
      `Necesitas ser ${requiredTier} para acceder a esta funcion`,
    );
  }

  return session;
}
