'use client';

import { Crown, Search, Shield, User, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { cn } from '@/lib/cn';

interface UserRow {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  tier: string;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
  totalSearches: number;
  hasPremiumLicense: boolean;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type Filter = 'all' | 'premium' | 'free' | 'today' | 'active';

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'premium', label: 'Premium' },
  { value: 'free', label: 'Free' },
  { value: 'today', label: 'Nuevos Hoy' },
  { value: 'active', label: 'Activos 24h' },
];

function timeAgo(date: string | null): string {
  if (!date) return 'Nunca';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<Record<string, unknown> | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: '20',
      filter,
    });
    if (search.trim()) params.set('search', search.trim());

    const res = await fetch(`/api/command-center/users?${params}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.data || []);
      if (data.meta) setMeta(data.meta);
    }
    setLoading(false);
  }, [filter, search]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleUserClick = async (userId: string) => {
    setSelectedUser(userId);
    setUserDetail(null);
    const res = await fetch(`/api/command-center/users/${userId}`);
    if (res.ok) {
      const json = await res.json();
      // Flatten user + recentSearches into one object for the modal
      setUserDetail({
        ...json.data?.user,
        recentSearches: json.data?.recentSearches || [],
        premiumLicense: json.data?.premiumLicense || null,
        paymentAttempts: json.data?.paymentAttempts || [],
      });
    }
  };

  const handleAction = async (userId: string, action: 'grant-premium' | 'revoke-premium') => {
    setActionLoading(true);
    await fetch(`/api/command-center/users/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setActionLoading(false);
    handleUserClick(userId);
    fetchUsers(meta.page);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-mono">Usuarios</h1>
        <p className="text-sm text-slate-500 mt-1">Gestión y monitoreo de usuarios</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-[#0d0d1a] rounded-lg p-1 border border-[#1a1a2e]">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-3 py-2 rounded-md text-xs font-medium transition-all',
                filter === f.value
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar email o username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0d0d1a] border border-[#1a1a2e] text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#1a1a2e] bg-[#0d0d1a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a2e]">
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Usuario</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Registro</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Último acceso</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Búsquedas</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#1a1a2e]/50">
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-4 bg-white/5 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500 text-sm">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => handleUserClick(user.id)}
                    className="border-b border-[#1a1a2e]/50 hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-xs font-bold text-cyan-400">
                          {(user.username || user.email).charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-white font-medium">{user.username || user.displayName || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 font-mono text-xs">{user.email}</td>
                    <td className="px-4 py-3">
                      {user.hasPremiumLicense ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Crown className="w-3 h-3" /> PREMIUM
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          <User className="w-3 h-3" /> FREE
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{timeAgo(user.lastLoginAt)}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 font-mono text-right">{user.totalSearches}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1a1a2e]">
            <span className="text-xs text-slate-500">
              {meta.total.toLocaleString()} usuarios total
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchUsers(meta.page - 1)}
                disabled={meta.page <= 1}
                className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400 font-mono">
                {meta.page} / {meta.totalPages}
              </span>
              <button
                onClick={() => fetchUsers(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && userDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Detalle de Usuario</h2>
              <button
                onClick={() => { setSelectedUser(null); setUserDetail(null); }}
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500 text-xs">Email</span>
                  <p className="text-white font-mono text-xs mt-0.5">{String(userDetail.email || '')}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Username</span>
                  <p className="text-white mt-0.5">{String(userDetail.username || '')}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Registro</span>
                  <p className="text-white mt-0.5 text-xs">
                    {userDetail.createdAt ? new Date(String(userDetail.createdAt)).toLocaleDateString('es-MX') : '—'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Búsquedas</span>
                  <p className="text-white font-mono mt-0.5">{String(userDetail.totalSearches || 0)}</p>
                </div>
              </div>

              {/* Premium Actions */}
              <div className="flex gap-3 pt-4 border-t border-[#1a1a2e]">
                <button
                  onClick={() => handleAction(selectedUser, 'grant-premium')}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 text-sm font-medium disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                  Dar Premium
                </button>
                <button
                  onClick={() => handleAction(selectedUser, 'revoke-premium')}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-sm font-medium disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  Quitar Premium
                </button>
              </div>

              {/* Recent Activity */}
              {Array.isArray(userDetail.recentSearches) && (userDetail.recentSearches as Array<Record<string, unknown>>).length > 0 && (
                <div className="pt-4 border-t border-[#1a1a2e]">
                  <h4 className="text-xs font-semibold text-slate-400 mb-2">Búsquedas Recientes</h4>
                  <div className="space-y-1.5">
                    {(userDetail.recentSearches as Array<Record<string, unknown>>).slice(0, 10).map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">
                          {String((s.device as Record<string, unknown>)?.brand || '')} {String((s.device as Record<string, unknown>)?.model || '')}
                        </span>
                        <span className="text-slate-600">{String(s.style || '')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
