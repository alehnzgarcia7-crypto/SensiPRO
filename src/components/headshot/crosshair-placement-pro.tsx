'use client';

// ═══════════════════════════════════════════════════════════════
// Crosshair Placement Pro — 3 reglas + 1 tip
// ═══════════════════════════════════════════════════════════════

const RULES = [
  { emoji: '🧍', situacion: 'De pie', regla: 'Mira a nivel de los OJOS' },
  { emoji: '🦵', situacion: 'Agachado', regla: 'Baja la mira al cuello' },
  { emoji: '🧱', situacion: 'Gloo Wall', regla: 'Pre-apunta donde va a salir la cabeza' },
];

export function CrosshairPlacementPro() {
  return (
    <div className="glass-card p-6">
      <h3 className="font-heading font-bold text-white uppercase tracking-[0.15em] text-sm mb-4">
        🎯 Dónde Apuntar Siempre
      </h3>

      <div className="space-y-3 mb-4">
        {RULES.map((rule) => (
          <div key={rule.situacion} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <span className="text-lg shrink-0">{rule.emoji}</span>
            <div>
              <span className="text-xs text-slate-500 font-ui">{rule.situacion}</span>
              <p className="text-sm text-slate-200 font-body font-medium">{rule.regla}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-3 py-2.5 rounded-lg bg-orange-500/5 border border-orange-500/10">
        <p className="text-xs text-orange-400/90 font-body">
          ⚠️ NUNCA apuntes al suelo mientras caminas. Eso es lo que más te hace fallar headshots.
        </p>
      </div>
    </div>
  );
}
