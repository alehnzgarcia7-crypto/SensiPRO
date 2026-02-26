/**
 * Script: Actualizar screenDpi de todos los dispositivos
 * Usa estimateDpiFromDevice() del sensitivity engine
 */
import { PrismaClient } from '@prisma/client';
import { estimateDpiFromDevice } from '../packages/algorithms/src/sensitivity-engine';

const prisma = new PrismaClient();

async function main() {
  const devices = await prisma.device.findMany({
    where: { screenDpi: null },
    select: { id: true, brand: true, model: true, tier: true },
  });

  console.log(`Dispositivos con screenDpi NULL: ${devices.length}`);

  let updated = 0;
  for (const device of devices) {
    const dpi = estimateDpiFromDevice(device.brand, device.model, device.tier);
    await prisma.device.update({
      where: { id: device.id },
      data: { screenDpi: dpi },
    });
    updated++;
  }

  console.log(`Dispositivos actualizados: ${updated}`);

  // Verificación
  const stillNull = await prisma.device.count({ where: { screenDpi: null } });
  console.log(`Dispositivos sin DPI restantes: ${stillNull}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
