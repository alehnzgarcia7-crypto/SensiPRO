'use client';

import { Check, X, Lock } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/cn';

import { ScrollReveal } from './scroll-reveal';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  priceDetail: string;
  annualNote: string | null;
  features: PlanFeature[];
  cta: string;
  href: string;
  highlighted: boolean;
  badge: string | null;
}

const plans: Plan[] = [
  {
    name: 'Gratis',
    price: '$0',
    priceDetail: 'siempre',
    annualNote: null,
    badge: null,
    features: [
      { text: 'Algoritmo v4.0 DPI-first básico', included: true },
      { text: '5 búsquedas por día', included: true },
      { text: '3 configuraciones guardadas', included: true },
      { text: '10 historial', included: true },
      { text: 'Headshot Mode básico (sensibilidad + Vertical Drag)', included: true },
      { text: 'Academia (guías gratuitas)', included: true },
      { text: '1 código HUD (2 dedos)', included: true },
      { text: '9 estilos de calibración', included: false },
      { text: 'Giroscopio calibrado por DPI', included: false },
      { text: 'Comparador de devices', included: false },
      { text: 'Exportar imagen', included: false },
      { text: 'HUD codes premium (3-5 dedos)', included: false },
      { text: 'Headshot Mode completo (15 armas, 5 técnicas, training plan)', included: false },
      { text: 'ARES AI Coach', included: false },
      { text: 'Academia premium', included: false },
    ],
    cta: 'EMPEZAR GRATIS',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$4.99',
    priceDetail: '/mes',
    annualNote: '$2.99/mes si pagas anual',
    badge: '⭐ POPULAR',
    features: [
      { text: 'Todo lo del plan Gratis', included: true },
      { text: 'Calibración forense completa + DPI custom', included: true },
      { text: 'Búsquedas ILIMITADAS', included: true },
      { text: 'Configuraciones guardadas ilimitadas', included: true },
      { text: 'Historial completo', included: true },
      { text: 'Giroscopio calibrado por DPI + panel', included: true },
      { text: 'Comparador de devices side-by-side', included: true },
      { text: 'Exportar como imagen para redes', included: true },
      { text: 'TODOS los códigos HUD (2-5 dedos)', included: true },
      { text: 'Headshot Mode COMPLETO + DPI custom (15 armas, 5 técnicas, training plan)', included: true },
      { text: 'Academia premium con todas las guías', included: true },
      { text: 'ARES AI Coach — mensajes ilimitados', included: true },
      { text: 'Actualizaciones prioritarias', included: true },
      { text: 'Sin publicidad', included: true },
    ],
    cta: 'COMENZAR PRO',
    href: '/pricing',
    highlighted: true,
  },
];

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const isHighlighted = plan.highlighted;

  const card = (
    <div
      className={cn(
        'glass-card p-7 md:p-8 relative flex flex-col h-full',
        isHighlighted && 'scale-[1.01] shadow-card-hover',
      )}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center px-4 py-1 rounded-full bg-fire-500/90 text-white text-xs font-ui font-bold whitespace-nowrap">
            {plan.badge}
          </span>
        </div>
      )}

      <h3 className="font-ui font-bold text-xl text-white">{plan.name}</h3>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-5xl font-heading font-black text-white">{plan.price}</span>
        <span className="text-sm text-slate-500 font-body">{plan.priceDetail}</span>
      </div>
      {plan.annualNote && (
        <p className="mt-1 text-xs text-success font-ui">{plan.annualNote}</p>
      )}

      <div className="my-6 h-px bg-white/5" />

      <ul className="space-y-3 flex-1">
        {plan.features.map((feat) => (
          <li key={feat.text} className="flex items-start gap-3 text-sm">
            {feat.included ? (
              <Check size={15} className="text-success shrink-0 mt-0.5" />
            ) : (
              <X size={15} className="text-slate-700 shrink-0 mt-0.5" />
            )}
            <span className={cn('font-body leading-snug', feat.included ? 'text-slate-300' : 'text-slate-600')}>
              {feat.text}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Link
          href={plan.href}
          className={cn(
            'flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-ui font-bold text-sm tracking-wider uppercase transition-all duration-300 min-h-[48px]',
            isHighlighted
              ? 'bg-gradient-to-r from-fire-500 to-ice-500 text-white shadow-glow-fire hover:scale-[1.02] hover:shadow-lg'
              : 'bg-transparent border border-ice-500/30 text-ice-400 hover:bg-ice-500/10',
          )}
        >
          {!isHighlighted && <Lock size={14} />}
          {plan.cta}
          {isHighlighted && <span>→</span>}
        </Link>
      </div>
    </div>
  );

  if (isHighlighted) {
    return (
      <ScrollReveal delay={index * 150}>
        <div className="animated-border-wrapper">
          <div className="animated-border-gradient" />
          <div className="animated-border-content">{card}</div>
        </div>
      </ScrollReveal>
    );
  }

  return (
    <ScrollReveal delay={index * 150}>
      {card}
    </ScrollReveal>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-white">
            Planes simples, sin sorpresas
          </h2>
          <p className="mt-3 text-center text-slate-400 font-ui text-lg">
            Empieza gratis. Mejora cuando quieras.
          </p>
        </ScrollReveal>

        <div className="mt-16 grid md:grid-cols-2 gap-6 items-start">
          {plans.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} index={i} />
          ))}
        </div>

        <ScrollReveal delay={400}>
          <div className="mt-8 text-center space-y-1">
            <p className="text-sm text-slate-500">
              🔒 Cancela cuando quieras. Sin contratos.
            </p>
            <p className="text-xs text-slate-600">
              💳 Pago seguro con Stripe
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
