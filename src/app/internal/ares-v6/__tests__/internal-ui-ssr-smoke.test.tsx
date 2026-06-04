import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import { AresV6LabShell } from '@/components/ares-v6-lab';
import type { AresV6PreviewResult } from '@/lib/ares-v6/internal-preview-service';
import {
  assertCanViewAresV6InternalUi,
  getAresV6InternalUiAccessState,
  maybeGetAresV6InternalUiOperatorContext,
} from '@/lib/ares-v6/internal-ui-access';
import { getAresV6InternalDashboardData } from '@/lib/ares-v6/internal-ui-service';

import AresV6InternalNotFound from '../not-found';

// ═══════════════════════════════════════════════════════════════
// Fase 3F — SSR smoke for the hidden internal UI (always-on, no browser needed).
// Mirrors the Playwright browser smoke at the React level: flag-off stealth,
// flag-on render, no dangerous controls, no secret leak. The browser-level
// Playwright smoke runs in the manual 3F workflow.
// ═══════════════════════════════════════════════════════════════

const snapshot = new Map<string, string | undefined>();
function setEnv(name: string, value: string | undefined): void {
  if (!snapshot.has(name)) snapshot.set(name, process.env[name]);
  if (value === undefined) delete process.env[name];
  else (process.env as Record<string, string | undefined>)[name] = value;
}
function setNodeEnv(value: string): void {
  if (!snapshot.has('NODE_ENV')) snapshot.set('NODE_ENV', process.env.NODE_ENV);
  (process.env as Record<string, string>).NODE_ENV = value;
}
afterEach(() => {
  for (const [name, value] of snapshot) {
    if (value === undefined) delete process.env[name];
    else (process.env as Record<string, string | undefined>)[name] = value;
  }
  snapshot.clear();
});

const NOW = () => 1_717_000_000_000;

describe('flag off → stealth', () => {
  it('blocks access and the 404 never reveals the lab', () => {
    setEnv('ARES_V6_INTERNAL_UI_ENABLED', undefined);
    expect(getAresV6InternalUiAccessState().ok).toBe(false);

    let denied = false;
    try {
      assertCanViewAresV6InternalUi((() => {
        denied = true;
        throw new Error('denied');
      }) as () => never);
    } catch {
      /* expected */
    }
    expect(denied).toBe(true);

    const notFound = renderToStaticMarkup(<AresV6InternalNotFound />);
    expect(notFound).toContain('Página no encontrada');
    expect(notFound).not.toContain('ARES v6');
    expect(notFound).not.toContain('Command Lab');
  });
});

describe('flag on → render', () => {
  it('renders the lab with the required sections, no dangerous controls, no secrets', async () => {
    setEnv('ARES_V6_INTERNAL_UI_ENABLED', 'true');
    setEnv('ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256', 'a'.repeat(64));
    setNodeEnv('test');

    const data = await getAresV6InternalDashboardData({ now: NOW });
    const operator = maybeGetAresV6InternalUiOperatorContext();
    expect(operator).not.toBeNull();

    const previewAction = async (): Promise<AresV6PreviewResult> => ({ ok: true, preview: data.preview });
    const markup = renderToStaticMarkup(
      <AresV6LabShell data={data} operator={operator!} previewAction={previewAction} />,
    );

    for (const text of [
      'SensiPRO Command Lab',
      'Consola de generación',
      'Cobertura de EVIDENCIA',
      'Cobertura de COMPARACIÓN',
      'Riesgo estructural',
      'Nunca auto-aplicar',
    ]) {
      expect(markup).toContain(text);
    }

    // No write/apply/publish/approve/recalibrate controls.
    expect(markup).not.toMatch(/aplicar propuesta/i);
    expect(markup).not.toMatch(/\bpublicar\b/i);
    expect(markup).not.toMatch(/\baprobar\b/i);
    expect(markup).not.toMatch(/recalibrar/i);
    expect(markup).not.toMatch(/feedback p[uú]blico/i);

    // No secret leak.
    expect(markup).not.toMatch(/sha256/i);
    expect(markup).not.toMatch(/bearer /i);
    expect(markup).not.toContain('x-ares-v6-lab-token');
    expect(markup).not.toContain('a'.repeat(64));
    expect(markup).not.toMatch(/\b[a-f0-9]{64}\b/);
  });
});
