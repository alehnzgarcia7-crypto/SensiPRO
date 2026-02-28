/**
 * usePremium — Hook para verificar estado premium en el cliente
 *
 * Uso:
 *   const { isPremium, isLoading, email, unlock } = usePremium();
 *
 *   if (isLoading) return <Skeleton />;
 *   if (!isPremium) return <Paywall />;
 *   return <ResultadoCompleto />;
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

import { PREMIUM_COOKIE_NAME } from '@/lib/payments/payment-service';

interface PremiumState {
  isPremium: boolean;
  isLoading: boolean;
  email: string | null;
  activatedAt: Date | null;
}

interface UsePremiumReturn extends PremiumState {
  /** Verifica el estado premium contra la DB */
  verify: (email: string) => Promise<boolean>;
  /** Guarda el email premium en cookie (después de pago exitoso) */
  setPremiumEmail: (email: string) => void;
  /** Obtiene el email guardado */
  getEmail: () => string | null;
  /** Limpia el estado premium (para testing) */
  clearPremium: () => void;
}

export function usePremium(): UsePremiumReturn {
  const [state, setState] = useState<PremiumState>({
    isPremium: false,
    isLoading: true,
    email: null,
    activatedAt: null,
  });

  const setPremiumEmailInternal = (email: string) => {
    // Cookie (1 año)
    document.cookie = `${PREMIUM_COOKIE_NAME}=${encodeURIComponent(email)}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    // localStorage como backup
    localStorage.setItem('sensipro_premium_email', email);
  };

  const verifyAsync = useCallback(async (email: string) => {
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      setState({
        isPremium: data.isPremium === true,
        isLoading: false,
        email: data.isPremium ? email : null,
        activatedAt: data.activatedAt ? new Date(data.activatedAt) : null,
      });

      // Si es premium, guardar en cookie y localStorage
      if (data.isPremium) {
        setPremiumEmailInternal(email);
      }

      return data.isPremium === true;
    } catch {
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  // Al montar, verificar si hay cookie premium
  useEffect(() => {
    const checkCookie = () => {
      try {
        // Leer cookie
        const cookies = document.cookie.split(';');
        const premiumCookie = cookies
          .find(c => c.trim().startsWith(`${PREMIUM_COOKIE_NAME}=`));

        if (premiumCookie) {
          const email = decodeURIComponent(premiumCookie.split('=')[1]?.trim() || '');
          if (email && email.includes('@')) {
            setState({
              isPremium: true,
              isLoading: false,
              email,
              activatedAt: null,
            });
            return;
          }
        }

        // También verificar localStorage como backup
        const savedEmail = localStorage.getItem('sensipro_premium_email');
        if (savedEmail && savedEmail.includes('@')) {
          // Verificar contra la DB para asegurar
          verifyAsync(savedEmail);
          return;
        }

        setState(prev => ({ ...prev, isLoading: false }));
      } catch {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkCookie();
  }, [verifyAsync]);

  const verify = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    return verifyAsync(email);
  }, [verifyAsync]);

  const setPremiumEmail = useCallback((email: string) => {
    setPremiumEmailInternal(email);
    setState({
      isPremium: true,
      isLoading: false,
      email,
      activatedAt: new Date(),
    });
  }, []);

  const getEmail = useCallback(() => {
    return state.email || localStorage.getItem('sensipro_premium_email');
  }, [state.email]);

  const clearPremium = useCallback(() => {
    document.cookie = `${PREMIUM_COOKIE_NAME}=; path=/; max-age=0`;
    localStorage.removeItem('sensipro_premium_email');
    setState({
      isPremium: false,
      isLoading: false,
      email: null,
      activatedAt: null,
    });
  }, []);

  return {
    ...state,
    verify,
    setPremiumEmail,
    getEmail,
    clearPremium,
  };
}
