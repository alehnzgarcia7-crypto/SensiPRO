import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { prisma } from '@ares/database';
import type { DeviceSpecs } from '@ares/algorithms';
import {
  generateSensitivity,
  analyzeDeviceSpecs,
  getRecommendedStyle,
  STYLE_PROFILES,
} from '@ares/algorithms';
import type { SensitivityOutput, AlgorithmOutput } from '@ares/algorithms';
import type { SensitivityStyle } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

// ═══════════════════════════════════════════════════════════════
// Página SEO individual por dispositivo
// URL: /devices/[slug] (ej: /devices/samsung-galaxy-s24-ultra)
// Pre-renderiza dispositivos populares con generateStaticParams
// ═══════════════════════════════════════════════════════════════

interface Props {
  params: { slug: string };
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const popular = await prisma.device.findMany({
    where: { isPopular: true },
    select: { slug: true },
  });
  return popular.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const device = await prisma.device.findUnique({
    where: { slug: params.slug },
    select: { brand: true, model: true, tier: true, screenHz: true, ramGb: true, panelType: true },
  });

  if (!device) return { title: 'Dispositivo no encontrado' };

  return {
    title: `Sensibilidades ${device.brand} ${device.model}`,
    description: `Configuracion de sensibilidades para ${device.brand} ${device.model} (${device.screenHz}Hz, ${device.ramGb}GB RAM, ${device.panelType}, Tier ${device.tier}) en Free Fire. 3 estilos: Agresivo, Balanceado, Francotirador.`,
    openGraph: {
      title: `${device.brand} ${device.model} — Sensibilidades Free Fire`,
      description: `Config optimizada para ${device.screenHz}Hz, ${device.ramGb}GB RAM. Generada por SensiPRO.`,
    },
  };
}

// Labels para los campos de sensibilidad
const FIELD_LABELS: Record<keyof SensitivityOutput, string> = {
  general: 'General',
  redPoint: 'Punto Rojo',
  scope2x: 'Mira 2x',
  scope4x: 'Mira 4x',
  sniperScope: 'Sniper',
  freeView: 'Vista Libre',
};

const SENSITIVITY_FIELDS: Array<keyof SensitivityOutput> = [
  'general', 'redPoint', 'scope2x', 'scope4x', 'sniperScope', 'freeView',
];

const ALL_STYLES: SensitivityStyle[] = ['AGGRESSIVE', 'BALANCED', 'SNIPER'];

interface StyleData {
  style: SensitivityStyle;
  profileNameEs: string;
  profileIcon: string;
  result: AlgorithmOutput;
}

function getTierBadgeVariant(tier: string): 'vip' | 'premium' | 'free' {
  if (tier === 'GAMING') return 'vip';
  if (tier === 'ULTRA' || tier === 'HIGH') return 'premium';
  return 'free';
}

export default async function DevicePage({ params }: Props) {
  const device = await prisma.device.findUnique({ where: { slug: params.slug } });
  if (!device) notFound();

  const specs: DeviceSpecs = {
    screenHz: device.screenHz,
    screenSize: device.screenSize,
    ramGb: device.ramGb,
    panelType: device.panelType,
    tier: device.tier,
  };

  const analysis = analyzeDeviceSpecs(specs);
  const recommendedStyle = getRecommendedStyle(device.tier);

  // Generar sensibilidades para los 3 estilos
  const styles: StyleData[] = ALL_STYLES.map((style) => ({
    style,
    profileNameEs: STYLE_PROFILES[style].nameEs,
    profileIcon: STYLE_PROFILES[style].icon,
    result: generateSensitivity({ specs, style }),
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/devices" className="hover:text-white transition-colors">
          Dispositivos
        </Link>
        <span>/</span>
        <span className="text-slate-300">{device.brand} {device.model}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-slate-500 font-ui">{device.brand}</p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white">{device.model}</h1>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <Badge variant={getTierBadgeVariant(device.tier)}>
            {device.tier}
          </Badge>
          <span className="text-sm text-slate-500">
            {device.screenHz}Hz &bull; {device.ramGb}GB RAM &bull; {device.panelType}
            {device.screenSize ? ` \u2022 ${device.screenSize}"` : ''}
          </span>
        </div>
      </div>

      {/* Performance Score */}
      <Card variant="glow" className="p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-bold text-white">Performance Score</h2>
          <span className="text-2xl font-display font-black text-gradient-fire-ice">
            {analysis.performanceScore}/100
          </span>
        </div>
        <Progress value={analysis.performanceScore} max={100} size="md" color="gradient" />
        <p className="mt-3 text-sm text-slate-400">{analysis.gamingVerdict}</p>
      </Card>

      {/* Specs detallados */}
      <Card variant="default" className="p-6 mb-6">
        <h2 className="font-display font-bold text-white mb-4">Especificaciones</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <SpecItem label="Pantalla" value={`${device.screenHz}Hz`} />
          <SpecItem label="Tamano" value={`${device.screenSize}"`} />
          <SpecItem label="RAM" value={`${device.ramGb}GB`} />
          <SpecItem label="Panel" value={device.panelType} />
          <SpecItem label="Tier" value={device.tier} />
          {device.chipset && <SpecItem label="Chipset" value={device.chipset} />}
          {device.releaseYear && <SpecItem label="Ano" value={String(device.releaseYear)} />}
        </div>

        {/* Fortalezas y limitaciones */}
        {(analysis.strengths.length > 0 || analysis.limitations.length > 0) && (
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {analysis.strengths.length > 0 && (
              <div>
                <p className="text-xs font-ui font-semibold text-success uppercase tracking-wider mb-2">
                  Fortalezas
                </p>
                <ul className="space-y-1">
                  {analysis.strengths.map((s) => (
                    <li key={s} className="text-sm text-slate-400 flex items-start gap-2">
                      <span className="text-success mt-0.5 shrink-0">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.limitations.length > 0 && (
              <div>
                <p className="text-xs font-ui font-semibold text-warning uppercase tracking-wider mb-2">
                  Limitaciones
                </p>
                <ul className="space-y-1">
                  {analysis.limitations.map((l) => (
                    <li key={l} className="text-sm text-slate-400 flex items-start gap-2">
                      <span className="text-warning mt-0.5 shrink-0">-</span>
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Estilo recomendado */}
      <div className="glass p-4 mb-6 flex items-center gap-3">
        <span className="text-xl">{STYLE_PROFILES[recommendedStyle].icon}</span>
        <div className="flex-1">
          <p className="text-sm font-ui font-semibold text-white">
            Estilo recomendado: {STYLE_PROFILES[recommendedStyle].nameEs}
          </p>
          <p className="text-xs text-slate-500">{STYLE_PROFILES[recommendedStyle].tipShort}</p>
        </div>
      </div>

      {/* Sensibilidades de los 3 estilos */}
      <div className="space-y-6 mb-8">
        {styles.map(({ style, profileNameEs, profileIcon, result }) => (
          <Card key={style} variant="default" className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span>{profileIcon}</span>
              <h3 className="font-display font-bold text-white">{profileNameEs}</h3>
              {style === recommendedStyle && (
                <Badge variant="premium" size="sm">Recomendado</Badge>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SENSITIVITY_FIELDS.map((field) => (
                <div key={field} className="text-center p-3 rounded-lg bg-white/[0.02]">
                  <p className="text-xs text-slate-500">{FIELD_LABELS[field]}</p>
                  <p className="text-xl font-display font-black text-white">
                    {result.sensitivity[field]}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center space-y-3">
        <Link href="/generator">
          <Button variant="primary" size="lg">
            Generar en el Generador
          </Button>
        </Link>
        <p className="text-xs text-slate-500">
          Incluye giroscopio, comparador y mas opciones
        </p>
      </div>
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-white/[0.02]">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-display font-bold text-white">{value}</p>
    </div>
  );
}
