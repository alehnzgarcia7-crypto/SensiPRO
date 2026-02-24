import { NextResponse } from 'next/server';

import { handleApiError, NotFoundError } from '@ares/errors';

import { requireRole } from '@/lib/auth/auth.middleware';
import { getExperimentResults } from '@/lib/ab-testing/ab-engine';

// GET /api/admin/ab-tests/:key/results — Resultados de un experimento
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    await requireRole('ADMIN');

    const { key } = await params;
    const results = await getExperimentResults(key);

    if (!results) {
      throw new NotFoundError('Experiment', key);
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    return handleApiError(error);
  }
}
