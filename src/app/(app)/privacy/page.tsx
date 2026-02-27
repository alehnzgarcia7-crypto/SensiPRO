'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ChevronDown,
  Users,
  Database,
  Eye,
  Share2,
  Cookie,
  Scale,
  Lock,
  Baby,
  RefreshCw,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

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
    icon: <Users size={18} className="text-ice-400" />,
    title: '¿Quiénes somos?',
    content: (
      <p className="text-sm text-slate-400 leading-relaxed">
        SensiPRO (Sensibilidades PRO) es una plataforma de optimización de sensibilidad para
        Free Fire operada desde Cancún, Quintana Roo, México. Nuestro objetivo es ayudar a
        jugadores de toda Latinoamérica a mejorar su rendimiento en el juego mediante
        configuraciones personalizadas basadas en el hardware de su dispositivo.
      </p>
    ),
  },
  {
    icon: <Database size={18} className="text-ice-400" />,
    title: '¿Qué datos recopilamos?',
    content: (
      <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
        <div>
          <h4 className="font-ui font-semibold text-slate-200 mb-1">Datos del dispositivo (automáticos):</h4>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>Modelo de dispositivo (ej: iPhone 13, Samsung Galaxy A54)</li>
            <li>Tamaño de pantalla y resolución</li>
            <li>Sistema operativo y versión</li>
            <li>RAM disponible</li>
            <li>Tasa de refresco (Hz)</li>
          </ul>
        </div>
        <div>
          <h4 className="font-ui font-semibold text-slate-200 mb-1">Datos de cuenta (si te registras):</h4>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>Correo electrónico</li>
            <li>Nombre de usuario</li>
            <li>Contraseña (encriptada con bcrypt, nunca almacenamos texto plano)</li>
            <li>Foto de perfil (opcional)</li>
          </ul>
        </div>
        <div>
          <h4 className="font-ui font-semibold text-slate-200 mb-1">Datos de uso:</h4>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>Configuraciones generadas y guardadas</li>
            <li>Preferencias de juego (dedos, estilo, armas favoritas)</li>
            <li>Interacciones con la plataforma (páginas visitadas, features usadas)</li>
          </ul>
        </div>
        <div>
          <h4 className="font-ui font-semibold text-slate-200 mb-1">Datos de pago (si compras PRO/ELITE):</h4>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>Procesados por MercadoPago/Stripe — <strong className="text-white">NO almacenamos datos de tarjeta</strong></li>
            <li>Solo guardamos: tipo de plan, fecha de suscripción, estado de pago</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    icon: <Eye size={18} className="text-ice-400" />,
    title: '¿Cómo usamos tus datos?',
    content: (
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-400 leading-relaxed ml-1">
        <li>Generar sensibilidades personalizadas para tu dispositivo específico</li>
        <li>Guardar tus configuraciones favoritas</li>
        <li>Mejorar nuestros algoritmos de calibración</li>
        <li>Enviarte notificaciones sobre actualizaciones (si lo autorizas)</li>
        <li>Analíticas agregadas (no individuales) para mejorar el producto</li>
        <li>Prevenir fraude y abuso de la plataforma</li>
      </ul>
    ),
  },
  {
    icon: <Share2 size={18} className="text-ice-400" />,
    title: '¿Compartimos tus datos?',
    content: (
      <div className="text-sm text-slate-400 leading-relaxed space-y-3">
        <p className="font-ui font-semibold text-white">
          NO vendemos, alquilamos ni compartimos tus datos personales con terceros.
        </p>
        <p>Excepciones limitadas:</p>
        <ul className="list-disc list-inside space-y-2 ml-1">
          <li><strong className="text-slate-200">Procesadores de pago:</strong> MercadoPago y Stripe reciben datos necesarios para procesar tu pago</li>
          <li><strong className="text-slate-200">Hosting:</strong> Nuestros servidores están en Hostinger. Tus datos se almacenan de forma segura</li>
          <li><strong className="text-slate-200">Analytics:</strong> Usamos analytics anónimos y agregados para mejorar el producto</li>
          <li><strong className="text-slate-200">Obligación legal:</strong> Si la ley mexicana nos obliga a compartir datos con autoridades</li>
        </ul>
      </div>
    ),
  },
  {
    icon: <Cookie size={18} className="text-ice-400" />,
    title: 'Cookies y tecnologías similares',
    content: (
      <div className="text-sm text-slate-400 leading-relaxed space-y-3">
        <p>Usamos cookies para:</p>
        <ul className="list-disc list-inside space-y-2 ml-1">
          <li><strong className="text-slate-200">Esenciales:</strong> Mantener tu sesión activa, recordar tus preferencias</li>
          <li><strong className="text-slate-200">Analytics:</strong> Entender cómo usas la plataforma (datos anónimos)</li>
          <li><strong className="text-slate-200">Preferencias:</strong> Recordar tu dispositivo, moneda, idioma</li>
        </ul>
        <p>
          Puedes desactivar cookies no esenciales en la configuración de tu navegador.
          Las cookies esenciales son necesarias para el funcionamiento del sitio.
        </p>
      </div>
    ),
  },
  {
    icon: <Scale size={18} className="text-ice-400" />,
    title: 'Tus derechos',
    content: (
      <div className="text-sm text-slate-400 leading-relaxed space-y-3">
        <p>Como usuario tienes derecho a:</p>
        <ul className="list-disc list-inside space-y-2 ml-1">
          <li><strong className="text-slate-200">Acceso:</strong> Solicitar una copia de tus datos personales</li>
          <li><strong className="text-slate-200">Rectificación:</strong> Corregir datos incorrectos</li>
          <li><strong className="text-slate-200">Eliminación:</strong> Solicitar que borremos tu cuenta y datos</li>
          <li><strong className="text-slate-200">Portabilidad:</strong> Exportar tus configuraciones</li>
          <li><strong className="text-slate-200">Oposición:</strong> Dejar de recibir comunicaciones de marketing</li>
        </ul>
        <p>
          Para ejercer cualquier derecho, escríbenos a{' '}
          <a href="mailto:soporte@sensibilidadespro.com" className="text-ice-400 hover:underline">
            soporte@sensibilidadespro.com
          </a>
        </p>
      </div>
    ),
  },
  {
    icon: <Lock size={18} className="text-ice-400" />,
    title: 'Seguridad',
    content: (
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-400 leading-relaxed ml-1">
        <li>Contraseñas encriptadas con bcrypt</li>
        <li>Conexiones HTTPS en todo el sitio</li>
        <li>Acceso restringido a datos personales</li>
        <li>Backups encriptados regulares</li>
        <li>No almacenamos datos de tarjetas de crédito</li>
      </ul>
    ),
  },
  {
    icon: <Baby size={18} className="text-ice-400" />,
    title: 'Menores de edad',
    content: (
      <p className="text-sm text-slate-400 leading-relaxed">
        SensiPRO está dirigido a jugadores de Free Fire de todas las edades. Los menores de 13 años
        necesitan autorización de un padre o tutor para crear una cuenta. No recopilamos
        intencionalmente datos de menores de 13 años sin consentimiento parental.
      </p>
    ),
  },
  {
    icon: <RefreshCw size={18} className="text-ice-400" />,
    title: 'Cambios a esta política',
    content: (
      <p className="text-sm text-slate-400 leading-relaxed">
        Nos reservamos el derecho de actualizar esta política. Te notificaremos por email o mediante
        un aviso en la plataforma si realizamos cambios significativos.
      </p>
    ),
  },
  {
    icon: <Mail size={18} className="text-ice-400" />,
    title: 'Contacto',
    content: (
      <div className="text-sm text-slate-400 leading-relaxed space-y-2">
        <p>¿Preguntas sobre privacidad?</p>
        <ul className="space-y-1">
          <li>
            Email:{' '}
            <a href="mailto:soporte@sensibilidadespro.com" className="text-ice-400 hover:underline">
              soporte@sensibilidadespro.com
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

export default function PrivacyPage() {
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
          <Shield size={30} className="text-ice-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-black">
          <span className="bg-gradient-to-r from-ice-500 to-blue-500 bg-clip-text text-transparent">
            Política de Privacidad
          </span>
        </h1>
        <p className="mt-3 text-slate-400 font-ui max-w-lg mx-auto">
          Tu privacidad es nuestra prioridad. Así protegemos tus datos.
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

      {/* Footer banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="glass-card p-6 text-center"
      >
        <p className="text-sm text-slate-400 font-body">
          ¿Tienes dudas? Contáctanos en{' '}
          <a href="mailto:soporte@sensibilidadespro.com" className="text-ice-400 hover:underline">
            soporte@sensibilidadespro.com
          </a>
        </p>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
          <Link href="/terms" className="hover:text-white transition-colors">
            Términos de Servicio
          </Link>
          <span className="text-slate-700">|</span>
          <Link href="/contact" className="hover:text-white transition-colors">
            Contacto
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
