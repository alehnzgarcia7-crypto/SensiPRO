'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';

import { cn } from '@/lib/cn';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((data: { success: boolean; data: { notifications: NotificationItem[]; unreadCount: number } }) => {
        if (data.success) {
          setNotifications(data.data.notifications ?? []);
          setUnreadCount(data.data.unreadCount ?? 0);
        }
      })
      .catch(() => {
        // Silencioso — el usuario no necesita ver el error de carga
      });
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    await fetch('/api/notifications', { method: 'PATCH' });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const typeIcon: Record<string, string> = {
    ACHIEVEMENT: '🏆',
    SUBSCRIPTION: '⭐',
    TOURNAMENT: '🎮',
    SYSTEM: '📢',
    REFERRAL: '🎁',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Notificaciones"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-fire-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-white/10 bg-[#0a0f1a]/95 backdrop-blur-xl shadow-2xl max-h-96 overflow-y-auto z-50">
          <div className="flex items-center justify-between p-3 border-b border-white/5">
            <span className="text-sm font-semibold text-white">Notificaciones</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-fire-400 hover:text-fire-300 transition-colors">
                Marcar todo leído
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="p-6 text-sm text-slate-500 text-center">Sin notificaciones</p>
          ) : (
            notifications.slice(0, 15).map((n) => {
              const content = (
                <div className="flex gap-2.5">
                  <span className="text-base flex-shrink-0 mt-0.5">{typeIcon[n.type] ?? '📌'}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{n.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-slate-600 mt-1">
                      {new Date(n.createdAt).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </div>
              );

              return (
                <div
                  key={n.id}
                  className={cn(
                    'p-3 border-b border-white/5 hover:bg-white/5 transition-colors',
                    !n.isRead && 'bg-fire-500/5',
                  )}
                >
                  {n.link ? (
                    <Link href={n.link} onClick={() => setIsOpen(false)}>
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
