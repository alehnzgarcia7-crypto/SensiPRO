'use client';

// ═══════════════════════════════════════════════════════════════
// ARES — Finger Layout SVG — Mockup ultra-realista de pantalla
// Free Fire con HUD superpuesto. Simula una captura de juego con
// controles (joystick, disparo, mira, agacharse, saltar) y muestra
// qué dedo controla cada botón según el layout (2/3/4 dedos).
// ═══════════════════════════════════════════════════════════════

interface FingerLayoutSvgProps {
  fingers: 2 | 3 | 4;
  screenSize?: number;
}

// Colores por tipo de dedo
const CYAN = {
  main: '#06b6d4',
  bright: '#22d3ee',
  glow: 'rgba(6, 182, 212, 0.35)',
  glowSoft: 'rgba(6, 182, 212, 0.12)',
  text: '#a5f3fc',
} as const;

const ORANGE = {
  main: '#f97316',
  bright: '#fb923c',
  glow: 'rgba(249, 115, 22, 0.35)',
  glowSoft: 'rgba(249, 115, 22, 0.12)',
  text: '#fed7aa',
} as const;

const INACTIVE = {
  fill: '#1e293b',
  stroke: '#334155',
  text: '#475569',
} as const;

// Definición de cada botón del HUD en la pantalla
interface HudButton {
  id: string;
  label: string;
  type: 'circle' | 'rect' | 'joystick';
  x: number;
  y: number;
  // Para circle: radius. Para rect: width/height.
  r?: number;
  w?: number;
  h?: number;
}

const HUD_BUTTONS: HudButton[] = [
  // Joystick — esquina inferior izquierda
  { id: 'joystick', label: 'Mover', type: 'joystick', x: 58, y: 155, r: 28 },
  // Botón disparo — centro derecha abajo (grande, rojo)
  { id: 'fire', label: 'Disparo', type: 'circle', x: 355, y: 148, r: 22 },
  // Botón mira/scope — superior derecha
  { id: 'scope', label: 'Mira', type: 'circle', x: 370, y: 42, r: 14 },
  // Botón agacharse — inferior derecha (debajo de disparo)
  { id: 'crouch', label: 'Agachar', type: 'rect', x: 308, y: 160, w: 28, h: 18 },
  // Botón saltar — derecha medio
  { id: 'jump', label: 'Saltar', type: 'rect', x: 380, y: 100, w: 26, h: 18 },
  // Scope izquierdo (para garra) — superior izquierda
  { id: 'scope-l', label: 'Scope', type: 'circle', x: 50, y: 42, r: 14 },
];

// Qué botones activa cada dedo en cada layout
interface FingerAssignment {
  buttonId: string;
  fingerLabel: string;
  color: 'cyan' | 'orange';
}

const ASSIGNMENTS: Record<2 | 3 | 4, FingerAssignment[]> = {
  2: [
    { buttonId: 'joystick', fingerLabel: 'Pulgar Izq.', color: 'cyan' },
    { buttonId: 'fire', fingerLabel: 'Pulgar Der.', color: 'cyan' },
  ],
  3: [
    { buttonId: 'joystick', fingerLabel: 'Pulgar Izq.', color: 'cyan' },
    { buttonId: 'fire', fingerLabel: 'Pulgar Der.', color: 'cyan' },
    { buttonId: 'scope', fingerLabel: 'Índice Der.', color: 'orange' },
  ],
  4: [
    { buttonId: 'joystick', fingerLabel: 'Pulgar Izq.', color: 'cyan' },
    { buttonId: 'fire', fingerLabel: 'Pulgar Der.', color: 'cyan' },
    { buttonId: 'scope-l', fingerLabel: 'Índice Izq.', color: 'orange' },
    { buttonId: 'scope', fingerLabel: 'Índice Der.', color: 'orange' },
  ],
};

function isActive(buttonId: string, fingers: 2 | 3 | 4): FingerAssignment | undefined {
  return ASSIGNMENTS[fingers].find((a) => a.buttonId === buttonId);
}

function getColors(color: 'cyan' | 'orange') {
  return color === 'cyan' ? CYAN : ORANGE;
}

export function FingerLayoutSvg({ fingers }: FingerLayoutSvgProps) {
  const uid = `hud-${fingers}`;

  return (
    <div className="relative w-full max-w-[480px] mx-auto">
      {/* Estilos de animación CSS para el SVG */}
      <style>{`
        @keyframes hudPulse {
          0%, 100% { opacity: 0.7; transform-origin: center; transform: scale(1); }
          50% { opacity: 1; transform-origin: center; transform: scale(1.06); }
        }
        @keyframes hudGlow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .hud-btn-active { animation: hudPulse 2.5s ease-in-out infinite; }
        .hud-glow-ring { animation: hudGlow 2.5s ease-in-out infinite; }
      `}</style>

      <svg
        viewBox="0 0 420 200"
        className="w-full rounded-xl overflow-hidden"
        aria-label={`HUD layout de ${fingers} dedos — simulación de pantalla Free Fire`}
        style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.5))' }}
      >
        <defs>
          {/* Gradiente del fondo — escenario de juego */}
          <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0a1a0f" />
            <stop offset="40%" stopColor="#0d1f15" />
            <stop offset="70%" stopColor="#111a12" />
            <stop offset="100%" stopColor="#0a130e" />
          </linearGradient>

          {/* Glow filters */}
          <filter id={`${uid}-glow-cyan`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor={CYAN.main} floodOpacity="0.6" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`${uid}-glow-orange`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor={ORANGE.main} floodOpacity="0.6" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Clip para bordes redondeados */}
          <clipPath id={`${uid}-clip`}>
            <rect x="0" y="0" width="420" height="200" rx="12" ry="12" />
          </clipPath>

          {/* Patrón de grid para minimap */}
          <pattern id={`${uid}-grid`} width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke={CYAN.main} strokeWidth="0.3" strokeOpacity="0.3" />
          </pattern>
        </defs>

        {/* ═══ CAPA BASE: Escenario de juego ═══ */}
        <g clipPath={`url(#${uid}-clip)`}>
          {/* Fondo principal */}
          <rect width="420" height="200" fill={`url(#${uid}-bg)`} />

          {/* Textura de terreno sutil */}
          <rect x="0" y="130" width="420" height="70" fill="#0d1a10" fillOpacity="0.5" />
          <line x1="0" y1="130" x2="420" y2="130" stroke="#1a3020" strokeWidth="0.5" strokeOpacity="0.4" />

          {/* Líneas de perspectiva (suelo) */}
          <line x1="210" y1="90" x2="0" y2="200" stroke="#1a3020" strokeWidth="0.3" strokeOpacity="0.3" />
          <line x1="210" y1="90" x2="420" y2="200" stroke="#1a3020" strokeWidth="0.3" strokeOpacity="0.3" />
          <line x1="210" y1="90" x2="100" y2="200" stroke="#1a3020" strokeWidth="0.2" strokeOpacity="0.2" />
          <line x1="210" y1="90" x2="320" y2="200" stroke="#1a3020" strokeWidth="0.2" strokeOpacity="0.2" />

          {/* Edificios/estructuras silueta en el fondo */}
          <rect x="60" y="50" width="30" height="80" fill="#0f1a12" fillOpacity="0.6" rx="2" />
          <rect x="95" y="65" width="20" height="65" fill="#0d1810" fillOpacity="0.5" rx="1" />
          <rect x="280" y="55" width="35" height="75" fill="#0f1a12" fillOpacity="0.6" rx="2" />
          <rect x="320" y="70" width="22" height="60" fill="#0d1810" fillOpacity="0.5" rx="1" />

          {/* Cielo con gradiente */}
          <rect x="0" y="0" width="420" height="60" fill="#081210" fillOpacity="0.3" />

          {/* Scanline overlay sutil */}
          {Array.from({ length: 40 }).map((_, i) => (
            <line
              key={`scan-${i}`}
              x1="0"
              y1={i * 5}
              x2="420"
              y2={i * 5}
              stroke="#ffffff"
              strokeWidth="0.3"
              strokeOpacity="0.02"
            />
          ))}

          {/* ═══ UI OVERLAY: Elementos del HUD del juego ═══ */}

          {/* Barra de vida — parte superior */}
          <rect x="140" y="8" width="140" height="5" rx="2.5" fill="#1a2a1e" />
          <rect x="140" y="8" width="105" height="5" rx="2.5" fill="#22c55e" fillOpacity="0.8" />
          <rect x="140" y="8" width="105" height="2.5" rx="1.5" fill="#4ade80" fillOpacity="0.3" />

          {/* Nombre del jugador */}
          <text x="210" y="21" textAnchor="middle" fill="#94a3b8" fontSize="5" fontFamily="monospace" fillOpacity="0.6">
            PRO_PLAYER_01
          </text>

          {/* Minimap — esquina superior izquierda */}
          <circle cx="28" cy="28" r="22" fill="#0a1a10" fillOpacity="0.8" stroke={CYAN.main} strokeWidth="0.8" strokeOpacity="0.4" />
          <circle cx="28" cy="28" r="22" fill={`url(#${uid}-grid)`} />
          {/* Punto del jugador en minimap */}
          <circle cx="28" cy="28" r="2" fill={CYAN.bright} fillOpacity="0.9" />
          {/* Dirección en minimap */}
          <line x1="28" y1="28" x2="35" y2="22" stroke={CYAN.bright} strokeWidth="0.8" strokeOpacity="0.5" />
          {/* N/S/E/W */}
          <text x="28" y="9" textAnchor="middle" fill="#94a3b8" fontSize="3.5" fontFamily="monospace" fillOpacity="0.5">N</text>

          {/* Iconos de armas — esquina superior derecha */}
          <rect x="345" y="6" width="32" height="14" rx="3" fill="#1a2a1e" fillOpacity="0.7" stroke="#334155" strokeWidth="0.5" />
          <rect x="345" y="6" width="32" height="14" rx="3" fill="#f97316" fillOpacity="0.05" />
          <text x="361" y="15" textAnchor="middle" fill="#fb923c" fontSize="5" fontFamily="monospace" fillOpacity="0.7">AK</text>
          <rect x="380" y="6" width="32" height="14" rx="3" fill="#1a2a1e" fillOpacity="0.7" stroke="#334155" strokeWidth="0.5" />
          <text x="396" y="15" textAnchor="middle" fill="#94a3b8" fontSize="5" fontFamily="monospace" fillOpacity="0.5">M4</text>

          {/* Munición */}
          <text x="361" y="28" textAnchor="middle" fill="#fbbf24" fontSize="5" fontFamily="monospace" fillOpacity="0.6">30/90</text>

          {/* Crosshair central */}
          <g transform="translate(210, 95)" opacity="0.5">
            <line x1="-6" y1="0" x2="-2" y2="0" stroke="#ffffff" strokeWidth="0.8" />
            <line x1="2" y1="0" x2="6" y2="0" stroke="#ffffff" strokeWidth="0.8" />
            <line x1="0" y1="-6" x2="0" y2="-2" stroke="#ffffff" strokeWidth="0.8" />
            <line x1="0" y1="2" x2="0" y2="6" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1" fill="none" stroke="#ffffff" strokeWidth="0.5" />
          </g>

          {/* Kill feed sutil — esquina superior izquierda */}
          <text x="60" y="62" fill="#ef4444" fontSize="3.5" fontFamily="monospace" fillOpacity="0.4">
            Player98 eliminó a Noob123
          </text>

          {/* ═══ BOTONES DEL HUD ═══ */}
          {HUD_BUTTONS.map((btn) => {
            const assignment = isActive(btn.id, fingers);
            const active = !!assignment;
            const colors = assignment ? getColors(assignment.color) : null;

            if (btn.type === 'joystick') {
              const r = btn.r ?? 28;
              return (
                <g key={btn.id}>
                  {/* Glow ring si activo */}
                  {active && colors && (
                    <circle
                      cx={btn.x}
                      cy={btn.y}
                      r={r + 6}
                      fill="none"
                      stroke={colors.main}
                      strokeWidth="1.5"
                      strokeOpacity="0.2"
                      className="hud-glow-ring"
                    />
                  )}
                  {/* Círculo exterior del joystick */}
                  <circle
                    cx={btn.x}
                    cy={btn.y}
                    r={r}
                    fill={active ? colors?.glowSoft ?? '#1e293b20' : '#1e293b'}
                    fillOpacity={active ? 0.15 : 0.4}
                    stroke={active ? colors?.main ?? INACTIVE.stroke : INACTIVE.stroke}
                    strokeWidth={active ? 1.2 : 0.6}
                    strokeOpacity={active ? 0.7 : 0.3}
                  />
                  {/* Stick interior */}
                  <circle
                    cx={btn.x}
                    cy={btn.y}
                    r={r * 0.4}
                    fill={active ? colors?.main ?? INACTIVE.fill : INACTIVE.fill}
                    fillOpacity={active ? 0.25 : 0.5}
                    stroke={active ? colors?.bright ?? INACTIVE.stroke : INACTIVE.stroke}
                    strokeWidth={active ? 1 : 0.5}
                    strokeOpacity={active ? 0.8 : 0.4}
                    className={active ? 'hud-btn-active' : ''}
                    filter={active ? `url(#${uid}-glow-${assignment?.color})` : undefined}
                  />
                  {/* Flechas direccionales */}
                  {(['u', 'd', 'l', 'r'] as const).map((dir) => {
                    const arrowOffset = r * 0.7;
                    const positions = {
                      u: { x: btn.x, y: btn.y - arrowOffset },
                      d: { x: btn.x, y: btn.y + arrowOffset },
                      l: { x: btn.x - arrowOffset, y: btn.y },
                      r: { x: btn.x + arrowOffset, y: btn.y },
                    };
                    const pos = positions[dir];
                    return (
                      <polygon
                        key={dir}
                        points={
                          dir === 'u'
                            ? `${pos.x},${pos.y - 2} ${pos.x - 2.5},${pos.y + 1.5} ${pos.x + 2.5},${pos.y + 1.5}`
                            : dir === 'd'
                              ? `${pos.x},${pos.y + 2} ${pos.x - 2.5},${pos.y - 1.5} ${pos.x + 2.5},${pos.y - 1.5}`
                              : dir === 'l'
                                ? `${pos.x - 2},${pos.y} ${pos.x + 1.5},${pos.y - 2.5} ${pos.x + 1.5},${pos.y + 2.5}`
                                : `${pos.x + 2},${pos.y} ${pos.x - 1.5},${pos.y - 2.5} ${pos.x - 1.5},${pos.y + 2.5}`
                        }
                        fill={active ? colors?.main ?? INACTIVE.text : INACTIVE.text}
                        fillOpacity={active ? 0.4 : 0.15}
                      />
                    );
                  })}
                </g>
              );
            }

            if (btn.type === 'circle') {
              const r = btn.r ?? 14;
              const isFireBtn = btn.id === 'fire';
              return (
                <g key={btn.id}>
                  {active && colors && (
                    <circle
                      cx={btn.x}
                      cy={btn.y}
                      r={r + 5}
                      fill="none"
                      stroke={colors.main}
                      strokeWidth="1.2"
                      strokeOpacity="0.15"
                      className="hud-glow-ring"
                    />
                  )}
                  <circle
                    cx={btn.x}
                    cy={btn.y}
                    r={r}
                    fill={
                      active
                        ? isFireBtn
                          ? 'rgba(239, 68, 68, 0.15)'
                          : (colors?.glowSoft ?? INACTIVE.fill)
                        : INACTIVE.fill
                    }
                    fillOpacity={active ? 0.8 : 0.4}
                    stroke={
                      active
                        ? isFireBtn
                          ? '#ef4444'
                          : (colors?.main ?? INACTIVE.stroke)
                        : INACTIVE.stroke
                    }
                    strokeWidth={active ? 1.5 : 0.6}
                    strokeOpacity={active ? 0.8 : 0.3}
                    className={active ? 'hud-btn-active' : ''}
                    filter={active ? `url(#${uid}-glow-${assignment?.color})` : undefined}
                  />
                  {/* Icono interior para botón de fuego */}
                  {isFireBtn && (
                    <g transform={`translate(${btn.x}, ${btn.y})`}>
                      {/* Crosshair del botón de disparo */}
                      <circle cx="0" cy="0" r={r * 0.45} fill="none" stroke={active ? '#ef4444' : INACTIVE.text} strokeWidth="0.8" strokeOpacity={active ? 0.6 : 0.2} />
                      <line x1="0" y1={-r * 0.3} x2="0" y2={r * 0.3} stroke={active ? '#ef4444' : INACTIVE.text} strokeWidth="0.6" strokeOpacity={active ? 0.5 : 0.15} />
                      <line x1={-r * 0.3} y1="0" x2={r * 0.3} y2="0" stroke={active ? '#ef4444' : INACTIVE.text} strokeWidth="0.6" strokeOpacity={active ? 0.5 : 0.15} />
                    </g>
                  )}
                  {/* Icono de scope/mira */}
                  {(btn.id === 'scope' || btn.id === 'scope-l') && (
                    <g transform={`translate(${btn.x}, ${btn.y})`}>
                      <circle cx="0" cy="0" r={r * 0.5} fill="none" stroke={active ? (colors?.main ?? INACTIVE.text) : INACTIVE.text} strokeWidth="0.6" strokeOpacity={active ? 0.6 : 0.2} />
                      <line x1="0" y1={-r * 0.35} x2="0" y2={r * 0.35} stroke={active ? (colors?.main ?? INACTIVE.text) : INACTIVE.text} strokeWidth="0.5" strokeOpacity={active ? 0.5 : 0.15} />
                      <line x1={-r * 0.35} y1="0" x2={r * 0.35} y2="0" stroke={active ? (colors?.main ?? INACTIVE.text) : INACTIVE.text} strokeWidth="0.5" strokeOpacity={active ? 0.5 : 0.15} />
                    </g>
                  )}
                  {/* Label del botón */}
                  <text
                    x={btn.x}
                    y={btn.y + r + 8}
                    textAnchor="middle"
                    fill={active ? (colors?.text ?? INACTIVE.text) : INACTIVE.text}
                    fontSize="4"
                    fontFamily="monospace"
                    fillOpacity={active ? 0.8 : 0.3}
                  >
                    {btn.label}
                  </text>
                </g>
              );
            }

            // Rect buttons (crouch, jump)
            const w = btn.w ?? 28;
            const h = btn.h ?? 18;
            return (
              <g key={btn.id}>
                {active && colors && (
                  <rect
                    x={btn.x - w / 2 - 3}
                    y={btn.y - h / 2 - 3}
                    width={w + 6}
                    height={h + 6}
                    rx="5"
                    fill="none"
                    stroke={colors.main}
                    strokeWidth="1"
                    strokeOpacity="0.15"
                    className="hud-glow-ring"
                  />
                )}
                <rect
                  x={btn.x - w / 2}
                  y={btn.y - h / 2}
                  width={w}
                  height={h}
                  rx="4"
                  fill={active ? (colors?.glowSoft ?? INACTIVE.fill) : INACTIVE.fill}
                  fillOpacity={active ? 0.8 : 0.4}
                  stroke={active ? (colors?.main ?? INACTIVE.stroke) : INACTIVE.stroke}
                  strokeWidth={active ? 1 : 0.5}
                  strokeOpacity={active ? 0.7 : 0.3}
                  className={active ? 'hud-btn-active' : ''}
                />
                <text
                  x={btn.x}
                  y={btn.y + 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={active ? (colors?.text ?? INACTIVE.text) : INACTIVE.text}
                  fontSize="4.5"
                  fontFamily="monospace"
                  fillOpacity={active ? 0.8 : 0.3}
                >
                  {btn.label}
                </text>
              </g>
            );
          })}

          {/* ═══ LÍNEAS DE CONEXIÓN DEDO → BOTÓN ═══ */}
          {ASSIGNMENTS[fingers].map((assignment) => {
            const btn = HUD_BUTTONS.find((b) => b.id === assignment.buttonId);
            if (!btn) return null;
            const colors = getColors(assignment.color);

            // Posición del label del dedo (fuera de la pantalla, en el borde)
            const isLeft = btn.x < 210;
            const isTop = btn.y < 100;
            const labelX = isLeft ? 8 : 412;
            const labelY = isTop ? btn.y + 12 : btn.y - 8;

            return (
              <g key={assignment.buttonId}>
                {/* Línea punteada */}
                <line
                  x1={labelX}
                  y1={labelY}
                  x2={btn.x}
                  y2={btn.y}
                  stroke={colors.main}
                  strokeWidth="0.6"
                  strokeDasharray="3 2"
                  strokeOpacity="0.35"
                />
                {/* Badge del dedo */}
                <rect
                  x={isLeft ? 2 : 374}
                  y={labelY - 5.5}
                  width={isLeft ? 44 : 44}
                  height="11"
                  rx="3"
                  fill={colors.main}
                  fillOpacity="0.12"
                  stroke={colors.main}
                  strokeWidth="0.5"
                  strokeOpacity="0.3"
                />
                <text
                  x={isLeft ? 24 : 396}
                  y={labelY + 1.5}
                  textAnchor="middle"
                  fill={colors.text}
                  fontSize="4"
                  fontFamily="monospace"
                  fontWeight="bold"
                  fillOpacity="0.9"
                >
                  {assignment.fingerLabel}
                </text>
              </g>
            );
          })}

          {/* ═══ LEYENDA ═══ */}
          <g transform="translate(140, 188)">
            <circle cx="0" cy="0" r="3" fill={CYAN.main} fillOpacity="0.5" stroke={CYAN.bright} strokeWidth="0.5" />
            <text x="6" y="1.5" fill="#94a3b8" fontSize="4.5" fontFamily="monospace">
              Pulgar
            </text>
            {fingers > 2 && (
              <>
                <circle cx="50" cy="0" r="3" fill={ORANGE.main} fillOpacity="0.5" stroke={ORANGE.bright} strokeWidth="0.5" />
                <text x="56" y="1.5" fill="#94a3b8" fontSize="4.5" fontFamily="monospace">
                  Índice
                </text>
              </>
            )}
            <rect x="100" y="-3" width="3" height="6" rx="1" fill={INACTIVE.fill} stroke={INACTIVE.stroke} strokeWidth="0.5" />
            <text x="106" y="1.5" fill="#64748b" fontSize="4.5" fontFamily="monospace">
              No asignado
            </text>
          </g>

          {/* Notch sutil (simulando celular) */}
          <rect x="180" y="0" width="60" height="4" rx="0 0 4 4" fill="#050810" fillOpacity="0.6" />

          {/* Borde de pantalla de celular */}
          <rect
            x="0.5"
            y="0.5"
            width="419"
            height="199"
            rx="12"
            ry="12"
            fill="none"
            stroke="#334155"
            strokeWidth="1"
            strokeOpacity="0.4"
          />

          {/* Sombra interna para profundidad */}
          <rect
            x="0"
            y="0"
            width="420"
            height="200"
            rx="12"
            ry="12"
            fill="none"
            stroke="#000000"
            strokeWidth="3"
            strokeOpacity="0.3"
          />
        </g>
      </svg>
    </div>
  );
}
