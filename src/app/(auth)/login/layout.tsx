import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión — SensiPRO',
  description:
    'Inicia sesión en SensiPRO para acceder a tu sensibilidad calibrada y contenido premium.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
