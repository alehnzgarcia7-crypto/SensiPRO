'use client';

// ═══════════════════════════════════════════════════════════════
// Crosshair Placement Pro — 3 reglas + 1 tip
// ═══════════════════════════════════════════════════════════════

const RULES = [
  { emoji: '🧍', situacion: 'De pie', regla: 'Mira a nivel de los OJOS — reduce tu distancia de drag un 50-70%' },
  { emoji: '🦵', situacion: 'Agachado', regla: 'Baja la mira al cuello — al levantarse sube natural a la cabeza (Situp Headshot)' },
  { emoji: '🧱', situacion: 'Gloo Wall', regla: 'Pre-apunta donde va a salir la cabeza — el peek-fire headshot es instantáneo' },
];

export function CrosshairPlacementPro() {
  return (
    <div className="glass-card p-6">
      <h3 className="font-heading font-bold text-white uppercase tracking-[0.15em] text-sm mb-1">
        🎯 La Trinidad del Headshot
      </h3>
      <p className="text-[11px] text-slate-500 font-body mb-4">
        Sensibilidad correcta + Crosshair Placement + Técnica de Drag = headshots consistentes
      </p>

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

      <div className="px-3 py-2.5 rounded-lg bg-orange-500/5 border border-orange-500/10 mb-3">
        <p className="text-xs text-orange-400/90 font-body">
          ⚠️ NUNCA apuntes al suelo. El aim assist de Free Fire tira al TORSO — si tu crosshair está abajo, te quedas pegado al pecho. El drag compensa subiendo, pero si empiezas a nivel de cabeza, el drag es mínimo.
        </p>
      </div>

      <div className="px-3 py-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
        <p className="text-xs text-cyan-400/90 font-body">
          💡 Warmup: camina por Training Ground 5 min con el crosshair a nivel de los maniquíes. No dispares — solo mantén la altura. En 3-4 días se vuelve automático.
        </p>
      </div>
    </div>
  );
}
