'use client';

import { useState, useCallback } from 'react';
import type { SensitivityStyle } from '@prisma/client';

import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/use-favorites';

// ═══════════════════════════════════════════════════════════════
// /favorites — Pagina de configuraciones guardadas
// Lista las configs favoritas con opciones de editar/eliminar
// ═══════════════════════════════════════════════════════════════

const STYLE_LABELS: Record<SensitivityStyle, string> = {
  AGGRESSIVE: 'Agresivo',
  BALANCED: 'Balanceado',
  SNIPER: 'Francotirador',
};

const STYLE_VARIANTS: Record<SensitivityStyle, 'aggressive' | 'balanced' | 'sniper'> = {
  AGGRESSIVE: 'aggressive',
  BALANCED: 'balanced',
  SNIPER: 'sniper',
};

export default function FavoritesPage() {
  const { favorites, loading, removeFavorite, updateNickname } = useFavorites();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNickname, setEditNickname] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleStartEdit = useCallback((id: string, currentNickname: string | null) => {
    setEditingId(id);
    setEditNickname(currentNickname ?? '');
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingId) return;

    await updateNickname(editingId, editNickname || null);
    setEditingId(null);
    setEditNickname('');
  }, [editingId, editNickname, updateNickname]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditNickname('');
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    await removeFavorite(id);
    setDeletingId(null);
  }, [removeFavorite]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-white">Mis Favoritos</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`skeleton-${String(i)}`}
              className="h-24 animate-pulse rounded-xl bg-slate-800/50"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mis Favoritos</h1>
          <p className="mt-1 text-sm text-slate-400">
            {favorites.length} {favorites.length === 1 ? 'configuracion guardada' : 'configuraciones guardadas'}
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 px-6 py-16 text-center">
          <div className="mx-auto mb-4 text-5xl">{'\u2B50'}</div>
          <h2 className="mb-2 text-lg font-bold text-white">
            No tienes favoritos
          </h2>
          <p className="text-sm text-slate-400">
            Genera sensibilidades y guarda tus configuraciones preferidas aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className={cn(
                'group rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 transition-all hover:border-slate-600/50',
                deletingId === fav.id && 'scale-95 opacity-50',
              )}
            >
              <div className="flex items-center justify-between gap-4">
                {/* Info del dispositivo */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-bold text-white">
                      {fav.device.brand} {fav.device.model}
                    </h3>
                    <Badge variant={STYLE_VARIANTS[fav.style]}>
                      {STYLE_LABELS[fav.style]}
                    </Badge>
                  </div>

                  {/* Nickname editable */}
                  {editingId === fav.id ? (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={editNickname}
                        onChange={(e) => setEditNickname(e.target.value)}
                        placeholder="Nombre personalizado..."
                        maxLength={50}
                        className="rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-1.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                      <Button size="sm" onClick={() => void handleSaveEdit()}>
                        Guardar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-0.5 text-sm text-slate-400">
                      {fav.nickname ?? `${fav.device.screenHz}Hz | ${fav.device.tier}`}
                    </p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleStartEdit(fav.id, fav.nickname)}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
                    aria-label="Editar nickname"
                  >
                    {'\u270F\uFE0F'}
                  </button>
                  <button
                    onClick={() => void handleDelete(fav.id)}
                    disabled={deletingId === fav.id}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    aria-label="Eliminar favorito"
                  >
                    {'\uD83D\uDDD1\uFE0F'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
