/**
 * PremiumProvider — Contexto global de estado premium
 *
 * Envuelve la app para que cualquier componente pueda
 * acceder al estado premium con usePremiumContext().
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

import { usePremium } from '@/hooks/use-premium';
import { isAdminEmail } from '@/lib/constants/admin';

interface PaywallContext {
  device?: string;
  fingerCount?: number;
  style?: string;
  source: 'generator' | 'headshot' | 'academy' | 'pricing' | 'landing';
  revealedGeneral?: number;
}

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  email: string | null;

  isPaywallOpen: boolean;
  paywallContext: PaywallContext | null;
  showPaywall: (context: PaywallContext) => void;
  hidePaywall: () => void;

  isEmailCaptured: boolean;
  capturedEmail: string | null;
  setCapturedEmail: (email: string) => void;

  unlock: (email: string) => void;
  verifyPremium: (email: string) => Promise<boolean>;
}

const PremiumContext = createContext<PremiumContextType | null>(null);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const premium = usePremium();

  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [paywallContext, setPaywallContext] = useState<PaywallContext | null>(null);
  const [isEmailCaptured, setIsEmailCaptured] = useState(false);
  const [capturedEmail, setCapturedEmailState] = useState<string | null>(null);

  // Recuperar email capturado de sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('sensipro_captured_email');
      if (saved) {
        setCapturedEmailState(saved);
        setIsEmailCaptured(true);
      }
    } catch {}
  }, []);

  // Admin siempre tiene premium — nunca muestra paywall
  const isAdmin = isAdminEmail(premium.email);
  const effectiveIsPremium = premium.isPremium || isAdmin;

  const showPaywall = useCallback((context: PaywallContext) => {
    if (effectiveIsPremium) return;
    setPaywallContext(context);
    setIsPaywallOpen(true);
    document.body.style.overflow = 'hidden';
  }, [effectiveIsPremium]);

  const hidePaywall = useCallback(() => {
    setIsPaywallOpen(false);
    setPaywallContext(null);
    document.body.style.overflow = '';
  }, []);

  const setCapturedEmail = useCallback((email: string) => {
    setCapturedEmailState(email);
    setIsEmailCaptured(true);
    try {
      sessionStorage.setItem('sensipro_captured_email', email);
    } catch {}

    // Enviar al backend para remarketing
    fetch('/api/payments/capture-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        source: paywallContext?.source || 'generator',
        device: paywallContext?.device,
        style: paywallContext?.style,
        fingerCount: paywallContext?.fingerCount,
      }),
    }).catch(() => {});
  }, [paywallContext]);

  const unlock = useCallback((email: string) => {
    premium.setPremiumEmail(email);
    setIsPaywallOpen(false);
    setPaywallContext(null);
    document.body.style.overflow = '';
  }, [premium]);

  return (
    <PremiumContext.Provider
      value={{
        isPremium: effectiveIsPremium,
        isLoading: premium.isLoading,
        email: premium.email,
        isPaywallOpen,
        paywallContext,
        showPaywall,
        hidePaywall,
        isEmailCaptured,
        capturedEmail,
        setCapturedEmail,
        unlock,
        verifyPremium: premium.verify,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremiumContext(): PremiumContextType {
  const ctx = useContext(PremiumContext);
  if (!ctx) {
    throw new Error('usePremiumContext debe usarse dentro de PremiumProvider');
  }
  return ctx;
}
