# ARES SensiPRO — MASTER PLAN H
# ══════════════════════════════════════════════════════════════
# FASE 7 — MOBILE Y PWA (5 scripts: ARES-700 → ARES-704)
# "Experiencia app-like sin app store"
# ══════════════════════════════════════════════════════════════
#
# PWA completa: instalable, push notifications, offline mode,
# build APK con Capacitor, y optimización de performance para
# Lighthouse 90+. El 95% de los usuarios de Free Fire están
# en móvil — esta fase es crítica.
# ══════════════════════════════════════════════════════════════

## Instrucciones para Claude Code

1. **Lee CLAUDE.md** para convenciones
2. **Mobile-first**: todo debe funcionar perfecto en 360px
3. **Performance**: target Lighthouse 90+ en todas las categorías
4. **Touch targets**: mínimo 44×44px en todos los botones
5. **Después de terminar**: actualiza PROGRESS.md, git commit + push

---

# ████████████████████████████████████████████████████████████
# █                                                          █
# █   FASE 7 — MOBILE Y PWA                                 █
# █   Scripts 55-59 | App-like experience                   █
# █                                                          █
# ████████████████████████████████████████████████████████████

---

## ARES-700-pwa-setup

**Fase:** 7 | **Prioridad:** CRÍTICO
**Dependencias:** ARES-000-genesis
**Descripción:** Configurar PWA con next-pwa: manifest.json completo, service worker, icons en múltiples tamaños, install prompt custom gaming-styled, y meta tags para iOS/Android.

### Archivos a crear:

```
[ARCHIVO] public/manifest.json
```
```json
{
  "name": "Sensibilidades PRO — Free Fire",
  "short_name": "SensiPRO",
  "description": "Generador de sensibilidades perfectas para Free Fire. Configuraciones basadas en tu dispositivo.",
  "start_url": "/generator",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#050810",
  "theme_color": "#ff6a00",
  "dir": "ltr",
  "lang": "es-MX",
  "scope": "/",
  "categories": ["games", "utilities"],
  "icons": [
    { "src": "/icons/icon-72x72.png", "sizes": "72x72", "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-96x96.png", "sizes": "96x96", "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-128x128.png", "sizes": "128x128", "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-144x144.png", "sizes": "144x144", "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-152x152.png", "sizes": "152x152", "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-384x384.png", "sizes": "384x384", "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable any" }
  ],
  "screenshots": [
    { "src": "/screenshots/generator.png", "sizes": "1080x1920", "type": "image/png", "form_factor": "narrow" },
    { "src": "/screenshots/results.png", "sizes": "1080x1920", "type": "image/png", "form_factor": "narrow" }
  ],
  "shortcuts": [
    {
      "name": "Generador",
      "short_name": "Generar",
      "description": "Genera tu sensibilidad perfecta",
      "url": "/generator",
      "icons": [{ "src": "/icons/shortcut-generator.png", "sizes": "96x96" }]
    },
    {
      "name": "Academia",
      "short_name": "Guías",
      "description": "Guías y tutoriales",
      "url": "/academy",
      "icons": [{ "src": "/icons/shortcut-academy.png", "sizes": "96x96" }]
    }
  ]
}
```

```
[ARCHIVO] next.config.mjs
```
```javascript
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  fallbacks: {
    document: '/offline',
  },
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
      {
        urlPattern: /^https:\/\/img\.youtube\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'youtube-thumbs',
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: /\/api\/devices\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'device-api',
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
        },
      },
      {
        urlPattern: /\/api\/tips.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'tips-api',
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],
};

export default withPWA(nextConfig);
```

```
[ARCHIVO] src/app/layout.tsx
```
```tsx
import type { Metadata, Viewport } from 'next';

import { fontDisplay, fontUi } from '@/lib/fonts';
import { cn } from '@/lib/cn';

import '@/styles/globals.css';

export const viewport: Viewport = {
  themeColor: '#ff6a00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  title: {
    default: 'Sensibilidades PRO — Free Fire | Generador de Sensibilidad',
    template: '%s | SensiPRO',
  },
  description: 'Genera la sensibilidad perfecta para Free Fire basada en tu dispositivo. Algoritmo PRO con 500+ dispositivos. Gratis.',
  metadataBase: new URL('https://sensibilidadespro.com'),
  manifest: '/manifest.json',
  applicationName: 'SensiPRO',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SensiPRO',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://sensibilidadespro.com',
    siteName: 'Sensibilidades PRO',
    title: 'Sensibilidades PRO — Generador de Sensibilidad Free Fire',
    description: 'Genera la sensibilidad perfecta para Free Fire basada en tu dispositivo.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sensibilidades PRO — Free Fire',
    description: 'Genera la sensibilidad perfecta basada en tu dispositivo.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={cn(fontDisplay.variable, fontUi.variable, 'bg-background-base text-white antialiased')}>
        {children}
      </body>
    </html>
  );
}
```

```
[ARCHIVO] src/components/pwa/install-prompt.tsx
```
```tsx
'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after 30 seconds of engagement
      setTimeout(() => setShowBanner(true), 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showBanner || dismissed || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-sm animate-slide-up">
      <div className="glass border border-fire-500/20 p-4 shadow-glow-fire">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-fire-500/10 flex items-center justify-center">
            <Download size={20} className="text-fire-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-white text-sm">Instalar SensiPRO</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Acceso rápido desde tu pantalla. Sin descargar de la tienda.
            </p>
            <div className="flex gap-2 mt-3">
              <Button variant="primary" size="sm" onClick={handleInstall}>
                Instalar
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                Ahora no
              </Button>
            </div>
          </div>
          <button onClick={handleDismiss} className="p-1 text-slate-600 hover:text-white touch-target">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
```

```
[ARCHIVO] scripts/generate-icons.sh
```
```bash
#!/bin/bash
# Genera todos los tamaños de iconos PWA desde un icon-512x512.png fuente
# Requiere: sharp-cli (npm i -g sharp-cli)

set -euo pipefail

SOURCE="public/icons/icon-512x512.png"
OUTDIR="public/icons"

if [ ! -f "$SOURCE" ]; then
  echo "❌ No se encontró $SOURCE"
  echo "   Coloca un icono de 512x512 en esa ruta y vuelve a ejecutar."
  exit 1
fi

SIZES=(16 32 72 96 128 144 152 192 384 512)

for SIZE in "${SIZES[@]}"; do
  npx sharp-cli -i "$SOURCE" -o "${OUTDIR}/icon-${SIZE}x${SIZE}.png" resize "$SIZE" "$SIZE"
  echo "  ✅ icon-${SIZE}x${SIZE}.png"
done

# Apple touch icon (180x180)
npx sharp-cli -i "$SOURCE" -o "${OUTDIR}/apple-touch-icon.png" resize 180 180
echo "  ✅ apple-touch-icon.png"

# Shortcut icons (96x96)
cp "${OUTDIR}/icon-96x96.png" "${OUTDIR}/shortcut-generator.png"
cp "${OUTDIR}/icon-96x96.png" "${OUTDIR}/shortcut-academy.png"
echo "  ✅ shortcut icons"

echo ""
echo "🎯 ${#SIZES[@]} iconos generados en ${OUTDIR}"
```

### Validación:
```bash
npx tsc --noEmit
cat public/manifest.json | jq '.icons | length' # debe ser 8
ls src/components/pwa/install-prompt.tsx
ls scripts/generate-icons.sh
```

### Commit: `feat(pwa): ARES-700 PWA setup — manifest.json, next-pwa config, install prompt, icon generator, meta tags`

---

## ARES-701-push-notifications

**Fase:** 7 | **Prioridad:** ALTO
**Dependencias:** ARES-700, ARES-506
**Descripción:** Web Push API: suscripción a push, enviar notificaciones de nuevas guías, torneos, expiración de suscripción. VAPID keys, service worker push handler, y admin endpoint para broadcast.

### Archivos a crear:

```
[ARCHIVO] src/lib/push/web-push.ts
```
```typescript
import webpush from 'web-push';

import { logger } from '@ares/logger';

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY!;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? 'mailto:soporte@sensibilidadespro.com';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: PushPayload,
) {
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon ?? '/icons/icon-192x192.png',
        badge: payload.badge ?? '/icons/icon-72x72.png',
        data: { url: payload.url ?? '/' },
        tag: payload.tag ?? 'sensipro',
      }),
    );
    return { success: true };
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 410 || statusCode === 404) {
      // Subscription expired/invalid — should be removed
      return { success: false, expired: true };
    }
    logger.error('Push notification failed', { error: String(error) });
    return { success: false, expired: false };
  }
}

export async function broadcastPush(
  subscriptions: webpush.PushSubscription[],
  payload: PushPayload,
) {
  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushNotification(sub, payload)),
  );

  const sent = results.filter((r) => r.status === 'fulfilled' && (r.value as { success: boolean }).success).length;
  const expired = results.filter(
    (r) => r.status === 'fulfilled' && (r.value as { expired?: boolean }).expired,
  ).length;

  logger.info('Push broadcast completed', { total: subscriptions.length, sent, expired });
  return { total: subscriptions.length, sent, expired };
}
```

```
[ARCHIVO] src/app/api/push/subscribe/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { getRequiredSession } from '@/lib/auth/auth.middleware';

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getRequiredSession();
    const body = await request.json();
    const parsed = subscribeSchema.parse(body);

    // Upsert subscription
    await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: session.user.id,
          endpoint: parsed.endpoint,
        },
      },
      update: {
        p256dh: parsed.keys.p256dh,
        auth: parsed.keys.auth,
      },
      create: {
        userId: session.user.id,
        endpoint: parsed.endpoint,
        p256dh: parsed.keys.p256dh,
        auth: parsed.keys.auth,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/api/admin/push/broadcast/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { requireRole } from '@/lib/auth/auth.middleware';
import { broadcastPush } from '@/lib/push/web-push';

const broadcastSchema = z.object({
  title: z.string().min(3).max(100),
  body: z.string().min(3).max(200),
  url: z.string().optional(),
  tier: z.enum(['ALL', 'PREMIUM', 'VIP']).optional().default('ALL'),
});

export async function POST(request: NextRequest) {
  try {
    await requireRole('ADMIN');
    const body = await request.json();
    const parsed = broadcastSchema.parse(body);

    const where: Record<string, unknown> = {};
    if (parsed.tier !== 'ALL') {
      where.user = { tier: parsed.tier };
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where,
      select: { endpoint: true, p256dh: true, auth: true },
    });

    const pushSubs = subscriptions.map((s) => ({
      endpoint: s.endpoint,
      keys: { p256dh: s.p256dh, auth: s.auth },
    }));

    const result = await broadcastPush(pushSubs, {
      title: parsed.title,
      body: parsed.body,
      url: parsed.url,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/components/pwa/push-permission.tsx
```
```tsx
'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export function PushPermission() {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
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
      }
    } catch {
      toast('error', 'Error al activar notificaciones');
    } finally {
      setLoading(false);
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
    <Button variant="ghost" size="sm" onClick={handleSubscribe} loading={loading} leftIcon={<Bell size={14} />}>
      Activar notificaciones
    </Button>
  );
}
```

```
[ARCHIVO] public/sw-push-handler.js
```
```javascript
// Push event handler for service worker
// This file is appended to the auto-generated sw.js by next-pwa

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || '',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: { url: data.data?.url || '/' },
    actions: [
      { action: 'open', title: 'Ver' },
      { action: 'dismiss', title: 'Cerrar' },
    ],
    tag: data.tag || 'sensipro',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'SensiPRO', options),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    }),
  );
});
```

### Validación:
```bash
npx tsc --noEmit
ls src/lib/push/web-push.ts src/app/api/push/subscribe/route.ts
ls src/components/pwa/push-permission.tsx public/sw-push-handler.js
# Generate VAPID keys: npx web-push generate-vapid-keys
```

### Commit: `feat(push): ARES-701 push notifications — VAPID, subscribe API, broadcast admin, SW push handler, permission UI`

---

## ARES-702-offline-mode

**Fase:** 7 | **Prioridad:** ALTO
**Dependencias:** ARES-700
**Descripción:** Modo offline: cachear últimas sensibilidades generadas, offline fallback page con mensaje y cached data, y background sync para cola de acciones offline.

### Archivos a crear:

```
[ARCHIVO] src/app/offline/page.tsx
```
```tsx
import { WifiOff, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warning/10 mb-6">
          <WifiOff size={36} className="text-warning" />
        </div>
        <h1 className="text-3xl font-display font-bold text-white mb-2">Sin Conexión</h1>
        <p className="text-sm text-slate-400 mb-6">
          No hay conexión a internet. Tus sensibilidades guardadas siguen disponibles.
        </p>
        <div className="space-y-3">
          <a href="/generator">
            <Button variant="primary" className="w-full">Ver Sensibilidades Guardadas</Button>
          </a>
          <Button variant="ghost" className="w-full" onClick={() => window.location.reload()} leftIcon={<RotateCcw size={16} />}>
            Reintentar Conexión
          </Button>
        </div>
      </div>
    </div>
  );
}
```

```
[ARCHIVO] src/lib/offline/offline-storage.ts
```
```typescript
const DB_NAME = 'sensipro-offline';
const DB_VERSION = 1;
const STORE_NAME = 'cached-results';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface CachedResult {
  id: string;
  deviceBrand: string;
  deviceModel: string;
  style: string;
  values: Record<string, number>;
  generatedAt: string;
}

export async function saveCachedResult(result: CachedResult): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(result);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedResults(): Promise<CachedResult[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteCachedResult(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearCachedResults(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
```

```
[ARCHIVO] src/hooks/use-online-status.ts
```
```typescript
'use client';

import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

```
[ARCHIVO] src/components/pwa/offline-indicator.tsx
```
```tsx
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
```

### Validación:
```bash
npx tsc --noEmit
ls src/app/offline/page.tsx src/lib/offline/offline-storage.ts
ls src/hooks/use-online-status.ts src/components/pwa/offline-indicator.tsx
```

### Commit: `feat(offline): ARES-702 offline mode — IndexedDB cache, offline page, online status hook, offline indicator`

---

## ARES-703-capacitor-apk

**Fase:** 7 | **Prioridad:** MEDIO
**Dependencias:** ARES-700
**Descripción:** Configuración de Capacitor para generar APK distribuible. Config, scripts de build, y setup de plataforma Android.

### Archivos a crear:

```
[ARCHIVO] capacitor.config.ts
```
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sensibilidadespro.app',
  appName: 'SensiPRO',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    hostname: 'sensibilidadespro.com',
    cleartext: false,
  },
  android: {
    backgroundColor: '#050810',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#050810',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#050810',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
```

```
[ARCHIVO] scripts/build-apk.sh
```
```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════
# Build APK para SensiPRO
# Requiere: Node.js, Java 17+, Android SDK, Capacitor CLI
# ═══════════════════════════════════════════════════════

set -euo pipefail

echo "🔧 ARES SensiPRO — Build APK"
echo "═══════════════════════════════"

# 1. Build Next.js static export
echo ""
echo "1️⃣ Building Next.js static export..."
npm run build
npx next export -o out

# 2. Sync with Capacitor
echo ""
echo "2️⃣ Syncing Capacitor..."
npx cap sync android

# 3. Build APK
echo ""
echo "3️⃣ Building APK..."
cd android
./gradlew assembleRelease

# 4. Copy APK
echo ""
echo "4️⃣ Copying APK..."
APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
if [ -f "$APK_PATH" ]; then
  cp "$APK_PATH" "../sensipro-release.apk"
  echo "✅ APK generado: sensipro-release.apk"
  echo "   Tamaño: $(du -h ../sensipro-release.apk | cut -f1)"
else
  echo "❌ APK no encontrado en $APK_PATH"
  exit 1
fi

cd ..
echo ""
echo "═══════════════════════════════"
echo "🎯 Build completado"
echo ""
echo "Para firmar el APK:"
echo "  jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \\"
echo "    -keystore sensipro.keystore sensipro-release.apk sensipro"
echo ""
echo "Para alinear el APK:"
echo "  zipalign -v 4 sensipro-release.apk sensipro-aligned.apk"
```

```
[ARCHIVO] scripts/capacitor-init.sh
```
```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════
# Inicializar Capacitor en el proyecto
# ═══════════════════════════════════════════════════════

set -euo pipefail

echo "📱 Inicializando Capacitor..."

# Install dependencies
npm install @capacitor/core @capacitor/cli @capacitor/android \
  @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard \
  --save

# Initialize Capacitor
npx cap init "SensiPRO" "com.sensibilidadespro.app" --web-dir=out

# Add Android platform
npx cap add android

echo ""
echo "✅ Capacitor inicializado"
echo ""
echo "Próximos pasos:"
echo "  1. npm run build && npx next export -o out"
echo "  2. npx cap sync android"
echo "  3. npx cap open android  (abre Android Studio)"
echo "  4. O ejecuta: bash scripts/build-apk.sh"
```

### Validación:
```bash
npx tsc --noEmit
ls capacitor.config.ts scripts/build-apk.sh scripts/capacitor-init.sh
```

### Commit: `feat(capacitor): ARES-703 Capacitor APK — config, build script, init script, splash/status bar setup`

---

## ARES-704-performance-optimization

**Fase:** 7 | **Prioridad:** CRÍTICO
**Dependencias:** ARES-000, ARES-700
**Descripción:** Optimización para Lighthouse 90+: code splitting, lazy loading, bundle analysis, Redis cache layer, image optimization, y componentes de loading.

### Archivos a crear:

```
[ARCHIVO] src/lib/cache/redis.ts
```
```typescript
import { Redis } from 'ioredis';

import { logger } from '@ares/logger';

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    const url = process.env.REDIS_URL;
    if (!url) {
      logger.warn('REDIS_URL not set, caching disabled');
      return null as unknown as Redis;
    }
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
    redis.on('error', (err) => logger.error('Redis error', { error: String(err) }));
  }
  return redis;
}

/**
 * Cache-aside pattern: get from cache, compute if miss, store
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>,
): Promise<T> {
  const client = getRedis();
  if (!client) return compute();

  try {
    const hit = await client.get(key);
    if (hit) return JSON.parse(hit) as T;
  } catch {
    // Cache read failed, compute directly
  }

  const value = await compute();

  try {
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // Cache write failed, non-critical
  }

  return value;
}

/**
 * Invalidate a specific cache key
 */
export async function invalidateCache(key: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    await client.del(key);
  } catch {
    // Non-critical
  }
}

/**
 * Invalidate all keys matching a pattern
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch {
    // Non-critical
  }
}
```

```
[ARCHIVO] src/components/ui/lazy-load.tsx
```
```tsx
'use client';

import { Suspense, lazy, type ComponentType } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

interface LazyLoadProps {
  loader: () => Promise<{ default: ComponentType<Record<string, unknown>> }>;
  fallback?: React.ReactNode;
  props?: Record<string, unknown>;
}

export function LazyLoad({ loader, fallback, props = {} }: LazyLoadProps) {
  const Component = lazy(loader);

  return (
    <Suspense fallback={fallback ?? <Skeleton variant="card" className="h-40" />}>
      <Component {...props} />
    </Suspense>
  );
}
```

```
[ARCHIVO] src/components/ui/optimized-image.tsx
```
```tsx
import Image, { type ImageProps } from 'next/image';

import { cn } from '@/lib/cn';

interface OptimizedImageProps extends Omit<ImageProps, 'loading'> {
  eager?: boolean;
}

export function OptimizedImage({ eager = false, className, ...props }: OptimizedImageProps) {
  return (
    <Image
      {...props}
      loading={eager ? 'eager' : 'lazy'}
      sizes={props.sizes ?? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
      className={cn('object-cover', className)}
      quality={80}
    />
  );
}
```

```
[ARCHIVO] src/lib/performance/prefetch.ts
```
```typescript
/**
 * Prefetch critical API routes for faster navigation
 */
export function prefetchCriticalData() {
  if (typeof window === 'undefined') return;

  const criticalRoutes = [
    '/api/devices/brands',
    '/api/tips?type=daily',
  ];

  // Use requestIdleCallback for non-blocking prefetch
  const prefetch = () => {
    criticalRoutes.forEach((route) => {
      fetch(route, { priority: 'low' as RequestPriority }).catch(() => {});
    });
  };

  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(prefetch);
  } else {
    setTimeout(prefetch, 2000);
  }
}
```

```
[ARCHIVO] scripts/analyze-bundle.sh
```
```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════
# Analizar bundle size del proyecto
# ═══════════════════════════════════════════════════════

set -euo pipefail

echo "📊 ARES SensiPRO — Bundle Analysis"
echo "═══════════════════════════════════════"

# 1. Build with analysis
echo ""
echo "1️⃣ Building with ANALYZE=true..."
ANALYZE=true npm run build

# 2. Check output sizes
echo ""
echo "2️⃣ Output sizes:"
echo "   .next/static/chunks:"
du -sh .next/static/chunks/ 2>/dev/null || echo "   (not found)"
echo ""
echo "   Largest JS files:"
find .next/static -name "*.js" -exec du -sh {} + 2>/dev/null | sort -rh | head -10

# 3. Run Lighthouse
echo ""
echo "3️⃣ Running Lighthouse (requires lighthouse CLI)..."
if command -v lighthouse &>/dev/null; then
  lighthouse http://localhost:3000 \
    --chrome-flags="--headless --no-sandbox" \
    --output=json \
    --output-path=./lighthouse-report.json \
    --only-categories=performance,accessibility,best-practices,seo \
    --quiet

  echo "   Report saved: lighthouse-report.json"

  # Extract scores
  node -e "
    const r = require('./lighthouse-report.json');
    const cats = r.categories;
    console.log('   Performance:    ' + Math.round(cats.performance.score * 100));
    console.log('   Accessibility:  ' + Math.round(cats.accessibility.score * 100));
    console.log('   Best Practices: ' + Math.round(cats['best-practices'].score * 100));
    console.log('   SEO:            ' + Math.round(cats.seo.score * 100));
  "
else
  echo "   ⚠️ lighthouse CLI not installed. Run: npm i -g lighthouse"
fi

echo ""
echo "═══════════════════════════════════════"
echo "🎯 Analysis complete"
```

### Validación:
```bash
npx tsc --noEmit
ls src/lib/cache/redis.ts src/components/ui/lazy-load.tsx
ls src/components/ui/optimized-image.tsx src/lib/performance/prefetch.ts
ls scripts/analyze-bundle.sh
```

### Commit: `feat(performance): ARES-704 performance optimization — Redis cache, lazy load, optimized images, bundle analysis, prefetch`

---

# ═══════════════════════════════════════════════════════════════════
# FIN DE FASE 7 — MOBILE Y PWA
# ═══════════════════════════════════════════════════════════════════
#
# Al completar los 5 scripts de esta fase, el proyecto tiene:
#
# ✅ PWA completa: manifest.json, service worker, install prompt gaming-styled
# ✅ Push notifications: VAPID, subscribe, broadcast admin, SW handler
# ✅ Offline mode: IndexedDB cache, offline page, online status indicator
# ✅ Capacitor APK: config, build script, init script, splash screen
# ✅ Performance: Redis cache-aside, lazy load, optimized images, bundle analysis
#
# EXPERIENCIA MOBILE:
# - Instalable desde el navegador (PWA)
# - Push notifications para re-engagement
# - Funciona offline con datos cacheados
# - APK distribuible sin Play Store
# - Lighthouse 90+ target
# - Touch targets 44×44px en toda la app
#
# PRÓXIMA FASE: docs/MASTER-PLAN-I.md (Fase 8 — SEO, Growth, Testing y Deploy)
#
# ═══════════════════════════════════════════════════════════════════
