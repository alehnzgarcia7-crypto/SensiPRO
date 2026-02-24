import type { User, UserTier, UserRole } from '@prisma/client';

let counter = 0;

export function createTestUser(overrides?: Partial<User>): User {
  counter++;
  return {
    id: `user-${counter}-${Date.now()}`,
    email: `testuser${counter}@test.com`,
    username: `testuser${counter}`,
    displayName: `Test User ${counter}`,
    avatarUrl: null,
    bio: null,
    password: '$2a$12$hashedpassword',
    role: 'USER' as UserRole,
    tier: 'FREE' as UserTier,
    tierExpiresAt: null,
    totalSearches: 0,
    totalFavorites: 0,
    totalShares: 0,
    referralCode: `REF${counter}CODE`,
    referredBy: null,
    referralCount: 0,
    lastLoginAt: null,
    lastLoginIp: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestUserSession(overrides?: Record<string, unknown>) {
  counter++;
  return {
    id: `user-${counter}`,
    email: `testuser${counter}@test.com`,
    username: `testuser${counter}`,
    displayName: `Test User ${counter}`,
    avatarUrl: null,
    role: 'USER',
    tier: 'FREE',
    tierExpiresAt: null,
    ...overrides,
  };
}
