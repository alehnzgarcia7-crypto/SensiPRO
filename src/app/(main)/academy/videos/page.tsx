'use client';

import { Video, Play, Clock, Bell, CheckCircle } from 'lucide-react';
import { useState } from 'react';

// ═══════════════════════════════════════════════════════════════
// Videos — Coming Soon premium design
// 6 video cards placeholder + newsletter signup
// ═══════════════════════════════════════════════════════════════

interface VideoCard {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  gradient: string;
}

const UPCOMING_VIDEOS: VideoCard[] = [
  {
    id: 1,
    title: 'Cómo Usar el Generador SensiPRO',
    subtitle: 'Tutorial paso a paso',
    duration: '~5 min',
    gradient: 'from-fire-500/30 via-orange-500/20 to-transparent',
  },
  {
    id: 2,
    title: 'Setup de Headshot Mode Completo',
    subtitle: 'De 0 a config lista',
    duration: '~8 min',
    gradient: 'from-red-500/30 via-rose-500/20 to-transparent',
  },
  {
    id: 3,
    title: 'Los 3 Drag Shots que Debes Dominar',
    subtitle: 'Vertical, J-Drag, Rotation',
    duration: '~10 min',
    gradient: 'from-cyan-500/30 via-ice-500/20 to-transparent',
  },
  {
    id: 4,
    title: 'Comparativa: 2 vs 3 vs 4 Dedos',
    subtitle: '¿Cuál es mejor para ti?',
    duration: '~7 min',
    gradient: 'from-purple-500/30 via-violet-500/20 to-transparent',
  },
  {
    id: 5,
    title: 'Config Gráfica para Máximo FPS',
    subtitle: 'Lo que DEBES poner en bajo',
    duration: '~4 min',
    gradient: 'from-green-500/30 via-emerald-500/20 to-transparent',
  },
  {
    id: 6,
    title: 'Los 5 Errores que Arruinan tu Sensibilidad',
    subtitle: 'Y cómo arreglarlos',
    duration: '~6 min',
    gradient: 'from-amber-500/30 via-yellow-500/20 to-transparent',
  },
];

export default function VideosPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // Simulated subscription
    setSubscribed(true);
    setEmail('');
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="academy-stagger">
        <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2 font-[family-name:var(--font-orbitron)] uppercase tracking-wide">
          <Video className="w-6 h-6 text-fire-400" />
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Video Tutoriales
          </span>
        </h1>
        <div className="section-heading-separator mb-3" />
        <p className="text-slate-400 text-sm">
          Tutoriales en video de configuración, sensibilidad, HUD y técnicas de
          Free Fire.
        </p>
      </div>

      {/* Coming Soon Hero */}
      <div className="relative glass-card p-6 text-center overflow-hidden academy-stagger" style={{ animationDelay: '50ms' }}>
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background:
              'linear-gradient(90deg, transparent, #ff6a00, #06b6d4, #ff6a00, transparent)',
            boxShadow: '0 0 12px rgba(255, 106, 0, 0.3)',
          }}
        />
        <div className="p-4 rounded-full bg-fire-500/10 border border-fire-500/20 inline-flex mb-4 shadow-[0_0_24px_rgba(255,106,0,0.15)]">
          <Video className="w-8 h-8 text-fire-400" />
        </div>
        <p className="text-slate-300 text-sm">
          Estamos grabando contenido para ti. Pronto tendrás tutoriales en video.
        </p>
      </div>

      {/* Video Grid — 6 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {UPCOMING_VIDEOS.map((video, index) => (
          <div
            key={video.id}
            className="group glass-card overflow-hidden academy-stagger transition-all duration-300 hover:scale-[1.02]"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            {/* Thumbnail placeholder */}
            <div
              className={`relative aspect-video bg-gradient-to-br ${video.gradient} bg-[#0a0f1e] flex items-center justify-center`}
            >
              {/* Grid pattern overlay */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Play icon */}
              <div className="relative z-10 p-4 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm group-hover:bg-white/20 transition-all duration-200 group-hover:scale-110">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>

              {/* Title overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#0a0f1e]/90 to-transparent">
                <p className="text-white font-[family-name:var(--font-rajdhani)] font-bold text-sm leading-tight">
                  {video.title}
                </p>
              </div>

              {/* PRÓXIMAMENTE badge */}
              <div className="absolute top-2 right-2">
                <span className="text-[9px] font-[family-name:var(--font-rajdhani)] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-slate-400 border border-white/10">
                  Próximamente
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-white text-sm mb-1">
                {video.title}
              </h3>
              <p className="text-xs text-slate-500 mb-2">{video.subtitle}</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-600 font-numbers">
                <Clock className="w-3 h-3" />
                {video.duration}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Newsletter CTA */}
      <div
        className="glass-card p-6 text-center academy-stagger"
        style={{ animationDelay: '400ms' }}
      >
        <Bell className="w-6 h-6 text-ice-400 mx-auto mb-3" />
        <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-white text-lg mb-2">
          Suscríbete para saber cuando publiquemos el primer video
        </h3>

        {subscribed ? (
          <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
            <CheckCircle className="w-5 h-5" />
            <span className="font-[family-name:var(--font-rajdhani)] font-medium">
              Te avisaremos cuando estén listos
            </span>
          </div>
        ) : (
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto mt-4"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu email"
              required
              className="w-full glass-card !rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-ice-500/40 focus:outline-none focus:ring-1 focus:ring-ice-500/30 transition-colors min-h-[44px]"
            />
            <button
              type="submit"
              className="flex-shrink-0 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all duration-200 min-h-[44px] hover:shadow-[0_0_20px_rgba(255,106,0,0.3)] hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #ff6a00, #06b6d4)',
              }}
            >
              Avisarme
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
