'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function HeadshotCtaBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div
        className="glass-card p-5 text-center headshot-border-glow"
        style={{ animation: 'headshotPulse 3s ease-in-out infinite' }}
      >
        <p className="text-lg font-heading font-bold headshot-text-gradient">
          ¿Quieres HEADSHOTS?
        </p>
        <p className="text-sm text-slate-400 font-body mt-1">
          Sensibilidad calibrada + técnicas de drag + arsenal de armas
        </p>
        <Link
          href="/generator/headshot"
          className="inline-flex items-center gap-2 mt-3 min-h-[44px] px-5 py-2 rounded-xl text-sm font-ui font-semibold text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 active:scale-[0.98] transition-all"
        >
          IR AL HEADSHOT MODE →
        </Link>
      </div>
    </motion.div>
  );
}
