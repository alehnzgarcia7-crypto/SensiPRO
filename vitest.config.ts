import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  // React 18 automatic JSX runtime so .tsx component render tests (Fase 3E) work
  // under environment: 'node' via react-dom/server, with no new test dependency.
  esbuild: { jsx: 'automatic' },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'dist', '.next', '**/*.test.ts', '**/types/**'],
    },
    include: ['**/*.test.ts', '**/*.spec.ts', '**/*.test.tsx', '**/*.spec.tsx'],
    exclude: ['node_modules', 'dist', '.next', 'tests/e2e'],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@ares/database': path.resolve(__dirname, 'packages/database/src'),
      '@ares/algorithms/engine-v6': path.resolve(__dirname, 'packages/algorithms/src/engine-v6'),
      '@ares/algorithms': path.resolve(__dirname, 'packages/algorithms/src'),
      '@ares/types': path.resolve(__dirname, 'packages/types/src'),
      '@ares/utils': path.resolve(__dirname, 'packages/utils/src'),
      '@ares/errors': path.resolve(__dirname, 'packages/errors/src'),
      '@ares/logger': path.resolve(__dirname, 'packages/logger/src'),
      '@ares/config': path.resolve(__dirname, 'packages/config/src'),
    },
  },
});
