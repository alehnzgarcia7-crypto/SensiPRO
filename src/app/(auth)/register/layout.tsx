import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear Cuenta — SensiPRO',
  description:
    'Crea tu cuenta en SensiPRO y calibra la sensibilidad perfecta para tu dispositivo.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
