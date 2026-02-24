import type { UserTier, UserRole } from '@prisma/client';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: UserRole;
  tier: UserTier;
  tierExpiresAt: Date | null;
  totalSearches: number;
  totalFavorites: number;
  totalShares: number;
  referralCode: string | null;
  referralCount: number;
  createdAt: Date;
}

export interface UserSession {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  tier: UserTier;
  tierExpiresAt: Date | null;
}

export interface UserPublic {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  tier: UserTier;
  totalSearches: number;
  totalFavorites: number;
  totalShares: number;
  createdAt: Date;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  referralCode?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
