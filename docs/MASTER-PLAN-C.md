# ARES SensiPRO — MASTER PLAN C
# ══════════════════════════════════════════════════════════════
# FASE 2 — UI/UX ELITE GAMING (8 scripts: ARES-200 → ARES-207)
# "El diseño que hace que SystemWoods parezca de 2010"
# ══════════════════════════════════════════════════════════════
#
# Esta fase construye todas las páginas y componentes de UI
# que el usuario final ve e interactúa. Cada página es mobile-first,
# dark-mode only, con animaciones gaming y Fire & Ice theme.
# ══════════════════════════════════════════════════════════════

## Instrucciones para Claude Code

1. **Lee CLAUDE.md** para convenciones, tema, y componentes disponibles
2. **Lee PROGRESS.md** para el estado actual
3. **Usa los componentes de @/components/ui/** — ya están creados en ARES-004
4. **Mobile-first**: diseña para 375px primero, luego escala
5. **Touch targets**: mínimo 44×44px en todo elemento interactivo
6. **Animaciones**: usa framer-motion, respeta `prefers-reduced-motion`
7. **Después de terminar**: actualiza PROGRESS.md, git commit + push

---

# ████████████████████████████████████████████████████████████
# █                                                          █
# █   FASE 2 — UI/UX ELITE GAMING                           █
# █   Scripts 19-26 | La experiencia visual definitiva       █
# █                                                          █
# ████████████████████████████████████████████████████████████

---

## ARES-200-landing-page

**Fase:** 2 | **Prioridad:** CRÍTICO
**Dependencias:** ARES-004-design-system, ARES-100-device-database
**Descripción:** Landing page épica con 10 secciones: Hero, Stats counter, How it Works, Brand carousel, Features grid, Device preview, Pricing, Testimonials, FAQ, CTA final. Dark gaming aesthetic con partículas, gradients, y animaciones scroll-triggered.

### Archivos a crear:

```
[ARCHIVO] src/app/(marketing)/layout.tsx
```
```tsx
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

```
[ARCHIVO] src/app/(marketing)/page.tsx
```
```tsx
import { Suspense } from 'react';

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

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <Suspense><StatsSection /></Suspense>
      <HowItWorksSection />
      <BrandsSection />
      <FeaturesSection />
      <Suspense><DevicePreviewSection /></Suspense>
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
```

```
[ARCHIVO] src/components/landing/hero-section.tsx
```
```tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fire-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ice-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full bg-fire-500/10 border border-fire-500/20 px-4 py-1.5 mb-8"
        >
          <Zap size={14} className="text-fire-500" />
          <span className="text-xs font-ui font-semibold text-fire-400 tracking-wider uppercase">
            Generador #1 para Free Fire
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-display font-black leading-tight"
        >
          <span className="text-white">Sensibilidades</span>
          <br />
          <span className="text-gradient-fire-ice">basadas en tu hardware</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto"
        >
          No más sensibilidades genéricas. Nuestro algoritmo analiza las specs reales
          de tu celular — Hz, RAM, panel, chipset — y genera la configuración perfecta
          para <strong className="text-white">tu</strong> dispositivo.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/generator">
            <Button variant="primary" size="lg" rightIcon={<ChevronRight size={18} />}>
              Generar Gratis
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="ghost" size="lg">
              ¿Cómo funciona?
            </Button>
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 flex items-center justify-center gap-6 text-sm text-slate-500"
        >
          <span>500+ dispositivos</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span>3 estilos de juego</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span>100% gratis</span>
        </motion.div>
      </div>
    </section>
  );
}
```

```
[ARCHIVO] src/components/landing/stats-section.tsx
```
```tsx
import { prisma } from '@ares/database';

import { CountUp } from '@/components/effects/count-up';

async function getStats() {
  const [deviceCount, brandCount] = await Promise.all([
    prisma.device.count(),
    prisma.device.groupBy({ by: ['brand'] }).then((b) => b.length),
  ]);
  return { deviceCount, brandCount };
}

export async function StatsSection() {
  const stats = await getStats();

  const items = [
    { value: stats.deviceCount, suffix: '+', label: 'Dispositivos' },
    { value: stats.brandCount, label: 'Marcas' },
    { value: 3, label: 'Estilos de juego' },
    { value: 6, label: 'Valores de sensibilidad' },
  ];

  return (
    <section className="py-16 border-y border-white/5">
      <div className="mx-auto max-w-5xl px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <div className="text-3xl md:text-4xl font-display font-black text-gradient-fire-ice">
              <CountUp end={item.value} suffix={item.suffix} />
            </div>
            <div className="mt-1 text-sm text-slate-500 font-ui">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

```
[ARCHIVO] src/components/landing/how-it-works.tsx
```
```tsx
'use client';

import { motion } from 'framer-motion';
import { Smartphone, Cpu, Gauge } from 'lucide-react';

const steps = [
  {
    icon: Smartphone,
    title: '1. Elige tu dispositivo',
    description: 'Busca tu celular entre 500+ dispositivos. Tenemos Samsung, Xiaomi, Redmi, POCO, Motorola, Apple, y más.',
    color: 'text-fire-500',
    glow: 'shadow-glow-fire',
  },
  {
    icon: Cpu,
    title: '2. Selecciona tu estilo',
    description: 'Agresivo para rushear, Balanceado para todo, o Francotirador para largo alcance. Cada uno optimiza diferentes valores.',
    color: 'text-ice-500',
    glow: 'shadow-glow-ice',
  },
  {
    icon: Gauge,
    title: '3. Obtén tu config',
    description: 'Nuestro algoritmo analiza Hz, RAM, panel y chipset de tu device para calcular los 6 valores de sensibilidad perfectos.',
    color: 'text-success',
    glow: 'shadow-glow-success',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-white">
          ¿Cómo funciona?
        </h2>
        <p className="mt-3 text-center text-slate-400 max-w-lg mx-auto">
          Tres pasos simples para obtener la sensibilidad perfecta para tu dispositivo
        </p>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="glass p-8 text-center"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-background-elevated ${step.glow} mb-6`}>
                  <Icon size={28} className={step.color} />
                </div>
                <h3 className="text-lg font-display font-bold text-white">{step.title}</h3>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

```
[ARCHIVO] src/components/landing/brands-section.tsx
```
```tsx
const brands = [
  'Samsung', 'Apple', 'Xiaomi', 'Redmi', 'POCO', 'Motorola',
  'Realme', 'OPPO', 'Vivo', 'OnePlus', 'Infinix', 'Tecno',
  'Honor', 'Nothing', 'Google', 'Huawei',
];

export function BrandsSection() {
  return (
    <section className="py-16 border-y border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4">
        <p className="text-center text-sm text-slate-500 font-ui uppercase tracking-wider mb-8">
          16+ marcas soportadas
        </p>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          {brands.map((brand) => (
            <span
              key={brand}
              className="text-lg font-display font-semibold text-slate-600 hover:text-white transition-colors cursor-default"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
```

```
[ARCHIVO] src/components/landing/features-section.tsx
```
```tsx
'use client';

import { motion } from 'framer-motion';
import { Zap, BarChart3, Gamepad2, Shield, Share2, Trophy } from 'lucide-react';

const features = [
  { icon: Zap, title: 'Basado en Hardware Real', description: 'Analizamos Hz, RAM, panel y chipset de tu dispositivo. No sensibilidades genéricas.', color: 'text-fire-500' },
  { icon: BarChart3, title: '3 Estilos de Juego', description: 'Agresivo, Balanceado y Francotirador. Cada uno optimiza diferentes aspectos del combate.', color: 'text-ice-500' },
  { icon: Gamepad2, title: 'Giroscopio Pro', description: 'Valores de giroscopio calibrados por tipo de panel y tier de dispositivo.', color: 'text-neon-green' },
  { icon: Shield, title: 'Comparador de Devices', description: 'Compara 2 dispositivos side-by-side: specs, sensibilidades, y veredicto.', color: 'text-neon-purple' },
  { icon: Share2, title: 'Comparte tu Config', description: 'Exporta como imagen para Instagram/Stories o comparte por WhatsApp y Telegram.', color: 'text-warning' },
  { icon: Trophy, title: 'Comunidad y Torneos', description: 'Rankings, torneos con premios, y configs compartidas por otros jugadores.', color: 'text-tier-vip' },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-white">
          Todo lo que necesitas
        </h2>
        <p className="mt-3 text-center text-slate-400">
          Más que un generador — una plataforma gaming completa
        </p>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass-hover p-6"
              >
                <Icon size={24} className={feat.color} />
                <h3 className="mt-4 font-display font-bold text-white">{feat.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{feat.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

```
[ARCHIVO] src/components/landing/device-preview.tsx
```
```tsx
import { prisma } from '@ares/database';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';

async function getPopularDevices() {
  return prisma.device.findMany({
    where: { isPopular: true },
    take: 8,
    orderBy: { brand: 'asc' },
    select: { id: true, brand: true, model: true, slug: true, tier: true, screenHz: true, ramGb: true },
  });
}

export async function DevicePreviewSection() {
  const devices = await getPopularDevices();

  return (
    <section className="py-20 px-4 border-y border-white/5">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-white">
          Dispositivos populares
        </h2>
        <p className="mt-3 text-center text-slate-400">
          Algunos de los 500+ dispositivos que soportamos
        </p>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {devices.map((device) => (
            <Link
              key={device.id}
              href={`/devices/${device.slug}`}
              className="glass-hover p-4 text-center group"
            >
              <p className="text-xs text-slate-500 font-ui">{device.brand}</p>
              <p className="mt-1 font-display font-bold text-white group-hover:text-fire-400 transition-colors text-sm">
                {device.model}
              </p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <Badge variant={device.tier === 'GAMING' ? 'vip' : device.tier === 'HIGH' ? 'premium' : 'free'} size="sm">
                  {device.tier}
                </Badge>
                <span className="text-[10px] text-slate-600">{device.screenHz}Hz</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/generator" className="text-sm text-fire-500 hover:text-fire-400 font-medium">
            Ver todos los dispositivos →
          </Link>
        </div>
      </div>
    </section>
  );
}
```

```
[ARCHIVO] src/components/landing/pricing-section.tsx
```
```tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Gratis',
    price: '$0',
    period: 'siempre',
    variant: 'free' as const,
    features: [
      { text: 'Estilo Balanceado', included: true },
      { text: '5 búsquedas por día', included: true },
      { text: '3 favoritos', included: true },
      { text: '10 historial', included: true },
      { text: 'Todos los estilos', included: false },
      { text: 'Giroscopio', included: false },
      { text: 'Comparador', included: false },
      { text: 'Exportar imagen', included: false },
    ],
    cta: 'Empezar Gratis',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Premium',
    price: '$49',
    period: 'MXN/mes',
    variant: 'premium' as const,
    features: [
      { text: '3 estilos de juego', included: true },
      { text: 'Búsquedas ilimitadas', included: true },
      { text: 'Favoritos ilimitados', included: true },
      { text: 'Historial completo', included: true },
      { text: 'Giroscopio', included: true },
      { text: 'Comparador', included: true },
      { text: 'Exportar imagen', included: true },
      { text: 'Sin anuncios', included: false },
    ],
    cta: 'Obtener Premium',
    href: '/pricing',
    highlighted: true,
  },
  {
    name: 'VIP',
    price: '$99',
    period: 'MXN/mes',
    variant: 'vip' as const,
    features: [
      { text: 'Todo de Premium', included: true },
      { text: 'Sin anuncios', included: true },
      { text: 'Torneos VIP', included: true },
      { text: 'Temas exclusivos', included: true },
      { text: 'Badge VIP', included: true },
      { text: 'Academia completa', included: true },
      { text: 'Soporte prioritario', included: true },
      { text: 'Early access', included: true },
    ],
    cta: 'Ser VIP',
    href: '/pricing',
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-white">
          Planes simples, sin sorpresas
        </h2>
        <p className="mt-3 text-center text-slate-400">
          Empieza gratis. Mejora cuando quieras.
        </p>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`glass p-8 relative ${plan.highlighted ? 'border-fire-500/30 shadow-glow-fire' : ''}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-fire-ice text-white text-xs font-ui font-bold px-4 py-1 rounded-full">
                  Más Popular
                </div>
              )}

              <h3 className="font-display font-bold text-xl text-white">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-display font-black text-white">{plan.price}</span>
                <span className="text-sm text-slate-500">{plan.period}</span>
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feat) => (
                  <li key={feat.text} className="flex items-center gap-3 text-sm">
                    {feat.included ? (
                      <Check size={16} className="text-success shrink-0" />
                    ) : (
                      <X size={16} className="text-slate-600 shrink-0" />
                    )}
                    <span className={feat.included ? 'text-slate-300' : 'text-slate-600'}>
                      {feat.text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link href={plan.href}>
                  <Button
                    variant={plan.highlighted ? 'primary' : 'secondary'}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

```
[ARCHIVO] src/components/landing/testimonials-section.tsx
```
```tsx
'use client';

import { motion } from 'framer-motion';

import { Badge } from '@/components/ui/badge';

const testimonials = [
  {
    name: 'Carlos M.',
    tier: 'premium' as const,
    device: 'Redmi Note 13 Pro',
    text: 'Probé mil configs de YouTube y ninguna funcionaba para mi cel. Aquí generé la mía en 10 segundos y la diferencia es brutal.',
  },
  {
    name: 'Valentina R.',
    tier: 'vip' as const,
    device: 'Samsung Galaxy A54',
    text: 'El giroscopio de este generador es otro nivel. Mis headshots subieron un 40% desde que uso esta config.',
  },
  {
    name: 'Diego L.',
    tier: 'free' as const,
    device: 'POCO X5 Pro',
    text: 'Lo mejor es que es gratis y funciona. Ni siquiera necesité pagar para notar la mejora en mi gameplay.',
  },
  {
    name: 'Sofía G.',
    tier: 'premium' as const,
    device: 'iPhone 15 Pro',
    text: 'El comparador me ayudó a decidir entre el 15 Pro y el S24. Compré el iPhone y la config ya estaba lista.',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 px-4 border-y border-white/5">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-white">
          Lo que dicen los jugadores
        </h2>

        <div className="mt-12 grid sm:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass p-6"
            >
              <p className="text-sm text-slate-300 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="font-ui font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.device}</p>
                </div>
                <Badge variant={t.tier} size="sm">{t.tier.toUpperCase()}</Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

```
[ARCHIVO] src/components/landing/faq-section.tsx
```
```tsx
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/cn';

const faqs = [
  { q: '¿Cómo funciona el generador de sensibilidades?', a: 'Nuestro algoritmo analiza las especificaciones reales de tu dispositivo (refresh rate, tamaño de pantalla, RAM, tipo de panel y tier) para calcular los 6 valores óptimos de sensibilidad. No usamos valores genéricos — cada dispositivo recibe una configuración única.' },
  { q: '¿Es realmente gratis?', a: 'Sí, puedes generar sensibilidades con el estilo Balanceado completamente gratis. Los estilos Agresivo y Francotirador, giroscopio, comparador, y exportar imagen son funciones Premium ($49 MXN/mes).' },
  { q: '¿Qué tan preciso es el algoritmo?', a: 'Cada dispositivo en nuestra base tiene specs verificadas de fuentes como GSMArena. El algoritmo usa pesos científicamente calibrados para Hz, RAM, panel y tier. Miles de jugadores usan nuestras configs diariamente.' },
  { q: '¿Soportan mi dispositivo?', a: 'Tenemos 500+ dispositivos de 16+ marcas incluyendo Samsung, Xiaomi, Redmi, POCO, Motorola, Apple, Realme, Infinix, Tecno, y más. Si tu dispositivo no está, contáctanos y lo agregamos en 24 horas.' },
  { q: '¿Qué diferencia hay entre los 3 estilos?', a: 'Agresivo: sensibilidades altas para giros rápidos y rush. Balanceado: valores medios para todo tipo de combate. Francotirador: valores bajos con scopes altos para precisión a larga distancia.' },
  { q: '¿Puedo usar la config en ranked?', a: 'Absolutamente. Las configs son 100% legítimas — solo ajustan los valores de sensibilidad que ya existen en el juego. No es hack, mod ni truco.' },
  { q: '¿Cómo cancelo Premium/VIP?', a: 'Puedes cancelar en cualquier momento desde tu perfil. Tu acceso Premium/VIP se mantiene hasta el final del período pagado.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left min-h-[44px]"
      >
        <span className="font-ui font-medium text-white text-sm pr-4">{q}</span>
        <ChevronDown
          size={18}
          className={cn('shrink-0 text-slate-500 transition-transform', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-slate-400 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqSection() {
  return (
    <section id="faq" className="py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-white">
          Preguntas frecuentes
        </h2>
        <div className="mt-12">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

```
[ARCHIVO] src/components/landing/cta-section.tsx
```
```tsx
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fire-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl md:text-5xl font-display font-black text-white">
          Deja de perder por{' '}
          <span className="text-gradient-fire-ice">mala configuración</span>
        </h2>
        <p className="mt-4 text-lg text-slate-400">
          Genera la sensibilidad perfecta para tu dispositivo en 10 segundos. Gratis.
        </p>
        <div className="mt-8">
          <Link href="/generator">
            <Button variant="primary" size="lg" rightIcon={<ChevronRight size={18} />}>
              Generar mi sensibilidad
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
ls src/components/landing/*.tsx | wc -l  # debe ser 10
npm run dev  # verificar visualmente en localhost:3000
```

### Commit: `feat(landing): ARES-200 landing page — 10 sections: hero, stats, how-it-works, brands, features, pricing, FAQ, CTA`

---

## ARES-201-generator-ui

**Fase:** 2 | **Prioridad:** CRÍTICO
**Dependencias:** ARES-004, ARES-100, ARES-101, ARES-103
**Descripción:** La página principal del generador con flujo de 3 pasos: 1) Seleccionar marca → 2) Seleccionar modelo → 3) Elegir estilo. Usa Zustand para estado del flujo, muestra el panel de resultados al generar.

### Archivos a crear:

```
[ARCHIVO] src/stores/generator.store.ts
```
```typescript
import { create } from 'zustand';
import type { SensitivityStyle, DeviceTier } from '@prisma/client';

interface SelectedDevice {
  id: string;
  brand: string;
  model: string;
  slug: string;
  tier: DeviceTier;
  screenHz: number;
  ramGb: number;
}

interface GeneratorResult {
  sensitivity: {
    general: number;
    redPoint: number;
    scope2x: number;
    scope4x: number;
    sniperScope: number;
    freeView: number;
  };
  gyroscope: {
    gyroGeneral: number;
    gyroRedPoint: number;
    gyroScope2x: number;
    gyroScope4x: number;
    gyroSniper: number;
    gyroFreeView: number;
  } | null;
  meta: {
    performanceScore: number;
    styleApplied: SensitivityStyle;
    deviceTier: DeviceTier;
    algorithm: string;
  };
}

interface GeneratorStore {
  step: 1 | 2 | 3;
  selectedBrand: string | null;
  selectedDevice: SelectedDevice | null;
  selectedStyle: SensitivityStyle;
  includeGyro: boolean;
  result: GeneratorResult | null;
  isLoading: boolean;
  error: string | null;

  selectBrand: (brand: string) => void;
  selectDevice: (device: SelectedDevice) => void;
  selectStyle: (style: SensitivityStyle) => void;
  setIncludeGyro: (value: boolean) => void;
  setResult: (result: GeneratorResult) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  goBack: () => void;
}

const initialState = {
  step: 1 as const,
  selectedBrand: null,
  selectedDevice: null,
  selectedStyle: 'BALANCED' as SensitivityStyle,
  includeGyro: false,
  result: null,
  isLoading: false,
  error: null,
};

export const useGeneratorStore = create<GeneratorStore>((set) => ({
  ...initialState,

  selectBrand: (brand) => set({ selectedBrand: brand, step: 2, selectedDevice: null, result: null }),
  selectDevice: (device) => set({ selectedDevice: device, step: 3, result: null }),
  selectStyle: (style) => set({ selectedStyle: style }),
  setIncludeGyro: (value) => set({ includeGyro: value }),
  setResult: (result) => set({ result, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading, error: null }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set(initialState),
  goBack: () =>
    set((state) => {
      if (state.step === 3) return { step: 2, result: null };
      if (state.step === 2) return { step: 1, selectedBrand: null, selectedDevice: null, result: null };
      return state;
    }),
}));
```

```
[ARCHIVO] src/app/(app)/layout.tsx
```
```tsx
import { Navbar } from '@/components/layout/navbar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Footer } from '@/components/layout/footer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-20 md:pb-0">{children}</main>
      <MobileNav />
      <div className="hidden md:block"><Footer /></div>
    </>
  );
}
```

```
[ARCHIVO] src/app/(app)/generator/page.tsx
```
```tsx
import type { Metadata } from 'next';

import { GeneratorFlow } from '@/components/generator/generator-flow';

export const metadata: Metadata = {
  title: 'Generador de Sensibilidades',
  description: 'Genera las mejores sensibilidades para Free Fire basadas en las specs reales de tu dispositivo.',
};

export default function GeneratorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <GeneratorFlow />
    </div>
  );
}
```

```
[ARCHIVO] src/components/generator/generator-flow.tsx
```
```tsx
'use client';

import { ArrowLeft } from 'lucide-react';

import { useGeneratorStore } from '@/stores/generator.store';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

import { BrandStep } from './steps/brand-step';
import { DeviceStep } from './steps/device-step';
import { StyleStep } from './steps/style-step';
import { ResultPanel } from './result-panel';

export function GeneratorFlow() {
  const { step, result, goBack, reset } = useGeneratorStore();

  if (result) {
    return <ResultPanel onReset={reset} />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {step > 1 && (
          <button onClick={goBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors touch-target">
            <ArrowLeft size={20} className="text-slate-400" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-white">Generador</h1>
          <p className="text-sm text-slate-500">Paso {step} de 3</p>
        </div>
      </div>

      {/* Progress */}
      <Progress value={step} max={3} size="sm" color="gradient" className="mb-8" />

      {/* Steps */}
      {step === 1 && <BrandStep />}
      {step === 2 && <DeviceStep />}
      {step === 3 && <StyleStep />}
    </div>
  );
}
```

```
[ARCHIVO] src/components/generator/steps/brand-step.tsx
```
```tsx
'use client';

import { useState, useEffect } from 'react';

import { useGeneratorStore } from '@/stores/generator.store';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

interface Brand {
  name: string;
  slug: string;
  count: number;
}

export function BrandStep() {
  const { selectBrand } = useGeneratorStore();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/devices/brands')
      .then((r) => r.json())
      .then((data) => setBrands(data.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
    : brands;

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-white mb-2">
        ¿Cuál es tu marca?
      </h2>
      <p className="text-sm text-slate-400 mb-6">
        Selecciona la marca de tu celular
      </p>

      <Input
        placeholder="Buscar marca..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6"
      />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((brand) => (
            <button
              key={brand.slug}
              onClick={() => selectBrand(brand.name)}
              className={cn(
                'glass-hover p-4 text-center transition-all min-h-[44px]',
                'hover:border-fire-500/30',
              )}
            >
              <p className="font-display font-bold text-white">{brand.name}</p>
              <p className="text-xs text-slate-500 mt-1">{brand.count} dispositivos</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

```
[ARCHIVO] src/components/generator/steps/device-step.tsx
```
```tsx
'use client';

import { useState, useEffect } from 'react';

import { useGeneratorStore } from '@/stores/generator.store';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

interface DeviceItem {
  id: string;
  brand: string;
  model: string;
  slug: string;
  tier: string;
  screenHz: number;
  ramGb: number;
  isPopular: boolean;
}

export function DeviceStep() {
  const { selectedBrand, selectDevice } = useGeneratorStore();
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedBrand) return;
    fetch(`/api/devices?brand=${encodeURIComponent(selectedBrand)}&limit=100`)
      .then((r) => r.json())
      .then((data) => setDevices(data.data ?? []))
      .finally(() => setLoading(false));
  }, [selectedBrand]);

  const filtered = search
    ? devices.filter((d) => d.model.toLowerCase().includes(search.toLowerCase()))
    : devices;

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-white mb-2">
        Elige tu {selectedBrand}
      </h2>
      <p className="text-sm text-slate-400 mb-6">
        Selecciona tu modelo exacto
      </p>

      <Input
        placeholder={`Buscar modelo ${selectedBrand}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6"
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rect" className="h-16" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((device) => (
            <button
              key={device.id}
              onClick={() => selectDevice({
                id: device.id,
                brand: device.brand,
                model: device.model,
                slug: device.slug,
                tier: device.tier as 'LOW' | 'MID' | 'HIGH' | 'GAMING',
                screenHz: device.screenHz,
                ramGb: device.ramGb,
              })}
              className={cn(
                'w-full glass-hover p-4 flex items-center justify-between min-h-[44px]',
              )}
            >
              <div className="text-left">
                <p className="font-display font-bold text-white text-sm">{device.model}</p>
                <p className="text-xs text-slate-500">{device.screenHz}Hz • {device.ramGb}GB RAM</p>
              </div>
              <div className="flex items-center gap-2">
                {device.isPopular && (
                  <span className="text-[10px] text-fire-400 font-ui">🔥 Popular</span>
                )}
                <Badge
                  variant={device.tier === 'GAMING' ? 'vip' : device.tier === 'HIGH' ? 'premium' : 'free'}
                  size="sm"
                >
                  {device.tier}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

```
[ARCHIVO] src/components/generator/steps/style-step.tsx
```
```tsx
'use client';

import { Sword, Target, Crosshair } from 'lucide-react';
import type { SensitivityStyle } from '@prisma/client';

import { useGeneratorStore } from '@/stores/generator.store';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/cn';

const styles: { key: SensitivityStyle; name: string; icon: typeof Sword; description: string; color: string; border: string }[] = [
  { key: 'AGGRESSIVE', name: 'Agresivo', icon: Sword, description: 'Giros rápidos, aim agresivo. Para rushers.', color: 'text-style-aggressive', border: 'border-style-aggressive/30' },
  { key: 'BALANCED', name: 'Balanceado', icon: Target, description: 'Equilibrio perfecto. Para todos.', color: 'text-style-balanced', border: 'border-style-balanced/30' },
  { key: 'SNIPER', name: 'Francotirador', icon: Crosshair, description: 'Máxima precisión en scopes.', color: 'text-style-sniper', border: 'border-style-sniper/30' },
];

export function StyleStep() {
  const { selectedDevice, selectedStyle, selectStyle, includeGyro, setIncludeGyro, setLoading, setResult, setError } = useGeneratorStore();

  const handleGenerate = async () => {
    if (!selectedDevice) return;
    setLoading(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: selectedDevice.id,
          style: selectedStyle,
          includeGyro,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error?.message ?? 'Error al generar');
      }
    } catch {
      setError('Error de conexión');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-white mb-2">
        Elige tu estilo
      </h2>
      <p className="text-sm text-slate-400 mb-6">
        {selectedDevice?.brand} {selectedDevice?.model} — {selectedDevice?.tier}
      </p>

      <div className="space-y-3 mb-8">
        {styles.map((style) => {
          const Icon = style.icon;
          const isSelected = selectedStyle === style.key;
          return (
            <button
              key={style.key}
              onClick={() => selectStyle(style.key)}
              className={cn(
                'w-full glass p-5 flex items-center gap-4 transition-all min-h-[44px]',
                isSelected ? `${style.border} border shadow-lg` : 'hover:border-white/10',
              )}
            >
              <Icon size={24} className={style.color} />
              <div className="text-left flex-1">
                <p className={cn('font-display font-bold', isSelected ? 'text-white' : 'text-slate-300')}>
                  {style.name}
                </p>
                <p className="text-xs text-slate-500">{style.description}</p>
              </div>
              {isSelected && (
                <div className={cn('w-3 h-3 rounded-full', style.color.replace('text-', 'bg-'))} />
              )}
            </button>
          );
        })}
      </div>

      {/* Gyro toggle */}
      <div className="glass p-4 mb-8 flex items-center justify-between">
        <div>
          <p className="font-ui font-medium text-white text-sm">Giroscopio</p>
          <p className="text-xs text-slate-500">Incluir valores de giroscopio (Premium)</p>
        </div>
        <Toggle checked={includeGyro} onChange={setIncludeGyro} />
      </div>

      {/* Generate button */}
      <Button variant="primary" size="lg" className="w-full" onClick={handleGenerate}>
        🎮 Generar Sensibilidad
      </Button>
    </div>
  );
}
```

```
[ARCHIVO] src/components/generator/result-panel.tsx
```
```tsx
'use client';

import { motion } from 'framer-motion';
import { RotateCcw, Heart, Share2, Download } from 'lucide-react';

import { useGeneratorStore } from '@/stores/generator.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { CountUp } from '@/components/effects/count-up';

interface ResultPanelProps {
  onReset: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  general: 'General',
  redPoint: 'Punto Rojo',
  scope2x: 'Mira 2x',
  scope4x: 'Mira 4x',
  sniperScope: 'Mira Sniper',
  freeView: 'Vista Libre',
};

const GYRO_LABELS: Record<string, string> = {
  gyroGeneral: 'Gyro General',
  gyroRedPoint: 'Gyro Punto Rojo',
  gyroScope2x: 'Gyro 2x',
  gyroScope4x: 'Gyro 4x',
  gyroSniper: 'Gyro Sniper',
  gyroFreeView: 'Gyro Vista Libre',
};

export function ResultPanel({ onReset }: ResultPanelProps) {
  const { selectedDevice, selectedStyle, result } = useGeneratorStore();

  if (!result || !selectedDevice) return null;

  const styleVariant = selectedStyle.toLowerCase() as 'aggressive' | 'balanced' | 'sniper';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 font-ui">{selectedDevice.brand}</p>
          <h2 className="text-2xl font-display font-bold text-white">{selectedDevice.model}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={styleVariant} size="sm">{selectedStyle}</Badge>
            <Badge variant={selectedDevice.tier === 'GAMING' ? 'vip' : 'premium'} size="sm">{selectedDevice.tier}</Badge>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Performance</p>
          <p className="text-3xl font-display font-black text-gradient-fire-ice">
            <CountUp end={result.meta.performanceScore} />
            <span className="text-lg text-slate-500">/100</span>
          </p>
        </div>
      </div>

      {/* Sensitivity values */}
      <Card variant="glow" className="p-6">
        <h3 className="font-display font-bold text-white mb-4">Sensibilidades</h3>
        <div className="space-y-4">
          {Object.entries(result.sensitivity).map(([key, value], i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-400">{FIELD_LABELS[key] ?? key}</span>
                <span className="text-lg font-display font-bold text-white">
                  <CountUp end={value as number} duration={800} />
                </span>
              </div>
              <Progress value={value as number} max={100} size="sm" color="gradient" />
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Gyroscope */}
      {result.gyroscope && (
        <Card variant="glow" className="p-6">
          <h3 className="font-display font-bold text-white mb-4">Giroscopio 🔄</h3>
          <div className="space-y-4">
            {Object.entries(result.gyroscope).map(([key, value], i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-400">{GYRO_LABELS[key] ?? key}</span>
                  <span className="text-lg font-display font-bold text-white">
                    <CountUp end={value as number} duration={800} />
                  </span>
                </div>
                <Progress value={value as number} max={100} size="sm" color="ice" />
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="ghost" size="sm" leftIcon={<Heart size={16} />}>Guardar</Button>
        <Button variant="ghost" size="sm" leftIcon={<Share2 size={16} />}>Compartir</Button>
        <Button variant="ghost" size="sm" leftIcon={<Download size={16} />}>Exportar</Button>
        <Button variant="secondary" size="sm" leftIcon={<RotateCcw size={16} />} onClick={onReset}>
          Nueva búsqueda
        </Button>
      </div>
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
ls src/stores/generator.store.ts
ls src/components/generator/generator-flow.tsx src/components/generator/result-panel.tsx
ls src/components/generator/steps/brand-step.tsx src/components/generator/steps/device-step.tsx src/components/generator/steps/style-step.tsx
npm run dev # visitar /generator
```

### Commit: `feat(generator): ARES-201 generator UI — 3-step flow (brand→device→style) + result panel with animations`

---

## ARES-202-results-display

**Fase:** 2 | **Prioridad:** ALTO
**Dependencias:** ARES-201, ARES-101
**Descripción:** Componentes avanzados para mostrar resultados: cards animadas de sensibilidad con barras de progreso, panel de gyro con lock/unlock visual, actions panel (favorito, share, export), comparación rápida "probar otro estilo", y device specs card.

### Archivos a crear:

```
[ARCHIVO] src/components/generator/sensitivity-card.tsx
```
```tsx
'use client';

import { motion } from 'framer-motion';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/cn';

interface SensitivityCardProps {
  label: string;
  value: number;
  icon?: string;
  delay?: number;
  color?: 'fire' | 'ice' | 'gradient';
}

export function SensitivityCard({ label, value, icon, delay = 0, color = 'gradient' }: SensitivityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass p-4 hover:border-fire-500/20 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-sm">{icon}</span>}
          <span className="text-xs font-ui font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: delay + 0.2 }}
          className="text-2xl font-display font-black text-white tabular-nums"
        >
          {value}
        </motion.span>
      </div>
      <Progress value={value} max={100} size="sm" color={color} />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-slate-600">Bajo</span>
        <span className="text-[10px] text-slate-600">Alto</span>
      </div>
    </motion.div>
  );
}
```

```
[ARCHIVO] src/components/generator/gyro-panel.tsx
```
```tsx
'use client';

import { motion } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/cn';

interface GyroValue {
  key: string;
  label: string;
  value: number;
}

interface GyroPanelProps {
  values: GyroValue[];
  isLocked: boolean;
  onUpgrade?: () => void;
}

export function GyroPanel({ values, isLocked, onUpgrade }: GyroPanelProps) {
  return (
    <Card variant="glow" className="p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-white flex items-center gap-2">
          🔄 Giroscopio
          {isLocked ? (
            <Lock size={14} className="text-slate-500" />
          ) : (
            <Unlock size={14} className="text-success" />
          )}
        </h3>
        {isLocked && (
          <button
            onClick={onUpgrade}
            className="text-xs font-ui font-semibold text-fire-400 hover:text-fire-300 transition-colors"
          >
            Desbloquear con Premium →
          </button>
        )}
      </div>

      <div className={cn('space-y-3', isLocked && 'blur-sm pointer-events-none select-none')}>
        {values.map((v, i) => (
          <motion.div
            key={v.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">{v.label}</span>
              <span className="text-sm font-display font-bold text-white tabular-nums">{v.value}</span>
            </div>
            <Progress value={v.value} max={100} size="sm" color="ice" />
          </motion.div>
        ))}
      </div>

      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background-base/30">
          <button
            onClick={onUpgrade}
            className="glass px-6 py-3 flex items-center gap-2 hover:border-fire-500/30 transition-colors"
          >
            <Lock size={16} className="text-fire-500" />
            <span className="font-ui font-semibold text-white text-sm">Premium</span>
          </button>
        </div>
      )}
    </Card>
  );
}
```

```
[ARCHIVO] src/components/generator/device-specs-card.tsx
```
```tsx
'use client';

import { motion } from 'framer-motion';
import { Monitor, Cpu, MemoryStick, Layers } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface DeviceSpecsCardProps {
  brand: string;
  model: string;
  tier: string;
  screenHz: number;
  ramGb: number;
  performanceScore: number;
}

export function DeviceSpecsCard({ brand, model, tier, screenHz, ramGb, performanceScore }: DeviceSpecsCardProps) {
  const specs = [
    { icon: Monitor, label: 'Pantalla', value: `${screenHz}Hz`, subtext: screenHz >= 120 ? 'Ultra fluida' : screenHz >= 90 ? 'Fluida' : 'Estándar' },
    { icon: MemoryStick, label: 'RAM', value: `${ramGb}GB`, subtext: ramGb >= 8 ? 'Excelente' : ramGb >= 4 ? 'Suficiente' : 'Limitada' },
    { icon: Cpu, label: 'Tier', value: tier, subtext: tier === 'GAMING' ? 'Elite' : tier === 'HIGH' ? 'Muy bueno' : tier === 'MID' ? 'Bueno' : 'Básico' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-slate-500 font-ui">{brand}</p>
          <p className="font-display font-bold text-white">{model}</p>
        </div>
        <Badge variant={tier === 'GAMING' ? 'vip' : tier === 'HIGH' ? 'premium' : 'free'}>
          {tier}
        </Badge>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400">Performance Score</span>
          <span className="text-sm font-display font-bold text-gradient-fire-ice">{performanceScore}/100</span>
        </div>
        <Progress value={performanceScore} max={100} size="md" color="gradient" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {specs.map((spec) => {
          const Icon = spec.icon;
          return (
            <div key={spec.label} className="text-center p-2 rounded-lg bg-white/[0.02]">
              <Icon size={16} className="mx-auto text-slate-500 mb-1" />
              <p className="text-xs font-display font-bold text-white">{spec.value}</p>
              <p className="text-[10px] text-slate-600">{spec.subtext}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
```

```
[ARCHIVO] src/components/generator/style-comparison.tsx
```
```tsx
'use client';

import { useState } from 'react';
import type { SensitivityStyle } from '@prisma/client';

import { Tabs } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface StyleComparisonProps {
  deviceId: string;
  currentStyle: SensitivityStyle;
}

interface StyleResult {
  general: number;
  redPoint: number;
  scope2x: number;
  scope4x: number;
  sniperScope: number;
  freeView: number;
}

const STYLE_TABS = [
  { key: 'AGGRESSIVE', label: '⚔️ Agresivo' },
  { key: 'BALANCED', label: '🎯 Balanceado' },
  { key: 'SNIPER', label: '🔭 Francotirador' },
];

const FIELDS = ['general', 'redPoint', 'scope2x', 'scope4x', 'sniperScope', 'freeView'] as const;
const FIELD_LABELS: Record<string, string> = {
  general: 'General', redPoint: 'Punto Rojo', scope2x: '2x', scope4x: '4x', sniperScope: 'Sniper', freeView: 'Vista Libre',
};

export function StyleComparison({ deviceId, currentStyle }: StyleComparisonProps) {
  const [active, setActive] = useState<string>(currentStyle);
  const [results, setResults] = useState<Record<string, StyleResult>>({});
  const [loading, setLoading] = useState(false);

  const loadStyle = async (style: string) => {
    setActive(style);
    if (results[style]) return;

    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, style, includeGyro: false }),
      });
      const data = await res.json();
      if (data.success) {
        setResults((prev) => ({ ...prev, [style]: data.data.sensitivity }));
      }
    } finally {
      setLoading(false);
    }
  };

  const current = results[active];

  return (
    <div className="glass p-6">
      <h3 className="font-display font-bold text-white mb-4">Comparar estilos</h3>
      <Tabs tabs={STYLE_TABS} activeTab={active} onChange={loadStyle} className="mb-4" />

      {loading && !current ? (
        <p className="text-sm text-slate-500 text-center py-4">Cargando...</p>
      ) : current ? (
        <div className="space-y-3">
          {FIELDS.map((field) => (
            <div key={field}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-400">{FIELD_LABELS[field]}</span>
                <span className="text-xs font-bold text-white tabular-nums">{current[field]}</span>
              </div>
              <Progress value={current[field]} max={100} size="sm" color="gradient" />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 text-center py-4">Selecciona un estilo</p>
      )}
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
ls src/components/generator/sensitivity-card.tsx src/components/generator/gyro-panel.tsx src/components/generator/device-specs-card.tsx src/components/generator/style-comparison.tsx
```

### Commit: `feat(results): ARES-202 results display — sensitivity cards, gyro panel (lock/unlock), device specs, style comparison`

---

## ARES-203-device-selector

**Fase:** 2 | **Prioridad:** ALTO
**Dependencias:** ARES-100, ARES-201
**Descripción:** Selector avanzado de dispositivos con búsqueda debounced global (no filtrada por marca), autocomplete dropdown, sección de populares, cache de resultados, y keyboard navigation.

### Archivos a crear:

```
[ARCHIVO] src/hooks/use-debounce.ts
```
```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
```

```
[ARCHIVO] src/hooks/use-device-search.ts
```
```typescript
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { useDebounce } from './use-debounce';

interface DeviceResult {
  id: string;
  brand: string;
  model: string;
  slug: string;
  tier: string;
  screenHz: number;
  ramGb: number;
  isPopular: boolean;
}

interface UseDeviceSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: DeviceResult[];
  isSearching: boolean;
  popular: DeviceResult[];
  popularLoading: boolean;
}

const cache = new Map<string, DeviceResult[]>();

export function useDeviceSearch(): UseDeviceSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DeviceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [popular, setPopular] = useState<DeviceResult[]>([]);
  const [popularLoading, setPopularLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const debouncedQuery = useDebounce(query, 250);

  // Load popular on mount
  useEffect(() => {
    fetch('/api/devices?popular=true&limit=12')
      .then((r) => r.json())
      .then((data) => setPopular(data.data ?? []))
      .catch(() => {})
      .finally(() => setPopularLoading(false));
  }, []);

  // Search on debounced query change
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const cacheKey = debouncedQuery.toLowerCase();
    if (cache.has(cacheKey)) {
      setResults(cache.get(cacheKey)!);
      setIsSearching(false);
      return;
    }

    // Cancel previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSearching(true);

    fetch(`/api/devices?search=${encodeURIComponent(debouncedQuery)}&limit=20`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        const items = data.data ?? [];
        cache.set(cacheKey, items);
        setResults(items);
      })
      .catch(() => {})
      .finally(() => setIsSearching(false));

    return () => controller.abort();
  }, [debouncedQuery]);

  return { query, setQuery, results, isSearching, popular, popularLoading };
}
```

```
[ARCHIVO] src/components/generator/device-search.tsx
```
```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

import { useDeviceSearch } from '@/hooks/use-device-search';
import { useGeneratorStore } from '@/stores/generator.store';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

export function DeviceSearch() {
  const { query, setQuery, results, isSearching, popular, popularLoading } = useDeviceSearch();
  const { selectBrand, selectDevice } = useGeneratorStore();
  const [isFocused, setIsFocused] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const showResults = isFocused && query.length >= 2;
  const items = showResults ? results : [];

  const handleSelect = (device: typeof results[0]) => {
    selectBrand(device.brand);
    selectDevice({
      id: device.id,
      brand: device.brand,
      model: device.model,
      slug: device.slug,
      tier: device.tier as 'LOW' | 'MID' | 'HIGH' | 'GAMING',
      screenHz: device.screenHz,
      ramGb: device.ramGb,
    });
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightIndex >= 0 && items[highlightIndex]) {
      e.preventDefault();
      handleSelect(items[highlightIndex]);
    } else if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  // Reset highlight when results change
  useEffect(() => setHighlightIndex(-1), [results]);

  return (
    <div className="relative">
      {/* Search input */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar cualquier dispositivo..."
          className="w-full rounded-gaming bg-background-card border border-white/10 pl-10 pr-10 py-3.5 text-sm text-white placeholder-slate-500 focus:border-fire-500/50 focus:outline-none focus:ring-1 focus:ring-fire-500/30 min-h-[48px]"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white touch-target"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {showResults && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-2 glass max-h-80 overflow-y-auto"
        >
          {isSearching ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} variant="rect" className="h-14" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="p-4 text-sm text-slate-500 text-center">
              No se encontraron dispositivos para &ldquo;{query}&rdquo;
            </p>
          ) : (
            items.map((device, i) => (
              <button
                key={device.id}
                onMouseDown={() => handleSelect(device)}
                className={cn(
                  'w-full p-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors min-h-[44px]',
                  i === highlightIndex && 'bg-white/5',
                  i < items.length - 1 && 'border-b border-white/5',
                )}
              >
                <div>
                  <p className="text-sm font-display font-bold text-white">
                    {device.brand} {device.model}
                  </p>
                  <p className="text-xs text-slate-500">{device.screenHz}Hz • {device.ramGb}GB</p>
                </div>
                <Badge
                  variant={device.tier === 'GAMING' ? 'vip' : device.tier === 'HIGH' ? 'premium' : 'free'}
                  size="sm"
                >
                  {device.tier}
                </Badge>
              </button>
            ))
          )}
        </div>
      )}

      {/* Popular devices (when not searching) */}
      {!showResults && (
        <div className="mt-6">
          <p className="text-xs font-ui font-semibold text-slate-500 uppercase tracking-wider mb-3">
            🔥 Populares
          </p>
          {popularLoading ? (
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} variant="rect" className="h-14" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {popular.map((device) => (
                <button
                  key={device.id}
                  onClick={() => handleSelect(device)}
                  className="glass-hover p-3 text-left min-h-[44px]"
                >
                  <p className="text-xs text-slate-500">{device.brand}</p>
                  <p className="text-sm font-display font-bold text-white truncate">{device.model}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
ls src/hooks/use-debounce.ts src/hooks/use-device-search.ts src/components/generator/device-search.tsx
```

### Commit: `feat(selector): ARES-203 device selector — debounced search, autocomplete, popular devices, keyboard nav, cache`

---

## ARES-204-device-pages

**Fase:** 2 | **Prioridad:** ALTO
**Dependencias:** ARES-100, ARES-101, ARES-202
**Descripción:** Páginas SEO individuales por dispositivo en `/devices/[slug]`. generateStaticParams para pre-render de populares. Muestra specs, sensibilidades para 3 estilos, device analysis, y CTA para generar. Metadata dinámica para SEO.

### Archivos a crear:

```
[ARCHIVO] src/app/(app)/devices/page.tsx
```
```tsx
import type { Metadata } from 'next';
import Link from 'next/link';

import { prisma } from '@ares/database';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Todos los Dispositivos',
  description: 'Explora 500+ dispositivos con sensibilidades optimizadas para Free Fire.',
};

async function getDevicesByBrand() {
  const devices = await prisma.device.findMany({
    orderBy: [{ brand: 'asc' }, { model: 'asc' }],
    select: { id: true, brand: true, model: true, slug: true, tier: true, screenHz: true, isPopular: true },
  });

  const grouped: Record<string, typeof devices> = {};
  for (const d of devices) {
    if (!grouped[d.brand]) grouped[d.brand] = [];
    grouped[d.brand].push(d);
  }
  return grouped;
}

export default async function DevicesPage() {
  const grouped = await getDevicesByBrand();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-white mb-2">Dispositivos</h1>
      <p className="text-slate-400 mb-8">
        {Object.values(grouped).reduce((sum, d) => sum + d.length, 0)}+ dispositivos de {Object.keys(grouped).length} marcas
      </p>

      {Object.entries(grouped).map(([brand, devices]) => (
        <section key={brand} className="mb-10">
          <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
            {brand}
            <span className="text-sm font-normal text-slate-500">({devices.length})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {devices.map((d) => (
              <Link
                key={d.id}
                href={`/devices/${d.slug}`}
                className="glass-hover p-3 text-center group min-h-[44px]"
              >
                <p className="text-sm font-display font-bold text-white group-hover:text-fire-400 transition-colors truncate">
                  {d.model}
                </p>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <Badge variant={d.tier === 'GAMING' ? 'vip' : d.tier === 'HIGH' ? 'premium' : 'free'} size="sm">
                    {d.tier}
                  </Badge>
                  <span className="text-[10px] text-slate-600">{d.screenHz}Hz</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
```

```
[ARCHIVO] src/app/(app)/devices/[slug]/page.tsx
```
```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { prisma } from '@ares/database';
import { generateSensitivity } from '@ares/algorithms';
import { analyzeDeviceSpecs } from '@ares/algorithms/src/device-analyzer';
import { getRecommendedStyle, STYLE_PROFILES } from '@ares/algorithms/src/style-profiles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const popular = await prisma.device.findMany({
    where: { isPopular: true },
    select: { slug: true },
  });
  return popular.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const device = await prisma.device.findUnique({
    where: { slug: params.slug },
    select: { brand: true, model: true, tier: true, screenHz: true },
  });
  if (!device) return { title: 'Dispositivo no encontrado' };

  return {
    title: `Sensibilidades ${device.brand} ${device.model} | SensiPRO`,
    description: `Configuración de sensibilidades para ${device.brand} ${device.model} (${device.screenHz}Hz, Tier ${device.tier}) en Free Fire. 3 estilos: Agresivo, Balanceado, Francotirador.`,
    openGraph: {
      title: `${device.brand} ${device.model} — Sensibilidades Free Fire`,
      description: `Config optimizada para ${device.screenHz}Hz. Generada por SensiPRO.`,
    },
  };
}

export default async function DevicePage({ params }: Props) {
  const device = await prisma.device.findUnique({ where: { slug: params.slug } });
  if (!device) notFound();

  const specs = {
    screenHz: device.screenHz,
    screenSize: device.screenSize,
    ramGb: device.ramGb,
    panelType: device.panelType,
    tier: device.tier,
  };

  const analysis = analyzeDeviceSpecs(specs);
  const recommendedStyle = getRecommendedStyle(device.tier);

  // Generate all 3 styles
  const styles = (['AGGRESSIVE', 'BALANCED', 'SNIPER'] as const).map((style) => ({
    style,
    profile: STYLE_PROFILES[style],
    result: generateSensitivity({ specs, style }),
  }));

  const fields = ['general', 'redPoint', 'scope2x', 'scope4x', 'sniperScope', 'freeView'] as const;
  const fieldLabels: Record<string, string> = {
    general: 'General', redPoint: 'Punto Rojo', scope2x: 'Mira 2x',
    scope4x: 'Mira 4x', sniperScope: 'Sniper', freeView: 'Vista Libre',
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-slate-500 font-ui">{device.brand}</p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white">{device.model}</h1>
        <div className="flex items-center gap-3 mt-2">
          <Badge variant={device.tier === 'GAMING' ? 'vip' : device.tier === 'HIGH' ? 'premium' : 'free'}>
            {device.tier}
          </Badge>
          <span className="text-sm text-slate-500">{device.screenHz}Hz • {device.ramGb}GB • {device.panelType}</span>
        </div>
      </div>

      {/* Performance Score */}
      <Card variant="glow" className="p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-bold text-white">Performance Score</h2>
          <span className="text-2xl font-display font-black text-gradient-fire-ice">{analysis.performanceScore}/100</span>
        </div>
        <Progress value={analysis.performanceScore} max={100} size="md" color="gradient" />
        <p className="mt-3 text-sm text-slate-400">{analysis.gamingVerdict}</p>
      </Card>

      {/* Recommended style callout */}
      <div className="glass p-4 mb-6 flex items-center gap-3">
        <span className="text-xl">{STYLE_PROFILES[recommendedStyle].icon}</span>
        <div className="flex-1">
          <p className="text-sm font-ui font-semibold text-white">
            Estilo recomendado: {STYLE_PROFILES[recommendedStyle].nameEs}
          </p>
          <p className="text-xs text-slate-500">{STYLE_PROFILES[recommendedStyle].tipShort}</p>
        </div>
      </div>

      {/* All 3 styles */}
      <div className="space-y-6 mb-8">
        {styles.map(({ style, profile, result }) => (
          <Card key={style} variant="default" className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span>{profile.icon}</span>
              <h3 className="font-display font-bold text-white">{profile.nameEs}</h3>
              {style === recommendedStyle && (
                <Badge variant="premium" size="sm">Recomendado</Badge>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {fields.map((field) => (
                <div key={field} className="text-center p-3 rounded-lg bg-white/[0.02]">
                  <p className="text-xs text-slate-500">{fieldLabels[field]}</p>
                  <p className="text-xl font-display font-black text-white">{result.sensitivity[field]}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link href="/generator">
          <Button variant="primary" size="lg">🎮 Generar en el Generador</Button>
        </Link>
      </div>
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
ls src/app/\(app\)/devices/page.tsx src/app/\(app\)/devices/\[slug\]/page.tsx
npm run dev # visitar /devices y /devices/samsung-galaxy-a54
```

### Commit: `feat(devices): ARES-204 device pages — SEO pages with generateStaticParams, dynamic metadata, 3-style display`

---

## ARES-205-responsive-mobile

**Fase:** 2 | **Prioridad:** ALTO
**Dependencias:** ARES-200, ARES-201, ARES-204
**Descripción:** Componentes mobile-first: bottom sheet modal para mobile, pull-to-refresh, swipe gestures, safe area utilities, reduced-motion support, y responsive breakpoint hooks.

### Archivos a crear:

```
[ARCHIVO] src/components/mobile/bottom-sheet.tsx
```
```tsx
'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { X } from 'lucide-react';

import { cn } from '@/lib/cn';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[];
}

export function BottomSheet({ isOpen, onClose, title, children, snapPoints = [0.5, 0.9] }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startY: 0, currentY: 0, isDragging: false });
  const [height, setHeight] = useState(snapPoints[0] ?? 0.5);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      setHeight(snapPoints[0] ?? 0.5);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape, snapPoints]);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragRef.current.startY = e.touches[0].clientY;
    dragRef.current.isDragging = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.currentY = e.touches[0].clientY;
    const delta = dragRef.current.startY - dragRef.current.currentY;
    const windowHeight = window.innerHeight;
    const newHeight = Math.max(0.2, Math.min(0.95, height + delta / windowHeight));
    setHeight(newHeight);
  };

  const handleTouchEnd = () => {
    dragRef.current.isDragging = false;
    // Snap to closest point or close
    if (height < 0.25) {
      onClose();
      return;
    }
    const closest = snapPoints.reduce((prev, curr) =>
      Math.abs(curr - height) < Math.abs(prev - height) ? curr : prev,
    );
    setHeight(closest);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-background-elevated rounded-t-2xl transition-[height] duration-200 ease-out"
        style={{ height: `${height * 100}vh` }}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 pb-3 border-b border-white/5">
            <h3 className="font-display font-bold text-white">{title}</h3>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white touch-target">
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto px-4 py-4 safe-bottom" style={{ maxHeight: `calc(${height * 100}vh - 80px)` }}>
          {children}
        </div>
      </div>
    </div>
  );
}
```

```
[ARCHIVO] src/hooks/use-media-query.ts
```
```typescript
'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
```

```
[ARCHIVO] src/components/mobile/pull-to-refresh.tsx
```
```tsx
'use client';

import { useRef, useState, useCallback } from 'react';

import { cn } from '@/lib/cn';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const threshold = 80;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      setPullDistance(Math.min(delta * 0.5, 120));
    }
  }, [pulling]);

  const handleTouchEnd = useCallback(async () => {
    setPulling(false);
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    setPullDistance(0);
  }, [pullDistance, refreshing, onRefresh]);

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {(pullDistance > 0 || refreshing) && (
        <div
          className="flex items-center justify-center transition-[height]"
          style={{ height: refreshing ? 48 : pullDistance }}
        >
          <div className={cn(
            'h-5 w-5 rounded-full border-2 border-fire-500/30 border-t-fire-500',
            refreshing && 'animate-spin',
            pullDistance >= threshold && !refreshing && 'border-t-success',
          )} />
        </div>
      )}
      {children}
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
ls src/components/mobile/bottom-sheet.tsx src/components/mobile/pull-to-refresh.tsx
ls src/hooks/use-media-query.ts
```

### Commit: `feat(mobile): ARES-205 responsive mobile — bottom sheet, pull-to-refresh, media query hooks, reduced motion`

---

## ARES-206-animations-effects

**Fase:** 2 | **Prioridad:** MEDIO
**Dependencias:** ARES-004, ARES-200
**Descripción:** Efectos visuales gaming: partículas de fondo, confetti para logros/compras, reveal-on-scroll wrapper, glow card hover effect, y animated number counter.

### Archivos a crear:

```
[ARCHIVO] src/components/effects/particles-bg.tsx
```
```tsx
'use client';

import { useEffect, useRef } from 'react';

import { usePrefersReducedMotion } from '@/hooks/use-media-query';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

export function ParticlesBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: Particle[] = [];
    const colors = ['rgba(255,106,0,', 'rgba(0,200,255,'];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [prefersReduced]);

  if (prefersReduced) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-20 pointer-events-none"
      aria-hidden="true"
    />
  );
}
```

```
[ARCHIVO] src/components/effects/confetti.tsx
```
```tsx
'use client';

import { useEffect, useRef, useCallback } from 'react';

import { usePrefersReducedMotion } from '@/hooks/use-media-query';

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
}

const COLORS = ['#ff6a00', '#00c8ff', '#f59e0b', '#8b5cf6', '#22c55e', '#ef4444'];

export function useConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReduced = usePrefersReducedMotion();

  const fire = useCallback((count = 60) => {
    if (prefersReduced) return;

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
      document.body.appendChild(canvas);
      canvasRef.current = canvas;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < count; i++) {
      pieces.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 12,
        vy: -(Math.random() * 8 + 4),
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        width: Math.random() * 8 + 4,
        height: Math.random() * 4 + 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: 1,
      });
    }

    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      let alive = false;

      pieces.forEach((p) => {
        p.x += p.vx;
        p.vy += 0.15; // gravity
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.008;

        if (p.opacity <= 0) return;
        alive = true;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        ctx.restore();
      });

      if (alive) {
        frame = requestAnimationFrame(animate);
      } else {
        canvas?.remove();
        canvasRef.current = null;
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [prefersReduced]);

  return { fire };
}
```

```
[ARCHIVO] src/components/effects/reveal-on-scroll.tsx
```
```tsx
'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { usePrefersReducedMotion } from '@/hooks/use-media-query';

interface RevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const directionMap = {
  up: { y: 30 },
  down: { y: -30 },
  left: { x: 30 },
  right: { x: -30 },
};

export function RevealOnScroll({ children, direction = 'up', delay = 0, className }: RevealProps) {
  const prefersReduced = usePrefersReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

```
[ARCHIVO] src/components/effects/glow-card.tsx
```
```tsx
'use client';

import { useRef, useState } from 'react';

import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export function GlowCard({ children, className, glowColor = 'rgba(255,106,0,0.15)' }: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const prefersReduced = usePrefersReducedMotion();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (prefersReduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      className={cn('glass relative overflow-hidden', className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && !prefersReduced && (
        <div
          className="absolute pointer-events-none transition-opacity duration-300"
          style={{
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${glowColor}, transparent 70%)`,
            left: position.x - 150,
            top: position.y - 150,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
ls src/components/effects/particles-bg.tsx src/components/effects/confetti.tsx src/components/effects/reveal-on-scroll.tsx src/components/effects/glow-card.tsx
```

### Commit: `feat(effects): ARES-206 animations — particles bg, confetti, reveal-on-scroll, glow card (all respect reduced-motion)`

---

## ARES-207-theme-variants

**Fase:** 2 | **Prioridad:** MEDIO
**Dependencias:** ARES-004, ARES-003-auth-system
**Descripción:** Temas VIP exclusivos: Neon Purple, Blood Red, Matrix Green, Gold Premium. Sistema de theme context con CSS variables override, theme selector en perfil, y persisted preference.

### Archivos a crear:

```
[ARCHIVO] src/lib/themes/theme-config.ts
```
```typescript
export interface ThemeConfig {
  key: string;
  name: string;
  nameEs: string;
  tier: 'FREE' | 'PREMIUM' | 'VIP';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
    gradient: string;
  };
  preview: string; // CSS gradient for preview swatch
}

export const THEMES: ThemeConfig[] = [
  {
    key: 'default',
    name: 'Fire & Ice',
    nameEs: 'Fuego y Hielo',
    tier: 'FREE',
    colors: {
      primary: '#ff6a00',
      secondary: '#00c8ff',
      accent: '#ff6a00',
      glow: 'rgba(255,106,0,0.3)',
      gradient: 'linear-gradient(135deg, #ff6a00, #00c8ff)',
    },
    preview: 'linear-gradient(135deg, #ff6a00, #00c8ff)',
  },
  {
    key: 'neon-purple',
    name: 'Neon Purple',
    nameEs: 'Neón Púrpura',
    tier: 'VIP',
    colors: {
      primary: '#a855f7',
      secondary: '#ec4899',
      accent: '#a855f7',
      glow: 'rgba(168,85,247,0.3)',
      gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
    },
    preview: 'linear-gradient(135deg, #a855f7, #ec4899)',
  },
  {
    key: 'blood-red',
    name: 'Blood Red',
    nameEs: 'Rojo Sangre',
    tier: 'VIP',
    colors: {
      primary: '#ef4444',
      secondary: '#f97316',
      accent: '#ef4444',
      glow: 'rgba(239,68,68,0.3)',
      gradient: 'linear-gradient(135deg, #ef4444, #f97316)',
    },
    preview: 'linear-gradient(135deg, #ef4444, #f97316)',
  },
  {
    key: 'matrix-green',
    name: 'Matrix Green',
    nameEs: 'Matrix Verde',
    tier: 'VIP',
    colors: {
      primary: '#22c55e',
      secondary: '#14b8a6',
      accent: '#22c55e',
      glow: 'rgba(34,197,94,0.3)',
      gradient: 'linear-gradient(135deg, #22c55e, #14b8a6)',
    },
    preview: 'linear-gradient(135deg, #22c55e, #14b8a6)',
  },
  {
    key: 'gold-premium',
    name: 'Gold Premium',
    nameEs: 'Oro Premium',
    tier: 'PREMIUM',
    colors: {
      primary: '#f59e0b',
      secondary: '#d97706',
      accent: '#f59e0b',
      glow: 'rgba(245,158,11,0.3)',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    },
    preview: 'linear-gradient(135deg, #f59e0b, #d97706)',
  },
];

export function getTheme(key: string): ThemeConfig {
  return THEMES.find((t) => t.key === key) ?? THEMES[0];
}

export function getAvailableThemes(tier: 'FREE' | 'PREMIUM' | 'VIP'): ThemeConfig[] {
  const tierLevel = { FREE: 0, PREMIUM: 1, VIP: 2 };
  return THEMES.filter((t) => tierLevel[t.tier] <= tierLevel[tier]);
}
```

```
[ARCHIVO] src/lib/themes/theme-context.tsx
```
```tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

import { getTheme, type ThemeConfig } from './theme-config';

interface ThemeContextValue {
  theme: ThemeConfig;
  setTheme: (key: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(getTheme('default'));

  // Load persisted theme
  useEffect(() => {
    try {
      const saved = document.cookie
        .split('; ')
        .find((c) => c.startsWith('ares-theme='))
        ?.split('=')[1];
      if (saved) setThemeState(getTheme(saved));
    } catch {
      // Ignore
    }
  }, []);

  // Apply CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-glow', theme.colors.glow);
    root.style.setProperty('--theme-gradient', theme.colors.gradient);
  }, [theme]);

  const setTheme = useCallback((key: string) => {
    const newTheme = getTheme(key);
    setThemeState(newTheme);
    // Persist in cookie (30 days)
    document.cookie = `ares-theme=${key};path=/;max-age=${60 * 60 * 24 * 30}`;
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

```
[ARCHIVO] src/components/features/theme-selector.tsx
```
```tsx
'use client';

import { Lock, Check } from 'lucide-react';

import { useTheme } from '@/lib/themes/theme-context';
import { getAvailableThemes, THEMES, type ThemeConfig } from '@/lib/themes/theme-config';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

interface ThemeSelectorProps {
  userTier: 'FREE' | 'PREMIUM' | 'VIP';
}

export function ThemeSelector({ userTier }: ThemeSelectorProps) {
  const { theme: current, setTheme } = useTheme();
  const available = getAvailableThemes(userTier);

  const canSelect = (t: ThemeConfig) => available.some((a) => a.key === t.key);

  return (
    <div>
      <h3 className="font-display font-bold text-white mb-4">Tema visual</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {THEMES.map((t) => {
          const isAvailable = canSelect(t);
          const isActive = current.key === t.key;

          return (
            <button
              key={t.key}
              onClick={() => isAvailable && setTheme(t.key)}
              disabled={!isAvailable}
              className={cn(
                'glass p-4 text-center transition-all min-h-[44px]',
                isActive && 'border-white/20 shadow-lg',
                !isAvailable && 'opacity-50 cursor-not-allowed',
              )}
            >
              {/* Gradient preview */}
              <div
                className="w-full h-8 rounded-lg mb-3"
                style={{ background: t.preview }}
              />

              <p className="text-sm font-display font-bold text-white">{t.nameEs}</p>

              <div className="mt-1 flex items-center justify-center gap-1">
                {isActive && <Check size={12} className="text-success" />}
                {!isAvailable && <Lock size={12} className="text-slate-500" />}
                {t.tier !== 'FREE' && (
                  <Badge variant={t.tier === 'VIP' ? 'vip' : 'premium'} size="sm">{t.tier}</Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
ls src/lib/themes/theme-config.ts src/lib/themes/theme-context.tsx
ls src/components/features/theme-selector.tsx
```

### Commit: `feat(themes): ARES-207 theme variants — 5 themes (Fire&Ice, Neon Purple, Blood Red, Matrix Green, Gold), CSS vars, selector`

---

# ═══════════════════════════════════════════════════════════════════
# FIN DE FASE 2 — UI/UX ELITE GAMING
# ═══════════════════════════════════════════════════════════════════
#
# Al completar los 8 scripts de esta fase, el proyecto tiene:
#
# ✅ Landing page épica con 10 secciones (hero→CTA)
# ✅ Generador 3-step flow: marca→modelo→estilo→resultados
# ✅ Cards animadas de sensibilidad con barras de progreso
# ✅ Panel de giroscopio con lock/unlock visual (Premium)
# ✅ Selector avanzado: debounced search, autocomplete, keyboard nav
# ✅ Páginas SEO por dispositivo con generateStaticParams
# ✅ Bottom sheet mobile, pull-to-refresh, reduced-motion
# ✅ Partículas, confetti, reveal-on-scroll, glow cards
# ✅ 5 temas gaming (1 FREE, 1 PREMIUM, 3 VIP)
# ✅ Zustand store para flujo del generador
# ✅ Device specs card con performance score visual
# ✅ Comparación rápida entre estilos
#
# El producto es USABLE. Un jugador de Free Fire puede:
# 1. Visitar la landing page y entender qué hace el producto
# 2. Ir al generador y buscar su dispositivo
# 3. Seleccionar estilo y generar sensibilidades con animaciones
# 4. Ver los valores con barras de progreso y performance score
# 5. Navegar a la página SEO de su dispositivo
# 6. Cambiar tema visual (Premium/VIP)
#
# PRÓXIMA FASE: docs/MASTER-PLAN-D.md (Fase 3 — Academia PRO)
#
# ═══════════════════════════════════════════════════════════════════
