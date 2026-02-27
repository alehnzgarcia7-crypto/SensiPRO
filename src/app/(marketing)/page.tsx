import type { Metadata } from 'next';

import { AresCoachShowcase } from '@/components/landing/ares-coach-showcase';
import { BrandsSection } from '@/components/landing/brands-section';
import { CtaSection } from '@/components/landing/cta-section';
import { DeviceShowcase } from '@/components/landing/device-showcase';
import { FaqSection } from '@/components/landing/faq-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { HeadshotShowcase } from '@/components/landing/headshot-showcase';
import { HeroSection } from '@/components/landing/hero-section';
import { HowItWorksSection } from '@/components/landing/how-it-works';
import { LandingFooter } from '@/components/landing/landing-footer';
import { PricingSection } from '@/components/landing/pricing-section';
import { ShowcaseDemo } from '@/components/landing/showcase-demo';
import { SocialProofBand } from '@/components/landing/social-proof-band';
import { TestimonialsSection } from '@/components/landing/testimonials-section';

export const metadata: Metadata = {
  title: 'Sensibilidades PRO — Generador #1 para Free Fire',
  description:
    'Genera las mejores sensibilidades para Free Fire basadas en las specs reales de tu dispositivo. 503+ dispositivos, 26 marcas, 9 estilos, giroscopio calibrado. Gratis.',
  openGraph: {
    title: 'Sensibilidades PRO — Generador #1 para Free Fire',
    description:
      'Genera las mejores sensibilidades para Free Fire basadas en las specs reales de tu dispositivo. 503+ dispositivos, 26 marcas, giroscopio calibrado.',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <>
      {/* 1. Hero — impacto, CTA, stats */}
      <HeroSection />
      {/* 2. Social Proof Band — marquee de actividad */}
      <SocialProofBand />
      {/* 3. ¿Cómo funciona? — 3 pasos */}
      <HowItWorksSection />
      {/* 4. Marcas soportadas */}
      <BrandsSection />
      {/* 5. Features — 10 cards */}
      <FeaturesSection />
      {/* 6. Showcase Demo — mockup animado */}
      <ShowcaseDemo />
      {/* 7. Headshot Mode Showcase — feature estrella */}
      <HeadshotShowcase />
      {/* 8. ARES AI Coach Showcase — demo interactivo */}
      <AresCoachShowcase />
      {/* 9. Testimonios — 8 reviews + rating promedio */}
      <TestimonialsSection />
      {/* 10. Dispositivos populares — 10 cards */}
      <DeviceShowcase />
      {/* 11. Pricing — 2 planes */}
      <PricingSection />
      {/* 12. FAQ — 8 preguntas */}
      <FaqSection />
      {/* 13. CTA Final — último empujón */}
      <CtaSection />
      {/* 14. Footer */}
      <LandingFooter />
    </>
  );
}
