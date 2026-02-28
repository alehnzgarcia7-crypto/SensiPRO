/**
 * Componente global que renderiza el PaywallModal y UnlockAnimation.
 * Se monta en el layout root. Lee del PremiumProvider.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';

import { usePremiumContext } from '@/providers/premium-provider';

import { PaywallModal } from './paywall-modal';
import { UnlockAnimation } from './unlock-animation';

export function PaywallGlobal() {
  const { isPremium } = usePremiumContext();
  const [showUnlock, setShowUnlock] = useState(false);
  const wasNotPremium = useRef(true);

  // Detectar transición de no-premium → premium
  useEffect(() => {
    if (isPremium && wasNotPremium.current) {
      setShowUnlock(true);
    }
    wasNotPremium.current = !isPremium;
  }, [isPremium]);

  return (
    <>
      <PaywallModal />
      <UnlockAnimation
        show={showUnlock}
        onComplete={() => setShowUnlock(false)}
      />
    </>
  );
}
