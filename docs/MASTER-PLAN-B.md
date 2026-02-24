# ARES SensiPRO — MASTER PLAN B
# ══════════════════════════════════════════════════════════════
# FASE 1 — MOTOR DE SENSIBILIDADES (10 scripts: ARES-100 → ARES-109)
# "El cerebro que genera sensibilidades basadas en hardware real"
# ══════════════════════════════════════════════════════════════
#
# Este archivo contiene las instrucciones EXACTAS para los 10 scripts
# del motor de sensibilidades — el core del producto ARES.
#
# Aquí se define el algoritmo, la base de datos de dispositivos,
# el motor de giroscopio, los estilos de juego, y todas las features
# que hacen que ARES sea superior a SystemWoods.
# ══════════════════════════════════════════════════════════════

## Instrucciones para Claude Code

1. **Lee CLAUDE.md** para convenciones y arquitectura
2. **Lee PROGRESS.md** para ver el estado actual
3. **Busca el script en este archivo** por su nombre exacto
4. **Crea TODOS los archivos listados** — código completo, sin TODOs
5. **Usa @ares/* packages** para imports: types, utils, errors, logger, config
6. **Después de terminar**: actualiza PROGRESS.md, git commit + push

---

# ████████████████████████████████████████████████████████████
# █                                                          █
# █   FASE 1 — MOTOR DE SENSIBILIDADES                      █
# █   Scripts 9-18 | El cerebro de ARES                      █
# █                                                          █
# ████████████████████████████████████████████████████████████

---

# ═══════════════════════════════════════════════════════════════
# CORE: BASE DE DATOS + ALGORITMO (Scripts 009-013)
# ═══════════════════════════════════════════════════════════════

## ARES-100-device-database

**Fase:** 1 | **Prioridad:** CRÍTICO
**Dependencias:** ARES-001-database-foundation, ARES-002-shared-libraries
**Descripción:** Crea la base de datos de 500+ dispositivos reales con specs verificadas (screenHz, screenSize, ramGb, panelType, tier, chipset), API de búsqueda, y seed masivo organizado por marca.

### Archivos a crear:

```
[ARCHIVO] packages/database/prisma/seeds/devices.ts
```
```typescript
/**
 * ARES Device Database — 500+ dispositivos reales
 *
 * Specs verificadas de GSMArena y fuentes oficiales.
 * Cada dispositivo tiene: brand, model, screenHz, screenSize, ramGb,
 * panelType, tier (LOW/MID/HIGH/GAMING), chipset, releaseYear, isPopular.
 *
 * TIERS:
 *   LOW    → <60Hz, <3GB RAM, LCD
 *   MID    → 60-90Hz, 4-6GB RAM, LCD/AMOLED
 *   HIGH   → 90-120Hz, 6-8GB RAM, AMOLED
 *   GAMING → 120Hz+, 8GB+ RAM, AMOLED, gaming chipset
 */

interface DeviceSeed {
  brand: string;
  model: string;
  screenHz: number;
  screenSize: number;
  ramGb: number;
  panelType: 'LCD' | 'IPS' | 'AMOLED' | 'OLED';
  tier: 'LOW' | 'MID' | 'HIGH' | 'GAMING';
  chipset: string;
  releaseYear: number;
  isPopular: boolean;
}

// ═══════════════════════════════════════════════════════════
// SAMSUNG (80+ dispositivos)
// ═══════════════════════════════════════════════════════════
export const samsungDevices: DeviceSeed[] = [
  // Galaxy S24 Series
  { brand: 'Samsung', model: 'Galaxy S24 Ultra', screenHz: 120, screenSize: 6.8, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy S24+', screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy S24', screenHz: 120, screenSize: 6.2, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Exynos 2400', releaseYear: 2024, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy S24 FE', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Exynos 2400e', releaseYear: 2024, isPopular: true },
  // Galaxy S23 Series
  { brand: 'Samsung', model: 'Galaxy S23 Ultra', screenHz: 120, screenSize: 6.8, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy S23+', screenHz: 120, screenSize: 6.6, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S23', screenHz: 120, screenSize: 6.1, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S23 FE', screenHz: 120, screenSize: 6.4, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Exynos 2200', releaseYear: 2023, isPopular: false },
  // Galaxy S22 Series
  { brand: 'Samsung', model: 'Galaxy S22 Ultra', screenHz: 120, screenSize: 6.8, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 1', releaseYear: 2022, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S22+', screenHz: 120, screenSize: 6.6, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8 Gen 1', releaseYear: 2022, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S22', screenHz: 120, screenSize: 6.1, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Exynos 2200', releaseYear: 2022, isPopular: false },
  // Galaxy S21 Series
  { brand: 'Samsung', model: 'Galaxy S21 Ultra', screenHz: 120, screenSize: 6.8, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Exynos 2100', releaseYear: 2021, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S21+', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Exynos 2100', releaseYear: 2021, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S21', screenHz: 120, screenSize: 6.2, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Exynos 2100', releaseYear: 2021, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy S21 FE', screenHz: 120, screenSize: 6.4, ramGb: 6, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 888', releaseYear: 2022, isPopular: false },
  // Galaxy A Series (MUY populares en LATAM)
  { brand: 'Samsung', model: 'Galaxy A55', screenHz: 120, screenSize: 6.6, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Exynos 1480', releaseYear: 2024, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy A54', screenHz: 120, screenSize: 6.4, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Exynos 1380', releaseYear: 2023, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy A53', screenHz: 120, screenSize: 6.5, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Exynos 1280', releaseYear: 2022, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy A35', screenHz: 120, screenSize: 6.6, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Exynos 1380', releaseYear: 2024, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy A34', screenHz: 120, screenSize: 6.6, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 1080', releaseYear: 2023, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy A25', screenHz: 120, screenSize: 6.5, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Exynos 1280', releaseYear: 2023, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy A24', screenHz: 90, screenSize: 6.5, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G99', releaseYear: 2023, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy A15', screenHz: 90, screenSize: 6.5, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G99', releaseYear: 2023, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy A14', screenHz: 90, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G80', releaseYear: 2023, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy A05', screenHz: 60, screenSize: 6.7, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2023, isPopular: true },
  { brand: 'Samsung', model: 'Galaxy A05s', screenHz: 60, screenSize: 6.7, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 680', releaseYear: 2023, isPopular: false },
  // Galaxy M Series
  { brand: 'Samsung', model: 'Galaxy M55', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 7 Gen 1', releaseYear: 2024, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy M34', screenHz: 120, screenSize: 6.5, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Exynos 1280', releaseYear: 2023, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy M14', screenHz: 90, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Exynos 1330', releaseYear: 2023, isPopular: false },
  // Galaxy Z Fold/Flip
  { brand: 'Samsung', model: 'Galaxy Z Fold5', screenHz: 120, screenSize: 7.6, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: false },
  { brand: 'Samsung', model: 'Galaxy Z Flip5', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: false },
];

// ═══════════════════════════════════════════════════════════
// XIAOMI / REDMI / POCO (80+ dispositivos)
// ═══════════════════════════════════════════════════════════
export const xiaomiDevices: DeviceSeed[] = [
  // Xiaomi flagship
  { brand: 'Xiaomi', model: '14 Ultra', screenHz: 120, screenSize: 6.73, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Xiaomi', model: '14', screenHz: 120, screenSize: 6.36, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Xiaomi', model: '13T Pro', screenHz: 144, screenSize: 6.67, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Dimensity 9200+', releaseYear: 2023, isPopular: false },
  { brand: 'Xiaomi', model: '13T', screenHz: 144, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 8200 Ultra', releaseYear: 2023, isPopular: false },
  // Redmi Note Series (SUPER populares en LATAM)
  { brand: 'Redmi', model: 'Note 13 Pro+', screenHz: 120, screenSize: 6.67, ramGb: 12, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 7200 Ultra', releaseYear: 2024, isPopular: true },
  { brand: 'Redmi', model: 'Note 13 Pro', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 7s Gen 2', releaseYear: 2024, isPopular: true },
  { brand: 'Redmi', model: 'Note 13', screenHz: 120, screenSize: 6.67, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 685', releaseYear: 2024, isPopular: true },
  { brand: 'Redmi', model: 'Note 13 5G', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 6080', releaseYear: 2024, isPopular: true },
  { brand: 'Redmi', model: 'Note 12 Pro+', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 1080', releaseYear: 2023, isPopular: true },
  { brand: 'Redmi', model: 'Note 12 Pro', screenHz: 120, screenSize: 6.67, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 1080', releaseYear: 2023, isPopular: true },
  { brand: 'Redmi', model: 'Note 12', screenHz: 120, screenSize: 6.67, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 685', releaseYear: 2023, isPopular: true },
  { brand: 'Redmi', model: 'Note 11 Pro', screenHz: 120, screenSize: 6.67, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G96', releaseYear: 2022, isPopular: false },
  { brand: 'Redmi', model: 'Note 11', screenHz: 90, screenSize: 6.43, ramGb: 4, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 680', releaseYear: 2022, isPopular: false },
  { brand: 'Redmi', model: 'Note 10 Pro', screenHz: 120, screenSize: 6.67, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 732G', releaseYear: 2021, isPopular: false },
  // Redmi Budget
  { brand: 'Redmi', model: '13C', screenHz: 90, screenSize: 6.74, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2023, isPopular: true },
  { brand: 'Redmi', model: '12', screenHz: 90, screenSize: 6.79, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G88', releaseYear: 2023, isPopular: true },
  { brand: 'Redmi', model: 'A3', screenHz: 90, screenSize: 6.71, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G36', releaseYear: 2024, isPopular: true },
  // POCO
  { brand: 'POCO', model: 'F6 Pro', screenHz: 120, screenSize: 6.67, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8s Gen 3', releaseYear: 2024, isPopular: true },
  { brand: 'POCO', model: 'F6', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8s Gen 3', releaseYear: 2024, isPopular: true },
  { brand: 'POCO', model: 'F5', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 7+ Gen 2', releaseYear: 2023, isPopular: true },
  { brand: 'POCO', model: 'X6 Pro', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 8300 Ultra', releaseYear: 2024, isPopular: true },
  { brand: 'POCO', model: 'X6', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 7s Gen 2', releaseYear: 2024, isPopular: false },
  { brand: 'POCO', model: 'X5 Pro', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 778G', releaseYear: 2023, isPopular: false },
  { brand: 'POCO', model: 'M6 Pro', screenHz: 120, screenSize: 6.67, ramGb: 6, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G99 Ultra', releaseYear: 2023, isPopular: false },
  { brand: 'POCO', model: 'M5', screenHz: 90, screenSize: 6.58, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G99', releaseYear: 2022, isPopular: false },
  { brand: 'POCO', model: 'C65', screenHz: 90, screenSize: 6.74, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2024, isPopular: false },
];

// ═══════════════════════════════════════════════════════════
// MOTOROLA (30+ dispositivos)
// ═══════════════════════════════════════════════════════════
export const motorolaDevices: DeviceSeed[] = [
  { brand: 'Motorola', model: 'Edge 50 Ultra', screenHz: 144, screenSize: 6.7, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8s Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Motorola', model: 'Edge 50 Pro', screenHz: 144, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 7 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Motorola', model: 'Edge 40 Pro', screenHz: 165, screenSize: 6.67, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2023, isPopular: false },
  { brand: 'Motorola', model: 'Moto G84', screenHz: 120, screenSize: 6.55, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 695', releaseYear: 2023, isPopular: true },
  { brand: 'Motorola', model: 'Moto G73', screenHz: 120, screenSize: 6.5, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Dimensity 930', releaseYear: 2023, isPopular: false },
  { brand: 'Motorola', model: 'Moto G54', screenHz: 120, screenSize: 6.5, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Dimensity 7020', releaseYear: 2023, isPopular: true },
  { brand: 'Motorola', model: 'Moto G34', screenHz: 120, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 695', releaseYear: 2023, isPopular: false },
  { brand: 'Motorola', model: 'Moto G24', screenHz: 90, screenSize: 6.56, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2024, isPopular: true },
  { brand: 'Motorola', model: 'Moto G14', screenHz: 60, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G37', releaseYear: 2023, isPopular: false },
  { brand: 'Motorola', model: 'Moto G04', screenHz: 60, screenSize: 6.56, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G36', releaseYear: 2024, isPopular: false },
  { brand: 'Motorola', model: 'Moto E14', screenHz: 60, screenSize: 6.56, ramGb: 2, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G36', releaseYear: 2024, isPopular: false },
];

// ═══════════════════════════════════════════════════════════
// APPLE (15+ dispositivos — iPhone)
// ═══════════════════════════════════════════════════════════
export const appleDevices: DeviceSeed[] = [
  { brand: 'Apple', model: 'iPhone 15 Pro Max', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'OLED', tier: 'GAMING', chipset: 'A17 Pro', releaseYear: 2023, isPopular: true },
  { brand: 'Apple', model: 'iPhone 15 Pro', screenHz: 120, screenSize: 6.1, ramGb: 8, panelType: 'OLED', tier: 'GAMING', chipset: 'A17 Pro', releaseYear: 2023, isPopular: true },
  { brand: 'Apple', model: 'iPhone 15 Plus', screenHz: 60, screenSize: 6.7, ramGb: 6, panelType: 'OLED', tier: 'HIGH', chipset: 'A16 Bionic', releaseYear: 2023, isPopular: false },
  { brand: 'Apple', model: 'iPhone 15', screenHz: 60, screenSize: 6.1, ramGb: 6, panelType: 'OLED', tier: 'HIGH', chipset: 'A16 Bionic', releaseYear: 2023, isPopular: true },
  { brand: 'Apple', model: 'iPhone 14 Pro Max', screenHz: 120, screenSize: 6.7, ramGb: 6, panelType: 'OLED', tier: 'GAMING', chipset: 'A16 Bionic', releaseYear: 2022, isPopular: false },
  { brand: 'Apple', model: 'iPhone 14 Pro', screenHz: 120, screenSize: 6.1, ramGb: 6, panelType: 'OLED', tier: 'GAMING', chipset: 'A16 Bionic', releaseYear: 2022, isPopular: false },
  { brand: 'Apple', model: 'iPhone 14', screenHz: 60, screenSize: 6.1, ramGb: 6, panelType: 'OLED', tier: 'HIGH', chipset: 'A15 Bionic', releaseYear: 2022, isPopular: false },
  { brand: 'Apple', model: 'iPhone 13 Pro Max', screenHz: 120, screenSize: 6.7, ramGb: 6, panelType: 'OLED', tier: 'GAMING', chipset: 'A15 Bionic', releaseYear: 2021, isPopular: false },
  { brand: 'Apple', model: 'iPhone 13 Pro', screenHz: 120, screenSize: 6.1, ramGb: 6, panelType: 'OLED', tier: 'HIGH', chipset: 'A15 Bionic', releaseYear: 2021, isPopular: false },
  { brand: 'Apple', model: 'iPhone 13', screenHz: 60, screenSize: 6.1, ramGb: 4, panelType: 'OLED', tier: 'HIGH', chipset: 'A15 Bionic', releaseYear: 2021, isPopular: false },
  { brand: 'Apple', model: 'iPhone 12', screenHz: 60, screenSize: 6.1, ramGb: 4, panelType: 'OLED', tier: 'MID', chipset: 'A14 Bionic', releaseYear: 2020, isPopular: false },
  { brand: 'Apple', model: 'iPhone 11', screenHz: 60, screenSize: 6.1, ramGb: 4, panelType: 'LCD', tier: 'MID', chipset: 'A13 Bionic', releaseYear: 2019, isPopular: false },
  { brand: 'Apple', model: 'iPhone SE (2022)', screenHz: 60, screenSize: 4.7, ramGb: 4, panelType: 'LCD', tier: 'MID', chipset: 'A15 Bionic', releaseYear: 2022, isPopular: false },
];

// ═══════════════════════════════════════════════════════════
// REALME (25+ dispositivos)
// ═══════════════════════════════════════════════════════════
export const realmeDevices: DeviceSeed[] = [
  { brand: 'Realme', model: 'GT5 Pro', screenHz: 144, screenSize: 6.78, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Realme', model: 'GT Neo 5', screenHz: 144, screenSize: 6.74, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8+ Gen 1', releaseYear: 2023, isPopular: false },
  { brand: 'Realme', model: '12 Pro+', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 7s Gen 2', releaseYear: 2024, isPopular: false },
  { brand: 'Realme', model: '12 Pro', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 6 Gen 1', releaseYear: 2024, isPopular: false },
  { brand: 'Realme', model: '11 Pro+', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 7050', releaseYear: 2023, isPopular: false },
  { brand: 'Realme', model: 'C67', screenHz: 90, screenSize: 6.72, ramGb: 6, panelType: 'LCD', tier: 'LOW', chipset: 'Snapdragon 685', releaseYear: 2023, isPopular: true },
  { brand: 'Realme', model: 'C55', screenHz: 90, screenSize: 6.72, ramGb: 6, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G88', releaseYear: 2023, isPopular: false },
  { brand: 'Realme', model: 'C53', screenHz: 90, screenSize: 6.74, ramGb: 6, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G85', releaseYear: 2023, isPopular: false },
  { brand: 'Realme', model: 'Narzo 60 Pro', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 7050', releaseYear: 2023, isPopular: false },
];

// ═══════════════════════════════════════════════════════════
// MÁS MARCAS (Infinix, Tecno, Honor, OnePlus, Vivo, OPPO, Huawei, Nothing, Google)
// ═══════════════════════════════════════════════════════════
export const otherBrandDevices: DeviceSeed[] = [
  // Infinix (populares en LATAM por precio bajo)
  { brand: 'Infinix', model: 'GT 20 Pro', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 8200', releaseYear: 2024, isPopular: false },
  { brand: 'Infinix', model: 'Note 40 Pro', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Helio G99', releaseYear: 2024, isPopular: false },
  { brand: 'Infinix', model: 'Hot 40 Pro', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Helio G99', releaseYear: 2024, isPopular: true },
  { brand: 'Infinix', model: 'Hot 30', screenHz: 90, screenSize: 6.78, ramGb: 4, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G88', releaseYear: 2023, isPopular: false },
  { brand: 'Infinix', model: 'Smart 8', screenHz: 90, screenSize: 6.6, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Helio G36', releaseYear: 2023, isPopular: false },
  // Tecno
  { brand: 'Tecno', model: 'Camon 30 Premier', screenHz: 120, screenSize: 6.77, ramGb: 12, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 8200', releaseYear: 2024, isPopular: false },
  { brand: 'Tecno', model: 'Pova 6 Pro', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Dimensity 6080', releaseYear: 2024, isPopular: true },
  { brand: 'Tecno', model: 'Spark 20 Pro+', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Helio G99', releaseYear: 2024, isPopular: false },
  { brand: 'Tecno', model: 'Pop 8', screenHz: 60, screenSize: 6.56, ramGb: 3, panelType: 'LCD', tier: 'LOW', chipset: 'Helio A22', releaseYear: 2024, isPopular: false },
  // Honor
  { brand: 'Honor', model: 'Magic6 Pro', screenHz: 120, screenSize: 6.78, ramGb: 12, panelType: 'OLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Honor', model: '200 Pro', screenHz: 120, screenSize: 6.78, ramGb: 12, panelType: 'OLED', tier: 'HIGH', chipset: 'Snapdragon 8s Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Honor', model: 'X8b', screenHz: 90, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 680', releaseYear: 2024, isPopular: false },
  // OnePlus
  { brand: 'OnePlus', model: '12', screenHz: 120, screenSize: 6.82, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'OnePlus', model: '12R', screenHz: 120, screenSize: 6.78, ramGb: 8, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 8 Gen 2', releaseYear: 2024, isPopular: false },
  { brand: 'OnePlus', model: 'Nord CE4', screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Snapdragon 7 Gen 3', releaseYear: 2024, isPopular: false },
  // Vivo
  { brand: 'Vivo', model: 'X100 Pro', screenHz: 120, screenSize: 6.78, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Dimensity 9300', releaseYear: 2024, isPopular: false },
  { brand: 'Vivo', model: 'V30 Pro', screenHz: 120, screenSize: 6.78, ramGb: 12, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Snapdragon 7 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'Vivo', model: 'Y36', screenHz: 90, screenSize: 6.64, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Snapdragon 680', releaseYear: 2023, isPopular: false },
  // OPPO
  { brand: 'OPPO', model: 'Find X7 Ultra', screenHz: 120, screenSize: 6.82, ramGb: 16, panelType: 'AMOLED', tier: 'GAMING', chipset: 'Snapdragon 8 Gen 3', releaseYear: 2024, isPopular: false },
  { brand: 'OPPO', model: 'Reno 11 Pro', screenHz: 120, screenSize: 6.74, ramGb: 12, panelType: 'AMOLED', tier: 'HIGH', chipset: 'Dimensity 8200', releaseYear: 2024, isPopular: false },
  { brand: 'OPPO', model: 'A79', screenHz: 90, screenSize: 6.72, ramGb: 8, panelType: 'LCD', tier: 'MID', chipset: 'Dimensity 6020', releaseYear: 2023, isPopular: false },
  // Nothing
  { brand: 'Nothing', model: 'Phone (2a)', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED', tier: 'MID', chipset: 'Dimensity 7200 Pro', releaseYear: 2024, isPopular: false },
  { brand: 'Nothing', model: 'Phone (2)', screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'OLED', tier: 'HIGH', chipset: 'Snapdragon 8+ Gen 1', releaseYear: 2023, isPopular: false },
  // Google Pixel
  { brand: 'Google', model: 'Pixel 8 Pro', screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'OLED', tier: 'GAMING', chipset: 'Tensor G3', releaseYear: 2023, isPopular: false },
  { brand: 'Google', model: 'Pixel 8', screenHz: 120, screenSize: 6.2, ramGb: 8, panelType: 'OLED', tier: 'HIGH', chipset: 'Tensor G3', releaseYear: 2023, isPopular: false },
  { brand: 'Google', model: 'Pixel 7a', screenHz: 90, screenSize: 6.1, ramGb: 8, panelType: 'OLED', tier: 'MID', chipset: 'Tensor G2', releaseYear: 2023, isPopular: false },
  // Huawei (sin Google services pero aún usados)
  { brand: 'Huawei', model: 'Nova 12 Ultra', screenHz: 120, screenSize: 6.76, ramGb: 12, panelType: 'OLED', tier: 'HIGH', chipset: 'Kirin 9000S', releaseYear: 2024, isPopular: false },
  { brand: 'Huawei', model: 'Nova 11', screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'OLED', tier: 'MID', chipset: 'Snapdragon 778G', releaseYear: 2023, isPopular: false },
];

// ═══════════════════════════════════════════════════════════
// EXPORT ALL DEVICES
// ═══════════════════════════════════════════════════════════
export const ALL_DEVICES: DeviceSeed[] = [
  ...samsungDevices,
  ...xiaomiDevices,
  ...motorolaDevices,
  ...appleDevices,
  ...realmeDevices,
  ...otherBrandDevices,
];
```

**NOTA PARA CLAUDE CODE:** El archivo anterior tiene ~130 dispositivos como ejemplo base. Claude Code debe EXPANDIR esta lista hasta 500+ dispositivos siguiendo el mismo formato. Añadir más variantes de Samsung Galaxy A/M, más Redmi/POCO budget, más Infinix/Tecno (muy populares en LATAM), y dispositivos de 2020-2021 que aún se usan mucho para Free Fire. Priorizar dispositivos populares en México y Latinoamérica.

```
[ARCHIVO] packages/database/prisma/seeds/seed-devices.ts
```
```typescript
import { PrismaClient } from '@prisma/client';

import { ALL_DEVICES } from './devices';

const prisma = new PrismaClient();

function slugify(brand: string, model: string): string {
  return `${brand}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function seedDevices() {
  console.log(`🎮 Seeding ${ALL_DEVICES.length} devices...`);

  let created = 0;
  let skipped = 0;

  for (const device of ALL_DEVICES) {
    const slug = slugify(device.brand, device.model);

    const existing = await prisma.device.findUnique({ where: { slug } });
    if (existing) {
      skipped++;
      continue;
    }

    await prisma.device.create({
      data: {
        brand: device.brand,
        model: device.model,
        slug,
        screenHz: device.screenHz,
        screenSize: device.screenSize,
        ramGb: device.ramGb,
        panelType: device.panelType,
        tier: device.tier,
        chipset: device.chipset,
        releaseYear: device.releaseYear,
        isPopular: device.isPopular,
      },
    });
    created++;
  }

  console.log(`  ✅ ${created} devices created, ${skipped} already existed`);
}
```

Actualizar el seed principal para incluir devices:

```
[ARCHIVO] packages/database/prisma/seeds/run-seed.ts
```
**ACTUALIZAR** el archivo existente para añadir al final:
```typescript
// Después del seed de achievements, agregar:
import { seedDevices } from './seed-devices';

// En main(), después de achievements:
await seedDevices();
```

```
[ARCHIVO] src/app/api/devices/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';
import { sanitizeSearchQuery } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? '';
    const brand = searchParams.get('brand') ?? '';
    const tier = searchParams.get('tier') ?? '';
    const popular = searchParams.get('popular');
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);

    const where: Record<string, unknown> = {};

    if (search) {
      const sanitized = sanitizeSearchQuery(search);
      where.OR = [
        { brand: { contains: sanitized, mode: 'insensitive' } },
        { model: { contains: sanitized, mode: 'insensitive' } },
        { chipset: { contains: sanitized, mode: 'insensitive' } },
      ];
    }

    if (brand) {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    if (tier && ['LOW', 'MID', 'HIGH', 'GAMING'].includes(tier)) {
      where.tier = tier;
    }

    if (popular === 'true') {
      where.isPopular = true;
    }

    const [devices, total] = await Promise.all([
      prisma.device.findMany({
        where,
        orderBy: [{ isPopular: 'desc' }, { brand: 'asc' }, { model: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          brand: true,
          model: true,
          slug: true,
          screenHz: true,
          screenSize: true,
          ramGb: true,
          panelType: true,
          tier: true,
          chipset: true,
          releaseYear: true,
          imageUrl: true,
          isPopular: true,
        },
      }),
      prisma.device.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: devices,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('GET /api/devices failed', { error: String(error) });
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/api/devices/[slug]/route.ts
```
```typescript
import { NextResponse } from 'next/server';

import { prisma } from '@ares/database';
import { NotFoundError, handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const device = await prisma.device.findUnique({
      where: { slug: params.slug },
    });

    if (!device) {
      throw new NotFoundError('Device', params.slug);
    }

    return NextResponse.json({ success: true, data: device });
  } catch (error) {
    logger.error('GET /api/devices/[slug] failed', { slug: params.slug, error: String(error) });
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/api/devices/brands/route.ts
```
```typescript
import { NextResponse } from 'next/server';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';

export async function GET() {
  try {
    const brands = await prisma.device.groupBy({
      by: ['brand'],
      _count: { brand: true },
      orderBy: { _count: { brand: 'desc' } },
    });

    const data = brands.map((b) => ({
      name: b.brand,
      slug: b.brand.toLowerCase().replace(/\s/g, '-'),
      count: b._count.brand,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Validación:
```bash
npx tsc --noEmit
# Seed devices
npm run db:seed
# Test API
curl http://localhost:3000/api/devices?popular=true
curl http://localhost:3000/api/devices?search=Samsung
curl http://localhost:3000/api/devices/brands
curl http://localhost:3000/api/devices/samsung-galaxy-a54
```

### Commit: `feat(devices): ARES-100 device database — 500+ devices, search API, brand grouping`

---

## ARES-101-sensitivity-algorithm

**Fase:** 1 | **Prioridad:** CRÍTICO
**Dependencias:** ARES-100-device-database, ARES-002-shared-libraries
**Descripción:** El motor core de ARES. Calcula sensibilidades basándose en specs reales del dispositivo: Hz × ScreenSize × RAM × PanelType × Tier × Style → valores clamped 1-100. Cada spec tiene un peso diferente y el estilo modifica los multipliers.

### Archivos a crear:

```
[ARCHIVO] packages/algorithms/package.json
```
```json
{
  "name": "@ares/algorithms",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "dependencies": {
    "@ares/types": "*",
    "@ares/config": "*"
  }
}
```

```
[ARCHIVO] packages/algorithms/tsconfig.json
```
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src/**/*"]
}
```

```
[ARCHIVO] packages/algorithms/src/index.ts
```
```typescript
export { generateSensitivity } from './sensitivity-engine';
export { generateGyroscope } from './gyroscope-engine';
export { getStyleMultipliers } from './style-system';
export { analyzeDeviceSpecs, calculatePerformanceScore } from './device-analyzer';
export type { AlgorithmInput, AlgorithmOutput, StyleMultipliers } from './types';
```

```
[ARCHIVO] packages/algorithms/src/types.ts
```
```typescript
import type { SensitivityStyle, PanelType, DeviceTier } from '@prisma/client';

export interface DeviceSpecs {
  screenHz: number;
  screenSize: number;
  ramGb: number;
  panelType: PanelType;
  tier: DeviceTier;
}

export interface AlgorithmInput {
  specs: DeviceSpecs;
  style: SensitivityStyle;
  includeGyro?: boolean;
}

export interface SensitivityOutput {
  general: number;
  redPoint: number;
  scope2x: number;
  scope4x: number;
  sniperScope: number;
  freeView: number;
}

export interface GyroscopeOutput {
  gyroGeneral: number;
  gyroRedPoint: number;
  gyroScope2x: number;
  gyroScope4x: number;
  gyroSniper: number;
  gyroFreeView: number;
}

export interface AlgorithmOutput {
  sensitivity: SensitivityOutput;
  gyroscope: GyroscopeOutput | null;
  meta: {
    performanceScore: number;
    styleApplied: SensitivityStyle;
    deviceTier: DeviceTier;
    algorithm: string;
  };
}

export interface StyleMultipliers {
  general: number;
  redPoint: number;
  scope2x: number;
  scope4x: number;
  sniperScope: number;
  freeView: number;
}

export interface SpecWeights {
  hz: number;
  screenSize: number;
  ram: number;
  panel: number;
  tier: number;
}
```

```
[ARCHIVO] packages/algorithms/src/sensitivity-engine.ts
```
```typescript
import {
  BASE_SENSITIVITY,
  SENSITIVITY_MIN,
  SENSITIVITY_MAX,
} from '@ares/config';

import type { AlgorithmInput, AlgorithmOutput, SensitivityOutput } from './types';
import { getStyleMultipliers } from './style-system';
import { calculatePerformanceScore } from './device-analyzer';
import { generateGyroscope } from './gyroscope-engine';

/**
 * ═══════════════════════════════════════════════════════════════
 * ARES SENSITIVITY ENGINE v1.0
 * ═══════════════════════════════════════════════════════════════
 *
 * FÓRMULA CORE:
 *   Para cada campo (general, redPoint, scope2x, etc.):
 *     rawValue = BASE + (hzFactor × W_hz) + (screenFactor × W_screen)
 *                + (ramFactor × W_ram) + (panelBonus) + (tierBonus)
 *     styledValue = rawValue × styleMultiplier[field]
 *     finalValue = clamp(round(styledValue), 1, 100)
 *
 * FACTORES:
 *   hzFactor:     (deviceHz - 60) / 120 → normalizado 0-1 (60Hz=0, 180Hz=1)
 *   screenFactor: (6.7 - deviceSize) / 2.0 → pantalla más chica = más sensible
 *   ramFactor:    (deviceRam - 3) / 13 → normalizado 0-1 (3GB=0, 16GB=1)
 *   panelBonus:   AMOLED/OLED=+3, IPS=+1, LCD=0
 *   tierBonus:    GAMING=+8, HIGH=+4, MID=+1, LOW=-2
 *
 * PESOS por campo:
 *   general:     hz=15, screen=10, ram=8
 *   redPoint:    hz=12, screen=12, ram=6
 *   scope2x:     hz=10, screen=14, ram=5
 *   scope4x:     hz=8,  screen=16, ram=4
 *   sniperScope: hz=6,  screen=18, ram=3
 *   freeView:    hz=18, screen=6,  ram=10
 */

// Weights per sensitivity field: [hz, screen, ram]
const FIELD_WEIGHTS: Record<keyof SensitivityOutput, [number, number, number]> = {
  general:     [15, 10, 8],
  redPoint:    [12, 12, 6],
  scope2x:     [10, 14, 5],
  scope4x:     [8,  16, 4],
  sniperScope: [6,  18, 3],
  freeView:    [18, 6,  10],
};

// Panel type bonuses
const PANEL_BONUS: Record<string, number> = {
  AMOLED: 3,
  OLED: 3,
  IPS: 1,
  LCD: 0,
};

// Device tier bonuses
const TIER_BONUS: Record<string, number> = {
  GAMING: 8,
  HIGH: 4,
  MID: 1,
  LOW: -2,
};

function clamp(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

function calculateField(
  base: number,
  hzFactor: number,
  screenFactor: number,
  ramFactor: number,
  panelBonus: number,
  tierBonus: number,
  weights: [number, number, number],
  styleMultiplier: number,
): number {
  const raw = base
    + (hzFactor * weights[0])
    + (screenFactor * weights[1])
    + (ramFactor * weights[2])
    + panelBonus
    + tierBonus;

  return clamp(raw * styleMultiplier, SENSITIVITY_MIN, SENSITIVITY_MAX);
}

export function generateSensitivity(input: AlgorithmInput): AlgorithmOutput {
  const { specs, style, includeGyro } = input;

  // Calculate normalized factors (0 to 1 range)
  const hzFactor = Math.max(0, Math.min(1, (specs.screenHz - 60) / 120));
  const screenFactor = Math.max(-0.5, Math.min(1, (6.7 - specs.screenSize) / 2.0));
  const ramFactor = Math.max(0, Math.min(1, (specs.ramGb - 3) / 13));

  const panelBonus = PANEL_BONUS[specs.panelType] ?? 0;
  const tierBonus = TIER_BONUS[specs.tier] ?? 0;

  // Get style multipliers
  const multipliers = getStyleMultipliers(style);

  // Calculate each sensitivity field
  const sensitivity: SensitivityOutput = {
    general: calculateField(
      BASE_SENSITIVITY.general, hzFactor, screenFactor, ramFactor,
      panelBonus, tierBonus, FIELD_WEIGHTS.general, multipliers.general,
    ),
    redPoint: calculateField(
      BASE_SENSITIVITY.redPoint, hzFactor, screenFactor, ramFactor,
      panelBonus, tierBonus, FIELD_WEIGHTS.redPoint, multipliers.redPoint,
    ),
    scope2x: calculateField(
      BASE_SENSITIVITY.scope2x, hzFactor, screenFactor, ramFactor,
      panelBonus, tierBonus, FIELD_WEIGHTS.scope2x, multipliers.scope2x,
    ),
    scope4x: calculateField(
      BASE_SENSITIVITY.scope4x, hzFactor, screenFactor, ramFactor,
      panelBonus, tierBonus, FIELD_WEIGHTS.scope4x, multipliers.scope4x,
    ),
    sniperScope: calculateField(
      BASE_SENSITIVITY.sniperScope, hzFactor, screenFactor, ramFactor,
      panelBonus, tierBonus, FIELD_WEIGHTS.sniperScope, multipliers.sniperScope,
    ),
    freeView: calculateField(
      BASE_SENSITIVITY.freeView, hzFactor, screenFactor, ramFactor,
      panelBonus, tierBonus, FIELD_WEIGHTS.freeView, multipliers.freeView,
    ),
  };

  // Optionally generate gyroscope values
  const gyroscope = includeGyro ? generateGyroscope(sensitivity, specs) : null;

  return {
    sensitivity,
    gyroscope,
    meta: {
      performanceScore: calculatePerformanceScore(specs),
      styleApplied: style,
      deviceTier: specs.tier,
      algorithm: 'ARES-v1.0',
    },
  };
}
```

```
[ARCHIVO] packages/algorithms/src/style-system.ts
```
```typescript
import type { SensitivityStyle } from '@prisma/client';

import type { StyleMultipliers } from './types';

/**
 * ═══════════════════════════════════════════════════════════
 * ESTILOS DE JUEGO
 * ═══════════════════════════════════════════════════════════
 *
 * AGGRESSIVE (Agresivo / Rush):
 *   - Sensibilidad general ALTA para giros rápidos
 *   - Red point ALTO para aim rápido
 *   - Scopes más bajos (no prioriza largo alcance)
 *   - Free view ALTO para awareness situacional
 *
 * BALANCED (Balanceado):
 *   - Todos los valores en rango medio-alto
 *   - Ideal para la mayoría de jugadores
 *   - Buen balance entre near y far combat
 *
 * SNIPER (Francotirador):
 *   - General y red point BAJOS (movimientos lentos, precisos)
 *   - Scopes 4x y sniper ALTOS (prioriza largo alcance)
 *   - Free view BAJO (posiciones estáticas)
 */

const STYLE_MULTIPLIERS: Record<SensitivityStyle, StyleMultipliers> = {
  AGGRESSIVE: {
    general:     1.20,  // +20% — giros rápidos
    redPoint:    1.15,  // +15% — aim agresivo
    scope2x:     0.95,  // -5%  — menos prioridad
    scope4x:     0.85,  // -15% — no es el foco
    sniperScope: 0.80,  // -20% — sniper no es su estilo
    freeView:    1.18,  // +18% — awareness máximo
  },
  BALANCED: {
    general:     1.00,  // neutral
    redPoint:    1.00,  // neutral
    scope2x:     1.00,  // neutral
    scope4x:     1.00,  // neutral
    sniperScope: 1.00,  // neutral
    freeView:    1.00,  // neutral
  },
  SNIPER: {
    general:     0.85,  // -15% — movimientos lentos
    redPoint:    0.90,  // -10% — menos agresivo
    scope2x:     1.08,  // +8%  — algo más
    scope4x:     1.18,  // +18% — largo alcance
    sniperScope: 1.25,  // +25% — máxima precisión sniper
    freeView:    0.82,  // -18% — posiciones estáticas
  },
};

export function getStyleMultipliers(style: SensitivityStyle): StyleMultipliers {
  return STYLE_MULTIPLIERS[style];
}

export function getAllStyles(): SensitivityStyle[] {
  return ['AGGRESSIVE', 'BALANCED', 'SNIPER'];
}
```

```
[ARCHIVO] packages/algorithms/src/__tests__/sensitivity-engine.test.ts
```
```typescript
import { describe, it, expect } from 'vitest';

import { generateSensitivity } from '../sensitivity-engine';
import type { AlgorithmInput } from '../types';

const lowEndDevice: AlgorithmInput = {
  specs: { screenHz: 60, screenSize: 6.5, ramGb: 3, panelType: 'LCD', tier: 'LOW' },
  style: 'BALANCED',
};

const midDevice: AlgorithmInput = {
  specs: { screenHz: 90, screenSize: 6.5, ramGb: 6, panelType: 'AMOLED', tier: 'MID' },
  style: 'BALANCED',
};

const gamingDevice: AlgorithmInput = {
  specs: { screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING' },
  style: 'BALANCED',
};

describe('generateSensitivity', () => {
  it('returns all 6 sensitivity fields', () => {
    const result = generateSensitivity(midDevice);
    expect(result.sensitivity).toHaveProperty('general');
    expect(result.sensitivity).toHaveProperty('redPoint');
    expect(result.sensitivity).toHaveProperty('scope2x');
    expect(result.sensitivity).toHaveProperty('scope4x');
    expect(result.sensitivity).toHaveProperty('sniperScope');
    expect(result.sensitivity).toHaveProperty('freeView');
  });

  it('all values are between 1 and 100', () => {
    const result = generateSensitivity(gamingDevice);
    const values = Object.values(result.sensitivity);
    values.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(100);
    });
  });

  it('gaming device produces higher values than low-end', () => {
    const gaming = generateSensitivity(gamingDevice);
    const low = generateSensitivity(lowEndDevice);
    expect(gaming.sensitivity.general).toBeGreaterThan(low.sensitivity.general);
    expect(gaming.sensitivity.freeView).toBeGreaterThan(low.sensitivity.freeView);
  });

  it('aggressive style produces higher general than sniper', () => {
    const aggressive = generateSensitivity({ ...midDevice, style: 'AGGRESSIVE' });
    const sniper = generateSensitivity({ ...midDevice, style: 'SNIPER' });
    expect(aggressive.sensitivity.general).toBeGreaterThan(sniper.sensitivity.general);
  });

  it('sniper style produces higher sniperScope than aggressive', () => {
    const sniper = generateSensitivity({ ...midDevice, style: 'SNIPER' });
    const aggressive = generateSensitivity({ ...midDevice, style: 'AGGRESSIVE' });
    expect(sniper.sensitivity.sniperScope).toBeGreaterThan(aggressive.sensitivity.sniperScope);
  });

  it('includes meta information', () => {
    const result = generateSensitivity(gamingDevice);
    expect(result.meta.algorithm).toBe('ARES-v1.0');
    expect(result.meta.styleApplied).toBe('BALANCED');
    expect(result.meta.deviceTier).toBe('GAMING');
    expect(result.meta.performanceScore).toBeGreaterThan(0);
  });

  it('returns null gyroscope when not requested', () => {
    const result = generateSensitivity(midDevice);
    expect(result.gyroscope).toBeNull();
  });

  it('returns gyroscope when requested', () => {
    const result = generateSensitivity({ ...midDevice, includeGyro: true });
    expect(result.gyroscope).not.toBeNull();
    expect(result.gyroscope).toHaveProperty('gyroGeneral');
  });
});
```

```
[ARCHIVO] src/app/api/generate/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { NotFoundError, handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';
import { generateSensitivity } from '@ares/algorithms';
import { getOptionalSession } from '@/lib/auth/auth.middleware';
import { enforceRateLimit } from '@/lib/security';

const generateSchema = z.object({
  deviceId: z.string().uuid(),
  style: z.enum(['AGGRESSIVE', 'BALANCED', 'SNIPER']),
  includeGyro: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = generateSchema.parse(body);

    // Get user session (optional — anonymous users can generate with limits)
    const user = await getOptionalSession();
    const userId = user?.id ?? request.headers.get('x-forwarded-for') ?? 'anonymous';
    const tier = (user as Record<string, unknown> | null)?.tier as string ?? 'FREE';

    // Rate limit check
    await enforceRateLimit(userId, tier as 'FREE' | 'PREMIUM' | 'VIP');

    // Fetch device
    const device = await prisma.device.findUnique({
      where: { id: parsed.deviceId },
    });

    if (!device) {
      throw new NotFoundError('Device', parsed.deviceId);
    }

    // Generate sensitivity
    const result = generateSensitivity({
      specs: {
        screenHz: device.screenHz,
        screenSize: device.screenSize,
        ramGb: device.ramGb,
        panelType: device.panelType,
        tier: device.tier,
      },
      style: parsed.style,
      includeGyro: parsed.includeGyro,
    });

    // Save to search history if user is logged in
    if (user?.id) {
      await prisma.searchHistory.create({
        data: {
          userId: user.id,
          deviceId: device.id,
          style: parsed.style,
        },
      });

      // Increment search count
      await prisma.user.update({
        where: { id: user.id },
        data: { totalSearches: { increment: 1 } },
      });
    }

    // Check if sensitivity already exists in DB, if not create it
    const existingSensitivity = await prisma.sensitivity.findFirst({
      where: { deviceId: device.id, style: parsed.style },
    });

    if (!existingSensitivity) {
      await prisma.sensitivity.create({
        data: {
          deviceId: device.id,
          style: parsed.style,
          general: result.sensitivity.general,
          redPoint: result.sensitivity.redPoint,
          scope2x: result.sensitivity.scope2x,
          scope4x: result.sensitivity.scope4x,
          sniperScope: result.sensitivity.sniperScope,
          freeView: result.sensitivity.freeView,
          ...(result.gyroscope ? {
            gyroGeneral: result.gyroscope.gyroGeneral,
            gyroRedPoint: result.gyroscope.gyroRedPoint,
            gyroScope2x: result.gyroscope.gyroScope2x,
            gyroScope4x: result.gyroscope.gyroScope4x,
            gyroSniper: result.gyroscope.gyroSniper,
            gyroFreeView: result.gyroscope.gyroFreeView,
          } : {}),
        },
      });
    }

    logger.info('Sensitivity generated', {
      deviceId: device.id,
      style: parsed.style,
      userId: user?.id ?? 'anonymous',
    });

    return NextResponse.json({
      success: true,
      data: {
        device: {
          id: device.id,
          brand: device.brand,
          model: device.model,
          slug: device.slug,
          tier: device.tier,
        },
        ...result,
      },
    });
  } catch (error) {
    logger.error('POST /api/generate failed', { error: String(error) });
    return handleApiError(error);
  }
}
```

### Validación:
```bash
npx tsc --noEmit
npx vitest run packages/algorithms/
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"<id-of-samsung-a54>","style":"BALANCED"}'
```

### Commit: `feat(algorithm): ARES-101 sensitivity algorithm — core engine with Hz×Screen×RAM×Panel×Tier formula + 8 tests`

---

## ARES-102-gyroscope-engine

**Fase:** 1 | **Prioridad:** CRÍTICO
**Dependencias:** ARES-101-sensitivity-algorithm
**Descripción:** Motor de giroscopio que genera valores basados en ~50% de la sensibilidad base, con bonuses por panel AMOLED/OLED y tier GAMING. Es una feature PREMIUM.

### Archivos a crear:

```
[ARCHIVO] packages/algorithms/src/gyroscope-engine.ts
```
```typescript
import {
  GYRO_BASE_FACTOR,
  GYRO_PANEL_BONUS,
  GYRO_GAMING_BONUS,
  SENSITIVITY_MIN,
  SENSITIVITY_MAX,
} from '@ares/config';

import type { SensitivityOutput, GyroscopeOutput, DeviceSpecs } from './types';

/**
 * ═══════════════════════════════════════════════════════════
 * ARES GYROSCOPE ENGINE v1.0
 * ═══════════════════════════════════════════════════════════
 *
 * FÓRMULA:
 *   gyroValue = sensitivityValue × GYRO_BASE_FACTOR (0.50)
 *             + panelBonus (AMOLED/OLED = +5%)
 *             + gamingBonus (GAMING tier = +8%)
 *             + fieldAdjustment (varies per scope type)
 *
 * FIELD ADJUSTMENTS:
 *   gyroGeneral:   +2  (necesita algo más de sensibilidad)
 *   gyroRedPoint:  +0  (neutral)
 *   gyroScope2x:   -1  (ligeramente más estable)
 *   gyroScope4x:   -3  (requiere más estabilidad)
 *   gyroSniper:    -5  (máxima estabilidad para sniper)
 *   gyroFreeView:  +3  (más libertad de movimiento)
 *
 * NOTA: Giroscopio es feature PREMIUM. Los valores se calculan
 * siempre pero solo se muestran a usuarios Premium/VIP.
 */

const FIELD_ADJUSTMENTS: Record<keyof GyroscopeOutput, number> = {
  gyroGeneral:   2,
  gyroRedPoint:  0,
  gyroScope2x:  -1,
  gyroScope4x:  -3,
  gyroSniper:   -5,
  gyroFreeView:  3,
};

// Map gyro fields to their sensitivity counterparts
const GYRO_TO_SENS: Record<keyof GyroscopeOutput, keyof SensitivityOutput> = {
  gyroGeneral:   'general',
  gyroRedPoint:  'redPoint',
  gyroScope2x:   'scope2x',
  gyroScope4x:   'scope4x',
  gyroSniper:    'sniperScope',
  gyroFreeView:  'freeView',
};

function clamp(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

export function generateGyroscope(
  sensitivity: SensitivityOutput,
  specs: DeviceSpecs,
): GyroscopeOutput {
  // Calculate bonuses
  const panelBonus = (specs.panelType === 'AMOLED' || specs.panelType === 'OLED')
    ? GYRO_PANEL_BONUS
    : 0;

  const gamingBonus = specs.tier === 'GAMING' ? GYRO_GAMING_BONUS : 0;

  const totalFactor = GYRO_BASE_FACTOR + panelBonus + gamingBonus;

  const result: Partial<GyroscopeOutput> = {};

  for (const [gyroField, sensField] of Object.entries(GYRO_TO_SENS)) {
    const key = gyroField as keyof GyroscopeOutput;
    const baseValue = sensitivity[sensField];
    const adjustment = FIELD_ADJUSTMENTS[key];

    result[key] = clamp(
      baseValue * totalFactor + adjustment,
      SENSITIVITY_MIN,
      SENSITIVITY_MAX,
    );
  }

  return result as GyroscopeOutput;
}
```

```
[ARCHIVO] packages/algorithms/src/__tests__/gyroscope-engine.test.ts
```
```typescript
import { describe, it, expect } from 'vitest';

import { generateGyroscope } from '../gyroscope-engine';
import type { SensitivityOutput, DeviceSpecs } from '../types';

const baseSensitivity: SensitivityOutput = {
  general: 60,
  redPoint: 55,
  scope2x: 50,
  scope4x: 45,
  sniperScope: 40,
  freeView: 65,
};

const amoledGaming: DeviceSpecs = {
  screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING',
};

const lcdLow: DeviceSpecs = {
  screenHz: 60, screenSize: 6.5, ramGb: 3, panelType: 'LCD', tier: 'LOW',
};

describe('generateGyroscope', () => {
  it('returns all 6 gyro fields', () => {
    const result = generateGyroscope(baseSensitivity, amoledGaming);
    expect(result).toHaveProperty('gyroGeneral');
    expect(result).toHaveProperty('gyroRedPoint');
    expect(result).toHaveProperty('gyroScope2x');
    expect(result).toHaveProperty('gyroScope4x');
    expect(result).toHaveProperty('gyroSniper');
    expect(result).toHaveProperty('gyroFreeView');
  });

  it('gyro values are roughly 50% of sensitivity for LCD/LOW', () => {
    const result = generateGyroscope(baseSensitivity, lcdLow);
    // Base factor is 0.50, no bonuses for LCD/LOW
    expect(result.gyroRedPoint).toBeCloseTo(55 * 0.50, 0); // ~28
  });

  it('AMOLED/GAMING gets higher gyro values', () => {
    const gaming = generateGyroscope(baseSensitivity, amoledGaming);
    const low = generateGyroscope(baseSensitivity, lcdLow);
    expect(gaming.gyroGeneral).toBeGreaterThan(low.gyroGeneral);
  });

  it('all values clamped 1-100', () => {
    const result = generateGyroscope(baseSensitivity, amoledGaming);
    Object.values(result).forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(100);
    });
  });

  it('sniper gyro is lowest due to -5 adjustment', () => {
    const result = generateGyroscope(baseSensitivity, lcdLow);
    expect(result.gyroSniper).toBeLessThan(result.gyroGeneral);
  });
});
```

### Validación:
```bash
npx tsc --noEmit
npx vitest run packages/algorithms/src/__tests__/gyroscope-engine.test.ts
```

### Commit: `feat(gyro): ARES-102 gyroscope engine — ~50% base + panel/gaming bonus + field adjustments`

---

## ARES-103-style-system

**Fase:** 1 | **Prioridad:** ALTO
**Dependencias:** ARES-101-sensitivity-algorithm
**Descripción:** Sistema completo de estilos con perfiles detallados, descripciones para UI, recomendaciones por tipo de jugador, y lógica de cuál estilo recomendar basándose en el tier del dispositivo.

### Archivos a crear:

```
[ARCHIVO] packages/algorithms/src/style-profiles.ts
```
```typescript
import type { SensitivityStyle } from '@prisma/client';
import type { DeviceTier } from '@prisma/client';

export interface StyleProfile {
  key: SensitivityStyle;
  name: string;
  nameEs: string;
  icon: string;
  color: string;
  description: string;
  playstyle: string;
  strengths: string[];
  weaknesses: string[];
  recommendedFor: string[];
  tipShort: string;
  tipDetailed: string;
}

export const STYLE_PROFILES: Record<SensitivityStyle, StyleProfile> = {
  AGGRESSIVE: {
    key: 'AGGRESSIVE',
    name: 'Aggressive',
    nameEs: 'Agresivo',
    icon: '⚔️',
    color: '#ef4444',
    description: 'Para jugadores rush que buscan dominar en combate cercano',
    playstyle: 'Rush / CQB (Close Quarter Battle)',
    strengths: [
      'Giros de 180° ultra rápidos',
      'Aim tracking superior en movimiento',
      'Dominio en combate cercano y medio',
      'Reacción inmediata a flanqueos',
    ],
    weaknesses: [
      'Menos precisión en scopes altos',
      'Puede ser difícil de controlar para principiantes',
      'No ideal para posiciones estáticas',
    ],
    recommendedFor: [
      'Jugadores agresivos / rushers',
      'SMG y shotgun mains',
      'Jugadores con experiencia',
      'Dispositivos HIGH y GAMING',
    ],
    tipShort: 'Ideal para rushear. Giros rápidos, aim agresivo.',
    tipDetailed: 'Esta configuración prioriza velocidad de giro y tracking. Practica en modo entrenamiento antes de usarla en ranked. Funciona mejor con SMGs como MP40 y Thompson.',
  },
  BALANCED: {
    key: 'BALANCED',
    name: 'Balanced',
    nameEs: 'Balanceado',
    icon: '🎯',
    color: '#3b82f6',
    description: 'El equilibrio perfecto para la mayoría de jugadores',
    playstyle: 'Versátil / All-around',
    strengths: [
      'Funciona bien en todas las distancias',
      'Fácil de adaptar para cualquier arma',
      'Buena precisión sin sacrificar velocidad',
      'Ideal para aprender y mejorar',
    ],
    weaknesses: [
      'No es el mejor en ningún extremo',
      'Jugadores muy agresivos pueden sentirlo lento',
      'Snipers dedicados preferirán más estabilidad',
    ],
    recommendedFor: [
      'La mayoría de jugadores',
      'Jugadores que usan múltiples armas',
      'Principiantes y nivel intermedio',
      'Todos los dispositivos',
    ],
    tipShort: 'Perfecto para empezar. Funciona con todo.',
    tipDetailed: 'La configuración más segura y versátil. Si no sabes cuál elegir, esta es tu opción. Funciona bien con ARs como M4A1, AK, y SCAR.',
  },
  SNIPER: {
    key: 'SNIPER',
    name: 'Sniper',
    nameEs: 'Francotirador',
    icon: '🔭',
    color: '#22c55e',
    description: 'Máxima precisión para francotiradores dedicados',
    playstyle: 'Long range / Camping estratégico',
    strengths: [
      'Precisión milimétrica con scopes',
      'Estabilidad superior para headshots',
      'Dominio absoluto a larga distancia',
      'Control fino para micro-ajustes',
    ],
    weaknesses: [
      'Giros lentos — vulnerable a flanqueos',
      'Combate cercano desventajoso',
      'Requiere buena posición de juego',
    ],
    recommendedFor: [
      'Snipers dedicados',
      'AWM y Kar98k mains',
      'Jugadores pacientes y estratégicos',
      'Dispositivos MID+ (necesita buen panel)',
    ],
    tipShort: 'Para snipers. Máxima precisión en scopes.',
    tipDetailed: 'Configuración optimizada para largo alcance. Los scopes 4x y sniper tienen valores más altos para micro-ajustes precisos. Practica flick shots en entrenamiento.',
  },
};

/**
 * Recomienda el estilo basándose en el tier del dispositivo
 */
export function getRecommendedStyle(deviceTier: DeviceTier): SensitivityStyle {
  switch (deviceTier) {
    case 'GAMING':
      return 'AGGRESSIVE'; // Gaming devices can handle high sens
    case 'HIGH':
      return 'BALANCED'; // Safe default for good devices
    case 'MID':
      return 'BALANCED'; // Most common, balanced is safest
    case 'LOW':
      return 'SNIPER'; // Low devices benefit from lower, more stable sens
    default:
      return 'BALANCED';
  }
}

export function getStyleProfile(style: SensitivityStyle): StyleProfile {
  return STYLE_PROFILES[style];
}

export function getAllStyleProfiles(): StyleProfile[] {
  return Object.values(STYLE_PROFILES);
}
```

### Validación:
```bash
npx tsc --noEmit
# Verify profiles are complete
node -e "const s = require('./packages/algorithms/src/style-profiles'); console.log(Object.keys(s.STYLE_PROFILES))"
```

### Commit: `feat(styles): ARES-103 style system — 3 detailed profiles + device-tier recommendations`

---

## ARES-104-device-specs-analyzer

**Fase:** 1 | **Prioridad:** ALTO
**Dependencias:** ARES-100, ARES-101
**Descripción:** Analizador inteligente que calcula performance score 0-100, auto-asigna tier, detecta chipset capabilities, y genera human-readable specs summary.

### Archivos a crear:

```
[ARCHIVO] packages/algorithms/src/device-analyzer.ts
```
```typescript
import type { DeviceSpecs } from './types';
import type { DeviceTier, PanelType } from '@prisma/client';

/**
 * ═══════════════════════════════════════════════════════════
 * DEVICE SPECS ANALYZER
 * ═══════════════════════════════════════════════════════════
 *
 * Performance Score (0-100):
 *   hzScore     = (Hz - 30) / 120 × 30 pts     (max 30)
 *   ramScore    = (RAM - 1) / 15 × 25 pts       (max 25)
 *   panelScore  = GAMING_AMOLED=25, AMOLED=20, OLED=20, IPS=10, LCD=5
 *   tierScore   = GAMING=20, HIGH=15, MID=10, LOW=5
 *
 *   Total = hzScore + ramScore + panelScore + tierScore (max 100)
 */

const PANEL_SCORES: Record<PanelType, number> = {
  AMOLED: 20,
  OLED: 20,
  IPS: 10,
  LCD: 5,
};

const TIER_SCORES: Record<DeviceTier, number> = {
  GAMING: 20,
  HIGH: 15,
  MID: 10,
  LOW: 5,
};

export function calculatePerformanceScore(specs: DeviceSpecs): number {
  const hzScore = Math.min(30, Math.max(0, ((specs.screenHz - 30) / 120) * 30));
  const ramScore = Math.min(25, Math.max(0, ((specs.ramGb - 1) / 15) * 25));
  const panelScore = PANEL_SCORES[specs.panelType] ?? 5;
  const tierScore = TIER_SCORES[specs.tier] ?? 5;

  // Bonus for GAMING + AMOLED combo
  const comboBonus = (specs.tier === 'GAMING' && (specs.panelType === 'AMOLED' || specs.panelType === 'OLED'))
    ? 5
    : 0;

  return Math.min(100, Math.round(hzScore + ramScore + panelScore + tierScore + comboBonus));
}

/**
 * Auto-detect tier from specs when not provided
 */
export function autoDetectTier(specs: Omit<DeviceSpecs, 'tier'>): DeviceTier {
  const { screenHz, ramGb, panelType } = specs;

  if (screenHz >= 120 && ramGb >= 8 && (panelType === 'AMOLED' || panelType === 'OLED')) {
    return 'GAMING';
  }
  if (screenHz >= 90 && ramGb >= 6 && (panelType === 'AMOLED' || panelType === 'OLED')) {
    return 'HIGH';
  }
  if (screenHz >= 60 && ramGb >= 4) {
    return 'MID';
  }
  return 'LOW';
}

export interface DeviceAnalysis {
  performanceScore: number;
  tier: DeviceTier;
  rating: 'Excelente' | 'Muy Bueno' | 'Bueno' | 'Básico';
  summary: string;
  strengths: string[];
  limitations: string[];
  gamingVerdict: string;
}

export function analyzeDeviceSpecs(specs: DeviceSpecs): DeviceAnalysis {
  const score = calculatePerformanceScore(specs);

  let rating: DeviceAnalysis['rating'];
  let gamingVerdict: string;

  if (score >= 80) {
    rating = 'Excelente';
    gamingVerdict = 'Dispositivo GAMING de élite. Puedes usar cualquier sensibilidad sin problemas. Ideal para ranked competitivo.';
  } else if (score >= 60) {
    rating = 'Muy Bueno';
    gamingVerdict = 'Excelente para Free Fire. Soporta sensibilidades altas y giroscopio sin lag.';
  } else if (score >= 40) {
    rating = 'Bueno';
    gamingVerdict = 'Funciona bien para Free Fire. Usa sensibilidades medias para mejor experiencia.';
  } else {
    rating = 'Básico';
    gamingVerdict = 'Puede correr Free Fire pero con limitaciones. Usa sensibilidades bajas (estilo Sniper) para mayor estabilidad.';
  }

  const strengths: string[] = [];
  const limitations: string[] = [];

  // Hz analysis
  if (specs.screenHz >= 120) strengths.push(`Pantalla ${specs.screenHz}Hz — ultra fluida`);
  else if (specs.screenHz >= 90) strengths.push(`Pantalla ${specs.screenHz}Hz — buena fluidez`);
  else limitations.push(`Pantalla ${specs.screenHz}Hz — limitada`);

  // RAM analysis
  if (specs.ramGb >= 8) strengths.push(`${specs.ramGb}GB RAM — sin problemas de memoria`);
  else if (specs.ramGb >= 4) strengths.push(`${specs.ramGb}GB RAM — suficiente para Free Fire`);
  else limitations.push(`${specs.ramGb}GB RAM — puede tener lag en partidas largas`);

  // Panel analysis
  if (specs.panelType === 'AMOLED' || specs.panelType === 'OLED') {
    strengths.push(`Panel ${specs.panelType} — colores vibrantes, mejor respuesta táctil`);
  } else {
    limitations.push(`Panel ${specs.panelType} — respuesta táctil estándar`);
  }

  const summary = `${rating} para gaming (${score}/100). ${specs.screenHz}Hz, ${specs.ramGb}GB RAM, ${specs.panelType}.`;

  return {
    performanceScore: score,
    tier: specs.tier,
    rating,
    summary,
    strengths,
    limitations,
    gamingVerdict,
  };
}
```

```
[ARCHIVO] packages/algorithms/src/__tests__/device-analyzer.test.ts
```
```typescript
import { describe, it, expect } from 'vitest';

import { calculatePerformanceScore, autoDetectTier, analyzeDeviceSpecs } from '../device-analyzer';

describe('calculatePerformanceScore', () => {
  it('gaming AMOLED device scores 80+', () => {
    const score = calculatePerformanceScore({
      screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING',
    });
    expect(score).toBeGreaterThanOrEqual(80);
  });

  it('low LCD device scores below 30', () => {
    const score = calculatePerformanceScore({
      screenHz: 60, screenSize: 6.5, ramGb: 2, panelType: 'LCD', tier: 'LOW',
    });
    expect(score).toBeLessThan(30);
  });

  it('score is between 0 and 100', () => {
    const score = calculatePerformanceScore({
      screenHz: 90, screenSize: 6.5, ramGb: 6, panelType: 'AMOLED', tier: 'MID',
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('autoDetectTier', () => {
  it('detects GAMING for 120Hz + 8GB + AMOLED', () => {
    expect(autoDetectTier({ screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED' })).toBe('GAMING');
  });

  it('detects HIGH for 90Hz + 6GB + AMOLED', () => {
    expect(autoDetectTier({ screenHz: 90, screenSize: 6.5, ramGb: 6, panelType: 'AMOLED' })).toBe('HIGH');
  });

  it('detects MID for 60Hz + 4GB + LCD', () => {
    expect(autoDetectTier({ screenHz: 60, screenSize: 6.5, ramGb: 4, panelType: 'LCD' })).toBe('MID');
  });

  it('detects LOW for 60Hz + 2GB', () => {
    expect(autoDetectTier({ screenHz: 60, screenSize: 6.5, ramGb: 2, panelType: 'LCD' })).toBe('LOW');
  });
});

describe('analyzeDeviceSpecs', () => {
  it('returns complete analysis', () => {
    const analysis = analyzeDeviceSpecs({
      screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING',
    });
    expect(analysis.rating).toBe('Excelente');
    expect(analysis.strengths.length).toBeGreaterThan(0);
    expect(analysis.gamingVerdict).toContain('GAMING');
    expect(analysis.summary).toContain('Excelente');
  });

  it('low end device gets Básico rating', () => {
    const analysis = analyzeDeviceSpecs({
      screenHz: 60, screenSize: 6.5, ramGb: 2, panelType: 'LCD', tier: 'LOW',
    });
    expect(analysis.rating).toBe('Básico');
    expect(analysis.limitations.length).toBeGreaterThan(0);
  });
});
```

### Validación:
```bash
npx tsc --noEmit
npx vitest run packages/algorithms/src/__tests__/device-analyzer.test.ts
```

### Commit: `feat(analyzer): ARES-104 device specs analyzer — performance score, auto-tier, gaming verdict`

---

# ═══════════════════════════════════════════════════════════════
# FEATURES: COMPARACIÓN + EXPORT + SHARE + FAVORITOS + HISTORIAL
# (Scripts 014-018)
# ═══════════════════════════════════════════════════════════════

## ARES-105-device-comparison

**Fase:** 1 | **Prioridad:** ALTO
**Dependencias:** ARES-101, ARES-104
**Descripción:** Feature PREMIUM que permite comparar 2 dispositivos side-by-side: specs diff, sensitivity diff por estilo, performance score diff, y un winner por categoría. Incluye API endpoint y lógica completa.

### Archivos a crear:

```
[ARCHIVO] packages/algorithms/src/comparator.ts
```
```typescript
import type { SensitivityStyle, DeviceTier, PanelType } from '@prisma/client';

import { generateSensitivity } from './sensitivity-engine';
import { calculatePerformanceScore, analyzeDeviceSpecs } from './device-analyzer';
import type { DeviceSpecs, SensitivityOutput, GyroscopeOutput } from './types';

export interface DeviceForComparison {
  id: string;
  brand: string;
  model: string;
  slug: string;
  specs: DeviceSpecs;
}

export interface ComparisonField {
  label: string;
  valueA: number;
  valueB: number;
  winner: 'A' | 'B' | 'TIE';
  diff: number;
  diffPercent: number;
}

export interface ComparisonResult {
  deviceA: {
    info: DeviceForComparison;
    sensitivity: SensitivityOutput;
    gyroscope: GyroscopeOutput | null;
    performanceScore: number;
    rating: string;
  };
  deviceB: {
    info: DeviceForComparison;
    sensitivity: SensitivityOutput;
    gyroscope: GyroscopeOutput | null;
    performanceScore: number;
    rating: string;
  };
  style: SensitivityStyle;
  specsDiff: ComparisonField[];
  sensitivityDiff: ComparisonField[];
  gyroDiff: ComparisonField[] | null;
  overallWinner: 'A' | 'B' | 'TIE';
  verdict: string;
}

function getWinner(a: number, b: number): 'A' | 'B' | 'TIE' {
  if (a > b) return 'A';
  if (b > a) return 'B';
  return 'TIE';
}

function makeField(label: string, a: number, b: number): ComparisonField {
  const diff = Math.abs(a - b);
  const max = Math.max(a, b, 1);
  return {
    label,
    valueA: a,
    valueB: b,
    winner: getWinner(a, b),
    diff,
    diffPercent: Math.round((diff / max) * 100),
  };
}

export function compareDevices(
  deviceA: DeviceForComparison,
  deviceB: DeviceForComparison,
  style: SensitivityStyle,
  includeGyro = false,
): ComparisonResult {
  // Generate sensitivities
  const resultA = generateSensitivity({ specs: deviceA.specs, style, includeGyro });
  const resultB = generateSensitivity({ specs: deviceB.specs, style, includeGyro });

  // Analyze specs
  const analysisA = analyzeDeviceSpecs(deviceA.specs);
  const analysisB = analyzeDeviceSpecs(deviceB.specs);

  // Specs comparison
  const specsDiff: ComparisonField[] = [
    makeField('Refresh Rate (Hz)', deviceA.specs.screenHz, deviceB.specs.screenHz),
    makeField('Pantalla (pulgadas)', deviceA.specs.screenSize, deviceB.specs.screenSize),
    makeField('RAM (GB)', deviceA.specs.ramGb, deviceB.specs.ramGb),
    makeField('Performance Score', analysisA.performanceScore, analysisB.performanceScore),
  ];

  // Sensitivity comparison
  const sensitivityDiff: ComparisonField[] = [
    makeField('General', resultA.sensitivity.general, resultB.sensitivity.general),
    makeField('Punto Rojo', resultA.sensitivity.redPoint, resultB.sensitivity.redPoint),
    makeField('Mira 2x', resultA.sensitivity.scope2x, resultB.sensitivity.scope2x),
    makeField('Mira 4x', resultA.sensitivity.scope4x, resultB.sensitivity.scope4x),
    makeField('Mira Sniper', resultA.sensitivity.sniperScope, resultB.sensitivity.sniperScope),
    makeField('Vista Libre', resultA.sensitivity.freeView, resultB.sensitivity.freeView),
  ];

  // Gyroscope comparison
  let gyroDiff: ComparisonField[] | null = null;
  if (includeGyro && resultA.gyroscope && resultB.gyroscope) {
    gyroDiff = [
      makeField('Gyro General', resultA.gyroscope.gyroGeneral, resultB.gyroscope.gyroGeneral),
      makeField('Gyro Punto Rojo', resultA.gyroscope.gyroRedPoint, resultB.gyroscope.gyroRedPoint),
      makeField('Gyro 2x', resultA.gyroscope.gyroScope2x, resultB.gyroscope.gyroScope2x),
      makeField('Gyro 4x', resultA.gyroscope.gyroScope4x, resultB.gyroscope.gyroScope4x),
      makeField('Gyro Sniper', resultA.gyroscope.gyroSniper, resultB.gyroscope.gyroSniper),
      makeField('Gyro Vista Libre', resultA.gyroscope.gyroFreeView, resultB.gyroscope.gyroFreeView),
    ];
  }

  // Overall winner: based on performance score
  const overallWinner = getWinner(analysisA.performanceScore, analysisB.performanceScore);

  // Generate verdict
  const winnerDevice = overallWinner === 'A' ? deviceA : overallWinner === 'B' ? deviceB : null;
  const loserDevice = overallWinner === 'A' ? deviceB : overallWinner === 'B' ? deviceA : null;
  const scoreDiff = Math.abs(analysisA.performanceScore - analysisB.performanceScore);

  let verdict: string;
  if (overallWinner === 'TIE') {
    verdict = `${deviceA.brand} ${deviceA.model} y ${deviceB.brand} ${deviceB.model} son prácticamente iguales para Free Fire. Elige el que prefieras.`;
  } else if (scoreDiff > 30) {
    verdict = `${winnerDevice!.brand} ${winnerDevice!.model} es significativamente superior para Free Fire. La diferencia de ${scoreDiff} puntos se nota mucho en gameplay.`;
  } else if (scoreDiff > 15) {
    verdict = `${winnerDevice!.brand} ${winnerDevice!.model} tiene ventaja notable sobre ${loserDevice!.brand} ${loserDevice!.model} (+${scoreDiff} pts).`;
  } else {
    verdict = `${winnerDevice!.brand} ${winnerDevice!.model} tiene una ligera ventaja (+${scoreDiff} pts), pero ambos son buenos para Free Fire.`;
  }

  return {
    deviceA: {
      info: deviceA,
      sensitivity: resultA.sensitivity,
      gyroscope: resultA.gyroscope,
      performanceScore: analysisA.performanceScore,
      rating: analysisA.rating,
    },
    deviceB: {
      info: deviceB,
      sensitivity: resultB.sensitivity,
      gyroscope: resultB.gyroscope,
      performanceScore: analysisB.performanceScore,
      rating: analysisB.rating,
    },
    style,
    specsDiff,
    sensitivityDiff,
    gyroDiff,
    overallWinner,
    verdict,
  };
}
```

```
[ARCHIVO] src/app/api/compare/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { NotFoundError, handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';
import { compareDevices } from '@ares/algorithms/src/comparator';
import { requireTier } from '@/lib/auth/auth.middleware';

const compareSchema = z.object({
  deviceIdA: z.string().uuid(),
  deviceIdB: z.string().uuid(),
  style: z.enum(['AGGRESSIVE', 'BALANCED', 'SNIPER']),
  includeGyro: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    // Comparison is a PREMIUM feature
    await requireTier('PREMIUM');

    const body = await request.json();
    const parsed = compareSchema.parse(body);

    if (parsed.deviceIdA === parsed.deviceIdB) {
      return NextResponse.json(
        { success: false, error: { code: 'SAME_DEVICE', message: 'No puedes comparar un dispositivo consigo mismo', statusCode: 400 } },
        { status: 400 },
      );
    }

    const [deviceA, deviceB] = await Promise.all([
      prisma.device.findUnique({ where: { id: parsed.deviceIdA } }),
      prisma.device.findUnique({ where: { id: parsed.deviceIdB } }),
    ]);

    if (!deviceA) throw new NotFoundError('Device A', parsed.deviceIdA);
    if (!deviceB) throw new NotFoundError('Device B', parsed.deviceIdB);

    const result = compareDevices(
      {
        id: deviceA.id,
        brand: deviceA.brand,
        model: deviceA.model,
        slug: deviceA.slug,
        specs: {
          screenHz: deviceA.screenHz,
          screenSize: deviceA.screenSize,
          ramGb: deviceA.ramGb,
          panelType: deviceA.panelType,
          tier: deviceA.tier,
        },
      },
      {
        id: deviceB.id,
        brand: deviceB.brand,
        model: deviceB.model,
        slug: deviceB.slug,
        specs: {
          screenHz: deviceB.screenHz,
          screenSize: deviceB.screenSize,
          ramGb: deviceB.ramGb,
          panelType: deviceB.panelType,
          tier: deviceB.tier,
        },
      },
      parsed.style,
      parsed.includeGyro,
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    logger.error('POST /api/compare failed', { error: String(error) });
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] packages/algorithms/src/__tests__/comparator.test.ts
```
```typescript
import { describe, it, expect } from 'vitest';

import { compareDevices } from '../comparator';
import type { DeviceForComparison } from '../comparator';

const s24Ultra: DeviceForComparison = {
  id: 'a', brand: 'Samsung', model: 'Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra',
  specs: { screenHz: 120, screenSize: 6.8, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING' },
};

const a14: DeviceForComparison = {
  id: 'b', brand: 'Samsung', model: 'Galaxy A14', slug: 'samsung-galaxy-a14',
  specs: { screenHz: 90, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW' },
};

describe('compareDevices', () => {
  it('returns complete comparison structure', () => {
    const result = compareDevices(s24Ultra, a14, 'BALANCED');
    expect(result.deviceA.info.brand).toBe('Samsung');
    expect(result.deviceB.info.brand).toBe('Samsung');
    expect(result.specsDiff.length).toBeGreaterThan(0);
    expect(result.sensitivityDiff.length).toBe(6);
    expect(result.overallWinner).toBeDefined();
    expect(result.verdict).toBeDefined();
  });

  it('S24 Ultra wins over A14', () => {
    const result = compareDevices(s24Ultra, a14, 'BALANCED');
    expect(result.overallWinner).toBe('A');
    expect(result.deviceA.performanceScore).toBeGreaterThan(result.deviceB.performanceScore);
  });

  it('same device comparison shows TIE', () => {
    const result = compareDevices(s24Ultra, { ...s24Ultra, id: 'c' }, 'BALANCED');
    expect(result.overallWinner).toBe('TIE');
  });

  it('includes gyro when requested', () => {
    const result = compareDevices(s24Ultra, a14, 'BALANCED', true);
    expect(result.gyroDiff).not.toBeNull();
    expect(result.gyroDiff!.length).toBe(6);
  });

  it('verdict mentions the winner', () => {
    const result = compareDevices(s24Ultra, a14, 'BALANCED');
    expect(result.verdict).toContain('S24 Ultra');
  });
});
```

### Validación:
```bash
npx tsc --noEmit
npx vitest run packages/algorithms/src/__tests__/comparator.test.ts
```

### Commit: `feat(compare): ARES-105 device comparison — side-by-side specs, sensitivity, gyro diff + verdict`

---

## ARES-106-config-export

**Fase:** 1 | **Prioridad:** MEDIO
**Dependencias:** ARES-101, ARES-004-design-system
**Descripción:** Feature PREMIUM para exportar configuraciones como imagen 1080×1080 (Instagram), 1080×1920 (Stories), y texto copiable. Usa canvas server-side con @vercel/og o html-to-image en client.

### Archivos a crear:

```
[ARCHIVO] src/lib/export/generate-image.ts
```
```typescript
import type { SensitivityStyle } from '@prisma/client';

interface ExportData {
  deviceBrand: string;
  deviceModel: string;
  style: SensitivityStyle;
  sensitivity: {
    general: number;
    redPoint: number;
    scope2x: number;
    scope4x: number;
    sniperScope: number;
    freeView: number;
  };
  gyroscope?: {
    gyroGeneral: number;
    gyroRedPoint: number;
    gyroScope2x: number;
    gyroScope4x: number;
    gyroSniper: number;
    gyroFreeView: number;
  } | null;
  performanceScore: number;
}

interface ExportOptions {
  format: 'square' | 'story';
  includeGyro: boolean;
  includeWatermark: boolean;
}

const STYLE_COLORS: Record<SensitivityStyle, { primary: string; gradient: string }> = {
  AGGRESSIVE: { primary: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
  BALANCED: { primary: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  SNIPER: { primary: '#22c55e', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
};

const STYLE_LABELS: Record<SensitivityStyle, string> = {
  AGGRESSIVE: 'AGRESIVO ⚔️',
  BALANCED: 'BALANCEADO 🎯',
  SNIPER: 'FRANCOTIRADOR 🔭',
};

/**
 * Generate HTML string for the export image.
 * This will be rendered via @vercel/og or html-to-image.
 *
 * IMPORTANT: This returns an HTML string, NOT JSX.
 * It must be self-contained with inline styles.
 */
export function generateExportHtml(data: ExportData, options: ExportOptions): string {
  const { format, includeGyro, includeWatermark } = options;
  const width = format === 'square' ? 1080 : 1080;
  const height = format === 'square' ? 1080 : 1920;
  const colors = STYLE_COLORS[data.style];

  const fields = [
    { label: 'General', value: data.sensitivity.general },
    { label: 'Punto Rojo', value: data.sensitivity.redPoint },
    { label: 'Mira 2x', value: data.sensitivity.scope2x },
    { label: 'Mira 4x', value: data.sensitivity.scope4x },
    { label: 'Mira Sniper', value: data.sensitivity.sniperScope },
    { label: 'Vista Libre', value: data.sensitivity.freeView },
  ];

  const gyroFields = includeGyro && data.gyroscope ? [
    { label: 'Gyro General', value: data.gyroscope.gyroGeneral },
    { label: 'Gyro Punto Rojo', value: data.gyroscope.gyroRedPoint },
    { label: 'Gyro 2x', value: data.gyroscope.gyroScope2x },
    { label: 'Gyro 4x', value: data.gyroscope.gyroScope4x },
    { label: 'Gyro Sniper', value: data.gyroscope.gyroSniper },
    { label: 'Gyro Vista Libre', value: data.gyroscope.gyroFreeView },
  ] : [];

  const renderBar = (value: number) => `
    <div style="display:flex;align-items:center;gap:12px;margin:6px 0;">
      <div style="flex:1;height:8px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden;">
        <div style="width:${value}%;height:100%;background:${colors.gradient};border-radius:4px;"></div>
      </div>
      <span style="font-size:24px;font-weight:700;color:white;min-width:50px;text-align:right;">${value}</span>
    </div>
  `;

  return `
    <div style="width:${width}px;height:${height}px;background:#050810;color:white;font-family:sans-serif;padding:60px;display:flex;flex-direction:column;justify-content:space-between;">
      <div>
        <div style="font-size:20px;color:${colors.primary};font-weight:700;letter-spacing:3px;text-transform:uppercase;">
          ${STYLE_LABELS[data.style]}
        </div>
        <div style="font-size:48px;font-weight:900;margin-top:8px;background:linear-gradient(90deg,#ff6a00,#00c8ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
          ${data.deviceBrand} ${data.deviceModel}
        </div>
        <div style="font-size:18px;color:#64748b;margin-top:4px;">
          Performance Score: ${data.performanceScore}/100
        </div>
      </div>

      <div style="margin:40px 0;">
        <div style="font-size:16px;color:#94a3b8;font-weight:600;letter-spacing:2px;margin-bottom:16px;">SENSIBILIDADES</div>
        ${fields.map((f) => `
          <div style="display:flex;justify-content:space-between;align-items:center;margin:10px 0;">
            <span style="font-size:18px;color:#cbd5e1;">${f.label}</span>
            ${renderBar(f.value)}
          </div>
        `).join('')}
      </div>

      ${gyroFields.length > 0 ? `
        <div style="margin:20px 0;">
          <div style="font-size:16px;color:#94a3b8;font-weight:600;letter-spacing:2px;margin-bottom:16px;">GIROSCOPIO</div>
          ${gyroFields.map((f) => `
            <div style="display:flex;justify-content:space-between;align-items:center;margin:10px 0;">
              <span style="font-size:18px;color:#cbd5e1;">${f.label}</span>
              ${renderBar(f.value)}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${includeWatermark ? `
        <div style="text-align:center;margin-top:auto;padding-top:30px;border-top:1px solid rgba(255,255,255,0.05);">
          <div style="font-size:22px;font-weight:800;background:linear-gradient(90deg,#ff6a00,#00c8ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
            sensibilidadespro.com
          </div>
          <div style="font-size:14px;color:#475569;margin-top:4px;">
            Generador de Sensibilidades #1 para Free Fire
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Generate copy-paste text format
 */
export function generateExportText(data: ExportData): string {
  const lines = [
    `🎮 ${data.deviceBrand} ${data.deviceModel}`,
    `⚡ Estilo: ${STYLE_LABELS[data.style]}`,
    `📊 Score: ${data.performanceScore}/100`,
    '',
    '📋 SENSIBILIDADES:',
    `  General: ${data.sensitivity.general}`,
    `  Punto Rojo: ${data.sensitivity.redPoint}`,
    `  Mira 2x: ${data.sensitivity.scope2x}`,
    `  Mira 4x: ${data.sensitivity.scope4x}`,
    `  Mira Sniper: ${data.sensitivity.sniperScope}`,
    `  Vista Libre: ${data.sensitivity.freeView}`,
  ];

  if (data.gyroscope) {
    lines.push(
      '',
      '🔄 GIROSCOPIO:',
      `  General: ${data.gyroscope.gyroGeneral}`,
      `  Punto Rojo: ${data.gyroscope.gyroRedPoint}`,
      `  2x: ${data.gyroscope.gyroScope2x}`,
      `  4x: ${data.gyroscope.gyroScope4x}`,
      `  Sniper: ${data.gyroscope.gyroSniper}`,
      `  Vista Libre: ${data.gyroscope.gyroFreeView}`,
    );
  }

  lines.push('', '🔥 sensibilidadespro.com');

  return lines.join('\n');
}
```

```
[ARCHIVO] src/app/api/export/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { NotFoundError, handleApiError } from '@ares/errors';
import { generateSensitivity } from '@ares/algorithms';
import { requireTier } from '@/lib/auth/auth.middleware';
import { generateExportText } from '@/lib/export/generate-image';

const exportSchema = z.object({
  deviceId: z.string().uuid(),
  style: z.enum(['AGGRESSIVE', 'BALANCED', 'SNIPER']),
  format: z.enum(['text', 'square', 'story']).default('text'),
  includeGyro: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    // Export is PREMIUM feature
    await requireTier('PREMIUM');

    const body = await request.json();
    const parsed = exportSchema.parse(body);

    const device = await prisma.device.findUnique({ where: { id: parsed.deviceId } });
    if (!device) throw new NotFoundError('Device', parsed.deviceId);

    const result = generateSensitivity({
      specs: {
        screenHz: device.screenHz,
        screenSize: device.screenSize,
        ramGb: device.ramGb,
        panelType: device.panelType,
        tier: device.tier,
      },
      style: parsed.style,
      includeGyro: parsed.includeGyro,
    });

    if (parsed.format === 'text') {
      const text = generateExportText({
        deviceBrand: device.brand,
        deviceModel: device.model,
        style: parsed.style,
        sensitivity: result.sensitivity,
        gyroscope: result.gyroscope,
        performanceScore: result.meta.performanceScore,
      });

      return NextResponse.json({ success: true, data: { format: 'text', content: text } });
    }

    // For image formats, return the HTML template that client will render
    // Client-side rendering with html-to-image for now
    return NextResponse.json({
      success: true,
      data: {
        format: parsed.format,
        deviceBrand: device.brand,
        deviceModel: device.model,
        style: parsed.style,
        sensitivity: result.sensitivity,
        gyroscope: result.gyroscope,
        performanceScore: result.meta.performanceScore,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Validación:
```bash
npx tsc --noEmit
curl -X POST http://localhost:3000/api/export -H "Content-Type: application/json" -d '{"deviceId":"...","style":"BALANCED","format":"text"}'
```

### Commit: `feat(export): ARES-106 config export — image templates (1080×1080, 1080×1920) + text format`

---

## ARES-107-share-system

**Fase:** 1 | **Prioridad:** MEDIO
**Dependencias:** ARES-101, ARES-106
**Descripción:** Share links para WhatsApp, Twitter, Facebook, Telegram, y copy-to-clipboard. Incluye OG metadata dinámica por dispositivo/estilo para preview en redes sociales.

### Archivos a crear:

```
[ARCHIVO] src/lib/share/share-links.ts
```
```typescript
import type { SensitivityStyle } from '@prisma/client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sensibilidadespro.com';

interface ShareData {
  deviceBrand: string;
  deviceModel: string;
  deviceSlug: string;
  style: SensitivityStyle;
}

const STYLE_EMOJI: Record<SensitivityStyle, string> = {
  AGGRESSIVE: '⚔️',
  BALANCED: '🎯',
  SNIPER: '🔭',
};

const STYLE_LABELS: Record<SensitivityStyle, string> = {
  AGGRESSIVE: 'Agresivo',
  BALANCED: 'Balanceado',
  SNIPER: 'Francotirador',
};

function getShareUrl(data: ShareData): string {
  return `${SITE_URL}/devices/${data.deviceSlug}?style=${data.style.toLowerCase()}`;
}

function getShareText(data: ShareData): string {
  return `${STYLE_EMOJI[data.style]} Sensibilidades ${STYLE_LABELS[data.style]} para ${data.deviceBrand} ${data.deviceModel} en Free Fire — ¡generadas en SensiPRO! 🔥`;
}

export function getWhatsAppLink(data: ShareData): string {
  const text = encodeURIComponent(`${getShareText(data)}\n\n${getShareUrl(data)}`);
  return `https://wa.me/?text=${text}`;
}

export function getTwitterLink(data: ShareData): string {
  const text = encodeURIComponent(getShareText(data));
  const url = encodeURIComponent(getShareUrl(data));
  return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
}

export function getFacebookLink(data: ShareData): string {
  const url = encodeURIComponent(getShareUrl(data));
  return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
}

export function getTelegramLink(data: ShareData): string {
  const text = encodeURIComponent(getShareText(data));
  const url = encodeURIComponent(getShareUrl(data));
  return `https://t.me/share/url?url=${url}&text=${text}`;
}

export function getCopyText(data: ShareData): string {
  return `${getShareText(data)}\n${getShareUrl(data)}`;
}

export function getAllShareLinks(data: ShareData) {
  return {
    whatsapp: getWhatsAppLink(data),
    twitter: getTwitterLink(data),
    facebook: getFacebookLink(data),
    telegram: getTelegramLink(data),
    copyText: getCopyText(data),
    url: getShareUrl(data),
  };
}
```

```
[ARCHIVO] src/app/devices/[slug]/opengraph-image.tsx
```
```typescript
import { ImageResponse } from 'next/og';

import { prisma } from '@ares/database';

export const runtime = 'edge';
export const alt = 'Sensibilidades PRO — Free Fire';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({ params }: { params: { slug: string } }) {
  const device = await prisma.device.findUnique({
    where: { slug: params.slug },
    select: { brand: true, model: true, tier: true, screenHz: true, ramGb: true },
  });

  if (!device) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: '#050810', color: 'white', fontSize: 48, fontWeight: 700 }}>
          Sensibilidades PRO
        </div>
      ),
      { ...size },
    );
  }

  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', height: '100%', background: '#050810', color: 'white', padding: 80 }}>
        <div style={{ fontSize: 24, color: '#ff6a00', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' }}>
          Sensibilidades PRO
        </div>
        <div style={{ fontSize: 64, fontWeight: 900, marginTop: 16 }}>
          {device.brand} {device.model}
        </div>
        <div style={{ fontSize: 28, color: '#94a3b8', marginTop: 12 }}>
          {device.screenHz}Hz • {device.ramGb}GB RAM • Tier {device.tier}
        </div>
        <div style={{ fontSize: 22, color: '#64748b', marginTop: 40 }}>
          Genera sensibilidades basadas en hardware real → sensibilidadespro.com
        </div>
      </div>
    ),
    { ...size },
  );
}
```

```
[ARCHIVO] src/components/features/share-buttons.tsx
```
```tsx
'use client';

import { useState } from 'react';
import { Share2, Copy, Check, MessageCircle } from 'lucide-react';
import type { SensitivityStyle } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { getAllShareLinks } from '@/lib/share/share-links';

interface ShareButtonsProps {
  deviceBrand: string;
  deviceModel: string;
  deviceSlug: string;
  style: SensitivityStyle;
}

export function ShareButtons({ deviceBrand, deviceModel, deviceSlug, style }: ShareButtonsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const links = getAllShareLinks({ deviceBrand, deviceModel, deviceSlug, style });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(links.copyText);
      setCopied(true);
      toast('success', '¡Copiado al portapapeles!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('error', 'No se pudo copiar');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Sensibilidades para ${deviceBrand} ${deviceModel}`,
          text: links.copyText,
          url: links.url,
        });
      } catch {
        // User cancelled
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <Button variant="ghost" size="sm" onClick={handleNativeShare} leftIcon={<Share2 size={16} />}>
          Compartir
        </Button>
      )}

      <a href={links.whatsapp} target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="sm" leftIcon={<MessageCircle size={16} />}>
          WhatsApp
        </Button>
      </a>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        leftIcon={copied ? <Check size={16} /> : <Copy size={16} />}
      >
        {copied ? 'Copiado' : 'Copiar'}
      </Button>
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
# Test OG image
curl http://localhost:3000/devices/samsung-galaxy-a54/opengraph-image
```

### Commit: `feat(share): ARES-107 share system — WhatsApp, Twitter, FB, Telegram + dynamic OG images`

---

## ARES-108-favorites-system

**Fase:** 1 | **Prioridad:** MEDIO
**Dependencias:** ARES-003-auth-system, ARES-101
**Descripción:** CRUD de favoritos con toggle animado, límite FREE=3 / Premium=∞, API endpoints, y hooks de cliente.

### Archivos a crear:

```
[ARCHIVO] src/app/api/favorites/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { BusinessError, handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';
import { FREE_FAVORITE_LIMIT } from '@ares/config';
import { getRequiredSession } from '@/lib/auth/auth.middleware';

const addFavoriteSchema = z.object({
  deviceId: z.string().uuid(),
  style: z.enum(['AGGRESSIVE', 'BALANCED', 'SNIPER']),
  nickname: z.string().max(50).optional(),
});

export async function GET() {
  try {
    const session = await getRequiredSession();

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        device: {
          select: { id: true, brand: true, model: true, slug: true, tier: true, screenHz: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: favorites });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getRequiredSession();
    const body = await request.json();
    const parsed = addFavoriteSchema.parse(body);
    const tier = (session.user as Record<string, unknown>).tier as string;

    // Check limit for FREE users
    if (tier === 'FREE') {
      const count = await prisma.favorite.count({ where: { userId: session.user.id } });
      if (count >= FREE_FAVORITE_LIMIT) {
        throw new BusinessError(
          'FAVORITE_LIMIT',
          `Has alcanzado el límite de ${FREE_FAVORITE_LIMIT} favoritos. Mejora a Premium para guardar ilimitados.`,
        );
      }
    }

    // Check if already favorited
    const existing = await prisma.favorite.findFirst({
      where: {
        userId: session.user.id,
        deviceId: parsed.deviceId,
        style: parsed.style,
      },
    });

    if (existing) {
      throw new BusinessError('ALREADY_FAVORITED', 'Ya tienes esta configuración en favoritos');
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        deviceId: parsed.deviceId,
        style: parsed.style,
        nickname: parsed.nickname ?? null,
      },
      include: {
        device: {
          select: { id: true, brand: true, model: true, slug: true, tier: true },
        },
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { totalFavorites: { increment: 1 } },
    });

    logger.info('Favorite added', { userId: session.user.id, deviceId: parsed.deviceId });

    return NextResponse.json({ success: true, data: favorite }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/api/favorites/[id]/route.ts
```
```typescript
import { NextResponse } from 'next/server';

import { prisma } from '@ares/database';
import { NotFoundError, ForbiddenError, handleApiError } from '@ares/errors';
import { getRequiredSession } from '@/lib/auth/auth.middleware';

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getRequiredSession();

    const favorite = await prisma.favorite.findUnique({ where: { id: params.id } });
    if (!favorite) throw new NotFoundError('Favorite', params.id);
    if (favorite.userId !== session.user.id) throw new ForbiddenError();

    await prisma.favorite.delete({ where: { id: params.id } });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { totalFavorites: { decrement: 1 } },
    });

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/hooks/use-favorites.ts
```
```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SensitivityStyle } from '@prisma/client';

interface Favorite {
  id: string;
  deviceId: string;
  style: SensitivityStyle;
  nickname: string | null;
  device: {
    id: string;
    brand: string;
    model: string;
    slug: string;
    tier: string;
  };
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch('/api/favorites');
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.data ?? []);
      }
    } catch {
      // Silently fail for anonymous users
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const addFavorite = async (deviceId: string, style: SensitivityStyle, nickname?: string) => {
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, style, nickname }),
    });
    const data = await res.json();
    if (data.success) {
      setFavorites((prev) => [data.data, ...prev]);
      return { success: true };
    }
    return { success: false, error: data.error?.message ?? 'Error al guardar' };
  };

  const removeFavorite = async (id: string) => {
    const res = await fetch(`/api/favorites/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setFavorites((prev) => prev.filter((f) => f.id !== id));
      return { success: true };
    }
    return { success: false };
  };

  const isFavorite = (deviceId: string, style: SensitivityStyle) => {
    return favorites.some((f) => f.deviceId === deviceId && f.style === style);
  };

  return { favorites, loading, addFavorite, removeFavorite, isFavorite, refresh: fetchFavorites };
}
```

### Validación:
```bash
npx tsc --noEmit
# Test API
curl http://localhost:3000/api/favorites # (requires auth)
```

### Commit: `feat(favorites): ARES-108 favorites system — CRUD, tier limits, toggle hook`

---

## ARES-109-search-history

**Fase:** 1 | **Prioridad:** MEDIO
**Dependencias:** ARES-003-auth-system, ARES-101
**Descripción:** Timeline visual de búsquedas recientes con filtros por dispositivo y estilo. Límite FREE=10 / Premium=∞. API con paginación.

### Archivos a crear:

```
[ARCHIVO] src/app/api/history/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { FREE_HISTORY_LIMIT, DEFAULT_PAGE_SIZE } from '@ares/config';
import { getRequiredSession } from '@/lib/auth/auth.middleware';

export async function GET(request: NextRequest) {
  try {
    const session = await getRequiredSession();
    const tier = (session.user as Record<string, unknown>).tier as string;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? String(DEFAULT_PAGE_SIZE), 10), 100);
    const style = searchParams.get('style');
    const deviceId = searchParams.get('deviceId');

    const where: Record<string, unknown> = { userId: session.user.id };
    if (style && ['AGGRESSIVE', 'BALANCED', 'SNIPER'].includes(style)) {
      where.style = style;
    }
    if (deviceId) {
      where.deviceId = deviceId;
    }

    // FREE users only see last N entries
    const maxEntries = tier === 'FREE' ? FREE_HISTORY_LIMIT : undefined;

    const [history, total] = await Promise.all([
      prisma.searchHistory.findMany({
        where,
        include: {
          device: {
            select: { id: true, brand: true, model: true, slug: true, tier: true },
          },
        },
        orderBy: { searchedAt: 'desc' },
        skip: (page - 1) * limit,
        take: maxEntries ? Math.min(limit, maxEntries) : limit,
      }),
      prisma.searchHistory.count({ where }),
    ]);

    const effectiveTotal = maxEntries ? Math.min(total, maxEntries) : total;

    return NextResponse.json({
      success: true,
      data: history,
      meta: {
        page,
        limit,
        total: effectiveTotal,
        totalPages: Math.ceil(effectiveTotal / limit),
        isLimited: tier === 'FREE' && total > FREE_HISTORY_LIMIT,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const session = await getRequiredSession();

    await prisma.searchHistory.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ success: true, data: { cleared: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/hooks/use-history.ts
```
```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SensitivityStyle } from '@prisma/client';

interface HistoryEntry {
  id: string;
  deviceId: string;
  style: SensitivityStyle;
  searchedAt: string;
  device: {
    id: string;
    brand: string;
    model: string;
    slug: string;
    tier: string;
  };
}

interface HistoryMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  isLimited: boolean;
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [meta, setMeta] = useState<HistoryMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [styleFilter, setStyleFilter] = useState<SensitivityStyle | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (styleFilter) params.set('style', styleFilter);

      const res = await fetch(`/api/history?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.data ?? []);
        setMeta(data.meta ?? null);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [page, styleFilter]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const clearHistory = async () => {
    const res = await fetch('/api/history', { method: 'DELETE' });
    if (res.ok) {
      setHistory([]);
      setMeta(null);
    }
  };

  return {
    history,
    meta,
    loading,
    page,
    setPage,
    styleFilter,
    setStyleFilter,
    clearHistory,
    refresh: fetchHistory,
  };
}
```

### Validación:
```bash
npx tsc --noEmit
curl http://localhost:3000/api/history # (requires auth)
curl http://localhost:3000/api/history?style=BALANCED
```

### Commit: `feat(history): ARES-109 search history — timeline, filters, tier limits, pagination`

---

# ═══════════════════════════════════════════════════════════════════
# FIN DE FASE 1 — MOTOR DE SENSIBILIDADES
# ═══════════════════════════════════════════════════════════════════
#
# Al completar los 10 scripts de esta fase, el proyecto tiene:
#
# ✅ 500+ dispositivos reales con specs verificadas (16 marcas)
# ✅ Algoritmo de sensibilidades: Hz×Screen×RAM×Panel×Tier×Style
# ✅ Motor de giroscopio: ~50% base + AMOLED/GAMING bonuses
# ✅ 3 estilos completos: Agresivo, Balanceado, Francotirador
# ✅ Analizador de specs: performance score 0-100 + auto-tier
# ✅ Comparador de dispositivos: specs + sensitivity + gyro diff
# ✅ Exportar configs: imagen 1080×1080/1080×1920 + texto
# ✅ Share: WhatsApp, Twitter, FB, Telegram + OG dinámico
# ✅ Favoritos: CRUD + tier limits (FREE=3) + hook
# ✅ Historial: timeline + filtros + paginación + tier limits
# ✅ API endpoints: /generate, /compare, /export, /devices, /favorites, /history
# ✅ 20+ unit tests del algoritmo y comparador
#
# El CORE del producto está funcional. Un usuario puede:
# 1. Buscar su dispositivo
# 2. Generar sensibilidades para 3 estilos
# 3. Ver giroscopio (Premium)
# 4. Comparar con otro device (Premium)
# 5. Exportar imagen/texto (Premium)
# 6. Compartir en redes sociales
# 7. Guardar en favoritos
# 8. Ver historial de búsquedas
#
# PRÓXIMA FASE: docs/MASTER-PLAN-C.md (Fase 2 — UI/UX Elite Gaming)
#
# ═══════════════════════════════════════════════════════════════════
