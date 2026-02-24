import { prisma } from '@ares/database';
import type { GuideCategory, TipDifficulty } from '@prisma/client';

export interface GuideListItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: GuideCategory;
  imageUrl: string | null;
  readTimeMin: number;
  isPremium: boolean;
  viewCount: number;
  author: {
    username: string;
  };
  _count: {
    sections: number;
    comments: number;
  };
}

export interface GuideFull {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: GuideCategory;
  imageUrl: string | null;
  readTimeMin: number;
  isPremium: boolean;
  isPublished: boolean;
  viewCount: number;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    username: string;
    id: string;
  };
  sections: {
    id: string;
    title: string;
    content: string;
    orderIndex: number;
    isPremium: boolean;
  }[];
  comments: {
    id: string;
    content: string;
    createdAt: Date;
    user: {
      username: string;
      id: string;
    };
  }[];
}

export async function getGuides(params: {
  category?: GuideCategory;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ guides: GuideListItem[]; total: number }> {
  const { category, page = 1, limit = 12, search } = params;
  const skip = (page - 1) * limit;

  const where = {
    isPublished: true,
    ...(category ? { category } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [guides, total] = await Promise.all([
    prisma.guide.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        category: true,
        imageUrl: true,
        readTimeMin: true,
        isPremium: true,
        viewCount: true,
        author: { select: { username: true } },
        _count: { select: { sections: true, comments: true } },
      },
      orderBy: { viewCount: 'desc' },
      skip,
      take: limit,
    }),
    prisma.guide.count({ where }),
  ]);

  return { guides, total };
}

export async function getGuideBySlug(slug: string): Promise<GuideFull | null> {
  const guide = await prisma.guide.findUnique({
    where: { slug },
    include: {
      author: { select: { username: true, id: true } },
      sections: {
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          title: true,
          content: true,
          orderIndex: true,
          isPremium: true,
        },
      },
      comments: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: { select: { username: true, id: true } },
        },
      },
    },
  });

  return guide;
}

export async function incrementGuideViews(id: string): Promise<void> {
  await prisma.guide.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
}

export async function getFeaturedGuides(limit: number = 6): Promise<GuideListItem[]> {
  return prisma.guide.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      category: true,
      imageUrl: true,
      readTimeMin: true,
      isPremium: true,
      viewCount: true,
      author: { select: { username: true } },
      _count: { select: { sections: true, comments: true } },
    },
    orderBy: { viewCount: 'desc' },
    take: limit,
  });
}

export async function getGuidesByCategory(
  category: GuideCategory,
  limit: number = 10,
): Promise<GuideListItem[]> {
  return prisma.guide.findMany({
    where: { isPublished: true, category },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      category: true,
      imageUrl: true,
      readTimeMin: true,
      isPremium: true,
      viewCount: true,
      author: { select: { username: true } },
      _count: { select: { sections: true, comments: true } },
    },
    orderBy: { viewCount: 'desc' },
    take: limit,
  });
}

export async function getGuideCategoryCounts(): Promise<Record<GuideCategory, number>> {
  const counts = await prisma.guide.groupBy({
    by: ['category'],
    where: { isPublished: true },
    _count: { id: true },
  });

  const result: Record<string, number> = {
    SENSITIVITY: 0,
    MOVEMENT: 0,
    AIM: 0,
    STRATEGY: 0,
    DEVICE: 0,
    META: 0,
  };

  for (const row of counts) {
    result[row.category] = row._count.id;
  }

  return result as Record<GuideCategory, number>;
}

// ─── TIP QUERIES ──────────────────────────────────────────

export interface TipListItem {
  id: string;
  title: string;
  content: string;
  category: GuideCategory;
  difficulty: TipDifficulty;
}

export async function getTips(params: {
  category?: GuideCategory;
  difficulty?: TipDifficulty;
  page?: number;
  limit?: number;
}): Promise<{ tips: TipListItem[]; total: number }> {
  const { category, difficulty, page = 1, limit = 50 } = params;
  const skip = (page - 1) * limit;

  const where = {
    isPublished: true,
    ...(category ? { category } : {}),
    ...(difficulty ? { difficulty } : {}),
  };

  const [tips, total] = await Promise.all([
    prisma.tip.findMany({
      where,
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        difficulty: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.tip.count({ where }),
  ]);

  return { tips, total };
}

export async function getTipsRandom(count: number = 5): Promise<TipListItem[]> {
  // Obtener todos los tips publicados y seleccionar aleatoriamente
  const allTips = await prisma.tip.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      title: true,
      content: true,
      category: true,
      difficulty: true,
    },
  });

  // Fisher-Yates shuffle parcial para los primeros N elementos
  const shuffled = [...allTips];
  const end = Math.min(count, shuffled.length);
  for (let i = 0; i < end; i++) {
    const j = i + Math.floor(Math.random() * (shuffled.length - i));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j] as TipListItem;
    shuffled[j] = temp as TipListItem;
  }

  return shuffled.slice(0, end);
}

export async function getTipOfDay(): Promise<TipListItem | null> {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );

  const totalTips = await prisma.tip.count({ where: { isPublished: true } });
  if (totalTips === 0) return null;

  const offset = dayOfYear % totalTips;

  const tips = await prisma.tip.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      title: true,
      content: true,
      category: true,
      difficulty: true,
    },
    orderBy: { id: 'asc' },
    skip: offset,
    take: 1,
  });

  return tips[0] ?? null;
}

export async function getTipCategoryCounts(): Promise<Record<GuideCategory, number>> {
  const counts = await prisma.tip.groupBy({
    by: ['category'],
    where: { isPublished: true },
    _count: { id: true },
  });

  const result: Record<string, number> = {
    SENSITIVITY: 0,
    MOVEMENT: 0,
    AIM: 0,
    STRATEGY: 0,
    DEVICE: 0,
    META: 0,
  };

  for (const row of counts) {
    result[row.category] = row._count.id;
  }

  return result as Record<GuideCategory, number>;
}
