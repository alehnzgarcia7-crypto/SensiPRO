'use client';

import { SessionProvider } from 'next-auth/react';

import { PaywallGlobal } from '@/components/paywall/paywall-global';
import { ToastProvider } from '@/components/ui/toast';
import { PremiumProvider } from '@/providers/premium-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <PremiumProvider>
          {children}
          <PaywallGlobal />
        </PremiumProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
