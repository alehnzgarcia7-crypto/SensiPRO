'use client';

import { motion } from 'framer-motion';
import { RotateCcw, Heart, Share2, Download, Ruler, Target, Gauge } from 'lucide-react';

import { useGeneratorStore } from '@/stores/generator.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { CountUp } from '@/components/effects/count-up';
import { CalibrationSelector } from './calibration-selector';
import { DpiToggle } from './dpi-toggle';
import { HudRecommendationPanel } from './hud-recommendation';

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
  const {
    selectedDevice,
    selectedStyle,
    allCalibrations,
    calibration,
    dpiMode,
    setCalibration,
    setDpiMode,
    getCurrentCombination,
  } = useGeneratorStore();

  const currentCombo = getCurrentCombination();

  if (!allCalibrations || !selectedDevice || !currentCombo) return null;

  const styleVariant = selectedStyle.toLowerCase() as 'aggressive' | 'balanced' | 'sniper';
  const sensitivityEntries = Object.entries(currentCombo.sensitivity) as [string, number][];
  const gyroscopeEntries = currentCombo.gyroscope
    ? (Object.entries(currentCombo.gyroscope) as [string, number][])
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
            <CountUp end={currentCombo.performanceScore} />
            <span className="text-lg text-slate-500">/100</span>
          </p>
        </div>
      </div>

      {/* Controles de calibración y DPI — reactivos, sin reload */}
      <Card variant="default" className="p-4 space-y-4">
        <CalibrationSelector value={calibration} onChange={setCalibration} />
        <DpiToggle
          enabled={dpiMode}
          onChange={setDpiMode}
          dpiValue={currentCombo.dpiValue}
        />
      </Card>

      {/* Valores de sensibilidad */}
      <Card variant="glow" className="p-6">
        <h3 className="font-display font-bold text-white mb-4">Sensibilidades</h3>
        <div className="space-y-4">
          {sensitivityEntries.map(([key, value], i) => (
            <motion.div
              key={`${key}-${calibration}-${dpiMode}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-400">{FIELD_LABELS[key] ?? key}</span>
                <span className="text-lg font-display font-bold text-white">
                  <CountUp end={value} duration={600} />
                </span>
              </div>
              <Progress value={value} max={100} size="sm" color="gradient" />
            </motion.div>
          ))}
        </div>

        {/* Filas adicionales: Precision Score, Button Size, DPI */}
        <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
          {/* Precision Score */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-ice-400" />
              <span className="text-sm text-slate-400">Precisión</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-display font-bold text-ice-300">
                <CountUp end={currentCombo.precisionScore} duration={600} />
                <span className="text-xs text-slate-500">/100</span>
              </span>
            </div>
          </div>
          <Progress value={currentCombo.precisionScore} max={100} size="sm" color="ice" />

          {/* Button Size */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <Ruler size={14} className="text-fire-400" />
              <span className="text-sm text-slate-400">Tamaño del Botón</span>
            </div>
            <span className="text-sm font-display font-bold text-white">
              {currentCombo.buttonSize}mm
            </span>
          </div>

          {/* DPI Value (solo si dpiMode) */}
          {currentCombo.dpiValue !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center justify-between mt-3"
            >
              <div className="flex items-center gap-2">
                <Gauge size={14} className="text-ice-400" />
                <span className="text-sm text-slate-400">DPI Óptimo</span>
              </div>
              <span className="text-sm font-display font-bold text-ice-300">
                <CountUp end={currentCombo.dpiValue} duration={600} />
              </span>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Giroscopio */}
      {gyroscopeEntries && (
        <Card variant="glow" className="p-6">
          <h3 className="font-display font-bold text-white mb-4">Giroscopio</h3>
          <div className="space-y-4">
            {gyroscopeEntries.map(([key, value], i) => (
              <motion.div
                key={`${key}-${calibration}-${dpiMode}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-400">{GYRO_LABELS[key] ?? key}</span>
                  <span className="text-lg font-display font-bold text-white">
                    <CountUp end={value} duration={600} />
                  </span>
                </div>
                <Progress value={value} max={100} size="sm" color="ice" />
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* HUD Recommendation */}
      <HudRecommendationPanel
        data={allCalibrations.hudRecommendation}
        deviceId={selectedDevice.id}
        screenSize={selectedDevice.screenSize}
      />

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
