import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '24 Tips exclusivos de SensiPRO — Academia SensiPRO',
  description:
    '24 tips basados en datos reales del motor ARES. Armas, personajes, técnicas y configuración para subir de ranked.',
};

export default function TipsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
