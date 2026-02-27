'use client';

import { useEffect, useRef, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════
// CyberParticles — Canvas 2D ligero (NO Three.js)
// Max 35 partículas, 30 FPS, conexiones < 150px
// Optimizado para MacBook Air 2017 8GB RAM
// ═══════════════════════════════════════════════════════════════

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

const MAX_PARTICLES = 35;
const CONNECTION_DISTANCE = 150;
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
const PARTICLE_COLOR = { r: 6, g: 182, b: 212 }; // cyan #06b6d4

function createParticle(width: number, height: number): Particle {
  const speed = 0.15 + Math.random() * 0.15;
  const angle = Math.random() * Math.PI * 2;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: 1 + Math.random() * 2,
    opacity: 0.1 + Math.random() * 0.4,
  };
}

export function CyberParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const isVisibleRef = useRef(true);

  const initParticles = useCallback((width: number, height: number) => {
    particlesRef.current = Array.from({ length: MAX_PARTICLES }, () =>
      createParticle(width, height),
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let resizeTimer: ReturnType<typeof setTimeout>;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (particlesRef.current.length === 0) {
        initParticles(canvas.width, canvas.height);
      }
    };

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 250);
    };

    // Pausar cuando tab no está activa
    const handleVisibility = () => {
      isVisibleRef.current = !document.hidden;
      if (!document.hidden) {
        lastFrameRef.current = performance.now();
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    resize();

    const { r, g, b } = PARTICLE_COLOR;

    const render = (now: number) => {
      if (!isVisibleRef.current) return;

      const delta = now - lastFrameRef.current;
      if (delta < FRAME_INTERVAL) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }
      lastFrameRef.current = now - (delta % FRAME_INTERVAL);

      const w = canvas.width;
      const h = canvas.height;
      const particles = particlesRef.current;

      ctx.clearRect(0, 0, w, h);

      // Actualizar posiciones (wrap-around)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        else if (p.y > h) p.y = 0;
      }

      // Dibujar conexiones
      for (let i = 0; i < particles.length; i++) {
        const pi = particles[i]!;
        for (let j = i + 1; j < particles.length; j++) {
          const pj = particles[j]!;
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const lineOpacity = (1 - dist / CONNECTION_DISTANCE) * 0.2;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.stroke();
          }
        }
      }

      // Dibujar partículas
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    // IntersectionObserver para solo renderizar si es visible
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        isVisibleRef.current = entry.isIntersecting && !document.hidden;
        if (isVisibleRef.current) {
          lastFrameRef.current = performance.now();
          animFrameRef.current = requestAnimationFrame(render);
        }
      },
      { threshold: 0 },
    );
    observer.observe(canvas);

    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearTimeout(resizeTimer);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
