import { PrismaClient } from '@prisma/client';

import { estimateDpiFromDevice } from '@ares/algorithms';

import { ALL_DEVICES } from './devices';

const prisma = new PrismaClient();

function slugify(brand: string, model: string): string {
  return `${brand}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function seedDevices(): Promise<void> {
  // eslint-disable-next-line no-console
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

    const screenDpi = estimateDpiFromDevice(device.brand, device.model, device.tier);

    await prisma.device.create({
      data: {
        brand: device.brand,
        model: device.model,
        slug,
        screenHz: device.screenHz,
        screenSize: device.screenSize,
        screenDpi,
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

  // eslint-disable-next-line no-console
  console.log(`  ✅ ${created} devices created, ${skipped} already existed`);
}
