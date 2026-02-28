'use client';

import { PremiumBlur } from '@/components/paywall';

interface PremiumGuideContentProps {
  children: React.ReactNode;
}

export function PremiumGuideContent({ children }: PremiumGuideContentProps) {
  return (
    <PremiumBlur source="academy" intensity={12}>
      {children}
    </PremiumBlur>
  );
}
