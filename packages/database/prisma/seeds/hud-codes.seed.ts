import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 17 códigos HUD REALES de Free Fire — extraídos de fuentes públicas (SystemWoods)
// CRÍTICO: Los códigos son EXACTOS. NO cambiar NINGÚN carácter.
const hudCodes = [
  // === 2 DEDOS ===
  { fingers: 2, code: '#FFHUDT6O3jSJjT59Po7eO', label: 'Clásico Básico', precision: 80, velocity: 60, playability: 70, isDefault: true },
  { fingers: 2, code: '#FFHUDT6O3jqVY6q1Po7eM', label: 'Precisión Alta', precision: 88, velocity: 80, playability: 81, isDefault: false },
  { fingers: 2, code: '#FFHUDT6O3jjZ0/KhPo7eO', label: 'Casual Cómodo', precision: 65, velocity: 60, playability: 80, isDefault: false },

  // === 3 DEDOS ===
  { fingers: 3, code: '#FFHUDT6O3jqVY6q1Po7eP', label: 'Balanceado', precision: 75, velocity: 80, playability: 70, isDefault: true },
  { fingers: 3, code: '#FFHUDT6O3jjZ0/KhPo7eM', label: 'Velocidad Media', precision: 70, velocity: 80, playability: 65, isDefault: false },
  { fingers: 3, code: '#FFHUDT6O3jAwzFJlPo7eP', label: 'Freestyle Elite', precision: 90, velocity: 85, playability: 93, isDefault: false },
  { fingers: 3, code: '#FFHUDT6O3jldUm9NPo7eP', label: 'Rush Master', precision: 83, velocity: 90, playability: 95, isDefault: false },
  { fingers: 3, code: '#FFHUDT6O3jldUm9NPo7eO', label: 'Ultra Veloz', precision: 87, velocity: 93, playability: 95, isDefault: false },
  { fingers: 3, code: '#FFHUDT6O3jldUm9NPo7eM', label: 'Máxima Velocidad', precision: 88, velocity: 97, playability: 93, isDefault: false },
  { fingers: 3, code: '#FFHUDT6O3jlCbzSRPo7eM', label: 'Competitivo 3D', precision: 88, velocity: 92, playability: 92, isDefault: false },
  { fingers: 3, code: '#FFHUDT6O3jSH76mdPo7eP', label: 'Precisión Sniper', precision: 92, velocity: 75, playability: 86, isDefault: false },
  { fingers: 3, code: '#FFHUDT6O3j/rpZgBPo7eP', label: 'Agresivo PRO', precision: 87, velocity: 90, playability: 92, isDefault: false },

  // === 4 DEDOS ===
  { fingers: 4, code: '#FFHUDT6O3jqVY6q1Po7eO', label: 'Garra Estándar', precision: 80, velocity: 90, playability: 85, isDefault: true },
  { fingers: 4, code: '#FFHUDT6O3jjZ0/KhPo7eP', label: 'Garra Equilibrada', precision: 85, velocity: 85, playability: 90, isDefault: false },
  { fingers: 4, code: '#FFHUDT6O3jAwzFJlPo7eM', label: 'Garra Táctica', precision: 75, velocity: 81, playability: 85, isDefault: false },
  { fingers: 4, code: '#FFHUDT6O3jlCbzSRPo7eO', label: 'Garra Precisión', precision: 95, velocity: 75, playability: 90, isDefault: false },

  // === 5 DEDOS ===
  { fingers: 5, code: '#FFHUDT6O3jAwzFJlPo7eO', label: 'Pro 5 Dedos', precision: 90, velocity: 87, playability: 90, isDefault: true },
];

export async function seedHudCodes(): Promise<void> {
  // Borrar TODOS los registros existentes
  await prisma.hudCode.deleteMany();

  // Insertar los 17 códigos exactos
  const result = await prisma.hudCode.createMany({
    data: hudCodes,
  });

  console.log(`  ✅ ${result.count} HUD codes seeded (2D: 3, 3D: 9, 4D: 4, 5D: 1)`);
}

// Ejecutar directamente si se invoca como script
if (require.main === module) {
  seedHudCodes()
    .catch((e) => {
      console.error('❌ HUD codes seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
