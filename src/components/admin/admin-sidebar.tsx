'use client';

import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  LifeBuoy,
  FlaskConical,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/cn';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Usuarios', icon: Users },
  { href: '/admin/content', label: 'Contenido', icon: FileText },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/support', label: 'Soporte', icon: LifeBuoy },
  { href: '/admin/ab-tests', label: 'A/B Tests', icon: FlaskConical },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-background-elevated border-r border-white/5 p-4 shrink-0 hidden md:block">
      <div className="mb-6">
        <p className="text-xs font-ui text-fire-500 font-bold uppercase tracking-widest">
          ARES Admin
        </p>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-ui transition-colors min-h-[44px]',
                isActive
                  ? 'bg-fire-500/10 text-fire-400 font-semibold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
