import type { UserTier, SensitivityStyle, TournamentStatus } from '@prisma/client';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  tier: UserTier;
  value: number;
}

export interface TournamentInfo {
  id: string;
  title: string;
  description: string | null;
  status: TournamentStatus;
  startDate: Date;
  endDate: Date;
  prizeDescription: string | null;
  maxParticipants: number | null;
  entryTier: UserTier;
  participantCount: number;
}

export interface SharedConfigInfo {
  id: string;
  title: string;
  description: string | null;
  deviceBrand: string;
  deviceModel: string;
  style: SensitivityStyle;
  votes: number;
  authorUsername: string;
  authorTier: UserTier;
  createdAt: Date;
}
