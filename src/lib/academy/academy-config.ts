import type { GuideCategory } from '@prisma/client';
import { Crosshair, Move, Brain, Smartphone, Swords } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CategoryConfig {
  key: GuideCategory;
  name: string;
  nameEs: string;
  description: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
  headerGradient: string;
  slug: string;
}

export const CATEGORY_CONFIGS: Record<GuideCategory, CategoryConfig> = {
  SENSITIVITY: {
    key: 'SENSITIVITY',
    name: 'Sensitivity',
    nameEs: 'Sensibilidad',
    description: 'Aprende a configurar la sensibilidad perfecta para tu estilo de juego',
    icon: Crosshair,
    color: '#f97316',
    gradient: 'from-fire-500 to-fire-600',
    headerGradient: 'radial-gradient(ellipse at center, #f97316, #c2410c)',
    slug: 'sensibilidad',
  },
  MOVEMENT: {
    key: 'MOVEMENT',
    name: 'Movement',
    nameEs: 'Movimiento',
    description: 'Domina el movimiento avanzado: gloo walls, saltos, agachadas rápidas',
    icon: Move,
    color: '#06b6d4',
    gradient: 'from-ice-500 to-ice-600',
    headerGradient: 'radial-gradient(ellipse at center, #06b6d4, #0284c7)',
    slug: 'movimiento',
  },
  AIM: {
    key: 'AIM',
    name: 'Aim',
    nameEs: 'Puntería',
    description: 'Mejora tu aim con técnicas de tracking, flicking y pre-aim',
    icon: Crosshair,
    color: '#ef4444',
    gradient: 'from-red-500 to-red-600',
    headerGradient: 'radial-gradient(ellipse at center, #ef4444, #991b1b)',
    slug: 'punteria',
  },
  STRATEGY: {
    key: 'STRATEGY',
    name: 'Strategy',
    nameEs: 'Estrategia',
    description: 'Estrategias de rotación, posicionamiento y toma de decisiones',
    icon: Brain,
    color: '#a855f7',
    gradient: 'from-purple-500 to-purple-600',
    headerGradient: 'radial-gradient(ellipse at center, #a855f7, #7c3aed)',
    slug: 'estrategia',
  },
  DEVICE: {
    key: 'DEVICE',
    name: 'Device',
    nameEs: 'Dispositivo',
    description: 'Optimiza tu dispositivo: gráficos, FPS, batería, temperatura',
    icon: Smartphone,
    color: '#22c55e',
    gradient: 'from-green-500 to-green-600',
    headerGradient: 'radial-gradient(ellipse at center, #22c55e, #059669)',
    slug: 'dispositivo',
  },
  META: {
    key: 'META',
    name: 'Meta',
    nameEs: 'Meta Actual',
    description: 'Análisis del meta actual: mejores armas, personajes y combos',
    icon: Swords,
    color: '#eab308',
    gradient: 'from-yellow-500 to-yellow-600',
    headerGradient: 'radial-gradient(ellipse at center, #eab308, #d97706)',
    slug: 'meta',
  },
};

export const CATEGORIES_ORDER: GuideCategory[] = [
  'SENSITIVITY',
  'AIM',
  'MOVEMENT',
  'STRATEGY',
  'DEVICE',
  'META',
];

export const ACADEMY_LIMITS = {
  FREE: { maxGuides: 5, canAccessPremiumGuides: false, canAccessPremiumSections: false },
  PREMIUM: { maxGuides: 15, canAccessPremiumGuides: true, canAccessPremiumSections: true },
  VIP: { maxGuides: 9999, canAccessPremiumGuides: true, canAccessPremiumSections: true },
} as const;

export type AcademyTierLimit = typeof ACADEMY_LIMITS[keyof typeof ACADEMY_LIMITS];

export function getAcademyLimits(tier: 'FREE' | 'PREMIUM' | 'VIP'): AcademyTierLimit {
  return ACADEMY_LIMITS[tier];
}

export function canAccessGuide(
  tier: 'FREE' | 'PREMIUM' | 'VIP',
  guideIndex: number,
  isPremiumGuide: boolean,
): boolean {
  const limits = ACADEMY_LIMITS[tier];
  if (isPremiumGuide && !limits.canAccessPremiumGuides) return false;
  if (guideIndex >= limits.maxGuides) return false;
  return true;
}

export function canAccessSection(
  tier: 'FREE' | 'PREMIUM' | 'VIP',
  isPremiumSection: boolean,
): boolean {
  if (!isPremiumSection) return true;
  return ACADEMY_LIMITS[tier].canAccessPremiumSections;
}
