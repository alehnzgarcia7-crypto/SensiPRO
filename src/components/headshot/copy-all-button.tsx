'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/cn';
import {
  getHudLayout,
  getFingerTechniques,
  getWeaponRecommendation,
  getTrainingPlan,
  FINGER_PROFILES,
  type FingerCount,
  type FingerProfile,
  type FireButtonRecommendation,
} from '@ares/algorithms';
import type { SensitivityOutput } from '@ares/algorithms';

interface CopyAllButtonProps {
  sensitivity: SensitivityOutput;
  gyroscope: { general: number; redPoint: number; scope2x: number; scope4x: number; sniperScope: number } | null;
  fingers: FingerCount;
  fireButton: FireButtonRecommendation;
  deviceName?: string;
}

export function CopyAllButton({
  sensitivity,
  gyroscope,
  fingers,
  fireButton,
  deviceName,
}: CopyAllButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const profile = FINGER_PROFILES[fingers];
    const hudLayout = getHudLayout(fingers);
    const fingerTech = getFingerTechniques(fingers);
    const weaponRec = getWeaponRecommendation(fingers);
    const plan = getTrainingPlan(fingers);
    const tierSWeapons = weaponRec.tiers.find((t) => t.tier === 'S')?.weapons.map((w) => w.name).join(', ') ?? '';

    const lines = [
      '🔥 SensiPRO — Headshot Mode',
      '═══════════════════════════════',
    ];

    if (deviceName) {
      lines.push(`📱 Dispositivo: ${deviceName}`);
    }
    lines.push(`🎯 ${fingers} Dedos (${profile.competitiveLabelEs})`);
    lines.push('');
    lines.push('📊 SENSIBILIDAD:');
    lines.push(`  General: ${sensitivity.general} | P.Rojo: ${sensitivity.redPoint}`);
    lines.push(`  2x: ${sensitivity.scope2x} | 4x: ${sensitivity.scope4x} | AWM: ${sensitivity.sniperScope}`);
    lines.push(`  Vista Libre: ${sensitivity.freeView}`);

    if (gyroscope) {
      lines.push(`  Giroscopio: General ${gyroscope.general} | P.Rojo ${gyroscope.redPoint} | 2x ${gyroscope.scope2x} | 4x ${gyroscope.scope4x} | AWM ${gyroscope.sniperScope}`);
    }

    lines.push('');
    lines.push(`🔘 BOTÓN DE DISPARO: ${fireButton.size}%`);
    lines.push('');
    lines.push(`🎮 HUD: ${hudLayout.nameEs}`);
    for (const role of hudLayout.fingerRoles) {
      lines.push(`  ${role.fingerEs}: ${role.actionsEs.join(', ')}`);
    }

    lines.push('');
    lines.push(`🎯 TÉCNICA PRINCIPAL: ${fingerTech.primaryTechnique === 'vertical' ? 'Drag Vertical' : fingerTech.primaryTechnique === 'rotation' ? 'Rotation Drag (J-Drag)' : 'Direction Drag'}`);
    lines.push(`🔫 ARMAS TIER S: ${tierSWeapons}`);
    lines.push(`🏋️ TRAINING: Plan "${plan.nameEs}" de 7 días`);

    if (fingers === 4) {
      lines.push('');
      lines.push('🏆 CONFIGURACIÓN PRO PLAYER');
    }

    lines.push('═══════════════════════════════');
    lines.push('Generado por SensiPRO — sensibilidadespro.com');

    void navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [sensitivity, gyroscope, fingers, fireButton, deviceName]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'w-full min-h-[52px] px-6 py-3.5 rounded-xl text-sm font-ui font-bold transition-all duration-300',
        copied
          ? 'bg-green-500/10 border border-green-500/30 text-green-400'
          : 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-400 hover:from-cyan-500/15 hover:to-blue-500/15 hover:border-cyan-500/30',
      )}
      style={!copied ? {
        boxShadow: '0 0 20px rgba(6,182,212,0.05)',
      } : undefined}
    >
      {copied ? '✅ Configuración copiada al portapapeles' : '📋 Copiar Toda la Configuración'}
    </button>
  );
}
