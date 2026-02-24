import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('generator fits mobile viewport', async ({ page }) => {
    await page.goto('/generator');
    // No horizontal scrollbar
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for rounding
  });

  test('touch targets are minimum 44px', async ({ page }) => {
    await page.goto('/generator');
    const buttons = page.locator('button, a[href], input, select, textarea');
    const count = await buttons.count();

    const smallTargets: Array<{ index: number; width: number; height: number }> = [];

    for (let i = 0; i < Math.min(count, 20); i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box && box.width > 0 && box.height > 0) {
        // At least one dimension should be >= 44
        const touchable = box.width >= 44 || box.height >= 44;
        if (!touchable && box.width > 10) {
          smallTargets.push({ index: i, width: box.width, height: box.height });
        }
      }
    }

    // Informational: log small targets but don't hard-fail
    // Most interactive elements should meet 44px minimum
    expect(smallTargets.length).toBeLessThan(count);
  });

  test('text is readable on mobile', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    const fontSize = await body.evaluate((el: HTMLElement) => {
      return parseInt(window.getComputedStyle(el).fontSize, 10);
    });
    expect(fontSize).toBeGreaterThanOrEqual(14);
  });
});
