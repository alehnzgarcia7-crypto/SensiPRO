import type { Metadata } from 'next';

import { ConfigFeed } from '@/components/community/config-feed';

export const metadata: Metadata = {
  title: 'Comunidad | SensiPRO',
  description:
    'Configs compartidas por la comunidad de SensiPRO. Vota, comenta y descubre las mejores configuraciones de sensibilidad para Free Fire.',
};

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-white mb-2">
        Comunidad
      </h1>
      <p className="text-sm text-slate-400 mb-6">
        Configs compartidas por jugadores como tu. Vota las mejores.
      </p>
      <ConfigFeed />
    </div>
  );
}
