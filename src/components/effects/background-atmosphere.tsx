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

      {/* Orb naranja — top-left (estático, sin blur ni animación) */}
      <div className="absolute -top-[200px] -left-[200px] w-[600px] h-[600px]">
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle,_rgba(255,106,0,0.10)_0%,_rgba(255,106,0,0.03)_40%,_transparent_70%)]" />
      </div>

      {/* Orb cyan — bottom-right */}
      <div className="absolute -bottom-[200px] -right-[200px] w-[600px] h-[600px]">
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle,_rgba(0,200,255,0.08)_0%,_rgba(0,200,255,0.02)_40%,_transparent_70%)]" />
      </div>

      {/* Orb purpura — center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px]">
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle,_rgba(168,85,247,0.05)_0%,_transparent_60%)]" />
      </div>
    </div>
  );
}
