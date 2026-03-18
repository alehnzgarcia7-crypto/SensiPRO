'use client';

// ═══════════════════════════════════════════════════════════════
// Config por Arma Favorita — selector de 2 armas + info
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';

interface WeaponInfo {
  tipo: string;
  tier: 'S' | 'A' | 'B';
  sliderImportante: string;
  tecnicaDrag: string;
  tip: string;
  distancia: string;
}

const WEAPON_DATA: Record<string, WeaponInfo> = {
  MP40: {
    tipo: 'SMG',
    tier: 'S',
    sliderImportante: 'General y Punto Rojo',
    tecnicaDrag: 'Drag Vertical — spray al pecho, el retroceso sube solo',
    tip: 'Spray al pecho — el retroceso natural sube a la cabeza',
    distancia: 'Corta (0-10m)',
  },
  M1887: {
    tipo: 'Escopeta',
    tier: 'S',
    sliderImportante: 'General',
    tecnicaDrag: 'J-Drag — apunta al pecho y curva hacia arriba',
    tip: 'J-Drag rapidísimo. Apunta al pecho y hace la J',
    distancia: 'Corta (0-10m)',
  },
  M1014: {
    tipo: 'Escopeta',
    tier: 'A',
    sliderImportante: 'General',
    tecnicaDrag: 'J-Drag — igual que M1887 pero más tolerante',
    tip: 'Mismo que M1887 pero puedes fallar — tienes 6 rondas',
    distancia: 'Corta (0-10m)',
  },
  M4A1: {
    tipo: 'Rifle de Asalto',
    tier: 'S',
    sliderImportante: 'Punto Rojo y Mira 2x',
    tecnicaDrag: 'Drag Vertical — ráfagas de 3-4 disparos',
    tip: 'Ráfagas de 3-4 disparos. Reset entre cada ráfaga',
    distancia: 'Media (10-50m)',
  },
  AK47: {
    tipo: 'Rifle de Asalto',
    tier: 'A',
    sliderImportante: 'Punto Rojo y Mira 2x',
    tecnicaDrag: 'Drag Vertical — baja la mira mientras disparas',
    tip: 'Alto retroceso. Baja la mira mientras disparas',
    distancia: 'Media (10-50m)',
  },
  SCAR: {
    tipo: 'Rifle de Asalto',
    tier: 'S',
    sliderImportante: 'Punto Rojo y Mira 2x',
    tecnicaDrag: 'Drag Vertical — la más estable para practicar',
    tip: 'La más estable. Perfecta para aprender drag vertical',
    distancia: 'Media (10-50m)',
  },
  AWM: {
    tipo: 'Sniper',
    tier: 'S',
    sliderImportante: 'Mira Sniper',
    tecnicaDrag: 'Pre-aim — no hagas drag, pre-apunta a la cabeza',
    tip: 'Un solo disparo. Pre-apunta a la cabeza, no hagas drag',
    distancia: 'Larga (50m+)',
  },
  Woodpecker: {
    tipo: 'Marksman',
    tier: 'A',
    sliderImportante: 'Mira 4x',
    tecnicaDrag: 'Tap rápido con Drag Vertical suave',
    tip: 'Semi-auto. Tap rápido, no spray. Rompe chalecos',
    distancia: 'Media-Larga (30-50m+)',
  },
  'Desert Eagle': {
    tipo: 'Pistola',
    tier: 'S',
    sliderImportante: 'General y Punto Rojo',
    tecnicaDrag: 'Flick Shot o One-Tap',
    tip: 'One-tap a media distancia. Practica el flick',
    distancia: 'Media (10-30m)',
  },
  MAC10: {
    tipo: 'SMG',
    tier: 'A',
    sliderImportante: 'General y Punto Rojo',
    tecnicaDrag: 'Drag Vertical — el retroceso hace el trabajo',
    tip: 'Cargador largo. Spray al cuerpo, el retroceso hace el trabajo',
    distancia: 'Corta (0-10m)',
  },
  Parafal: {
    tipo: 'Rifle de Asalto',
    tier: 'A',
    sliderImportante: 'Punto Rojo y Mira 4x',
    tecnicaDrag: 'Drag Vertical con ráfagas cortas',
    tip: 'Daño brutal. Ráfagas cortas a media distancia',
    distancia: 'Media (10-50m)',
  },
};

const WEAPON_NAMES = Object.keys(WEAPON_DATA);

const TIER_STYLES: Record<string, string> = {
  S: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  A: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  B: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
};

export function WeaponConfigSelector() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleWeapon = (name: string) => {
    setSelected((prev) => {
      if (prev.includes(name)) return prev.filter((w) => w !== name);
      if (prev.length >= 2) return [prev[1] ?? name, name];
      return [...prev, name];
    });
  };

  return (
    <div className="glass-card p-6">
      <h3 className="font-heading font-bold text-white uppercase tracking-[0.15em] text-sm mb-1">
        🔫 Tus Armas Favoritas
      </h3>
      <p className="text-xs text-slate-500 font-body mb-4">
        Elige tus 2 armas principales
      </p>

      {/* Weapon grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {WEAPON_NAMES.map((name) => {
          const isSelected = selected.includes(name);
          return (
            <button
              key={name}
              onClick={() => toggleWeapon(name)}
              className={`min-h-[40px] px-3 py-2 rounded-lg text-xs font-ui font-medium text-left transition-all border ${
                isSelected
                  ? 'bg-red-500/10 border-red-500/30 text-white'
                  : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:border-white/15'
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>

      {/* Cards for selected weapons */}
      {selected.length > 0 && (
        <div className="space-y-3">
          {selected.map((name) => {
            const weapon = WEAPON_DATA[name];
            if (!weapon) return null;
            return (
              <div key={name} className="px-4 py-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-heading font-bold text-white">{name}</span>
                    <span className="text-[10px] text-slate-500 font-body">{weapon.tipo}</span>
                  </div>
                  <span className={`text-[10px] font-ui font-bold uppercase px-2 py-0.5 rounded-full border ${TIER_STYLES[weapon.tier]}`}>
                    Tier {weapon.tier}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-slate-300 font-body">
                    <span className="text-slate-500">📊 Slider clave:</span> {weapon.sliderImportante}
                  </p>
                  <p className="text-xs text-slate-300 font-body">
                    <span className="text-slate-500">🎯 Técnica:</span> {weapon.tecnicaDrag}
                  </p>
                  <p className="text-xs text-slate-300 font-body">
                    <span className="text-slate-500">💡</span> {weapon.tip}
                  </p>
                  <p className="text-xs text-slate-300 font-body">
                    <span className="text-slate-500">📏 Distancia:</span> {weapon.distancia}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
