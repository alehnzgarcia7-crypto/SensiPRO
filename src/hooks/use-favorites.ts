'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SensitivityStyle, DeviceTier, PanelType } from '@prisma/client';

// ═══════════════════════════════════════════════════════════════
// useFavorites — Hook para gestionar favoritos del usuario
// CRUD completo con cache local + sync con API
// ═══════════════════════════════════════════════════════════════

interface FavoriteDevice {
  id: string;
  brand: string;
  model: string;
  slug: string;
  tier: DeviceTier;
  screenHz: number;
  panelType: PanelType;
  imageUrl: string | null;
}

interface Favorite {
  id: string;
  deviceId: string;
  style: SensitivityStyle;
  nickname: string | null;
  createdAt: string;
  device: FavoriteDevice;
}

interface FavoriteActionResult {
  success: boolean;
  error?: string;
}

interface ApiSuccessResponse {
  success: true;
  data: Favorite;
}

interface ApiListResponse {
  success: true;
  data: Favorite[];
}

interface ApiErrorResponse {
  success: false;
  error?: { message?: string };
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch('/api/favorites');

      if (res.ok) {
        const json = (await res.json()) as ApiListResponse;
        setFavorites(json.data);
      }
    } catch {
      // Silently fail para usuarios no autenticados
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = useCallback(
    async (
      deviceId: string,
      style: SensitivityStyle,
      nickname?: string,
    ): Promise<FavoriteActionResult> => {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, style, nickname }),
      });

      const json = (await res.json()) as ApiSuccessResponse | ApiErrorResponse;

      if (json.success) {
        const data = (json as ApiSuccessResponse).data;
        setFavorites((prev) => [data, ...prev]);
        return { success: true };
      }

      const errorResponse = json as ApiErrorResponse;
      return {
        success: false,
        error: errorResponse.error?.message ?? 'Error al guardar favorito',
      };
    },
    [],
  );

  const removeFavorite = useCallback(
    async (id: string): Promise<FavoriteActionResult> => {
      const res = await fetch(`/api/favorites/${id}`, { method: 'DELETE' });

      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f.id !== id));
        return { success: true };
      }

      return { success: false, error: 'Error al eliminar favorito' };
    },
    [],
  );

  const updateNickname = useCallback(
    async (
      id: string,
      nickname: string | null,
    ): Promise<FavoriteActionResult> => {
      const res = await fetch(`/api/favorites/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });

      const json = (await res.json()) as ApiSuccessResponse | ApiErrorResponse;

      if (json.success) {
        const data = (json as ApiSuccessResponse).data;
        setFavorites((prev) =>
          prev.map((f) => (f.id === id ? data : f)),
        );
        return { success: true };
      }

      const errorResponse = json as ApiErrorResponse;
      return {
        success: false,
        error: errorResponse.error?.message ?? 'Error al actualizar',
      };
    },
    [],
  );

  const isFavorite = useCallback(
    (deviceId: string, style: SensitivityStyle): boolean => {
      return favorites.some(
        (f) => f.deviceId === deviceId && f.style === style,
      );
    },
    [favorites],
  );

  const getFavoriteId = useCallback(
    (deviceId: string, style: SensitivityStyle): string | null => {
      const found = favorites.find(
        (f) => f.deviceId === deviceId && f.style === style,
      );
      return found?.id ?? null;
    },
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (
      deviceId: string,
      style: SensitivityStyle,
      nickname?: string,
    ): Promise<FavoriteActionResult> => {
      const existingId = getFavoriteId(deviceId, style);

      if (existingId) {
        return removeFavorite(existingId);
      }

      return addFavorite(deviceId, style, nickname);
    },
    [getFavoriteId, removeFavorite, addFavorite],
  );

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    updateNickname,
    isFavorite,
    getFavoriteId,
    toggleFavorite,
    refresh: fetchFavorites,
  };
}
