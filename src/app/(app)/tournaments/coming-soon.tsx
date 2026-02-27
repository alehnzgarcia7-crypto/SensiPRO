'use client';

import { motion } from 'framer-motion';
import { Crosshair, Zap, Trophy, Target, Users, Medal, Bell } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';

const UPCOMING_TOURNAMENTS = [
  {
    icon: <Crosshair size={28} className="text-red-400" />,
    name: 'Torneo Headshot',
    description: 'Competencia de headshot rate. El que más headshots haga gana.',
    color: 'border-red-500/20 hover:border-red-500/30',
    glow: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]',
    gradient: 'from-red-500/10 to-transparent',
  },
  {
    icon: <Zap size={28} className="text-ice-400" />,
    name: 'Torneo Velocidad',
    description: 'Configura tu sensibilidad más rápido que nadie. Precisión bajo presión.',
    color: 'border-ice-500/20 hover:border-ice-500/30',
    glow: 'hover:shadow-[0_0_20px_rgba(0,200,255,0.1)]',
    gradient: 'from-ice-500/10 to-transparent',
  },
  {
    icon: <Trophy size={28} className="text-amber-400" />,
    name: 'Liga SensiPRO',
    description: 'Liga mensual con premios reales en efectivo. Los mejores de LATAM.',
    color: 'border-amber-500/20 hover:border-amber-500/30',
    glow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]',
    gradient: 'from-amber-500/10 to-transparent',
  },
];

function NewsletterSignup() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = () => {
    if (!isValid) return;
    setSubmitted(true);
    toast('success', 'Te notificaremos cuando lancemos los torneos.');
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6 text-center"
      >
        <Bell size={24} className="mx-auto mb-2 text-success" />
        <p className="text-sm text-white font-ui font-semibold">¡Listo!</p>
        <p className="text-xs text-slate-400 mt-1">Te avisaremos por email cuando haya novedades.</p>
      </motion.div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="font-ui font-bold text-sm text-white mb-1">
        Sé el primero en enterarte
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Recibe una notificación cuando lancemos los torneos.
      </p>
      <div className="flex gap-2">
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          type="email"
          className="flex-1"
        />
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={!isValid}
          leftIcon={<Bell size={14} />}
        >
          Notifícame
        </Button>
      </div>
    </div>
  );
}

export function TournamentsComingSoon() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-20">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-5">
          <Trophy size={30} className="text-purple-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-black">
          <span className="bg-gradient-to-r from-ice-500 to-purple-500 bg-clip-text text-transparent">
            Torneos
          </span>
        </h1>
        <p className="mt-3 text-slate-400 font-ui max-w-md mx-auto">
          Compite con los mejores de LATAM
        </p>
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-block mt-5 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm text-purple-400 font-ui font-bold animate-pulse"
        >
          PRÓXIMAMENTE
        </motion.span>
      </motion.div>

      {/* Tournament Previews */}
      <div className="grid md:grid-cols-3 gap-4 mb-12">
        {UPCOMING_TOURNAMENTS.map((tournament, i) => (
          <motion.div
            key={tournament.name}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
            className={cn(
              'glass-card p-6 relative overflow-hidden transition-all duration-300',
              tournament.color,
              tournament.glow,
            )}
          >
            <div className={cn('absolute inset-0 bg-gradient-to-b opacity-50', tournament.gradient)} />
            <div className="relative">
              <div className="mb-4">{tournament.icon}</div>
              <h3 className="font-heading font-bold text-white text-sm mb-2">
                {tournament.name}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {tournament.description}
              </p>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-500 font-ui font-semibold uppercase tracking-wider">
                Próximamente
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Newsletter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-12"
      >
        <NewsletterSignup />
      </motion.div>

      {/* Stats Teaser */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-3 gap-3 mb-12"
      >
        {[
          { icon: <Users size={18} className="text-ice-400" />, value: '500+', label: 'jugadores esperando' },
          { icon: <Medal size={18} className="text-amber-400" />, value: '3', label: 'modalidades' },
          { icon: <Trophy size={18} className="text-purple-400" />, value: 'MXN', label: 'premios reales' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4 text-center">
            <div className="flex justify-center mb-2">{stat.icon}</div>
            <p className="text-xl font-heading font-black text-white">{stat.value}</p>
            <p className="text-[10px] text-slate-500 font-ui uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center"
      >
        <p className="text-sm text-slate-400 font-ui mb-4">
          Mientras tanto, perfecciona tu setup
        </p>
        <Link
          href="/generator"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-fire-500 to-ice-500 text-white font-ui font-bold text-sm tracking-wider uppercase shadow-glow-fire hover:scale-[1.02] transition-all duration-300 min-h-[44px]"
        >
          <Target size={16} />
          Ir al Generador
        </Link>
      </motion.div>
    </div>
  );
}
