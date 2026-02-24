import type { GuideCategory } from '@prisma/client';

export interface GuideInfo {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: GuideCategory;
  imageUrl: string | null;
  readTimeMin: number;
  isPremium: boolean;
  viewCount: number;
}

export interface GuideFull extends GuideInfo {
  content: string;
  sections: GuideSection[];
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuideSection {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
  isPremium: boolean;
}

export interface TipOfDay {
  id: string;
  title: string;
  content: string;
  category: string;
}
