import type {
  CalibrationResult,
  HudRecommendation,
  SensitivityOutput,
  GyroscopeOutput,
} from '@ares/algorithms';
import type { SensitivityStyle, DeviceTier, CalibrationLevel, PanelType } from '@prisma/client';
import { create } from 'zustand';


// ═══════════════════════════════════════════════════════════════
// Zustand store para el flujo del generador de sensibilidades
// 3 pasos: marca → modelo → estilo → resultado
// Soporta 6 combinaciones: BAJA/MEDIA/ALTA × sinDPI/conDPI
// ═══════════════════════════════════════════════════════════════

interface SelectedDevice {
  id: string;
  brand: string;
  model: string;
  slug: string;
  tier: DeviceTier;
  screenHz: number;
  ramGb: number;
  screenSize?: number;
  panelType?: PanelType;
}

interface GeneratorResult {
  sensitivity: SensitivityOutput;
  gyroscope: GyroscopeOutput | null;
  meta: {
    performanceScore: number;
    styleApplied: SensitivityStyle;
    deviceTier: DeviceTier;
    algorithm: string;
  };
}

interface AllCalibrationsResult {
  combinations: CalibrationResult[];
  hudRecommendation: HudRecommendation;
  meta: {
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

  // Resultado legacy (single)
  result: GeneratorResult | null;

  // Resultado nuevo (6 combinaciones)
  allCalibrations: AllCalibrationsResult | null;
  calibration: CalibrationLevel;
  dpiMode: boolean;

  // RAM seleccionada por el usuario (override del valor del device)
  userRam: number | null;
  // Hz seleccionado por el usuario (override del valor del device)
  userHz: number | null;

  isLoading: boolean;
  error: string | null;

  // Acciones
  selectBrand: (brand: string) => void;
  selectDevice: (device: SelectedDevice) => void;
  selectStyle: (style: SensitivityStyle) => void;
  setIncludeGyro: (value: boolean) => void;
  setUserRam: (ram: number) => void;
  setUserHz: (hz: number) => void;
  setResult: (result: GeneratorResult) => void;
  setAllCalibrations: (data: AllCalibrationsResult) => void;
  setCalibration: (calibration: CalibrationLevel) => void;
  setDpiMode: (dpiMode: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  goBack: () => void;

  // Deep linking: inicializar desde query params
  initFromParams: (params: {
    brand?: string;
    device?: SelectedDevice;
    style?: SensitivityStyle;
  }) => void;

  // Computed: combinación activa filtrada de allCalibrations
  getCurrentCombination: () => CalibrationResult | null;
}

const initialState = {
  step: 1 as const,
  selectedBrand: null as string | null,
  selectedDevice: null as SelectedDevice | null,
  selectedStyle: 'BALANCED' as SensitivityStyle,
  includeGyro: false,
  result: null as GeneratorResult | null,
  allCalibrations: null as AllCalibrationsResult | null,
  calibration: 'MEDIA' as CalibrationLevel,
  dpiMode: false,
  userRam: null as number | null,
  userHz: null as number | null,
  isLoading: false,
  error: null as string | null,
};

export const useGeneratorStore = create<GeneratorStore>((set, get) => ({
  ...initialState,

  selectBrand: (brand) => set({
    selectedBrand: brand,
    step: 2,
    selectedDevice: null,
    result: null,
    allCalibrations: null,
  }),

  selectDevice: (device) => set({
    selectedDevice: device,
    step: 3,
    result: null,
    allCalibrations: null,
    userRam: device.ramGb,
    userHz: device.screenHz,
  }),

  selectStyle: (style) => set({ selectedStyle: style }),
  setIncludeGyro: (value) => set({ includeGyro: value }),
  setUserRam: (ram) => set({ userRam: ram }),
  setUserHz: (hz) => set({ userHz: hz }),
  setResult: (result) => set({ result, isLoading: false }),

  setAllCalibrations: (data) => set({
    allCalibrations: data,
    isLoading: false,
    // También setear result legacy para compatibilidad con componentes existentes
    result: {
      sensitivity: data.combinations.find(
        (c) => c.calibration === get().calibration && c.dpiMode === get().dpiMode,
      )?.sensitivity ?? data.combinations[0]!.sensitivity,
      gyroscope: data.combinations.find(
        (c) => c.calibration === get().calibration && c.dpiMode === get().dpiMode,
      )?.gyroscope ?? null,
      meta: {
        performanceScore: data.combinations[0]!.performanceScore,
        styleApplied: data.meta.styleApplied,
        deviceTier: data.meta.deviceTier,
        algorithm: data.meta.algorithm,
      },
    },
  }),

  setCalibration: (calibration) => set((state) => {
    const combo = state.allCalibrations?.combinations.find(
      (c) => c.calibration === calibration && c.dpiMode === state.dpiMode,
    );
    return {
      calibration,
      result: combo && state.allCalibrations ? {
        sensitivity: combo.sensitivity,
        gyroscope: combo.gyroscope,
        meta: {
          performanceScore: combo.performanceScore,
          styleApplied: state.allCalibrations.meta.styleApplied,
          deviceTier: state.allCalibrations.meta.deviceTier,
          algorithm: state.allCalibrations.meta.algorithm,
        },
      } : state.result,
    };
  }),

  setDpiMode: (dpiMode) => set((state) => {
    const combo = state.allCalibrations?.combinations.find(
      (c) => c.calibration === state.calibration && c.dpiMode === dpiMode,
    );
    return {
      dpiMode,
      result: combo && state.allCalibrations ? {
        sensitivity: combo.sensitivity,
        gyroscope: combo.gyroscope,
        meta: {
          performanceScore: combo.performanceScore,
          styleApplied: state.allCalibrations.meta.styleApplied,
          deviceTier: state.allCalibrations.meta.deviceTier,
          algorithm: state.allCalibrations.meta.algorithm,
        },
      } : state.result,
    };
  }),

  setLoading: (loading) => set({ isLoading: loading, error: null }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set(initialState),

  goBack: () =>
    set((state) => {
      if (state.step === 3) return {
        step: 2 as const,
        result: null,
        allCalibrations: null,
      };
      if (state.step === 2) return {
        step: 1 as const,
        selectedBrand: null,
        selectedDevice: null,
        result: null,
        allCalibrations: null,
      };
      return state;
    }),

  initFromParams: (params) => {
    if (params.device) {
      set({
        selectedDevice: params.device,
        selectedBrand: params.device.brand,
        step: 3,
        userRam: params.device.ramGb,
        userHz: params.device.screenHz,
        ...(params.style ? { selectedStyle: params.style } : {}),
      });
    } else if (params.brand) {
      set({
        selectedBrand: params.brand,
        step: 2,
        ...(params.style ? { selectedStyle: params.style } : {}),
      });
    } else if (params.style) {
      set({ selectedStyle: params.style });
    }
  },

  getCurrentCombination: () => {
    const state = get();
    if (!state.allCalibrations) return null;
    return state.allCalibrations.combinations.find(
      (c) => c.calibration === state.calibration && c.dpiMode === state.dpiMode,
    ) ?? null;
  },
}));
