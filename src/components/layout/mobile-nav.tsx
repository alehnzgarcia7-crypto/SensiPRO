'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, BookOpen, Users, User, Crosshair } from 'lucide-react';

import { cn } from '@/lib/cn';

const navItems = [
  { href: '/generator', label: 'Generar', icon: Zap },
  { href: '/generator/headshot', label: 'Headshot', icon: Crosshair },
  { href: '/academy', label: 'Academia', icon: BookOpen },
  { href: '/community', label: 'Comunidad', icon: Users },
  { href: '/profile', label: 'Perfil', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass border-t border-white/5 safe-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 min-w-[64px] min-h-[44px] rounded-lg transition-colors',
                isActive ? 'text-fire-500' : 'text-slate-500 active:text-white',
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-ui">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
