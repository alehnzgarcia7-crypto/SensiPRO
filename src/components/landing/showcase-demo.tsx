'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

import { cn } from '@/lib/cn';
import { ScrollReveal } from './scroll-reveal';

// --- Datos del demo (hardcodeados, NO fetch al API) ---

interface DemoDevice {
  name: string;
  values: { label: string; value: number }[];
  score: number;
}

const DEMO_DEVICES: DemoDevice[] = [
  {
    name: 'Redmi Note 12',
    values: [
      { label: 'General', value: 185 },
      { label: 'Punto Rojo', value: 177 },
      { label: 'Mira 2x', value: 160 },
      { label: 'Mira 4x', value: 137 },
      { label: 'AWM', value: 83 },
      { label: 'Vista Libre', value: 171 },
    ],
    score: 72,
  },
  {
    name: 'Samsung A54',
    values: [
      { label: 'General', value: 198 },
      { label: 'Punto Rojo', value: 191 },
      { label: 'Mira 2x', value: 174 },
      { label: 'Mira 4x', value: 149 },
      { label: 'AWM', value: 92 },
      { label: 'Vista Libre', value: 185 },
    ],
    score: 81,
  },
  {
    name: 'iPhone 15',
    values: [
      { label: 'General', value: 210 },
      { label: 'Punto Rojo', value: 203 },
      { label: 'Mira 2x', value: 188 },
      { label: 'Mira 4x', value: 162 },
      { label: 'AWM', value: 98 },
      { label: 'Vista Libre', value: 196 },
    ],
    score: 89,
  },
];

const CYCLE_DURATION = 8000; // 8s entre devices
const TYPING_SPEED = 80; // ms por letra
const CALC_DURATION = 1500; // 1.5s loading bar
const STAGGER_DELAY = 200; // delay entre cada valor

type Phase = 'typing' | 'selected' | 'calculating' | 'revealing' | 'done';

// --- CountUp hook para números individuales ---

function useCountUp(target: number, active: boolean, duration = 800): number {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setCurrent(0);
      return;
    }
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, active, duration]);

  return current;
}

// --- Gauge SVG ---

function ScoreGauge({ score, active }: { score: number; active: boolean }) {
  const displayScore = useCountUp(score, active);
  const circumference = 2 * Math.PI * 40;
  const progress = active ? (score / 100) * circumference : 0;

  return (
    <div className="relative w-20 h-20 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff6a00" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-lg font-bold text-white">{displayScore}</span>
      </div>
    </div>
  );
}

// --- Valor individual con countup ---

function SensitivityValue({ label, value, active, delay }: { label: string; value: number; active: boolean; delay: number }) {
  const [show, setShow] = useState(false);
  const count = useCountUp(value, show);

  useEffect(() => {
    if (!active) {
      setShow(false);
      return;
    }
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [active, delay]);

  return (
    <div
      className={cn(
        'flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-300',
        show ? 'opacity-100 bg-white/[0.03]' : 'opacity-0 translate-y-2',
      )}
    >
      <span className="text-xs text-slate-400 font-body">{label}</span>
      <span className="font-mono text-sm font-bold text-white">{show ? count : 0}</span>
    </div>
  );
}

// --- Componente principal ---

export function ShowcaseDemo() {
  const [deviceIndex, setDeviceIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');
  const [typedText, setTypedText] = useState('');
  const [calcProgress, setCalcProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);
  const cycleTimer = useRef<ReturnType<typeof setTimeout>>();

  const device = DEMO_DEVICES[deviceIndex] ?? DEMO_DEVICES[0]!;

  const runAnimation = useCallback((devIdx: number) => {
    const dev = DEMO_DEVICES[devIdx] ?? DEMO_DEVICES[0]!;
    const fullName = dev.name;
    setPhase('typing');
    setTypedText('');
    setCalcProgress(0);

    // Phase 1: Typing
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      charIndex++;
      setTypedText(fullName.slice(0, charIndex));
      if (charIndex >= fullName.length) {
        clearInterval(typeInterval);
        // Phase 2: Selected flash
        setTimeout(() => {
          setPhase('selected');
          // Phase 3: Calculating
          setTimeout(() => {
            setPhase('calculating');
            const calcStart = performance.now();
            const animateCalc = (now: number) => {
              const p = Math.min((now - calcStart) / CALC_DURATION, 1);
              setCalcProgress(p * 100);
              if (p < 1) {
                requestAnimationFrame(animateCalc);
              } else {
                // Phase 4: Revealing values
                setPhase('revealing');
                // Phase 5: Done (show badge)
                setTimeout(() => {
                  setPhase('done');
                }, STAGGER_DELAY * 6 + 600);
              }
            };
            requestAnimationFrame(animateCalc);
          }, 400);
        }, 300);
      }
    }, TYPING_SPEED);

    return () => clearInterval(typeInterval);
  }, []);

  // IntersectionObserver para iniciar al entrar en viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          runAnimation(0);
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [runAnimation]);

  // Ciclo automático entre devices
  useEffect(() => {
    if (phase !== 'done') return;

    cycleTimer.current = setTimeout(() => {
      const next = (deviceIndex + 1) % DEMO_DEVICES.length;
      setDeviceIndex(next);
      runAnimation(next);
    }, 2500);

    return () => clearTimeout(cycleTimer.current);
  }, [phase, deviceIndex, runAnimation]);

  const isRevealing = phase === 'revealing' || phase === 'done';

  return (
    <section ref={sectionRef} className="py-20 px-4">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-white">
            Vélo en acción
          </h2>
          <p className="mt-3 text-center text-slate-400 font-ui text-lg">
            Así se ve tu sensibilidad personalizada
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="mt-12">
            {/* AnimatedBorder wrapper */}
            <div className="animated-border-wrapper">
              <div className="animated-border-gradient" />
              <div className="animated-border-content p-6 md:p-10">

                {/* Buscador simulado */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2">
                    <span className="text-slate-600 text-sm">🔍</span>
                    <span className="font-body text-sm text-white">
                      {typedText}
                      {phase === 'typing' && (
                        <span className="inline-block w-0.5 h-4 bg-fire-500 animate-pulse ml-0.5 align-middle" />
                      )}
                    </span>
                    {!typedText && (
                      <span className="text-slate-600 text-sm font-body">Busca tu dispositivo...</span>
                    )}
                  </div>
                  {(phase === 'selected' || phase === 'calculating' || isRevealing) && (
                    <div className="px-3 py-1.5 rounded-lg bg-success/10 border border-success/20 text-success text-xs font-ui font-bold animate-fade-in">
                      ✓ Seleccionado
                    </div>
                  )}
                </div>

                {/* Loading bar */}
                {phase === 'calculating' && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500 font-ui">Analizando hardware...</span>
                      <span className="text-xs text-slate-500 font-mono">{Math.round(calcProgress)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-fire-500 to-ice-500 transition-none"
                        style={{ width: `${calcProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Resultados */}
                {isRevealing && (
                  <div className="grid md:grid-cols-[1fr_auto] gap-8">
                    {/* 6 valores */}
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 font-ui uppercase tracking-wider mb-3">
                        Sensibilidad — {device.name}
                      </p>
                      {device.values.map((v, i) => (
                        <SensitivityValue
                          key={v.label}
                          label={v.label}
                          value={v.value}
                          active={isRevealing}
                          delay={i * STAGGER_DELAY}
                        />
                      ))}
                    </div>

                    {/* Score gauge */}
                    <div className="flex flex-col items-center justify-center gap-3">
                      <p className="text-xs text-slate-500 font-ui uppercase tracking-wider">Performance</p>
                      <ScoreGauge score={device.score} active={isRevealing} />
                    </div>
                  </div>
                )}

                {/* Badge final */}
                {phase === 'done' && (
                  <div className="mt-6 flex justify-center animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20">
                      <span className="text-success text-sm font-ui font-bold">
                        ✓ RECOMENDADO PARA TU DISPOSITIVO
                      </span>
                    </div>
                  </div>
                )}

                {/* Empty state placeholder */}
                {phase === 'typing' && !typedText && (
                  <div className="h-48 flex items-center justify-center">
                    <p className="text-sm text-slate-600 font-body">Esperando dispositivo...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal delay={300}>
          <div className="mt-10 text-center">
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-fire-500 to-ice-500 text-white font-ui font-bold text-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-glow-fire min-h-[52px]"
            >
              <Zap size={20} />
              Pruébalo con tu celular
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
