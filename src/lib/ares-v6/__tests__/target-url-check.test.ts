import { describe, expect, it } from 'vitest';

import { checkAresV6TargetUrl, redactAresV6TargetUrl } from '../target-url-check';

// ═══════════════════════════════════════════════════════════════
// Fase 3G — target URL contract. Proves the hard gate (HTTPS, no localhost/
// loopback, no embedded creds, no secret query/fragment) and that the redacted
// output never carries a secret value.
// ═══════════════════════════════════════════════════════════════

describe('checkAresV6TargetUrl', () => {
  it('accepts a valid HTTPS preview URL', () => {
    const result = checkAresV6TargetUrl('https://ares-v6-preview.vercel.app/internal/ares-v6');
    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.redactedTargetUrl).toBe('https://ares-v6-preview.vercel.app/internal/ares-v6');
  });

  it('rejects http (must be HTTPS)', () => {
    const result = checkAresV6TargetUrl('http://ares-v6-preview.vercel.app');
    expect(result.passed).toBe(false);
    expect(result.errors.join(' ')).toMatch(/HTTPS/);
  });

  it('rejects localhost', () => {
    expect(checkAresV6TargetUrl('https://localhost:3000/internal/ares-v6').passed).toBe(false);
  });

  it('rejects 127.0.0.1', () => {
    expect(checkAresV6TargetUrl('https://127.0.0.1/internal/ares-v6').passed).toBe(false);
  });

  it('rejects 0.0.0.0', () => {
    expect(checkAresV6TargetUrl('https://0.0.0.0/internal').passed).toBe(false);
  });

  it('rejects a URL with embedded user:pass credentials', () => {
    const result = checkAresV6TargetUrl('https://user:pass@ares-v6-preview.vercel.app');
    expect(result.passed).toBe(false);
    expect(result.errors.join(' ')).toMatch(/credenciales/i);
  });

  it('rejects a ?token= query', () => {
    expect(checkAresV6TargetUrl('https://ares-v6-preview.vercel.app/?token=abc123').passed).toBe(false);
  });

  it('rejects a ?secret= query', () => {
    expect(checkAresV6TargetUrl('https://ares-v6-preview.vercel.app/?secret=shh').passed).toBe(false);
  });

  it('rejects a ?bearer= / ?session= query', () => {
    expect(checkAresV6TargetUrl('https://x.vercel.app/?bearer=abc').passed).toBe(false);
    expect(checkAresV6TargetUrl('https://x.vercel.app/?session=abc').passed).toBe(false);
  });

  it('rejects an unparseable URL', () => {
    expect(checkAresV6TargetUrl('not a url').passed).toBe(false);
  });

  it('treats an absent targetUrl as a warning (dry-run) unless required', () => {
    const dryRun = checkAresV6TargetUrl(null);
    expect(dryRun.present).toBe(false);
    expect(dryRun.passed).toBe(true);
    expect(dryRun.warnings.length).toBeGreaterThan(0);

    const required = checkAresV6TargetUrl('', { requireForRealMode: true });
    expect(required.passed).toBe(false);
    expect(required.errors.join(' ')).toMatch(/obligatorio/i);
  });

  it('redacted output never contains a sensitive query value', () => {
    const secret = 'SUPERSECRETTOKENVALUE';
    const result = checkAresV6TargetUrl(`https://x.vercel.app/internal?token=${secret}`);
    expect(result.redactedTargetUrl).not.toContain(secret);
    expect(JSON.stringify(result)).not.toContain(secret);
    expect(redactAresV6TargetUrl(`https://x.vercel.app/internal?token=${secret}`)).toBe(
      'https://x.vercel.app/internal?[redacted]',
    );
  });

  it('redaction strips embedded credentials', () => {
    const redacted = redactAresV6TargetUrl('https://user:hunter2@x.vercel.app/internal');
    expect(redacted).toBe('https://x.vercel.app/internal');
    expect(redacted).not.toContain('hunter2');
  });
});
