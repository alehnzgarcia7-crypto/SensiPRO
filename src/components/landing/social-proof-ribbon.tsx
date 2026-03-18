'use client';

// ═══════════════════════════════════════════════════════════════
// SocialProofRibbon — Dual-row CSS marquee (opposite directions)
// 10 testimonials in pill badges, pause on hover
// ═══════════════════════════════════════════════════════════════

const SOCIAL_PROOF_ITEMS = [
  { emoji: '🔥', text: 'Kevin_xD subió a Diamante con Redmi Note 12', tag: 'Generador' },
  { emoji: '🎯', text: 'BryanElPro hace one-tap con iPhone 14', tag: 'Headshot Mode' },
  { emoji: '💪', text: 'MateoSniper_ llegó a Heroico por primera vez', tag: 'Academia' },
  { emoji: '⭐', text: '537+ dispositivos soportados', tag: '' },
  { emoji: '🏆', text: '26 marcas compatibles', tag: '' },
  { emoji: '💎', text: 'NahomiFF_ subió a Platino con Galaxy A14', tag: 'Generador' },
  { emoji: '🔥', text: 'CamiRush22 recomienda SensiPRO a toda su squad', tag: 'Todo' },
  { emoji: '🎯', text: 'AndresGOAT mejoró en ranked con Infinix Hot 40', tag: 'Generador' },
  { emoji: '📱', text: 'ElChema_GG dice que es la mejor app que ha usado', tag: 'Generador' },
  { emoji: '🎮', text: 'XxDiego_FFxX logró headshots consistentes con POCO X5', tag: 'Headshot Mode' },
];

// Split en 2 filas
const ROW_1 = SOCIAL_PROOF_ITEMS.slice(0, 5);
const ROW_2 = SOCIAL_PROOF_ITEMS.slice(5);

function Pill({ emoji, text, tag }: { emoji: string; text: string; tag: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-colors duration-200">
      <span>{emoji}</span>
      <span className="text-sm text-slate-400">{text}</span>
      {tag && (
        <span className="text-[10px] text-cyan-400 font-semibold">{tag}</span>
      )}
    </span>
  );
}

function MarqueeRow({
  items,
  direction,
}: {
  items: typeof ROW_1;
  direction: 'left' | 'right';
}) {
  // Duplicar para loop infinito
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden">
      <div
        className={direction === 'left' ? 'marquee-left' : 'marquee-right'}
        style={{ gap: '24px' }}
      >
        {doubled.map((item, i) => (
          <span key={`${item.text}-${i}`} className="shrink-0" style={{ marginRight: '24px' }}>
            <Pill emoji={item.emoji} text={item.text} tag={item.tag} />
          </span>
        ))}
      </div>
    </div>
  );
}

export function SocialProofRibbon() {
  return (
    <section
      className="py-6 overflow-hidden"
      style={{
        borderTop: '1px solid rgba(6, 182, 212, 0.06)',
        borderBottom: '1px solid rgba(6, 182, 212, 0.06)',
      }}
    >
      <div className="space-y-4">
        <MarqueeRow items={ROW_1} direction="left" />
        <MarqueeRow items={ROW_2} direction="right" />
      </div>
    </section>
  );
}
