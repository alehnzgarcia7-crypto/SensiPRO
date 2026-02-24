'use client';

import { useState, useEffect } from 'react';

/**
 * Hook para obtener la variante A/B asignada al usuario actual.
 * Retorna null si no hay sesión, el experimento no existe, o está inactivo.
 */
export function useABVariant(experimentKey: string): string | null {
  const [variant, setVariant] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/ab-variant?experiment=${encodeURIComponent(experimentKey)}`)
      .then((r) => r.json())
      .then((data: { success: boolean; data?: { variant: string | null } }) => {
        if (!cancelled && data.success && data.data) {
          setVariant(data.data.variant);
        }
      })
      .catch(() => {
        // Silencioso — AB testing no debe romper la app
      });

    return () => {
      cancelled = true;
    };
  }, [experimentKey]);

  return variant;
}
