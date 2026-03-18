'use client';

// ═══════════════════════════════════════════════════════════════
// Settings de Free Fire Recomendados — 5 settings + 1 tip
// ═══════════════════════════════════════════════════════════════

const SETTINGS = [
  { emoji: '🖥️', nombre: 'Gráficos', valor: 'Smooth + FPS Máximo' },
  { emoji: '🎯', nombre: 'Aim Assist', valor: 'Activado' },
  { emoji: '🔍', nombre: 'Precisión Mira', valor: 'Default' },
  { emoji: '🔄', nombre: 'Cambio de Arma', valor: 'Rápido + Activado' },
  { emoji: '🔫', nombre: 'Disparo→Mira', valor: 'Activado' },
];

export function GameSettingsRecommendation() {
  return (
    <div className="glass-card p-6">
      <h3 className="font-heading font-bold text-white uppercase tracking-[0.15em] text-sm mb-1">
        ⚙️ Settings de Free Fire
      </h3>
      <p className="text-xs text-slate-500 font-body mb-4">
        Ponlos así antes de jugar
      </p>

      <div className="space-y-2 mb-4">
        {SETTINGS.map((s) => (
          <div key={s.nombre} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-2">
              <span className="text-sm">{s.emoji}</span>
              <span className="text-xs text-slate-400 font-body">{s.nombre}</span>
            </div>
            <span className="text-xs text-white font-ui font-semibold">{s.valor}</span>
          </div>
        ))}
      </div>

      <div className="px-3 py-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
        <p className="text-xs text-cyan-400/90 font-body">
          💡 Cierra TODAS las apps antes de jugar. Más RAM libre = más FPS = mejor aim.
        </p>
      </div>
    </div>
  );
}
