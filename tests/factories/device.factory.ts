import type { Device, PanelType, DeviceTier } from '@prisma/client';

let counter = 0;

export function createTestDevice(overrides?: Partial<Device>): Device {
  counter++;
  return {
    id: `device-${counter}-${Date.now()}`,
    brand: 'Samsung',
    model: `Galaxy A${counter + 10}`,
    slug: `samsung-galaxy-a${counter + 10}`,
    screenHz: 90,
    screenSize: 6.5,
    screenDpi: 395,
    ramGb: 4,
    panelType: 'AMOLED' as PanelType,
    tier: 'MID' as DeviceTier,
    chipset: 'Exynos 1280',
    releaseYear: 2024,
    imageUrl: null,
    isPopular: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
