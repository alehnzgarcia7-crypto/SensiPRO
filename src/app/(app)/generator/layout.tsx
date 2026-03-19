import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generador de Sensibilidad | SensiPRO — Free Fire',
  description: 'Genera la sensibilidad perfecta para Free Fire basada en tu dispositivo. 644+ celulares de 26 marcas, calibración por DPI real, 3 estilos de juego y 9 combinaciones de ajuste.',
  keywords: ['sensibilidad free fire', 'configuración free fire', 'sensibilidad perfecta', 'generador sensibilidad'],
};

export default function GeneratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
