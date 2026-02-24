'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Shield, ShieldOff } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';

// ══════════════════════════════════════════════════════════
// AdminUsersTable — Tabla de usuarios con busqueda, filtros
// tier/role change, activar/desactivar, paginacion
// ══════════════════════════════════════════════════════════

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
  displayName: string | null;
  tier: 'FREE' | 'PREMIUM' | 'VIP';
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  isActive: boolean;
  totalSearches: number;
  totalFavorites: number;
  totalShares: number;
  referralCount: number;
  tierExpiresAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

interface UserListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function AdminUsersTable() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<UserListMeta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 300);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (tier !== 'all') params.set('tier', tier);

    try {
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const json: { success: boolean; data: AdminUser[]; meta: UserListMeta } = await res.json();
      if (json.success) {
        setUsers(json.data);
        setMeta(json.meta);
      }
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, tier]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleUpdateTier = async (userId: string, newTier: string) => {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier: newTier,
        tierExpiresAt: newTier === 'FREE' ? null : expiresAt.toISOString(),
      }),
    });

    if (res.ok) {
      toast('success', `Tier cambiado a ${newTier}`);
      void fetchUsers();
    } else {
      toast('error', 'Error al cambiar tier');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });

    if (res.ok) {
      toast('success', `Role cambiado a ${newRole}`);
      void fetchUsers();
    } else {
      toast('error', 'Error al cambiar role');
    }
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentActive }),
    });

    if (res.ok) {
      toast('success', currentActive ? 'Usuario desactivado' : 'Usuario activado');
      void fetchUsers();
    } else {
      toast('error', 'Error al cambiar estado');
    }
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div>
      {/* Filtros: busqueda + tabs de tier */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar usuario o email..."
            className="pl-9"
          />
        </div>
        <Tabs
          tabs={TIER_TABS}
          activeTab={tier}
          onChange={(t) => {
            setTier(t);
            setPage(1);
          }}
        />
      </div>

      {/* Total encontrados */}
      <p className="text-xs text-slate-500 mb-3">
        {meta.total} usuario{meta.total !== 1 ? 's' : ''} encontrado{meta.total !== 1 ? 's' : ''}
      </p>

      {/* Tabla */}
      <div className="glass overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left">
              <th className="p-3 text-xs font-ui text-slate-500 uppercase tracking-wider">Usuario</th>
              <th className="p-3 text-xs font-ui text-slate-500 uppercase tracking-wider hidden md:table-cell">Email</th>
              <th className="p-3 text-xs font-ui text-slate-500 uppercase tracking-wider">Tier</th>
              <th className="p-3 text-xs font-ui text-slate-500 uppercase tracking-wider hidden lg:table-cell">Role</th>
              <th className="p-3 text-xs font-ui text-slate-500 uppercase tracking-wider hidden lg:table-cell">Busquedas</th>
              <th className="p-3 text-xs font-ui text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="p-3 text-xs font-ui text-slate-500 uppercase tracking-wider hidden xl:table-cell">Registro</th>
              <th className="p-3 text-xs font-ui text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  Cargando usuarios...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-3">
                    <div>
                      <p className="font-ui font-semibold text-white">{u.username}</p>
                      <p className="text-xs text-slate-500 md:hidden">{u.email}</p>
                    </div>
                  </td>
                  <td className="p-3 text-slate-400 hidden md:table-cell">{u.email}</td>
                  <td className="p-3">
                    <Badge
                      variant={u.tier === 'VIP' ? 'vip' : u.tier === 'PREMIUM' ? 'premium' : 'free'}
                      size="sm"
                    >
                      {u.tier}
                    </Badge>
                  </td>
                  <td className="p-3 hidden lg:table-cell">
                    <span
                      className={cn(
                        'text-xs font-ui font-semibold',
                        u.role === 'ADMIN' ? 'text-fire-400' : u.role === 'MODERATOR' ? 'text-ice-400' : 'text-slate-400',
                      )}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 tabular-nums hidden lg:table-cell">
                    {u.totalSearches.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span className={cn('text-xs font-semibold', u.isActive ? 'text-success' : 'text-danger')}>
                      {u.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-slate-500 hidden xl:table-cell">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {/* Cambiar tier */}
                      <select
                        value={u.tier}
                        onChange={(e) => handleUpdateTier(u.id, e.target.value)}
                        className="bg-background-base border border-white/10 rounded px-2 py-1 text-xs text-white min-h-[32px]"
                      >
                        <option value="FREE">FREE</option>
                        <option value="PREMIUM">PREMIUM</option>
                        <option value="VIP">VIP</option>
                      </select>

                      {/* Cambiar role */}
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className="bg-background-base border border-white/10 rounded px-2 py-1 text-xs text-white min-h-[32px] hidden lg:block"
                      >
                        <option value="USER">USER</option>
                        <option value="MODERATOR">MOD</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>

                      {/* Activar/Desactivar */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(u.id, u.isActive)}
                        title={u.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                      >
                        {u.isActive ? <ShieldOff size={14} /> : <Shield size={14} />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginacion */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            ← Anterior
          </Button>
          <span className="text-xs text-slate-500">
            Pagina {meta.page} de {meta.totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page >= meta.totalPages}
          >
            Siguiente →
          </Button>
        </div>
      )}
    </div>
  );
}
