import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Videos — Academia SensiPRO',
  description:
    'Tutoriales en video sobre sensibilidad, técnicas de drag y configuración de Free Fire.',
};

export default function VideosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
