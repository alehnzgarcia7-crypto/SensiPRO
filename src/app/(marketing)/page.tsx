import type { Metadata } from 'next';

import { CyberParticles } from '@/components/effects/cyber-particles';
import { AresCoachShowcase } from '@/components/landing/ares-coach-showcase';
import { BlurTensionSection } from '@/components/landing/blur-tension-section';
import { BrandsSection } from '@/components/landing/brands-section';
import { CtaSection } from '@/components/landing/cta-section';
import { DifferentialSection } from '@/components/landing/differential-section';
import { FaqSection } from '@/components/landing/faq-section';
import { HeroSection } from '@/components/landing/hero-section';
import { HowItWorksSection } from '@/components/landing/how-it-works';
import { HowSensiproWorksCta } from '@/components/landing/how-sensipro-works-cta';
import { PremiumModulesSection } from '@/components/landing/premium-modules-section';
// PricingSection oculta — el usuario ve el precio solo en el paywall del generador
// import { PricingSection } from '@/components/landing/pricing-section';
import { ProblemSection } from '@/components/landing/problem-section';

export const metadata: Metadata = {
  title: 'SensiPRO — Generador de Sensibilidad #1 para Free Fire 2026',
  description:
    'Genera la sensibilidad perfecta de Free Fire para TU celular. 644+ dispositivos, 26 marcas, calibración por DPI real. Deja de copiar y empieza a dar todo rojo.',
  openGraph: {
    title: 'SensiPRO — Generador de Sensibilidad #1 para Free Fire 2026',
    description:
      'Genera la sensibilidad perfecta de Free Fire para TU celular. 644+ dispositivos, 26 marcas, calibración por DPI real.',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <>
      {/* Background particles */}
      <CyberParticles />
      {/* 1. Hero — Dolor + promesa + CTA al generador */}
      <HeroSection />
      {/* 2. Problema — "No es tu aim. Es tu configuración." */}
      <ProblemSection />
      {/* 3. Cómo funciona — 3 pasos, sin revelar valores */}
      <HowItWorksSection />
      {/* 4. Diferencial — Calibración real vs genéricas */}
      <DifferentialSection />
      {/* 4.5. CTA — "¿Quieres saber cómo funciona?" → /academy/como-funciona */}
      <HowSensiproWorksCta />
      {/* 5. Tensión/Blur — Crear deseo sin regalar */}
      <BlurTensionSection />
      {/* 6. Módulos premium — Headshot, HUD, Academia */}
      <PremiumModulesSection />
      {/* 7. Compatibilidad — Marcas y dispositivos */}
      <BrandsSection />
      {/* 8. Pricing — Oculto en landing para que el usuario vea el precio solo en el paywall */}
      {/* <PricingSection /> */}
      {/* 9. FAQ — Preguntas frecuentes */}
      <FaqSection />
      {/* ARES AI Coach — Próximamente (pequeño, no protagonista) */}
      <AresCoachShowcase />
      {/* 10. CTA Final — Cierre con acción */}
      <CtaSection />
    </>
  );
}
