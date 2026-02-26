import type { Metadata } from 'next';

import { GeneratorFlow } from '@/components/generator/generator-flow';

export const metadata: Metadata = {
  title: 'Generador de Sensibilidad | SensiPRO — Free Fire',
  description: 'Genera la sensibilidad perfecta para Free Fire basada en tu dispositivo. 485+ celulares, calibración por DPI, giroscopio y tamaño de pantalla.',
  keywords: ['sensibilidad free fire', 'configuración free fire', 'sensibilidad perfecta', 'generador sensibilidad'],
};

export default function GeneratorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <GeneratorFlow />
    </div>
  );
}
