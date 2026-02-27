'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Menu, X } from 'lucide-react';

import { cn } from '@/lib/cn';

// ═══════════════════════════════════════════════════════════════
// LandingNavbar — Glassmorphism on scroll, animated underlines,
// NEW badge on Headshot, mobile hamburger slide-down
// ═══════════════════════════════════════════════════════════════

const NAV_LINKS = [
  { href: '/generator', label: 'Generador' },
  { href: '/generator/headshot', label: 'Headshot', badge: 'NEW' },
  { href: '/academy', label: 'Academia' },
  { href: '/community', label: 'Comunidad' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar mobile menu al navegar
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out',
          scrolled
            ? 'bg-[rgba(10,15,30,0.8)] backdrop-blur-[20px] border-b border-cyan-500/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
            : 'bg-transparent border-b border-transparent',
        )}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Zap
              className={cn(
                'h-5 w-5 transition-all duration-300',
                'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]',
              )}
            />
            <span className="font-display font-bold text-lg">
              <span className="text-white">Sensi</span>
              <span className="text-cyan-400 font-black">PRO</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm text-slate-400 hover:text-white transition-colors duration-200 py-1 group flex items-center gap-1.5"
              >
                {link.label}
                {link.badge && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase leading-none bg-gradient-to-r from-cyan-500 to-blue-500 text-white animate-[badgePulse_2s_ease-in-out_infinite]">
                    {link.badge}
                  </span>
                )}
                {/* Underline grow from center */}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-cyan-400 transition-all duration-300 ease-out group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={cn(
                'hidden md:inline-flex items-center justify-center',
                'text-sm font-semibold tracking-wider uppercase',
                'px-5 py-2 rounded-lg min-h-[40px]',
                'border border-cyan-500/50 text-cyan-400',
                'bg-transparent hover:bg-cyan-500/10 hover:border-cyan-400',
                'transition-all duration-200',
              )}
            >
              Entrar
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu slide-down */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-out',
            mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0',
          )}
        >
          <div className="bg-[rgba(10,15,30,0.95)] backdrop-blur-xl border-t border-white/5 px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-3 py-3 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors min-h-[44px]"
              >
                {link.label}
                {link.badge && (
                  <span className="inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase leading-none bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            <Link
              href="/login"
              className="flex items-center justify-center px-3 py-3 mt-2 text-sm font-semibold text-cyan-400 border border-cyan-500/50 rounded-lg hover:bg-cyan-500/10 transition-colors min-h-[44px]"
            >
              Entrar
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile menu backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
