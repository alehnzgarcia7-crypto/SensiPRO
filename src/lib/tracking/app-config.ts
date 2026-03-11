import { prisma } from '@ares/database';

export interface SensiProConfig {
  premiumPrice: number;
  originalPrice: number;
  paywallEnabled: boolean;
  maintenanceMode: boolean;
  announcementBanner: string;
  showDemo: boolean;
}

const DEFAULTS: SensiProConfig = {
  premiumPrice: 19900,
  originalPrice: 34900,
  paywallEnabled: true,
  maintenanceMode: false,
  announcementBanner: '',
  showDemo: false,
};

export async function getAppConfig(): Promise<SensiProConfig> {
  const rows = await prisma.appConfig.findMany();
  const config = { ...DEFAULTS };

  for (const row of rows) {
    switch (row.key) {
      case 'premiumPrice':
        config.premiumPrice = parseInt(row.value, 10) || DEFAULTS.premiumPrice;
        break;
      case 'originalPrice':
        config.originalPrice = parseInt(row.value, 10) || DEFAULTS.originalPrice;
        break;
      case 'paywallEnabled':
        config.paywallEnabled = row.value === 'true';
        break;
      case 'maintenanceMode':
        config.maintenanceMode = row.value === 'true';
        break;
      case 'announcementBanner':
        config.announcementBanner = row.value;
        break;
      case 'showDemo':
        config.showDemo = row.value === 'true';
        break;
    }
  }

  return config;
}

export async function setAppConfigValue(key: string, value: string, description?: string): Promise<void> {
  await prisma.appConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value, description },
  });
}

export async function initAppConfig(): Promise<void> {
  const entries = Object.entries(DEFAULTS);
  for (const [key, defaultValue] of entries) {
    const existing = await prisma.appConfig.findUnique({ where: { key } });
    if (!existing) {
      await prisma.appConfig.create({
        data: {
          key,
          value: String(defaultValue),
          description: `Config: ${key}`,
        },
      });
    }
  }
}
