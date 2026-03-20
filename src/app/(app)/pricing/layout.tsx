import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Precio — SensiPRO | $199 MXN Pago Único',
  description:
    'Acceso de por vida por $199 MXN. Sin suscripción. Generador de sensibilidad, Headshot Mode, Academia PRO, 613+ dispositivos. Paga con tarjeta o en OXXO.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
