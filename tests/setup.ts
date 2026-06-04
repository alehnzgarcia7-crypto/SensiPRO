import { beforeAll, afterAll } from 'vitest';

// Variables de entorno para tests — no se usa .env real
beforeAll(() => {
  (process.env as Record<string, string>).NODE_ENV = 'test';
  // Defaults only — a real env (CI service containers, local smoke) wins so the
  // real-infra smoke can point at actual Postgres/Redis.
  process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/ares_test';
  process.env.REDIS_URL ??= 'redis://localhost:6379';
  process.env.NEXTAUTH_SECRET = 'test-secret-that-is-at-least-32-chars-long';
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  process.env.NEXT_PUBLIC_APP_NAME = 'Sensibilidades PRO Test';
  process.env.RATE_LIMIT_FREE = '5';
  process.env.RATE_LIMIT_PREMIUM = '9999';
  process.env.RATE_LIMIT_WINDOW = '86400';
});

afterAll(() => {
  // Cleanup de recursos globales si aplica
});
