'use client';

import { AlertCircle, FlaskConical } from 'lucide-react';
import { useCallback, useState } from 'react';

import type { AresV6PreviewResult } from '@/lib/ares-v6/internal-preview-service';
import type {
  AresV6FixtureOption,
  AresV6GenerationPreview,
  AresV6PresetOption,
} from '@/lib/ares-v6/internal-ui-service';

import { AresV6FixturePresetSelector } from './fixture-preset-selector';
import { AresV6GenerationPreviewCard } from './generation-preview-card';
import { AresV6SectionCard } from './primitives';

// ═══════════════════════════════════════════════════════════════
// ARES v6 lab — Generation console (Fase 3E) — CLIENT
//
// Lets an operator preview a different fixture × preset. The preview is computed
// by a READ-ONLY server action (the token/DB never reach the client); the action
// returns a validated Result, never throws to the browser, and never persists.
// ═══════════════════════════════════════════════════════════════

export interface AresV6GenerationConsoleProps {
  fixtures: AresV6FixtureOption[];
  presets: AresV6PresetOption[];
  initialPreview: AresV6GenerationPreview;
  initialPresetId: string;
  previewAction: (input: { fixtureId: string; presetId: string }) => Promise<AresV6PreviewResult>;
}

export function AresV6GenerationConsole({
  fixtures,
  presets,
  initialPreview,
  initialPresetId,
  previewAction,
}: AresV6GenerationConsoleProps) {
  const [preview, setPreview] = useState<AresV6GenerationPreview>(initialPreview);
  const [fixtureId, setFixtureId] = useState<string>(initialPreview.fixtureId);
  const [presetId, setPresetId] = useState<string>(initialPresetId);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPreview = useCallback(
    async (nextFixtureId: string, nextPresetId: string) => {
      setPending(true);
      setError(null);
      try {
        const result = await previewAction({ fixtureId: nextFixtureId, presetId: nextPresetId });
        if (result.ok) {
          setPreview(result.preview);
        } else {
          setError(result.message);
        }
      } catch {
        setError('No se pudo generar la vista previa.');
      } finally {
        setPending(false);
      }
    },
    [previewAction],
  );

  const handleFixtureChange = useCallback(
    (nextFixtureId: string) => {
      setFixtureId(nextFixtureId);
      void runPreview(nextFixtureId, presetId);
    },
    [presetId, runPreview],
  );

  const handlePresetChange = useCallback(
    (nextPresetId: string) => {
      setPresetId(nextPresetId);
      void runPreview(fixtureId, nextPresetId);
    },
    [fixtureId, runPreview],
  );

  return (
    <div className="space-y-4">
      <AresV6SectionCard
        title="Consola de generación"
        subtitle="Vista previa read-only · sin persistencia"
        icon={FlaskConical}
      >
        <AresV6FixturePresetSelector
          fixtures={fixtures}
          presets={presets}
          fixtureId={fixtureId}
          presetId={presetId}
          pending={pending}
          onFixtureChange={handleFixtureChange}
          onPresetChange={handlePresetChange}
        />
        {error ? (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
            {error}
          </div>
        ) : null}
      </AresV6SectionCard>

      <AresV6GenerationPreviewCard preview={preview} />
    </div>
  );
}
