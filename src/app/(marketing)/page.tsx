import { Suspense } from 'react';
import type { Metadata } from 'next';

import { HeroSection } from '@/components/landing/hero-section';
import { StatsSection } from '@/components/landing/stats-section';
import { HowItWorksSection } from '@/components/landing/how-it-works';
import { BrandsSection } from '@/components/landing/brands-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { DevicePreviewSection } from '@/components/landing/device-preview';
import { PricingSection } from '@/components/landing/pricing-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { FaqSection } from '@/components/landing/faq-section';
import { CtaSection } from '@/components/landing/cta-section';

export const metadata: Metadata = {
  title: 'Sensibilidades PRO — Generador #1 para Free Fire',
  description:
    'Genera las mejores sensibilidades para Free Fire basadas en las specs reales de tu dispositivo. 500+ dispositivos, 3 estilos de juego, giroscopio calibrado.',
  openGraph: {
    title: 'Sensibilidades PRO — Generador #1 para Free Fire',
    description:
      'Genera las mejores sensibilidades para Free Fire basadas en las specs reales de tu dispositivo.',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <Suspense>
        <StatsSection />
      </Suspense>
      <HowItWorksSection />
      <BrandsSection />
      <FeaturesSection />
      <Suspense>
        <DevicePreviewSection />
      </Suspense>
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
