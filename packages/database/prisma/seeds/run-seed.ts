import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

import { seedDevices } from './seed-devices';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ARES database...');

  // 1. Create admin user
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sensibilidadespro.com' },
    update: {},
    create: {
      email: 'admin@sensibilidadespro.com',
      username: 'admin',
      password: adminPassword,
      displayName: 'ARES Admin',
      role: 'ADMIN',
      tier: 'VIP',
      referralCode: 'ARES-ADMIN',
      isActive: true,
    },
  });
  console.log(`  ✅ Admin user: ${admin.email}`);

  // 2. Create base achievements
  const achievements = [
    { key: 'FIRST_SEARCH', name: 'Primera Búsqueda', description: 'Genera tu primera sensibilidad', category: 'search', points: 10, requirement: { type: 'count', field: 'totalSearches', value: 1 } },
    { key: 'SEARCHES_10', name: 'Explorador', description: 'Genera 10 sensibilidades', category: 'search', points: 25, requirement: { type: 'count', field: 'totalSearches', value: 10 } },
    { key: 'SEARCHES_50', name: 'Investigador', description: 'Genera 50 sensibilidades', category: 'search', points: 50, requirement: { type: 'count', field: 'totalSearches', value: 50 } },
    { key: 'SEARCHES_100', name: 'Científico', description: 'Genera 100 sensibilidades', category: 'milestone', points: 100, requirement: { type: 'count', field: 'totalSearches', value: 100 } },
    { key: 'FIRST_FAVORITE', name: 'Coleccionista', description: 'Guarda tu primera configuración', category: 'social', points: 10, requirement: { type: 'count', field: 'totalFavorites', value: 1 } },
    { key: 'FAVORITES_10', name: 'Archivista', description: 'Guarda 10 configuraciones', category: 'social', points: 25, requirement: { type: 'count', field: 'totalFavorites', value: 10 } },
    { key: 'FIRST_SHARE', name: 'Difusor', description: 'Comparte tu primera configuración', category: 'social', points: 15, requirement: { type: 'count', field: 'totalShares', value: 1 } },
    { key: 'SHARES_10', name: 'Influencer', description: 'Comparte 10 configuraciones', category: 'social', points: 30, requirement: { type: 'count', field: 'totalShares', value: 10 } },
    { key: 'PREMIUM_MEMBER', name: 'Miembro Premium', description: 'Obtén una cuenta Premium', category: 'premium', points: 50, requirement: { type: 'tier', value: 'PREMIUM' } },
    { key: 'VIP_MEMBER', name: 'Élite VIP', description: 'Obtén una cuenta VIP', category: 'premium', points: 100, requirement: { type: 'tier', value: 'VIP' } },
    { key: 'REFERRAL_1', name: 'Reclutador', description: 'Refiere a tu primer amigo', category: 'social', points: 25, requirement: { type: 'count', field: 'referralCount', value: 1 } },
    { key: 'REFERRAL_5', name: 'Capitán', description: 'Refiere a 5 amigos', category: 'social', points: 75, requirement: { type: 'count', field: 'referralCount', value: 5 } },
    { key: 'ALL_STYLES', name: 'Versátil', description: 'Prueba los 3 estilos de juego', category: 'search', points: 20, requirement: { type: 'styles_tried', value: 3 } },
    { key: 'COMPARE_FIRST', name: 'Analista', description: 'Compara 2 dispositivos por primera vez', category: 'search', points: 15, requirement: { type: 'action', field: 'compare', value: 1 } },
    { key: 'EARLY_ADOPTER', name: 'Early Adopter', description: 'Registrado en los primeros 30 días', category: 'milestone', points: 50, requirement: { type: 'date_before', value: '2026-04-01' } },
    { key: 'NIGHT_OWL', name: 'Búho Nocturno', description: 'Genera sensibilidades después de medianoche', category: 'milestone', points: 15, requirement: { type: 'time_range', value: { start: 0, end: 5 } } },
    { key: 'TOURNAMENT_JOIN', name: 'Competidor', description: 'Participa en tu primer torneo', category: 'social', points: 20, requirement: { type: 'action', field: 'tournament_join', value: 1 } },
    { key: 'GUIDE_READER', name: 'Estudiante', description: 'Lee 5 guías de la academia', category: 'search', points: 20, requirement: { type: 'action', field: 'guides_read', value: 5 } },
    { key: 'CONFIG_SHARED', name: 'Generoso', description: 'Comparte una config en la comunidad', category: 'social', points: 20, requirement: { type: 'action', field: 'config_shared', value: 1 } },
    { key: 'POPULAR_CONFIG', name: 'Popular', description: 'Tu config compartida recibe 10 upvotes', category: 'social', points: 50, requirement: { type: 'action', field: 'config_upvotes', value: 10 } },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: {},
      create: achievement,
    });
  }
  console.log(`  ✅ ${achievements.length} achievements created`);

  // 3. Seed devices
  await seedDevices();

  console.log('🎯 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
