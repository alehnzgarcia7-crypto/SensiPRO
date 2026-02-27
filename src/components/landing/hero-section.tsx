'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';

import { LANDING_DATA } from '@/lib/landing-data';

// ═══════════════════════════════════════════════════════════════
// HeroSection — Gradient mesh + word stagger + typewriter +
// CTA rotating border + floating badge + scroll indicator
// ═══════════════════════════════════════════════════════════════

const TITLE_WORDS = ['Tu', 'sensibilidad', 'perfecta', 'en', '10', 'segundos'];
const SUBTITLE = `Basada en el DPI real de tu pantalla. No copias genéricas de YouTube. ${LANDING_DATA.deviceCount}+ dispositivos. Precisión de ±2 puntos. Gratis.`;

function TypewriterText({ text, delay = 800 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Delay antes de empezar
    const startTimer = setTimeout(() => {
      setShowCursor(true);
      const type = () => {
        if (indexRef.current < text.length) {
          indexRef.current++;
          setDisplayed(text.slice(0, indexRef.current));
          timerRef.current = setTimeout(type, 30);
        } else {
          // Cursor desaparece 1s después de terminar
          setTimeout(() => setShowCursor(false), 1000);
        }
      };
      type();
    }, delay);

    return () => {
      clearTimeout(startTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, delay]);

  return (
    <span>
      {displayed}
      {showCursor && (
        <span className="inline-block w-[2px] h-[1em] bg-slate-400 ml-0.5 align-middle animate-[blink_1s_step-end_infinite]" />
      )}
    </span>
  );
}

export function HeroSection() {
  const [scrollOpacity, setScrollOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrollOpacity(Math.max(0, 1 - y / 300));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToHowItWorks = useCallback(() => {
    const el = document.getElementById('how-it-works');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  return (
    <section className="relative min-h-screen md:min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* ── Background layers ── */}

      {/* 1. Base color */}
      <div className="absolute inset-0 bg-[#0a0f1e] -z-30" />

      {/* 2. Gradient mesh blobs */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        {/* Blob 1: cyan top-left */}
        <div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.15]"
          style={{
            background: 'radial-gradient(circle, #06b6d4, transparent 70%)',
            filter: 'blur(80px)',
            animation: 'meshFloat1 20s ease-in-out infinite alternate',
            willChange: 'transform',
          }}
        />
        {/* Blob 2: blue bottom-right */}
        <div
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.12]"
          style={{
            background: 'radial-gradient(circle, #3b82f6, transparent 70%)',
            filter: 'blur(80px)',
            animation: 'meshFloat2 22s ease-in-out infinite alternate',
            willChange: 'transform',
          }}
        />
        {/* Blob 3: purple center */}
        <div
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full opacity-[0.08]"
          style={{
            background: 'radial-gradient(circle, #8b5cf6, transparent 70%)',
            filter: 'blur(80px)',
            animation: 'meshFloat3 24s ease-in-out infinite alternate',
            willChange: 'transform',
          }}
        />
      </div>

      {/* 3. Subtle grid pattern */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto text-center pt-20 pb-16">
        {/* Título — word-by-word stagger */}
        <h1 className="text-[32px] sm:text-[40px] md:text-[48px] lg:text-[56px] font-display font-black leading-[1.15] tracking-tight">
          {TITLE_WORDS.map((word, i) => (
            <motion.span
              key={word + i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' }}
              className="inline-block mr-[0.3em]"
            >
              {word === 'perfecta' ? (
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                    textShadow: 'none',
                    filter: 'drop-shadow(0 0 40px rgba(6, 182, 212, 0.3))',
                  }}
                >
                  {word}
                </span>
              ) : (
                <span className="text-white">{word}</span>
              )}
            </motion.span>
          ))}
        </h1>

        {/* Subtítulo — typewriter */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="mt-6 text-sm md:text-base lg:text-lg text-slate-400 max-w-2xl mx-auto font-body leading-relaxed min-h-[3em]"
        >
          <TypewriterText text={SUBTITLE} delay={800} />
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* CTA primario con borde rotativo */}
          <Link href="/generator" className="relative group">
            <span
              className="absolute -inset-[2px] rounded-[14px] opacity-75 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]"
              style={{
                background: 'conic-gradient(from 0deg, #06b6d4, #3b82f6, #8b5cf6, #06b6d4)',
                animation: 'borderRotate 3s linear infinite',
              }}
            />
            <span
              className="relative flex items-center justify-center px-10 py-4 rounded-xl font-ui font-bold text-base uppercase tracking-wider text-white overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                boxShadow: '0 0 30px rgba(6, 182, 212, 0.3), 0 0 60px rgba(6, 182, 212, 0.1)',
              }}
            >
              GENERAR MI SENSIBILIDAD →
              {/* Shimmer */}
              <span
                className="absolute top-0 left-[-100%] w-full h-full pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                  animation: 'cta-shimmer 3s ease-in-out infinite',
                }}
              />
            </span>
          </Link>

          {/* CTA secundario */}
          <button
            onClick={scrollToHowItWorks}
            className="text-slate-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-2 group py-3"
          >
            Ver cómo funciona
            <ChevronDown
              size={16}
              className="animate-[scrollBounce_1.5s_ease-in-out_infinite]"
            />
          </button>
        </motion.div>

        {/* Floating stats badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.0 }}
          className="mt-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            animation: 'float 3s ease-in-out infinite',
          }}
        >
          <span className="text-sm">⚡</span>
          <span className="text-sm text-slate-300">
            {LANDING_DATA.playerCount.toLocaleString()} jugadores ya lo usan
          </span>
        </motion.div>
      </div>

      {/* Scroll indicator — bottom */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 transition-opacity duration-300"
        style={{ opacity: scrollOpacity }}
      >
        <ChevronDown
          size={20}
          className="text-slate-500 animate-[scrollBounce_1.5s_ease-in-out_infinite]"
        />
        <span className="text-[10px] text-slate-600 uppercase tracking-widest">Scroll</span>
      </div>
    </section>
  );
}
