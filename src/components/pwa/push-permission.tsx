'use client';

import { Bell, BellOff } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export function PushPermission() {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleSubscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast('error', 'Tu navegador no soporta notificaciones push');
      return;
    }

    setIsLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        toast('error', 'Permiso de notificaciones denegado');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (res.ok) {
        toast('success', '¡Notificaciones activadas!');
      } else {
        toast('error', 'Error al guardar suscripción');
      }
    } catch {
      toast('error', 'Error al activar notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  if (permission === 'granted') {
    return (
      <div className="flex items-center gap-2 text-sm text-success">
        <Bell size={16} /> Notificaciones activas
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <BellOff size={16} /> Notificaciones bloqueadas
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSubscribe}
      isLoading={isLoading}
      leftIcon={<Bell size={14} />}
    >
      Activar notificaciones
    </Button>
  );
}
