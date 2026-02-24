# ARES SensiPRO — MASTER PLAN G
# ══════════════════════════════════════════════════════════════
# FASE 6 — ADMIN Y ANALYTICS (6 scripts: ARES-600 → ARES-605)
# "Control total del negocio desde un panel"
# ══════════════════════════════════════════════════════════════
#
# Panel de administración completo: KPIs, gestión de usuarios,
# CMS para contenido, analytics con charts, soporte, y A/B testing.
# Solo accesible por usuarios con role ADMIN.
# ══════════════════════════════════════════════════════════════

## Instrucciones para Claude Code

1. **Lee CLAUDE.md** para convenciones
2. **Todas las rutas /admin/** requieren role ADMIN — usar requireRole('ADMIN')
3. **Charts**: usar recharts (ya instalado en ARES-000)
4. **Después de terminar**: actualiza PROGRESS.md, git commit + push

---

# ████████████████████████████████████████████████████████████
# █                                                          █
# █   FASE 6 — ADMIN Y ANALYTICS                            █
# █   Scripts 49-54 | El cockpit del CEO                    █
# █                                                          █
# ████████████████████████████████████████████████████████████

---

## ARES-600-admin-dashboard

**Fase:** 6 | **Prioridad:** CRÍTICO
**Dependencias:** ARES-400, ARES-407, ARES-003
**Descripción:** Dashboard principal admin: KPIs (users, MRR, searches, conversión), sparklines de tendencia, quick actions (generar códigos, crear torneo, publicar guía), y overview del sistema.

### Archivos a crear:

```
[ARCHIVO] src/app/(admin)/layout.tsx
```
```tsx
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as Record<string, unknown> | undefined)?.role;
  if (!session?.user || role !== 'ADMIN') redirect('/');

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
```

```
[ARCHIVO] src/components/admin/admin-sidebar.tsx
```
```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, BarChart3, LifeBuoy, FlaskConical } from 'lucide-react';

import { cn } from '@/lib/cn';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Usuarios', icon: Users },
  { href: '/admin/content', label: 'Contenido', icon: FileText },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/support', label: 'Soporte', icon: LifeBuoy },
  { href: '/admin/ab-tests', label: 'A/B Tests', icon: FlaskConical },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-background-elevated border-r border-white/5 p-4 shrink-0 hidden md:block">
      <div className="mb-6">
        <p className="text-xs font-ui text-fire-500 font-bold uppercase tracking-widest">ARES Admin</p>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-ui transition-colors min-h-[44px]',
                isActive ? 'bg-fire-500/10 text-fire-400 font-semibold' : 'text-slate-400 hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

```
[ARCHIVO] src/app/(admin)/admin/page.tsx
```
```tsx
import { prisma } from '@ares/database';
import { Card } from '@/components/ui/card';
import { AdminKpiCard } from '@/components/admin/admin-kpi-card';

async function getDashboardKpis() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

  const [
    totalUsers, newUsersWeek, premiumCount, vipCount,
    totalSearches, searchesWeek,
    totalRevenue, revenueMonth,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { tier: 'PREMIUM' } }),
    prisma.user.count({ where: { tier: 'VIP' } }),
    prisma.searchHistory.count(),
    prisma.searchHistory.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } }, _sum: { amount: true } }),
  ]);

  const paidUsers = premiumCount + vipCount;
  const conversionRate = totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : '0';
  const mrr = (premiumCount * 49) + (vipCount * 99);

  return {
    totalUsers,
    newUsersWeek,
    paidUsers,
    conversionRate,
    mrr,
    totalSearches,
    searchesWeek,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    revenueMonth: revenueMonth._sum.amount ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const kpis = await getDashboardKpis();

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Dashboard</h1>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AdminKpiCard label="Usuarios Totales" value={kpis.totalUsers} sublabel={`+${kpis.newUsersWeek} esta semana`} color="fire" />
        <AdminKpiCard label="MRR" value={`$${kpis.mrr.toLocaleString()}`} sublabel="MXN/mes" color="gradient" />
        <AdminKpiCard label="Conversión" value={`${kpis.conversionRate}%`} sublabel={`${kpis.paidUsers} pagando`} color="ice" />
        <AdminKpiCard label="Búsquedas" value={kpis.totalSearches} sublabel={`+${kpis.searchesWeek} esta semana`} color="fire" />
      </div>

      {/* Quick actions */}
      <h2 className="font-display font-bold text-white mb-3">Acciones Rápidas</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: '/admin/content?action=new-guide', label: 'Nueva Guía' },
          { href: '/admin/users?action=generate-codes', label: 'Generar Códigos' },
          { href: '/admin/content?action=new-tournament', label: 'Crear Torneo' },
          { href: '/admin/analytics', label: 'Ver Analytics' },
          { href: '/admin/support', label: 'Ver Tickets' },
          { href: '/admin/ab-tests?action=new', label: 'Nuevo A/B Test' },
        ].map((action) => (
          <a key={action.href} href={action.href}>
            <Card className="p-4 text-center hover:border-fire-500/20 transition-colors min-h-[44px]">
              <p className="text-sm font-ui font-semibold text-white">{action.label}</p>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
```

```
[ARCHIVO] src/components/admin/admin-kpi-card.tsx
```
```tsx
import { cn } from '@/lib/cn';

interface AdminKpiCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  color?: 'fire' | 'ice' | 'gradient';
}

export function AdminKpiCard({ label, value, sublabel, color = 'fire' }: AdminKpiCardProps) {
  return (
    <div className="glass p-5">
      <p className="text-xs font-ui text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={cn(
        'text-3xl font-display font-black mt-1',
        color === 'gradient' ? 'text-gradient-fire-ice' : color === 'ice' ? 'text-ice-500' : 'text-white',
      )}>
        {value}
      </p>
      {sublabel && <p className="text-xs text-slate-500 mt-1">{sublabel}</p>}
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
ls src/app/\(admin\)/layout.tsx src/app/\(admin\)/admin/page.tsx
ls src/components/admin/admin-sidebar.tsx src/components/admin/admin-kpi-card.tsx
```

### Commit: `feat(admin): ARES-600 admin dashboard — KPIs, sidebar nav, quick actions, role-protected layout`

---

## ARES-601-user-management

**Fase:** 6 | **Prioridad:** ALTO
**Dependencias:** ARES-600, ARES-400
**Descripción:** Tabla de usuarios con búsqueda, filtros por tier/role, cambiar tier manualmente, cambiar role, desactivar cuenta, y exportar CSV.

### Archivos a crear:

```
[ARCHIVO] src/app/api/admin/users/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { requireRole } from '@/lib/auth/auth.middleware';

export async function GET(request: NextRequest) {
  try {
    await requireRole('ADMIN');

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? '';
    const tier = searchParams.get('tier');
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = 20;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (tier && ['FREE', 'PREMIUM', 'VIP'].includes(tier)) {
      where.tier = tier;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, username: true, email: true, tier: true, role: true,
          isActive: true, totalSearches: true, createdAt: true, tierExpiresAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/api/admin/users/[id]/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError, NotFoundError } from '@ares/errors';
import { requireRole } from '@/lib/auth/auth.middleware';
import { logger } from '@ares/logger';

const updateSchema = z.object({
  tier: z.enum(['FREE', 'PREMIUM', 'VIP']).optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
  tierExpiresAt: z.string().datetime().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireRole('ADMIN');

    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) throw new NotFoundError('User', params.id);

    const body = await request.json();
    const parsed = updateSchema.parse(body);

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(parsed.tier ? { tier: parsed.tier } : {}),
        ...(parsed.role ? { role: parsed.role } : {}),
        ...(parsed.isActive !== undefined ? { isActive: parsed.isActive } : {}),
        ...(parsed.tierExpiresAt ? { tierExpiresAt: new Date(parsed.tierExpiresAt) } : {}),
      },
      select: { id: true, username: true, tier: true, role: true, isActive: true },
    });

    logger.info('Admin updated user', { targetUserId: params.id, changes: parsed });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/api/admin/users/export/route.ts
```
```typescript
import { NextResponse } from 'next/server';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { requireRole } from '@/lib/auth/auth.middleware';

export async function GET() {
  try {
    await requireRole('ADMIN');

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, username: true, email: true, tier: true, role: true,
        isActive: true, totalSearches: true, totalFavorites: true,
        totalReferrals: true, createdAt: true, tierExpiresAt: true,
      },
    });

    const header = 'id,username,email,tier,role,active,searches,favorites,referrals,created,tier_expires';
    const rows = users.map((u) =>
      [
        u.id, u.username, u.email, u.tier, u.role, u.isActive,
        u.totalSearches, u.totalFavorites, u.totalReferrals,
        u.createdAt.toISOString(), u.tierExpiresAt?.toISOString() ?? '',
      ].join(','),
    );
    const csv = [header, ...rows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/(admin)/admin/users/page.tsx
```
```tsx
import { AdminUsersTable } from '@/components/admin/admin-users-table';

export default function AdminUsersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Usuarios</h1>
        <a
          href="/api/admin/users/export"
          className="text-xs font-ui text-fire-400 hover:text-fire-300"
        >
          Exportar CSV ↓
        </a>
      </div>
      <AdminUsersTable />
    </div>
  );
}
```

```
[ARCHIVO] src/components/admin/admin-users-table.tsx
```
```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/components/ui/toast';

const TIER_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'FREE', label: 'Free' },
  { key: 'PREMIUM', label: 'Premium' },
  { key: 'VIP', label: 'VIP' },
];

interface AdminUser {
  id: string;
  username: string;
  email: string;
  tier: string;
  role: string;
  isActive: boolean;
  totalSearches: number;
  createdAt: string;
}

export function AdminUsersTable() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 300);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (tier !== 'all') params.set('tier', tier);

    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.data ?? []);
    setTotalPages(data.meta?.totalPages ?? 1);
    setLoading(false);
  }, [page, debouncedSearch, tier]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleUpdateTier = async (userId: string, newTier: string) => {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier: newTier, tierExpiresAt: expiresAt.toISOString() }),
    });
    if (res.ok) {
      toast('success', `Tier cambiado a ${newTier}`);
      fetchUsers();
    }
  };

  const handleToggleActive = async (userId: string, current: boolean) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    });
    if (res.ok) {
      toast('success', current ? 'Usuario desactivado' : 'Usuario activado');
      fetchUsers();
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar usuario o email..."
            className="pl-9"
          />
        </div>
        <Tabs tabs={TIER_TABS} activeTab={tier} onChange={(t) => { setTier(t); setPage(1); }} />
      </div>

      {/* Table */}
      <div className="glass overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left">
              <th className="p-3 text-xs font-ui text-slate-500">Usuario</th>
              <th className="p-3 text-xs font-ui text-slate-500">Email</th>
              <th className="p-3 text-xs font-ui text-slate-500">Tier</th>
              <th className="p-3 text-xs font-ui text-slate-500">Búsquedas</th>
              <th className="p-3 text-xs font-ui text-slate-500">Estado</th>
              <th className="p-3 text-xs font-ui text-slate-500">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="p-3 font-ui font-semibold text-white">{u.username}</td>
                <td className="p-3 text-slate-400">{u.email}</td>
                <td className="p-3">
                  <Badge variant={u.tier === 'VIP' ? 'vip' : u.tier === 'PREMIUM' ? 'premium' : 'free'} size="sm">
                    {u.tier}
                  </Badge>
                </td>
                <td className="p-3 text-slate-400 tabular-nums">{u.totalSearches}</td>
                <td className="p-3">
                  <span className={u.isActive ? 'text-success' : 'text-danger'}>
                    {u.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <select
                      defaultValue={u.tier}
                      onChange={(e) => handleUpdateTier(u.id, e.target.value)}
                      className="bg-background-base border border-white/10 rounded px-2 py-1 text-xs text-white"
                    >
                      <option value="FREE">FREE</option>
                      <option value="PREMIUM">PREMIUM</option>
                      <option value="VIP">VIP</option>
                    </select>
                    <Button variant="ghost" size="sm" onClick={() => handleToggleActive(u.id, u.isActive)}>
                      {u.isActive ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
          ← Anterior
        </Button>
        <span className="text-xs text-slate-500">Página {page} de {totalPages}</span>
        <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
          Siguiente →
        </Button>
      </div>
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
curl "http://localhost:3000/api/admin/users?page=1" # (requires ADMIN)
curl "http://localhost:3000/api/admin/users/export" # CSV download
```

### Commit: `feat(users): ARES-601 user management — table with search/filters, tier/role change, deactivate, CSV export`

---

## ARES-602-content-management

**Fase:** 6 | **Prioridad:** ALTO
**Dependencias:** ARES-600, ARES-301, ARES-100
**Descripción:** CMS admin: CRUD para guías (crear, editar, publish/unpublish), gestión de dispositivos (agregar/editar), y gestión de torneos.

### Archivos a crear:

```
[ARCHIVO] src/app/api/admin/guides/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { requireRole } from '@/lib/auth/auth.middleware';

const createGuideSchema = z.object({
  title: z.string().min(5).max(200),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(10).max(500),
  category: z.enum(['BASICS', 'SENSITIVITY', 'WEAPONS', 'STRATEGY', 'ADVANCED', 'DEVICE']),
  tier: z.enum(['FREE', 'PREMIUM', 'VIP']),
  readTimeMin: z.number().int().min(1).max(60),
  isFeatured: z.boolean().optional().default(false),
  sections: z.array(z.object({
    title: z.string().min(3),
    content: z.string().min(10),
    order: z.number().int(),
    isPremium: z.boolean().default(false),
  })),
});

export async function GET(request: NextRequest) {
  try {
    await requireRole('ADMIN');
    const guides = await prisma.guide.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true, title: true, slug: true, category: true, tier: true,
        isPublished: true, isFeatured: true, updatedAt: true,
        _count: { select: { sections: true } },
      },
    });
    return NextResponse.json({ success: true, data: guides });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole('ADMIN');
    const body = await request.json();
    const parsed = createGuideSchema.parse(body);

    const guide = await prisma.guide.create({
      data: {
        title: parsed.title,
        slug: parsed.slug,
        excerpt: parsed.excerpt,
        category: parsed.category,
        tier: parsed.tier,
        readTimeMin: parsed.readTimeMin,
        isFeatured: parsed.isFeatured,
        isPublished: false,
        sections: {
          create: parsed.sections.map((s) => ({
            title: s.title,
            content: s.content,
            order: s.order,
            isPremium: s.isPremium,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, data: guide }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/api/admin/guides/[id]/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError, NotFoundError } from '@ares/errors';
import { requireRole } from '@/lib/auth/auth.middleware';

const updateSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  excerpt: z.string().max(500).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
}).partial();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireRole('ADMIN');

    const guide = await prisma.guide.findUnique({ where: { id: params.id } });
    if (!guide) throw new NotFoundError('Guide', params.id);

    const body = await request.json();
    const parsed = updateSchema.parse(body);

    const updated = await prisma.guide.update({
      where: { id: params.id },
      data: {
        ...parsed,
        ...(parsed.isPublished && !guide.publishedAt ? { publishedAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireRole('ADMIN');
    await prisma.guide.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/api/admin/devices/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { requireRole } from '@/lib/auth/auth.middleware';

const createDeviceSchema = z.object({
  brand: z.string().min(2).max(50),
  model: z.string().min(2).max(100),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/),
  screenHz: z.number().int().min(30).max(240),
  screenSize: z.number().min(4).max(8),
  ramGb: z.number().min(1).max(24),
  panelType: z.enum(['LCD', 'IPS', 'AMOLED', 'OLED', 'LTPO']),
  tier: z.enum(['LOW', 'MID', 'HIGH', 'GAMING']),
  chipset: z.string().optional(),
  isPopular: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    await requireRole('ADMIN');
    const body = await request.json();
    const parsed = createDeviceSchema.parse(body);

    const device = await prisma.device.create({ data: parsed });
    return NextResponse.json({ success: true, data: device }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/(admin)/admin/content/page.tsx
```
```tsx
import { prisma } from '@ares/database';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default async function AdminContentPage() {
  const [guides, devices, tournaments] = await Promise.all([
    prisma.guide.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 20,
      select: { id: true, title: true, category: true, tier: true, isPublished: true, updatedAt: true },
    }),
    prisma.device.count(),
    prisma.tournament.count(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Contenido</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="p-4 text-center">
          <p className="text-2xl font-display font-bold text-white">{guides.length}</p>
          <p className="text-xs text-slate-500">Guías</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-display font-bold text-white">{devices}</p>
          <p className="text-xs text-slate-500">Dispositivos</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-display font-bold text-white">{tournaments}</p>
          <p className="text-xs text-slate-500">Torneos</p>
        </Card>
      </div>

      {/* Guides table */}
      <h2 className="font-display font-bold text-white mb-3">Guías</h2>
      <div className="glass overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left">
              <th className="p-3 text-xs font-ui text-slate-500">Título</th>
              <th className="p-3 text-xs font-ui text-slate-500">Categoría</th>
              <th className="p-3 text-xs font-ui text-slate-500">Tier</th>
              <th className="p-3 text-xs font-ui text-slate-500">Estado</th>
            </tr>
          </thead>
          <tbody>
            {guides.map((g) => (
              <tr key={g.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="p-3 font-ui font-semibold text-white">{g.title}</td>
                <td className="p-3 text-slate-400">{g.category}</td>
                <td className="p-3"><Badge variant={g.tier === 'FREE' ? 'free' : 'premium'} size="sm">{g.tier}</Badge></td>
                <td className="p-3">
                  <span className={g.isPublished ? 'text-success' : 'text-warning'}>
                    {g.isPublished ? 'Publicada' : 'Borrador'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
curl http://localhost:3000/api/admin/guides # (ADMIN)
```

### Commit: `feat(cms): ARES-602 content management — CRUD guides, add devices, content overview page`

---

## ARES-603-analytics-dashboard

**Fase:** 6 | **Prioridad:** ALTO
**Dependencias:** ARES-600, ARES-407
**Descripción:** Dashboard analytics con recharts: búsquedas por día, dispositivos más buscados, distribución de estilos, conversión funnel, y retención.

### Archivos a crear:

```
[ARCHIVO] src/app/api/admin/analytics/route.ts
```
```typescript
import { NextResponse } from 'next/server';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { requireRole } from '@/lib/auth/auth.middleware';

export async function GET() {
  try {
    await requireRole('ADMIN');

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    const [dailySearches, topDevices, styleDistribution, tierDistribution] = await Promise.all([
      prisma.$queryRaw<{ date: string; count: number }[]>`
        SELECT DATE(created_at) as date, COUNT(*)::int as count
        FROM search_histories
        WHERE created_at >= ${thirtyDaysAgo}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      prisma.$queryRaw<{ brand: string; model: string; count: number }[]>`
        SELECT d.brand, d.model, COUNT(*)::int as count
        FROM search_histories sh
        JOIN devices d ON d.id = sh.device_id
        WHERE sh.created_at >= ${thirtyDaysAgo}
        GROUP BY d.brand, d.model
        ORDER BY count DESC
        LIMIT 10
      `,
      prisma.searchHistory.groupBy({
        by: ['style'],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { style: true },
      }),
      prisma.user.groupBy({
        by: ['tier'],
        _count: { tier: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        dailySearches,
        topDevices,
        styleDistribution: styleDistribution.map((s) => ({ style: s.style, count: s._count.style })),
        tierDistribution: tierDistribution.map((t) => ({ tier: t.tier, count: t._count.tier })),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/(admin)/admin/analytics/page.tsx
```
```tsx
import { AnalyticsCharts } from '@/components/admin/analytics-charts';

export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Analytics</h1>
      <AnalyticsCharts />
    </div>
  );
}
```

```
[ARCHIVO] src/components/admin/analytics-charts.tsx
```
```tsx
'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#ff6a00', '#00c8ff', '#22c55e', '#a855f7', '#f59e0b'];

interface AnalyticsData {
  dailySearches: { date: string; count: number }[];
  topDevices: { brand: string; model: string; count: number }[];
  styleDistribution: { style: string; count: number }[];
  tierDistribution: { tier: string; count: number }[];
}

export function AnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6">
        <Skeleton variant="card" className="h-80" />
        <div className="grid sm:grid-cols-2 gap-6">
          <Skeleton variant="card" className="h-60" />
          <Skeleton variant="card" className="h-60" />
        </div>
      </div>
    );
  }

  if (!data) return <p className="text-slate-500">No hay datos</p>;

  return (
    <div className="space-y-6">
      {/* Daily searches line chart */}
      <Card variant="glow" className="p-6">
        <h3 className="font-display font-bold text-white mb-4">Búsquedas por Día (30 días)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.dailySearches}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 10 }} />
            <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#0f1729', border: '1px solid #1e293b', borderRadius: 8 }} />
            <Line type="monotone" dataKey="count" stroke="#ff6a00" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Top devices bar chart */}
        <Card className="p-6">
          <h3 className="font-display font-bold text-white mb-4">Top Dispositivos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.topDevices.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#475569" tick={{ fontSize: 10 }} />
              <YAxis dataKey="model" type="category" stroke="#475569" tick={{ fontSize: 10 }} width={100} />
              <Tooltip contentStyle={{ background: '#0f1729', border: '1px solid #1e293b', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#00c8ff" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Style distribution pie chart */}
        <Card className="p-6">
          <h3 className="font-display font-bold text-white mb-4">Distribución de Estilos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.styleDistribution}
                dataKey="count"
                nameKey="style"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.styleDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f1729', border: '1px solid #1e293b', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tier distribution */}
      <Card className="p-6">
        <h3 className="font-display font-bold text-white mb-4">Distribución de Tiers</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.tierDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="tier" stroke="#475569" />
            <YAxis stroke="#475569" />
            <Tooltip contentStyle={{ background: '#0f1729', border: '1px solid #1e293b', borderRadius: 8 }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.tierDistribution.map((entry, i) => (
                <Cell key={i} fill={entry.tier === 'VIP' ? '#a855f7' : entry.tier === 'PREMIUM' ? '#f59e0b' : '#64748b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
curl http://localhost:3000/api/admin/analytics # (ADMIN)
```

### Commit: `feat(analytics): ARES-603 analytics dashboard — daily searches, top devices, style/tier distribution with recharts`

---

## ARES-604-support-system

**Fase:** 6 | **Prioridad:** MEDIO
**Dependencias:** ARES-600, ARES-003
**Descripción:** Sistema de tickets de soporte: formulario de contacto público, listado de tickets en admin, responder tickets, y estados (OPEN, IN_PROGRESS, RESOLVED, CLOSED).

### Archivos a crear:

```
[ARCHIVO] src/app/api/support/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { getOptionalSession } from '@/lib/auth/auth.middleware';
import { enforceRateLimit } from '@/lib/security';

const createTicketSchema = z.object({
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(2000),
  email: z.string().email(),
  category: z.enum(['BUG', 'PAYMENT', 'ACCOUNT', 'FEATURE', 'OTHER']).optional().default('OTHER'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getOptionalSession();
    const userId = session?.user?.id;

    if (userId) {
      await enforceRateLimit(userId, 'FREE', 5); // 5 tickets per period
    }

    const body = await request.json();
    const parsed = createTicketSchema.parse(body);

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: userId ?? null,
        email: parsed.email,
        subject: parsed.subject,
        message: parsed.message,
        category: parsed.category,
        status: 'OPEN',
      },
    });

    return NextResponse.json({ success: true, data: { ticketId: ticket.id } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/api/admin/support/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { requireRole } from '@/lib/auth/auth.middleware';

export async function GET(request: NextRequest) {
  try {
    await requireRole('ADMIN');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { username: true, tier: true } },
      },
    });

    const counts = await prisma.supportTicket.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return NextResponse.json({
      success: true,
      data: tickets,
      meta: { counts: counts.map((c) => ({ status: c.status, count: c._count.status })) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/api/admin/support/[id]/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError, NotFoundError } from '@ares/errors';
import { requireRole } from '@/lib/auth/auth.middleware';

const updateSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  adminResponse: z.string().min(1).max(2000).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireRole('ADMIN');

    const ticket = await prisma.supportTicket.findUnique({ where: { id: params.id } });
    if (!ticket) throw new NotFoundError('Ticket', params.id);

    const body = await request.json();
    const parsed = updateSchema.parse(body);

    const updated = await prisma.supportTicket.update({
      where: { id: params.id },
      data: {
        ...(parsed.status ? { status: parsed.status } : {}),
        ...(parsed.adminResponse ? { adminResponse: parsed.adminResponse, respondedAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/(app)/contact/page.tsx
```
```tsx
'use client';

import { useState } from 'react';
import { Send, Check } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function ContactPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !subject || !message) return;
    setLoading(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message, category }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        toast('error', data.error?.message ?? 'Error al enviar');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
          <Check size={32} className="text-success" />
        </div>
        <h1 className="text-2xl font-display font-bold text-white">¡Mensaje enviado!</h1>
        <p className="text-sm text-slate-400 mt-2">Te responderemos por email lo antes posible.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-display font-bold text-white mb-2">Contacto</h1>
      <p className="text-sm text-slate-400 mb-6">¿Necesitas ayuda? Escríbenos.</p>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 font-ui mb-1 block">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-ui mb-1 block">Categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-gaming bg-background-card border border-white/10 px-3 py-2.5 text-sm text-white focus:border-fire-500/50 focus:outline-none"
          >
            <option value="BUG">Bug / Error</option>
            <option value="PAYMENT">Pago / Suscripción</option>
            <option value="ACCOUNT">Mi Cuenta</option>
            <option value="FEATURE">Sugerencia</option>
            <option value="OTHER">Otro</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 font-ui mb-1 block">Asunto</label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="¿En qué podemos ayudarte?" />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-ui mb-1 block">Mensaje</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={2000}
            className="w-full rounded-gaming bg-background-card border border-white/10 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-fire-500/50 focus:outline-none resize-none"
            placeholder="Describe tu problema o sugerencia..."
          />
        </div>
        <Button variant="primary" className="w-full" onClick={handleSubmit} loading={loading} leftIcon={<Send size={16} />}>
          Enviar Mensaje
        </Button>
      </div>
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
curl -X POST http://localhost:3000/api/support -H "Content-Type: application/json" -d '{"email":"test@test.com","subject":"Test","message":"Testing support"}'
```

### Commit: `feat(support): ARES-604 support system — contact form, tickets API, admin respond/status, categories`

---

## ARES-605-ab-testing

**Fase:** 6 | **Prioridad:** MEDIO
**Dependencias:** ARES-600, ARES-603
**Descripción:** Framework de A/B testing: crear experimentos (pricing, CTAs, landing variants), asignar usuarios a variantes, trackear conversiones, y dashboard de resultados.

### Archivos a crear:

```
[ARCHIVO] src/lib/ab-testing/ab-engine.ts
```
```typescript
import { prisma } from '@ares/database';
import crypto from 'crypto';

export interface ABExperiment {
  id: string;
  key: string;
  variants: { key: string; weight: number }[];
  isActive: boolean;
}

/**
 * Deterministically assign a user to a variant based on
 * user ID + experiment key (consistent hashing)
 */
export function assignVariant(userId: string, experimentKey: string, variants: { key: string; weight: number }[]): string {
  const hash = crypto.createHash('md5').update(`${userId}:${experimentKey}`).digest('hex');
  const num = parseInt(hash.slice(0, 8), 16);
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  const target = num % totalWeight;

  let cumulative = 0;
  for (const variant of variants) {
    cumulative += variant.weight;
    if (target < cumulative) return variant.key;
  }

  return variants[0].key;
}

/**
 * Get the variant for a user in an experiment
 */
export async function getVariantForUser(userId: string, experimentKey: string): Promise<string | null> {
  const experiment = await prisma.abExperiment.findUnique({
    where: { key: experimentKey },
    include: { variants: true },
  });

  if (!experiment || !experiment.isActive) return null;

  // Check if already assigned
  const existing = await prisma.abAssignment.findFirst({
    where: { userId, experimentId: experiment.id },
  });

  if (existing) return existing.variantKey;

  // Assign new variant
  const variants = experiment.variants.map((v) => ({ key: v.key, weight: v.weight }));
  const variantKey = assignVariant(userId, experimentKey, variants);

  await prisma.abAssignment.create({
    data: {
      userId,
      experimentId: experiment.id,
      variantKey,
    },
  });

  return variantKey;
}

/**
 * Track a conversion event for an A/B test
 */
export async function trackConversion(userId: string, experimentKey: string, eventName: string) {
  const assignment = await prisma.abAssignment.findFirst({
    where: {
      userId,
      experiment: { key: experimentKey },
    },
  });

  if (!assignment) return null;

  return prisma.abConversion.create({
    data: {
      assignmentId: assignment.id,
      eventName,
    },
  });
}

/**
 * Get experiment results with conversion rates per variant
 */
export async function getExperimentResults(experimentKey: string) {
  const experiment = await prisma.abExperiment.findUnique({
    where: { key: experimentKey },
    include: {
      variants: true,
      assignments: {
        include: {
          conversions: true,
        },
      },
    },
  });

  if (!experiment) return null;

  const results = experiment.variants.map((variant) => {
    const assignments = experiment.assignments.filter((a) => a.variantKey === variant.key);
    const conversions = assignments.filter((a) => a.conversions.length > 0);

    return {
      variant: variant.key,
      label: variant.label,
      participants: assignments.length,
      conversions: conversions.length,
      conversionRate: assignments.length > 0
        ? ((conversions.length / assignments.length) * 100).toFixed(2)
        : '0',
    };
  });

  return {
    experiment: { key: experiment.key, name: experiment.name, isActive: experiment.isActive },
    results,
    totalParticipants: experiment.assignments.length,
  };
}
```

```
[ARCHIVO] src/app/api/admin/ab-tests/route.ts
```
```typescript
import { NextResponse } from 'next/server';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { requireRole } from '@/lib/auth/auth.middleware';

export async function GET() {
  try {
    await requireRole('ADMIN');

    const experiments = await prisma.abExperiment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        variants: true,
        _count: { select: { assignments: true } },
      },
    });

    return NextResponse.json({ success: true, data: experiments });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/api/admin/ab-tests/[key]/results/route.ts
```
```typescript
import { NextResponse } from 'next/server';

import { handleApiError } from '@ares/errors';
import { requireRole } from '@/lib/auth/auth.middleware';
import { getExperimentResults } from '@/lib/ab-testing/ab-engine';

export async function GET(
  _request: Request,
  { params }: { params: { key: string } },
) {
  try {
    await requireRole('ADMIN');
    const results = await getExperimentResults(params.key);
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/hooks/use-ab-variant.ts
```
```typescript
'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to get the assigned A/B test variant for the current user
 */
export function useABVariant(experimentKey: string): string | null {
  const [variant, setVariant] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/ab-variant?experiment=${experimentKey}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setVariant(data.data.variant);
      })
      .catch(() => {});
  }, [experimentKey]);

  return variant;
}
```

```
[ARCHIVO] src/app/api/ab-variant/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { handleApiError } from '@ares/errors';
import { getOptionalSession } from '@/lib/auth/auth.middleware';
import { getVariantForUser } from '@/lib/ab-testing/ab-engine';

export async function GET(request: NextRequest) {
  try {
    const session = await getOptionalSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: true, data: { variant: null } });
    }

    const { searchParams } = new URL(request.url);
    const experiment = searchParams.get('experiment');

    if (!experiment) {
      return NextResponse.json({ success: false, error: { message: 'experiment required' } }, { status: 400 });
    }

    const variant = await getVariantForUser(session.user.id, experiment);
    return NextResponse.json({ success: true, data: { variant } });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Validación:
```bash
npx tsc --noEmit
curl http://localhost:3000/api/admin/ab-tests # (ADMIN)
```

### Commit: `feat(ab-testing): ARES-605 A/B testing — consistent hashing, variant assignment, conversion tracking, results API`

---

# ═══════════════════════════════════════════════════════════════════
# FIN DE FASE 6 — ADMIN Y ANALYTICS
# ═══════════════════════════════════════════════════════════════════
#
# Al completar los 6 scripts de esta fase, el proyecto tiene:
#
# ✅ Admin dashboard: KPIs, sparklines, quick actions (role-protected)
# ✅ User management: tabla con search/filtros, cambiar tier/role, CSV export
# ✅ CMS: CRUD guías con publish/unpublish, agregar dispositivos
# ✅ Analytics: recharts (daily searches, top devices, style/tier distribution)
# ✅ Soporte: formulario contacto, tickets CRUD, estados, admin response
# ✅ A/B testing: consistent hashing, variant assignment, conversion tracking
#
# El CEO (Alex) puede:
# 1. Ver KPIs en tiempo real (MRR, users, conversión)
# 2. Gestionar usuarios (cambiar tier, desactivar, exportar)
# 3. Crear/editar/publicar guías y agregar dispositivos
# 4. Ver analytics con charts (búsquedas, devices, estilos)
# 5. Responder tickets de soporte
# 6. Correr A/B tests para optimizar conversión
#
# PRÓXIMA FASE: docs/MASTER-PLAN-H.md (Fase 7 — Mobile y PWA)
#
# ═══════════════════════════════════════════════════════════════════
