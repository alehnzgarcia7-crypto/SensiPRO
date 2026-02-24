import { randomBytes, createHmac } from 'crypto';

const CSRF_SECRET = process.env.NEXTAUTH_SECRET ?? 'csrf-fallback-secret';

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  const token = randomBytes(32).toString('hex');
  const hmac = createHmac('sha256', CSRF_SECRET).update(token).digest('hex');
  return `${token}.${hmac}`;
}

/**
 * Verify a CSRF token
 */
export function verifyCsrfToken(csrfToken: string): boolean {
  const parts = csrfToken.split('.');
  if (parts.length !== 2) return false;

  const [token, providedHmac] = parts;
  if (!token || !providedHmac) return false;

  const expectedHmac = createHmac('sha256', CSRF_SECRET).update(token).digest('hex');

  // Timing-safe comparison
  if (expectedHmac.length !== providedHmac.length) return false;

  let mismatch = 0;
  for (let i = 0; i < expectedHmac.length; i++) {
    mismatch |= expectedHmac.charCodeAt(i) ^ providedHmac.charCodeAt(i);
  }

  return mismatch === 0;
}
