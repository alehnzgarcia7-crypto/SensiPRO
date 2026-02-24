/**
 * ARES Device Database — 500+ dispositivos reales
 *
 * Specs verificadas de GSMArena y fuentes oficiales.
 * Cada dispositivo tiene: brand, model, screenHz, screenSize, ramGb,
 * panelType, tier (LOW/MID/HIGH/ULTRA/GAMING), chipset, releaseYear, isPopular.
 *
 * TIERS:
 *   LOW    -> <60Hz, <4GB RAM, LCD basico
 *   MID    -> 60-90Hz, 4-6GB RAM, LCD/AMOLED
 *   HIGH   -> 90-120Hz, 6-8GB RAM, AMOLED
 *   ULTRA  -> 120Hz+, 8-12GB RAM, AMOLED/OLED flagship
 *   GAMING -> 120Hz+, 8GB+ RAM, AMOLED, gaming chipset flagship
 *
 * isPopular = true para los dispositivos TOP en Free Fire LATAM
 */

interface DeviceSeed {
  brand: string;
  model: string;
  screenHz: number;
  screenSize: number;
  ramGb: number;
  panelType: 'LCD' | 'IPS' | 'AMOLED' | 'OLED' | 'LTPO';
  tier: 'LOW' | 'MID' | 'HIGH' | 'ULTRA' | 'GAMING';
  chipset: string;
  releaseYear: number;
  isPopular: boolean;
}

// =============================================================================
// SAMSUNG (85 dispositivos)
// =============================================================================
export const samsungDevices: DeviceSeed[] = [
  // Galaxy S24 Series (2024)
  { brand: 'Samsung', model: 'Galaxy S24 Ultra', screenHz: 120, screenSize: 6.8, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy S24+', screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy S24', screenHz: 120, screenSize: 6.2, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Exynos 2400', releaseYear: 2024, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy S24 FE', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Exynos 2400e', releaseYear: 2024, isPopular: true },
  // Galaxy S23 Series (2023)
  { brand: 'Samsung', model: 'Galaxy S23 Ultra', screenHz: 120, screenSize: 6.8, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy S23+', screenHz: 120, screenSize: 6.6, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S23', screenHz: 120, screenSize: 6.1, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S23 FE', screenHz: 120, screenSize: 6.4, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Exynos 2200', releaseYear: 2023, isPopular: false },
  // Galaxy S22 Series (2022)
  { brand: 'Samsung', model: 'Galaxy S22 Ultra', screenHz: 120, screenSize: 6.8, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 1', releaseYear: 2022, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S22+', screenHz: 120, screenSize: 6.6, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8 Gen 1', releaseYear: 2022, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S22', screenHz: 120, screenSize: 6.1, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Exynos 2200', releaseYear: 2022, isPopular: false },
  // Galaxy S21 Series (2021)
  { brand: 'Samsung', model: 'Galaxy S21 Ultra', screenHz: 120, screenSize: 6.8, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Exynos 2100', releaseYear: 2021, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S21+', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Exynos 2100', releaseYear: 2021, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S21', screenHz: 120, screenSize: 6.2, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Exynos 2100', releaseYear: 2021, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S21 FE', screenHz: 120, screenSize: 6.4, ramGb: 6, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 888', releaseYear: 2022, isPopular: false },
  // Galaxy S20 Series (2020)
  { brand: 'Samsung', model: 'Galaxy S20 Ultra', screenHz: 120, screenSize: 6.9, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Exynos 990', releaseYear: 2020, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S20+', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Exynos 990', releaseYear: 2020, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S20', screenHz: 120, screenSize: 6.2, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Exynos 990', releaseYear: 2020, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S20 FE', screenHz: 120, screenSize: 6.5, ramGb: 6, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 865', releaseYear: 2020, isPopular: false },
  // Galaxy A Series (MUY populares en LATAM)
  { brand: 'Samsung', model: 'Galaxy A55', screenHz: 120, screenSize: 6.6, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Exynos 1480', releaseYear: 2024, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy A54', screenHz: 120, screenSize: 6.4, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Exynos 1380', releaseYear: 2023, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy A53', screenHz: 120, screenSize: 6.5, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Exynos 1280', releaseYear: 2022, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy A52s', screenHz: 120, screenSize: 6.5, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 778G', releaseYear: 2021, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A52', screenHz: 90, screenSize: 6.5, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 720G', releaseYear: 2021, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A35', screenHz: 120, screenSize: 6.6, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Exynos 1380', releaseYear: 2024, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy A34', screenHz: 120, screenSize: 6.6, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 1080', releaseYear: 2023, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy A33', screenHz: 90, screenSize: 6.4, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Exynos 1280', releaseYear: 2022, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A32', screenHz: 90, screenSize: 6.4, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G80', releaseYear: 2021, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A25', screenHz: 120, screenSize: 6.5, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Exynos 1280', releaseYear: 2023, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy A24', screenHz: 90, screenSize: 6.5, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G99', releaseYear: 2023, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy A23', screenHz: 90, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 680', releaseYear: 2022, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A22', screenHz: 90, screenSize: 6.4, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G80', releaseYear: 2021, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A15', screenHz: 90, screenSize: 6.5, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G99', releaseYear: 2023, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy A15 5G', screenHz: 90, screenSize: 6.5, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 6100+', releaseYear: 2023, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A14', screenHz: 90, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G80', releaseYear: 2023, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy A13', screenHz: 60, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Exynos 850', releaseYear: 2022, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A12', screenHz: 60, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio P35', releaseYear: 2020, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A05', screenHz: 60, screenSize: 6.7, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2023, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy A05s', screenHz: 60, screenSize: 6.7, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 680', releaseYear: 2023, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A04', screenHz: 60, screenSize: 6.5, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Helio P35', releaseYear: 2022, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A04s', screenHz: 90, screenSize: 6.5, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Exynos 850', releaseYear: 2022, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A03', screenHz: 60, screenSize: 6.5, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Unisoc T606', releaseYear: 2022, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A03 Core', screenHz: 60, screenSize: 6.5, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Unisoc SC9863A', releaseYear: 2021, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A02s', screenHz: 60, screenSize: 6.5, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 450', releaseYear: 2021, isPopular: false },
  // Galaxy M Series
  { brand: 'Samsung', model: 'Galaxy M55', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 7 Gen 1', releaseYear: 2024, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy M54', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Exynos 1380', releaseYear: 2023, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy M34', screenHz: 120, screenSize: 6.5, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Exynos 1280', releaseYear: 2023, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy M33', screenHz: 120, screenSize: 6.6, ramGb: 6, panelType: 'LCD', tier: 'MID', chipset: 'Exynos 1280', releaseYear: 2022, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy M14', screenHz: 90, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Exynos 1330', releaseYear: 2023, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy M13', screenHz: 60, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Exynos 850', releaseYear: 2022, isPopular: false },
  // Galaxy F Series (populares en mercados emergentes)
  { brand: 'Samsung', model: 'Galaxy F54', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Exynos 1380', releaseYear: 2023, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy F34', screenHz: 120, screenSize: 6.5, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Exynos 1280', releaseYear: 2023, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy F14', screenHz: 90, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Exynos 1330', releaseYear: 2023, isPopular: false },
  // Galaxy Z Fold/Flip
  { brand: 'Samsung', model: 'Galaxy Z Fold6', screenHz: 120, screenSize: 7.6, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy Z Fold5', screenHz: 120, screenSize: 7.6, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy Z Flip6', screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy Z Flip5', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: false },
  // Galaxy Tab (tablets populares para FF)
  { brand: 'Samsung', model: 'Galaxy Tab S9 FE', screenHz: 90, screenSize: 10.9, ramGb: 6, panelType: 'LCD', tier: 'MID', chipset: 'Exynos 1380', releaseYear: 2023, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy Tab A9', screenHz: 90, screenSize: 8.7, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G99', releaseYear: 2023, isPopular: false },
  // Galaxy Note (aun usados)
  { brand: 'Samsung', model: 'Galaxy Note 20 Ultra', screenHz: 120, screenSize: 6.9, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 865+', releaseYear: 2020, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy Note 20', screenHz: 60, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 865+', releaseYear: 2020, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy Note 10+', screenHz: 60, screenSize: 6.8, ramGb: 12, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Exynos 9825', releaseYear: 2019, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy Note 10', screenHz: 60, screenSize: 6.3, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Exynos 9825', releaseYear: 2019, isPopular: false },
  // Galaxy S10 (aun usados en LATAM)
  { brand: 'Samsung', model: 'Galaxy S10+', screenHz: 60, screenSize: 6.4, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Exynos 9820', releaseYear: 2019, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S10', screenHz: 60, screenSize: 6.1, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Exynos 9820', releaseYear: 2019, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S10e', screenHz: 60, screenSize: 5.8, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Exynos 9820', releaseYear: 2019, isPopular: false },
  // Galaxy J Series (legacy MUY usados en LATAM)
  { brand: 'Samsung', model: 'Galaxy J7 Prime', screenHz: 60, screenSize: 5.5, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Exynos 7870', releaseYear: 2016, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy J6+', screenHz: 60, screenSize: 6.0, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 425', releaseYear: 2018, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy J4+', screenHz: 60, screenSize: 6.0, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 425', releaseYear: 2018, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy J2 Core', screenHz: 60, screenSize: 5.0, ramGb: 1, panelType: 'LCD', tier: 'LOW', chipset: 'Exynos 7570', releaseYear: 2018, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A10', screenHz: 60, screenSize: 6.2, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Exynos 7884', releaseYear: 2019, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A10s', screenHz: 60, screenSize: 6.2, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Helio P22', releaseYear: 2019, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A20', screenHz: 60, screenSize: 6.4, ramGb: 3, panelType: 'AMOLED', tier: 'LOW', chipset: 'Exynos 7884', releaseYear: 2019, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A20s', screenHz: 60, screenSize: 6.5, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 450', releaseYear: 2019, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A21s', screenHz: 60, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Exynos 850', releaseYear: 2020, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A30', screenHz: 60, screenSize: 6.4, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Exynos 7904', releaseYear: 2019, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A30s', screenHz: 60, screenSize: 6.4, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Exynos 7904', releaseYear: 2019, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A31', screenHz: 60, screenSize: 6.4, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio P65', releaseYear: 2020, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A50', screenHz: 60, screenSize: 6.4, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Exynos 9610', releaseYear: 2019, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A51', screenHz: 60, screenSize: 6.5, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Exynos 9611', releaseYear: 2020, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A71', screenHz: 60, screenSize: 6.7, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 730', releaseYear: 2020, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A72', screenHz: 90, screenSize: 6.7, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 720G', releaseYear: 2021, isPopular: false },
];

// =============================================================================
// XIAOMI / REDMI / POCO (95 dispositivos)
// =============================================================================
export const xiaomiDevices: DeviceSeed[] = [
  // Xiaomi Flagship
  { brand: 'Xiaomi', model: '14 Ultra', screenHz: 120, screenSize: 6.73, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Xiaomi', model: '14', screenHz: 120, screenSize: 6.36, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Xiaomi', model: '13T Pro', screenHz: 144, screenSize: 6.67, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Dimensity 9200+', releaseYear: 2023, isPopular: false },
  { brand: 'Xiaomi', model: '13T', screenHz: 144, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 8200 Ultra', releaseYear: 2023, isPopular: false },
  { brand: 'Xiaomi', model: '13 Pro', screenHz: 120, screenSize: 6.73, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: false },
  { brand: 'Xiaomi', model: '13', screenHz: 120, screenSize: 6.36, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: false },
  { brand: 'Xiaomi', model: '12T Pro', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8+ Gen 1', releaseYear: 2022, isPopular: false },
  { brand: 'Xiaomi', model: '12T', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 8100 Ultra', releaseYear: 2022, isPopular: false },
  { brand: 'Xiaomi', model: '11T Pro', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 888', releaseYear: 2021, isPopular: false },
  { brand: 'Xiaomi', model: '11 Lite 5G NE', screenHz: 90, screenSize: 6.55, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 778G', releaseYear: 2021, isPopular: false },
  { brand: 'Xiaomi', model: '14T Pro', screenHz: 144, screenSize: 6.67, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Dimensity 9300+', releaseYear: 2024, isPopular: false },
  { brand: 'Xiaomi', model: '14T', screenHz: 144, screenSize: 6.67, ramGb: 12, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 8300 Ultra', releaseYear: 2024, isPopular: false },
  { brand: 'Xiaomi', model: '12 Pro', screenHz: 120, screenSize: 6.73, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 1', releaseYear: 2022, isPopular: false },
  { brand: 'Xiaomi', model: '12', screenHz: 120, screenSize: 6.28, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8 Gen 1', releaseYear: 2022, isPopular: false },
  { brand: 'Xiaomi', model: '11T', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 1200 Ultra', releaseYear: 2021, isPopular: false },
  { brand: 'Xiaomi', model: '11 Pro', screenHz: 120, screenSize: 6.81, ramGb: 8, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 888', releaseYear: 2021, isPopular: false },
  { brand: 'Xiaomi', model: 'Mi 10T Pro', screenHz: 144, screenSize: 6.67, ramGb: 8, panelType: 'LCD', tier: 'HIGH', chipset: 'Snapdragon 865', releaseYear: 2020, isPopular: false },
  { brand: 'Xiaomi', model: 'Mi 10T', screenHz: 144, screenSize: 6.67, ramGb: 6, panelType: 'LCD', tier: 'MID', chipset: 'Snapdragon 865', releaseYear: 2020, isPopular: false },
  { brand: 'Xiaomi', model: 'Mi 10', screenHz: 90, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 865', releaseYear: 2020, isPopular: false },
  { brand: 'Xiaomi', model: 'Mi 9', screenHz: 60, screenSize: 6.39, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 855', releaseYear: 2019, isPopular: false },
  { brand: 'Xiaomi', model: 'Mi 9T Pro', screenHz: 60, screenSize: 6.39, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 855', releaseYear: 2019, isPopular: false },
  // Xiaomi Pad (tablets para FF)
  { brand: 'Xiaomi', model: 'Pad 6 Pro', screenHz: 144, screenSize: 11.0, ramGb: 8, panelType: 'LCD', tier: 'HIGH', chipset: 'Snapdragon 8+ Gen 1', releaseYear: 2023, isPopular: false },
  { brand: 'Xiaomi', model: 'Pad 6', screenHz: 144, screenSize: 11.0, ramGb: 6, panelType: 'LCD', tier: 'MID', chipset: 'Snapdragon 870', releaseYear: 2023, isPopular: false },
  { brand: 'Xiaomi', model: 'Pad SE', screenHz: 90, screenSize: 11.0, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 680', releaseYear: 2023, isPopular: false },
  // Xiaomi CIVI (selfie-focused)
  { brand: 'Xiaomi', model: 'CIVI 4 Pro', screenHz: 120, screenSize: 6.55, ramGb: 12, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8s Gen 3', releaseYear: 2024, isPopular: false },
];

export const redmiDevices: DeviceSeed[] = [
  // Redmi Note 13 Series (2024 — SUPER populares)
  { brand: 'Redmi', model: 'Note 13 Pro+', screenHz: 120, screenSize: 6.67, ramGb: 12, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 7200 Ultra', releaseYear: 2024, isPopular: true },
  { brand: 'Redmi', model: 'Note 13 Pro', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 7s Gen 2', releaseYear: 2024, isPopular: true },
  { brand: 'Redmi', model: 'Note 13', screenHz: 120, screenSize: 6.67, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 685', releaseYear: 2024, isPopular: true },
  { brand: 'Redmi', model: 'Note 13 5G', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 6080', releaseYear: 2024, isPopular: true },
  // Redmi Note 12 Series (2023)
  { brand: 'Redmi', model: 'Note 12 Pro+', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 1080', releaseYear: 2023, isPopular: true },
  { brand: 'Redmi', model: 'Note 12 Pro', screenHz: 120, screenSize: 6.67, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 1080', releaseYear: 2023, isPopular: true },
  { brand: 'Redmi', model: 'Note 12', screenHz: 120, screenSize: 6.67, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 685', releaseYear: 2023, isPopular: true },
  { brand: 'Redmi', model: 'Note 12S', screenHz: 120, screenSize: 6.43, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G96', releaseYear: 2023, isPopular: false },
  // Redmi Note 11 Series (2022)
  { brand: 'Redmi', model: 'Note 11 Pro+', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 920', releaseYear: 2022, isPopular: false },
  { brand: 'Redmi', model: 'Note 11 Pro', screenHz: 120, screenSize: 6.67, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G96', releaseYear: 2022, isPopular: false },
  { brand: 'Redmi', model: 'Note 11', screenHz: 90, screenSize: 6.43, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 680', releaseYear: 2022, isPopular: false },
  { brand: 'Redmi', model: 'Note 11S', screenHz: 90, screenSize: 6.43, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G96', releaseYear: 2022, isPopular: false },
  // Redmi Note 10 Series (2021 — aun muy usados)
  { brand: 'Redmi', model: 'Note 10 Pro', screenHz: 120, screenSize: 6.67, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 732G', releaseYear: 2021, isPopular: false },
  { brand: 'Redmi', model: 'Note 10', screenHz: 60, screenSize: 6.43, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 678', releaseYear: 2021, isPopular: false },
  { brand: 'Redmi', model: 'Note 10S', screenHz: 60, screenSize: 6.43, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G95', releaseYear: 2021, isPopular: false },
  // Redmi Note 9 Series (2020 — aun activos en LATAM)
  { brand: 'Redmi', model: 'Note 9 Pro', screenHz: 60, screenSize: 6.67, ramGb: 6, panelType: 'LCD', tier: 'MID', chipset: 'Snapdragon 720G', releaseYear: 2020, isPopular: false },
  { brand: 'Redmi', model: 'Note 9', screenHz: 60, screenSize: 6.53, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2020, isPopular: false },
  { brand: 'Redmi', model: 'Note 9S', screenHz: 60, screenSize: 6.67, ramGb: 4, panelType: 'LCD', tier: 'MID', chipset: 'Snapdragon 720G', releaseYear: 2020, isPopular: false },
  // Redmi Budget (14/13C/12/A3 — MUY populares en LATAM)
  { brand: 'Redmi', model: '14C', screenHz: 120, screenSize: 6.88, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G81 Ultra', releaseYear: 2024, isPopular: true },
  { brand: 'Redmi', model: '13C', screenHz: 90, screenSize: 6.74, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2023, isPopular: true },
  { brand: 'Redmi', model: '13', screenHz: 90, screenSize: 6.79, ramGb: 6, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 685', releaseYear: 2024, isPopular: false },
  { brand: 'Redmi', model: '12', screenHz: 90, screenSize: 6.79, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G88', releaseYear: 2023, isPopular: true },
  { brand: 'Redmi', model: '12C', screenHz: 60, screenSize: 6.71, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2023, isPopular: false },
  { brand: 'Redmi', model: 'A3', screenHz: 90, screenSize: 6.71, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G36', releaseYear: 2024, isPopular: true },
  { brand: 'Redmi', model: 'A2', screenHz: 60, screenSize: 6.52, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G36', releaseYear: 2023, isPopular: false },
  { brand: 'Redmi', model: 'A1', screenHz: 60, screenSize: 6.52, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Helio A22', releaseYear: 2022, isPopular: false },
  { brand: 'Redmi', model: '10C', screenHz: 60, screenSize: 6.71, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 680', releaseYear: 2022, isPopular: false },
  { brand: 'Redmi', model: '10', screenHz: 90, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G88', releaseYear: 2022, isPopular: false },
  { brand: 'Redmi', model: '9A', screenHz: 60, screenSize: 6.53, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G25', releaseYear: 2020, isPopular: false },
  { brand: 'Redmi', model: '9', screenHz: 60, screenSize: 6.53, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G80', releaseYear: 2020, isPopular: false },
  { brand: 'Redmi', model: '9T', screenHz: 60, screenSize: 6.53, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 662', releaseYear: 2021, isPopular: false },
  { brand: 'Redmi', model: 'Note 8', screenHz: 60, screenSize: 6.3, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 665', releaseYear: 2019, isPopular: false },
  { brand: 'Redmi', model: 'Note 8 Pro', screenHz: 60, screenSize: 6.53, ramGb: 6, panelType: 'LCD', tier: 'MID', chipset: 'Helio G90T', releaseYear: 2019, isPopular: false },
  { brand: 'Redmi', model: 'Note 7', screenHz: 60, screenSize: 6.3, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 660', releaseYear: 2019, isPopular: false },
  { brand: 'Redmi', model: '8', screenHz: 60, screenSize: 6.22, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 439', releaseYear: 2019, isPopular: false },
  { brand: 'Redmi', model: '8A', screenHz: 60, screenSize: 6.22, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 439', releaseYear: 2019, isPopular: false },
  { brand: 'Redmi', model: '7A', screenHz: 60, screenSize: 5.45, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 439', releaseYear: 2019, isPopular: false },
  { brand: 'Redmi', model: 'Note 14 Pro+', screenHz: 120, screenSize: 6.67, ramGb: 12, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 7s Gen 3', releaseYear: 2025, isPopular: true },
  { brand: 'Redmi', model: 'Note 14 Pro', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 7300 Ultra', releaseYear: 2025, isPopular: true },
  { brand: 'Redmi', model: 'Note 14', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 7025 Ultra', releaseYear: 2025, isPopular: true },
];

export const pocoDevices: DeviceSeed[] = [
  // POCO F Series (flagship killer)
  { brand: 'POCO', model: 'F6 Pro', screenHz: 120, screenSize: 6.67, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8s Gen 3', releaseYear: 2024, isPopular: true },
  { brand: 'POCO', model: 'F6', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8s Gen 3', releaseYear: 2024, isPopular: true },
  { brand: 'POCO', model: 'F5 Pro', screenHz: 120, screenSize: 6.67, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8+ Gen 1', releaseYear: 2023, isPopular: false },
  { brand: 'POCO', model: 'F5', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 7+ Gen 2', releaseYear: 2023, isPopular: true },
  { brand: 'POCO', model: 'F4 GT', screenHz: 120, screenSize: 6.67, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 1', releaseYear: 2022, isPopular: false },
  { brand: 'POCO', model: 'F4', screenHz: 120, screenSize: 6.67, ramGb: 6, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 870', releaseYear: 2022, isPopular: false },
  { brand: 'POCO', model: 'F3', screenHz: 120, screenSize: 6.67, ramGb: 6, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 870', releaseYear: 2021, isPopular: false },
  // POCO X Series
  { brand: 'POCO', model: 'X6 Pro', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 8300 Ultra', releaseYear: 2024, isPopular: true },
  { brand: 'POCO', model: 'X6', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 7s Gen 2', releaseYear: 2024, isPopular: false },
  { brand: 'POCO', model: 'X5 Pro', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 778G', releaseYear: 2023, isPopular: false },
  { brand: 'POCO', model: 'X5', screenHz: 120, screenSize: 6.67, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 695', releaseYear: 2023, isPopular: false },
  { brand: 'POCO', model: 'X4 Pro', screenHz: 120, screenSize: 6.67, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 695', releaseYear: 2022, isPopular: false },
  // POCO M Series
  { brand: 'POCO', model: 'M6 Pro', screenHz: 120, screenSize: 6.67, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G99 Ultra', releaseYear: 2023, isPopular: false },
  { brand: 'POCO', model: 'M5s', screenHz: 90, screenSize: 6.43, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G95', releaseYear: 2022, isPopular: false },
  { brand: 'POCO', model: 'M5', screenHz: 90, screenSize: 6.58, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G99', releaseYear: 2022, isPopular: false },
  { brand: 'POCO', model: 'M4 Pro', screenHz: 90, screenSize: 6.43, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G96', releaseYear: 2022, isPopular: false },
  // POCO C Series (budget)
  { brand: 'POCO', model: 'C65', screenHz: 90, screenSize: 6.74, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2024, isPopular: false },
  { brand: 'POCO', model: 'C55', screenHz: 60, screenSize: 6.71, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2023, isPopular: false },
];

// =============================================================================
// MOTOROLA (35 dispositivos)
// =============================================================================
export const motorolaDevices: DeviceSeed[] = [
  // Edge Series (flagship)
  { brand: 'Motorola', model: 'Edge 50 Ultra', screenHz: 144, screenSize: 6.7, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8s Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Motorola', model: 'Edge 50 Pro', screenHz: 144, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 7 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Motorola', model: 'Edge 50 Fusion', screenHz: 144, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 7s Gen 2', releaseYear: 2024, isPopular: false },
  { brand: 'Motorola', model: 'Edge 40 Pro', screenHz: 165, screenSize: 6.67, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: false },
  { brand: 'Motorola', model: 'Edge 40', screenHz: 144, screenSize: 6.55, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 8020', releaseYear: 2023, isPopular: false },
  { brand: 'Motorola', model: 'Edge 30 Ultra', screenHz: 144, screenSize: 6.67, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8+ Gen 1', releaseYear: 2022, isPopular: false },
  { brand: 'Motorola', model: 'Edge 30 Pro', screenHz: 144, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 1', releaseYear: 2022, isPopular: false },
  // Moto G Series (MUY populares en Mexico)
  { brand: 'Motorola', model: 'Moto G85', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 6s Gen 3', releaseYear: 2024, isPopular: true },
  { brand: 'Motorola', model: 'Moto G84', screenHz: 120, screenSize: 6.55, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 695', releaseYear: 2023, isPopular: true },
  { brand: 'Motorola', model: 'Moto G73', screenHz: 120, screenSize: 6.5, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Dimensity 930', releaseYear: 2023, isPopular: false },
  { brand: 'Motorola', model: 'Moto G72', screenHz: 120, screenSize: 6.6, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G99', releaseYear: 2022, isPopular: false },
  { brand: 'Motorola', model: 'Moto G54', screenHz: 120, screenSize: 6.5, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Dimensity 7020', releaseYear: 2023, isPopular: true },
  { brand: 'Motorola', model: 'Moto G53', screenHz: 120, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 480+', releaseYear: 2023, isPopular: false },
  { brand: 'Motorola', model: 'Moto G42', screenHz: 60, screenSize: 6.4, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 680', releaseYear: 2022, isPopular: false },
  { brand: 'Motorola', model: 'Moto G34', screenHz: 120, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 695', releaseYear: 2023, isPopular: false },
  { brand: 'Motorola', model: 'Moto G24', screenHz: 90, screenSize: 6.56, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2024, isPopular: true },
  { brand: 'Motorola', model: 'Moto G24 Power', screenHz: 90, screenSize: 6.56, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2024, isPopular: false },
  { brand: 'Motorola', model: 'Moto G23', screenHz: 90, screenSize: 6.53, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2023, isPopular: false },
  { brand: 'Motorola', model: 'Moto G22', screenHz: 90, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G37', releaseYear: 2022, isPopular: false },
  { brand: 'Motorola', model: 'Moto G14', screenHz: 60, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G37', releaseYear: 2023, isPopular: false },
  { brand: 'Motorola', model: 'Moto G13', screenHz: 90, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2023, isPopular: false },
  { brand: 'Motorola', model: 'Moto G04', screenHz: 60, screenSize: 6.56, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G36', releaseYear: 2024, isPopular: false },
  { brand: 'Motorola', model: 'Moto G04s', screenHz: 90, screenSize: 6.56, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G36', releaseYear: 2024, isPopular: false },
  // Moto E Series (entrada)
  { brand: 'Motorola', model: 'Moto E14', screenHz: 60, screenSize: 6.56, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G36', releaseYear: 2024, isPopular: false },
  { brand: 'Motorola', model: 'Moto E13', screenHz: 60, screenSize: 6.5, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Unisoc T606', releaseYear: 2023, isPopular: false },
  // Moto Power (bateria)
  { brand: 'Motorola', model: 'Moto G Power (2024)', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Dimensity 7020', releaseYear: 2024, isPopular: false },
  { brand: 'Motorola', model: 'Moto G Stylus (2024)', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Helio G85', releaseYear: 2024, isPopular: false },
  // Moto Razr
  { brand: 'Motorola', model: 'Moto Razr 50 Ultra', screenHz: 165, screenSize: 6.9, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8s Gen 3', releaseYear: 2024, isPopular: false },
  // Moto G legacy (aun usados en Mexico)
  { brand: 'Motorola', model: 'Moto G52', screenHz: 90, screenSize: 6.6, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 680', releaseYear: 2022, isPopular: false },
  { brand: 'Motorola', model: 'Moto G32', screenHz: 90, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 680', releaseYear: 2022, isPopular: false },
  { brand: 'Motorola', model: 'Moto G31', screenHz: 60, screenSize: 6.4, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G85', releaseYear: 2021, isPopular: false },
  { brand: 'Motorola', model: 'Moto G30', screenHz: 90, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 662', releaseYear: 2021, isPopular: false },
  { brand: 'Motorola', model: 'Moto G20', screenHz: 90, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Unisoc T700', releaseYear: 2021, isPopular: false },
  { brand: 'Motorola', model: 'Moto G10', screenHz: 60, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 460', releaseYear: 2021, isPopular: false },
  { brand: 'Motorola', model: 'Moto G9 Play', screenHz: 60, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 662', releaseYear: 2020, isPopular: false },
  { brand: 'Motorola', model: 'Moto G8 Power', screenHz: 60, screenSize: 6.4, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 665', releaseYear: 2020, isPopular: false },
  { brand: 'Motorola', model: 'Moto G8 Plus', screenHz: 60, screenSize: 6.3, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 665', releaseYear: 2019, isPopular: false },
  { brand: 'Motorola', model: 'Moto E7 Plus', screenHz: 60, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 460', releaseYear: 2020, isPopular: false },
  { brand: 'Motorola', model: 'Moto E6 Plus', screenHz: 60, screenSize: 6.1, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Helio P22', releaseYear: 2019, isPopular: false },
  { brand: 'Motorola', model: 'Moto One Fusion', screenHz: 60, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 710', releaseYear: 2020, isPopular: false },
];

// =============================================================================
// APPLE — iPhone (20 dispositivos)
// =============================================================================
export const appleDevices: DeviceSeed[] = [
  // iPhone 16 Series (2024)
  { brand: 'Apple', model: 'iPhone 16 Pro Max', screenHz: 120, screenSize: 6.9, ramGb: 8, panelType: 'OLED', tier: 'GAMING', chipset: 'A18 Pro', releaseYear: 2024, isPopular: true },
  { brand: 'Apple', model: 'iPhone 16 Pro', screenHz: 120, screenSize: 6.3, ramGb: 8, panelType: 'OLED', tier: 'GAMING', chipset: 'A18 Pro', releaseYear: 2024, isPopular: true },
  { brand: 'Apple', model: 'iPhone 16 Plus', screenHz: 60, screenSize: 6.7, ramGb: 8, panelType: 'OLED', tier: 'HIGH', chipset: 'A18', releaseYear: 2024, isPopular: false },
  { brand: 'Apple', model: 'iPhone 16', screenHz: 60, screenSize: 6.1, ramGb: 8, panelType: 'OLED', tier: 'HIGH', chipset: 'A18', releaseYear: 2024, isPopular: true },
  // iPhone 15 Series (2023)
  { brand: 'Apple', model: 'iPhone 15 Pro Max', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'OLED', tier: 'GAMING', chipset: 'A17 Pro', releaseYear: 2023, isPopular: true },
  { brand: 'Apple', model: 'iPhone 15 Pro', screenHz: 120, screenSize: 6.1, ramGb: 8, panelType: 'OLED', tier: 'GAMING', chipset: 'A17 Pro', releaseYear: 2023, isPopular: true },
  { brand: 'Apple', model: 'iPhone 15 Plus', screenHz: 60, screenSize: 6.7, ramGb: 6, panelType: 'OLED', tier: 'HIGH', chipset: 'A16 Bionic', releaseYear: 2023, isPopular: false },
  { brand: 'Apple', model: 'iPhone 15', screenHz: 60, screenSize: 6.1, ramGb: 6, panelType: 'OLED', tier: 'HIGH', chipset: 'A16 Bionic', releaseYear: 2023, isPopular: true },
  // iPhone 14 Series (2022)
  { brand: 'Apple', model: 'iPhone 14 Pro Max', screenHz: 120, screenSize: 6.7, ramGb: 6, panelType: 'OLED', tier: 'GAMING', chipset: 'A16 Bionic', releaseYear: 2022, isPopular: false },
  { brand: 'Apple', model: 'iPhone 14 Pro', screenHz: 120, screenSize: 6.1, ramGb: 6, panelType: 'OLED', tier: 'GAMING', chipset: 'A16 Bionic', releaseYear: 2022, isPopular: false },
  { brand: 'Apple', model: 'iPhone 14', screenHz: 60, screenSize: 6.1, ramGb: 6, panelType: 'OLED', tier: 'HIGH', chipset: 'A15 Bionic', releaseYear: 2022, isPopular: false },
  // iPhone 13 Series (2021)
  { brand: 'Apple', model: 'iPhone 13 Pro Max', screenHz: 120, screenSize: 6.7, ramGb: 6, panelType: 'OLED', tier: 'GAMING', chipset: 'A15 Bionic', releaseYear: 2021, isPopular: false },
  { brand: 'Apple', model: 'iPhone 13 Pro', screenHz: 120, screenSize: 6.1, ramGb: 6, panelType: 'OLED', tier: 'HIGH', chipset: 'A15 Bionic', releaseYear: 2021, isPopular: false },
  { brand: 'Apple', model: 'iPhone 13', screenHz: 60, screenSize: 6.1, ramGb: 4, panelType: 'OLED', tier: 'HIGH', chipset: 'A15 Bionic', releaseYear: 2021, isPopular: false },
  { brand: 'Apple', model: 'iPhone 13 Mini', screenHz: 60, screenSize: 5.4, ramGb: 4, panelType: 'OLED', tier: 'MID', chipset: 'A15 Bionic', releaseYear: 2021, isPopular: false },
  // iPhone 12 Series (2020)
  { brand: 'Apple', model: 'iPhone 12 Pro Max', screenHz: 60, screenSize: 6.7, ramGb: 6, panelType: 'OLED', tier: 'HIGH', chipset: 'A14 Bionic', releaseYear: 2020, isPopular: false },
  { brand: 'Apple', model: 'iPhone 12', screenHz: 60, screenSize: 6.1, ramGb: 4, panelType: 'OLED', tier: 'MID', chipset: 'A14 Bionic', releaseYear: 2020, isPopular: false },
  // iPhone 11 y SE (aun activos)
  { brand: 'Apple', model: 'iPhone 11', screenHz: 60, screenSize: 6.1, ramGb: 4, panelType: 'LCD', tier: 'MID', chipset: 'A13 Bionic', releaseYear: 2019, isPopular: false },
  { brand: 'Apple', model: 'iPhone SE (2022)', screenHz: 60, screenSize: 4.7, ramGb: 4, panelType: 'LCD', tier: 'MID', chipset: 'A15 Bionic', releaseYear: 2022, isPopular: false },
  { brand: 'Apple', model: 'iPhone SE (2020)', screenHz: 60, screenSize: 4.7, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'A13 Bionic', releaseYear: 2020, isPopular: false },
];

// =============================================================================
// REALME (30 dispositivos)
// =============================================================================
export const realmeDevices: DeviceSeed[] = [
  // Realme GT Series
  { brand: 'Realme', model: 'GT5 Pro', screenHz: 144, screenSize: 6.78, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Realme', model: 'GT Neo 5', screenHz: 144, screenSize: 6.74, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8+ Gen 1', releaseYear: 2023, isPopular: false },
  { brand: 'Realme', model: 'GT Neo 3', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 8100', releaseYear: 2022, isPopular: false },
  // Realme 12/11/10 Series
  { brand: 'Realme', model: '12 Pro+', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 7s Gen 2', releaseYear: 2024, isPopular: false },
  { brand: 'Realme', model: '12 Pro', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 6 Gen 1', releaseYear: 2024, isPopular: false },
  { brand: 'Realme', model: '12', screenHz: 120, screenSize: 6.72, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G99 Ultra', releaseYear: 2024, isPopular: false },
  { brand: 'Realme', model: '11 Pro+', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 7050', releaseYear: 2023, isPopular: false },
  { brand: 'Realme', model: '11 Pro', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 7050', releaseYear: 2023, isPopular: false },
  { brand: 'Realme', model: '11', screenHz: 90, screenSize: 6.72, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Helio G99', releaseYear: 2023, isPopular: false },
  { brand: 'Realme', model: '10 Pro+', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 1080', releaseYear: 2022, isPopular: false },
  { brand: 'Realme', model: '10 Pro', screenHz: 120, screenSize: 6.72, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Snapdragon 695', releaseYear: 2022, isPopular: false },
  { brand: 'Realme', model: '10', screenHz: 90, screenSize: 6.4, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G99', releaseYear: 2022, isPopular: false },
  // Realme C Series (budget LATAM)
  { brand: 'Realme', model: 'C67', screenHz: 90, screenSize: 6.72, ramGb: 6, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 685', releaseYear: 2023, isPopular: true },
  { brand: 'Realme', model: 'C65', screenHz: 90, screenSize: 6.72, ramGb: 6, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2024, isPopular: false },
  { brand: 'Realme', model: 'C55', screenHz: 90, screenSize: 6.72, ramGb: 6, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G88', releaseYear: 2023, isPopular: false },
  { brand: 'Realme', model: 'C53', screenHz: 90, screenSize: 6.74, ramGb: 6, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2023, isPopular: false },
  { brand: 'Realme', model: 'C51', screenHz: 90, screenSize: 6.74, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2023, isPopular: false },
  { brand: 'Realme', model: 'C33', screenHz: 60, screenSize: 6.5, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Unisoc T612', releaseYear: 2022, isPopular: false },
  { brand: 'Realme', model: 'C31', screenHz: 60, screenSize: 6.5, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Unisoc T612', releaseYear: 2022, isPopular: false },
  { brand: 'Realme', model: 'C30', screenHz: 60, screenSize: 6.5, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Unisoc SC9863A', releaseYear: 2022, isPopular: false },
  // Realme Narzo
  { brand: 'Realme', model: 'Narzo 70 Pro', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 7050', releaseYear: 2024, isPopular: false },
  { brand: 'Realme', model: 'Narzo 60 Pro', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 7050', releaseYear: 2023, isPopular: false },
  { brand: 'Realme', model: 'Narzo 60', screenHz: 120, screenSize: 6.4, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 6020', releaseYear: 2023, isPopular: false },
  { brand: 'Realme', model: 'Narzo 50', screenHz: 120, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G96', releaseYear: 2022, isPopular: false },
  // Mas Realme legacy
  { brand: 'Realme', model: '9 Pro+', screenHz: 90, screenSize: 6.4, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 920', releaseYear: 2022, isPopular: false },
  { brand: 'Realme', model: '9 Pro', screenHz: 120, screenSize: 6.6, ramGb: 6, panelType: 'LCD', tier: 'MID', chipset: 'Snapdragon 695', releaseYear: 2022, isPopular: false },
  { brand: 'Realme', model: '9', screenHz: 90, screenSize: 6.4, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 680', releaseYear: 2022, isPopular: false },
  { brand: 'Realme', model: '8 Pro', screenHz: 60, screenSize: 6.4, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 720G', releaseYear: 2021, isPopular: false },
  { brand: 'Realme', model: '8', screenHz: 60, screenSize: 6.4, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G95', releaseYear: 2021, isPopular: false },
  { brand: 'Realme', model: '7 Pro', screenHz: 60, screenSize: 6.4, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 720G', releaseYear: 2020, isPopular: false },
  { brand: 'Realme', model: 'C35', screenHz: 60, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Unisoc T616', releaseYear: 2022, isPopular: false },
  { brand: 'Realme', model: 'C25Y', screenHz: 60, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Unisoc T618', releaseYear: 2021, isPopular: false },
  { brand: 'Realme', model: 'C21Y', screenHz: 60, screenSize: 6.5, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Unisoc T610', releaseYear: 2021, isPopular: false },
  { brand: 'Realme', model: 'C11 (2021)', screenHz: 60, screenSize: 6.52, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G35', releaseYear: 2021, isPopular: false },
];

// =============================================================================
// INFINIX (25 dispositivos — populares en LATAM por precio bajo)
// =============================================================================
export const infinixDevices: DeviceSeed[] = [
  // GT Series (gaming)
  { brand: 'Infinix', model: 'GT 20 Pro', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 8200', releaseYear: 2024, isPopular: false },
  { brand: 'Infinix', model: 'GT 10 Pro', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 8050', releaseYear: 2023, isPopular: false },
  // Note Series
  { brand: 'Infinix', model: 'Note 40 Pro', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G99', releaseYear: 2024, isPopular: false },
  { brand: 'Infinix', model: 'Note 40', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G99', releaseYear: 2024, isPopular: false },
  { brand: 'Infinix', model: 'Note 30 Pro', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G99', releaseYear: 2023, isPopular: false },
  { brand: 'Infinix', model: 'Note 30', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Helio G99', releaseYear: 2023, isPopular: false },
  { brand: 'Infinix', model: 'Note 12 Pro', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G99', releaseYear: 2022, isPopular: false },
  // Hot Series (MUY populares en LATAM)
  { brand: 'Infinix', model: 'Hot 40 Pro', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Helio G99', releaseYear: 2024, isPopular: true },
  { brand: 'Infinix', model: 'Hot 40i', screenHz: 90, screenSize: 6.56, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G36', releaseYear: 2024, isPopular: false },
  { brand: 'Infinix', model: 'Hot 40', screenHz: 90, screenSize: 6.78, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Helio G88', releaseYear: 2024, isPopular: false },
  { brand: 'Infinix', model: 'Hot 30i', screenHz: 90, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G37', releaseYear: 2023, isPopular: false },
  { brand: 'Infinix', model: 'Hot 30', screenHz: 90, screenSize: 6.78, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G88', releaseYear: 2023, isPopular: false },
  { brand: 'Infinix', model: 'Hot 20', screenHz: 90, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2022, isPopular: false },
  { brand: 'Infinix', model: 'Hot 20S', screenHz: 90, screenSize: 6.78, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Helio G96', releaseYear: 2022, isPopular: false },
  // Smart Series (ultra budget)
  { brand: 'Infinix', model: 'Smart 8 Pro', screenHz: 90, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G36', releaseYear: 2024, isPopular: false },
  { brand: 'Infinix', model: 'Smart 8', screenHz: 90, screenSize: 6.6, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G36', releaseYear: 2023, isPopular: false },
  { brand: 'Infinix', model: 'Smart 7', screenHz: 60, screenSize: 6.6, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Helio A22', releaseYear: 2023, isPopular: false },
  // Zero Series
  { brand: 'Infinix', model: 'Zero 30', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 8020', releaseYear: 2023, isPopular: false },
  { brand: 'Infinix', model: 'Zero 20', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G99', releaseYear: 2022, isPopular: false },
  // Mas Infinix budget LATAM
  { brand: 'Infinix', model: 'Hot 12', screenHz: 90, screenSize: 6.82, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2022, isPopular: false },
  { brand: 'Infinix', model: 'Hot 12 Play', screenHz: 90, screenSize: 6.82, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G35', releaseYear: 2022, isPopular: false },
  { brand: 'Infinix', model: 'Hot 11', screenHz: 60, screenSize: 6.7, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G70', releaseYear: 2021, isPopular: false },
  { brand: 'Infinix', model: 'Hot 10S', screenHz: 90, screenSize: 6.82, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2021, isPopular: false },
  { brand: 'Infinix', model: 'Note 11 Pro', screenHz: 120, screenSize: 6.95, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Helio G96', releaseYear: 2021, isPopular: false },
  { brand: 'Infinix', model: 'Smart 6', screenHz: 60, screenSize: 6.6, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Helio A22', releaseYear: 2022, isPopular: false },
];

// =============================================================================
// TECNO (20 dispositivos)
// =============================================================================
export const tecnoDevices: DeviceSeed[] = [
  // Camon Series
  { brand: 'Tecno', model: 'Camon 30 Premier', screenHz: 120, screenSize: 6.77, ramGb: 12, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 8200', releaseYear: 2024, isPopular: false },
  { brand: 'Tecno', model: 'Camon 30 Pro', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 8050', releaseYear: 2024, isPopular: false },
  { brand: 'Tecno', model: 'Camon 30', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Helio G99', releaseYear: 2024, isPopular: false },
  { brand: 'Tecno', model: 'Camon 20 Pro', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G99', releaseYear: 2023, isPopular: false },
  { brand: 'Tecno', model: 'Camon 20', screenHz: 60, screenSize: 6.67, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Helio G85', releaseYear: 2023, isPopular: false },
  // Pova Series (gaming budget)
  { brand: 'Tecno', model: 'Pova 6 Pro', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Dimensity 6080', releaseYear: 2024, isPopular: true },
  { brand: 'Tecno', model: 'Pova 6', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Helio G99 Ultimate', releaseYear: 2024, isPopular: false },
  { brand: 'Tecno', model: 'Pova 5 Pro', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Dimensity 6080', releaseYear: 2023, isPopular: false },
  { brand: 'Tecno', model: 'Pova 5', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Helio G99', releaseYear: 2023, isPopular: false },
  { brand: 'Tecno', model: 'Pova Neo 3', screenHz: 90, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2023, isPopular: false },
  // Spark Series
  { brand: 'Tecno', model: 'Spark 20 Pro+', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Helio G99', releaseYear: 2024, isPopular: false },
  { brand: 'Tecno', model: 'Spark 20 Pro', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Helio G85', releaseYear: 2024, isPopular: false },
  { brand: 'Tecno', model: 'Spark 20', screenHz: 90, screenSize: 6.56, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2024, isPopular: false },
  { brand: 'Tecno', model: 'Spark 10 Pro', screenHz: 90, screenSize: 6.6, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Helio G88', releaseYear: 2023, isPopular: false },
  { brand: 'Tecno', model: 'Spark 10', screenHz: 90, screenSize: 6.56, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G37', releaseYear: 2023, isPopular: false },
  // Pop Series (ultra budget)
  { brand: 'Tecno', model: 'Pop 8', screenHz: 60, screenSize: 6.56, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Helio A22', releaseYear: 2024, isPopular: false },
  { brand: 'Tecno', model: 'Pop 7 Pro', screenHz: 60, screenSize: 6.6, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2023, isPopular: false },
  // Phantom Series
  { brand: 'Tecno', model: 'Phantom V Fold', screenHz: 120, screenSize: 7.85, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Dimensity 9000+', releaseYear: 2023, isPopular: false },
  { brand: 'Tecno', model: 'Phantom X2 Pro', screenHz: 120, screenSize: 6.8, ramGb: 12, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 9000', releaseYear: 2023, isPopular: false },
  // Mas Tecno budget
  { brand: 'Tecno', model: 'Spark 10C', screenHz: 60, screenSize: 6.56, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G37', releaseYear: 2023, isPopular: false },
  { brand: 'Tecno', model: 'Spark 9 Pro', screenHz: 90, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2022, isPopular: false },
  { brand: 'Tecno', model: 'Pova 4 Pro', screenHz: 90, screenSize: 6.66, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Helio G99', releaseYear: 2022, isPopular: false },
  { brand: 'Tecno', model: 'Pova 4', screenHz: 90, screenSize: 6.82, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Helio G99', releaseYear: 2022, isPopular: false },
  { brand: 'Tecno', model: 'Camon 19 Pro', screenHz: 120, screenSize: 6.8, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Helio G96', releaseYear: 2022, isPopular: false },
  { brand: 'Tecno', model: 'Pop 7', screenHz: 60, screenSize: 6.6, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Helio A22', releaseYear: 2023, isPopular: false },
  { brand: 'Tecno', model: 'Pop 6 Pro', screenHz: 60, screenSize: 6.6, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Helio A22', releaseYear: 2022, isPopular: false },
];

// =============================================================================
// HONOR (15 dispositivos)
// =============================================================================
export const honorDevices: DeviceSeed[] = [
  // Magic Series
  { brand: 'Honor', model: 'Magic6 Pro', screenHz: 120, screenSize: 6.78, ramGb: 12, panelType: 'OLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Honor', model: 'Magic5 Pro', screenHz: 120, screenSize: 6.73, ramGb: 12, panelType: 'OLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: false },
  // Honor Number Series
  { brand: 'Honor', model: '200 Pro', screenHz: 120, screenSize: 6.78, ramGb: 12, panelType: 'OLED', tier: 'HIGH', chipset: 'Snapdragon 8s Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Honor', model: '200', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'OLED', tier: 'HIGH', chipset: 'Snapdragon 7 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Honor', model: '90', screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 7 Gen 1', releaseYear: 2023, isPopular: false },
  { brand: 'Honor', model: '70', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'OLED', tier: 'MID', chipset: 'Snapdragon 778G+', releaseYear: 2022, isPopular: false },
  // Honor X Series
  { brand: 'Honor', model: 'X9b', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 6 Gen 1', releaseYear: 2024, isPopular: false },
  { brand: 'Honor', model: 'X8b', screenHz: 90, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 680', releaseYear: 2024, isPopular: false },
  { brand: 'Honor', model: 'X8a', screenHz: 90, screenSize: 6.7, ramGb: 6, panelType: 'LCD', tier: 'MID', chipset: 'Helio G88', releaseYear: 2023, isPopular: false },
  { brand: 'Honor', model: 'X7b', screenHz: 90, screenSize: 6.8, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 680', releaseYear: 2024, isPopular: false },
  { brand: 'Honor', model: 'X6a', screenHz: 90, screenSize: 6.56, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G36', releaseYear: 2024, isPopular: false },
  { brand: 'Honor', model: 'X6', screenHz: 60, screenSize: 6.56, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G25', releaseYear: 2023, isPopular: false },
  { brand: 'Honor', model: 'X5 Plus', screenHz: 90, screenSize: 6.56, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G36', releaseYear: 2024, isPopular: false },
  { brand: 'Honor', model: '50', screenHz: 120, screenSize: 6.57, ramGb: 6, panelType: 'OLED', tier: 'MID', chipset: 'Snapdragon 778G', releaseYear: 2021, isPopular: false },
  { brand: 'Honor', model: 'Play 40C', screenHz: 90, screenSize: 6.56, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 480+', releaseYear: 2023, isPopular: false },
];

// =============================================================================
// ONEPLUS (15 dispositivos)
// =============================================================================
export const oneplusDevices: DeviceSeed[] = [
  { brand: 'OnePlus', model: '12', screenHz: 120, screenSize: 6.82, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'OnePlus', model: '12R', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2024, isPopular: false },
  { brand: 'OnePlus', model: '11', screenHz: 120, screenSize: 6.7, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: false },
  { brand: 'OnePlus', model: '11R', screenHz: 120, screenSize: 6.74, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8+ Gen 1', releaseYear: 2023, isPopular: false },
  { brand: 'OnePlus', model: '10 Pro', screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 1', releaseYear: 2022, isPopular: false },
  { brand: 'OnePlus', model: '10T', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8+ Gen 1', releaseYear: 2022, isPopular: false },
  // Nord Series
  { brand: 'OnePlus', model: 'Nord CE4', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 7 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'OnePlus', model: 'Nord CE3 Lite', screenHz: 120, screenSize: 6.72, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Snapdragon 695', releaseYear: 2023, isPopular: false },
  { brand: 'OnePlus', model: 'Nord N30', screenHz: 120, screenSize: 6.72, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Snapdragon 695', releaseYear: 2023, isPopular: false },
  { brand: 'OnePlus', model: 'Nord 3', screenHz: 120, screenSize: 6.74, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 9000', releaseYear: 2023, isPopular: false },
  { brand: 'OnePlus', model: 'Nord 2T', screenHz: 90, screenSize: 6.43, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 1300', releaseYear: 2022, isPopular: false },
  { brand: 'OnePlus', model: 'Nord CE 2', screenHz: 90, screenSize: 6.43, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 900', releaseYear: 2022, isPopular: false },
  { brand: 'OnePlus', model: '9 Pro', screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 888', releaseYear: 2021, isPopular: false },
  { brand: 'OnePlus', model: '9', screenHz: 120, screenSize: 6.55, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 888', releaseYear: 2021, isPopular: false },
  { brand: 'OnePlus', model: '8T', screenHz: 120, screenSize: 6.55, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 865', releaseYear: 2020, isPopular: false },
  { brand: 'OnePlus', model: 'Nord N300', screenHz: 90, screenSize: 6.56, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Dimensity 810', releaseYear: 2022, isPopular: false },
  { brand: 'OnePlus', model: 'Nord N20', screenHz: 60, screenSize: 6.43, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 695', releaseYear: 2022, isPopular: false },
];

// =============================================================================
// VIVO (18 dispositivos)
// =============================================================================
export const vivoDevices: DeviceSeed[] = [
  // X Series
  { brand: 'Vivo', model: 'X100 Pro', screenHz: 120, screenSize: 6.78, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Dimensity 9300', releaseYear: 2024, isPopular: false },
  { brand: 'Vivo', model: 'X100', screenHz: 120, screenSize: 6.78, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Dimensity 9300', releaseYear: 2024, isPopular: false },
  { brand: 'Vivo', model: 'X90 Pro', screenHz: 120, screenSize: 6.78, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Dimensity 9200', releaseYear: 2023, isPopular: false },
  // V Series
  { brand: 'Vivo', model: 'V30 Pro', screenHz: 120, screenSize: 6.78, ramGb: 12, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 7 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Vivo', model: 'V30', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 7 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Vivo', model: 'V29', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 778G', releaseYear: 2023, isPopular: false },
  { brand: 'Vivo', model: 'V27', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 7200', releaseYear: 2023, isPopular: false },
  // Y Series (budget populares)
  { brand: 'Vivo', model: 'Y36', screenHz: 90, screenSize: 6.64, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Snapdragon 680', releaseYear: 2023, isPopular: false },
  { brand: 'Vivo', model: 'Y27', screenHz: 90, screenSize: 6.64, ramGb: 6, panelType: 'LCD', tier: 'MID', chipset: 'Helio G85', releaseYear: 2023, isPopular: false },
  { brand: 'Vivo', model: 'Y22s', screenHz: 60, screenSize: 6.55, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 680', releaseYear: 2022, isPopular: false },
  { brand: 'Vivo', model: 'Y17s', screenHz: 60, screenSize: 6.56, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2023, isPopular: false },
  { brand: 'Vivo', model: 'Y16', screenHz: 60, screenSize: 6.51, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Helio P35', releaseYear: 2022, isPopular: false },
  { brand: 'Vivo', model: 'Y02', screenHz: 60, screenSize: 6.51, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Helio P22', releaseYear: 2022, isPopular: false },
  // T Series
  { brand: 'Vivo', model: 'T3 Ultra', screenHz: 120, screenSize: 6.78, ramGb: 12, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 9200+', releaseYear: 2024, isPopular: false },
  { brand: 'Vivo', model: 'T2 Pro', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 7200', releaseYear: 2023, isPopular: false },
  // iQOO (sub-marca gaming)
  { brand: 'Vivo', model: 'iQOO 12', screenHz: 144, screenSize: 6.78, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Vivo', model: 'iQOO Neo 9', screenHz: 144, screenSize: 6.78, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2024, isPopular: false },
  { brand: 'Vivo', model: 'iQOO Z9', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 7200', releaseYear: 2024, isPopular: false },
  // Mas Vivo budget
  { brand: 'Vivo', model: 'Y100', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 695', releaseYear: 2023, isPopular: false },
  { brand: 'Vivo', model: 'Y56', screenHz: 60, screenSize: 6.44, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 680', releaseYear: 2023, isPopular: false },
  { brand: 'Vivo', model: 'Y35', screenHz: 60, screenSize: 6.58, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 680', releaseYear: 2022, isPopular: false },
  { brand: 'Vivo', model: 'Y21s', screenHz: 60, screenSize: 6.51, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G80', releaseYear: 2021, isPopular: false },
  { brand: 'Vivo', model: 'Y20', screenHz: 60, screenSize: 6.51, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 460', releaseYear: 2020, isPopular: false },
  { brand: 'Vivo', model: 'Y15s', screenHz: 60, screenSize: 6.51, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Helio P35', releaseYear: 2021, isPopular: false },
  { brand: 'Vivo', model: 'V25 Pro', screenHz: 120, screenSize: 6.56, ramGb: 12, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 1300', releaseYear: 2022, isPopular: false },
];

// =============================================================================
// OPPO (18 dispositivos)
// =============================================================================
export const oppoDevices: DeviceSeed[] = [
  // Find Series
  { brand: 'OPPO', model: 'Find X7 Ultra', screenHz: 120, screenSize: 6.82, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'OPPO', model: 'Find X6 Pro', screenHz: 120, screenSize: 6.82, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Dimensity 9200', releaseYear: 2023, isPopular: false },
  // Reno Series
  { brand: 'OPPO', model: 'Reno 12 Pro', screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 7300', releaseYear: 2024, isPopular: false },
  { brand: 'OPPO', model: 'Reno 12', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 7300', releaseYear: 2024, isPopular: false },
  { brand: 'OPPO', model: 'Reno 11 Pro', screenHz: 120, screenSize: 6.74, ramGb: 12, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 8200', releaseYear: 2024, isPopular: false },
  { brand: 'OPPO', model: 'Reno 11', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 7050', releaseYear: 2024, isPopular: false },
  { brand: 'OPPO', model: 'Reno 10 Pro+', screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8+ Gen 1', releaseYear: 2023, isPopular: false },
  { brand: 'OPPO', model: 'Reno 10', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 778G', releaseYear: 2023, isPopular: false },
  { brand: 'OPPO', model: 'Reno 8 Pro', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 8100 Max', releaseYear: 2022, isPopular: false },
  // A Series (budget)
  { brand: 'OPPO', model: 'A79', screenHz: 90, screenSize: 6.72, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Dimensity 6020', releaseYear: 2023, isPopular: false },
  { brand: 'OPPO', model: 'A78', screenHz: 90, screenSize: 6.56, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 680', releaseYear: 2023, isPopular: false },
  { brand: 'OPPO', model: 'A58', screenHz: 90, screenSize: 6.72, ramGb: 6, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2023, isPopular: false },
  { brand: 'OPPO', model: 'A38', screenHz: 90, screenSize: 6.56, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2023, isPopular: false },
  { brand: 'OPPO', model: 'A18', screenHz: 90, screenSize: 6.56, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2023, isPopular: false },
  { brand: 'OPPO', model: 'A17', screenHz: 60, screenSize: 6.56, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G35', releaseYear: 2022, isPopular: false },
  { brand: 'OPPO', model: 'A16', screenHz: 60, screenSize: 6.52, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G35', releaseYear: 2021, isPopular: false },
  // K Series
  { brand: 'OPPO', model: 'K12', screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 7 Gen 3', releaseYear: 2024, isPopular: false },
  // Mas OPPO legacy
  { brand: 'OPPO', model: 'Reno 8 Lite', screenHz: 60, screenSize: 6.43, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 695', releaseYear: 2022, isPopular: false },
  { brand: 'OPPO', model: 'Reno 7', screenHz: 90, screenSize: 6.43, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 680', releaseYear: 2022, isPopular: false },
  { brand: 'OPPO', model: 'A57', screenHz: 60, screenSize: 6.56, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G35', releaseYear: 2022, isPopular: false },
  { brand: 'OPPO', model: 'A55', screenHz: 60, screenSize: 6.51, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G35', releaseYear: 2021, isPopular: false },
  { brand: 'OPPO', model: 'A15', screenHz: 60, screenSize: 6.52, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Helio P35', releaseYear: 2020, isPopular: false },
  { brand: 'OPPO', model: 'A54', screenHz: 60, screenSize: 6.51, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio P35', releaseYear: 2021, isPopular: false },
];

// =============================================================================
// NOTHING (5 dispositivos)
// =============================================================================
export const nothingDevices: DeviceSeed[] = [
  { brand: 'Nothing', model: 'Phone (2a) Plus', screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 7350 Pro', releaseYear: 2024, isPopular: false },
  { brand: 'Nothing', model: 'Phone (2a)', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 7200 Pro', releaseYear: 2024, isPopular: false },
  { brand: 'Nothing', model: 'Phone (2)', screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'OLED', tier: 'HIGH', chipset: 'Snapdragon 8+ Gen 1', releaseYear: 2023, isPopular: false },
  { brand: 'Nothing', model: 'Phone (1)', screenHz: 120, screenSize: 6.55, ramGb: 8, panelType: 'OLED', tier: 'MID', chipset: 'Snapdragon 778G+', releaseYear: 2022, isPopular: false },
  { brand: 'Nothing', model: 'CMF Phone 1', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 7300', releaseYear: 2024, isPopular: false },
];

// =============================================================================
// GOOGLE PIXEL (10 dispositivos)
// =============================================================================
export const googleDevices: DeviceSeed[] = [
  { brand: 'Google', model: 'Pixel 9 Pro XL', screenHz: 120, screenSize: 6.8, ramGb: 16, panelType: 'OLED', tier: 'GAMING', chipset: 'Tensor G4', releaseYear: 2024, isPopular: false },
  { brand: 'Google', model: 'Pixel 9 Pro', screenHz: 120, screenSize: 6.3, ramGb: 16, panelType: 'OLED', tier: 'GAMING', chipset: 'Tensor G4', releaseYear: 2024, isPopular: false },
  { brand: 'Google', model: 'Pixel 9', screenHz: 120, screenSize: 6.3, ramGb: 12, panelType: 'OLED', tier: 'HIGH', chipset: 'Tensor G4', releaseYear: 2024, isPopular: false },
  { brand: 'Google', model: 'Pixel 8 Pro', screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'OLED', tier: 'GAMING', chipset: 'Tensor G3', releaseYear: 2023, isPopular: false },
  { brand: 'Google', model: 'Pixel 8', screenHz: 120, screenSize: 6.2, ramGb: 8, panelType: 'OLED', tier: 'HIGH', chipset: 'Tensor G3', releaseYear: 2023, isPopular: false },
  { brand: 'Google', model: 'Pixel 8a', screenHz: 120, screenSize: 6.1, ramGb: 8, panelType: 'OLED', tier: 'MID', chipset: 'Tensor G3', releaseYear: 2024, isPopular: false },
  { brand: 'Google', model: 'Pixel 7 Pro', screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'OLED', tier: 'HIGH', chipset: 'Tensor G2', releaseYear: 2022, isPopular: false },
  { brand: 'Google', model: 'Pixel 7', screenHz: 90, screenSize: 6.3, ramGb: 8, panelType: 'OLED', tier: 'MID', chipset: 'Tensor G2', releaseYear: 2022, isPopular: false },
  { brand: 'Google', model: 'Pixel 7a', screenHz: 90, screenSize: 6.1, ramGb: 8, panelType: 'OLED', tier: 'MID', chipset: 'Tensor G2', releaseYear: 2023, isPopular: false },
  { brand: 'Google', model: 'Pixel 6a', screenHz: 60, screenSize: 6.1, ramGb: 6, panelType: 'OLED', tier: 'MID', chipset: 'Tensor G1', releaseYear: 2022, isPopular: false },
];

// =============================================================================
// HUAWEI (12 dispositivos)
// =============================================================================
export const huaweiDevices: DeviceSeed[] = [
  { brand: 'Huawei', model: 'Mate 60 Pro', screenHz: 120, screenSize: 6.82, ramGb: 12, panelType: 'OLED', tier: 'GAMING', chipset: 'Kirin 9000S', releaseYear: 2023, isPopular: false },
  { brand: 'Huawei', model: 'Mate 60', screenHz: 120, screenSize: 6.69, ramGb: 12, panelType: 'OLED', tier: 'HIGH', chipset: 'Kirin 9000S', releaseYear: 2023, isPopular: false },
  { brand: 'Huawei', model: 'Pura 70 Pro', screenHz: 120, screenSize: 6.8, ramGb: 12, panelType: 'OLED', tier: 'GAMING', chipset: 'Kirin 9010', releaseYear: 2024, isPopular: false },
  { brand: 'Huawei', model: 'Nova 12 Ultra', screenHz: 120, screenSize: 6.76, ramGb: 12, panelType: 'OLED', tier: 'HIGH', chipset: 'Kirin 9000S', releaseYear: 2024, isPopular: false },
  { brand: 'Huawei', model: 'Nova 12', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'OLED', tier: 'MID', chipset: 'Snapdragon 778G', releaseYear: 2024, isPopular: false },
  { brand: 'Huawei', model: 'Nova 11', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'OLED', tier: 'MID', chipset: 'Snapdragon 778G', releaseYear: 2023, isPopular: false },
  { brand: 'Huawei', model: 'Nova 10', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'OLED', tier: 'MID', chipset: 'Snapdragon 778G', releaseYear: 2022, isPopular: false },
  { brand: 'Huawei', model: 'Y9a', screenHz: 60, screenSize: 6.63, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Helio G80', releaseYear: 2020, isPopular: false },
  { brand: 'Huawei', model: 'Y7a', screenHz: 60, screenSize: 6.67, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Kirin 710A', releaseYear: 2020, isPopular: false },
  { brand: 'Huawei', model: 'Y6p', screenHz: 60, screenSize: 6.3, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Helio P22', releaseYear: 2020, isPopular: false },
  { brand: 'Huawei', model: 'P30 Lite', screenHz: 60, screenSize: 6.15, ramGb: 4, panelType: 'LCD', tier: 'MID', chipset: 'Kirin 710', releaseYear: 2019, isPopular: false },
  { brand: 'Huawei', model: 'P Smart 2021', screenHz: 60, screenSize: 6.67, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Kirin 710A', releaseYear: 2020, isPopular: false },
  { brand: 'Huawei', model: 'P40 Pro', screenHz: 90, screenSize: 6.58, ramGb: 8, panelType: 'OLED', tier: 'HIGH', chipset: 'Kirin 990', releaseYear: 2020, isPopular: false },
  { brand: 'Huawei', model: 'P40 Lite', screenHz: 60, screenSize: 6.4, ramGb: 6, panelType: 'LCD', tier: 'MID', chipset: 'Kirin 810', releaseYear: 2020, isPopular: false },
  { brand: 'Huawei', model: 'Y9 Prime 2019', screenHz: 60, screenSize: 6.59, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Kirin 710F', releaseYear: 2019, isPopular: false },
  { brand: 'Huawei', model: 'Y5 (2019)', screenHz: 60, screenSize: 5.71, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Helio A22', releaseYear: 2019, isPopular: false },
  { brand: 'Huawei', model: 'Nova Y61', screenHz: 60, screenSize: 6.52, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio P35', releaseYear: 2022, isPopular: false },
];

// =============================================================================
// ZTE / NUBIA (8 dispositivos — gaming phones)
// =============================================================================
export const zteDevices: DeviceSeed[] = [
  { brand: 'ZTE', model: 'Nubia Red Magic 9 Pro', screenHz: 120, screenSize: 6.8, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'ZTE', model: 'Nubia Red Magic 8 Pro', screenHz: 120, screenSize: 6.8, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: false },
  { brand: 'ZTE', model: 'Nubia Z60 Ultra', screenHz: 120, screenSize: 6.85, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'ZTE', model: 'Blade V50 Vita', screenHz: 90, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Unisoc T606', releaseYear: 2024, isPopular: false },
  { brand: 'ZTE', model: 'Blade A73', screenHz: 90, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Unisoc T606', releaseYear: 2023, isPopular: false },
  { brand: 'ZTE', model: 'Blade A54', screenHz: 60, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Unisoc T606', releaseYear: 2023, isPopular: false },
  { brand: 'ZTE', model: 'Blade V40', screenHz: 60, screenSize: 6.67, ramGb: 6, panelType: 'LCD', tier: 'MID', chipset: 'Dimensity 700', releaseYear: 2022, isPopular: false },
  { brand: 'ZTE', model: 'Blade A52', screenHz: 60, screenSize: 6.52, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Unisoc SC9863A', releaseYear: 2022, isPopular: false },
];

// =============================================================================
// ASUS ROG / ZENFONE (6 dispositivos — gaming)
// =============================================================================
export const asusDevices: DeviceSeed[] = [
  { brand: 'ASUS', model: 'ROG Phone 8 Pro', screenHz: 165, screenSize: 6.78, ramGb: 24, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'ASUS', model: 'ROG Phone 8', screenHz: 165, screenSize: 6.78, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'ASUS', model: 'ROG Phone 7 Ultimate', screenHz: 165, screenSize: 6.78, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: false },
  { brand: 'ASUS', model: 'ROG Phone 7', screenHz: 165, screenSize: 6.78, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: false },
  { brand: 'ASUS', model: 'Zenfone 11 Ultra', screenHz: 120, screenSize: 6.78, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'ASUS', model: 'Zenfone 10', screenHz: 144, screenSize: 5.92, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: false },
];

// =============================================================================
// SONY XPERIA (4 dispositivos)
// =============================================================================
export const sonyDevices: DeviceSeed[] = [
  { brand: 'Sony', model: 'Xperia 1 VI', screenHz: 120, screenSize: 6.5, ramGb: 12, panelType: 'OLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Sony', model: 'Xperia 1 V', screenHz: 120, screenSize: 6.5, ramGb: 12, panelType: 'OLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: false },
  { brand: 'Sony', model: 'Xperia 10 VI', screenHz: 60, screenSize: 6.1, ramGb: 6, panelType: 'OLED', tier: 'MID', chipset: 'Snapdragon 6 Gen 1', releaseYear: 2024, isPopular: false },
  { brand: 'Sony', model: 'Xperia 10 V', screenHz: 60, screenSize: 6.1, ramGb: 6, panelType: 'OLED', tier: 'MID', chipset: 'Snapdragon 695', releaseYear: 2023, isPopular: false },
];

// =============================================================================
// LG (dispositivos legacy — aun usados en LATAM)
// =============================================================================
export const lgDevices: DeviceSeed[] = [
  { brand: 'LG', model: 'Velvet', screenHz: 60, screenSize: 6.8, ramGb: 6, panelType: 'OLED', tier: 'MID', chipset: 'Snapdragon 765G', releaseYear: 2020, isPopular: false },
  { brand: 'LG', model: 'K62', screenHz: 60, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio P35', releaseYear: 2020, isPopular: false },
  { brand: 'LG', model: 'K52', screenHz: 60, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio P35', releaseYear: 2021, isPopular: false },
  { brand: 'LG', model: 'K42', screenHz: 60, screenSize: 6.6, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Helio P22', releaseYear: 2021, isPopular: false },
  { brand: 'LG', model: 'Stylo 6', screenHz: 60, screenSize: 6.8, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Helio P35', releaseYear: 2020, isPopular: false },
];

// =============================================================================
// NOKIA (5 dispositivos — budget)
// =============================================================================
export const nokiaDevices: DeviceSeed[] = [
  { brand: 'Nokia', model: 'G42', screenHz: 90, screenSize: 6.56, ramGb: 6, panelType: 'LCD', tier: 'MID', chipset: 'Snapdragon 480+', releaseYear: 2023, isPopular: false },
  { brand: 'Nokia', model: 'G22', screenHz: 90, screenSize: 6.52, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G37', releaseYear: 2023, isPopular: false },
  { brand: 'Nokia', model: 'G21', screenHz: 90, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Unisoc T606', releaseYear: 2022, isPopular: false },
  { brand: 'Nokia', model: 'C32', screenHz: 60, screenSize: 6.5, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Unisoc SC9863A', releaseYear: 2023, isPopular: false },
  { brand: 'Nokia', model: 'C22', screenHz: 60, screenSize: 6.5, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Unisoc SC9863A', releaseYear: 2023, isPopular: false },
  { brand: 'Nokia', model: 'X30', screenHz: 90, screenSize: 6.43, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 695', releaseYear: 2022, isPopular: false },
  { brand: 'Nokia', model: 'G60', screenHz: 120, screenSize: 6.58, ramGb: 6, panelType: 'LCD', tier: 'MID', chipset: 'Snapdragon 695', releaseYear: 2022, isPopular: false },
  { brand: 'Nokia', model: 'G50', screenHz: 60, screenSize: 6.82, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 480', releaseYear: 2021, isPopular: false },
  { brand: 'Nokia', model: 'G20', screenHz: 60, screenSize: 6.52, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G35', releaseYear: 2021, isPopular: false },
  { brand: 'Nokia', model: 'C31', screenHz: 60, screenSize: 6.74, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Unisoc SC9863A', releaseYear: 2022, isPopular: false },
  { brand: 'Nokia', model: 'C21 Plus', screenHz: 60, screenSize: 6.52, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Unisoc SC9863A', releaseYear: 2022, isPopular: false },
];

// =============================================================================
// ALCATEL / TCL (5 dispositivos — budget LATAM)
// =============================================================================
export const tclDevices: DeviceSeed[] = [
  { brand: 'TCL', model: '50 SE', screenHz: 90, screenSize: 6.78, ramGb: 6, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G37', releaseYear: 2024, isPopular: false },
  { brand: 'TCL', model: '40 NxtPaper', screenHz: 90, screenSize: 6.6, ramGb: 6, panelType: 'LCD', tier: 'MID', chipset: 'Helio G88', releaseYear: 2023, isPopular: false },
  { brand: 'TCL', model: '30 SE', screenHz: 60, screenSize: 6.52, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G25', releaseYear: 2022, isPopular: false },
  { brand: 'TCL', model: '305i', screenHz: 60, screenSize: 6.52, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Helio A22', releaseYear: 2022, isPopular: false },
  { brand: 'Alcatel', model: '3L (2021)', screenHz: 60, screenSize: 6.52, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio P22', releaseYear: 2021, isPopular: false },
  { brand: 'TCL', model: '40 SE', screenHz: 60, screenSize: 6.75, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G37', releaseYear: 2023, isPopular: false },
  { brand: 'TCL', model: '403', screenHz: 60, screenSize: 6.0, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Helio A22', releaseYear: 2022, isPopular: false },
  { brand: 'Alcatel', model: '1SE (2020)', screenHz: 60, screenSize: 6.22, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Helio P22', releaseYear: 2020, isPopular: false },
];

// =============================================================================
// LENOVO (6 dispositivos — tablets gaming)
// =============================================================================
export const lenovoDevices: DeviceSeed[] = [
  { brand: 'Lenovo', model: 'Legion Y90', screenHz: 144, screenSize: 6.92, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 1', releaseYear: 2022, isPopular: false },
  { brand: 'Lenovo', model: 'Legion Phone Duel 2', screenHz: 144, screenSize: 6.92, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 888', releaseYear: 2021, isPopular: false },
  { brand: 'Lenovo', model: 'K14 Plus', screenHz: 60, screenSize: 6.52, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G35', releaseYear: 2022, isPopular: false },
  { brand: 'Lenovo', model: 'Tab M10 Plus 3rd Gen', screenHz: 60, screenSize: 10.6, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 680', releaseYear: 2022, isPopular: false },
  { brand: 'Lenovo', model: 'Tab P11 Pro 2nd Gen', screenHz: 120, screenSize: 11.2, ramGb: 6, panelType: 'OLED', tier: 'MID', chipset: 'Kompanio 1300T', releaseYear: 2022, isPopular: false },
  { brand: 'Lenovo', model: 'Tab M9', screenHz: 60, screenSize: 9.0, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G80', releaseYear: 2023, isPopular: false },
];

// =============================================================================
// MICROMAX / LAVA / CELKON (dispositivos India/LATAM budget — 8 dispositivos)
// =============================================================================
export const budgetBrandDevices: DeviceSeed[] = [
  // Lava (presentes en mercados emergentes)
  { brand: 'Lava', model: 'Blaze 5G', screenHz: 90, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Dimensity 700', releaseYear: 2022, isPopular: false },
  { brand: 'Lava', model: 'Agni 2', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 7050', releaseYear: 2023, isPopular: false },
  { brand: 'Lava', model: 'Yuva 3', screenHz: 90, screenSize: 6.56, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G37', releaseYear: 2023, isPopular: false },
  { brand: 'Lava', model: 'Storm 5G', screenHz: 90, screenSize: 6.56, ramGb: 6, panelType: 'LCD', tier: 'MID', chipset: 'Dimensity 6020', releaseYear: 2024, isPopular: false },
  // BLU (popular en LATAM/USA budget)
  { brand: 'BLU', model: 'G91 Pro', screenHz: 90, screenSize: 6.8, ramGb: 6, panelType: 'LCD', tier: 'MID', chipset: 'Helio G95', releaseYear: 2022, isPopular: false },
  { brand: 'BLU', model: 'G71+', screenHz: 60, screenSize: 6.5, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Helio A25', releaseYear: 2022, isPopular: false },
  { brand: 'BLU', model: 'View 4', screenHz: 60, screenSize: 6.52, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Helio A25', releaseYear: 2023, isPopular: false },
  { brand: 'BLU', model: 'F91', screenHz: 60, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G25', releaseYear: 2022, isPopular: false },
  // Mas BLU budget LATAM
  { brand: 'BLU', model: 'Bold N3', screenHz: 90, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G37', releaseYear: 2023, isPopular: false },
  { brand: 'BLU', model: 'G93', screenHz: 60, screenSize: 6.4, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G37', releaseYear: 2023, isPopular: false },
  // iPad (para gamers tablet)
  { brand: 'Apple', model: 'iPad 10th Gen', screenHz: 60, screenSize: 10.9, ramGb: 4, panelType: 'LCD', tier: 'MID', chipset: 'A14 Bionic', releaseYear: 2022, isPopular: false },
  { brand: 'Apple', model: 'iPad Air M2', screenHz: 60, screenSize: 10.9, ramGb: 8, panelType: 'LCD', tier: 'HIGH', chipset: 'Apple M2', releaseYear: 2024, isPopular: false },
  { brand: 'Apple', model: 'iPad Mini 6th Gen', screenHz: 60, screenSize: 8.3, ramGb: 4, panelType: 'LCD', tier: 'MID', chipset: 'A15 Bionic', releaseYear: 2021, isPopular: false },
  // Mas Samsung Galaxy S legacy
  { brand: 'Samsung', model: 'Galaxy S9+', screenHz: 60, screenSize: 6.2, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Exynos 9810', releaseYear: 2018, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S9', screenHz: 60, screenSize: 5.8, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Exynos 9810', releaseYear: 2018, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S8+', screenHz: 60, screenSize: 6.2, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Exynos 8895', releaseYear: 2017, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S8', screenHz: 60, screenSize: 5.8, ramGb: 4, panelType: 'AMOLED', tier: 'LOW', chipset: 'Exynos 8895', releaseYear: 2017, isPopular: false },
  // Mas Samsung Galaxy Tab
  { brand: 'Samsung', model: 'Galaxy Tab S9', screenHz: 120, screenSize: 11.0, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy Tab S6 Lite (2024)', screenHz: 60, screenSize: 10.4, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Exynos 1280', releaseYear: 2024, isPopular: false },
  // Mas Motorola
  { brand: 'Motorola', model: 'Moto G7 Plus', screenHz: 60, screenSize: 6.2, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 636', releaseYear: 2019, isPopular: false },
  { brand: 'Motorola', model: 'Moto G7 Power', screenHz: 60, screenSize: 6.2, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 632', releaseYear: 2019, isPopular: false },
  { brand: 'Motorola', model: 'Moto G6', screenHz: 60, screenSize: 5.7, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 450', releaseYear: 2018, isPopular: false },
  // Mas Redmi budget legacy
  { brand: 'Redmi', model: '6A', screenHz: 60, screenSize: 5.45, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Helio A22', releaseYear: 2018, isPopular: false },
  { brand: 'Redmi', model: '5 Plus', screenHz: 60, screenSize: 5.99, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 625', releaseYear: 2018, isPopular: false },
  // OnePlus legacy
  { brand: 'OnePlus', model: '7T', screenHz: 90, screenSize: 6.55, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 855+', releaseYear: 2019, isPopular: false },
  { brand: 'OnePlus', model: '7', screenHz: 60, screenSize: 6.41, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 855', releaseYear: 2019, isPopular: false },
  { brand: 'OnePlus', model: '6T', screenHz: 60, screenSize: 6.41, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 845', releaseYear: 2018, isPopular: false },
  // Mas Samsung Galaxy legacy populares en LATAM
  { brand: 'Samsung', model: 'Galaxy A01', screenHz: 60, screenSize: 5.7, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 439', releaseYear: 2020, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A01 Core', screenHz: 60, screenSize: 5.3, ramGb: 1, panelType: 'LCD', tier: 'LOW', chipset: 'Helio A22', releaseYear: 2020, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A70', screenHz: 60, screenSize: 6.7, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 675', releaseYear: 2019, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy A11', screenHz: 60, screenSize: 6.4, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 450', releaseYear: 2020, isPopular: false },
  // Mas Xiaomi
  { brand: 'Xiaomi', model: 'Mi 9 Lite', screenHz: 60, screenSize: 6.39, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 710', releaseYear: 2019, isPopular: false },
  { brand: 'Xiaomi', model: 'Mi 8 Lite', screenHz: 60, screenSize: 6.26, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 660', releaseYear: 2018, isPopular: false },
];

// =============================================================================
// EXPORT TODOS LOS DISPOSITIVOS
// =============================================================================
export const ALL_DEVICES: DeviceSeed[] = [
  ...samsungDevices,
  ...xiaomiDevices,
  ...redmiDevices,
  ...pocoDevices,
  ...motorolaDevices,
  ...appleDevices,
  ...realmeDevices,
  ...infinixDevices,
  ...tecnoDevices,
  ...honorDevices,
  ...oneplusDevices,
  ...vivoDevices,
  ...oppoDevices,
  ...nothingDevices,
  ...googleDevices,
  ...huaweiDevices,
  ...zteDevices,
  ...asusDevices,
  ...sonyDevices,
  ...lgDevices,
  ...nokiaDevices,
  ...tclDevices,
  ...lenovoDevices,
  ...budgetBrandDevices,
];
