import { describe, expect, it } from 'vitest';

import { buildTuningSteps, generateAresV6, getAresV6CalibrationFixture, getTuningStepForSymptom } from '..';
import type { AresV6GenerationInput, AresV6Symptom } from '..';

// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — Tuning Wizard
// Symptoms must become guided steps, never blind base mutations.
// ═══════════════════════════════════════════════════════════════

function inputWithSymptoms(symptoms: readonly AresV6Symptom[]): AresV6GenerationInput {
  const device = getAresV6CalibrationFixture('redmi-note-13')!.device;
  return {
    device,
    presetId: 'STANDARD_PRO',
    player: {
      fingers: 4,
      playstyle: 'STANDARD',
      mode: 'BATTLE_ROYALE',
      usesGyroscope: false,
      primaryWeaponCategory: 'AR_FAST',
      symptoms,
    },
  };
}

describe('ARES v6 — tuning step shape', () => {
  it('always returns a step with symptom, adjustment, instruction and test protocol', () => {
    const allSymptoms: AresV6Symptom[] = [
      'CROSSHAIR_DOES_NOT_REACH_HEAD',
      'SCOPE_4X_UNCONTROLLABLE',
      'DEVICE_LAGS',
      'GLOO_WALL_SLOW',
      'PHONE_HEATS_UP',
    ];
    for (const symptom of allSymptoms) {
      const step = getTuningStepForSymptom(symptom);
      expect(step.symptom).toBe(symptom);
      expect(step.adjustment).toBeTruthy();
      expect(step.instruction.length).toBeGreaterThan(0);
      expect(step.testProtocol.length).toBeGreaterThan(0);
    }
  });

  it('returns a safe step for a symptom that has no matrix rule', () => {
    const step = getTuningStepForSymptom('GLOO_WALL_SLOW');
    expect(step.instruction.length).toBeGreaterThan(0);
    expect(step.testProtocol.length).toBeGreaterThan(0);
  });
});

describe('ARES v6 — symptom-specific behaviour', () => {
  it('DEVICE_LAGS suggests a fire-button delta and protects 4x/AWM', () => {
    const step = getTuningStepForSymptom('DEVICE_LAGS');
    expect(step.adjustment.fireButtonDelta).toBeGreaterThan(0);
    expect(step.adjustment.scope4x ?? 0).toBeLessThan(0);
    expect(step.adjustment.sniperScope ?? 0).toBeLessThan(0);
    expect(step.adjustment.presetFallback).toBe('LOW_END_STABLE');
  });

  it('SCOPE_4X_UNCONTROLLABLE never touches Red Point', () => {
    const step = getTuningStepForSymptom('SCOPE_4X_UNCONTROLLABLE');
    expect(step.adjustment.redPoint).toBeUndefined();
    expect(step.adjustment.scope4x ?? 0).toBeLessThan(0);
  });

  it('CROSSHAIR_DOES_NOT_REACH_HEAD prioritises Red Point', () => {
    const step = getTuningStepForSymptom('CROSSHAIR_DOES_NOT_REACH_HEAD');
    expect(step.adjustment.redPoint ?? 0).toBeGreaterThan(0);
  });
});

describe('ARES v6 — tuning step list', () => {
  it('caps the first tuning steps at 3 even with more symptoms', () => {
    const steps = buildTuningSteps(
      inputWithSymptoms([
        'CROSSHAIR_DOES_NOT_REACH_HEAD',
        'SCOPE_4X_UNCONTROLLABLE',
        'DEVICE_LAGS',
        'AIM_SHAKES',
        'CANNOT_TURN_FAST',
      ]),
    );
    expect(steps.length).toBe(3);
  });

  it('returns no steps when there are no symptoms', () => {
    expect(buildTuningSteps(inputWithSymptoms([])).length).toBe(0);
  });

  it('does not mutate the base sensitivity when symptoms are present (integration)', () => {
    const clean = generateAresV6(inputWithSymptoms([]));
    const symptomatic = generateAresV6(
      inputWithSymptoms(['CROSSHAIR_DOES_NOT_REACH_HEAD', 'DEVICE_LAGS', 'AIM_SHAKES']),
    );
    expect(symptomatic.sensitivity).toEqual(clean.sensitivity);
    expect(symptomatic.firstTuningSteps.length).toBe(3);
  });
});
