import type { Metadata } from 'next';

import { LeaderboardView } from '@/components/community/leaderboard-view';

export const metadata: Metadata = {
  title: 'Rankings | SensiPRO — Los Mejores Jugadores',
  description:
    'Mira los rankings de los mejores jugadores de SensiPRO. Compite, sube de nivel y demuestra que eres el mejor.',
  keywords: ['ranking free fire', 'mejores jugadores', 'leaderboard free fire'],
};

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-white mb-2">Rankings</h1>
      <p className="text-sm text-slate-400 mb-6">Los jugadores más activos de SensiPRO</p>
      <LeaderboardView />
    </div>
  );
}
