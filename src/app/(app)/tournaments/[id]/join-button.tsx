'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Loader2 } from 'lucide-react';

interface JoinTournamentButtonProps {
  tournamentId: string;
}

export function JoinTournamentButton({ tournamentId }: JoinTournamentButtonProps) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    setJoining(true);
    setError(null);

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/join`, {
        method: 'POST',
      });

      const json: { success: boolean; error?: { message: string } } = await res.json();

      if (!json.success) {
        setError(json.error?.message ?? 'Error al inscribirse');
        return;
      }

      router.refresh();
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="text-center">
      <button
        onClick={handleJoin}
        disabled={joining}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-gaming bg-gradient-to-r from-fire-500 to-fire-600 px-8 py-3 font-bold text-white shadow-glow-fire transition-all hover:from-fire-400 hover:to-fire-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {joining ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Trophy size={18} />
        )}
        {joining ? 'Inscribiendo...' : 'Inscribirme al torneo'}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
