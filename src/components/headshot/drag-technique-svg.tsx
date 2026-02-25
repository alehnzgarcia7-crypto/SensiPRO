'use client';

interface DragTechniqueSvgProps {
  svgPath: string;
  color: string;
  name: string;
}

export function DragTechniqueSvg({ svgPath, color, name }: DragTechniqueSvgProps) {
  const pathId = `drag-path-${name.replace(/\s/g, '-').toLowerCase()}`;

  return (
    <div className="relative aspect-video bg-black/30 rounded-lg overflow-hidden border border-white/5">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {/* Grid background */}
        <defs>
          <pattern id={`grid-${pathId}`} width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill={`url(#grid-${pathId})`} />

        {/* Silueta simple de cabeza como target */}
        <circle cx="50" cy="22" r="5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        <line x1="50" y1="27" x2="50" y2="42" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

        {/* Head level line */}
        <line x1="10" y1="22" x2="90" y2="22" stroke={color} strokeWidth="0.3" strokeDasharray="2,2" opacity="0.3" />

        {/* Animated drag path */}
        <path
          d={svgPath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="200"
          style={{
            animation: 'drawPath 2s ease-in-out infinite',
            filter: `drop-shadow(0 0 4px ${color})`,
          }}
        />

        {/* Finger dot that follows the path */}
        <circle r="3" fill={color} opacity="0.8"
          style={{
            offsetPath: `path('${svgPath}')`,
            animation: 'moveDot 2s ease-in-out infinite',
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />

        {/* HEADSHOT flash at endpoint */}
        <text
          x="50" y="18"
          textAnchor="middle"
          fill="#ef4444"
          fontSize="6"
          fontFamily="Orbitron, sans-serif"
          fontWeight="bold"
          style={{ animation: 'headshotFlash 2s ease-in-out infinite' }}
        >
          HEADSHOT!
        </text>
      </svg>
    </div>
  );
}
