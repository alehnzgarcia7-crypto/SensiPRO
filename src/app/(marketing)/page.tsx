import type { Metadata } from 'next';

import { HeroSection } from '@/components/landing/hero-section';
import { SocialProofBand } from '@/components/landing/social-proof-band';
import { HowItWorksSection } from '@/components/landing/how-it-works';
import { BrandsSection } from '@/components/landing/brands-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { ShowcaseDemo } from '@/components/landing/showcase-demo';
import { HeadshotShowcase } from '@/components/landing/headshot-showcase';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { DeviceShowcase } from '@/components/landing/device-showcase';
import { PricingSection } from '@/components/landing/pricing-section';
import { FaqSection } from '@/components/landing/faq-section';
import { CtaSection } from '@/components/landing/cta-section';
import { LandingFooter } from '@/components/landing/landing-footer';

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
      {/* 8. Testimonios — 8 reviews + rating promedio */}
      <TestimonialsSection />
      {/* 9. Dispositivos populares — 10 cards */}
      <DeviceShowcase />
      {/* 10. Pricing — 2 planes */}
      <PricingSection />
      {/* 11. FAQ — 8 preguntas */}
      <FaqSection />
      {/* 12. CTA Final — último empujón */}
      <CtaSection />
      {/* 13. Footer */}
      <LandingFooter />
    </>
  );
}
