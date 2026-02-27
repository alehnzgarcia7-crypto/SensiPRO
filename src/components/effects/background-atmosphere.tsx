'use client';

// ═══════════════════════════════════════════════════════════════
// ARES — BackgroundAtmosphere — Ambiente inmersivo gaming
// Orbs de luz ambiental, grid sci-fi, partículas flotantes, noise
// Todo CSS puro — zero canvas, zero WebGL, zero librerías
// ═══════════════════════════════════════════════════════════════

export function BackgroundAtmosphere() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Base: gradiente radial oscuro */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0a0f1e_0%,_#050810_50%,_#030508_100%)]" />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
      />

      {/* Grid pattern sci-fi */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Orb naranja — top-left */}
      <div className="absolute -top-[200px] -left-[200px] w-[600px] h-[600px] animate-atmosphere-float-1">
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle,_rgba(255,106,0,0.12)_0%,_rgba(255,106,0,0.04)_40%,_transparent_70%)] blur-[100px]" />
      </div>

      {/* Orb cyan — bottom-right */}
      <div className="absolute -bottom-[200px] -right-[200px] w-[600px] h-[600px] animate-atmosphere-float-2">
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle,_rgba(0,200,255,0.10)_0%,_rgba(0,200,255,0.03)_40%,_transparent_70%)] blur-[100px]" />
      </div>

      {/* Orb purpura — center, mas sutil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] animate-atmosphere-float-3">
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle,_rgba(168,85,247,0.06)_0%,_transparent_60%)] blur-[80px]" />
      </div>

      {/* Partículas flotantes — CSS puro (6 partículas, optimizado para low-end) */}
      <div className="absolute inset-0">
        <div className="atmosphere-particle" style={{ left: '10%', top: '20%', animationDuration: '14s', animationDelay: '0s' }} />
        <div className="atmosphere-particle" style={{ left: '40%', top: '60%', animationDuration: '18s', animationDelay: '3s' }} />
        <div className="atmosphere-particle" style={{ left: '70%', top: '15%', animationDuration: '16s', animationDelay: '1s' }} />
        <div className="atmosphere-particle" style={{ left: '85%', top: '45%', animationDuration: '15s', animationDelay: '5s' }} />
        <div className="atmosphere-particle" style={{ left: '25%', top: '80%', animationDuration: '17s', animationDelay: '2s' }} />
        <div className="atmosphere-particle" style={{ left: '60%', top: '50%', animationDuration: '19s', animationDelay: '4s' }} />
      </div>
    </div>
  );
}
