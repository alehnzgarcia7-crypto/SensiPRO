'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  ChevronDown,
  Shield,
  Zap,
  Crown,
  Gamepad2,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useCallback } from 'react';

import { cn } from '@/lib/cn';

/* ═══════════════════════════════════════════════════════════
   EXCHANGE RATES — Tasas aproximadas desde USD
   ═══════════════════════════════════════════════════════════ */

interface CurrencyInfo {
  rate: number;
  symbol: string;
  flag: string;
  name: string;
  decimals: number;
}

type CurrencyCode = 'MXN' | 'COP' | 'ARS' | 'PEN' | 'CLP' | 'BRL' | 'USD' | 'GTQ' | 'CRC' | 'DOP' | 'BOB' | 'PYG' | 'UYU' | 'HNL' | 'NIO' | 'VES';

const EXCHANGE_RATES: Record<CurrencyCode, CurrencyInfo> = {
  MXN: { rate: 17.5, symbol: '$', flag: '\u{1F1F2}\u{1F1FD}', name: 'Peso Mexicano', decimals: 0 },
  COP: { rate: 4200, symbol: '$', flag: '\u{1F1E8}\u{1F1F4}', name: 'Peso Colombiano', decimals: 0 },
  ARS: { rate: 870, symbol: '$', flag: '\u{1F1E6}\u{1F1F7}', name: 'Peso Argentino', decimals: 0 },
  PEN: { rate: 3.75, symbol: 'S/', flag: '\u{1F1F5}\u{1F1EA}', name: 'Sol Peruano', decimals: 2 },
  CLP: { rate: 950, symbol: '$', flag: '\u{1F1E8}\u{1F1F1}', name: 'Peso Chileno', decimals: 0 },
  BRL: { rate: 5.0, symbol: 'R$', flag: '\u{1F1E7}\u{1F1F7}', name: 'Real', decimals: 2 },
  USD: { rate: 1, symbol: '$', flag: '\u{1F1FA}\u{1F1F8}', name: 'Dólar', decimals: 2 },
  GTQ: { rate: 7.8, symbol: 'Q', flag: '\u{1F1EC}\u{1F1F9}', name: 'Quetzal', decimals: 2 },
  CRC: { rate: 520, symbol: '\u20A1', flag: '\u{1F1E8}\u{1F1F7}', name: 'Colón', decimals: 0 },
  DOP: { rate: 57, symbol: 'RD$', flag: '\u{1F1E9}\u{1F1F4}', name: 'Peso Dominicano', decimals: 0 },
  BOB: { rate: 6.9, symbol: 'Bs', flag: '\u{1F1E7}\u{1F1F4}', name: 'Boliviano', decimals: 2 },
  PYG: { rate: 7300, symbol: '\u20B2', flag: '\u{1F1F5}\u{1F1FE}', name: 'Guaraní', decimals: 0 },
  UYU: { rate: 40, symbol: '$U', flag: '\u{1F1FA}\u{1F1FE}', name: 'Peso Uruguayo', decimals: 0 },
  HNL: { rate: 24.7, symbol: 'L', flag: '\u{1F1ED}\u{1F1F3}', name: 'Lempira', decimals: 2 },
  NIO: { rate: 36.5, symbol: 'C$', flag: '\u{1F1F3}\u{1F1EE}', name: 'Córdoba', decimals: 2 },
  VES: { rate: 36.5, symbol: 'Bs.D', flag: '\u{1F1FB}\u{1F1EA}', name: 'Bolívar', decimals: 2 },
};

/* ═══════════════════════════════════════════════════════════
   PLANES
   ═══════════════════════════════════════════════════════════ */

interface PlanFeature {
  text: string;
  free: boolean;
  pro: boolean;
  elite: boolean;
}

const BASE_PRICES_USD = {
  proMonthly: 4.99,
  proAnnualMonthly: 3.99,
  eliteMonthly: 9.99,
  eliteAnnualMonthly: 7.49,
};

function formatPrice(usd: number, currency: CurrencyCode): string {
  const info = EXCHANGE_RATES[currency];
  const converted = usd * info.rate;
  if (info.decimals === 0) {
    return `${info.symbol}${Math.round(converted).toLocaleString('es-MX')}`;
  }
  return `${info.symbol}${converted.toFixed(info.decimals)}`;
}

function formatAnnualTotal(monthlyUsd: number, currency: CurrencyCode): string {
  const annual = monthlyUsd * 12;
  return formatPrice(annual, currency);
}

/* ═══════════════════════════════════════════════════════════
   COMPARISON TABLE DATA
   ═══════════════════════════════════════════════════════════ */

const comparisonFeatures: PlanFeature[] = [
  { text: 'Generador de sensibilidad', free: true, pro: true, elite: true },
  { text: '485+ dispositivos soportados', free: true, pro: true, elite: true },
  { text: 'Sensibilidad por DPI', free: true, pro: true, elite: true },
  { text: 'Configuraciones guardadas', free: false, pro: true, elite: true },
  { text: 'Headshot Mode completo', free: false, pro: true, elite: true },
  { text: 'Custom HUD Codes (17 códigos)', free: false, pro: true, elite: true },
  { text: 'Screenshots reales de Free Fire', free: false, pro: true, elite: true },
  { text: 'Training Plans de 7 días', free: false, pro: true, elite: true },
  { text: 'Armas Tier S/A/B', free: false, pro: true, elite: true },
  { text: 'Giroscopio calibrado', free: false, pro: true, elite: true },
  { text: 'Sin publicidad', free: false, pro: true, elite: true },
  { text: 'Soporte prioritario', free: false, pro: true, elite: true },
  { text: 'Coaching IA personalizado', free: false, pro: false, elite: true },
  { text: 'Badge exclusivo ELITE', free: false, pro: false, elite: true },
  { text: 'Discord VIP con pros', free: false, pro: false, elite: true },
  { text: 'Análisis avanzado de gameplay', free: false, pro: false, elite: true },
  { text: 'Configuraciones ilimitadas', free: false, pro: false, elite: true },
  { text: 'Soporte VIP 24/7', free: false, pro: false, elite: true },
  { text: 'Descarga de configuración en PDF', free: false, pro: false, elite: true },
  { text: 'Acceso anticipado a features', free: false, pro: false, elite: true },
];

/* ═══════════════════════════════════════════════════════════
   FAQ DATA
   ═══════════════════════════════════════════════════════════ */

const faqs = [
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí, sin compromiso. Tu plan sigue activo hasta el final del periodo pagado. No hay cargos adicionales ni penalizaciones.',
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'MercadoPago, tarjeta de crédito/débito, OXXO, transferencia bancaria (México), PSE (Colombia), y más según tu país.',
  },
  {
    q: '¿El Headshot Mode funciona sin PRO?',
    a: 'No, el Headshot Mode completo (HUD codes, training plans, técnicas de drag) es exclusivo de PRO y ELITE. El plan Gratis solo incluye sensibilidad básica.',
  },
  {
    q: '¿Puedo cambiar de plan?',
    a: 'Sí, puedes subir o bajar de plan en cualquier momento. El cambio aplica en tu siguiente ciclo de facturación.',
  },
  {
    q: '¿Ofrecen reembolsos?',
    a: 'Sí, 7 días de garantía. Si no estás satisfecho, te devolvemos tu dinero sin preguntas.',
  },
  {
    q: '¿Los precios incluyen IVA?',
    a: 'Los precios mostrados no incluyen impuestos locales. El IVA se calcula al momento del pago según tu país.',
  },
  {
    q: '¿El generador básico siempre será gratis?',
    a: 'Sí, el generador de sensibilidad básico siempre será gratuito. Es nuestra promesa.',
  },
  {
    q: '¿Qué pasa con mis datos si cancelo?',
    a: 'Tus configuraciones guardadas se mantienen por 30 días. Puedes reactivar tu plan para recuperarlas.',
  },
];

/* ═══════════════════════════════════════════════════════════
   COMPONENTES
   ═══════════════════════════════════════════════════════════ */

function CurrencySelector({
  selected,
  onSelect,
}: {
  selected: CurrencyCode;
  onSelect: (c: CurrencyCode) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = EXCHANGE_RATES[selected as CurrencyCode] ?? EXCHANGE_RATES.MXN;

  const handleSelect = useCallback(
    (code: CurrencyCode) => {
      onSelect(code);
      setOpen(false);
    },
    [onSelect],
  );

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-white/10 hover:border-ice-500/30 transition-colors min-h-[44px]"
      >
        <span className="text-lg">{current.flag}</span>
        <span className="font-ui font-semibold text-sm text-white">{selected}</span>
        <ChevronDown
          size={14}
          className={cn('text-slate-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-2 left-0 z-50 w-64 max-h-72 overflow-y-auto rounded-xl glass border border-white/10 shadow-card p-1"
            >
              {(Object.entries(EXCHANGE_RATES) as [CurrencyCode, CurrencyInfo][]).map(([code, info]) => (
                <button
                  key={code}
                  onClick={() => handleSelect(code)}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors min-h-[44px]',
                    selected === code
                      ? 'bg-ice-500/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white',
                  )}
                >
                  <span className="text-lg">{info.flag}</span>
                  <span className="font-ui font-semibold text-sm">{code}</span>
                  <span className="text-xs text-slate-500 ml-auto">{info.name}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function BillingToggle({
  annual,
  onToggle,
}: {
  annual: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <span
        className={cn(
          'font-ui text-sm font-semibold transition-colors',
          !annual ? 'text-white' : 'text-slate-500',
        )}
      >
        Mensual
      </span>
      <button
        onClick={onToggle}
        className="relative w-14 h-7 rounded-full bg-background-elevated border border-white/10 transition-colors hover:border-ice-500/30"
        aria-label="Cambiar entre mensual y anual"
      >
        <motion.div
          className="absolute top-0.5 w-6 h-6 rounded-full bg-gradient-to-r from-ice-500 to-fire-500 shadow-glow-ice"
          animate={{ left: annual ? '1.75rem' : '0.125rem' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
      <span
        className={cn(
          'font-ui text-sm font-semibold transition-colors',
          annual ? 'text-white' : 'text-slate-500',
        )}
      >
        Anual
      </span>
      {annual && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-2.5 py-0.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-ui font-bold"
        >
          AHORRA 20-25%
        </motion.span>
      )}
    </div>
  );
}

function PlanCard({
  name,
  icon,
  badge,
  monthlyPriceUsd,
  annualMonthlyPriceUsd,
  annual,
  currency,
  color,
  glowClass,
  borderClass,
  features,
  cta,
  ctaHref,
  highlighted,
  savings,
  index,
}: {
  name: string;
  icon: React.ReactNode;
  badge: string | null;
  monthlyPriceUsd: number;
  annualMonthlyPriceUsd: number;
  annual: boolean;
  currency: CurrencyCode;
  color: string;
  glowClass: string;
  borderClass: string;
  features: { text: string; included: boolean }[];
  cta: string;
  ctaHref: string;
  highlighted: boolean;
  savings: string | null;
  index: number;
}) {
  const currentPrice = annual ? annualMonthlyPriceUsd : monthlyPriceUsd;
  const monthlyFormatted = formatPrice(monthlyPriceUsd, currency);
  const currentFormatted = formatPrice(currentPrice, currency);
  const annualTotalFormatted = annual ? formatAnnualTotal(annualMonthlyPriceUsd, currency) : '';

  const card = (
    <div
      className={cn(
        'glass-card p-7 md:p-8 relative flex flex-col h-full',
        highlighted && 'shadow-card-hover',
      )}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span
            className={cn(
              'inline-flex items-center px-4 py-1 rounded-full text-white text-xs font-ui font-bold whitespace-nowrap animate-pulse',
              highlighted ? 'bg-gradient-to-r from-ice-500 to-fire-500' : 'bg-amber-500/90',
            )}
          >
            {badge}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-heading font-bold text-xl text-white">{name}</h3>
      </div>

      <div className="mt-5 flex items-baseline gap-1">
        <AnimatePresence mode="wait">
          <motion.span
            key={`${currentPrice}-${currency}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-5xl font-heading font-black text-white"
          >
            {monthlyPriceUsd === 0 ? '$0' : currentFormatted}
          </motion.span>
        </AnimatePresence>
        <span className="text-sm text-slate-500 font-body">
          {monthlyPriceUsd === 0 ? 'siempre' : '/mes'}
        </span>
      </div>

      {monthlyPriceUsd > 0 && annual && (
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm text-slate-600 line-through font-mono">
            {monthlyFormatted}/mes
          </span>
          <span className="px-2 py-0.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-ui font-bold">
            {savings}
          </span>
        </div>
      )}

      {monthlyPriceUsd > 0 && annual && (
        <p className="mt-1 text-xs text-slate-500 font-body">
          {annualTotalFormatted}/año facturado
        </p>
      )}

      <div className="my-6 h-px bg-white/5" />

      <ul className="space-y-3 flex-1">
        {features.map((feat) => (
          <li key={feat.text} className="flex items-start gap-3 text-sm">
            {feat.included ? (
              <Check size={15} className="text-success shrink-0 mt-0.5" />
            ) : (
              <X size={15} className="text-slate-700 shrink-0 mt-0.5" />
            )}
            <span
              className={cn(
                'font-body leading-snug',
                feat.included ? 'text-slate-300' : 'text-slate-600',
              )}
            >
              {feat.text}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Link
          href={ctaHref}
          className={cn(
            'flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-ui font-bold text-sm tracking-wider uppercase transition-all duration-300 min-h-[48px]',
            highlighted
              ? `bg-gradient-to-r ${color} text-white ${glowClass} hover:scale-[1.02] hover:shadow-lg`
              : monthlyPriceUsd === 0
                ? 'bg-transparent border border-slate-600/50 text-slate-400 hover:bg-white/5'
                : `bg-transparent border ${borderClass} text-white hover:bg-white/5`,
          )}
        >
          {cta}
          {highlighted && <span className="ml-1">\u2192</span>}
        </Link>
      </div>
    </div>
  );

  if (highlighted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <div className="animated-border-wrapper">
          <div className="animated-border-gradient" />
          <div className="animated-border-content">{card}</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {card}
    </motion.div>
  );
}

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="glass rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-4 text-left min-h-[52px] hover:bg-white/[0.02] transition-colors"
      >
        <span className="font-ui font-semibold text-sm text-white pr-4">{q}</span>
        <ChevronDown
          size={16}
          className={cn(
            'text-slate-500 shrink-0 transition-transform duration-300',
            open && 'rotate-180',
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-slate-400 font-body leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ComparisonTable() {
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left py-4 px-3 font-ui font-semibold text-sm text-slate-400 w-[40%]">
              Feature
            </th>
            <th className="text-center py-4 px-3 font-ui font-semibold text-sm text-slate-500 w-[20%]">
              <Gamepad2 size={14} className="inline mr-1" />
              Gratis
            </th>
            <th className="text-center py-4 px-3 font-ui font-semibold text-sm text-ice-400 w-[20%]">
              <Zap size={14} className="inline mr-1" />
              PRO
            </th>
            <th className="text-center py-4 px-3 font-ui font-semibold text-sm text-amber-400 w-[20%]">
              <Crown size={14} className="inline mr-1" />
              ELITE
            </th>
          </tr>
        </thead>
        <tbody>
          {comparisonFeatures.map((feat, i) => (
            <tr
              key={feat.text}
              className={cn(
                'border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]',
                i % 2 === 0 && 'bg-white/[0.01]',
              )}
            >
              <td className="py-3 px-3 text-sm text-slate-300 font-body">{feat.text}</td>
              <td className="py-3 px-3 text-center">
                {feat.free ? (
                  <Check size={16} className="text-success mx-auto" />
                ) : (
                  <X size={16} className="text-slate-700 mx-auto" />
                )}
              </td>
              <td className="py-3 px-3 text-center bg-ice-500/[0.03]">
                {feat.pro ? (
                  <Check size={16} className="text-ice-400 mx-auto" />
                ) : (
                  <X size={16} className="text-slate-700 mx-auto" />
                )}
              </td>
              <td className="py-3 px-3 text-center">
                {feat.elite ? (
                  <Check size={16} className="text-amber-400 mx-auto" />
                ) : (
                  <X size={16} className="text-slate-700 mx-auto" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════ */

export default function PricingPage() {
  const [currency, setCurrency] = useState<CurrencyCode>('MXN');
  const [annual, setAnnual] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-20">
      {/* ── Header ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-heading font-black">
          <span className="bg-gradient-to-r from-ice-500 to-fire-500 bg-clip-text text-transparent">
            Elige tu Plan
          </span>
        </h1>
        <p className="mt-4 text-lg text-slate-400 font-ui max-w-lg mx-auto">
          Desde sensibilidad básica hasta coaching profesional completo
        </p>
      </motion.div>

      {/* ── Controles: Moneda + Billing ───────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12"
      >
        <CurrencySelector selected={currency} onSelect={setCurrency} />
        <BillingToggle annual={annual} onToggle={() => setAnnual(!annual)} />
      </motion.div>

      {/* ── Plan Cards ────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-6 items-start mb-8">
        {/* GRATIS */}
        <PlanCard
          name="Gratis"
          icon={<Gamepad2 size={20} className="text-slate-500" />}
          badge={null}
          monthlyPriceUsd={0}
          annualMonthlyPriceUsd={0}
          annual={annual}
          currency={currency}
          color=""
          glowClass=""
          borderClass=""
          features={[
            { text: 'Generador de sensibilidad básico', included: true },
            { text: '485+ dispositivos soportados', included: true },
            { text: '3 configuraciones guardadas', included: true },
            { text: 'Sensibilidad por DPI', included: true },
            { text: 'Headshot Mode', included: false },
            { text: 'Custom HUD Codes', included: false },
            { text: 'Sin ads', included: false },
            { text: 'Coaching IA', included: false },
            { text: 'Training Plans', included: false },
          ]}
          cta="Empezar Gratis"
          ctaHref="/register"
          highlighted={false}
          savings={null}
          index={0}
        />

        {/* PRO */}
        <PlanCard
          name="PRO"
          icon={<Zap size={20} className="text-ice-400" />}
          badge="\u26A1 MÁS POPULAR"
          monthlyPriceUsd={BASE_PRICES_USD.proMonthly}
          annualMonthlyPriceUsd={BASE_PRICES_USD.proAnnualMonthly}
          annual={annual}
          currency={currency}
          color="from-ice-500 to-blue-600"
          glowClass="shadow-glow-ice"
          borderClass="border-ice-500/30"
          features={[
            { text: 'Todo de Gratis', included: true },
            { text: 'Headshot Mode completo (24 features)', included: true },
            { text: 'Custom HUD Codes (17 códigos reales)', included: true },
            { text: 'Screenshots reales de Free Fire', included: true },
            { text: 'Training Plans de 7 días', included: true },
            { text: 'Armas Tier S/A/B', included: true },
            { text: 'Giroscopio calibrado', included: true },
            { text: 'Sin publicidad', included: true },
            { text: '50 configuraciones guardadas', included: true },
            { text: 'Soporte prioritario', included: true },
            { text: 'Coaching IA personalizado', included: false },
            { text: 'Badge exclusivo', included: false },
          ]}
          cta="Elegir PRO"
          ctaHref="/payment?plan=pro"
          highlighted={true}
          savings="AHORRA 20%"
          index={1}
        />

        {/* ELITE */}
        <PlanCard
          name="ELITE"
          icon={<Crown size={20} className="text-amber-400" />}
          badge="\u{1F3C6} ELITE"
          monthlyPriceUsd={BASE_PRICES_USD.eliteMonthly}
          annualMonthlyPriceUsd={BASE_PRICES_USD.eliteAnnualMonthly}
          annual={annual}
          currency={currency}
          color="from-amber-500 to-yellow-600"
          glowClass="shadow-glow-premium"
          borderClass="border-amber-500/30"
          features={[
            { text: 'Todo de PRO', included: true },
            { text: 'Coaching IA personalizado por chat', included: true },
            { text: 'Acceso anticipado a features nuevas', included: true },
            { text: 'Badge exclusivo ELITE en perfil', included: true },
            { text: 'Discord VIP con pros y desarrolladores', included: true },
            { text: 'Análisis avanzado de tu gameplay', included: true },
            { text: 'Configuraciones ilimitadas guardadas', included: true },
            { text: 'Soporte VIP 24/7', included: true },
            { text: 'Descarga de configuración en PDF', included: true },
          ]}
          cta="Elegir ELITE"
          ctaHref="/payment?plan=elite"
          highlighted={false}
          savings="AHORRA 25%"
          index={2}
        />
      </div>

      {/* ── Nota de precios ───────────────────────────── */}
      <p className="text-center text-xs text-slate-600 mb-16">
        * Precios aproximados en {EXCHANGE_RATES[currency].name}. La conversión final se
        realiza al momento del pago.
      </p>

      {/* ── Comparación de Planes ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="mb-20"
      >
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-white text-center mb-8">
          Compara todos los planes
        </h2>
        <div className="glass-card p-4 md:p-6">
          <ComparisonTable />
        </div>
      </motion.div>

      {/* ── FAQ ────────────────────────────────────────── */}
      <div className="mb-20 max-w-2xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-2xl md:text-3xl font-heading font-bold text-white text-center mb-8"
        >
          Preguntas Frecuentes
        </motion.h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>
      </div>

      {/* ── Garantía ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="glass-card p-6 md:p-8 border border-emerald-500/20 mb-12"
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="shrink-0">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Shield size={28} className="text-emerald-400" />
            </div>
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-white">
              7 días de garantía
            </h3>
            <p className="text-sm text-slate-400 font-body mt-1">
              Si no mejoras tu gameplay, te devolvemos tu dinero. Sin preguntas, sin letras chiquitas.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── CTA Final ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <p className="text-lg text-slate-400 font-ui mb-5">
          ¿Aún no estás seguro? Prueba el generador gratis y ve la diferencia.
        </p>
        <Link
          href="/generator"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-fire-500 to-ice-500 text-white font-ui font-bold text-sm tracking-wider uppercase shadow-glow-fire hover:scale-[1.02] transition-all duration-300 min-h-[48px]"
        >
          <Target size={18} />
          Probar Generador Gratis
        </Link>
      </motion.div>
    </div>
  );
}
