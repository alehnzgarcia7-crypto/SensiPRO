import { create } from 'zustand';
import type { SensitivityStyle, DeviceTier } from '@prisma/client';

// ═══════════════════════════════════════════════════════════════
// Zustand store para el flujo del generador de sensibilidades
// 3 pasos: marca → modelo → estilo → resultado
// ═══════════════════════════════════════════════════════════════

interface SelectedDevice {
  id: string;
  brand: string;
  model: string;
  slug: string;
  tier: DeviceTier;
  screenHz: number;
  ramGb: number;
}

interface GeneratorResult {
  sensitivity: {
    general: number;
    redPoint: number;
    scope2x: number;
    scope4x: number;
    sniperScope: number;
    freeView: number;
  };
  gyroscope: {
    gyroGeneral: number;
    gyroRedPoint: number;
    gyroScope2x: number;
    gyroScope4x: number;
    gyroSniper: number;
    gyroFreeView: number;
  } | null;
  meta: {
    performanceScore: number;
    styleApplied: SensitivityStyle;
    deviceTier: DeviceTier;
    algorithm: string;
  };
}

interface GeneratorStore {
  step: 1 | 2 | 3;
  selectedBrand: string | null;
  selectedDevice: SelectedDevice | null;
  selectedStyle: SensitivityStyle;
  includeGyro: boolean;
  result: GeneratorResult | null;
  isLoading: boolean;
  error: string | null;

  selectBrand: (brand: string) => void;
  selectDevice: (device: SelectedDevice) => void;
  selectStyle: (style: SensitivityStyle) => void;
  setIncludeGyro: (value: boolean) => void;
  setResult: (result: GeneratorResult) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  goBack: () => void;
}

const initialState = {
  step: 1 as const,
  selectedBrand: null,
  selectedDevice: null,
  selectedStyle: 'BALANCED' as SensitivityStyle,
  includeGyro: false,
  result: null,
  isLoading: false,
  error: null,
};

export const useGeneratorStore = create<GeneratorStore>((set) => ({
  ...initialState,

  selectBrand: (brand) => set({ selectedBrand: brand, step: 2, selectedDevice: null, result: null }),
  selectDevice: (device) => set({ selectedDevice: device, step: 3, result: null }),
  selectStyle: (style) => set({ selectedStyle: style }),
  setIncludeGyro: (value) => set({ includeGyro: value }),
  setResult: (result) => set({ result, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading, error: null }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set(initialState),
  goBack: () =>
    set((state) => {
      if (state.step === 3) return { step: 2, result: null };
      if (state.step === 2) return { step: 1, selectedBrand: null, selectedDevice: null, result: null };
      return state;
    }),
}));
