'use client';

import type { SensitivityStyle } from '@prisma/client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';

import { GeneratorFlow } from '@/components/generator/generator-flow';
import { captureAttribution, persistAttribution } from '@/lib/analytics/attribution';
import { useGeneratorStore } from '@/stores/generator.store';

const VALID_STYLES = new Set<string>(['AGGRESSIVE', 'BALANCED', 'SNIPER']);

function GeneratorWithDeepLink() {
  const searchParams = useSearchParams();
  const initFromParams = useGeneratorStore((s) => s.initFromParams);
  const reset = useGeneratorStore((s) => s.reset);
  const selectDevice = useGeneratorStore((s) => s.selectDevice);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const brand = searchParams.get('brand');
    const model = searchParams.get('model');
    const styleParam = searchParams.get('style')?.toUpperCase();
    const source = searchParams.get('source');
    const campaign = searchParams.get('campaign');

    // Sin query params de deep linking → resetear estado para empezar limpio
    if (!brand && !model && !styleParam) {
      reset();
    }

    // Capture ttclid and all attribution params
    const ttclid = searchParams.get('ttclid');

    // Guardar tracking en sessionStorage
    if (source) {
      sessionStorage.setItem('sensipro_source', source);
    }
    if (campaign) {
      sessionStorage.setItem('sensipro_campaign', campaign);
    }
    // Persist full attribution if arriving with ad params
    if (source || ttclid) {
      const attr = captureAttribution();
      persistAttribution(attr);
    }

    const style = styleParam && VALID_STYLES.has(styleParam)
      ? (styleParam as SensitivityStyle)
      : undefined;

    // Si hay model/slug, intentar fetch del device para saltar pasos
    if (model) {
      void (async () => {
        try {
          const res = await fetch(`/api/devices/${encodeURIComponent(model)}`);
          const data = await res.json() as {
            success: boolean;
            data?: {
              id: string;
              brand: string;
              model: string;
              slug: string;
              tier: string;
              screenHz: number;
              ramGb: number;
              screenSize?: number;
              panelType?: string;
            };
          };
          if (data.success && data.data) {
            const device = data.data;
            initFromParams({
              brand: device.brand,
              device: {
                id: device.id,
                brand: device.brand,
                model: device.model,
                slug: device.slug,
                tier: device.tier as 'LOW' | 'MID' | 'HIGH' | 'ULTRA' | 'GAMING',
                screenHz: device.screenHz,
                ramGb: device.ramGb,
                screenSize: device.screenSize,
                panelType: device.panelType as 'LCD' | 'IPS' | 'AMOLED' | 'OLED' | 'LTPO' | undefined,
              },
              style,
            });
          } else if (brand) {
            // Device no encontrado pero hay marca
            initFromParams({ brand, style });
          }
        } catch {
          // Fetch falló, intentar con marca si existe
          if (brand) {
            initFromParams({ brand, style });
          }
        }
      })();
    } else if (brand || style) {
      initFromParams({ brand: brand ?? undefined, style });
    }
  }, [searchParams, initFromParams, selectDevice, reset]);

  return <GeneratorFlow />;
}

export default function GeneratorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-pulse text-slate-500 text-sm">Cargando generador...</div>
        </div>
      }>
        <GeneratorWithDeepLink />
      </Suspense>
    </div>
  );
}
