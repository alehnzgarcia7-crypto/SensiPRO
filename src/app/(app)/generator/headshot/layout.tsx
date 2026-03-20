import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Headshot Mode — Sensibilidad por Arma | SensiPRO',
  description:
    'Calibra tu sensibilidad para headshots con datos reales de daño por arma. M1887, AWM, M4A1 y más. 9 técnicas de drag paso a paso.',
};

export default function HeadshotLayout({ children }: { children: React.ReactNode }) {
  return children;
}
