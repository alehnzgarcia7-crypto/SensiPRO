import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'dist', '.next', '**/*.test.ts', '**/types/**'],
    },
    include: ['**/*.test.ts', '**/*.spec.ts'],
    exclude: ['node_modules', 'dist', '.next', 'tests/e2e'],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@ares/database': path.resolve(__dirname, 'packages/database/src'),
      '@ares/algorithms': path.resolve(__dirname, 'packages/algorithms/src'),
      '@ares/types': path.resolve(__dirname, 'packages/types/src'),
      '@ares/utils': path.resolve(__dirname, 'packages/utils/src'),
      '@ares/errors': path.resolve(__dirname, 'packages/errors/src'),
      '@ares/logger': path.resolve(__dirname, 'packages/logger/src'),
      '@ares/config': path.resolve(__dirname, 'packages/config/src'),
    },
  },
});
