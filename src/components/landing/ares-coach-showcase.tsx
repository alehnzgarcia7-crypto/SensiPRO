'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// AresCoachShowcase — STATIC preview (NO scrollIntoView, NO typing,
// NO setInterval). Pure HTML/CSS chat mockup with feature list
// and email signup. Purple glow theme.
// ═══════════════════════════════════════════════════════════════

const FEATURES = [
  { icon: '📱', text: 'Conoce las specs de tu celular y aconseja según tu hardware' },
  { icon: '⚔️', text: 'Sabe de 32 armas, 5 técnicas de drag, y estrategias de ranked' },
  { icon: '📈', text: 'Te da planes personalizados para subir de rango' },
  { icon: '🎮', text: 'Habla como gamer — nada de respuestas genéricas de IA' },
];

const SUGGESTED_QUESTIONS = [
  '¿Cómo hago drag headshot?',
  'Mi sensi está muy rápida',
  'Dame rutina de entreno',
];

export function AresCoachShowcase() {
  const [notified, setNotified] = useState(false);

  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden">
      {/* Purple glow background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/[0.06] rounded-full blur-[100px]" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-12 lg:gap-16 items-center">
          {/* ── Left: Content ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6">
              🤖 PRÓXIMAMENTE — ACCESO ANTICIPADO PARA PRO
            </span>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight">
              ARES AI Coach
            </h2>

            {/* Subtitle */}
            <p className="mt-2 text-lg text-slate-400">
              Tu coach personal de Free Fire con inteligencia artificial
            </p>

            {/* Description */}
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-lg">
              ARES conoce tu dispositivo, tu sensibilidad, y tu estilo de juego.
              No es un chatbot genérico — es un coach que analiza TU setup.
            </p>

            {/* 4 Features */}
            <div className="mt-8 space-y-3">
              {FEATURES.map((feat, i) => (
                <motion.div
                  key={feat.text}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <span className="text-lg shrink-0 mt-0.5">{feat.icon}</span>
                  <span className="text-sm text-slate-300">{feat.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Email signup */}
            <div className="mt-8">
              {notified ? (
                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
                  ✅ Te avisaremos cuando ARES esté listo
                </div>
              ) : (
                <button
                  onClick={() => setNotified(true)}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider text-white transition-all duration-300 hover:scale-[1.03] min-h-[48px]"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)',
                  }}
                >
                  🔔 NOTIFÍCAME CUANDO SALGA
                </button>
              )}
            </div>
          </motion.div>

          {/* ── Right: Static Chat Mockup ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(139, 92, 246, 0.15)',
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.08), 0 20px 60px rgba(0, 0, 0, 0.4)',
              }}
            >
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]"
                style={{ background: 'rgba(255, 255, 255, 0.02)' }}
              >
                <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-base">
                  🤖
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">ARES AI Coach</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-bold">EN LÍNEA</span>
                </span>
              </div>

              {/* Chat body — ALL STATIC */}
              <div className="px-4 py-4 space-y-3 min-h-[300px]">
                {/* ARES greeting */}
                <div className="flex items-start gap-2 max-w-[90%]">
                  <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-sm shrink-0 mt-0.5">
                    🤖
                  </div>
                  <div className="rounded-2xl rounded-tl-md bg-white/[0.04] border border-white/[0.06] px-3.5 py-2.5">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Qué onda! Soy ARES, tu coach de Free Fire. ¿En qué te ayudo? 🎯
                    </p>
                  </div>
                </div>

                {/* Suggested questions */}
                <div className="space-y-2 pt-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <div
                      key={q}
                      className="flex justify-end"
                    >
                      <div className="rounded-2xl rounded-tr-md bg-purple-500/10 border border-purple-500/20 px-3.5 py-2.5 cursor-default hover:bg-purple-500/15 transition-colors">
                        <p className="text-sm text-purple-200">{q}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input bar — STATIC */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-black/30 border border-white/10">
                  <span className="text-sm text-slate-500 flex-1">Escribe tu pregunta...</span>
                  <Send size={16} className="text-slate-600" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
