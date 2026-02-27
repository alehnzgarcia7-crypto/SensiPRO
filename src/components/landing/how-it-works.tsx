'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Search, Sliders, Check } from 'lucide-react';

import { LANDING_DATA } from '@/lib/landing-data';

// ═══════════════════════════════════════════════════════════════
// HowItWorks — 3 cinematic steps with animated mini demos
// Step cards with watermark numbers, connection line, stagger
// ═══════════════════════════════════════════════════════════════

// ── Mini Demo: Search autocomplete ──
function SearchDemo() {
  const [text, setText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const fullText = 'Samsung Gal';
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const runAnimation = useCallback(() => {
    setText('');
    setShowDropdown(false);
    setSelectedIndex(-1);
    let i = 0;

    const type = () => {
      if (i < fullText.length) {
        i++;
        setText(fullText.slice(0, i));
        timerRef.current = setTimeout(type, 50);
      } else {
        // Mostrar dropdown
        timerRef.current = setTimeout(() => {
          setShowDropdown(true);
          // Seleccionar primer resultado
          timerRef.current = setTimeout(() => {
            setSelectedIndex(0);
          }, 600);
        }, 300);
      }
    };
    timerRef.current = setTimeout(type, 500);
  }, []);

  useEffect(() => {
    runAnimation();
    const interval = setInterval(runAnimation, 8000);
    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [runAnimation]);

  const results = ['Galaxy S24 Ultra', 'Galaxy A54', 'Galaxy A14'];

  return (
    <div className="mt-5 space-y-1.5">
      <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2">
        <Search size={14} className="text-slate-500 shrink-0" />
        <span className="text-sm text-slate-300">{text}<span className="inline-block w-[1px] h-3.5 bg-cyan-400 ml-0.5 animate-[blink_1s_step-end_infinite]" /></span>
      </div>
      {showDropdown && (
        <div className="bg-white/[0.04] border border-white/10 rounded-lg overflow-hidden">
          {results.map((r, i) => (
            <div
              key={r}
              className={`px-3 py-1.5 text-xs transition-colors duration-200 ${
                i === selectedIndex ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400'
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              Samsung {r}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Mini Demo: Config toggles ──
function ConfigDemo() {
  const [activeHz, setActiveHz] = useState(0);
  const [ramPos, setRamPos] = useState(0);
  const [dpiOn, setDpiOn] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const runAnimation = useCallback(() => {
    setActiveHz(0);
    setRamPos(0);
    setDpiOn(false);

    timerRef.current = setTimeout(() => {
      setRamPos(60); // 6GB
      timerRef.current = setTimeout(() => {
        setActiveHz(1); // 90Hz
        timerRef.current = setTimeout(() => {
          setActiveHz(2); // 120Hz
          timerRef.current = setTimeout(() => {
            setDpiOn(true);
          }, 600);
        }, 600);
      }, 600);
    }, 500);
  }, []);

  useEffect(() => {
    runAnimation();
    const interval = setInterval(runAnimation, 8000);
    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [runAnimation]);

  const hzOptions = ['60', '90', '120'];

  return (
    <div className="mt-5 space-y-3">
      {/* RAM slider */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>RAM</span>
          <span className="text-cyan-400">{ramPos === 0 ? '4GB' : '6GB'}</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${ramPos || 40}%` }}
          />
        </div>
      </div>
      {/* Hz toggle */}
      <div className="flex gap-1.5">
        {hzOptions.map((hz, i) => (
          <div
            key={hz}
            className={`flex-1 text-center py-1 rounded text-[10px] font-semibold transition-all duration-300 ${
              i === activeHz
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-white/[0.03] text-slate-500 border border-white/5'
            }`}
          >
            {hz} Hz
          </div>
        ))}
      </div>
      {/* DPI toggle */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500">DPI Custom</span>
        <div className={`w-8 h-4 rounded-full transition-colors duration-300 relative ${dpiOn ? 'bg-cyan-500' : 'bg-white/10'}`}>
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-300 ${dpiOn ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </div>
      </div>
    </div>
  );
}

// ── Mini Demo: Sensitivity bars ──
function SensiBarsDemo() {
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const values = [
    { label: 'General', value: 174 },
    { label: 'Punto Rojo', value: 159 },
    { label: '2x', value: 144 },
    { label: '4x', value: 129 },
    { label: 'AWM', value: 114 },
    { label: 'Vista Libre', value: 16 },
  ];

  const runAnimation = useCallback(() => {
    setProgress(0);
    setCopied(false);
    let step = 0;

    const next = () => {
      if (step <= values.length) {
        step++;
        setProgress(step);
        timerRef.current = setTimeout(next, 200);
      } else {
        timerRef.current = setTimeout(() => setCopied(true), 400);
      }
    };
    timerRef.current = setTimeout(next, 500);
  }, [values.length]);

  useEffect(() => {
    runAnimation();
    const interval = setInterval(runAnimation, 8000);
    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [runAnimation]);

  return (
    <div className="mt-5 space-y-1.5">
      {values.map((v, i) => (
        <div key={v.label} className="flex items-center gap-2">
          <span className="text-[9px] text-slate-500 w-14 text-right shrink-0">{v.label}</span>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: i < progress ? `${(v.value / 200) * 100}%` : '0%' }}
            />
          </div>
          <span className={`text-[10px] font-mono w-7 text-right transition-opacity duration-300 ${i < progress ? 'text-cyan-400 opacity-100' : 'opacity-0'}`}>
            {v.value}
          </span>
        </div>
      ))}
      <div className="flex justify-end pt-1">
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all duration-300 ${
          copied ? 'bg-green-500/20 text-green-400' : 'bg-white/[0.04] text-slate-500'
        }`}>
          {copied ? <Check size={10} /> : null}
          {copied ? 'Copiado ✓' : 'Copiar'}
        </div>
      </div>
    </div>
  );
}

// ── Step Card ──
interface StepProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  demo: React.ReactNode;
  delay: number;
}

function StepCard({ number, icon, title, description, demo, delay }: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="relative bg-white/[0.02] border border-white/5 rounded-[20px] p-8 hover:border-cyan-500/20 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Watermark number */}
      <span className="absolute top-4 right-5 font-heading text-[80px] font-black leading-none text-white/[0.04] select-none pointer-events-none">
        {number}
      </span>

      {/* Icon */}
      <div className="relative z-10">
        {icon}
      </div>

      {/* Content */}
      <h3 className="mt-4 text-lg font-display font-bold text-white relative z-10">{title}</h3>
      <p className="mt-2 text-sm text-slate-400 leading-relaxed relative z-10">{description}</p>

      {/* Mini demo */}
      <div className="relative z-10">{demo}</div>
    </motion.div>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-display font-bold text-center text-white"
        >
          ¿Cómo funciona?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-center text-slate-400 font-body"
        >
          Tres pasos. Diez segundos. Tu sensibilidad calibrada.
        </motion.p>

        {/* Steps grid */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 relative">
          {/* Connection line (desktop only) */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="hidden md:block absolute top-[60px] left-[16.67%] right-[16.67%] h-[2px] origin-left"
            style={{
              background: 'linear-gradient(90deg, #06b6d4, #3b82f6, #22c55e)',
              boxShadow: '0 0 8px rgba(6, 182, 212, 0.3)',
            }}
          />

          <StepCard
            number="01"
            icon={<div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20"><Search size={22} className="text-cyan-400" /></div>}
            title="Busca tu celular"
            description={`Escribe tu modelo entre ${LANDING_DATA.deviceCount}+ dispositivos de ${LANDING_DATA.brandCount} marcas. Samsung, Xiaomi, iPhone, POCO, Motorola, Redmi y 20 más.`}
            demo={<SearchDemo />}
            delay={0}
          />

          <StepCard
            number="02"
            icon={<div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20"><Sliders size={22} className="text-blue-400" /></div>}
            title="Ajusta tu config"
            description="Selecciona tu RAM, elige entre 60, 90 o 120 Hz, activa DPI si quieres máxima precisión, y elige tu estilo entre 9 opciones."
            demo={<ConfigDemo />}
            delay={0.15}
          />

          <StepCard
            number="03"
            icon={<div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20"><Check size={22} className="text-green-400" /></div>}
            title="Copia y juega"
            description="Copia tus 6 valores de sensibilidad + giroscopio + código HUD directo a Free Fire. También puedes exportar como imagen para tu squad."
            demo={<SensiBarsDemo />}
            delay={0.3}
          />
        </div>
      </div>
    </section>
  );
}
