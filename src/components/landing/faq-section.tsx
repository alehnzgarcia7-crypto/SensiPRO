'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/cn';

interface FaqEntry {
  q: string;
  a: string;
}

const faqs: FaqEntry[] = [
  {
    q: '¿Cómo funciona el generador de sensibilidades?',
    a: 'Nuestro algoritmo analiza las especificaciones reales de tu dispositivo (refresh rate, tamaño de pantalla, RAM, tipo de panel y tier) para calcular los 6 valores óptimos de sensibilidad. No usamos valores genéricos — cada dispositivo recibe una configuración única.',
  },
  {
    q: '¿Es realmente gratis?',
    a: 'Sí, puedes generar sensibilidades con el estilo Balanceado completamente gratis. Los estilos Agresivo y Francotirador, giroscopio, comparador, y exportar imagen son funciones Premium ($49 MXN/mes).',
  },
  {
    q: '¿Qué tan preciso es el algoritmo?',
    a: 'Cada dispositivo en nuestra base tiene specs verificadas de fuentes como GSMArena. El algoritmo usa pesos científicamente calibrados para Hz, RAM, panel y tier. Miles de jugadores usan nuestras configs diariamente.',
  },
  {
    q: '¿Soportan mi dispositivo?',
    a: 'Tenemos 500+ dispositivos de 16+ marcas incluyendo Samsung, Xiaomi, Redmi, POCO, Motorola, Apple, Realme, Infinix, Tecno, y más. Si tu dispositivo no está, contáctanos y lo agregamos en 24 horas.',
  },
  {
    q: '¿Qué diferencia hay entre los 3 estilos?',
    a: 'Agresivo: sensibilidades altas para giros rápidos y rush. Balanceado: valores medios para todo tipo de combate. Francotirador: valores bajos con scopes altos para precisión a larga distancia.',
  },
  {
    q: '¿Puedo usar la config en ranked?',
    a: 'Absolutamente. Las configs son 100% legítimas — solo ajustan los valores de sensibilidad que ya existen en el juego. No es hack, mod ni truco.',
  },
  {
    q: '¿Cómo cancelo Premium/VIP?',
    a: 'Puedes cancelar en cualquier momento desde tu perfil. Tu acceso Premium/VIP se mantiene hasta el final del período pagado.',
  },
];

function FaqItem({ q, a }: FaqEntry) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left min-h-[44px]"
      >
        <span className="font-ui font-medium text-white text-sm pr-4">{q}</span>
        <ChevronDown
          size={18}
          className={cn('shrink-0 text-slate-500 transition-transform', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-slate-400 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqSection() {
  return (
    <section id="faq" className="py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-white">
          Preguntas frecuentes
        </h2>
        <div className="mt-12">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
