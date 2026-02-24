'use client';

import { motion } from 'framer-motion';

interface FingerLayoutSvgProps {
  fingers: 2 | 3 | 4;
  screenSize?: number;
}

interface FingerCircle {
  cx: number;
  cy: number;
  label: string;
  color: 'cyan' | 'orange';
}

const FINGER_LAYOUTS: Record<2 | 3 | 4, FingerCircle[]> = {
  2: [
    { cx: 25, cy: 78, label: 'Mover', color: 'cyan' },
    { cx: 75, cy: 78, label: 'Disparar', color: 'cyan' },
  ],
  3: [
    { cx: 25, cy: 78, label: 'Mover', color: 'cyan' },
    { cx: 75, cy: 78, label: 'Disparar', color: 'cyan' },
    { cx: 80, cy: 22, label: 'Apuntar', color: 'orange' },
  ],
  4: [
    { cx: 25, cy: 78, label: 'Mover', color: 'cyan' },
    { cx: 75, cy: 78, label: 'Disparar', color: 'cyan' },
    { cx: 20, cy: 22, label: 'Scope', color: 'orange' },
    { cx: 80, cy: 22, label: 'Apuntar', color: 'orange' },
  ],
};

const COLOR_MAP = {
  cyan: {
    fill: '#06b6d4',
    fillOpacity: 0.25,
    stroke: '#22d3ee',
    glow: '#06b6d4',
    text: '#a5f3fc',
  },
  orange: {
    fill: '#f97316',
    fillOpacity: 0.25,
    stroke: '#fb923c',
    glow: '#f97316',
    text: '#fed7aa',
  },
} as const;

// Proporción de pantalla basada en screenSize (pulgadas)
function getAspectRatio(screenSize?: number): { width: number; height: number } {
  const size = screenSize ?? 6.5;
  // Pantallas más grandes tienden a ser más angostas (aspect ratio mayor)
  if (size >= 6.7) return { width: 200, height: 92 };
  if (size >= 6.3) return { width: 200, height: 96 };
  return { width: 200, height: 100 };
}

export function FingerLayoutSvg({ fingers, screenSize }: FingerLayoutSvgProps) {
  const layout = FINGER_LAYOUTS[fingers];
  const aspect = getAspectRatio(screenSize);

  // Viewbox proporcional a la pantalla
  const vbW = 200;
  const vbH = aspect.height;
  const rx = 12;
  const ry = 12;
  const circleR = 12;

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      className="w-full max-w-[280px] mx-auto"
      aria-label={`Layout de ${fingers} dedos`}
    >
      <defs>
        <filter id={`glow-cyan-${fingers}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`glow-orange-${fingers}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Marco del teléfono */}
      <rect
        x="2"
        y="2"
        width={vbW - 4}
        height={vbH - 4}
        rx={rx}
        ry={ry}
        fill="none"
        stroke="#334155"
        strokeWidth="1.5"
        strokeDasharray="4 2"
      />

      {/* Etiqueta central sutil */}
      <text
        x={vbW / 2}
        y={vbH / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-slate-700 text-[8px]"
        fontFamily="monospace"
      >
        FREE FIRE
      </text>

      {/* Círculos de dedos con animación */}
      {layout.map((finger, i) => {
        const colors = COLOR_MAP[finger.color];
        const actualCx = (finger.cx / 100) * (vbW - 8) + 4;
        const actualCy = (finger.cy / 100) * (vbH - 8) + 4;

        return (
          <motion.g
            key={`${fingers}-${finger.label}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: i * 0.12, type: 'spring', stiffness: 200 }}
          >
            {/* Glow circle */}
            <motion.circle
              cx={actualCx}
              cy={actualCy}
              r={circleR + 3}
              fill={colors.glow}
              fillOpacity={0.08}
              animate={{
                r: [circleR + 3, circleR + 6, circleR + 3],
                fillOpacity: [0.08, 0.15, 0.08],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />

            {/* Círculo principal */}
            <circle
              cx={actualCx}
              cy={actualCy}
              r={circleR}
              fill={colors.fill}
              fillOpacity={colors.fillOpacity}
              stroke={colors.stroke}
              strokeWidth="1.5"
              filter={`url(#glow-${finger.color}-${fingers})`}
            />

            {/* Ícono/Label */}
            <text
              x={actualCx}
              y={actualCy + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={colors.text}
              fontSize="6"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {finger.label}
            </text>
          </motion.g>
        );
      })}

      {/* Leyenda abajo */}
      <g>
        <circle cx={vbW / 2 - 30} cy={vbH - 8} r="3" fill="#06b6d4" fillOpacity={0.5} stroke="#22d3ee" strokeWidth="0.5" />
        <text x={vbW / 2 - 24} y={vbH - 6.5} fill="#94a3b8" fontSize="5" fontFamily="monospace">
          Pulgar
        </text>
        {fingers > 2 && (
          <>
            <circle cx={vbW / 2 + 15} cy={vbH - 8} r="3" fill="#f97316" fillOpacity={0.5} stroke="#fb923c" strokeWidth="0.5" />
            <text x={vbW / 2 + 21} y={vbH - 6.5} fill="#94a3b8" fontSize="5" fontFamily="monospace">
              Índice
            </text>
          </>
        )}
      </g>
    </svg>
  );
}
