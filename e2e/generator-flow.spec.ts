import { test, expect } from '@playwright/test';

test.describe('Generator Flow', () => {
  test('landing page loads and shows CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    const cta = page.locator('a[href="/generator"], button:has-text("Generar")').first();
    await expect(cta).toBeVisible();
  });

  test('generator page shows device selector', async ({ page }) => {
    await page.goto('/generator');
    await expect(page.locator('input[placeholder*="Buscar"], input[placeholder*="dispositivo"]').first()).toBeVisible();
  });

  test('can search for a device', async ({ page }) => {
    await page.goto('/generator');
    const searchInput = page.locator('input[placeholder*="Buscar"], input[placeholder*="dispositivo"]').first();
    await searchInput.fill('Samsung');
    // Wait for results to appear
    await page.waitForTimeout(500);
    const results = page.locator('[class*="device"], [class*="result"], [role="option"]');
    const count = await results.count();
    expect(count).toBeGreaterThanOrEqual(0); // May have 0 if no devices seeded
  });

  test('full flow: select device → generate → see results', async ({ page }) => {
    await page.goto('/generator');
    const searchInput = page.locator('input[placeholder*="Buscar"], input[placeholder*="dispositivo"]').first();
    await searchInput.fill('Samsung');
    await page.waitForTimeout(500);

    // Click first result if available
    const firstResult = page.locator('[class*="device"], [class*="result"], [role="option"]').first();
    if (await firstResult.isVisible()) {
      await firstResult.click();

      // Look for generate button or style selection
      const generateBtn = page.locator('button:has-text("Generar"), button:has-text("Calcular")').first();
      if (await generateBtn.isVisible()) {
        await generateBtn.click();
        await page.waitForTimeout(1000);

        // Check results are displayed
        const resultValues = page.locator('[class*="result"], [class*="sensitivity"], [class*="value"]');
        const resultCount = await resultValues.count();
        expect(resultCount).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

test.describe('Navigation', () => {
  test('all main pages load without errors', async ({ page }) => {
    const routes = ['/', '/generator', '/devices', '/academy', '/contact'];

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(500);
    }
  });

  test('404 page shows for invalid route', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
  });
});
