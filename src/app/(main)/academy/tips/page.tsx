'use client';

import { Lightbulb, Crosshair, PersonStanding, Settings, Swords, Target } from 'lucide-react';
import { useState } from 'react';

import { PremiumBlur } from '@/components/paywall';
import { cn } from '@/lib/cn';

// ═══════════════════════════════════════════════════════════════
// 24 Tips hardcodeados — contenido REAL y ÚTIL de Free Fire
// 5 categorías: Puntería, Movimiento, Configuración, Armas, Estrategia
// ═══════════════════════════════════════════════════════════════

type TipCategory = 'Puntería' | 'Movimiento' | 'Configuración' | 'Armas' | 'Estrategia';

interface Tip {
  id: number;
  title: string;
  content: string;
  category: TipCategory;
}

const TIPS: Tip[] = [
  // ─── Puntería (6) ───
  {
    id: 1,
    title: 'Apunta al pecho — el recoil hace el headshot por ti',
    content:
      'Con M4A1 (1.7× headshot) o SCAR, apunta al pecho y haz drag vertical. El retroceso natural sube las balas a la cabeza. Es la base del Headshot Mode de SensiPRO.',
    category: 'Puntería',
  },
  {
    id: 2,
    title: 'Tu Punto Rojo es 0.95× tu General en Balanceado',
    content:
      'ARES v5.0 calcula tu Punto Rojo como el 95% de tu General. Si tu General es 100, tu Punto Rojo es 95. Más bajo = más control al apuntar.',
    category: 'Puntería',
  },
  {
    id: 3,
    title: 'La Mira 4x debe ser 80% de tu General',
    content:
      'En estilo Balanceado, ARES pone tu 4x al 80% de tu General. No la subas a ojo — ese ratio viene de 271 fuentes de pros.',
    category: 'Puntería',
  },
  {
    id: 4,
    title: 'NUNCA camines mirando al suelo',
    content:
      'Mantén el crosshair a altura de cabeza SIEMPRE. Cuando aparece el enemigo, solo disparas. Medio segundo de ventaja que gana 1v1s.',
    category: 'Puntería',
  },
  {
    id: 5,
    title: '10 min de Training Ground antes de ranked',
    content:
      'No saltes directo a ranked. 10 min de warmup: 5 min drag vertical con SCAR, 5 min J-Drag con M1887. Tu músculo memoria se activa.',
    category: 'Puntería',
  },
  {
    id: 6,
    title: 'Pre-apunta a puertas antes de llegar',
    content:
      'Antes de llegar a una puerta, pon el crosshair donde va a salir la cabeza. Es la regla #3 del crosshair placement de SensiPRO.',
    category: 'Puntería',
  },
  // ─── Movimiento (6) ───
  {
    id: 7,
    title: 'Drop shot: agáchate y dispara al mismo tiempo',
    content:
      'Tu hitbox baja y el enemigo falla. Necesitas 3+ dedos para hacerlo fluido — con 2 dedos no puedes agacharte y disparar a la vez.',
    category: 'Movimiento',
  },
  {
    id: 8,
    title: 'Peek & Fire gana fights en esquinas',
    content:
      'Agáchate detrás de cobertura, levántate, dispara, agáchate. Con 3 dedos el índice hace el peek y el pulgar dispara. Es la técnica #1 de 3 dedos.',
    category: 'Movimiento',
  },
  {
    id: 9,
    title: 'Jump-Crouch-Fire: la técnica Two9',
    content:
      'Salta → agáchate en el aire → dispara en el pico. Solo con 4 dedos. Es la técnica más respetada del juego. Two9 tiene 98% de headshot rate con ella.',
    category: 'Movimiento',
  },
  {
    id: 10,
    title: 'El jiggle peek gana 1v1s',
    content:
      'Asómate y escóndete rápido para ver al enemigo sin que te pegue. Luego peekea y dispara. Funciona con 2 y 3 dedos.',
    category: 'Movimiento',
  },
  {
    id: 11,
    title: 'Cambia de posición después de cada kill',
    content:
      'Si mataste a alguien desde un spot, su equipo ya sabe dónde estás. Muévete inmediatamente. Los pros nunca disparan dos veces desde el mismo ángulo.',
    category: 'Movimiento',
  },
  {
    id: 12,
    title: 'Skyler destruye Gloo Walls a distancia',
    content:
      'Si tu combo incluye Skyler como activa, su skill destruye las Gloo Walls enemigas sin acercarte. Perfecto para 3 dedos — activas con el índice sin dejar de apuntar.',
    category: 'Movimiento',
  },
  // ─── Configuración (6) ───
  {
    id: 13,
    title: 'Gráficos en Smooth + FPS Máximo — siempre',
    content:
      'ARES resta hasta -2 puntos de sensibilidad a dispositivos con 144Hz+ porque son más fluidos. Más FPS = más suave = mejor puntería. Los gráficos bonitos no ganan partidas.',
    category: 'Configuración',
  },
  {
    id: 14,
    title: 'Tu DPI define el 70% de tu sensibilidad',
    content:
      'ARES calcula: DPI bajo (270) → General ~117. DPI alto (460) → General ~87. Por eso copiar la sensi de un YouTuber NO funciona — su celular tiene DPI diferente.',
    category: 'Configuración',
  },
  {
    id: 15,
    title: 'Botón de disparo: 44-70% según tus dedos',
    content:
      'SensiPRO calcula el tamaño: 2 dedos necesitan botón grande (55-70%), 4 dedos necesitan botón chico (44-55%). Agresivo +5%, Sniper -5%.',
    category: 'Configuración',
  },
  {
    id: 16,
    title: 'Calibración BAJA para precisión pura',
    content:
      'ARES tiene 3 calibraciones: BAJA (-25 puntos), MEDIA (base), ALTA (+15 puntos). Si rusheas mucho, usa ALTA. Si snipeas, usa BAJA.',
    category: 'Configuración',
  },
  {
    id: 17,
    title: 'Cierra TODAS las apps antes de jugar',
    content:
      'Con ≤4GB de RAM, ARES resta -1 a tu sensi porque tu cel va más lento. Cerrar apps libera RAM y mejora los FPS. Más RAM libre = mejores reflejos.',
    category: 'Configuración',
  },
  {
    id: 18,
    title: 'Modo No Molestar antes de ranked',
    content:
      'Una notificación en medio de un 1v1 = muerte. Actívalo antes de entrar a partida. Tu KD te lo va a agradecer.',
    category: 'Configuración',
  },
  // ─── Armas (3) ───
  {
    id: 19,
    title: 'MP40 (830 RPM) + M4A1: el combo ranked',
    content:
      'MP40 tiene 1.5× headshot multiplier y 830 RPM — spray al pecho y el recoil sube solo. M4A1 con 1.7× para media distancia. SensiPRO ajusta +4% la sensi para SMGs.',
    category: 'Armas',
  },
  {
    id: 20,
    title: 'M1887: 2.0× headshot — one-tap o muerte',
    content:
      'Solo tienes 2 disparos. Un headshot = 188 de daño = kill instantánea. Practica el J-Drag: apunta al pecho y curva hacia arriba. SensiPRO ajusta +8% la sensi para escopetas.',
    category: 'Armas',
  },
  {
    id: 21,
    title: 'AWM: 2.5× headshot — one-shot kill garantizada',
    content:
      'Mata con headshot a través de CUALQUIER casco incluyendo nivel 3. SensiPRO BAJA la sensi del scope sniper un -6% porque necesitas máxima precisión.',
    category: 'Armas',
  },
  // ─── Estrategia (3) ───
  {
    id: 22,
    title: 'Alok + Jota + Kelly + Andrew = ranked estándar',
    content:
      'El combo balanceado-2-dedos de SensiPRO: Alok cura al equipo, Jota cura por kills, Kelly te mueve rápido, Andrew protege armadura. Mr. Waggor para walls gratis.',
    category: 'Estrategia',
  },
  {
    id: 23,
    title: 'Moco marca + Maro amplifica = combo sniper letal',
    content:
      'Moco marca al primer disparo, Maro activa +28% daño contra marcados. Rafael te mantiene invisible en el minimapa. El combo sniper más devastador del juego.',
    category: 'Estrategia',
  },
  {
    id: 24,
    title: 'No revivas en campo abierto',
    content:
      'Si tu compañero cae en campo abierto, NO vayas. El enemigo está esperando. Pon Gloo Walls primero (Mr. Waggor te genera 1 gratis cada 100 segundos).',
    category: 'Estrategia',
  },
];

const CATEGORIES = ['Todos', 'Puntería', 'Movimiento', 'Configuración', 'Armas', 'Estrategia'] as const;

const CATEGORY_CONFIG: Record<
  TipCategory,
  { color: string; icon: React.ElementType; label: string }
> = {
  Puntería: { color: '#06b6d4', icon: Crosshair, label: 'Puntería' },
  Movimiento: { color: '#22c55e', icon: PersonStanding, label: 'Movimiento' },
  Configuración: { color: '#f97316', icon: Settings, label: 'Configuración' },
  Armas: { color: '#f59e0b', icon: Swords, label: 'Armas' },
  Estrategia: { color: '#a855f7', icon: Target, label: 'Estrategia' },
};

export default function TipsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const filtered =
    selectedCategory === 'Todos'
      ? TIPS
      : TIPS.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="academy-stagger">
        <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2 font-[family-name:var(--font-orbitron)] uppercase tracking-wide">
          <Lightbulb className="w-6 h-6 text-yellow-400" />
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Tips y Trucos
          </span>
        </h1>
        <div className="section-heading-separator mb-3" />
        <p className="text-slate-400 text-sm">
          Tips rápidos para mejorar tu puntería, movimiento y gameplay en Free
          Fire. Aplícalos hoy.
        </p>
      </div>

      {/* Category Filters */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory md:snap-none academy-stagger"
        style={{ animationDelay: '50ms' }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          const config = cat === 'Todos' ? null : CATEGORY_CONFIG[cat as TipCategory];
          const color = config?.color ?? '#ff6a00';

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'flex-shrink-0 snap-start px-4 py-2 rounded-xl text-xs font-[family-name:var(--font-rajdhani)] font-semibold uppercase tracking-wide transition-all duration-200 min-h-[44px] flex items-center gap-1.5 border',
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent',
              )}
              style={
                isActive
                  ? {
                      backgroundColor: `${color}20`,
                      borderColor: `${color}40`,
                      color,
                      boxShadow: `0 0 12px ${color}25`,
                    }
                  : undefined
              }
            >
              {config && <config.icon className="w-3.5 h-3.5" />}
              {cat}
            </button>
          );
        })}
      </div>

      {/* Tips — primeros 4 gratis, resto premium */}
      {(() => {
        const freeTips = filtered.slice(0, 4);
        const premiumTips = filtered.slice(4);

        // Agrupar tips gratis por categoría
        const freeGrouped = freeTips.reduce<Record<string, Tip[]>>((acc, tip) => {
          if (!acc[tip.category]) acc[tip.category] = [];
          acc[tip.category]!.push(tip);
          return acc;
        }, {});

        // Agrupar tips premium por categoría
        const premiumGrouped = premiumTips.reduce<Record<string, Tip[]>>((acc, tip) => {
          if (!acc[tip.category]) acc[tip.category] = [];
          acc[tip.category]!.push(tip);
          return acc;
        }, {});

        const renderTipCards = (tips: Tip[], config: { color: string; icon: React.ElementType }) =>
          tips.map((tip, index) => (
            <div
              key={tip.id}
              className="relative glass-card p-4 pl-6 academy-stagger group"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-all duration-200 group-hover:w-[5px]"
                style={{
                  background: config.color,
                  boxShadow: `0 0 8px ${config.color}40`,
                }}
              />
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 font-[family-name:var(--font-orbitron)] font-black text-lg text-white/20 mt-[-2px]">
                  {tip.id}
                </span>
                <div>
                  <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-white text-sm mb-1">
                    {tip.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {tip.content}
                  </p>
                </div>
              </div>
            </div>
          ));

        const renderSection = (category: string, tips: Tip[]) => {
          const config = CATEGORY_CONFIG[category as TipCategory];
          if (!config) return null;
          const Icon = config.icon;
          return (
            <section key={category}>
              <div className="mb-2">
                <h2 className="font-[family-name:var(--font-orbitron)] text-base font-bold text-white uppercase tracking-wide flex items-center gap-2">
                  <Icon className="w-5 h-5" style={{ color: config.color }} />
                  {config.label}
                  <span className="font-numbers text-xs text-slate-500 font-normal normal-case tracking-normal">
                    ({tips.length})
                  </span>
                </h2>
              </div>
              <div className="section-heading-separator mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {renderTipCards(tips, config)}
              </div>
            </section>
          );
        };

        return (
          <>
            {/* Tips gratis (primeros 4) */}
            {Object.entries(freeGrouped).map(([cat, tips]) => renderSection(cat, tips))}

            {/* Tips premium (del 5 en adelante) */}
            {premiumTips.length > 0 && (
              <PremiumBlur source="academy" intensity={12}>
                {Object.entries(premiumGrouped).map(([cat, tips]) => renderSection(cat, tips))}
              </PremiumBlur>
            )}
          </>
        );
      })()}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-[family-name:var(--font-rajdhani)] font-medium">
            No se encontraron tips
          </p>
        </div>
      )}
    </div>
  );
}
