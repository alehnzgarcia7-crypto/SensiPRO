import { prisma } from '@ares/database';

import { AdminContentGuides } from '@/components/admin/admin-content-guides';
import { AdminKpiCard } from '@/components/admin/admin-kpi-card';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface ContentStats {
  guidesTotal: number;
  guidesPublished: number;
  guidesDraft: number;
  devicesTotal: number;
  tournamentsTotal: number;
  tournamentsActive: number;
}

async function getContentStats(): Promise<ContentStats> {
  const [
    guidesTotal,
    guidesPublished,
    devicesTotal,
    tournamentsTotal,
    tournamentsActive,
  ] = await Promise.all([
    prisma.guide.count(),
    prisma.guide.count({ where: { isPublished: true } }),
    prisma.device.count(),
    prisma.tournament.count(),
    prisma.tournament.count({ where: { status: 'ACTIVE' } }),
  ]);

  return {
    guidesTotal,
    guidesPublished,
    guidesDraft: guidesTotal - guidesPublished,
    devicesTotal,
    tournamentsTotal,
    tournamentsActive,
  };
}

interface RecentGuide {
  id: string;
  title: string;
  category: string;
  isPremium: boolean;
  isPublished: boolean;
  viewCount: number;
  updatedAt: Date;
}

async function getRecentGuides(): Promise<RecentGuide[]> {
  return prisma.guide.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 50,
    select: {
      id: true,
      title: true,
      category: true,
      isPremium: true,
      isPublished: true,
      viewCount: true,
      updatedAt: true,
    },
  });
}

export default async function AdminContentPage() {
  const [stats, guides] = await Promise.all([
    getContentStats(),
    getRecentGuides(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-6">
        Gestión de Contenido
      </h1>

      {/* Stats KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AdminKpiCard
          label="Guías"
          value={stats.guidesTotal}
          sublabel={`${stats.guidesPublished} publicadas`}
          color="fire"
        />
        <AdminKpiCard
          label="Borradores"
          value={stats.guidesDraft}
          sublabel="Sin publicar"
          color="ice"
        />
        <AdminKpiCard
          label="Dispositivos"
          value={stats.devicesTotal}
          sublabel="En catálogo"
          color="gradient"
        />
        <AdminKpiCard
          label="Torneos"
          value={stats.tournamentsTotal}
          sublabel={`${stats.tournamentsActive} activos`}
          color="fire"
        />
      </div>

      {/* Top devices (quick view) */}
      <div className="mb-8">
        <h2 className="font-display font-bold text-white mb-3">
          Resumen Dispositivos
        </h2>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">
                {stats.devicesTotal} dispositivos registrados
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Usa la API POST /api/admin/devices para agregar nuevos
              </p>
            </div>
            <Badge variant="default" size="sm">
              {stats.devicesTotal}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Guides management (client component) */}
      <AdminContentGuides initialGuides={JSON.parse(JSON.stringify(guides))} />
    </div>
  );
}
