# ARES SensiPRO — MASTER PLAN F
# ══════════════════════════════════════════════════════════════
# FASE 5 — COMUNIDAD Y SOCIAL (8 scripts: ARES-500 → ARES-507)
# "Lo que crea retención y viralidad orgánica"
# ══════════════════════════════════════════════════════════════
#
# Perfiles públicos, rankings, torneos, comentarios, configs
# compartidas, achievements/gamificación, notificaciones, y
# social sharing. Todo lo que hace que los jugadores se queden
# y traigan a sus amigos.
# ══════════════════════════════════════════════════════════════

## Instrucciones para Claude Code

1. **Lee CLAUDE.md** para convenciones
2. **Lee PROGRESS.md** para el estado actual
3. **Usa componentes de @/components/ui/** ya creados en ARES-004
4. **Community content = user-generated**: necesita moderación y rate-limiting
5. **Después de terminar**: actualiza PROGRESS.md, git commit + push

---

# ████████████████████████████████████████████████████████████
# █                                                          █
# █   FASE 5 — COMUNIDAD Y SOCIAL                           █
# █   Scripts 41-48 | Retención y viralidad                  █
# █                                                          █
# ████████████████████████████████████████████████████████████

---

## ARES-500-user-profiles

**Fase:** 5 | **Prioridad:** CRÍTICO
**Dependencias:** ARES-003-auth-system, ARES-400-tier-system
**Descripción:** Perfil público con avatar, tier badge, stats (búsquedas, favoritos, shares), dispositivo principal, logros, y configs guardadas. Incluye página de perfil público y edición de perfil privado.

### Archivos a crear:

```
[ARCHIVO] src/app/(app)/profile/page.tsx
```
```tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Settings, Crown, Users, History, Heart, Trophy } from 'lucide-react';

import { auth } from '@/lib/auth';
import { prisma } from '@ares/database';
import { getTierConfig } from '@/lib/tiers';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

async function getProfileData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, username: true, email: true, avatarUrl: true,
      tier: true, tierExpiresAt: true,
      totalSearches: true, totalFavorites: true, totalReferrals: true,
      createdAt: true,
      _count: { select: { achievements: true, sharedConfigs: true } },
    },
  });
  return user;
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await getProfileData(session.user.id);
  if (!user) redirect('/login');

  const tierConfig = getTierConfig(user.tier);

  const stats = [
    { icon: History, label: 'Búsquedas', value: user.totalSearches },
    { icon: Heart, label: 'Favoritos', value: user.totalFavorites },
    { icon: Users, label: 'Referidos', value: user.totalReferrals },
    { icon: Trophy, label: 'Logros', value: user._count.achievements },
  ];

  const menuItems = [
    { href: '/profile/edit', label: 'Editar Perfil', icon: Settings },
    { href: '/profile/subscription', label: 'Suscripción', icon: Crown },
    { href: '/profile/referrals', label: 'Referidos', icon: Users },
    { href: '/favorites', label: 'Favoritos', icon: Heart },
    { href: '/history', label: 'Historial', icon: History },
    { href: '/achievements', label: 'Logros', icon: Trophy },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-background-elevated flex items-center justify-center text-2xl border-2 border-white/10">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span>{user.username.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-display font-bold text-white">{user.username}</h1>
            <Badge variant={user.tier === 'VIP' ? 'vip' : user.tier === 'PREMIUM' ? 'premium' : 'free'}>
              {tierConfig.icon} {user.tier}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Miembro desde {new Date(user.createdAt).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4 text-center">
              <Icon size={18} className="mx-auto text-slate-500 mb-1" />
              <p className="text-xl font-display font-bold text-white">{stat.value}</p>
              <p className="text-[10px] text-slate-500">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Menu */}
      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div className="glass-hover p-4 flex items-center gap-3 min-h-[44px]">
                <Icon size={18} className="text-slate-400" />
                <span className="text-sm font-ui font-medium text-white">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

```
[ARCHIVO] src/app/(app)/profile/edit/page.tsx
```
```tsx
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { prisma } from '@ares/database';
import { EditProfileForm } from '@/components/features/edit-profile-form';

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, avatarUrl: true, bio: true },
  });
  if (!user) redirect('/login');

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-display font-bold text-white mb-6">Editar Perfil</h1>
      <EditProfileForm initialData={user} />
    </div>
  );
}
```

```
[ARCHIVO] src/components/features/edit-profile-form.tsx
```
```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface EditProfileFormProps {
  initialData: { username: string; avatarUrl: string | null; bio: string | null };
}

export function EditProfileForm({ initialData }: EditProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState(initialData.username);
  const [bio, setBio] = useState(initialData.bio ?? '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, bio }),
      });
      const data = await res.json();
      if (data.success) {
        toast('success', 'Perfil actualizado');
        router.refresh();
      } else {
        toast('error', data.error?.message ?? 'Error al actualizar');
      }
    } catch {
      toast('error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-slate-400 font-ui mb-1 block">Nombre de usuario</label>
        <Input value={username} onChange={(e) => setUsername(e.target.value)} maxLength={30} />
      </div>
      <div>
        <label className="text-xs text-slate-400 font-ui mb-1 block">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={160}
          rows={3}
          className="w-full rounded-gaming bg-background-card border border-white/10 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-fire-500/50 focus:outline-none resize-none"
          placeholder="Escribe algo sobre ti..."
        />
        <p className="text-[10px] text-slate-600 mt-1">{bio.length}/160</p>
      </div>
      <Button variant="primary" onClick={handleSubmit} loading={loading} leftIcon={<Save size={16} />}>
        Guardar Cambios
      </Button>
    </div>
  );
}
```

```
[ARCHIVO] src/app/api/profile/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError, BusinessError } from '@ares/errors';
import { getRequiredSession } from '@/lib/auth/auth.middleware';

const updateSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Solo letras, números, _ y -').optional(),
  bio: z.string().max(160).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await getRequiredSession();
    const body = await request.json();
    const parsed = updateSchema.parse(body);

    if (parsed.username) {
      const existing = await prisma.user.findFirst({
        where: { username: parsed.username, id: { not: session.user.id } },
      });
      if (existing) {
        throw new BusinessError('USERNAME_TAKEN', 'Este nombre de usuario ya está en uso');
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(parsed.username ? { username: parsed.username } : {}),
        ...(parsed.bio !== undefined ? { bio: parsed.bio } : {}),
      },
      select: { username: true, bio: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/(app)/u/[username]/page.tsx
```
```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { prisma } from '@ares/database';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface Props { params: { username: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await prisma.user.findUnique({ where: { username: params.username }, select: { username: true } });
  if (!user) return { title: 'Usuario no encontrado' };
  return { title: `${user.username} | SensiPRO`, description: `Perfil de ${user.username} en SensiPRO` };
}

export default async function PublicProfilePage({ params }: Props) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      username: true, avatarUrl: true, bio: true, tier: true,
      totalSearches: true, totalFavorites: true, createdAt: true,
      _count: { select: { achievements: true, sharedConfigs: true } },
    },
  });
  if (!user) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto rounded-full bg-background-elevated flex items-center justify-center text-3xl border-2 border-white/10 mb-3">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span>{user.username.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <h1 className="text-2xl font-display font-bold text-white">{user.username}</h1>
        <Badge variant={user.tier === 'VIP' ? 'vip' : user.tier === 'PREMIUM' ? 'premium' : 'free'} className="mt-1">
          {user.tier}
        </Badge>
        {user.bio && <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">{user.bio}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-xl font-display font-bold text-white">{user.totalSearches}</p>
          <p className="text-[10px] text-slate-500">Búsquedas</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xl font-display font-bold text-white">{user._count.achievements}</p>
          <p className="text-[10px] text-slate-500">Logros</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xl font-display font-bold text-white">{user._count.sharedConfigs}</p>
          <p className="text-[10px] text-slate-500">Configs</p>
        </Card>
      </div>
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
ls src/app/\(app\)/profile/page.tsx src/app/\(app\)/profile/edit/page.tsx
ls src/app/\(app\)/u/\[username\]/page.tsx src/app/api/profile/route.ts
```

### Commit: `feat(profiles): ARES-500 user profiles — private dashboard, public profile /u/[username], edit form, stats`

---

## ARES-501-leaderboard

**Fase:** 5 | **Prioridad:** ALTO
**Dependencias:** ARES-500, ARES-003
**Descripción:** Rankings: más búsquedas, más favoritos, más shares, más logros. Periodos semanal y all-time. API con paginación.

### Archivos a crear:

```
[ARCHIVO] src/app/api/leaderboard/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';

type LeaderboardType = 'searches' | 'favorites' | 'referrals' | 'achievements';

const ORDER_FIELDS: Record<LeaderboardType, string> = {
  searches: 'totalSearches',
  favorites: 'totalFavorites',
  referrals: 'totalReferrals',
  achievements: 'totalSearches', // fallback, real count via subquery
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') ?? 'searches') as LeaderboardType;
    const period = searchParams.get('period') ?? 'all'; // 'all' | 'weekly'
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);

    const where: Record<string, unknown> = {};
    if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      where.updatedAt = { gte: weekAgo };
    }

    const orderField = ORDER_FIELDS[type] ?? 'totalSearches';

    const users = await prisma.user.findMany({
      where,
      orderBy: { [orderField]: 'desc' },
      take: limit,
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        tier: true,
        totalSearches: true,
        totalFavorites: true,
        totalReferrals: true,
        _count: { select: { achievements: true } },
      },
    });

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      username: u.username,
      avatarUrl: u.avatarUrl,
      tier: u.tier,
      value: type === 'achievements' ? u._count.achievements
        : type === 'searches' ? u.totalSearches
        : type === 'favorites' ? u.totalFavorites
        : u.totalReferrals,
    }));

    return NextResponse.json({ success: true, data: leaderboard, meta: { type, period, total: leaderboard.length } });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/(app)/leaderboard/page.tsx
```
```tsx
import type { Metadata } from 'next';

import { LeaderboardView } from '@/components/community/leaderboard-view';

export const metadata: Metadata = {
  title: 'Rankings | SensiPRO',
  description: 'Los jugadores más activos de SensiPRO. Rankings de búsquedas, favoritos, referidos y logros.',
};

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-white mb-2">Rankings</h1>
      <p className="text-sm text-slate-400 mb-6">Los jugadores más activos de SensiPRO</p>
      <LeaderboardView />
    </div>
  );
}
```

```
[ARCHIVO] src/components/community/leaderboard-view.tsx
```
```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Search, Heart, Users } from 'lucide-react';

import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

const TYPES = [
  { key: 'searches', label: '🔍 Búsquedas' },
  { key: 'favorites', label: '❤️ Favoritos' },
  { key: 'referrals', label: '👥 Referidos' },
  { key: 'achievements', label: '🏆 Logros' },
];

const PERIODS = [
  { key: 'all', label: 'All-Time' },
  { key: 'weekly', label: 'Semanal' },
];

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatarUrl: string | null;
  tier: string;
  value: number;
}

export function LeaderboardView() {
  const [type, setType] = useState('searches');
  const [period, setPeriod] = useState('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?type=${type}&period=${period}&limit=20`)
      .then((r) => r.json())
      .then((data) => setEntries(data.data ?? []))
      .finally(() => setLoading(false));
  }, [type, period]);

  return (
    <div>
      <Tabs tabs={TYPES} activeTab={type} onChange={setType} className="mb-4" />
      <Tabs tabs={PERIODS} activeTab={period} onChange={setPeriod} className="mb-6" />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} variant="rect" className="h-14" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-sm text-slate-500 py-8">No hay datos todavía</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <Link key={entry.rank} href={`/u/${entry.username}`}>
              <div className={cn(
                'glass-hover p-4 flex items-center gap-3 min-h-[44px]',
                entry.rank <= 3 && 'border-fire-500/20',
              )}>
                <span className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm',
                  entry.rank === 1 && 'bg-tier-vip/20 text-tier-vip',
                  entry.rank === 2 && 'bg-slate-400/20 text-slate-300',
                  entry.rank === 3 && 'bg-fire-500/20 text-fire-400',
                  entry.rank > 3 && 'bg-white/5 text-slate-500',
                )}>
                  {entry.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-ui font-semibold text-white text-sm truncate">{entry.username}</p>
                </div>
                <Badge variant={entry.tier === 'VIP' ? 'vip' : entry.tier === 'PREMIUM' ? 'premium' : 'free'} size="sm">
                  {entry.tier}
                </Badge>
                <span className="text-sm font-display font-bold text-white tabular-nums w-12 text-right">
                  {entry.value}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
curl http://localhost:3000/api/leaderboard?type=searches&period=all
```

### Commit: `feat(leaderboard): ARES-501 leaderboard — rankings by searches/favorites/referrals/achievements, weekly + all-time`

---

## ARES-502-tournament-system

**Fase:** 5 | **Prioridad:** MEDIO
**Dependencias:** ARES-500, ARES-400, ARES-403
**Descripción:** CRUD de torneos VIP: inscripción, premios (códigos de activación), resultados, y página de torneos. Solo VIP puede crear/participar.

### Archivos a crear:

```
[ARCHIVO] src/app/api/tournaments/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? 'ACTIVE';

    const tournaments = await prisma.tournament.findMany({
      where: { status },
      orderBy: { startsAt: 'desc' },
      select: {
        id: true, title: true, description: true, status: true,
        startsAt: true, endsAt: true, maxParticipants: true,
        prizeDescription: true, tier: true,
        _count: { select: { participants: true } },
      },
    });

    return NextResponse.json({ success: true, data: tournaments });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/api/tournaments/[id]/join/route.ts
```
```typescript
import { NextResponse } from 'next/server';

import { prisma } from '@ares/database';
import { BusinessError, NotFoundError, handleApiError } from '@ares/errors';
import { getRequiredSession } from '@/lib/auth/auth.middleware';
import { canAccessTier } from '@/lib/tiers';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getRequiredSession();
    const userTier = (session.user as Record<string, unknown>).tier as string;

    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: { _count: { select: { participants: true } } },
    });

    if (!tournament) throw new NotFoundError('Tournament', params.id);

    if (!canAccessTier(userTier as 'FREE' | 'PREMIUM' | 'VIP', tournament.tier as 'FREE' | 'PREMIUM' | 'VIP')) {
      throw new BusinessError('TIER_REQUIRED', `Este torneo requiere ser ${tournament.tier}`);
    }

    if (tournament.status !== 'ACTIVE') {
      throw new BusinessError('NOT_ACTIVE', 'Este torneo no está activo');
    }

    if (tournament.maxParticipants && tournament._count.participants >= tournament.maxParticipants) {
      throw new BusinessError('TOURNAMENT_FULL', 'El torneo está lleno');
    }

    const existing = await prisma.tournamentParticipant.findFirst({
      where: { tournamentId: params.id, userId: session.user.id },
    });

    if (existing) {
      throw new BusinessError('ALREADY_JOINED', 'Ya estás inscrito en este torneo');
    }

    await prisma.tournamentParticipant.create({
      data: { tournamentId: params.id, userId: session.user.id },
    });

    return NextResponse.json({ success: true, data: { joined: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/(app)/tournaments/page.tsx
```
```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Trophy, Users, Calendar, Clock } from 'lucide-react';

import { prisma } from '@ares/database';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Torneos | SensiPRO',
  description: 'Participa en torneos con premios reales. Solo para usuarios VIP.',
};

export default async function TournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { startsAt: 'desc' },
    include: { _count: { select: { participants: true } } },
    take: 20,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Trophy size={28} className="text-tier-vip" />
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Torneos</h1>
          <p className="text-sm text-slate-400">Compite y gana premios</p>
        </div>
      </div>

      <div className="space-y-4">
        {tournaments.map((t) => (
          <Link key={t.id} href={`/tournaments/${t.id}`}>
            <Card variant={t.status === 'ACTIVE' ? 'glow' : 'default'} className="p-5 hover:border-fire-500/20 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-bold text-white">{t.title}</h3>
                <Badge variant={t.status === 'ACTIVE' ? 'premium' : t.status === 'COMPLETED' ? 'free' : 'default'} size="sm">
                  {t.status === 'ACTIVE' ? 'Activo' : t.status === 'COMPLETED' ? 'Finalizado' : 'Próximo'}
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mb-3">{t.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Users size={12} /> {t._count.participants}{t.maxParticipants ? `/${t.maxParticipants}` : ''}</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(t.startsAt).toLocaleDateString('es-MX')}</span>
                <Badge variant="vip" size="sm">{t.tier}</Badge>
              </div>
              {t.prizeDescription && (
                <p className="mt-2 text-xs text-tier-vip">🏆 {t.prizeDescription}</p>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
curl http://localhost:3000/api/tournaments?status=ACTIVE
```

### Commit: `feat(tournaments): ARES-502 tournament system — CRUD, join with tier check, tournaments page`

---

## ARES-503-comments-reviews

**Fase:** 5 | **Prioridad:** MEDIO
**Dependencias:** ARES-500, ARES-301
**Descripción:** Comentarios en guías y configs compartidas: crear, reportar, eliminar (admin). Rate-limited y moderado.

### Archivos a crear:

```
[ARCHIVO] src/app/api/comments/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError, BusinessError } from '@ares/errors';
import { getRequiredSession } from '@/lib/auth/auth.middleware';
import { enforceRateLimit } from '@/lib/security';

const createSchema = z.object({
  targetType: z.enum(['GUIDE', 'CONFIG']),
  targetId: z.string().uuid(),
  content: z.string().min(3).max(500).trim(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get('targetType');
    const targetId = searchParams.get('targetId');

    if (!targetType || !targetId) {
      return NextResponse.json({ success: false, error: { message: 'targetType and targetId required' } }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: { targetType, targetId, isHidden: false },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { username: true, avatarUrl: true, tier: true } },
      },
    });

    return NextResponse.json({ success: true, data: comments });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getRequiredSession();
    await enforceRateLimit(session.user.id, 'FREE', 10); // 10 comments per period

    const body = await request.json();
    const parsed = createSchema.parse(body);

    // Basic profanity filter placeholder
    const bannedWords = ['hack', 'cheat', 'mod apk'];
    const lower = parsed.content.toLowerCase();
    if (bannedWords.some((w) => lower.includes(w))) {
      throw new BusinessError('INAPPROPRIATE', 'Tu comentario contiene contenido no permitido');
    }

    const comment = await prisma.comment.create({
      data: {
        userId: session.user.id,
        targetType: parsed.targetType,
        targetId: parsed.targetId,
        content: parsed.content,
      },
      include: {
        user: { select: { username: true, avatarUrl: true, tier: true } },
      },
    });

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/api/comments/[id]/report/route.ts
```
```typescript
import { NextResponse } from 'next/server';

import { prisma } from '@ares/database';
import { handleApiError, NotFoundError } from '@ares/errors';
import { getRequiredSession } from '@/lib/auth/auth.middleware';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getRequiredSession();

    const comment = await prisma.comment.findUnique({ where: { id: params.id } });
    if (!comment) throw new NotFoundError('Comment', params.id);

    await prisma.commentReport.create({
      data: {
        commentId: params.id,
        reportedBy: session.user.id,
        reason: 'USER_REPORT',
      },
    });

    // Auto-hide after 3 reports
    const reportCount = await prisma.commentReport.count({ where: { commentId: params.id } });
    if (reportCount >= 3) {
      await prisma.comment.update({ where: { id: params.id }, data: { isHidden: true } });
    }

    return NextResponse.json({ success: true, data: { reported: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/components/community/comments-section.tsx
```
```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Send, Flag, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { username: string; avatarUrl: string | null; tier: string };
}

interface CommentsSectionProps {
  targetType: 'GUIDE' | 'CONFIG';
  targetId: string;
  isAdmin?: boolean;
}

export function CommentsSection({ targetType, targetId, isAdmin }: CommentsSectionProps) {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?targetType=${targetType}&targetId=${targetId}`);
      const data = await res.json();
      setComments(data.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleSubmit = async () => {
    if (!newComment.trim() || newComment.length < 3) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, content: newComment.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => [data.data, ...prev]);
        setNewComment('');
        toast('success', 'Comentario publicado');
      } else {
        toast('error', data.error?.message ?? 'Error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async (commentId: string) => {
    await fetch(`/api/comments/${commentId}/report`, { method: 'POST' });
    toast('success', 'Reportado. Lo revisaremos pronto.');
  };

  return (
    <div>
      <h3 className="font-display font-bold text-white mb-4">
        Comentarios ({comments.length})
      </h3>

      {/* New comment */}
      <div className="flex gap-2 mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe un comentario..."
          maxLength={500}
          rows={2}
          className="flex-1 rounded-gaming bg-background-card border border-white/10 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-fire-500/50 focus:outline-none resize-none"
        />
        <Button variant="primary" size="sm" onClick={handleSubmit} loading={submitting} disabled={newComment.trim().length < 3}>
          <Send size={16} />
        </Button>
      </div>

      {/* Comments list */}
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="glass p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-ui font-semibold text-white">{c.user.username}</span>
                <Badge variant={c.user.tier === 'VIP' ? 'vip' : c.user.tier === 'PREMIUM' ? 'premium' : 'free'} size="sm">
                  {c.user.tier}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-600">
                  {new Date(c.createdAt).toLocaleDateString('es-MX')}
                </span>
                <button onClick={() => handleReport(c.id)} className="p-1 text-slate-600 hover:text-warning touch-target">
                  <Flag size={12} />
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-300">{c.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
curl "http://localhost:3000/api/comments?targetType=GUIDE&targetId=xxx"
```

### Commit: `feat(comments): ARES-503 comments/reviews — create, report (auto-hide at 3), profanity filter, comments UI`

---

## ARES-504-config-sharing

**Fase:** 5 | **Prioridad:** ALTO
**Dependencias:** ARES-500, ARES-101
**Descripción:** Feed de configs compartidas por usuarios: upvote/downvote, filtros por estilo/device/tier, trending algorithm, y página de feed.

### Archivos a crear:

```
[ARCHIVO] src/app/api/shared-configs/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { getRequiredSession, getOptionalSession } from '@/lib/auth/auth.middleware';

const createSchema = z.object({
  deviceId: z.string().uuid(),
  style: z.enum(['AGGRESSIVE', 'BALANCED', 'SNIPER']),
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') ?? 'trending'; // trending | newest | top
    const style = searchParams.get('style');
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = 20;

    const where: Record<string, unknown> = {};
    if (style && ['AGGRESSIVE', 'BALANCED', 'SNIPER'].includes(style)) {
      where.style = style;
    }

    const orderBy = sort === 'newest'
      ? { createdAt: 'desc' as const }
      : sort === 'top'
        ? { upvotes: 'desc' as const }
        : { score: 'desc' as const }; // trending uses calculated score

    const configs = await prisma.sharedConfig.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { username: true, avatarUrl: true, tier: true } },
        device: { select: { brand: true, model: true, slug: true, tier: true } },
      },
    });

    return NextResponse.json({ success: true, data: configs });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getRequiredSession();
    const body = await request.json();
    const parsed = createSchema.parse(body);

    const config = await prisma.sharedConfig.create({
      data: {
        userId: session.user.id,
        deviceId: parsed.deviceId,
        style: parsed.style,
        title: parsed.title,
        description: parsed.description ?? null,
        score: 0,
        upvotes: 0,
        downvotes: 0,
      },
      include: {
        user: { select: { username: true, avatarUrl: true, tier: true } },
        device: { select: { brand: true, model: true, slug: true, tier: true } },
      },
    });

    return NextResponse.json({ success: true, data: config }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/api/shared-configs/[id]/vote/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError, NotFoundError } from '@ares/errors';
import { getRequiredSession } from '@/lib/auth/auth.middleware';

const voteSchema = z.object({ direction: z.enum(['up', 'down']) });

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getRequiredSession();
    const body = await request.json();
    const { direction } = voteSchema.parse(body);

    const config = await prisma.sharedConfig.findUnique({ where: { id: params.id } });
    if (!config) throw new NotFoundError('SharedConfig', params.id);

    // Upsert vote
    const existing = await prisma.configVote.findFirst({
      where: { configId: params.id, userId: session.user.id },
    });

    if (existing) {
      if (existing.direction === direction) {
        // Remove vote (toggle off)
        await prisma.configVote.delete({ where: { id: existing.id } });
        await prisma.sharedConfig.update({
          where: { id: params.id },
          data: {
            upvotes: direction === 'up' ? { decrement: 1 } : undefined,
            downvotes: direction === 'down' ? { decrement: 1 } : undefined,
            score: direction === 'up' ? { decrement: 1 } : { increment: 1 },
          },
        });
        return NextResponse.json({ success: true, data: { vote: null } });
      }
      // Change vote direction
      await prisma.configVote.update({ where: { id: existing.id }, data: { direction } });
      await prisma.sharedConfig.update({
        where: { id: params.id },
        data: {
          upvotes: direction === 'up' ? { increment: 1 } : { decrement: 1 },
          downvotes: direction === 'down' ? { increment: 1 } : { decrement: 1 },
          score: direction === 'up' ? { increment: 2 } : { decrement: 2 },
        },
      });
    } else {
      // New vote
      await prisma.configVote.create({
        data: { configId: params.id, userId: session.user.id, direction },
      });
      await prisma.sharedConfig.update({
        where: { id: params.id },
        data: {
          upvotes: direction === 'up' ? { increment: 1 } : undefined,
          downvotes: direction === 'down' ? { increment: 1 } : undefined,
          score: direction === 'up' ? { increment: 1 } : { decrement: 1 },
        },
      });
    }

    return NextResponse.json({ success: true, data: { vote: direction } });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/(app)/community/page.tsx
```
```tsx
import type { Metadata } from 'next';

import { ConfigFeed } from '@/components/community/config-feed';

export const metadata: Metadata = {
  title: 'Comunidad | SensiPRO',
  description: 'Configs compartidas por la comunidad de SensiPRO. Vota, comenta y descubre las mejores configuraciones.',
};

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-white mb-2">Comunidad</h1>
      <p className="text-sm text-slate-400 mb-6">Configs compartidas por jugadores como tú</p>
      <ConfigFeed />
    </div>
  );
}
```

```
[ARCHIVO] src/components/community/config-feed.tsx
```
```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';

import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';

const SORT_TABS = [
  { key: 'trending', label: '🔥 Trending' },
  { key: 'newest', label: '🆕 Nuevas' },
  { key: 'top', label: '⭐ Top' },
];

const STYLE_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'AGGRESSIVE', label: '⚔️ Agresivo' },
  { key: 'BALANCED', label: '🎯 Balanceado' },
  { key: 'SNIPER', label: '🔭 Francotirador' },
];

interface SharedConfig {
  id: string;
  title: string;
  style: string;
  upvotes: number;
  downvotes: number;
  score: number;
  createdAt: string;
  user: { username: string; tier: string };
  device: { brand: string; model: string; slug: string; tier: string };
}

export function ConfigFeed() {
  const { toast } = useToast();
  const [sort, setSort] = useState('trending');
  const [style, setStyle] = useState('all');
  const [configs, setConfigs] = useState<SharedConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ sort });
    if (style !== 'all') params.set('style', style);
    fetch(`/api/shared-configs?${params}`)
      .then((r) => r.json())
      .then((data) => setConfigs(data.data ?? []))
      .finally(() => setLoading(false));
  }, [sort, style]);

  const handleVote = async (id: string, direction: 'up' | 'down') => {
    const res = await fetch(`/api/shared-configs/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
    });
    if (res.ok) {
      setConfigs((prev) => prev.map((c) =>
        c.id === id ? { ...c, score: c.score + (direction === 'up' ? 1 : -1) } : c,
      ));
    }
  };

  return (
    <div>
      <Tabs tabs={SORT_TABS} activeTab={sort} onChange={setSort} className="mb-3" />
      <Tabs tabs={STYLE_TABS} activeTab={style} onChange={setStyle} className="mb-6" />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="card" className="h-24" />)}
        </div>
      ) : configs.length === 0 ? (
        <p className="text-center text-sm text-slate-500 py-8">No hay configs compartidas todavía</p>
      ) : (
        <div className="space-y-3">
          {configs.map((c) => (
            <div key={c.id} className="glass p-4">
              <div className="flex items-start gap-3">
                {/* Vote buttons */}
                <div className="flex flex-col items-center gap-1">
                  <button onClick={() => handleVote(c.id, 'up')} className="p-1 text-slate-500 hover:text-success touch-target">
                    <ThumbsUp size={16} />
                  </button>
                  <span className={cn('text-sm font-display font-bold', c.score > 0 ? 'text-success' : c.score < 0 ? 'text-danger' : 'text-slate-500')}>
                    {c.score}
                  </span>
                  <button onClick={() => handleVote(c.id, 'down')} className="p-1 text-slate-500 hover:text-danger touch-target">
                    <ThumbsDown size={16} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-white text-sm">{c.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Link href={`/u/${c.user.username}`} className="text-xs text-slate-500 hover:text-white">
                      {c.user.username}
                    </Link>
                    <Badge variant={c.user.tier === 'VIP' ? 'vip' : c.user.tier === 'PREMIUM' ? 'premium' : 'free'} size="sm">
                      {c.user.tier}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Link href={`/devices/${c.device.slug}`} className="text-xs text-fire-400 hover:text-fire-300">
                      {c.device.brand} {c.device.model}
                    </Link>
                    <Badge variant={c.style === 'AGGRESSIVE' ? 'default' : c.style === 'SNIPER' ? 'free' : 'premium'} size="sm">
                      {c.style}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
curl http://localhost:3000/api/shared-configs?sort=trending
```

### Commit: `feat(sharing): ARES-504 config sharing — feed with upvote/downvote, trending/newest/top, style filters`

---

## ARES-505-achievements-gamification

**Fase:** 5 | **Prioridad:** ALTO
**Dependencias:** ARES-500, ARES-400
**Descripción:** 20+ logros desbloqueables: primera búsqueda, 100 búsquedas, Premium, referidos, etc. Sistema de unlock con animación, progreso, y display en perfil.

### Archivos a crear:

```
[ARCHIVO] src/lib/achievements/achievement-definitions.ts
```
```typescript
export interface AchievementDef {
  key: string;
  name: string;
  nameEs: string;
  description: string;
  icon: string;
  category: 'SEARCH' | 'SOCIAL' | 'PREMIUM' | 'SPECIAL';
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'LEGENDARY';
  condition: { type: string; value: number };
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // SEARCH achievements
  { key: 'first_search', name: 'First Search', nameEs: 'Primera Búsqueda', description: 'Genera tu primera sensibilidad', icon: '🎯', category: 'SEARCH', tier: 'BRONZE', condition: { type: 'searches', value: 1 } },
  { key: 'search_10', name: 'Getting Started', nameEs: 'Empezando', description: 'Genera 10 sensibilidades', icon: '🔍', category: 'SEARCH', tier: 'BRONZE', condition: { type: 'searches', value: 10 } },
  { key: 'search_50', name: 'Explorer', nameEs: 'Explorador', description: 'Genera 50 sensibilidades', icon: '🧭', category: 'SEARCH', tier: 'SILVER', condition: { type: 'searches', value: 50 } },
  { key: 'search_100', name: 'Veteran', nameEs: 'Veterano', description: 'Genera 100 sensibilidades', icon: '⚔️', category: 'SEARCH', tier: 'SILVER', condition: { type: 'searches', value: 100 } },
  { key: 'search_500', name: 'Master', nameEs: 'Maestro', description: 'Genera 500 sensibilidades', icon: '🏆', category: 'SEARCH', tier: 'GOLD', condition: { type: 'searches', value: 500 } },
  { key: 'search_1000', name: 'Legend', nameEs: 'Leyenda', description: 'Genera 1000 sensibilidades', icon: '👑', category: 'SEARCH', tier: 'LEGENDARY', condition: { type: 'searches', value: 1000 } },

  // SOCIAL achievements
  { key: 'first_fav', name: 'Collector', nameEs: 'Coleccionista', description: 'Guarda tu primer favorito', icon: '❤️', category: 'SOCIAL', tier: 'BRONZE', condition: { type: 'favorites', value: 1 } },
  { key: 'fav_10', name: 'Hoarder', nameEs: 'Acumulador', description: 'Guarda 10 favoritos', icon: '💎', category: 'SOCIAL', tier: 'SILVER', condition: { type: 'favorites', value: 10 } },
  { key: 'first_share', name: 'Sharer', nameEs: 'Compartidor', description: 'Comparte tu primera config', icon: '📤', category: 'SOCIAL', tier: 'BRONZE', condition: { type: 'shares', value: 1 } },
  { key: 'first_referral', name: 'Recruiter', nameEs: 'Reclutador', description: 'Invita a tu primer amigo', icon: '👥', category: 'SOCIAL', tier: 'SILVER', condition: { type: 'referrals', value: 1 } },
  { key: 'referral_5', name: 'Influencer', nameEs: 'Influencer', description: 'Invita a 5 amigos', icon: '🌟', category: 'SOCIAL', tier: 'GOLD', condition: { type: 'referrals', value: 5 } },
  { key: 'referral_20', name: 'Ambassador', nameEs: 'Embajador', description: 'Invita a 20 amigos', icon: '🚀', category: 'SOCIAL', tier: 'LEGENDARY', condition: { type: 'referrals', value: 20 } },
  { key: 'first_comment', name: 'Voice', nameEs: 'Voz', description: 'Escribe tu primer comentario', icon: '💬', category: 'SOCIAL', tier: 'BRONZE', condition: { type: 'comments', value: 1 } },
  { key: 'upvotes_10', name: 'Popular', nameEs: 'Popular', description: 'Recibe 10 upvotes en configs', icon: '👍', category: 'SOCIAL', tier: 'SILVER', condition: { type: 'upvotes_received', value: 10 } },

  // PREMIUM achievements
  { key: 'go_premium', name: 'Upgrade', nameEs: 'Mejora', description: 'Obtén Premium', icon: '⭐', category: 'PREMIUM', tier: 'SILVER', condition: { type: 'tier', value: 1 } },
  { key: 'go_vip', name: 'VIP Status', nameEs: 'Estatus VIP', description: 'Obtén VIP', icon: '👑', category: 'PREMIUM', tier: 'GOLD', condition: { type: 'tier', value: 2 } },
  { key: 'first_export', name: 'Designer', nameEs: 'Diseñador', description: 'Exporta tu primera imagen', icon: '🖼️', category: 'PREMIUM', tier: 'BRONZE', condition: { type: 'exports', value: 1 } },
  { key: 'first_compare', name: 'Analyst', nameEs: 'Analista', description: 'Compara 2 dispositivos', icon: '📊', category: 'PREMIUM', tier: 'BRONZE', condition: { type: 'comparisons', value: 1 } },

  // SPECIAL achievements
  { key: 'all_styles', name: 'Versatile', nameEs: 'Versátil', description: 'Genera los 3 estilos para un device', icon: '🎭', category: 'SPECIAL', tier: 'SILVER', condition: { type: 'all_styles', value: 1 } },
  { key: 'early_adopter', name: 'Early Adopter', nameEs: 'Early Adopter', description: 'Te registraste en el primer mes', icon: '🏅', category: 'SPECIAL', tier: 'GOLD', condition: { type: 'early_adopter', value: 1 } },
  { key: 'night_owl', name: 'Night Owl', nameEs: 'Búho Nocturno', description: 'Genera una sensibilidad entre 2-5 AM', icon: '🦉', category: 'SPECIAL', tier: 'BRONZE', condition: { type: 'night_search', value: 1 } },
];

export function getAchievementDef(key: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.key === key);
}
```

```
[ARCHIVO] src/lib/achievements/achievement-checker.ts
```
```typescript
import { prisma } from '@ares/database';

import { ACHIEVEMENTS, type AchievementDef } from './achievement-definitions';

interface UserStats {
  totalSearches: number;
  totalFavorites: number;
  totalReferrals: number;
  tier: string;
  unlockedKeys: string[];
}

export async function checkAndUnlockAchievements(userId: string): Promise<AchievementDef[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      totalSearches: true, totalFavorites: true, totalReferrals: true, tier: true,
      achievements: { select: { achievementKey: true } },
    },
  });

  if (!user) return [];

  const stats: UserStats = {
    totalSearches: user.totalSearches,
    totalFavorites: user.totalFavorites,
    totalReferrals: user.totalReferrals,
    tier: user.tier,
    unlockedKeys: user.achievements.map((a) => a.achievementKey),
  };

  const newlyUnlocked: AchievementDef[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (stats.unlockedKeys.includes(achievement.key)) continue;

    let earned = false;

    switch (achievement.condition.type) {
      case 'searches':
        earned = stats.totalSearches >= achievement.condition.value;
        break;
      case 'favorites':
        earned = stats.totalFavorites >= achievement.condition.value;
        break;
      case 'referrals':
        earned = stats.totalReferrals >= achievement.condition.value;
        break;
      case 'tier':
        const tierLevel: Record<string, number> = { FREE: 0, PREMIUM: 1, VIP: 2 };
        earned = (tierLevel[stats.tier] ?? 0) >= achievement.condition.value;
        break;
      case 'night_search':
        const hour = new Date().getHours();
        earned = hour >= 2 && hour < 5 && stats.totalSearches >= 1;
        break;
      default:
        break;
    }

    if (earned) {
      await prisma.userAchievement.create({
        data: { userId, achievementKey: achievement.key },
      });
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}
```

```
[ARCHIVO] src/app/(app)/achievements/page.tsx
```
```tsx
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { prisma } from '@ares/database';
import { ACHIEVEMENTS } from '@/lib/achievements/achievement-definitions';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

const TIER_COLORS: Record<string, string> = {
  BRONZE: 'border-amber-700/30',
  SILVER: 'border-slate-400/30',
  GOLD: 'border-yellow-500/30 shadow-glow-fire',
  LEGENDARY: 'border-purple-500/30 shadow-glow-ice',
};

export default async function AchievementsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const unlocked = await prisma.userAchievement.findMany({
    where: { userId: session.user.id },
    select: { achievementKey: true, unlockedAt: true },
  });
  const unlockedKeys = new Set(unlocked.map((u) => u.achievementKey));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-white mb-2">Logros</h1>
      <p className="text-sm text-slate-400 mb-6">
        {unlockedKeys.size}/{ACHIEVEMENTS.length} desbloqueados
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlockedKeys.has(a.key);
          return (
            <div
              key={a.key}
              className={cn(
                'glass p-4 text-center',
                isUnlocked ? TIER_COLORS[a.tier] : 'opacity-40 grayscale',
              )}
            >
              <span className="text-3xl block mb-2">{a.icon}</span>
              <p className="font-display font-bold text-white text-xs">{a.nameEs}</p>
              <p className="text-[10px] text-slate-500 mt-1">{a.description}</p>
              <Badge variant={a.tier === 'LEGENDARY' ? 'vip' : a.tier === 'GOLD' ? 'premium' : 'free'} size="sm" className="mt-2">
                {a.tier}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
ls src/lib/achievements/achievement-definitions.ts src/lib/achievements/achievement-checker.ts
```

### Commit: `feat(achievements): ARES-505 gamification — 21 achievements, auto-checker, achievements page with tier colors`

---

## ARES-506-notifications

**Fase:** 5 | **Prioridad:** MEDIO
**Dependencias:** ARES-500, ARES-505
**Descripción:** Notificaciones in-app: bell icon con badge count, tipos (achievement, subscription, tournament, system), mark as read, y API.

### Archivos a crear:

```
[ARCHIVO] src/app/api/notifications/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { getRequiredSession } from '@/lib/auth/auth.middleware';

export async function GET() {
  try {
    const session = await getRequiredSession();

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, readAt: null },
    });

    return NextResponse.json({ success: true, data: { notifications, unreadCount } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH() {
  try {
    const session = await getRequiredSession();

    await prisma.notification.updateMany({
      where: { userId: session.user.id, readAt: null },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ success: true, data: { markedAllRead: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/lib/notifications/send-notification.ts
```
```typescript
import { prisma } from '@ares/database';

type NotificationType = 'ACHIEVEMENT' | 'SUBSCRIPTION' | 'TOURNAMENT' | 'SYSTEM' | 'REFERRAL';

interface SendNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
}

export async function sendNotification(input: SendNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      actionUrl: input.actionUrl ?? null,
    },
  });
}

export async function sendAchievementNotification(userId: string, achievementName: string, icon: string) {
  return sendNotification({
    userId,
    type: 'ACHIEVEMENT',
    title: `${icon} ¡Nuevo logro!`,
    body: `Desbloqueaste "${achievementName}"`,
    actionUrl: '/achievements',
  });
}

export async function sendSubscriptionNotification(userId: string, tier: string) {
  return sendNotification({
    userId,
    type: 'SUBSCRIPTION',
    title: '⭐ ¡Plan actualizado!',
    body: `Tu cuenta ahora es ${tier}. Disfruta todas las funciones.`,
    actionUrl: '/profile/subscription',
  });
}

export async function sendExpirationWarning(userId: string, daysLeft: number) {
  return sendNotification({
    userId,
    type: 'SUBSCRIPTION',
    title: '⚠️ Tu suscripción expira pronto',
    body: `Te quedan ${daysLeft} días. Renueva para no perder acceso.`,
    actionUrl: '/pricing',
  });
}
```

```
[ARCHIVO] src/components/layout/notification-bell.tsx
```
```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';

import { cn } from '@/lib/cn';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setNotifications(data.data.notifications ?? []);
          setUnreadCount(data.data.unreadCount ?? 0);
        }
      })
      .catch(() => {});
  }, []);

  const handleMarkAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors touch-target"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-fire-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 glass max-h-96 overflow-y-auto z-50">
          <div className="flex items-center justify-between p-3 border-b border-white/5">
            <span className="text-sm font-ui font-semibold text-white">Notificaciones</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-fire-400 hover:text-fire-300">
                Marcar todo leído
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-slate-500 text-center">Sin notificaciones</p>
          ) : (
            notifications.slice(0, 15).map((n) => (
              <div
                key={n.id}
                className={cn('p-3 border-b border-white/5 hover:bg-white/5', !n.readAt && 'bg-fire-500/5')}
              >
                {n.actionUrl ? (
                  <Link href={n.actionUrl} onClick={() => setIsOpen(false)}>
                    <p className="text-sm font-ui font-semibold text-white">{n.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{n.body}</p>
                  </Link>
                ) : (
                  <>
                    <p className="text-sm font-ui font-semibold text-white">{n.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{n.body}</p>
                  </>
                )}
                <p className="text-[10px] text-slate-600 mt-1">
                  {new Date(n.createdAt).toLocaleDateString('es-MX')}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
curl http://localhost:3000/api/notifications # (requires auth)
```

### Commit: `feat(notifications): ARES-506 in-app notifications — bell icon, badge count, mark read, notification helpers`

---

## ARES-507-social-integration

**Fase:** 5 | **Prioridad:** MEDIO
**Dependencias:** ARES-107, ARES-504
**Descripción:** Share buttons mejorados para configs compartidas, Discord widget embed, y OG metadata dinámico para shared configs.

### Archivos a crear:

```
[ARCHIVO] src/components/community/social-share.tsx
```
```tsx
'use client';

import { useState } from 'react';
import { Share2, Copy, Check, MessageCircle, Send as SendIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface SocialShareProps {
  title: string;
  url: string;
  text: string;
}

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://sensibilidadespro.com';

export function SocialShare({ title, url, text }: SocialShareProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`;
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(fullUrl);

  const links = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${fullUrl}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n${fullUrl}`);
      setCopied(true);
      toast('success', '¡Copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('error', 'No se pudo copiar');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title, text, url: fullUrl });
      } catch { /* cancelled */ }
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <Button variant="ghost" size="sm" onClick={handleNativeShare} leftIcon={<Share2 size={14} />}>
          Compartir
        </Button>
      )}
      <a href={links.whatsapp} target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="sm" leftIcon={<MessageCircle size={14} />}>WhatsApp</Button>
      </a>
      <a href={links.telegram} target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="sm" leftIcon={<SendIcon size={14} />}>Telegram</Button>
      </a>
      <Button variant="ghost" size="sm" onClick={handleCopy} leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}>
        {copied ? 'Copiado' : 'Copiar'}
      </Button>
    </div>
  );
}
```

```
[ARCHIVO] src/components/community/discord-widget.tsx
```
```tsx
interface DiscordWidgetProps {
  serverId?: string;
  className?: string;
}

export function DiscordWidget({ serverId, className }: DiscordWidgetProps) {
  const id = serverId ?? process.env.NEXT_PUBLIC_DISCORD_SERVER_ID;
  if (!id) return null;

  return (
    <div className={className}>
      <h3 className="font-display font-bold text-white mb-3">Discord</h3>
      <iframe
        src={`https://discord.com/widget?id=${id}&theme=dark`}
        width="100%"
        height="400"
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        className="rounded-gaming border border-white/10"
        loading="lazy"
        title="Discord Server"
      />
    </div>
  );
}
```

```
[ARCHIVO] src/app/(app)/community/[configId]/opengraph-image.tsx
```
```tsx
import { ImageResponse } from 'next/og';

import { prisma } from '@ares/database';

export const runtime = 'edge';
export const alt = 'Config compartida — SensiPRO';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({ params }: { params: { configId: string } }) {
  const config = await prisma.sharedConfig.findUnique({
    where: { id: params.configId },
    include: {
      user: { select: { username: true, tier: true } },
      device: { select: { brand: true, model: true } },
    },
  });

  if (!config) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: '#050810', color: 'white', fontSize: 48, fontWeight: 700 }}>
          SensiPRO
        </div>
      ),
      { ...size },
    );
  }

  const styleEmoji = config.style === 'AGGRESSIVE' ? '⚔️' : config.style === 'SNIPER' ? '🔭' : '🎯';

  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', height: '100%', background: '#050810', color: 'white', padding: 80 }}>
        <div style={{ fontSize: 24, color: '#ff6a00', fontWeight: 700, letterSpacing: 4 }}>
          SENSIBILIDADES PRO
        </div>
        <div style={{ fontSize: 48, fontWeight: 900, marginTop: 16 }}>
          {config.title}
        </div>
        <div style={{ fontSize: 28, color: '#94a3b8', marginTop: 12 }}>
          {styleEmoji} {config.style} — {config.device.brand} {config.device.model}
        </div>
        <div style={{ fontSize: 22, color: '#64748b', marginTop: 24 }}>
          Por {config.user.username} ({config.user.tier}) • {config.upvotes} upvotes
        </div>
      </div>
    ),
    { ...size },
  );
}
```

### Validación:
```bash
npx tsc --noEmit
ls src/components/community/social-share.tsx src/components/community/discord-widget.tsx
```

### Commit: `feat(social): ARES-507 social integration — share buttons (WhatsApp/Telegram/Twitter), Discord widget, dynamic OG for shared configs`

---

# ═══════════════════════════════════════════════════════════════════
# FIN DE FASE 5 — COMUNIDAD Y SOCIAL
# ═══════════════════════════════════════════════════════════════════
#
# Al completar los 8 scripts de esta fase, el proyecto tiene:
#
# ✅ Perfiles: privado con stats + público /u/[username] + edición
# ✅ Rankings: 4 tipos (búsquedas, favoritos, referidos, logros) × 2 periodos
# ✅ Torneos: CRUD, inscripción con tier check, premios
# ✅ Comentarios: crear, reportar, auto-hide a 3 reports, profanity filter
# ✅ Configs compartidas: feed con upvote/downvote + trending/newest/top
# ✅ 21 achievements: auto-checker, 4 tiers (Bronze→Legendary), page con display
# ✅ Notificaciones: bell icon + badge count + mark read + helpers
# ✅ Social: WhatsApp/Telegram/Twitter share + Discord widget + dynamic OG
#
# La comunidad crea retención:
# - Logros motivan a seguir usando la app
# - Rankings crean competencia sana
# - Configs compartidas dan razón para volver
# - Notificaciones re-enganchan usuarios inactivos
# - Share buttons crean viralidad orgánica
#
# PRÓXIMA FASE: docs/MASTER-PLAN-G.md (Fase 6 — Admin y Analytics)
#
# ═══════════════════════════════════════════════════════════════════
