'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar Desktop — Glass effect */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r border-white/[0.06] transition-all duration-300',
          'bg-[#0a0f1e]/80 backdrop-blur-xl',
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
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
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
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
                  isActive
                    ? 'bg-fire-500/15 text-fire-400 border border-fire-500/20 shadow-[0_0_12px_rgba(255,106,0,0.08)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5',
                  collapsed && 'justify-center px-2',
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-fire-400')} />
                {!collapsed && (
                  <div className="flex flex-col">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-[10px] text-slate-500 leading-tight">{item.description}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="p-4 border-t border-white/[0.06]">
            <div className="rounded-xl bg-gradient-to-br from-fire-500/10 via-transparent to-ice-500/10 p-4 border border-white/[0.06] backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-bold text-white">Premium</span>
              </div>
              <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
                Desbloquea todas las guías, tips avanzados y contenido exclusivo
              </p>
              <Link
                href="/pricing"
                className="block text-center text-xs font-bold py-2 px-3 rounded-lg bg-gradient-to-r from-fire-500 to-fire-600 text-white hover:from-fire-600 hover:to-fire-700 transition-all shadow-lg shadow-fire-500/20"
              >
                Upgrade a Premium
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Nav — Glass bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0f1e]/90 backdrop-blur-xl border-t border-white/[0.06]">
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
                  'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition-colors',
                  isActive ? 'text-fire-400' : 'text-slate-500 hover:text-slate-300',
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="truncate max-w-[60px]">{item.label}</span>
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
