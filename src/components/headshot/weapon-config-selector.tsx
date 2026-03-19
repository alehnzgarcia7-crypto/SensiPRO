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
  stats?: string;
}

const WEAPON_DATA: Record<string, WeaponInfo> = {
  MP40: {
    tipo: 'SMG (+4% sensi)',
    tier: 'S',
    sliderImportante: 'General y Punto Rojo',
    tecnicaDrag: 'Drag Vertical — spray al pecho, 830 RPM sube solo a la cabeza',
    tip: '48 base × 1.5x = 72 HS. Con 830 RPM 3-4 balas llegan a la cabeza si apuntas al cuello. Daño máximo en <10m.',
    distancia: 'Corta (0-10m)',
    stats: '48 dmg · 1.5× HS · 830 RPM',
  },
  M1887: {
    tipo: 'Escopeta (+8% sensi)',
    tier: 'S',
    sliderImportante: 'General',
    tecnicaDrag: 'J-Drag — apunta al pecho y curva en J hacia la cabeza',
    tip: '94 base × 2.0x = 188 HS — one-tap kill con cualquier casco excepto Nivel 3+. J-Drag rapidísimo: primer tiro al pecho, curva hacia arriba.',
    distancia: 'Corta (0-10m)',
    stats: '94 dmg · 2.0× HS · 55 RPM',
  },
  M1014: {
    tipo: 'Escopeta (+8% sensi)',
    tier: 'A',
    sliderImportante: 'General',
    tecnicaDrag: 'J-Drag — más tolerante que M1887, tienes 6 rondas',
    tip: '78 base × 1.8x = 140 HS. Primer tiro al pecho, segundo con drag a la cabeza. Más consistente que M1887 por el cargador de 6.',
    distancia: 'Corta (0-10m)',
    stats: '78 dmg · 1.8× HS · 80 RPM',
  },
  M4A1: {
    tipo: 'AR (sensi base)',
    tier: 'S',
    sliderImportante: 'Punto Rojo y Mira 2x',
    tecnicaDrag: 'Drag Vertical — ráfagas de 3-4 disparos, reset entre cada una',
    tip: '53 base × 1.7x = 90 HS. El AR más consistente del juego — retroceso bajo, funciona a todas las distancias. La mejor para APRENDER headshots.',
    distancia: 'Media (10-50m)',
    stats: '53 dmg · 1.7× HS · 560 RPM',
  },
  AK47: {
    tipo: 'AR Heavy (-3% sensi)',
    tier: 'A',
    sliderImportante: 'Punto Rojo y Mira 2x',
    tecnicaDrag: 'Drag Vertical corto — compensa el alto retroceso bajando la mira',
    tip: '61 base × 1.8x = 110 HS — mata en 2 headshots con casco Nivel 2. Buffeado OB52. ARES baja tu sensi -3% automáticamente para compensar el recoil.',
    distancia: 'Media (10-50m)',
    stats: '61 dmg · 1.8× HS · 480 RPM',
  },
  SCAR: {
    tipo: 'AR (sensi base)',
    tier: 'S',
    sliderImportante: 'Punto Rojo y Mira 2x',
    tecnicaDrag: 'Drag Vertical suave — la más estable para practicar headshots',
    tip: '53 base × 1.7x = 90 HS. Primer disparo MUY preciso — ideal para one-tap con tap-fire. Perfecta para aprender drag vertical.',
    distancia: 'Media (10-50m)',
    stats: '53 dmg · 1.7× HS · 540 RPM',
  },
  AWM: {
    tipo: 'Sniper (-6% sensi)',
    tier: 'S',
    sliderImportante: 'Mira Sniper',
    tecnicaDrag: 'Pre-aim a nivel de cabeza — no hagas drag, un solo tiro limpio',
    tip: '90 base × 2.5x = 225 HS — ONE-SHOT KILL GARANTIZADO con CUALQUIER casco incluyendo Nivel 3. Pre-apunta y dispara en <0.5s.',
    distancia: 'Larga (50m+)',
    stats: '90 dmg · 2.5× HS · 25 RPM',
  },
  Woodpecker: {
    tipo: 'Marksman',
    tier: 'A',
    sliderImportante: 'Mira 4x',
    tecnicaDrag: 'Tap rápido — semi-auto con Drag Vertical suave entre taps',
    tip: '65 base × 2.0x = 130 HS. Con scope 2x y tap-fire, cada headshot hace 130 de daño. Dos headshots = kill. Rompe chalecos a distancia.',
    distancia: 'Media-Larga (30-50m+)',
    stats: '65 dmg · 2.0× HS · 360 RPM',
  },
  'Desert Eagle': {
    tipo: 'Pistola (+5% sensi)',
    tier: 'S',
    sliderImportante: 'General y Punto Rojo',
    tecnicaDrag: 'Flick Shot o One-Tap — snap reflexivo a la cabeza',
    tip: '90 base × 2.2x = 198 HS — la pistola MÁS LETAL del juego. One-tap a media distancia con headshot. Practica 50 flicks diarios.',
    distancia: 'Media (10-30m)',
    stats: '90 dmg · 2.2× HS · 40 RPM',
  },
  MAC10: {
    tipo: 'SMG (+4% sensi)',
    tier: 'A',
    sliderImportante: 'General y Punto Rojo',
    tecnicaDrag: 'Drag Vertical — 900 RPM = la cadencia más rápida del juego',
    tip: '45 base × 1.5x = 67 HS. Con 900 RPM es la SMG más rápida. Spray devastador — el retroceso hace el drag por ti. Cargador largo obligatorio.',
    distancia: 'Corta (0-10m)',
    stats: '45 dmg · 1.5× HS · 900 RPM',
  },
  Parafal: {
    tipo: 'AR Heavy (-3% sensi)',
    tier: 'A',
    sliderImportante: 'Punto Rojo y Mira 4x',
    tecnicaDrag: 'Drag Vertical con ráfagas cortas — semi-auto preciso',
    tip: '58 base × 1.8x = 104 HS. Semi-auto preciso — compite con snipers a 50-80m. Tap-fire headshots con scope 4x devastan.',
    distancia: 'Media (10-50m)',
    stats: '58 dmg · 1.8× HS · 400 RPM',
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
