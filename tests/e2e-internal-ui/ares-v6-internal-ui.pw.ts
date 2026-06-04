import { expect, test } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Hidden internal UI browser smoke (Fase 3F). MANUAL / on-demand.
//
// The webServer (playwright.internal-ui.config.ts) boots `next dev` with
// ARES_V6_INTERNAL_UI_ENABLED=true (LAB mode). These checks validate the real
// rendered page: required sections, selector interactivity, NO dangerous
// controls, NO secret leak. Flag-OFF stealth (404) is covered by the always-on
// SSR smoke + the env-gated guard (no browser needed for that).
// ═══════════════════════════════════════════════════════════════

const ROUTE = '/internal/ares-v6';

test('renders the read-only command lab with its required sections', async ({ page }) => {
  await page.goto(ROUTE);
  await expect(page.getByText('SensiPRO Command Lab')).toBeVisible();
  for (const text of [
    'Consola de generación',
    'Cobertura de EVIDENCIA',
    'Cobertura de COMPARACIÓN',
    'Riesgo estructural',
    'Nunca auto-aplicar',
  ]) {
    await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
  }
});

test('the fixture/preset selectors are present and selectable', async ({ page }) => {
  await page.goto(ROUTE);
  const selects = page.locator('select');
  await expect(selects).toHaveCount(2);
  // Switch the preset; the action must complete without a client error.
  await selects.nth(1).selectOption({ index: 1 });
  await expect(page.getByText('Generación ARES v6', { exact: false }).first()).toBeVisible();
});

test('exposes no apply/publish/approve/recalibrate/public-feedback control', async ({ page }) => {
  await page.goto(ROUTE);
  for (const re of [/aplicar propuesta/i, /\bpublicar\b/i, /\baprobar\b/i, /recalibrar/i, /feedback p[uú]blico/i]) {
    await expect(page.getByRole('button', { name: re })).toHaveCount(0);
  }
});

test('does not leak any token / secret into the page', async ({ page }) => {
  await page.goto(ROUTE);
  const content = await page.content();
  expect(content).not.toMatch(/sha256/i);
  expect(content).not.toContain('x-ares-v6-lab-token');
  expect(content).not.toContain('DATABASE_URL');
  expect(content).not.toContain('REDIS_URL');
  expect(content).not.toMatch(/\b[a-f0-9]{64}\b/);
});
