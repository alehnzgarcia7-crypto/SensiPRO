import type { PanelType, DeviceTier } from '@prisma/client';

export interface DeviceInfo {
  id: string;
  brand: string;
  model: string;
  slug: string;
  screenHz: number;
  screenSize: number;
  ramGb: number;
  panelType: PanelType;
  tier: DeviceTier;
  chipset: string | null;
  releaseYear: number | null;
  imageUrl: string | null;
  isPopular: boolean;
}

export interface DeviceSpecs {
  screenHz: number;
  screenSize: number;
  ramGb: number;
  panelType: PanelType;
  tier: DeviceTier;
}

export interface DeviceBrand {
  name: string;
  slug: string;
  count: number;
  iconUrl?: string;
}

export interface DeviceSearchResult {
  id: string;
  brand: string;
  model: string;
  slug: string;
  tier: DeviceTier;
  isPopular: boolean;
}
