'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Mail,
  MapPin,
  Gamepad2,
  Send,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
} from 'lucide-react';

import { cn } from '@/lib/cn';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

/* ═══════════════════════════════════════════════════════════
   CONTACT CARDS DATA
   ═══════════════════════════════════════════════════════════ */

const SUBJECT_OPTIONS = [
  { value: 'SUPPORT', label: 'Soporte técnico' },
  { value: 'PAYMENT', label: 'Problemas con pago' },
  { value: 'FEATURE', label: 'Sugerencia de feature' },
  { value: 'BUG', label: 'Reporte de bug' },
  { value: 'COLLAB', label: 'Colaboraciones / Sponsorship' },
  { value: 'OTHER', label: 'Otro' },
] as const;

const SOCIAL_LINKS = [
  { name: 'Discord', handle: 'discord.gg/sensipro', href: 'https://discord.gg/sensipro', color: 'text-indigo-400' },
  { name: 'Instagram', handle: '@sensipro_ff', href: 'https://instagram.com/sensipro_ff', color: 'text-pink-400' },
  { name: 'TikTok', handle: '@sensipro_ff', href: 'https://tiktok.com/@sensipro_ff', color: 'text-slate-200' },
  { name: 'YouTube', handle: 'SensiPRO Oficial', href: 'https://youtube.com/@sensipro', color: 'text-red-400' },
] as const;

const FAQ_ITEMS = [
  { q: '¿Cuánto tardan en responder?', a: 'Menos de 24 horas en días hábiles. Los fines de semana puede tomar hasta 48 horas.' },
  { q: '¿Tienen Discord?', a: 'Sí, únete en discord.gg/sensipro para soporte en tiempo real y comunidad.' },
  { q: '¿Puedo sugerir un dispositivo nuevo?', a: 'Sí, escríbenos con el modelo exacto y lo agregamos en 48 horas a nuestra base de 485+ dispositivos.' },
  { q: '¿Hacen colaboraciones con creadores de contenido?', a: 'Sí, escríbenos con tu propuesta, estadísticas y canal. Trabajamos con creadores de Free Fire en toda LATAM.' },
] as const;

/* ═══════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function QuickContactCard({
  icon,
  title,
  children,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
      className="glass-card p-6 flex flex-col items-center text-center h-full hover:border-ice-500/20 transition-colors"
    >
      <div className="w-12 h-12 rounded-xl bg-ice-500/10 border border-ice-500/20 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-ui font-bold text-sm text-white mb-3">{title}</h3>
      <div className="flex-1 w-full">{children}</div>
    </motion.div>
  );
}

function ContactForm() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('SUPPORT');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = name.length > 0 && isValidEmail && message.length >= 10;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast('success', 'Mensaje enviado correctamente. Te responderemos pronto.');
    }, 1200);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 border border-success/20 mb-4">
          <Check size={32} className="text-success" />
        </div>
        <h3 className="text-xl font-display font-bold text-white">¡Mensaje enviado!</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
          Te responderemos por email lo antes posible. Revisa tu bandeja de entrada y spam.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setName('');
            setEmail('');
            setMessage('');
          }}
          className="mt-5 text-sm text-ice-400 hover:underline font-ui"
        >
          Enviar otro mensaje
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 md:p-8"
    >
      <h2 className="text-xl font-heading font-bold text-white mb-6">Enviar un Mensaje</h2>

      <div className="space-y-5">
        <Input
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
        />

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          error={email.length > 0 && !isValidEmail ? 'Ingresa un email válido' : undefined}
        />

        <div>
          <label className="block text-sm font-ui font-medium text-slate-300 mb-1.5">Asunto</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-xl bg-background-card border border-white/10 px-3 py-2.5 text-sm text-white focus:border-ice-500/50 focus:outline-none min-h-[44px] transition-colors"
          >
            {SUBJECT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-ui font-medium text-slate-300 mb-1.5">Mensaje</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={2000}
            className="w-full rounded-xl bg-background-card border border-white/10 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-ice-500/50 focus:outline-none resize-none min-h-[120px] transition-colors"
            placeholder="Describe tu problema, sugerencia o consulta..."
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-slate-600">Mínimo 10 caracteres</p>
            <p className="text-xs text-slate-600">{message.length}/2000</p>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          isLoading={loading}
          leftIcon={<Send size={16} />}
        >
          Enviar Mensaje
        </Button>
      </div>
    </motion.div>
  );
}

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="glass rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-4 text-left min-h-[52px] hover:bg-white/[0.02] transition-colors"
      >
        <span className="font-ui font-semibold text-sm text-white pr-4">{q}</span>
        <ChevronDown
          size={16}
          className={cn(
            'text-slate-500 shrink-0 transition-transform duration-300',
            open && 'rotate-180',
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-slate-400 font-body leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════ */

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ice-500/10 border border-ice-500/20 mb-5">
          <MessageCircle size={30} className="text-ice-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-black">
          <span className="bg-gradient-to-r from-ice-500 to-blue-500 bg-clip-text text-transparent">
            Contáctanos
          </span>
        </h1>
        <p className="mt-3 text-slate-400 font-ui max-w-lg mx-auto">
          ¿Dudas, sugerencias o problemas? Estamos aquí para ayudarte.
        </p>
      </motion.div>

      {/* Quick Contact Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-12">
        <QuickContactCard
          icon={<Mail size={22} className="text-ice-400" />}
          title="Soporte General"
          index={0}
        >
          <a
            href="mailto:soporte@sensibilidadespro.com"
            className="text-sm text-ice-400 hover:underline break-all"
          >
            soporte@sensibilidadespro.com
          </a>
          <p className="text-xs text-slate-500 mt-2">Respondemos en menos de 24 horas</p>
          <a
            href="mailto:soporte@sensibilidadespro.com"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-ice-500/10 border border-ice-500/20 text-ice-400 text-xs font-ui font-semibold hover:bg-ice-500/20 transition-colors min-h-[36px]"
          >
            <Mail size={14} />
            Enviar Email
          </a>
        </QuickContactCard>

        <QuickContactCard
          icon={<Gamepad2 size={22} className="text-ice-400" />}
          title="Redes Sociales"
          index={1}
        >
          <div className="space-y-2.5 text-left">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-white transition-colors group"
              >
                <span className={cn('font-ui font-semibold text-xs w-16', social.color)}>
                  {social.name}
                </span>
                <span className="text-xs text-slate-500 group-hover:text-slate-300 truncate">
                  {social.handle}
                </span>
                <ExternalLink size={10} className="shrink-0 text-slate-600 group-hover:text-slate-400" />
              </a>
            ))}
          </div>
        </QuickContactCard>

        <QuickContactCard
          icon={<MapPin size={22} className="text-ice-400" />}
          title="Ubicación"
          index={2}
        >
          <p className="text-sm text-slate-300">Cancún, Quintana Roo, México</p>
          <p className="text-xs text-slate-500 mt-1">Hecho con amor para LATAM</p>
          <div className="flex items-center gap-1.5 justify-center mt-4 text-xs text-slate-500">
            <Clock size={12} />
            <span>Lunes a Viernes, 9:00 - 18:00 CST</span>
          </div>
        </QuickContactCard>
      </div>

      {/* Contact Form */}
      <div className="mb-14">
        <ContactForm />
      </div>

      {/* FAQ */}
      <div className="mb-12 max-w-2xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-xl font-heading font-bold text-white text-center mb-6"
        >
          Preguntas Frecuentes
        </motion.h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((faq, i) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>
      </div>

      {/* Footer links */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-xs text-slate-600"
      >
        <div className="flex items-center justify-center gap-4">
          <Link href="/privacy" className="hover:text-white transition-colors">
            Política de Privacidad
          </Link>
          <span className="text-slate-700">|</span>
          <Link href="/terms" className="hover:text-white transition-colors">
            Términos de Servicio
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
