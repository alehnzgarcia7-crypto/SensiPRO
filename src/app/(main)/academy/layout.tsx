'use client';

import {
  BookOpen,
  Lightbulb,
  Swords,
  Video,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Crown,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode} from 'react';
import { useEffect, useState } from 'react';

import { useTrackEvent } from '@/hooks/use-track-event';
import { cn } from '@/lib/cn';

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    href: '/academy',
    label: 'Hub',
    icon: GraduationCap,
    description: 'Inicio de la academia',
  },
  {
    href: '/academy/guides',
    label: 'Guías',
    icon: BookOpen,
    description: '22+ guías por categoría',
  },
  {
    href: '/academy/tips',
    label: 'Tips & Trucos',
    icon: Lightbulb,
    description: '100+ tips rápidos',
  },
  {
    href: '/academy/meta',
    label: 'Meta Actual',
    icon: Swords,
    description: 'Parche OB51 — Tier List',
  },
  {
    href: '/academy/videos',
    label: 'Videos',
    icon: Video,
    description: 'Tutoriales en video',
  },
];

export default function AcademyLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { track } = useTrackEvent();
  const [collapsed, setCollapsed] = useState(false);

  // Track academy page views on navigation
  useEffect(() => {
    track('ACADEMY_VIEWED', { path: pathname });
  }, [pathname, track]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar Desktop — Glass premium */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r border-white/[0.06] transition-all duration-300',
          'bg-[rgba(15,23,42,0.6)] backdrop-blur-xl',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          {!collapsed && (
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-[family-name:var(--font-orbitron)]">
              <GraduationCap className="w-5 h-5 text-fire-500" />
              <span className="bg-gradient-to-r from-fire-400 to-orange-300 bg-clip-text text-transparent">
                Academia
              </span>
            </h2>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-200"
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive =
              item.href === '/academy'
                ? pathname === '/academy'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
                  isActive
                    ? 'bg-white/[0.04] text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.03]',
                  collapsed && 'justify-center px-2',
                )}
                title={collapsed ? item.label : undefined}
              >
                {/* Active indicator — left cyan bar */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{
                      background: '#06b6d4',
                      boxShadow: '0 0 8px rgba(6, 182, 212, 0.5)',
                    }}
                  />
                )}
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-ice-400')} />
                {!collapsed && (
                  <div className="flex flex-col">
                    <span className="font-[family-name:var(--font-rajdhani)] font-medium">{item.label}</span>
                    <span className="text-[10px] text-slate-500 leading-tight">{item.description}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="p-4 border-t border-white/[0.06]">
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="font-[family-name:var(--font-rajdhani)] text-xs font-bold text-white uppercase tracking-wide">
                  Premium
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
                Desbloquea todas las guías, tips avanzados y contenido exclusivo
              </p>
              <Link
                href="/pricing"
                className="block text-center text-xs font-bold py-2.5 px-3 rounded-lg text-white transition-all duration-200 shadow-lg min-h-[44px] flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #ff6a00, #06b6d4)',
                  boxShadow: '0 4px 16px rgba(255, 106, 0, 0.2)',
                }}
              >
                Upgrade a Premium
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Nav — Glass bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[rgba(15,23,42,0.9)] backdrop-blur-xl border-t border-white/[0.06] safe-bottom">
        <nav className="flex items-center justify-around py-2 px-1">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive =
              item.href === '/academy'
                ? pathname === '/academy'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition-all duration-200 min-h-[44px] justify-center',
                  isActive ? 'text-ice-400' : 'text-slate-500 hover:text-slate-300',
                )}
              >
                {/* Active indicator — top cyan bar */}
                {isActive && (
                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full"
                    style={{
                      background: '#06b6d4',
                      boxShadow: '0 0 6px rgba(6, 182, 212, 0.5)',
                    }}
                  />
                )}
                <item.icon className="w-5 h-5" />
                <span className="truncate max-w-[60px] font-[family-name:var(--font-rajdhani)]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 pb-20 lg:pb-8">{children}</main>
    </div>
  );
}
