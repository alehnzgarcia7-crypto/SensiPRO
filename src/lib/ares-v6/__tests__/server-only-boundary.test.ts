import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

// ═══════════════════════════════════════════════════════════════
// Fase 3F.1 — server-only seal boundary. Static proof that (a) the critical
// server modules carry the `import 'server-only'` marker, and (b) no Client
// Component runtime-imports any of them (only `import type` is allowed). This is
// the test the Task-1 acceptance criteria call for; tsc + Next's build enforce
// the rest.
// ═══════════════════════════════════════════════════════════════

const ROOT = process.cwd();
const LIB_DIR = join(ROOT, 'src/lib/ares-v6');

const SERVER_ONLY_MODULES = [
  'internal-ui-flags',
  'internal-ui-access',
  'internal-ui-service',
  'internal-preview-service',
  'internal-ui-readiness',
  'human-review-session',
  'human-review-cli',
  'generation-persistence',
  'feedback-service',
  'lab-metrics',
  'evidence-route-service',
  'evidence-snapshot',
];

function isClientComponent(source: string): boolean {
  // A real directive is the first statement, ignoring leading comments/blank lines.
  for (const raw of source.split('\n')) {
    const line = raw.trim();
    if (line === '' || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) continue;
    return line === "'use client';" || line === '"use client";';
  }
  return false;
}

function collectTsx(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectTsx(full));
    else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) out.push(full);
  }
  return out;
}

describe('server-only marker present', () => {
  it.each(SERVER_ONLY_MODULES)('%s imports server-only', (mod) => {
    const source = readFileSync(join(LIB_DIR, `${mod}.ts`), 'utf8');
    expect(source).toMatch(/^import 'server-only';/m);
  });
});

describe('no Client Component runtime-imports a server-only module', () => {
  const files = [
    ...collectTsx(join(ROOT, 'src/components/ares-v6-lab')),
    ...collectTsx(join(ROOT, 'src/app/internal/ares-v6')),
  ].filter((f) => !f.includes('__tests__'));

  const clientFiles = files.filter((f) => isClientComponent(readFileSync(f, 'utf8')));

  it('found the known client components', () => {
    // Sanity: the selector + console are real client components.
    expect(clientFiles.some((f) => f.endsWith('generation-console.tsx'))).toBe(true);
    expect(clientFiles.some((f) => f.endsWith('fixture-preset-selector.tsx'))).toBe(true);
  });

  it.each(SERVER_ONLY_MODULES)('no runtime import of %s from a client component', (mod) => {
    const importRe = new RegExp(`^import\\s+(?!type\\b)[^\\n]*from\\s+'[^']*${mod}'`, 'm');
    for (const file of clientFiles) {
      const source = readFileSync(file, 'utf8');
      expect(source, `${file} runtime-imports ${mod}`).not.toMatch(importRe);
    }
  });
});
