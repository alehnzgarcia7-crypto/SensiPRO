import { defineConfig, devices } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Internal UI smoke config (Fase 3F). MANUAL / on-demand.
//
// Isolated from the main playwright.config.ts (testDir ./e2e): this one only
// runs *.pw.ts under tests/e2e-internal-ui (so vitest's *.spec/*.test globs never
// pick it up), and boots a dev server with the hidden UI flag ON. Not part of
// the PR gate — runs via `npm run ares:v6:ui:smoke` and the 3F manual workflow.
// ═══════════════════════════════════════════════════════════════

export default defineConfig({
  testDir: './tests/e2e-internal-ui',
  testMatch: '**/*.pw.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'ares-v6-ui-smoke.json' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/internal/ares-v6',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      ARES_V6_INTERNAL_UI_ENABLED: 'true',
      // dev (non-production) ⇒ LAB mode; no ALLOW_PRODUCTION ack needed.
      NODE_ENV: 'development',
    },
  },
});
