import { prisma } from '@ares/database';

interface UTMParams {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  term: string | null;
}

export function parseUTMParams(url: string): UTMParams {
  const params = new URL(url).searchParams;
  return {
    source: params.get('utm_source'),
    medium: params.get('utm_medium'),
    campaign: params.get('utm_campaign'),
    content: params.get('utm_content'),
    term: params.get('utm_term'),
  };
}

export async function trackUTMSignup(userId: string, utm: UTMParams): Promise<void> {
  if (!utm.source) return;

  await prisma.uTMTracking.create({
    data: {
      userId,
      source: utm.source,
      medium: utm.medium,
      campaign: utm.campaign,
      content: utm.content,
      term: utm.term,
    },
  });
}

interface UTMSourceCount {
  source: string;
  _count: { source: number };
}

interface UTMCampaignCount {
  campaign: string | null;
  _count: { campaign: number };
}

interface UTMAnalytics {
  bySource: UTMSourceCount[];
  byCampaign: UTMCampaignCount[];
}

export async function getUTMAnalytics(): Promise<UTMAnalytics> {
  const bySource = await prisma.uTMTracking.groupBy({
    by: ['source'],
    _count: { source: true },
    orderBy: { _count: { source: 'desc' } },
  });

  const byCampaign = await prisma.uTMTracking.groupBy({
    by: ['campaign'],
    where: { campaign: { not: null } },
    _count: { campaign: true },
    orderBy: { _count: { campaign: 'desc' } },
  });

  return { bySource, byCampaign };
}
