'use client';

import {
  CreditCard,
  Eye,
  Gamepad2,
  UserPlus,
  Crosshair,
  BookOpen,
  Crown,
  LogIn,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/cn';

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const TYPE_CONFIG: Record<string, { icon: typeof CreditCard; color: string }> = {
  SIGNUP: { icon: UserPlus, color: 'text-emerald-400' },
  LOGIN: { icon: LogIn, color: 'text-blue-400' },
  SENSI_GENERATED: { icon: Crosshair, color: 'text-cyan-400' },
  PAYMENT_COMPLETED: { icon: CreditCard, color: 'text-green-400' },
  PAYMENT_STARTED: { icon: CreditCard, color: 'text-amber-400' },
  PAYMENT_FAILED: { icon: AlertTriangle, color: 'text-red-400' },
  PAYWALL_SHOWN: { icon: Eye, color: 'text-purple-400' },
  PAYWALL_CLICKED: { icon: Crown, color: 'text-amber-400' },
  HEADSHOT_MODE_USED: { icon: Gamepad2, color: 'text-orange-400' },
  ACADEMY_VIEWED: { icon: BookOpen, color: 'text-indigo-400' },
  DEVICE_SEARCHED: { icon: Search, color: 'text-slate-400' },
  PREMIUM_ACTIVATED: { icon: Crown, color: 'text-yellow-400' },
  PAGE_VIEW: { icon: Eye, color: 'text-slate-500' },
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export function ActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    try {
      const res = await fetch('/api/command-center/activity');
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-white/5" />
            <div className="flex-1">
              <div className="h-3 bg-white/5 rounded w-3/4 mb-1.5" />
              <div className="h-2 bg-white/5 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        No hay actividad reciente
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin">
      {items.map((item) => {
        const fallback = { icon: Eye, color: 'text-slate-500' };
        const config = TYPE_CONFIG[item.type] ?? fallback;
        const Icon = config.icon;

        return (
          <div
            key={item.id}
            className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/[0.02] transition-colors"
          >
            <div className={cn('w-7 h-7 rounded-md flex items-center justify-center bg-white/5 flex-shrink-0')}>
              <Icon className={cn('w-3.5 h-3.5', config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-300 truncate">{item.message}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">{timeAgo(item.timestamp)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
