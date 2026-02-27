'use client';

import { Eye, EyeOff, Trash2, Star } from 'lucide-react';
import { useState, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';

// ══════════════════════════════════════════════════════════
// AdminContentGuides — Tabla de guias con publish/unpublish,
// delete, filtro por categoria, y badge premium/free
// ══════════════════════════════════════════════════════════

const CATEGORY_TABS = [
  { key: 'all', label: 'Todas' },
  { key: 'SENSITIVITY', label: 'Sensibilidad' },
  { key: 'MOVEMENT', label: 'Movimiento' },
  { key: 'AIM', label: 'Puntería' },
  { key: 'STRATEGY', label: 'Estrategia' },
  { key: 'DEVICE', label: 'Dispositivo' },
  { key: 'META', label: 'Meta' },
];

const categoryLabels: Record<string, string> = {
  SENSITIVITY: 'Sensibilidad',
  MOVEMENT: 'Movimiento',
  AIM: 'Puntería',
  STRATEGY: 'Estrategia',
  DEVICE: 'Dispositivo',
  META: 'Meta',
};

interface GuideRow {
  id: string;
  title: string;
  category: string;
  isPremium: boolean;
  isPublished: boolean;
  viewCount: number;
  updatedAt: string;
}

interface AdminContentGuidesProps {
  initialGuides: GuideRow[];
}

export function AdminContentGuides({ initialGuides }: AdminContentGuidesProps) {
  const { toast } = useToast();
  const [guides, setGuides] = useState<GuideRow[]>(initialGuides);
  const [category, setCategory] = useState('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = category === 'all'
    ? guides
    : guides.filter((g) => g.category === category);

  const togglePublish = useCallback(
    async (guideId: string, currentStatus: boolean) => {
      setUpdating(guideId);
      try {
        const res = await fetch(`/api/admin/guides/${guideId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPublished: !currentStatus }),
        });

        if (res.ok) {
          setGuides((prev) =>
            prev.map((g) =>
              g.id === guideId ? { ...g, isPublished: !currentStatus } : g,
            ),
          );
          toast('success', currentStatus ? 'Guía despublicada' : 'Guía publicada');
        } else {
          const json: { error?: { message?: string } } = await res.json();
          toast('error', json.error?.message ?? 'Error al actualizar');
        }
      } catch {
        toast('error', 'Error de conexión');
      } finally {
        setUpdating(null);
      }
    },
    [toast],
  );

  const deleteGuide = useCallback(
    async (guideId: string, title: string) => {
      if (!window.confirm(`¿Eliminar la guía "${title}"? Esta acción no se puede deshacer.`)) {
        return;
      }

      setUpdating(guideId);
      try {
        const res = await fetch(`/api/admin/guides/${guideId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setGuides((prev) => prev.filter((g) => g.id !== guideId));
          toast('success', 'Guía eliminada');
        } else {
          const json: { error?: { message?: string } } = await res.json();
          toast('error', json.error?.message ?? 'Error al eliminar');
        }
      } catch {
        toast('error', 'Error de conexión');
      } finally {
        setUpdating(null);
      }
    },
    [toast],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-white">Guías</h2>
        <span className="text-xs text-slate-500">{filtered.length} resultados</span>
      </div>

      {/* Filtro por categoria */}
      <div className="mb-4 overflow-x-auto">
        <Tabs
          tabs={CATEGORY_TABS}
          activeTab={category}
          onChange={(key: string) => setCategory(key)}
        />
      </div>

      {/* Tabla */}
      <div className="glass overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left">
              <th className="p-3 text-xs font-ui text-slate-500">Título</th>
              <th className="p-3 text-xs font-ui text-slate-500 hidden sm:table-cell">
                Categoría
              </th>
              <th className="p-3 text-xs font-ui text-slate-500">Tier</th>
              <th className="p-3 text-xs font-ui text-slate-500">Estado</th>
              <th className="p-3 text-xs font-ui text-slate-500 hidden md:table-cell">
                Vistas
              </th>
              <th className="p-3 text-xs font-ui text-slate-500">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  No hay guías en esta categoría
                </td>
              </tr>
            ) : (
              filtered.map((guide) => (
                <tr
                  key={guide.id}
                  className={cn(
                    'border-b border-white/5 hover:bg-white/[0.02] transition-colors',
                    updating === guide.id && 'opacity-50',
                  )}
                >
                  <td className="p-3">
                    <p className="font-ui font-semibold text-white truncate max-w-[200px] sm:max-w-[300px]">
                      {guide.title}
                    </p>
                  </td>
                  <td className="p-3 hidden sm:table-cell">
                    <span className="text-slate-400 text-xs">
                      {categoryLabels[guide.category] ?? guide.category}
                    </span>
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={guide.isPremium ? 'premium' : 'free'}
                      size="sm"
                    >
                      {guide.isPremium ? 'Premium' : 'Free'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <span
                      className={cn(
                        'text-xs font-ui font-semibold',
                        guide.isPublished ? 'text-green-400' : 'text-yellow-400',
                      )}
                    >
                      {guide.isPublished ? 'Publicada' : 'Borrador'}
                    </span>
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <Star size={12} className="text-slate-500" />
                      {guide.viewCount.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          void togglePublish(guide.id, guide.isPublished)
                        }
                        disabled={updating === guide.id}
                        className="min-h-[36px] min-w-[36px] p-2"
                      >
                        {guide.isPublished ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          void deleteGuide(guide.id, guide.title)
                        }
                        disabled={updating === guide.id}
                        className="min-h-[36px] min-w-[36px] p-2"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
