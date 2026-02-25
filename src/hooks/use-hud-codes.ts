'use client';

import { useState, useEffect } from 'react';

interface HudCodeData {
  id: string;
  fingers: number;
  code: string;
  label: string;
  description: string | null;
  playerName: string | null;
  screenMin: number | null;
  screenMax: number | null;
  source: string;
  precision: number;
  velocity: number;
  playability: number;
  isDefault: boolean;
}

interface UseHudCodesResult {
  codes: HudCodeData[];
  recommended: HudCodeData | null;
  isLoading: boolean;
  error: string | null;
}

export function useHudCodes({
  fingers,
  screenSize,
}: {
  fingers: 2 | 3 | 4 | 5;
  screenSize?: number;
}): UseHudCodesResult {
  const [codes, setCodes] = useState<HudCodeData[]>([]);
  const [recommended, setRecommended] = useState<HudCodeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCodes() {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ fingers: String(fingers) });
        if (screenSize) {
          params.set('screenSize', String(screenSize));
        }

        const response = await fetch(`/api/hud-codes?${params.toString()}`);
        const json: unknown = await response.json();

        if (cancelled) return;

        const typed = json as {
          success: boolean;
          data?: { codes: HudCodeData[]; recommended: HudCodeData | null };
          error?: { message: string };
        };

        if (!typed.success || !typed.data) {
          setError(typed.error?.message ?? 'Error al cargar códigos HUD');
          return;
        }

        setCodes(typed.data.codes);
        setRecommended(typed.data.recommended);
      } catch {
        if (!cancelled) {
          setError('Error de conexión al cargar códigos HUD');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchCodes();

    return () => {
      cancelled = true;
    };
  }, [fingers, screenSize]);

  return { codes, recommended, isLoading, error };
}
