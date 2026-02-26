/**
 * Script: Recalcular TODAS las sensibilidades de los 503 dispositivos
 * Genera 18 combinaciones por dispositivo (3 estilos × 3 calibraciones × 2 dpiModes)
 * Usa el engine v4.0-forensic con DPI actualizado
 */
import { PrismaClient, SensitivityStyle, CalibrationLevel } from '@prisma/client';
import { generateAllCalibrations } from '../packages/algorithms/src/calibration-engine';
import type { DeviceSpecs } from '../packages/algorithms/src/types';

const prisma = new PrismaClient();

const STYLES: SensitivityStyle[] = ['AGGRESSIVE', 'BALANCED', 'SNIPER'];

async function main() {
  // 1. Obtener todos los dispositivos activos
  const devices = await prisma.device.findMany({
    where: { isActive: true },
    select: {
      id: true,
      brand: true,
      model: true,
      screenHz: true,
      screenSize: true,
      screenDpi: true,
      ramGb: true,
      panelType: true,
      tier: true,
    },
  });

  console.log(`Dispositivos encontrados: ${devices.length}`);

  // 2. Borrar sensibilidades existentes para regenerar limpio
  const deleted = await prisma.sensitivity.deleteMany({});
  console.log(`Sensibilidades anteriores eliminadas: ${deleted.count}`);

  // 3. Generar todas las combinaciones
  let totalCreated = 0;
  const batchSize = 50;

  for (let i = 0; i < devices.length; i += batchSize) {
    const batch = devices.slice(i, i + batchSize);
    const records: Parameters<typeof prisma.sensitivity.createMany>[0]['data'] = [];

    for (const device of batch) {
      const specs: DeviceSpecs = {
        screenHz: device.screenHz,
        screenSize: device.screenSize,
        screenDpi: device.screenDpi ?? undefined,
        ramGb: device.ramGb,
        panelType: device.panelType,
        tier: device.tier,
      };

      for (const style of STYLES) {
        // generateAllCalibrations genera 6 combinaciones: 3 calibrations × 2 dpiModes
        const result = generateAllCalibrations(specs, style, true);

        for (const combo of result.combinations) {
          records.push({
            deviceId: device.id,
            style,
            general: combo.sensitivity.general,
            redPoint: combo.sensitivity.redPoint,
            scope2x: combo.sensitivity.scope2x,
            scope4x: combo.sensitivity.scope4x,
            sniperScope: combo.sensitivity.sniperScope,
            freeView: combo.sensitivity.freeView,
            gyroGeneral: combo.gyroscope?.gyroGeneral ?? null,
            gyroRedPoint: combo.gyroscope?.gyroRedPoint ?? null,
            gyroScope2x: combo.gyroscope?.gyroScope2x ?? null,
            gyroScope4x: combo.gyroscope?.gyroScope4x ?? null,
            gyroSniper: combo.gyroscope?.gyroSniper ?? null,
            gyroFreeView: combo.gyroscope?.gyroFreeView ?? null,
            calibration: combo.calibration as CalibrationLevel,
            dpiMode: combo.dpiMode,
            dpiValue: combo.dpiValue ?? null,
            buttonSize: combo.buttonSize,
          });
        }
      }
    }

    await prisma.sensitivity.createMany({ data: records });
    totalCreated += records.length;
    console.log(`  Batch ${Math.floor(i / batchSize) + 1}: ${records.length} registros (${totalCreated} total)`);
  }

  // 4. Verificación final
  const finalCount = await prisma.sensitivity.count();
  const deviceCount = await prisma.device.count({ where: { isActive: true } });
  console.log(`\nResultado:`);
  console.log(`  Dispositivos activos: ${deviceCount}`);
  console.log(`  Sensibilidades generadas: ${finalCount}`);
  console.log(`  Combinaciones por dispositivo: ${finalCount / deviceCount}`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
