'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import type { SensitivityOutput } from '@ares/algorithms';
import { getWeaponAdjustedSensitivity } from '@ares/algorithms';
import { WeaponCard } from './weapon-card';

type RangeTab = 'close' | 'mid' | 'long';

interface WeaponData {
  id: string;
  name: string;
  type: string;
  tier: string;
  damage: number;
  headshotDamage: number;
  headshotMultiplier: number;
  rpm: number;
  range: number;
  dragType: string;
  sensAdjust: Partial<Record<keyof SensitivityOutput, number>>;
  attachments: readonly string[];
  tip: string;
  proTip: string;
}

interface WeaponGridProps {
  weapons: {
    close: readonly WeaponData[];
    mid: readonly WeaponData[];
    long: readonly WeaponData[];
  };
  baseSensitivity: SensitivityOutput;
}

const TABS: { key: RangeTab; label: string; color: string }[] = [
  { key: 'close', label: 'CERCA (0-10m)', color: '#ef4444' },
  { key: 'mid', label: 'MEDIA (10-50m)', color: '#f97316' },
  { key: 'long', label: 'LEJOS (50m+)', color: '#06b6d4' },
];

export function WeaponGrid({ weapons, baseSensitivity }: WeaponGridProps) {
  const [activeTab, setActiveTab] = useState<RangeTab>('close');
  const activeWeapons = weapons[activeTab] as readonly WeaponData[];
  const totalWeapons = weapons.close.length + weapons.mid.length + weapons.long.length;

  return (
    <section>
      <h3 className="font-heading font-bold text-white text-xl md:text-2xl mb-1">
        ARSENAL HEADSHOT
      </h3>
      <p className="text-sm text-slate-500 font-body mb-5">{totalWeapons} armas en tu arsenal headshot</p>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-ui font-bold uppercase tracking-wider transition-all border"
              style={{
                background: active ? `${tab.color}15` : 'rgba(255,255,255,0.02)',
                borderColor: active ? `${tab.color}40` : 'rgba(255,255,255,0.05)',
                color: active ? tab.color : '#64748b',
                boxShadow: active ? `0 0 12px ${tab.color}20` : 'none',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Weapon cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {activeWeapons.map((weapon, i) => (
            <WeaponCard
              key={weapon.id}
              weapon={weapon}
              baseSensitivity={baseSensitivity}
              getAdjusted={getWeaponAdjustedSensitivity}
              index={i}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
