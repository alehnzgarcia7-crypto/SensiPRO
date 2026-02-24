'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

const TYPES = [
  { key: 'searches', label: '🔍 Búsquedas' },
  { key: 'favorites', label: '❤️ Favoritos' },
  { key: 'shares', label: '📤 Shares' },
  { key: 'achievements', label: '🏆 Logros' },
];

const PERIODS = [
  { key: 'all', label: 'All-Time' },
  { key: 'weekly', label: 'Semanal' },
];

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  tier: 'FREE' | 'PREMIUM' | 'VIP';
  value: number;
}

interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardEntry[];
  meta: { type: string; period: string; total: number };
}

export function LeaderboardView() {
  const [type, setType] = useState('searches');
  const [period, setPeriod] = useState('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?type=${type}&period=${period}&limit=20`);
      const data: LeaderboardResponse = await res.json();
      setEntries(data.data ?? []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [type, period]);

  useEffect(() => {
    void fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div>
      {/* Tabs de tipo */}
      <Tabs tabs={TYPES} activeTab={type} onChange={setType} className="mb-4" />

      {/* Tabs de periodo */}
      <Tabs tabs={PERIODS} activeTab={period} onChange={setPeriod} className="mb-6" />

      {/* Lista */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={`skeleton-${String(i)}`} variant="rect" className="h-14" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-sm text-slate-500 py-8">No hay datos todavía</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <Link key={entry.userId} href={`/u/${entry.username}`}>
              <div
                className={cn(
                  'rounded-gaming border border-white/5 bg-background-card/50 backdrop-blur-sm',
                  'p-4 flex items-center gap-3 min-h-[44px]',
                  'transition-all duration-200 hover:border-white/10 hover:bg-background-card/80',
                  entry.rank <= 3 && 'border-fire-500/20',
                )}
              >
                {/* Posición */}
                <span
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0',
                    entry.rank === 1 && 'bg-tier-vip/20 text-tier-vip',
                    entry.rank === 2 && 'bg-slate-400/20 text-slate-300',
                    entry.rank === 3 && 'bg-fire-500/20 text-fire-400',
                    entry.rank > 3 && 'bg-white/5 text-slate-500',
                  )}
                >
                  {entry.rank}
                </span>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-background-elevated flex items-center justify-center text-xs border border-white/10 shrink-0 overflow-hidden">
                  {entry.avatarUrl ? (
                    <img
                      src={entry.avatarUrl}
                      alt={entry.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-slate-400">
                      {entry.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Username */}
                <div className="flex-1 min-w-0">
                  <p className="font-ui font-semibold text-white text-sm truncate">
                    {entry.username}
                  </p>
                </div>

                {/* Tier badge */}
                <Badge
                  variant={
                    entry.tier === 'VIP'
                      ? 'vip'
                      : entry.tier === 'PREMIUM'
                        ? 'premium'
                        : 'free'
                  }
                  size="sm"
                >
                  {entry.tier}
                </Badge>

                {/* Valor */}
                <span className="text-sm font-display font-bold text-white tabular-nums w-12 text-right">
                  {entry.value.toLocaleString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
