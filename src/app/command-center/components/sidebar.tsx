'use client';

import {
  BarChart3,
  DollarSign,
  FileText,
  Home,
  Settings,
  Users,
  Crosshair,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { href: '/command-center', label: 'Dashboard', icon: Home },
  { href: '/command-center/users', label: 'Usuarios', icon: Users },
  { href: '/command-center/revenue', label: 'Revenue', icon: DollarSign },
  { href: '/command-center/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/command-center/content', label: 'Content', icon: FileText },
  { href: '/command-center/controls', label: 'Controls', icon: Settings },
];

export function CommandCenterSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0a0a14] border-r border-[#1a1a2e] flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-[#1a1a2e]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Crosshair className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-wide font-mono">COMMAND</p>
            <p className="text-[10px] text-cyan-400 tracking-[0.2em] font-mono">CENTER</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/command-center'
              ? pathname === '/command-center'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#1a1a2e]">
        <Link
          href="/generator"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a SensiPRO
        </Link>
      </div>
    </aside>
  );
}
