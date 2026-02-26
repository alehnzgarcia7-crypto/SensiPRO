'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { getHudLayout, type FingerCount, type HudButton } from '@ares/algorithms';

interface HudVisualizationProps {
  fingers: FingerCount;
  width?: number;
  showLabels?: boolean;
}

// Map button.size (20-100) → radius (3-9)
function sizeToRadius(size: number): number {
  return 3 + ((size - 20) / 80) * 6;
}

function ButtonTooltip({ button }: { button: HudButton }) {
  return (
    <div className="absolute z-50 px-2.5 py-1.5 rounded-lg bg-slate-900/95 border border-white/10 text-[10px] font-body text-white whitespace-nowrap shadow-lg pointer-events-none"
      style={{ backdropFilter: 'blur(12px)' }}
    >
      <p className="font-ui font-bold">{button.nameEs}</p>
      <p className="text-slate-400">{button.fingerEs}</p>
      <p className="text-slate-500">Tamaño: {button.size}% · Opacidad: {button.transparency}%</p>
    </div>
  );
}

export function HudVisualization({ fingers, showLabels = true }: HudVisualizationProps) {
  const layout = getHudLayout(fingers);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Unique fingers for legend
  const uniqueFingers = layout.fingerRoles.map((r) => ({
    name: r.fingerEs,
    color: r.color,
  }));

  return (
    <div className="w-full">
      {/* Phone frame */}
      <div className="relative mx-auto max-w-[420px]">
        <div className="relative rounded-2xl overflow-hidden border border-white/10"
          style={{
            background: 'linear-gradient(145deg, rgba(15,23,42,0.95), rgba(2,6,23,0.98))',
            boxShadow: '0 0 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Grid texture overlay */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.5) 19px, rgba(255,255,255,0.5) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.5) 19px, rgba(255,255,255,0.5) 20px)',
            }}
          />

          <AnimatePresence mode="wait">
            <motion.svg
              key={fingers}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              width="100%"
              viewBox="0 0 100 56"
              preserveAspectRatio="xMidYMid meet"
              className="relative z-10"
            >
              <defs>
                {/* Glow filter for critical buttons */}
                <filter id="hud-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Buttons */}
              {layout.buttons.map((btn) => {
                const r = sizeToRadius(btn.size);
                const opacity = btn.transparency / 100;
                const isCritical = btn.priority === 'critical';
                const isHovered = hoveredId === btn.id;

                return (
                  <g
                    key={btn.id}
                    onMouseEnter={() => setHoveredId(btn.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Button circle */}
                    <circle
                      cx={btn.x}
                      cy={btn.y * 0.56}
                      r={r}
                      fill={btn.color}
                      fillOpacity={opacity * 0.25}
                      stroke={btn.color}
                      strokeWidth={isCritical ? 0.6 : 0.35}
                      strokeOpacity={opacity * 0.7}
                      filter={isCritical ? 'url(#hud-glow)' : undefined}
                    />

                    {/* Inner circle for critical */}
                    {isCritical && (
                      <circle
                        cx={btn.x}
                        cy={btn.y * 0.56}
                        r={r * 0.55}
                        fill={btn.color}
                        fillOpacity={opacity * 0.15}
                      />
                    )}

                    {/* Hover ring */}
                    {isHovered && (
                      <circle
                        cx={btn.x}
                        cy={btn.y * 0.56}
                        r={r + 1.2}
                        fill="none"
                        stroke="white"
                        strokeWidth="0.3"
                        strokeOpacity="0.5"
                      />
                    )}

                    {/* Label */}
                    {showLabels && (
                      <text
                        x={btn.x}
                        y={btn.y * 0.56 + 0.5}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fillOpacity={isHovered ? 1 : 0.7}
                        fontSize={r > 5 ? '2.8' : '2.2'}
                        fontFamily="system-ui, sans-serif"
                        fontWeight="600"
                      >
                        {btn.nameEs.length > 8 ? btn.nameEs.slice(0, 7) + '…' : btn.nameEs}
                      </text>
                    )}
                  </g>
                );
              })}
            </motion.svg>
          </AnimatePresence>

          {/* Tooltip overlay */}
          {hoveredId && (() => {
            const btn = layout.buttons.find((b) => b.id === hoveredId);
            if (!btn) return null;
            return (
              <div
                className="absolute z-50"
                style={{
                  left: `${btn.x}%`,
                  top: `${btn.y * 0.56}%`,
                  transform: 'translate(-50%, -120%)',
                }}
              >
                <ButtonTooltip button={btn} />
              </div>
            );
          })()}
        </div>

        {/* Notch indicator */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b-full bg-white/5" />
      </div>

      {/* Finger legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
        {uniqueFingers.map((f) => (
          <div key={f.name} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: f.color, boxShadow: `0 0 6px ${f.color}40` }}
            />
            <span className="text-[10px] font-ui text-slate-400">{f.name}</span>
          </div>
        ))}
      </div>

      {/* Layout name */}
      <p className={cn(
        'text-center mt-2 text-xs font-heading uppercase tracking-wider',
        'text-slate-500',
      )}>
        {layout.nameEs}
      </p>
    </div>
  );
}
