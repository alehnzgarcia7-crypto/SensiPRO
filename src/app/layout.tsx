import type { Metadata, Viewport } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Sensibilidades PRO — Generador #1 para Free Fire',
    template: '%s | Sensibilidades PRO',
  },
  description:
    'Genera las mejores sensibilidades para Free Fire basadas en las especificaciones reales de tu dispositivo. 500+ dispositivos, 3 estilos de juego, giroscopio y más.',
  keywords: [
    'sensibilidades free fire',
    'sensibilidad free fire',
    'configuracion free fire',
    'mejor sensibilidad',
    'free fire config',
    'sensibilidades pro',
  ],
  authors: [{ name: 'ARES SensiPRO' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sensibilidadespro.com'),
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'Sensibilidades PRO',
    title: 'Sensibilidades PRO — Generador #1 para Free Fire',
    description: 'Genera sensibilidades basadas en hardware real. 500+ dispositivos.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sensibilidades PRO — Generador #1 para Free Fire',
    description: 'Genera sensibilidades basadas en hardware real. 500+ dispositivos.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#050810',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
