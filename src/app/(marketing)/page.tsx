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
import { InteractiveDemo } from '@/components/landing/interactive-demo';
import { SocialProofRibbon } from '@/components/landing/social-proof-ribbon';
import { StatsCounter } from '@/components/landing/stats-counter';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { CyberParticles } from '@/components/effects/cyber-particles';

export const metadata: Metadata = {
  title: 'Sensibilidades PRO — Generador #1 para Free Fire',
  description:
    'Genera las mejores sensibilidades para Free Fire basadas en el DPI real de tu pantalla. 503+ dispositivos, 26 marcas, 9 estilos, giroscopio calibrado. Gratis.',
  openGraph: {
    title: 'Sensibilidades PRO — Generador #1 para Free Fire',
    description:
      'Genera las mejores sensibilidades para Free Fire basadas en el DPI real de tu pantalla. 503+ dispositivos, 26 marcas, giroscopio calibrado.',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <>
      {/* 0. Background particles — fixed, z-0, pointer-events-none */}
      <CyberParticles />
      {/* 1. Hero — impacto, CTA, stats */}
      <HeroSection />
      {/* 2. Social Proof Ribbon — marquee doble fila */}
      <SocialProofRibbon />
      {/* 3. Stats Counter — 4 métricas con count-up */}
      <StatsCounter />
      {/* 4. ¿Cómo funciona? — 3 pasos cinematográficos */}
      <HowItWorksSection />
      {/* 5. Features — 10 features con tilt 3D */}
      <FeaturesSection />
      {/* 6. Marcas soportadas — 26 brands cloud */}
      <BrandsSection />
      {/* 7. Headshot Mode Showcase — feature estrella */}
      <HeadshotShowcase />
      {/* 8. Demo Interactivo — mini-generador funcional */}
      <InteractiveDemo />
      {/* 9. Dispositivos populares — carousel horizontal */}
      <DeviceShowcase />
      {/* 10. ARES AI Coach — preview estático */}
      <AresCoachShowcase />
      {/* 11. Testimonios — carousel horizontal */}
      <TestimonialsSection />
      {/* 12. Pricing — toggle mensual/anual + Pro animado */}
      <PricingSection />
      {/* 13. FAQ — 8 preguntas acordeón */}
      <FaqSection />
      {/* 14. CTA Final — cierre cinematográfico */}
      <CtaSection />
      {/* 15. Footer */}
      <LandingFooter />
    </>
  );
}
