'use client';

import { WifiOff } from 'lucide-react';

import { useOnlineStatus } from '@/hooks/use-online-status';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-warning/90 py-1.5 text-center">
      <p className="text-xs font-ui font-semibold text-black flex items-center justify-center gap-1.5">
        <WifiOff size={12} /> Sin conexión — modo offline
      </p>
    </div>
  );
}
