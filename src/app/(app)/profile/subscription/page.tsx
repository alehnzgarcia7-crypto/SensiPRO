import { Crown, AlertTriangle, Calendar, CreditCard, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { RedeemCode } from '@/components/features/redeem-code';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { getSubscriptionStatus, getCodeTypeLabel } from '@/lib/payments/subscription';
import { getTierConfig } from '@/lib/tiers';

// ══════════════════════════════════════════════════════════
// Página de gestión de suscripción del usuario
// Muestra: plan actual, días restantes, alerta de expiración,
// opción de renovar/mejorar, redimir código, historial de pagos
// ══════════════════════════════════════════════════════════

export const metadata = {
  title: 'Mi Suscripción | Sensibilidades PRO',
  description: 'Gestiona tu suscripción, renueva tu plan o activa un código.',
};

export default async function SubscriptionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const status = await getSubscriptionStatus(session.user.id);
  if (!status) redirect('/login');

  const tierConfig = getTierConfig(status.tier);

  const badgeVariant = status.tier === 'VIP'
    ? 'vip' as const
    : status.tier === 'PREMIUM'
      ? 'premium' as const
      : 'free' as const;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-display font-bold text-white mb-6">Mi Suscripción</h1>

      {/* Plan actual */}
      <Card variant="glow" className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{tierConfig.icon}</span>
            <div>
              <h2 className="font-display font-bold text-white">{tierConfig.nameEs}</h2>
              <p className="text-sm text-slate-400">{tierConfig.priceLabel}</p>
            </div>
          </div>
          <Badge variant={badgeVariant}>
            {status.tier}
          </Badge>
        </div>

        {/* Fecha de expiración */}
        {status.expiresAt && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-slate-500" />
            <span className="text-slate-400">
              Expira: {new Date(status.expiresAt).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {status.daysRemaining !== null && ` (${status.daysRemaining} días restantes)`}
            </span>
          </div>
        )}

        {/* Alerta de expiración próxima */}
        {status.isExpiringSoon && (
          <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
            <AlertTriangle size={16} className="shrink-0" />
            <span>Tu suscripción expira pronto. Renueva para no perder acceso a las funciones premium.</span>
          </div>
        )}

        {/* Expirada */}
        {status.isExpired && (
          <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertTriangle size={16} className="shrink-0" />
            <span>Tu suscripción ha expirado. Renueva ahora para recuperar el acceso.</span>
          </div>
        )}

        {/* Acciones según estado */}
        <div className="mt-4 flex flex-wrap gap-3">
          {status.tier === 'FREE' ? (
            <Link href="/pricing">
              <Button variant="primary" leftIcon={<Crown size={16} />}>
                Mejorar Plan
              </Button>
            </Link>
          ) : (
            <>
              {status.isExpiringSoon && (
                <Link href="/pricing">
                  <Button variant="premium" leftIcon={<RefreshCw size={16} />}>
                    Renovar Plan
                  </Button>
                </Link>
              )}
              {status.tier === 'PREMIUM' && (
                <Link href="/pricing">
                  <Button variant="vip" leftIcon={<Crown size={16} />}>
                    Mejorar a VIP
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Canjear código */}
      <div className="mb-6">
        <RedeemCode />
      </div>

      {/* Historial de pagos */}
      {status.recentPayments.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-white mb-3 flex items-center gap-2">
            <CreditCard size={16} /> Historial de Pagos
          </h2>
          <div className="space-y-2">
            {status.recentPayments.map((payment) => {
              const label = getCodeTypeLabel(payment.codeType);
              const providerLabel = payment.provider === 'CODE' ? 'Código' : payment.provider;

              return (
                <div key={payment.id} className="glass p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-ui font-semibold text-white">{label}</p>
                    <p className="text-xs text-slate-500">
                      {providerLabel} &bull; {new Date(payment.createdAt).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-display font-bold text-white">
                      {payment.amount > 0 ? `$${payment.amount} MXN` : 'Código'}
                    </p>
                    <Badge
                      variant={payment.status === 'COMPLETED' ? 'free' : 'default'}
                      size="sm"
                    >
                      {payment.status === 'COMPLETED' ? 'Completado' : payment.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sin pagos */}
      {status.recentPayments.length === 0 && status.tier === 'FREE' && (
        <div className="text-center py-8">
          <p className="text-slate-500 text-sm">
            Aún no tienes pagos registrados.
          </p>
          <p className="text-slate-600 text-xs mt-1">
            Mejora a Premium o VIP para desbloquear todas las funciones.
          </p>
        </div>
      )}
    </div>
  );
}
