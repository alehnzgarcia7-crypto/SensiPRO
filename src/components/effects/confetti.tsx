'use client';

import { useRef, useCallback } from 'react';

import { usePrefersReducedMotion } from '@/hooks/use-media-query';

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
}

const COLORS: readonly [string, string, string, string, string, string] = [
  '#ff6a00', '#00c8ff', '#f59e0b', '#8b5cf6', '#22c55e', '#ef4444',
];

export function useConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReduced = usePrefersReducedMotion();

  const fire = useCallback((count = 60) => {
    if (prefersReduced) return;

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
      document.body.appendChild(canvas);
      canvasRef.current = canvas;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < count; i++) {
      pieces.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 12,
        vy: -(Math.random() * 8 + 4),
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        width: Math.random() * 8 + 4,
        height: Math.random() * 4 + 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length) % COLORS.length] as string,
        opacity: 1,
      });
    }

    let frame: number;
    const canvasEl = canvas;

    const animate = () => {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      let alive = false;

      pieces.forEach((p) => {
        p.x += p.vx;
        p.vy += 0.15; // gravity
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.008;

        if (p.opacity <= 0) return;
        alive = true;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        ctx.restore();
      });

      if (alive) {
        frame = requestAnimationFrame(animate);
      } else {
        canvasEl.remove();
        canvasRef.current = null;
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [prefersReduced]);

  return { fire };
}
