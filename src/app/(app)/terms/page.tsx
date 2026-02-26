'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  ChevronDown,
  CheckCircle2,
  Smartphone,
  UserCheck,
  CreditCard,
  ShieldAlert,
  Copyright,
  AlertTriangle,
  MessageSquare,
  Trash2,
  Gavel,
  Mail,
} from 'lucide-react';

import { cn } from '@/lib/cn';

/* ═══════════════════════════════════════════════════════════
   SECTIONS DATA
   ═══════════════════════════════════════════════════════════ */

interface Section {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

const sections: Section[] = [
  {
    icon: <CheckCircle2 size={18} className="text-ice-400" />,
    title: 'Aceptación de los Términos',
    content: (
      <p className="text-sm text-slate-400 leading-relaxed">
        Al acceder o utilizar SensiPRO (sensibilidadespro.com), aceptas estos Términos de Servicio.
        Si no estás de acuerdo, no utilices nuestros servicios. Nos reservamos el derecho de modificar
        estos términos en cualquier momento, notificándote los cambios mediante la plataforma.
      </p>
    ),
  },
  {
    icon: <Smartphone size={18} className="text-ice-400" />,
    title: 'Descripción del Servicio',
    content: (
      <div className="text-sm text-slate-400 leading-relaxed space-y-3">
        <p>SensiPRO es una plataforma que:</p>
        <ul className="list-disc list-inside space-y-2 ml-1">
          <li>Genera configuraciones de sensibilidad personalizadas para Free Fire basadas en el hardware de tu dispositivo</li>
          <li>Ofrece códigos HUD personalizados para copiar y pegar en el juego</li>
          <li>Proporciona planes de entrenamiento, técnicas de headshot, y guías educativas</li>
          <li>Permite guardar, compartir y comparar configuraciones con otros jugadores</li>
        </ul>
        <p>
          El servicio tiene un nivel gratuito y niveles de pago (PRO y ELITE) con funcionalidades adicionales.
        </p>
      </div>
    ),
  },
  {
    icon: <UserCheck size={18} className="text-ice-400" />,
    title: 'Cuentas de Usuario',
    content: (
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-400 leading-relaxed ml-1">
        <li>Debes proporcionar información veraz al registrarte</li>
        <li>Eres responsable de mantener la seguridad de tu cuenta</li>
        <li>No debes compartir tu cuenta con terceros</li>
        <li>Una persona = una cuenta. Múltiples cuentas pueden ser suspendidas</li>
        <li>Nos reservamos el derecho de suspender cuentas que violen estos términos</li>
      </ul>
    ),
  },
  {
    icon: <CreditCard size={18} className="text-ice-400" />,
    title: 'Planes y Pagos',
    content: (
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-400 leading-relaxed ml-1">
        <li>Los precios están sujetos a cambios con previo aviso</li>
        <li>Los pagos se procesan a través de MercadoPago y/o Stripe</li>
        <li>Las suscripciones se renuevan automáticamente al final de cada periodo</li>
        <li>Puedes cancelar en cualquier momento desde tu perfil</li>
        <li>Ofrecemos <strong className="text-white">garantía de 7 días</strong> en todos los planes de pago</li>
        <li>Los reembolsos se procesan al método de pago original en 5-10 días hábiles</li>
      </ul>
    ),
  },
  {
    icon: <ShieldAlert size={18} className="text-ice-400" />,
    title: 'Uso Aceptable',
    content: (
      <div className="text-sm text-slate-400 leading-relaxed space-y-3">
        <p className="font-ui font-semibold text-slate-200">Está prohibido:</p>
        <ul className="list-disc list-inside space-y-2 ml-1">
          <li>Usar bots, scrapers o herramientas automatizadas para extraer datos</li>
          <li>Intentar hackear, explotar o comprometer la seguridad de la plataforma</li>
          <li>Compartir contenido ofensivo, discriminatorio o ilegal en la comunidad</li>
          <li>Vender o redistribuir comercialmente las configuraciones generadas</li>
          <li>Suplantar la identidad de otros usuarios</li>
          <li>Usar la plataforma para promover hacks, cheats o trampas en Free Fire</li>
        </ul>
      </div>
    ),
  },
  {
    icon: <Copyright size={18} className="text-ice-400" />,
    title: 'Propiedad Intelectual',
    content: (
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-400 leading-relaxed ml-1">
        <li>El motor de sensibilidad, algoritmos de calibración y código fuente son propiedad exclusiva de SensiPRO</li>
        <li>El diseño, marca, logo y contenido original son propiedad de SensiPRO</li>
        <li>Las configuraciones que generas son tuyas para uso personal</li>
        <li>Free Fire® es marca registrada de Garena International. <strong className="text-slate-200">SensiPRO no está afiliado ni respaldado por Garena</strong></li>
        <li>Los nombres de dispositivos son marcas registradas de sus respectivos fabricantes</li>
      </ul>
    ),
  },
  {
    icon: <AlertTriangle size={18} className="text-ice-400" />,
    title: 'Limitación de Responsabilidad',
    content: (
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-400 leading-relaxed ml-1">
        <li>SensiPRO proporciona sugerencias de configuración basadas en algoritmos. No garantizamos mejoras específicas en tu rendimiento en el juego</li>
        <li>No somos responsables de baneos, restricciones o problemas en tu cuenta de Free Fire</li>
        <li>Los códigos HUD son configuraciones legítimas del juego, no hacks ni cheats</li>
        <li>El servicio se proporciona &quot;tal cual&quot; sin garantías de disponibilidad ininterrumpida</li>
        <li>Nuestra responsabilidad máxima se limita al monto pagado por tu suscripción en los últimos 12 meses</li>
      </ul>
    ),
  },
  {
    icon: <MessageSquare size={18} className="text-ice-400" />,
    title: 'Contenido de Usuario',
    content: (
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-400 leading-relaxed ml-1">
        <li>El contenido que publiques en la comunidad (configs compartidas, comentarios) es tu responsabilidad</li>
        <li>Al compartir contenido, otorgas a SensiPRO una licencia para mostrarlo en la plataforma</li>
        <li>Nos reservamos el derecho de eliminar contenido que viole estos términos</li>
        <li>Puedes eliminar tu contenido en cualquier momento desde tu perfil</li>
      </ul>
    ),
  },
  {
    icon: <Trash2 size={18} className="text-ice-400" />,
    title: 'Terminación',
    content: (
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-400 leading-relaxed ml-1">
        <li>Puedes eliminar tu cuenta en cualquier momento</li>
        <li>Nos reservamos el derecho de suspender o eliminar cuentas que violen estos términos</li>
        <li>Al eliminar tu cuenta, tus datos se borran en un plazo de 30 días conforme a nuestra <Link href="/privacy" className="text-ice-400 hover:underline">Política de Privacidad</Link></li>
      </ul>
    ),
  },
  {
    icon: <Gavel size={18} className="text-ice-400" />,
    title: 'Ley Aplicable y Jurisdicción',
    content: (
      <p className="text-sm text-slate-400 leading-relaxed">
        Estos términos se rigen por las leyes de México. Cualquier disputa se resolverá ante los
        tribunales competentes de Cancún, Quintana Roo, México.
      </p>
    ),
  },
  {
    icon: <Mail size={18} className="text-ice-400" />,
    title: 'Contacto',
    content: (
      <div className="text-sm text-slate-400 leading-relaxed space-y-2">
        <p>Para consultas sobre estos términos:</p>
        <ul className="space-y-1">
          <li>
            Email:{' '}
            <a href="mailto:legal@sensibilidadespro.com" className="text-ice-400 hover:underline">
              legal@sensibilidadespro.com
            </a>
          </li>
          <li>Ubicación: Cancún, Quintana Roo, México</li>
        </ul>
      </div>
    ),
  },
];

/* ═══════════════════════════════════════════════════════════
   ACCORDION ITEM
   ═══════════════════════════════════════════════════════════ */

function AccordionItem({
  section,
  index,
  open,
  onToggle,
}: {
  section: Section;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="glass rounded-xl overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="flex items-center gap-3 w-full px-5 py-4 text-left min-h-[52px] hover:bg-white/[0.02] transition-colors"
      >
        <span className="shrink-0">{section.icon}</span>
        <span className="font-ui font-semibold text-sm text-white flex-1">{section.title}</span>
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
            <div className="px-5 pb-5 pl-12">{section.content}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════ */

export default function TermsPage() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ice-500/10 border border-ice-500/20 mb-5">
          <FileText size={30} className="text-ice-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-black">
          <span className="bg-gradient-to-r from-ice-500 to-blue-500 bg-clip-text text-transparent">
            Términos de Servicio
          </span>
        </h1>
        <p className="mt-3 text-slate-400 font-ui max-w-lg mx-auto">
          Al usar SensiPRO aceptas los siguientes términos.
        </p>
        <span className="inline-block mt-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-500 font-ui">
          Última actualización: Febrero 2026
        </span>
      </motion.div>

      {/* Sections */}
      <div className="space-y-3 mb-16">
        {sections.map((section, i) => (
          <AccordionItem
            key={section.title}
            section={section}
            index={i}
            open={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}
      </div>

      {/* Footer links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="glass-card p-6 text-center"
      >
        <div className="flex items-center justify-center gap-4 text-sm">
          <Link href="/privacy" className="text-ice-400 hover:underline font-ui">
            Ver Política de Privacidad
          </Link>
          <span className="text-slate-700">|</span>
          <Link href="/contact" className="text-ice-400 hover:underline font-ui">
            Contacto
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
