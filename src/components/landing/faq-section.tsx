'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

import { FAQ_ITEMS } from '@/lib/landing-data';

// ═══════════════════════════════════════════════════════════════
// FaqSection — 8 questions accordion, + → × rotation,
// slide-down reveal, single open at a time, hover cyan color
// ═══════════════════════════════════════════════════════════════

function FaqItem({
  q,
  a,
  isOpen,
  onToggle,
}: {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="border-b transition-colors duration-300"
      style={{ borderColor: isOpen ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255, 255, 255, 0.06)' }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left min-h-[44px] group cursor-pointer"
      >
        <span className={`font-bold text-base pr-4 transition-colors duration-200 ${
          isOpen ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'
        }`}>
          {q}
        </span>
        <div className={`shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-300 ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}>
          <Plus size={18} className={`transition-colors duration-200 ${
            isOpen ? 'text-cyan-400' : 'text-slate-500'
          }`} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-slate-400 leading-[1.7]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <section id="faq" className="py-20 md:py-28 px-4">
      <div className="mx-auto max-w-[700px]">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-display font-bold text-center text-white"
        >
          Preguntas frecuentes
        </motion.h2>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-12"
        >
          {FAQ_ITEMS.map((faq, i) => (
            <FaqItem
              key={faq.q}
              q={faq.q}
              a={faq.a}
              isOpen={openIndex === i}
              onToggle={() => handleToggle(i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
