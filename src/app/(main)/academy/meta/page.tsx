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
// ARES-304 — Meta Analysis Page
// Tier list de armas, personajes, combos recomendados
// ═══════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: `Meta Actual de Free Fire | Academia PRO — ARES SensiPRO`,
  description: `Análisis del meta actual de Free Fire (${CURRENT_META.version}): tier list de armas, mejores personajes, combos recomendados.`,
};

export default function MetaPage() {
  const { weapons, characters, topCombos, version, lastUpdated, patchNotes } = CURRENT_META;

  const weaponsByTier = (['S', 'A', 'B', 'C'] as WeaponTier[]).map((tier) => ({
    tier,
    weapons: weapons.filter((w) => w.tier === tier),
  }));

  // Mapa rápido para buscar armas por nombre en comparaciones
  const findWeapon = (name: string) => weapons.find((w) => w.name === name);

  // Pares para comparar
  const comparisonPairs: [string, string][] = [
    ['M4A1', 'AK47'],
    ['MP40', 'UMP'],
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
          <Swords className="w-6 h-6 text-fire-400" />
          Meta Actual — Parche {version}
        </h1>
        <p className="text-slate-400 text-sm mb-3">
          Última actualización:{' '}
          {new Date(lastUpdated).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <div className="rounded-lg bg-fire-500/10 border border-fire-500/20 p-3">
          <p className="text-sm text-fire-300">
            <strong>Cambios del parche:</strong> {patchNotes}
          </p>
        </div>
      </div>

      {/* Resumen rápido de tipos de arma */}
      <section>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {(Object.entries(WEAPON_TYPE_LABELS) as [WeaponType, string][]).map(([type, label]) => {
            const count = weapons.filter((w) => w.type === type).length;
            return (
              <div
                key={type}
                className="rounded-lg border border-white/10 bg-background-card/50 p-3 text-center"
              >
                <span className="text-lg font-black text-white">{count}</span>
                <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Weapon Tier List */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-fire-400" />
          Tier List de Armas
        </h2>

        {weaponsByTier.map(({ tier, weapons: tierWeapons }) => {
          if (tierWeapons.length === 0) return null;
          const style = TIER_COLORS[tier];

          return (
            <div key={tier} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={cn(
                    'px-3 py-1 rounded-lg text-sm font-black border',
                    style.bg,
                    style.text,
                    style.border,
                  )}
                >
                  Tier {tier}
                </span>
                <span className="text-xs text-slate-500">
                  {tierWeapons.length} {tierWeapons.length === 1 ? 'arma' : 'armas'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tierWeapons.map((weapon) => (
                  <MetaChart key={weapon.name} weapon={weapon} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Weapon Comparison */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-ice-400" />
          Comparaciones Clave
        </h2>

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
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          Tier List de Personajes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {characters.map((char) => {
            const style = TIER_COLORS[char.tier];

            return (
              <div
                key={char.name}
                className={cn('rounded-xl border p-4', style.border, 'bg-background-card/50')}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{char.name}</h3>
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-[10px] font-bold',
                        style.bg,
                        style.text,
                      )}
                    >
                      {char.tier}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded',
                        char.abilityType === 'ACTIVE'
                          ? 'bg-fire-500/20 text-fire-400'
                          : 'bg-ice-500/20 text-ice-400',
                      )}
                    >
                      {char.abilityType === 'ACTIVE' ? 'Activa' : 'Pasiva'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-2">
                  <strong className="text-white">{char.ability}:</strong> {char.description}
                </p>

                <div className="flex items-center gap-1 text-xs flex-wrap">
                  <span className="text-slate-500">Mejor combo:</span>
                  {char.bestCombo.map((name) => (
                    <span
                      key={name}
                      className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 text-[10px]"
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
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          Combos Recomendados
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topCombos.map((combo) => (
            <div
              key={combo.name}
              className="rounded-xl border border-white/10 bg-background-card/50 p-4"
            >
              <h3 className="font-bold text-white text-sm mb-1">{combo.name}</h3>
              <p className="text-xs text-slate-400 mb-3">{combo.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {combo.weapons.map((weapon, i) => (
                  <span key={weapon} className="flex items-center">
                    <span className="px-2 py-1 rounded-lg bg-fire-500/20 text-fire-400 text-xs font-bold">
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
