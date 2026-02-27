import { Zap } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { auth } from '@/lib/auth';
import '@/lib/auth/auth.types';

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <nav className="sticky top-0 z-40 w-full glass border-b border-white/5">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 h-16">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-fire-500" />
          <span className="font-display font-bold text-lg text-gradient-fire-ice">
            SensiPRO
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/generator" className="text-sm text-slate-400 hover:text-white transition-colors">
            Generador
          </Link>
          <Link href="/generator/headshot" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">
            Headshot
            <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-red-500/20 text-red-400 uppercase leading-none" style={{ animation: 'headshotPulse 2s ease-in-out infinite' }}>
              NEW
            </span>
          </Link>
          <Link href="/academy" className="text-sm text-slate-400 hover:text-white transition-colors">
            Academia
          </Link>
          <Link href="/community" className="text-sm text-slate-400 hover:text-white transition-colors">
            Comunidad
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.tier && user.tier !== 'FREE' && (
                <Badge variant={user.tier.toLowerCase() as 'premium' | 'vip'}>
                  {user.tier}
                </Badge>
              )}
              <Link
                href="/profile"
                className="h-8 w-8 rounded-full bg-gradient-fire-ice flex items-center justify-center text-xs font-bold text-white"
              >
                {(user.name ?? 'U').charAt(0).toUpperCase()}
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="btn-gaming bg-gradient-fire-ice text-white text-sm px-4 py-2"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
