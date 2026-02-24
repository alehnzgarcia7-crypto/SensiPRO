import type { Metadata } from 'next';
import { Ticket, Crown, Star, Shield } from 'lucide-react';

import { RedeemCode } from '@/components/features/redeem-code';

export const metadata: Metadata = {
  title: 'Activar Codigo — Sensibilidades PRO',
  description:
    'Canjea tu codigo de activacion ARES-XXXX-XXXX-XXXX para desbloquear Premium o VIP.',
};

const TIER_BENEFITS = [
  {
    tier: 'Premium',
    icon: Star,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-500/10',
    benefits: [
      'Todos los estilos de juego (Agresivo, Balanceado, Francotirador)',
      'Giroscopio completo',
      'Comparador de dispositivos',
      'Exportar configuraciones',
      'Favoritos y historial ilimitados',
      'Todas las marcas (36+)',
    ],
  },
  {
    tier: 'VIP',
    icon: Crown,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/10',
    benefits: [
      'Todo Premium incluido',
      'Sin publicidad',
      'Torneos exclusivos',
      'Temas VIP personalizados',
      'Soporte prioritario',
      'Acceso anticipado a nuevas funciones',
    ],
  },
];

export default function ActivatePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:py-16">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-fire-500/10 p-3">
          <Ticket size={28} className="text-fire-500" />
        </div>
        <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
          Activar Codigo
        </h1>
        <p className="mt-2 text-slate-400">
          Ingresa tu codigo para desbloquear funciones Premium o VIP
        </p>
      </div>

      {/* Componente de canje */}
      <RedeemCode />

      {/* Info de tiers */}
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {TIER_BENEFITS.map(({ tier, icon: Icon, color, borderColor, bgColor, benefits }) => (
          <div
            key={tier}
            className={`rounded-gaming border ${borderColor} ${bgColor} p-5`}
          >
            <div className="mb-3 flex items-center gap-2">
              <Icon size={18} className={color} />
              <h3 className={`font-display text-lg font-bold ${color}`}>
                {tier}
              </h3>
            </div>
            <ul className="space-y-2">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-2 text-sm text-slate-300"
                >
                  <Shield size={14} className={`mt-0.5 shrink-0 ${color}`} />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Donde conseguir codigos */}
      <div className="mt-8 rounded-gaming border border-white/10 bg-background-card p-5 text-center">
        <p className="text-sm text-slate-400">
          Los codigos de activacion se obtienen a traves de{' '}
          <span className="text-white">compra directa</span>,{' '}
          <span className="text-white">influencers</span> o{' '}
          <span className="text-white">promociones especiales</span>.
        </p>
      </div>
    </div>
  );
}
