import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guías Pro de Free Fire — Academia SensiPRO',
  description:
    '11 guías completas: sensibilidad, HUD, giroscopio, técnicas de drag, configuración gráfica, crosshair placement y más.',
};

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
