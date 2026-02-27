'use client';

import { ChevronDown } from 'lucide-react';
import { useState, useCallback } from 'react';

import { cn } from '@/lib/cn';
import { FAQ_ITEMS } from '@/lib/landing-data';

import { ScrollReveal } from './scroll-reveal';

function FaqAccordion({
  q,
  a,
  isOpen,
  onToggle,
  index,
}: {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <ScrollReveal delay={index * 60}>
      <div className="border-b border-white/5">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between py-5 text-left min-h-[44px] group"
        >
          <span className="font-ui font-bold text-white text-base pr-4 group-hover:text-fire-400 transition-colors">
            {q}
          </span>
          <ChevronDown
            size={18}
            className={cn(
              'shrink-0 text-slate-500 transition-transform duration-300',
              isOpen && 'rotate-180 text-fire-500',
            )}
          />
        </button>
        <div
          className={cn(
            'grid transition-all duration-300 ease-out',
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          )}
        >
          <div className="overflow-hidden">
            <p className="pb-5 text-sm text-slate-400 leading-relaxed font-body">{a}</p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <section id="faq" className="py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-white">
            Preguntas frecuentes
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mt-12 glass-card p-6 md:p-8">
            {FAQ_ITEMS.map((faq, i) => (
              <FaqAccordion
                key={faq.q}
                q={faq.q}
                a={faq.a}
                isOpen={openIndex === i}
                onToggle={() => handleToggle(i)}
                index={i}
              />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
