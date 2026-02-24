import type { UserRole, UserTier } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      username: string;
      role: UserRole;
      tier: UserTier;
      tierExpiresAt: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    role: string;
    tier: string;
    tierExpiresAt: string | null;
  }
}
