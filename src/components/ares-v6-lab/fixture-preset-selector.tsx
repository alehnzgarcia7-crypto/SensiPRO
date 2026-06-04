'use client';

import { Loader2, SlidersHorizontal } from 'lucide-react';

import type { AresV6FixtureOption, AresV6PresetOption } from '@/lib/ares-v6/internal-ui-service';
import { cn } from '@/lib/cn';

// ═══════════════════════════════════════════════════════════════
// ARES v6 lab — Fixture / preset selector (Fase 3E) — CLIENT
//
// Local presentation interactivity ONLY: two accessible native selects whose
// changes bubble up. It holds no secrets, makes no fetch, and never persists.
// ═══════════════════════════════════════════════════════════════

export interface AresV6FixturePresetSelectorProps {
  fixtures: AresV6FixtureOption[];
  presets: AresV6PresetOption[];
  fixtureId: string;
  presetId: string;
  pending?: boolean;
  onFixtureChange: (fixtureId: string) => void;
  onPresetChange: (presetId: string) => void;
}

const selectClass =
  'w-full rounded-lg border border-white/10 bg-[#0a0f1e] px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-[#00c8ff]/60 focus:ring-1 focus:ring-[#00c8ff]/40';

export function AresV6FixturePresetSelector({
  fixtures,
  presets,
  fixtureId,
  presetId,
  pending = false,
  onFixtureChange,
  onPresetChange,
}: AresV6FixturePresetSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <SlidersHorizontal className="h-3 w-3" aria-hidden />
          Dispositivo (fixture)
        </span>
        <select
          className={selectClass}
          value={fixtureId}
          onChange={(event) => onFixtureChange(event.target.value)}
          aria-label="Seleccionar dispositivo de laboratorio"
        >
          {fixtures.map((fixture) => (
            <option key={fixture.id} value={fixture.id}>
              {fixture.label} · {fixture.priority}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <span>Preset ARES v6</span>
          {pending ? (
            <span className="inline-flex items-center gap-1 text-[#00c8ff]">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              generando…
            </span>
          ) : null}
        </span>
        <select
          className={cn(selectClass, pending && 'opacity-70')}
          value={presetId}
          onChange={(event) => onPresetChange(event.target.value)}
          aria-label="Seleccionar preset de ARES v6"
          disabled={pending}
        >
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.publicName} · {preset.category}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
