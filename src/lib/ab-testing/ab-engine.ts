import crypto from 'crypto';

import { prisma } from '@ares/database';
import { logger } from '@ares/logger';

// ═══════════════════════════════════════════════════════════════
// ARES — Motor de A/B Testing
// Consistent hashing para asignación determinística de variantes
// ═══════════════════════════════════════════════════════════════

export interface VariantWeight {
  key: string;
  weight: number;
}

export interface ExperimentResult {
  variant: string;
  label: string;
  participants: number;
  conversions: number;
  conversionRate: string;
}

export interface ExperimentSummary {
  experiment: { key: string; name: string; isActive: boolean };
  results: ExperimentResult[];
  totalParticipants: number;
}

/**
 * Asigna deterministicamente un usuario a una variante usando
 * consistent hashing (MD5 de userId:experimentKey)
 */
export function assignVariant(
  userId: string,
  experimentKey: string,
  variants: VariantWeight[],
): string {
  const hash = crypto
    .createHash('md5')
    .update(`${userId}:${experimentKey}`)
    .digest('hex');
  const num = parseInt(hash.slice(0, 8), 16);
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  const target = num % totalWeight;

  let cumulative = 0;
  for (const variant of variants) {
    cumulative += variant.weight;
    if (target < cumulative) return variant.key;
  }

  return variants[0]?.key ?? 'control';
}

/**
 * Obtiene o asigna la variante para un usuario en un experimento
 */
export async function getVariantForUser(
  userId: string,
  experimentKey: string,
): Promise<string | null> {
  const experiment = await prisma.aBExperiment.findUnique({
    where: { key: experimentKey },
    include: { variants: true },
  });

  if (!experiment || !experiment.isActive) return null;

  // Verificar si ya tiene asignación
  const existing = await prisma.aBAssignment.findFirst({
    where: { userId, experimentId: experiment.id },
  });

  if (existing) return existing.variantKey;

  // Asignar nueva variante
  const variants = experiment.variants.map((v) => ({
    key: v.key,
    weight: v.weight,
  }));
  const variantKey = assignVariant(userId, experimentKey, variants);

  await prisma.aBAssignment.create({
    data: {
      userId,
      experimentId: experiment.id,
      variantKey,
    },
  });

  logger.info('AB variant assigned', {
    userId,
    experimentKey,
    variantKey,
  });

  return variantKey;
}

/**
 * Registra un evento de conversión para un A/B test
 */
export async function trackConversion(
  userId: string,
  experimentKey: string,
  eventName: string,
): Promise<boolean> {
  const assignment = await prisma.aBAssignment.findFirst({
    where: {
      userId,
      experiment: { key: experimentKey },
    },
  });

  if (!assignment) return false;

  await prisma.aBConversion.create({
    data: {
      assignmentId: assignment.id,
      eventName,
    },
  });

  logger.info('AB conversion tracked', {
    userId,
    experimentKey,
    eventName,
    variantKey: assignment.variantKey,
  });

  return true;
}

/**
 * Obtiene resultados de un experimento con tasas de conversión por variante
 */
export async function getExperimentResults(
  experimentKey: string,
): Promise<ExperimentSummary | null> {
  const experiment = await prisma.aBExperiment.findUnique({
    where: { key: experimentKey },
    include: {
      variants: true,
      assignments: {
        include: {
          conversions: true,
        },
      },
    },
  });

  if (!experiment) return null;

  const results: ExperimentResult[] = experiment.variants.map((variant) => {
    const assignments = experiment.assignments.filter(
      (a) => a.variantKey === variant.key,
    );
    const conversions = assignments.filter((a) => a.conversions.length > 0);

    return {
      variant: variant.key,
      label: variant.label,
      participants: assignments.length,
      conversions: conversions.length,
      conversionRate:
        assignments.length > 0
          ? ((conversions.length / assignments.length) * 100).toFixed(2)
          : '0.00',
    };
  });

  return {
    experiment: {
      key: experiment.key,
      name: experiment.name,
      isActive: experiment.isActive,
    },
    results,
    totalParticipants: experiment.assignments.length,
  };
}

/**
 * Crea un nuevo experimento con variantes
 */
export async function createExperiment(input: {
  key: string;
  name: string;
  description?: string;
  variants: { key: string; label: string; weight: number }[];
}): Promise<string> {
  const experiment = await prisma.aBExperiment.create({
    data: {
      key: input.key,
      name: input.name,
      description: input.description ?? null,
      variants: {
        create: input.variants.map((v) => ({
          key: v.key,
          label: v.label,
          weight: v.weight,
        })),
      },
    },
  });

  logger.info('AB experiment created', {
    experimentId: experiment.id,
    key: experiment.key,
    variantCount: input.variants.length,
  });

  return experiment.id;
}

/**
 * Activa o desactiva un experimento
 */
export async function toggleExperiment(
  experimentKey: string,
  isActive: boolean,
): Promise<void> {
  await prisma.aBExperiment.update({
    where: { key: experimentKey },
    data: { isActive },
  });

  logger.info('AB experiment toggled', { experimentKey, isActive });
}
