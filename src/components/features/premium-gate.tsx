'use client';

import { Lock, Crown, Zap } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { getMinimumTier, getUpgradeFeatures, type FeatureKey } from '@/lib/tiers';
import { cn } from '@/lib/cn';

interface PremiumGateProps {
  feature: FeatureKey;
  userTier: 'FREE' | 'PREMIUM' | 'VIP';
  children: React.ReactNode;
  blurAmount?: number;
  showPreview?: boolean;
  className?: string;
}

const FEATURE_UPSELL: Partial<Record<FeatureKey, { title: string; description: string; icon: typeof Lock }>> = {
  gyroscope: { title: 'Giroscopio PRO', description: 'Valores de giroscopio calibrados para tu dispositivo', icon: Zap },
  compareDevices: { title: 'Comparador', description: 'Compara 2 dispositivos side-by-side', icon: Crown },
  exportImage: { title: 'Exportar Imagen', description: 'Descarga tu config como imagen para compartir', icon: Crown },
  styleAggressive: { title: 'Estilo Agresivo', description: 'Sensibilidades calibradas para rush', icon: Zap },
  styleSniper: { title: 'Estilo Francotirador', description: 'Máxima precisión para largo alcance', icon: Zap },
  vipThemes: { title: 'Temas VIP', description: 'Temas exclusivos: Neon Purple, Blood Red, Matrix Green', icon: Crown },
};

export function PremiumGate({ feature, userTier, children, blurAmount = 8, showPreview = true, className }: PremiumGateProps) {
  const requiredTier = getMinimumTier(feature);

  const tierLevel = { FREE: 0, PREMIUM: 1, VIP: 2 } as const;
  const hasAccess = tierLevel[userTier] >= tierLevel[requiredTier];

  if (hasAccess) return <>{children}</>;

  const upsell = FEATURE_UPSELL[feature] ?? { title: 'Contenido Premium', description: 'Mejora tu plan para acceder', icon: Lock };
  const Icon = upsell.icon;
  const gains = getUpgradeFeatures(userTier, requiredTier);

  return (
    <div className={cn('relative overflow-hidden rounded-gaming', className)}>
      {/* Blurred preview */}
      {showPreview && (
        <div className="pointer-events-none select-none" style={{ filter: `blur(${blurAmount}px)` }}>
          {children}
        </div>
      )}

      {/* Overlay */}
      <div className={cn(
        'flex flex-col items-center justify-center text-center p-8',
        showPreview ? 'absolute inset-0 bg-background-base/60 backdrop-blur-sm' : '',
      )}>
        <div className="w-14 h-14 rounded-2xl bg-fire-500/10 flex items-center justify-center mb-4">
          <Icon size={24} className="text-fire-500" />
        </div>
        <h3 className="font-display font-bold text-white text-lg">{upsell.title}</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-xs">{upsell.description}</p>

        {gains.length > 0 && (
          <div className="mt-4 text-left">
            {gains.slice(0, 3).map((g) => (
              <div key={g} className="flex items-center gap-2 text-xs text-slate-300 mb-1">
                <span className="text-success">&check;</span> {g}
              </div>
            ))}
          </div>
        )}

        <Link href="/pricing" className="mt-5">
          <Button variant="primary" size="sm" leftIcon={<Crown size={14} />}>
            Obtener {requiredTier}
          </Button>
        </Link>
      </div>
    </div>
  );
}
