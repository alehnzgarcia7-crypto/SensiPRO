import { Metadata } from 'next';
import { Swords, Shield, Target, Crown, TrendingUp } from 'lucide-react';

import { cn } from '@/lib/cn';
import {
  CURRENT_META,
  TIER_COLORS,
  WEAPON_TYPE_LABELS,
} from '@/lib/academy/meta-config';
import type { WeaponTier, WeaponType } from '@/lib/academy/meta-config';
import { MetaChart, WeaponCompare } from '@/components/academy/meta-chart';

// ═══════════════════════════════════════════════════════════════
// ARES-304 — Meta Analysis Page — Premium Gaming UI
// ═══════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: `Meta Actual de Free Fire | Academia PRO — ARES SensiPRO`,
  description: `Análisis del meta actual de Free Fire (${CURRENT_META.version}): tier list de armas, mejores personajes, combos recomendados.`,
};

// Tier glow colors for badges
const TIER_GLOW: Record<WeaponTier, string> = {
  S: '0 0 16px rgba(239, 68, 68, 0.4)',
  A: '0 0 16px rgba(249, 115, 22, 0.4)',
  B: '0 0 16px rgba(6, 182, 212, 0.4)',
  C: 'none',
};

export default function MetaPage() {
  const { weapons, characters, topCombos, version, lastUpdated, patchNotes } = CURRENT_META;

  const weaponsByTier = (['S', 'A', 'B', 'C'] as WeaponTier[]).map((tier) => ({
    tier,
    weapons: weapons.filter((w) => w.tier === tier),
  }));

  const findWeapon = (name: string) => weapons.find((w) => w.name === name);

  const comparisonPairs: [string, string][] = [
    ['M4A1', 'AK47'],
    ['MP40', 'UMP'],
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="academy-stagger">
        <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2 font-[family-name:var(--font-orbitron)] uppercase tracking-wide">
          <Swords className="w-6 h-6 text-fire-400" />
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Meta Actual
          </span>
          <span className="text-fire-400 text-lg">— Parche {version}</span>
        </h1>
        <div className="section-heading-separator mb-3" />
        <p className="text-slate-400 text-sm mb-4 font-numbers">
          Última actualización:{' '}
          {new Date(lastUpdated).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        {/* Patch notes box — with animated border */}
        <div className="glass-card p-4">
          <div
            className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
            style={{
              background: 'linear-gradient(90deg, #ff6a00, #06b6d4, #ff6a00)',
              boxShadow: '0 0 12px rgba(255, 106, 0, 0.3)',
            }}
          />
          <p className="text-sm text-fire-300">
            <strong className="font-[family-name:var(--font-rajdhani)]">Cambios del parche:</strong> {patchNotes}
          </p>
        </div>
      </div>

      {/* Resumen rápido de tipos de arma — glass cards */}
      <section>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {(Object.entries(WEAPON_TYPE_LABELS) as [WeaponType, string][]).map(([type, label], index) => {
            const count = weapons.filter((w) => w.type === type).length;
            return (
              <div
                key={type}
                className="glass-card p-3 text-center academy-stagger"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="font-[family-name:var(--font-orbitron)] text-xl font-black text-white">
                  {count}
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5 font-[family-name:var(--font-rajdhani)]">{label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Weapon Tier List */}
      <section>
        <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2 mb-1">
          <Target className="w-5 h-5 text-fire-400" />
          Tier List de Armas
        </h2>
        <div className="section-heading-separator mb-6" />

        {weaponsByTier.map(({ tier, weapons: tierWeapons }) => {
          if (tierWeapons.length === 0) return null;
          const style = TIER_COLORS[tier];

          return (
            <div key={tier} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={cn(
                    'px-4 py-1.5 rounded-lg text-sm font-black border',
                    style.bg,
                    style.text,
                    style.border,
                  )}
                  style={{ boxShadow: TIER_GLOW[tier] }}
                >
                  Tier {tier}
                </span>
                <span className="font-numbers text-xs text-slate-500">
                  {tierWeapons.length} {tierWeapons.length === 1 ? 'arma' : 'armas'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tierWeapons.map((weapon, index) => (
                  <MetaChart key={weapon.name} weapon={weapon} index={index} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Weapon Comparison */}
      <section>
        <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-ice-400" />
          Comparaciones Clave
        </h2>
        <div className="section-heading-separator mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comparisonPairs.map(([nameA, nameB]) => {
            const wA = findWeapon(nameA);
            const wB = findWeapon(nameB);
            if (!wA || !wB) return null;
            return <WeaponCompare key={`${nameA}-${nameB}`} weapons={[wA, wB]} />;
          })}
        </div>
      </section>

      {/* Characters */}
      <section>
        <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-purple-400" />
          Tier List de Personajes
        </h2>
        <div className="section-heading-separator mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {characters.map((char, index) => {
            const charStyle = TIER_COLORS[char.tier];

            return (
              <div
                key={char.name}
                className="glass-card p-4 academy-stagger"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-white">{char.name}</h3>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-md text-[10px] font-black border',
                        charStyle.bg,
                        charStyle.text,
                        charStyle.border,
                      )}
                      style={{ boxShadow: TIER_GLOW[char.tier] }}
                    >
                      {char.tier}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-md border',
                        char.abilityType === 'ACTIVE'
                          ? 'bg-fire-500/15 text-fire-400 border-fire-500/20'
                          : 'bg-ice-500/15 text-ice-400 border-ice-500/20',
                      )}
                    >
                      {char.abilityType === 'ACTIVE' ? 'Activa' : 'Pasiva'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-2">
                  <strong className="text-white font-[family-name:var(--font-rajdhani)]">{char.ability}:</strong>{' '}
                  {char.description}
                </p>

                <div className="flex items-center gap-1 text-xs flex-wrap">
                  <span className="text-slate-500">Mejor combo:</span>
                  {char.bestCombo.map((name) => (
                    <span
                      key={name}
                      className="px-1.5 py-0.5 rounded-md bg-white/[0.06] text-slate-300 text-[10px] border border-white/[0.06]"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top Combos */}
      <section>
        <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2 mb-1">
          <Crown className="w-5 h-5 text-yellow-400" />
          Combos Recomendados
        </h2>
        <div className="section-heading-separator mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topCombos.map((combo, index) => (
            <div
              key={combo.name}
              className="glass-card p-4 academy-stagger"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-white text-sm mb-1">{combo.name}</h3>
              <p className="text-xs text-slate-400 mb-3">{combo.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {combo.weapons.map((weapon, i) => (
                  <span key={weapon} className="flex items-center">
                    <span
                      className="px-2 py-1 rounded-lg text-fire-400 text-xs font-bold border border-fire-500/20 bg-fire-500/10"
                      style={{ boxShadow: '0 0 8px rgba(255, 106, 0, 0.1)' }}
                    >
                      {weapon}
                    </span>
                    {i < combo.weapons.length - 1 && (
                      <span className="text-slate-500 mx-1">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
