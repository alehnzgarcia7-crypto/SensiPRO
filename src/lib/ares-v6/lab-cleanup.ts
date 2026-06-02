// ═══════════════════════════════════════════════════════════════
// ARES v6 — Lab data cleanup (Fase 3C)
//
// Retention: generations 90d, feedback 180d (env-overridable). Lab run
// summaries are KEPT. Pure cutoff math + injectable DB deps so the dry-run and
// execute paths are unit-testable. No automatic cron — invoked manually.
// ═══════════════════════════════════════════════════════════════

export const ARES_V6_DEFAULT_GENERATION_RETENTION_DAYS = 90;
export const ARES_V6_DEFAULT_FEEDBACK_RETENTION_DAYS = 180;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface AresV6CleanupConfig {
  generationRetentionDays: number;
  feedbackRetentionDays: number;
}

function parsePositiveInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export function getAresV6CleanupConfig(): AresV6CleanupConfig {
  return {
    generationRetentionDays: parsePositiveInt(
      'ARES_V6_GENERATION_RETENTION_DAYS',
      ARES_V6_DEFAULT_GENERATION_RETENTION_DAYS,
    ),
    feedbackRetentionDays: parsePositiveInt(
      'ARES_V6_FEEDBACK_RETENTION_DAYS',
      ARES_V6_DEFAULT_FEEDBACK_RETENTION_DAYS,
    ),
  };
}

export function computeAresV6CleanupCutoffs(
  nowMs: number,
  config: AresV6CleanupConfig,
): { generationsBefore: Date; feedbackBefore: Date } {
  return {
    generationsBefore: new Date(nowMs - config.generationRetentionDays * DAY_MS),
    feedbackBefore: new Date(nowMs - config.feedbackRetentionDays * DAY_MS),
  };
}

export interface AresV6CleanupDeps {
  countGenerationsBefore(date: Date): Promise<number>;
  countFeedbackBefore(date: Date): Promise<number>;
  deleteGenerationsBefore(date: Date): Promise<number>;
  deleteFeedbackBefore(date: Date): Promise<number>;
}

export interface AresV6CleanupResult {
  dryRun: boolean;
  generations: number;
  feedback: number;
  cutoffs: { generationsBefore: string; feedbackBefore: string };
}

async function defaultCountGenerations(date: Date): Promise<number> {
  const { prisma } = await import('@ares/database');
  return prisma.aresV6Generation.count({ where: { createdAt: { lt: date } } });
}
async function defaultCountFeedback(date: Date): Promise<number> {
  const { prisma } = await import('@ares/database');
  return prisma.aresV6Feedback.count({ where: { createdAt: { lt: date } } });
}
async function defaultDeleteGenerations(date: Date): Promise<number> {
  const { prisma } = await import('@ares/database');
  const result = await prisma.aresV6Generation.deleteMany({ where: { createdAt: { lt: date } } });
  return result.count;
}
async function defaultDeleteFeedback(date: Date): Promise<number> {
  const { prisma } = await import('@ares/database');
  const result = await prisma.aresV6Feedback.deleteMany({ where: { createdAt: { lt: date } } });
  return result.count;
}

const DEFAULT_DEPS: AresV6CleanupDeps = {
  countGenerationsBefore: defaultCountGenerations,
  countFeedbackBefore: defaultCountFeedback,
  deleteGenerationsBefore: defaultDeleteGenerations,
  deleteFeedbackBefore: defaultDeleteFeedback,
};

export async function runAresV6LabCleanup(
  options: { dryRun: boolean; nowMs: number; config?: AresV6CleanupConfig },
  deps: AresV6CleanupDeps = DEFAULT_DEPS,
): Promise<AresV6CleanupResult> {
  const config = options.config ?? getAresV6CleanupConfig();
  const cutoffs = computeAresV6CleanupCutoffs(options.nowMs, config);

  const [generations, feedback] = options.dryRun
    ? await Promise.all([
        deps.countGenerationsBefore(cutoffs.generationsBefore),
        deps.countFeedbackBefore(cutoffs.feedbackBefore),
      ])
    : await Promise.all([
        deps.deleteGenerationsBefore(cutoffs.generationsBefore),
        deps.deleteFeedbackBefore(cutoffs.feedbackBefore),
      ]);

  return {
    dryRun: options.dryRun,
    generations,
    feedback,
    cutoffs: {
      generationsBefore: cutoffs.generationsBefore.toISOString(),
      feedbackBefore: cutoffs.feedbackBefore.toISOString(),
    },
  };
}
