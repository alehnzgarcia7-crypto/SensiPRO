'use client';

import { motion } from 'framer-motion';
import { RotateCcw, Heart, Share2, Download } from 'lucide-react';

import { useGeneratorStore } from '@/stores/generator.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { CountUp } from '@/components/effects/count-up';

interface ResultPanelProps {
  onReset: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  general: 'General',
  redPoint: 'Punto Rojo',
  scope2x: 'Mira 2x',
  scope4x: 'Mira 4x',
  sniperScope: 'Mira Sniper',
  freeView: 'Vista Libre',
};

const GYRO_LABELS: Record<string, string> = {
  gyroGeneral: 'Gyro General',
  gyroRedPoint: 'Gyro Punto Rojo',
  gyroScope2x: 'Gyro 2x',
  gyroScope4x: 'Gyro 4x',
  gyroSniper: 'Gyro Sniper',
  gyroFreeView: 'Gyro Vista Libre',
};

export function ResultPanel({ onReset }: ResultPanelProps) {
  const { selectedDevice, selectedStyle, result } = useGeneratorStore();

  if (!result || !selectedDevice) return null;

  const styleVariant = selectedStyle.toLowerCase() as 'aggressive' | 'balanced' | 'sniper';

  const sensitivityEntries = Object.entries(result.sensitivity) as [string, number][];
  const gyroscopeEntries = result.gyroscope
    ? (Object.entries(result.gyroscope) as [string, number][])
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 font-ui">{selectedDevice.brand}</p>
          <h2 className="text-2xl font-display font-bold text-white">{selectedDevice.model}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={styleVariant} size="sm">{selectedStyle}</Badge>
            <Badge variant={selectedDevice.tier === 'GAMING' || selectedDevice.tier === 'ULTRA' ? 'vip' : 'premium'} size="sm">
              {selectedDevice.tier}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Performance</p>
          <p className="text-3xl font-display font-black text-gradient-fire-ice">
            <CountUp end={result.meta.performanceScore} />
            <span className="text-lg text-slate-500">/100</span>
          </p>
        </div>
      </div>

      {/* Valores de sensibilidad */}
      <Card variant="glow" className="p-6">
        <h3 className="font-display font-bold text-white mb-4">Sensibilidades</h3>
        <div className="space-y-4">
          {sensitivityEntries.map(([key, value], i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-400">{FIELD_LABELS[key] ?? key}</span>
                <span className="text-lg font-display font-bold text-white">
                  <CountUp end={value} duration={800} />
                </span>
              </div>
              <Progress value={value} max={100} size="sm" color="gradient" />
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Giroscopio */}
      {gyroscopeEntries && (
        <Card variant="glow" className="p-6">
          <h3 className="font-display font-bold text-white mb-4">Giroscopio</h3>
          <div className="space-y-4">
            {gyroscopeEntries.map(([key, value], i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-400">{GYRO_LABELS[key] ?? key}</span>
                  <span className="text-lg font-display font-bold text-white">
                    <CountUp end={value} duration={800} />
                  </span>
                </div>
                <Progress value={value} max={100} size="sm" color="ice" />
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Acciones */}
      <div className="flex flex-wrap gap-3">
        <Button variant="ghost" size="sm" leftIcon={<Heart size={16} />}>Guardar</Button>
        <Button variant="ghost" size="sm" leftIcon={<Share2 size={16} />}>Compartir</Button>
        <Button variant="ghost" size="sm" leftIcon={<Download size={16} />}>Exportar</Button>
        <Button variant="secondary" size="sm" leftIcon={<RotateCcw size={16} />} onClick={onReset}>
          Nueva busqueda
        </Button>
      </div>
    </div>
  );
}
