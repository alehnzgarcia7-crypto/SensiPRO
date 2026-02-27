'use client';

import type { SensitivityStyle } from '@prisma/client';
import { useState, useRef, useCallback } from 'react';

import type { ExportData } from '@/lib/export/generate-image';
import { generateExportHtml, generateExportText } from '@/lib/export/generate-image';

// ═══════════════════════════════════════════════════════════════
// ExportCard — Componente para exportar configuraciones
// Formatos: Texto copiable, Imagen 1080x1080, Imagen 1080x1920
// Feature PREMIUM
// ═══════════════════════════════════════════════════════════════

type ExportFormat = 'text' | 'square' | 'story';

interface ExportCardProps {
  data: ExportData;
  includeGyro: boolean;
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string; description: string }[] = [
  { value: 'text', label: 'Texto', description: 'Copiar al portapapeles' },
  { value: 'square', label: '1080x1080', description: 'Instagram Post' },
  { value: 'story', label: '1080x1920', description: 'Instagram Story' },
];

const STYLE_BUTTON_COLORS: Record<SensitivityStyle, string> = {
  AGGRESSIVE: 'from-red-600 to-red-500',
  BALANCED: 'from-blue-600 to-blue-500',
  SNIPER: 'from-green-600 to-green-500',
};

export function ExportCard({ data, includeGyro }: ExportCardProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('text');
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleCopyText = useCallback(async () => {
    const text = generateExportText(data);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [data]);

  const handleExportImage = useCallback(async () => {
    setExporting(true);

    try {
      // Generar HTML para el formato seleccionado
      const html = generateExportHtml(data, {
        format: selectedFormat as 'square' | 'story',
        includeGyro,
        includeWatermark: true,
      });

      // Crear contenedor temporal para renderizar
      const container = document.createElement('div');
      container.innerHTML = html;
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      // Importar html-to-image dinámicamente (solo cuando se necesita)
      const { toPng } = await import('html-to-image');
      const firstChild = container.firstElementChild as HTMLElement | null;

      if (!firstChild) {
        document.body.removeChild(container);
        return;
      }

      const dataUrl = await toPng(firstChild, {
        width: 1080,
        height: selectedFormat === 'square' ? 1080 : 1920,
        pixelRatio: 1,
      });

      document.body.removeChild(container);

      // Descargar imagen
      const link = document.createElement('a');
      link.download = `sensibilidades-${data.deviceBrand}-${data.deviceModel}-${data.style.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  }, [data, selectedFormat, includeGyro]);

  const buttonGradient = STYLE_BUTTON_COLORS[data.style];

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
      <h3 className="mb-4 text-lg font-bold text-white">Exportar Configuración</h3>

      {/* Selector de formato */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {FORMAT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedFormat(option.value)}
            className={`rounded-lg border px-3 py-2 text-center transition-all ${
              selectedFormat === option.value
                ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                : 'border-slate-600/50 bg-slate-700/30 text-slate-400 hover:border-slate-500'
            }`}
          >
            <div className="text-sm font-semibold">{option.label}</div>
            <div className="text-xs opacity-70">{option.description}</div>
          </button>
        ))}
      </div>

      {/* Vista previa texto */}
      {selectedFormat === 'text' && (
        <div className="mb-4 rounded-lg bg-slate-900/80 p-4">
          <pre className="whitespace-pre-wrap text-xs text-slate-300">
            {generateExportText(data)}
          </pre>
        </div>
      )}

      {/* Vista previa imagen (miniatura) */}
      {selectedFormat !== 'text' && (
        <div className="mb-4 overflow-hidden rounded-lg border border-slate-700/30">
          <div
            ref={previewRef}
            className="mx-auto"
            style={{
              width: '100%',
              maxWidth: 300,
              aspectRatio: selectedFormat === 'square' ? '1/1' : '9/16',
              overflow: 'hidden',
            }}
            dangerouslySetInnerHTML={{
              __html: generateExportHtml(data, {
                format: selectedFormat,
                includeGyro,
                includeWatermark: true,
              }).replace(
                /width:\d+px;height:\d+px/,
                'width:100%;height:100%',
              ),
            }}
          />
        </div>
      )}

      {/* Botón de acción */}
      {selectedFormat === 'text' ? (
        <button
          onClick={handleCopyText}
          className={`w-full rounded-lg bg-gradient-to-r ${buttonGradient} px-6 py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]`}
        >
          {copied ? '\u2705 Copiado' : '\uD83D\uDCCB Copiar Texto'}
        </button>
      ) : (
        <button
          onClick={handleExportImage}
          disabled={exporting}
          className={`w-full rounded-lg bg-gradient-to-r ${buttonGradient} px-6 py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50`}
        >
          {exporting ? 'Generando...' : `\uD83D\uDCF7 Descargar ${selectedFormat === 'square' ? '1080x1080' : '1080x1920'}`}
        </button>
      )}
    </div>
  );
}
