'use client';

import dynamic from 'next/dynamic';
import { SessionProvider } from 'next-auth/react';

import { AnalyticsProvider } from '@/components/analytics/analytics-provider';
import { ToastProvider } from '@/components/ui/toast';
import { PremiumProvider } from '@/providers/premium-provider';

// Lazy load componentes pesados que NO se necesitan en el render inicial
// PaywallGlobal importa framer-motion + 12 lucide icons + PaywallModal completo
const PaywallGlobal = dynamic(
  () => import('@/components/paywall/paywall-global').then((m) => ({ default: m.PaywallGlobal })),
  { ssr: false, loading: () => null },
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <PremiumProvider>
          <AnalyticsProvider />
          {children}
          <PaywallGlobal />
        </PremiumProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
