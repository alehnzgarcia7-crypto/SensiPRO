'use client';

import { Check, Bot } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

import {
  ARES_PERSONA,
  ARES_CATEGORIES,
  ARES_CONVERSATIONS,
  type AresConversation,
} from '@/lib/ares-coach-data';
import { cn } from '@/lib/cn';

import { ScrollReveal } from './scroll-reveal';

// ═══════════════════════════════════════════════════════════════
// Tipos internos
// ═══════════════════════════════════════════════════════════════

interface ChatMessage {
  id: string;
  role: 'ares' | 'user';
  text: string;
  typing?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

/** Selecciona N conversaciones random del pool sin repetir las usadas */
function pickQuestions(
  pool: AresConversation[],
  usedIds: Set<string>,
  count: number,
): AresConversation[] {
  const available = pool.filter((c) => !usedIds.has(c.id));
  if (available.length === 0) return [];
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/** Obtener color de la categoría */
function getCategoryColor(categoryId: string): string {
  return ARES_CATEGORIES.find((c) => c.id === categoryId)?.color ?? '#8b5cf6';
}

/** Obtener emoji de la categoría */
function getCategoryEmoji(categoryId: string): string {
  const cat = ARES_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return '💬';
  return cat.label.split(' ')[0] ?? '💬';
}

// ═══════════════════════════════════════════════════════════════
// Sub-componentes
// ═══════════════════════════════════════════════════════════════

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2">
      <span className="text-xs text-slate-500 font-ui">ARES está escribiendo</span>
      <span className="flex gap-0.5">
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-violet-400" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-violet-400" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-violet-400" />
      </span>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isAres = message.role === 'ares';

  if (message.typing) {
    return (
      <div className="flex items-start gap-2 chat-bubble-enter">
        <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-sm shrink-0">
          🤖
        </div>
        <TypingIndicator />
      </div>
    );
  }

  if (isAres) {
    return (
      <div className="flex items-start gap-2 chat-bubble-enter max-w-[92%]">
        <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-sm shrink-0 mt-0.5">
          🤖
        </div>
        <div className="rounded-2xl rounded-tl-md bg-white/[0.04] border border-white/[0.06] px-3.5 py-2.5">
          <p className="text-sm text-slate-300 font-body leading-relaxed whitespace-pre-line">
            {message.text}
          </p>
        </div>
      </div>
    );
  }

  // User bubble
  return (
    <div className="flex justify-end chat-bubble-enter">
      <div className="rounded-2xl rounded-tr-md bg-violet-500/10 border border-violet-500/20 px-3.5 py-2.5 max-w-[85%]">
        <p className="text-sm text-violet-200 font-body">{message.text}</p>
      </div>
    </div>
  );
}

function QuestionButton({
  conversation,
  onClick,
  disabled,
}: {
  conversation: AresConversation;
  onClick: () => void;
  disabled: boolean;
}) {
  const color = getCategoryColor(conversation.category);
  const emoji = getCategoryEmoji(conversation.category);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 text-left w-full px-3 py-2.5 rounded-xl',
        'bg-white/[0.03] border border-white/[0.08] transition-all duration-200',
        'hover:scale-[1.02] hover:bg-white/[0.06] active:scale-[0.98]',
        'disabled:opacity-40 disabled:pointer-events-none',
        'min-h-[44px]',
      )}
      style={{
        borderColor: disabled ? undefined : `${color}25`,
      }}
    >
      <span className="text-base shrink-0">{emoji}</span>
      <span className="text-xs text-slate-300 font-body line-clamp-2 leading-snug">
        {conversation.question}
      </span>
    </button>
  );
}

function PoolExhaustedBadge() {
  return (
    <div className="text-center py-3 px-4">
      <p className="text-xs text-violet-400 font-ui">
        ¡Eso es solo un preview! El ARES completo llega pronto 🔥
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Componente principal
// ═══════════════════════════════════════════════════════════════

export function AresCoachShowcase() {
  // --- Estado ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [usedIds, setUsedIds] = useState<Set<string>>(new Set());
  const [availableQuestions, setAvailableQuestions] = useState<AresConversation[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [greetingDone, setGreetingDone] = useState(false);
  const [notified, setNotified] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const hasTriggeredGreeting = useRef(false);

  // --- Scroll al fondo ---
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // --- Greeting al entrar en viewport (una sola vez) ---
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !hasTriggeredGreeting.current) {
          hasTriggeredGreeting.current = true;
          observer.disconnect();

          if (prefersReduced) {
            // Sin animación — mostrar completo de inmediato
            setMessages([
              { id: 'greeting', role: 'ares', text: ARES_PERSONA.greeting },
            ]);
            setGreetingDone(true);
            setAvailableQuestions(pickQuestions(ARES_CONVERSATIONS, new Set(), 3));
          } else {
            // Typing effect para el greeting
            setIsTyping(true);
            setMessages([{ id: 'greeting-typing', role: 'ares', text: '', typing: true }]);

            const greetingText = ARES_PERSONA.greeting;
            let charIndex = 0;

            const typeGreeting = () => {
              if (charIndex < greetingText.length) {
                charIndex++;
                const revealed = greetingText.slice(0, charIndex);
                setMessages([{ id: 'greeting', role: 'ares', text: revealed }]);
                // Variación sutil: 15-25ms
                const delay = 15 + Math.random() * 10;
                typingRef.current = setTimeout(typeGreeting, delay);
              } else {
                setIsTyping(false);
                setGreetingDone(true);
                setAvailableQuestions(pickQuestions(ARES_CONVERSATIONS, new Set(), 3));
              }
            };

            // Esperar 600ms antes de empezar a "escribir"
            typingRef.current = setTimeout(typeGreeting, 600);
          }
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (typingRef.current) clearTimeout(typingRef.current);
    };
  }, []);

  // --- Handler: usuario toca una pregunta ---
  const handleQuestionClick = useCallback(
    (conversation: AresConversation) => {
      if (isTyping) return;

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // 1. Agregar pregunta del usuario
      const userMsg: ChatMessage = {
        id: `user-${conversation.id}`,
        role: 'user',
        text: conversation.question,
      };

      // 2. Marcar como usada
      const newUsedIds = new Set(usedIds);
      newUsedIds.add(conversation.id);
      setUsedIds(newUsedIds);

      // 3. Limpiar preguntas disponibles mientras ARES responde
      setAvailableQuestions([]);

      if (prefersReduced) {
        // Sin animación — todo instantáneo
        const aresMsg: ChatMessage = {
          id: `ares-${conversation.id}`,
          role: 'ares',
          text: conversation.response,
        };
        setMessages((prev) => [...prev, userMsg, aresMsg]);
        setAvailableQuestions(pickQuestions(ARES_CONVERSATIONS, newUsedIds, 3));
        return;
      }

      // 4. Agregar user msg + typing indicator de ARES
      setIsTyping(true);
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: `ares-${conversation.id}-typing`, role: 'ares', text: '', typing: true },
      ]);

      // 5. Esperar 800-1200ms simulando "pensamiento"
      const thinkDelay = 800 + Math.random() * 400;
      typingRef.current = setTimeout(() => {
        // 6. Empezar typing character-by-character
        const responseText = conversation.response;
        let charIndex = 0;

        const typeChar = () => {
          if (charIndex < responseText.length) {
            charIndex++;
            const revealed = responseText.slice(0, charIndex);
            setMessages((prev) => {
              const updated = [...prev];
              const lastIdx = updated.length - 1;
              updated[lastIdx] = {
                id: `ares-${conversation.id}`,
                role: 'ares',
                text: revealed,
                typing: false,
              };
              return updated;
            });
            // 15-25ms con variación
            const delay = 15 + Math.random() * 10;
            typingRef.current = setTimeout(typeChar, delay);
          } else {
            // Typing terminado
            setIsTyping(false);
            // Nuevas preguntas con fade-in
            setAvailableQuestions(pickQuestions(ARES_CONVERSATIONS, newUsedIds, 3));
          }
        };

        typeChar();
      }, thinkDelay);
    },
    [isTyping, usedIds],
  );

  // --- Cleanup al desmontar ---
  useEffect(() => {
    return () => {
      if (typingRef.current) clearTimeout(typingRef.current);
    };
  }, []);

  const poolExhausted = greetingDone && availableQuestions.length === 0 && !isTyping;

  // --- Render ---
  return (
    <section ref={sectionRef} className="py-20 px-4 relative">
      {/* Fondo púrpura tenue */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-500/[0.03] rounded-full blur-[200px]" />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-ui font-bold uppercase tracking-wider mb-6 ares-badge-pulse">
              Próximamente — Acceso anticipado para Pro
            </span>

            <h2 className="text-3xl md:text-4xl font-heading font-bold">
              <Bot className="inline-block mr-2 text-violet-500" size={32} />
              <span className="ares-text-gradient">ARES AI COACH</span>
            </h2>
            <p className="mt-3 text-lg text-slate-400 font-ui">
              Tu coach personal de Free Fire con inteligencia artificial
            </p>
          </div>
        </ScrollReveal>

        {/* Split layout */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* ═══ Columna izquierda — Info + Features ═══ */}
          <ScrollReveal>
            <div>
              <p className="text-slate-300 font-body leading-relaxed mb-8">
                ARES conoce tu dispositivo, tu sensibilidad, y tu estilo. No es un chatbot
                genérico — es un coach que analiza TU setup y te da consejos específicos
                para subir de nivel.
              </p>

              {/* Category pills grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-8">
                {ARES_CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm font-ui text-slate-300 transition-colors duration-200 hover:bg-white/[0.06]"
                    style={{ borderColor: `${cat.color}20` }}
                  >
                    <span>{cat.label}</span>
                  </div>
                ))}
              </div>

              {/* Bullets de valor */}
              <ul className="space-y-3.5 mb-10">
                {[
                  'Conoce las specs de tu celular y te aconseja basado en tu hardware',
                  'Sabe de las 15 armas, 5 técnicas de drag, y estrategias de ranked',
                  'Te da planes personalizados para subir de rango',
                  'Habla como pro player — nada de respuestas genéricas de IA',
                ].map((bullet, i) => (
                  <ScrollReveal key={bullet} delay={i * 100}>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-violet-500/15 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-violet-400" />
                      </div>
                      <span className="text-sm text-slate-300 font-body">{bullet}</span>
                    </li>
                  </ScrollReveal>
                ))}
              </ul>

              {/* CTA Notifícame */}
              <button
                type="button"
                onClick={() => setNotified(true)}
                disabled={notified}
                className={cn(
                  'inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-ui font-bold transition-all duration-300 min-h-[48px]',
                  notified
                    ? 'bg-violet-500/20 text-violet-300 cursor-default'
                    : 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:scale-[1.03] hover:shadow-lg',
                )}
              >
                {notified ? '✅ ¡Te avisamos! 🎯' : '🔔 NOTIFÍCAME CUANDO SALGA'}
              </button>
            </div>
          </ScrollReveal>

          {/* ═══ Columna derecha — Chat Demo ═══ */}
          <ScrollReveal delay={200}>
            <div className="glass-card overflow-hidden flex flex-col" style={{ maxHeight: '520px' }}>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] shrink-0">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-base">
                  🤖
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-ui font-bold text-white">ARES</p>
                  <p className="text-[10px] text-slate-500 font-ui">AI Coach</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 online-pulse" />
                  <span className="text-[10px] text-emerald-400 font-ui font-bold">EN LÍNEA</span>
                </span>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-hide min-h-[280px]">
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Questions area */}
              <div className="px-3 pb-3 pt-1 border-t border-white/[0.04] shrink-0">
                {poolExhausted ? (
                  <PoolExhaustedBadge />
                ) : (
                  <div className="space-y-1.5">
                    {availableQuestions.map((conv) => (
                      <QuestionButton
                        key={conv.id}
                        conversation={conv}
                        onClick={() => handleQuestionClick(conv)}
                        disabled={isTyping}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
