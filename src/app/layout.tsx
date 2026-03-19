import type { Metadata, Viewport } from 'next';
import { Orbitron, Exo_2, Rajdhani, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';

import { BackgroundAtmosphere } from '@/components/effects/background-atmosphere';
import { Providers } from '@/components/providers';
import './globals.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-orbitron',
  display: 'swap',
});

const exo2 = Exo_2({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-exo2',
  display: 'swap',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? '';

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
  description:
    'Genera la sensibilidad perfecta para Free Fire con calibración por DPI real. 610+ dispositivos de 21 marcas, ajuste por hardware.',
  keywords: [
    'sensibilidades free fire',
    'sensibilidad free fire',
    'configuracion free fire',
    'mejor sensibilidad',
    'free fire config',
    'sensibilidades pro',
  ],
  authors: [{ name: 'ARES SensiPRO' }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sensibilidadespro.com',
  ),
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
    description:
      'Genera la sensibilidad perfecta para Free Fire con calibración por DPI real. 610+ dispositivos de 21 marcas.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sensibilidades PRO — Free Fire',
    description:
      'Genera la sensibilidad perfecta de Free Fire para TU celular. 610+ dispositivos, 21 marcas.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`min-h-screen bg-[#050810] text-slate-200 antialiased font-body ${orbitron.variable} ${exo2.variable} ${rajdhani.variable} ${jetbrainsMono.variable}`}>
        {tiktokPixelId && (
          <Script
            id="tiktok-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e+\"_\"+o]=1,ttq._o=ttq._o||{},ttq._o[e]=n||{};var a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=r+"?sdkid="+e+"&lib="+t;var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(a,s)};
  ttq.load('${tiktokPixelId}');
  ttq.page();
}(window, document, 'ttq');`,
            }}
          />
        )}
        <BackgroundAtmosphere />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
