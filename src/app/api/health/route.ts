import { prisma } from '@ares/database';
import { NextResponse } from 'next/server';


export async function GET(): Promise<NextResponse> {
  const checks: Record<string, string> = {};
  const start = Date.now();

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  // Redis check (optional)
  try {
    if (process.env.REDIS_URL) {
      const { default: Redis } = await import('ioredis');
      const redis = new Redis(process.env.REDIS_URL, { connectTimeout: 2000 });
      await redis.ping();
      await redis.quit();
      checks.redis = 'ok';
    } else {
      checks.redis = 'not_configured';
    }
  } catch {
    checks.redis = 'error';
  }

  const responseTime = Date.now() - start;
  const healthy = checks.database === 'ok';

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version ?? '1.0.0',
      checks,
    },
    { status: healthy ? 200 : 503 },
  );
}
