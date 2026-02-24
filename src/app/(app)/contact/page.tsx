'use client';

import { useState } from 'react';
import { Send, Check, ChevronDown } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';

interface ApiResponse {
  success: boolean;
  data?: { ticketId: string };
  error?: { message: string };
}

const CATEGORIES = [
  { value: 'BUG', label: 'Bug / Error' },
  { value: 'PAYMENT', label: 'Pago / Suscripción' },
  { value: 'ACCOUNT', label: 'Mi Cuenta' },
  { value: 'FEATURE', label: 'Sugerencia' },
  { value: 'OTHER', label: 'Otro' },
] as const;

const FAQ_ITEMS = [
  {
    question: '¿Cómo genero mis sensibilidades?',
    answer: 'Ve al Generador, selecciona tu marca, modelo y estilo de juego. El sistema calculará las sensibilidades óptimas basándose en las specs de tu dispositivo.',
  },
  {
    question: '¿Cómo activo un código Premium?',
    answer: 'Ve a la sección "Activar Código" en tu perfil e ingresa el código con formato ARES-XXXX-XXXX-XXXX. Tu cuenta se actualizará inmediatamente.',
  },
  {
    question: '¿Puedo cambiar mi estilo de juego?',
    answer: 'Sí, los usuarios Premium y VIP pueden generar sensibilidades con los 3 estilos: Agresivo, Balanceado y Francotirador. Los usuarios Free solo tienen acceso al estilo Balanceado.',
  },
  {
    question: '¿Mi dispositivo no aparece, qué hago?',
    answer: 'Contáctanos con el modelo exacto de tu dispositivo y lo agregaremos a nuestra base de datos de 500+ dispositivos lo antes posible.',
  },
  {
    question: '¿Cómo cancelo mi suscripción?',
    answer: 'Ve a Perfil → Suscripción. Desde ahí puedes ver tu plan actual y la fecha de expiración. Las suscripciones no se renuevan automáticamente.',
  },
] as const;

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, index) => (
        <Card key={index} className="overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex w-full items-center justify-between p-4 text-left min-h-[44px]"
          >
            <span className="text-sm font-ui font-semibold text-white pr-4">{item.question}</span>
            <ChevronDown
              size={16}
              className={`shrink-0 text-slate-500 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
            />
          </button>
          {openIndex === index && (
            <div className="px-4 pb-4">
              <p className="text-sm text-slate-400 leading-relaxed">{item.answer}</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

export default function ContactPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.length > 0 && subject.length >= 5 && message.length >= 10;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message, category }),
      });
      const data: ApiResponse = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        toast('error', data.error?.message ?? 'Error al enviar el mensaje');
      }
    } catch {
      toast('error', 'Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
          <Check size={32} className="text-success" />
        </div>
        <h1 className="text-2xl font-display font-bold text-white">¡Mensaje enviado!</h1>
        <p className="text-sm text-slate-400 mt-2">
          Te responderemos por email lo antes posible. Revisa tu bandeja de entrada y spam.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-display font-bold text-white mb-2">Contacto y Soporte</h1>
      <p className="text-sm text-slate-400 mb-8">
        ¿Necesitas ayuda? Revisa las preguntas frecuentes o escríbenos directamente.
      </p>

      {/* FAQ */}
      <div className="mb-10">
        <h2 className="text-lg font-display font-bold text-white mb-4">Preguntas Frecuentes</h2>
        <FAQSection />
      </div>

      {/* Formulario de contacto */}
      <Card variant="glow" className="p-6">
        <h2 className="text-lg font-display font-bold text-white mb-4">Enviar un Mensaje</h2>
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
          />

          <div>
            <label className="text-xs text-slate-400 font-ui mb-1 block">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg bg-background-card border border-white/10 px-3 py-2.5 text-sm text-white focus:border-fire-500/50 focus:outline-none min-h-[44px]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <Input
            label="Asunto"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="¿En qué podemos ayudarte?"
            hint="Mínimo 5 caracteres"
          />

          <div>
            <label className="text-xs text-slate-400 font-ui mb-1 block">Mensaje</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={2000}
              className="w-full rounded-lg bg-background-card border border-white/10 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-fire-500/50 focus:outline-none resize-none min-h-[120px]"
              placeholder="Describe tu problema o sugerencia..."
            />
            <p className="text-xs text-slate-500 mt-1">{message.length}/2000</p>
          </div>

          <Button
            variant="primary"
            className="w-full"
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            isLoading={loading}
            leftIcon={<Send size={16} />}
          >
            Enviar Mensaje
          </Button>
        </div>
      </Card>
    </div>
  );
}
