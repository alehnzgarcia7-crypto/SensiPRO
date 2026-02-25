import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface HudCodeSeed {
  fingers: number;
  code: string;
  label: string;
  playerName: string | null;
  description: string;
  screenMin: number | null;
  screenMax: number | null;
  source: string;
  precision: number;
  velocity: number;
  playability: number;
  isDefault: boolean;
}

const hudCodes: HudCodeSeed[] = [
  // === 2 DEDOS ===
  {
    fingers: 2,
    code: '#FFHUDT6O3jjGFRltPo7eM',
    label: 'Raistar Classic',
    playerName: 'Raistar',
    description: 'Layout del legendario Raistar, ideal para principiantes y jugadores casuales',
    screenMin: 5.5,
    screenMax: 7.0,
    source: 'pro_player',
    precision: 65,
    velocity: 45,
    playability: 95,
    isDefault: true,
  },
  {
    fingers: 2,
    code: '#FFHUDT6O3ji784yxPo7eO',
    label: 'iPad Optimizado',
    playerName: null,
    description: 'Optimizado para pantallas grandes tipo iPad y tablets',
    screenMin: 7.0,
    screenMax: 13.0,
    source: 'community',
    precision: 60,
    velocity: 40,
    playability: 98,
    isDefault: false,
  },

  // === 3 DEDOS ===
  {
    fingers: 3,
    code: '#FFHUDT6O3jlm5zV9Po7eN',
    label: 'PUBG Style Transition',
    playerName: null,
    description: 'Estilo PUBG adaptado para Free Fire, perfecto si vienes de otro BR',
    screenMin: 5.5,
    screenMax: 7.0,
    source: 'community',
    precision: 72,
    velocity: 75,
    playability: 68,
    isDefault: false,
  },
  {
    fingers: 3,
    code: '#FFHUDT6O3jlm5zV9Po7eO',
    label: 'Versatile PRO',
    playerName: null,
    description: 'Layout versátil para pantallas medianas, buen balance general',
    screenMin: 5.8,
    screenMax: 6.7,
    source: 'pro_player',
    precision: 78,
    velocity: 72,
    playability: 70,
    isDefault: true,
  },
  {
    fingers: 3,
    code: '#FFHUDT6O3jgmU52VPo7eP',
    label: 'Ricozx Freestyle',
    playerName: 'Ricozx',
    description: 'Config del freestyler Ricozx, ideal para movimiento agresivo',
    screenMin: 5.5,
    screenMax: 6.8,
    source: 'pro_player',
    precision: 75,
    velocity: 82,
    playability: 65,
    isDefault: false,
  },

  // === 4 DEDOS ===
  {
    fingers: 4,
    code: '#FFHUDT6O3jlm5zV9Po7eP',
    label: 'Competitivo OB51',
    playerName: null,
    description: 'Layout competitivo actualizado para OB51, garra profesional',
    screenMin: 6.0,
    screenMax: 7.0,
    source: 'esports',
    precision: 92,
    velocity: 88,
    playability: 48,
    isDefault: true,
  },
  {
    fingers: 4,
    code: '#FFHUDT6O3jgUKjiRPo7eP',
    label: 'Claw Ágil',
    playerName: null,
    description: 'Garra ágil para deploy rápido de Gloo Walls y combate CQB',
    screenMin: 5.8,
    screenMax: 6.8,
    source: 'community',
    precision: 88,
    velocity: 90,
    playability: 45,
    isDefault: false,
  },
  {
    fingers: 4,
    code: '#FFHUDT6O3jjct/NNPo7eO',
    label: 'PVP Destroyer',
    playerName: null,
    description: 'Especializado en PVP y X1, máxima velocidad de reacción',
    screenMin: 5.5,
    screenMax: 7.0,
    source: 'pro_player',
    precision: 95,
    velocity: 92,
    playability: 42,
    isDefault: false,
  },
];

export async function seedHudCodes(): Promise<void> {
  let count = 0;

  for (const hudCode of hudCodes) {
    await prisma.hudCode.upsert({
      where: { code: hudCode.code },
      update: {
        fingers: hudCode.fingers,
        label: hudCode.label,
        playerName: hudCode.playerName,
        description: hudCode.description,
        screenMin: hudCode.screenMin,
        screenMax: hudCode.screenMax,
        source: hudCode.source,
        precision: hudCode.precision,
        velocity: hudCode.velocity,
        playability: hudCode.playability,
        isDefault: hudCode.isDefault,
      },
      create: {
        fingers: hudCode.fingers,
        code: hudCode.code,
        label: hudCode.label,
        playerName: hudCode.playerName,
        description: hudCode.description,
        screenMin: hudCode.screenMin,
        screenMax: hudCode.screenMax,
        source: hudCode.source,
        precision: hudCode.precision,
        velocity: hudCode.velocity,
        playability: hudCode.playability,
        isDefault: hudCode.isDefault,
      },
    });
    count++;
  }

  console.log(`  ✅ ${count} HUD codes seeded`);
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
