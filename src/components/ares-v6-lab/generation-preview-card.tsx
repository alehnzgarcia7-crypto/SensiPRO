import { Crosshair, Gamepad2, Gauge, ListChecks, Sparkles, Target } from 'lucide-react';

import type { AresV6GenerationPreview } from '@/lib/ares-v6/internal-ui-service';
import { cn } from '@/lib/cn';
import type {
  AresV6ConfidenceScore,
  AresV6DpiRecommendation,
  AresV6Explanation,
  AresV6FireButtonRecommendation,
  AresV6GyroscopeVector,
  AresV6HudRecommendation,
  AresV6SensitivityVector,
  AresV6TuningStep,
} from '@ares/algorithms/engine-v6';

import {
  buildGyroRows,
  buildSensitivityRows,
  clampPercent,
  confidenceLabel,
  confidenceTone,
  riskLevelTone,
  validationLabel,
  validationTone,
} from './presenters';
import { AresV6Badge, AresV6Bar, AresV6KeyValue, AresV6SectionCard } from './primitives';

// ═══════════════════════════════════════════════════════════════
// ARES v6 lab — Generation preview cards (Fase 3E)
//
// Renders a full engine package as an explained lab readout — sensitivity bars,
// gyro, fire button + HUD, confidence + DPI provenance, explanation and the
// first tuning steps. Never a raw JSON dump. Pure + SSR-renderable.
// ═══════════════════════════════════════════════════════════════

function humanizeEnum(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => (part.length > 0 ? part[0]?.toUpperCase() + part.slice(1) : part))
    .join(' ');
}

export function AresV6SensitivityGrid({
  sensitivity,
  gyroscope,
}: {
  sensitivity: AresV6SensitivityVector;
  gyroscope: AresV6GyroscopeVector | null;
}) {
  const rows = buildSensitivityRows(sensitivity);
  const gyroRows = buildGyroRows(gyroscope);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {rows.map((row) => (
          <AresV6Bar key={row.key} label={row.label} value={row.value} barPercent={row.barPercent} tone="info" />
        ))}
      </div>

      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
            Giroscopio
          </span>
          <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-300">
            Premium
          </span>
        </div>
        {gyroRows.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {gyroRows.map((row) => (
              <AresV6Bar key={row.key} label={row.label} value={row.value} barPercent={row.barPercent} tone="warn" />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            Este preset no produjo giroscopio para el jugador de laboratorio.
          </p>
        )}
      </div>
    </div>
  );
}

export function AresV6HudFireButtonCard({
  hud,
  fireButton,
}: {
  hud: AresV6HudRecommendation;
  fireButton: AresV6FireButtonRecommendation;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-slate-200">
          <Gamepad2 className="h-4 w-4 text-[#00c8ff]" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wider">HUD</span>
        </div>
        <AresV6KeyValue label="Layout" value={humanizeEnum(hud.layoutFamily)} />
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-wider text-slate-500">Botones prioritarios</p>
          <div className="flex flex-wrap gap-1.5">
            {hud.priorityButtons.map((button, index) => (
              <span
                key={`${button}-${index}`}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-300"
              >
                {button}
              </span>
            ))}
          </div>
        </div>
        {hud.riskNotes.length > 0 ? (
          <ul className="space-y-1">
            {hud.riskNotes.map((note, index) => (
              <li key={index} className="flex gap-2 text-[11px] text-amber-300/90">
                <span aria-hidden>⚠</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {hud.nextUpgradePath ? (
          <p className="text-[11px] text-slate-500">Siguiente nivel: {hud.nextUpgradePath}</p>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-slate-200">
          <Target className="h-4 w-4 text-[#ff6a00]" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wider">Botón de disparo</span>
        </div>
        <AresV6Bar label="Tamaño" value={`${fireButton.sizePercent}%`} barPercent={clampPercent(fireButton.sizePercent)} tone="info" />
        <AresV6Bar
          label="Opacidad"
          value={`${fireButton.opacityPercent}%`}
          barPercent={clampPercent(fireButton.opacityPercent)}
          tone="info"
        />
        <AresV6KeyValue label="Dedo recomendado" value={fireButton.recommendedFinger} />
        <AresV6KeyValue label="Posición" value={humanizeEnum(fireButton.placement)} />
        <AresV6KeyValue label="Zona de arrastre" value={humanizeEnum(fireButton.dragZone)} />
        <p className="text-[11px] leading-relaxed text-slate-400">{fireButton.explanation}</p>
      </div>
    </div>
  );
}

export function AresV6ConfidenceCard({
  confidence,
  dpi,
}: {
  confidence: AresV6ConfidenceScore;
  dpi: AresV6DpiRecommendation;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-200">
            <Gauge className="h-4 w-4 text-[#00c8ff]" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wider">Confianza</span>
          </div>
          <AresV6Badge tone={confidenceTone(confidence.grade)}>{confidenceLabel(confidence.grade)}</AresV6Badge>
        </div>
        <AresV6Bar
          label="Puntaje"
          value={confidence.score}
          barPercent={clampPercent(confidence.score)}
          tone={confidenceTone(confidence.grade)}
        />
        {confidence.missingSignals.length > 0 ? (
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-wider text-slate-500">Señales faltantes</p>
            <div className="flex flex-wrap gap-1.5">
              {confidence.missingSignals.map((signal, index) => (
                <span
                  key={`${signal}-${index}`}
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-400"
                >
                  {signal}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {confidence.warnings.length > 0 ? (
          <ul className="space-y-1">
            {confidence.warnings.map((warning, index) => (
              <li key={index} className="text-[11px] text-amber-300/90">
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="space-y-2 rounded-lg border border-white/5 bg-white/[0.02] p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">DPI / PPI</p>
        <AresV6KeyValue label="Modo" value={humanizeEnum(dpi.mode)} />
        <AresV6KeyValue label="PPI detectado" value={dpi.detectedPpi ?? '—'} />
        <AresV6KeyValue label="Fuente" value={humanizeEnum(dpi.source)} />
        {typeof dpi.suggestedSmallestWidth === 'number' ? (
          <AresV6KeyValue label="Smallest width sugerido" value={dpi.suggestedSmallestWidth} />
        ) : null}
        <p className="pt-1 text-[11px] leading-relaxed text-slate-400">{dpi.explanation}</p>
      </div>
    </div>
  );
}

export function AresV6ExplanationPanel({ explanation }: { explanation: AresV6Explanation }) {
  return (
    <div className="space-y-3">
      <p className="font-display text-sm font-semibold text-slate-100">{explanation.headline}</p>
      {explanation.bullets.length > 0 ? (
        <ul className="space-y-1.5">
          {explanation.bullets.map((bullet, index) => (
            <li key={index} className="flex gap-2 text-xs text-slate-300">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#00c8ff]" aria-hidden />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {explanation.technicalNotes.length > 0 ? (
        <details className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
          <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Notas técnicas
          </summary>
          <ul className="mt-2 space-y-1">
            {explanation.technicalNotes.map((note, index) => (
              <li key={index} className="font-mono text-[11px] text-slate-500">
                {note}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

export function AresV6TuningStepsPanel({ steps }: { steps: readonly AresV6TuningStep[] }) {
  if (steps.length === 0) {
    return <p className="text-xs text-slate-500">Sin pasos de ajuste sugeridos para esta configuración.</p>;
  }
  return (
    <ol className="space-y-2.5">
      {steps.map((step, index) => (
        <li key={`${step.symptom}-${index}`} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5 font-mono text-[11px] text-slate-300">
              {index + 1}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {humanizeEnum(step.symptom)}
            </span>
          </div>
          <p className="text-xs text-slate-300">{step.instruction}</p>
          <p className="mt-1 text-[11px] text-slate-500">Prueba: {step.testProtocol}</p>
        </li>
      ))}
    </ol>
  );
}

export function AresV6GenerationPreviewCard({ preview }: { preview: AresV6GenerationPreview }) {
  const { device, preset, generation } = preview;
  return (
    <AresV6SectionCard
      title="Generación ARES v6"
      subtitle={`${device.label} · ${preset.publicName}`}
      icon={Crosshair}
      badge={
        <div className="flex items-center gap-2">
          <AresV6Badge tone={riskLevelTone(preset.riskLevel)}>{preset.riskLevel}</AresV6Badge>
          <AresV6Badge tone={validationTone(preset.validationStatus)}>
            {validationLabel(preset.validationStatus)}
          </AresV6Badge>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg border border-white/5 bg-white/[0.02] p-3 sm:grid-cols-4">
          <AresV6KeyValue label="Tier" value={device.tier} />
          <AresV6KeyValue label="PPI" value={device.ppi ?? '—'} />
          <AresV6KeyValue label="Hz" value={device.screenHz} />
          <AresV6KeyValue label="Panel" value={device.panelType} />
        </div>

        <div>
          <p className={cn('mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400')}>
            Sensibilidad
          </p>
          <AresV6SensitivityGrid sensitivity={generation.sensitivity} gyroscope={generation.gyroscope} />
        </div>

        <div className="border-t border-white/5 pt-4">
          <AresV6HudFireButtonCard hud={generation.hud} fireButton={generation.fireButton} />
        </div>

        <div className="border-t border-white/5 pt-4">
          <AresV6ConfidenceCard confidence={generation.confidence} dpi={generation.dpi} />
        </div>

        <div className="border-t border-white/5 pt-4">
          <AresV6ExplanationPanel explanation={generation.explanation} />
        </div>

        <div className="border-t border-white/5 pt-4">
          <div className="mb-2 flex items-center gap-2 text-slate-200">
            <ListChecks className="h-4 w-4 text-[#00c8ff]" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wider">Primeros ajustes</span>
          </div>
          <AresV6TuningStepsPanel steps={generation.firstTuningSteps} />
        </div>
      </div>
    </AresV6SectionCard>
  );
}
