import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().optional().default('redis://localhost:6379'),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Sensibilidades PRO'),
  RATE_LIMIT_FREE: z.coerce.number().default(5),
  RATE_LIMIT_PREMIUM: z.coerce.number().default(9999),
  RATE_LIMIT_WINDOW: z.coerce.number().default(86400),
  MP_PUBLIC_KEY: z.string().optional(),
  MP_ACCESS_TOKEN: z.string().optional(),
  STRIPE_PUBLIC_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function validateEnv(): Env {
  if (cachedEnv) return cachedEnv;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment variables:\n${errors}`);
  }
  cachedEnv = parsed.data;
  return cachedEnv;
}

export const env = new Proxy({} as Env, {
  get(_, prop: string) {
    const validated = validateEnv();
    return validated[prop as keyof Env];
  },
});
