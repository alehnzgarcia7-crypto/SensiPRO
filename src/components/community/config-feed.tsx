'use client';

import { ThumbsUp, ThumbsDown, MessageCircle, Share2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';

// ═══════════════════════════════════════════════════════════════
// ConfigFeed — Feed de configs compartidas por la comunidad
// Soporta: trending/newest/top, filtro por estilo, paginacion,
// upvote/downvote toggle, publicar nueva config
// ═══════════════════════════════════════════════════════════════

const SORT_TABS = [
  { key: 'trending', label: 'Trending' },
  { key: 'newest', label: 'Nuevas' },
  { key: 'top', label: 'Top' },
];

const STYLE_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'AGGRESSIVE', label: 'Agresivo' },
  { key: 'BALANCED', label: 'Balanceado' },
  { key: 'SNIPER', label: 'Francotirador' },
];

function getTierVariant(tier: string): 'vip' | 'premium' | 'free' {
  if (tier === 'VIP') return 'vip';
  if (tier === 'PREMIUM') return 'premium';
  return 'free';
}

function getStyleVariant(style: string): 'aggressive' | 'balanced' | 'sniper' {
  if (style === 'AGGRESSIVE') return 'aggressive';
  if (style === 'SNIPER') return 'sniper';
  return 'balanced';
}

function getStyleLabel(style: string): string {
  if (style === 'AGGRESSIVE') return 'Agresivo';
  if (style === 'SNIPER') return 'Francotirador';
  return 'Balanceado';
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin}m`;
  if (diffHr < 24) return `hace ${diffHr}h`;
  if (diffDay < 7) return `hace ${diffDay}d`;
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

interface SharedConfigItem {
  id: string;
  title: string;
  description: string | null;
  style: string;
  votes: number;
  createdAt: string;
  user: {
    username: string;
    avatarUrl: string | null;
    tier: string;
  };
  device: {
    brand: string;
    model: string;
    slug: string;
    tier: string;
  };
  _count: {
    comments: number;
  };
}

interface VoteState {
  [configId: string]: 'up' | 'down' | null;
}

interface ApiListResponse {
  success: boolean;
  data: SharedConfigItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiVoteResponse {
  success: boolean;
  data: {
    vote: string | null;
    action: string;
  };
  error?: {
    message: string;
  };
}

export function ConfigFeed() {
  const { toast } = useToast();
  const [sort, setSort] = useState('trending');
  const [style, setStyle] = useState('all');
  const [configs, setConfigs] = useState<SharedConfigItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<VoteState>({});

  const fetchConfigs = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      if (!append) setLoading(true);
      const params = new URLSearchParams({ sort, page: String(pageNum) });
      if (style !== 'all') params.set('style', style);

      const res = await fetch(`/api/shared-configs?${params.toString()}`);
      const json: ApiListResponse = await res.json();

      if (json.success) {
        setConfigs((prev) => (append ? [...prev, ...json.data] : json.data));
        setTotal(json.meta.total);
        setHasMore(pageNum < json.meta.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [sort, style]);

  useEffect(() => {
    setPage(1);
    fetchConfigs(1);
  }, [fetchConfigs]);

  const handleVote = async (configId: string, direction: 'up' | 'down') => {
    if (votingId) return;
    setVotingId(configId);

    try {
      const res = await fetch(`/api/shared-configs/${configId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      });

      const json: ApiVoteResponse = await res.json();

      if (json.success) {
        const currentVote = userVotes[configId] ?? null;
        let delta = 0;

        if (json.data.action === 'created') {
          delta = direction === 'up' ? 1 : -1;
        } else if (json.data.action === 'removed') {
          delta = currentVote === 'up' ? -1 : 1;
        } else if (json.data.action === 'changed') {
          delta = direction === 'up' ? 2 : -2;
        }

        setConfigs((prev) =>
          prev.map((c) =>
            c.id === configId ? { ...c, votes: c.votes + delta } : c,
          ),
        );

        setUserVotes((prev) => ({
          ...prev,
          [configId]: json.data.vote as 'up' | 'down' | null,
        }));
      } else if (!res.ok) {
        toast('error', json.error?.message ?? 'Error al votar');
      }
    } catch {
      toast('error', 'Error de conexion al votar');
    } finally {
      setVotingId(null);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchConfigs(nextPage, true);
  };

  return (
    <div>
      {/* Filtros */}
      <Tabs tabs={SORT_TABS} activeTab={sort} onChange={setSort} className="mb-3" />
      <Tabs tabs={STYLE_TABS} activeTab={style} onChange={setStyle} className="mb-6" />

      {/* Boton compartir */}
      <div className="flex justify-end mb-4">
        <Link href="/generator">
          <Button variant="secondary" size="sm" leftIcon={<Plus size={14} />}>
            Compartir config
          </Button>
        </Link>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={`skeleton-${i}`} variant="card" className="h-28" />
          ))}
        </div>
      ) : configs.length === 0 ? (
        <div className="text-center py-12">
          <Share2 size={40} className="mx-auto text-slate-700 mb-3" />
          <p className="text-sm text-slate-500 mb-1">
            No hay configs compartidas todavia
          </p>
          <p className="text-xs text-slate-600">
            Se el primero en compartir tu configuracion
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {configs.map((config) => {
            const currentVote = userVotes[config.id] ?? null;

            return (
              <div
                key={config.id}
                className="glass rounded-gaming p-4 transition-all hover:border-white/10"
              >
                <div className="flex items-start gap-3">
                  {/* Vote buttons */}
                  <div className="flex flex-col items-center gap-0.5 pt-0.5">
                    <button
                      onClick={() => handleVote(config.id, 'up')}
                      disabled={votingId === config.id}
                      className={cn(
                        'p-1.5 rounded-lg transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center',
                        currentVote === 'up'
                          ? 'text-success bg-success/10'
                          : 'text-slate-500 hover:text-success hover:bg-success/5',
                      )}
                    >
                      <ThumbsUp size={14} />
                    </button>
                    <span
                      className={cn(
                        'text-sm font-display font-bold tabular-nums',
                        config.votes > 0
                          ? 'text-success'
                          : config.votes < 0
                            ? 'text-danger'
                            : 'text-slate-500',
                      )}
                    >
                      {config.votes}
                    </span>
                    <button
                      onClick={() => handleVote(config.id, 'down')}
                      disabled={votingId === config.id}
                      className={cn(
                        'p-1.5 rounded-lg transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center',
                        currentVote === 'down'
                          ? 'text-danger bg-danger/10'
                          : 'text-slate-500 hover:text-danger hover:bg-danger/5',
                      )}
                    >
                      <ThumbsDown size={14} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-white text-sm leading-tight">
                      {config.title}
                    </h4>

                    {config.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {config.description}
                      </p>
                    )}

                    {/* Meta: usuario + dispositivo */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
                      <Link
                        href={`/u/${config.user.username}`}
                        className="text-xs text-slate-500 hover:text-white transition-colors"
                      >
                        {config.user.username}
                      </Link>
                      <Badge
                        variant={getTierVariant(config.user.tier)}
                        size="sm"
                      >
                        {config.user.tier}
                      </Badge>
                      <span className="text-slate-700">|</span>
                      <Link
                        href={`/devices/${config.device.slug}`}
                        className="text-xs text-fire-400 hover:text-fire-300 transition-colors"
                      >
                        {config.device.brand} {config.device.model}
                      </Link>
                      <Badge variant={getStyleVariant(config.style)} size="sm">
                        {getStyleLabel(config.style)}
                      </Badge>
                    </div>

                    {/* Footer: comentarios + fecha */}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[11px] text-slate-600">
                        <MessageCircle size={12} />
                        {config._count.comments}
                      </span>
                      <span className="text-[11px] text-slate-600">
                        {formatRelativeDate(config.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Paginacion */}
          {hasMore && (
            <div className="text-center pt-4">
              <Button variant="ghost" size="sm" onClick={handleLoadMore}>
                Cargar mas ({total - configs.length} restantes)
              </Button>
            </div>
          )}

          {/* Total */}
          {!hasMore && configs.length > 0 && (
            <p className="text-center text-[11px] text-slate-600 pt-2">
              {total} {total === 1 ? 'config compartida' : 'configs compartidas'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
