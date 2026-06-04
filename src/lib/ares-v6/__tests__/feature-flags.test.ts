import { afterEach, describe, expect, it } from 'vitest';

import {
  isAresV6ApiEnabled,
  isAresV6FeedbackWriteEnabled,
  isAresV6LabMode,
} from '../feature-flags';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Feature flag behaviour
// ═══════════════════════════════════════════════════════════════

const snapshot = new Map<string, string | undefined>();

function setFlag(name: string, value: string | undefined): void {
  if (!snapshot.has(name)) snapshot.set(name, process.env[name]);
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

afterEach(() => {
  for (const [name, value] of snapshot) {
    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }
  snapshot.clear();
});

describe('ARES v6 feature flags', () => {
  it('defaults to false when the env var is undefined', () => {
    setFlag('ARES_V6_API_ENABLED', undefined);
    expect(isAresV6ApiEnabled()).toBe(false);
  });

  it('is false for the string "false"', () => {
    setFlag('ARES_V6_API_ENABLED', 'false');
    expect(isAresV6ApiEnabled()).toBe(false);
  });

  it('is true only for the exact string "true"', () => {
    setFlag('ARES_V6_API_ENABLED', 'true');
    expect(isAresV6ApiEnabled()).toBe(true);
  });

  it('is false for truthy-but-not-"true" values', () => {
    for (const value of ['TRUE', '1', 'yes', 'on', ' true ']) {
      setFlag('ARES_V6_API_ENABLED', value);
      expect(isAresV6ApiEnabled()).toBe(false);
    }
  });

  it('maps each flag to its own env var', () => {
    setFlag('ARES_V6_API_ENABLED', 'true');
    setFlag('ARES_V6_LAB_MODE', 'false');
    setFlag('ARES_V6_WRITE_FEEDBACK', 'true');

    expect(isAresV6ApiEnabled()).toBe(true);
    expect(isAresV6LabMode()).toBe(false);
    expect(isAresV6FeedbackWriteEnabled()).toBe(true);
  });
});
