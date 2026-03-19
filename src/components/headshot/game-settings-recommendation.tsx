'use client';

// ═══════════════════════════════════════════════════════════════
// Settings de Free Fire Recomendados — 5 settings + 1 tip
// ═══════════════════════════════════════════════════════════════

const SETTINGS = [
  { emoji: '🖥️', nombre: 'Gráficos', valor: 'Smooth + FPS Máximo', nota: '120Hz se siente ~15% más rápido que 60Hz' },
  { emoji: '🎯', nombre: 'Aim Assist', valor: 'Activado', nota: 'Ayuda a trackear pero tira al torso — el drag corrige hacia arriba' },
  { emoji: '🔍', nombre: 'Precisión Mira', valor: 'Activado', nota: 'Para headshots más limpios con scope' },
  { emoji: '🔄', nombre: 'Cambio de Arma', valor: 'Rápido + Activado', nota: 'Quick Switch resetea bloom de retroceso — técnica de Two9' },
  { emoji: '🔫', nombre: 'Disparo→Mira', valor: 'Activado', nota: 'Hold Fire para abrir mira automáticamente al disparar' },
  { emoji: '🛡️', nombre: 'Placa de Acero', valor: 'Ya no protege tanto', nota: 'OB49 la nerfeó de -35% a -10%. Los headshots son más letales que NUNCA' },
];

export function GameSettingsRecommendation() {
  return (
    <div className="glass-card p-6">
      <h3 className="font-heading font-bold text-white uppercase tracking-[0.15em] text-sm mb-1">
        ⚙️ Settings para Headshots
      </h3>
      <p className="text-[11px] text-slate-500 font-body mb-4">
        Configuración optimizada para maximizar tu headshot rate
      </p>

      <div className="space-y-2 mb-4">
        {SETTINGS.map((s) => (
          <div key={s.nombre} className="px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">{s.emoji}</span>
                <span className="text-xs text-slate-400 font-body">{s.nombre}</span>
              </div>
              <span className="text-xs text-white font-ui font-semibold">{s.valor}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-body pl-7">{s.nota}</p>
          </div>
        ))}
      </div>

      <div className="px-3 py-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/10 mb-2">
        <p className="text-xs text-cyan-400/90 font-body">
          💡 Cierra TODAS las apps antes de jugar. Con ≤4GB de RAM ARES resta -1 a tu sensi porque tu cel tiene menos FPS. Más RAM libre = más FPS = mejor aim.
        </p>
      </div>

      <div className="px-3 py-2.5 rounded-lg bg-purple-500/5 border border-purple-500/10">
        <p className="text-xs text-purple-400/90 font-body">
          📱 AMOLED tiene 2-5ms menos de latencia que LCD — ARES ajusta -3 a -5 puntos de sensi en pantallas AMOLED porque la respuesta táctil es más rápida.
        </p>
      </div>
    </div>
  );
}
