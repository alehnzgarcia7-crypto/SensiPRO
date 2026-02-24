import type { Metadata } from 'next';

import { GeneratorFlow } from '@/components/generator/generator-flow';

export const metadata: Metadata = {
  title: 'Generador de Sensibilidades',
  description: 'Genera las mejores sensibilidades para Free Fire basadas en las specs reales de tu dispositivo.',
};

export default function GeneratorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <GeneratorFlow />
    </div>
  );
}
