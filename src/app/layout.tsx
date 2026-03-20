import type { Metadata, Viewport } from 'next';
import { Orbitron, Exo_2, Rajdhani, JetBrains_Mono } from 'next/font/google';

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
    'Genera la sensibilidad perfecta para Free Fire con calibración por DPI real. 613+ dispositivos de 21 marcas, ajuste por hardware.',
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
      'Genera la sensibilidad perfecta para Free Fire con calibración por DPI real. 613+ dispositivos de 21 marcas.',
    images: [{ url: '/og-image.svg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sensibilidades PRO — Free Fire',
    description:
      'Genera la sensibilidad perfecta de Free Fire para TU celular. 613+ dispositivos, 21 marcas.',
    images: ['/og-image.svg'],
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
        <BackgroundAtmosphere />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
