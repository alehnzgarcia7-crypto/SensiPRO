import { redirect } from 'next/navigation';
import { Users, Gift } from 'lucide-react';

import { auth } from '@/lib/auth';
import { getReferralStats } from '@/lib/payments/referrals';
import { Card } from '@/components/ui/card';
import { CopyReferralCode } from '@/components/features/copy-referral';

export const metadata = {
  title: 'Referidos — Sensibilidades PRO',
  description: 'Invita amigos y ambos reciben 7 días Premium gratis',
};

export default async function ReferralsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const stats = await getReferralStats(session.user.id);
  if (!stats) redirect('/login');

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-display font-bold text-white mb-2">Referidos</h1>
      <p className="text-sm text-slate-400 mb-6">
        Invita amigos y ambos reciben {stats.bonusDaysPerReferral} días Premium gratis
      </p>

      {/* Código de referido */}
      <Card variant="glow" className="p-6 mb-6">
        <p className="text-xs font-ui text-slate-500 uppercase tracking-wider mb-2">Tu Código</p>
        <CopyReferralCode code={stats.referralCode ?? ''} />
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-5 text-center">
          <Users size={24} className="mx-auto text-fire-500 mb-2" />
          <p className="text-2xl font-display font-black text-white">{stats.totalReferrals}</p>
          <p className="text-xs text-slate-500">Referidos totales</p>
        </Card>
        <Card className="p-5 text-center">
          <Gift size={24} className="mx-auto text-ice-500 mb-2" />
          <p className="text-2xl font-display font-black text-white">{stats.totalBonusDaysEarned}</p>
          <p className="text-xs text-slate-500">Días Premium ganados</p>
        </Card>
      </div>

      {/* Lista de usuarios referidos */}
      {stats.referredUsers.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-white mb-3">Usuarios Referidos</h2>
          <div className="space-y-2">
            {stats.referredUsers.map((u) => (
              <div key={u.id} className="glass p-3 flex items-center justify-between">
                <span className="text-sm text-white font-ui">{u.username}</span>
                <span className="text-xs text-slate-500">
                  {new Date(u.createdAt).toLocaleDateString('es-MX')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.referredUsers.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-slate-400 text-sm">
            Aún no tienes referidos. ¡Comparte tu código y gana Premium gratis!
          </p>
        </Card>
      )}
    </div>
  );
}
