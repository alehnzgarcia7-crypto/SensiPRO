'use client';

import { useRef, useCallback, useEffect, useState } from 'react';

// ═══════════════════════════════════════════════════════════════
// useTilt — 3D perspective tilt effect for cards
// Desktop only (hover: hover media query). No-op on mobile/touch.
// ═══════════════════════════════════════════════════════════════

interface TiltOptions {
  maxTilt?: number;
  scale?: number;
  speed?: number;
}

export function useTilt(options: TiltOptions = {}) {
  const {
    maxTilt = 6,
    scale = 1.02,
    speed = 400,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const isDesktop = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el || !isDesktop.current) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const normalX = (e.clientX - centerX) / (rect.width / 2);
    const normalY = (e.clientY - centerY) / (rect.height / 2);

    const rotateX = -normalY * maxTilt;
    const rotateY = normalX * maxTilt;

    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
  }, [maxTilt, scale]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    const el = ref.current;
    if (el) {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Solo activar en desktop con hover capability
    isDesktop.current = window.matchMedia('(hover: hover) and (min-width: 769px)').matches;

    if (!isDesktop.current) return;

    el.style.transition = `transform ${speed}ms ease-out`;
    el.style.transformStyle = 'preserve-3d';
    el.style.willChange = 'transform';

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave, speed]);

  return { ref, isHovered };
}
