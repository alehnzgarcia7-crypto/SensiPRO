import type { SensitivityStyle } from '@prisma/client';

// ═══════════════════════════════════════════════════════════════
// ARES-106 — Config Export: Image Templates + Text Format
// Genera HTML para renderizar imágenes exportables (1080x1080, 1080x1920)
// y texto copiable para compartir configuraciones de sensibilidad.
// ═══════════════════════════════════════════════════════════════

export interface ExportData {
  deviceBrand: string;
  deviceModel: string;
  style: SensitivityStyle;
  sensitivity: {
    general: number;
    redPoint: number;
    scope2x: number;
    scope4x: number;
    sniperScope: number;
    freeView: number;
  };
  gyroscope?: {
    gyroGeneral: number;
    gyroRedPoint: number;
    gyroScope2x: number;
    gyroScope4x: number;
    gyroSniper: number;
    gyroFreeView: number;
  } | null;
  performanceScore: number;
}

export interface ExportOptions {
  format: 'square' | 'story';
  includeGyro: boolean;
  includeWatermark: boolean;
}

const STYLE_COLORS: Record<SensitivityStyle, { primary: string; gradient: string }> = {
  AGGRESSIVE: { primary: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
  BALANCED: { primary: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  SNIPER: { primary: '#22c55e', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
};

const STYLE_LABELS: Record<SensitivityStyle, string> = {
  AGGRESSIVE: 'AGRESIVO',
  BALANCED: 'BALANCEADO',
  SNIPER: 'FRANCOTIRADOR',
};

const STYLE_ICONS: Record<SensitivityStyle, string> = {
  AGGRESSIVE: '\u2694\uFE0F',
  BALANCED: '\uD83C\uDFAF',
  SNIPER: '\uD83D\uDD2D',
};

interface SensitivityField {
  label: string;
  value: number;
}

function renderBar(value: number, gradient: string): string {
  return `
    <div style="display:flex;align-items:center;gap:12px;margin:6px 0;">
      <div style="flex:1;height:8px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden;">
        <div style="width:${value}%;height:100%;background:${gradient};border-radius:4px;"></div>
      </div>
      <span style="font-size:24px;font-weight:700;color:white;min-width:50px;text-align:right;">${value}</span>
    </div>
  `;
}

function renderFieldRow(field: SensitivityField, gradient: string): string {
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin:10px 0;">
      <span style="font-size:18px;color:#cbd5e1;">${field.label}</span>
      ${renderBar(field.value, gradient)}
    </div>
  `;
}

function renderSection(title: string, fields: SensitivityField[], gradient: string): string {
  return `
    <div style="margin:20px 0;">
      <div style="font-size:16px;color:#94a3b8;font-weight:600;letter-spacing:2px;margin-bottom:16px;">${title}</div>
      ${fields.map((f) => renderFieldRow(f, gradient)).join('')}
    </div>
  `;
}

/**
 * Genera un string HTML para la imagen de exportación.
 * Se renderiza via html-to-image en el cliente.
 *
 * Retorna HTML self-contained con inline styles (sin CSS externo).
 */
export function generateExportHtml(data: ExportData, options: ExportOptions): string {
  const { format, includeGyro, includeWatermark } = options;
  const width = 1080;
  const height = format === 'square' ? 1080 : 1920;
  const colors = STYLE_COLORS[data.style];

  const fields: SensitivityField[] = [
    { label: 'General', value: data.sensitivity.general },
    { label: 'Punto Rojo', value: data.sensitivity.redPoint },
    { label: 'Mira 2x', value: data.sensitivity.scope2x },
    { label: 'Mira 4x', value: data.sensitivity.scope4x },
    { label: 'Mira Sniper', value: data.sensitivity.sniperScope },
    { label: 'Vista Libre', value: data.sensitivity.freeView },
  ];

  const gyroFields: SensitivityField[] = includeGyro && data.gyroscope ? [
    { label: 'Gyro General', value: data.gyroscope.gyroGeneral },
    { label: 'Gyro Punto Rojo', value: data.gyroscope.gyroRedPoint },
    { label: 'Gyro 2x', value: data.gyroscope.gyroScope2x },
    { label: 'Gyro 4x', value: data.gyroscope.gyroScope4x },
    { label: 'Gyro Sniper', value: data.gyroscope.gyroSniper },
    { label: 'Gyro Vista Libre', value: data.gyroscope.gyroFreeView },
  ] : [];

  const gyroSection = gyroFields.length > 0
    ? renderSection('GIROSCOPIO', gyroFields, colors.gradient)
    : '';

  const watermark = includeWatermark ? `
    <div style="text-align:center;margin-top:auto;padding-top:30px;border-top:1px solid rgba(255,255,255,0.05);">
      <div style="font-size:22px;font-weight:800;background:linear-gradient(90deg,#ff6a00,#00c8ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
        sensibilidadespro.com
      </div>
      <div style="font-size:14px;color:#475569;margin-top:4px;">
        Generador de Sensibilidades #1 para Free Fire
      </div>
    </div>
  ` : '';

  return `
    <div style="width:${width}px;height:${height}px;background:#050810;color:white;font-family:sans-serif;padding:60px;display:flex;flex-direction:column;justify-content:space-between;">
      <div>
        <div style="font-size:20px;color:${colors.primary};font-weight:700;letter-spacing:3px;text-transform:uppercase;">
          ${STYLE_ICONS[data.style]} ${STYLE_LABELS[data.style]}
        </div>
        <div style="font-size:48px;font-weight:900;margin-top:8px;background:linear-gradient(90deg,#ff6a00,#00c8ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
          ${data.deviceBrand} ${data.deviceModel}
        </div>
        <div style="font-size:18px;color:#64748b;margin-top:4px;">
          Performance Score: ${data.performanceScore}/100
        </div>
      </div>

      ${renderSection('SENSIBILIDADES', fields, colors.gradient)}
      ${gyroSection}
      ${watermark}
    </div>
  `;
}

/**
 * Genera texto copiable con formato para compartir en chat/redes.
 */
export function generateExportText(data: ExportData): string {
  const icon = STYLE_ICONS[data.style];
  const label = STYLE_LABELS[data.style];

  const lines: string[] = [
    `\uD83C\uDFAE ${data.deviceBrand} ${data.deviceModel}`,
    `${icon} Estilo: ${label}`,
    `\uD83D\uDCCA Score: ${data.performanceScore}/100`,
    '',
    '\uD83D\uDCCB SENSIBILIDADES:',
    `  General: ${data.sensitivity.general}`,
    `  Punto Rojo: ${data.sensitivity.redPoint}`,
    `  Mira 2x: ${data.sensitivity.scope2x}`,
    `  Mira 4x: ${data.sensitivity.scope4x}`,
    `  Mira Sniper: ${data.sensitivity.sniperScope}`,
    `  Vista Libre: ${data.sensitivity.freeView}`,
  ];

  if (data.gyroscope) {
    lines.push(
      '',
      '\uD83D\uDD04 GIROSCOPIO:',
      `  General: ${data.gyroscope.gyroGeneral}`,
      `  Punto Rojo: ${data.gyroscope.gyroRedPoint}`,
      `  2x: ${data.gyroscope.gyroScope2x}`,
      `  4x: ${data.gyroscope.gyroScope4x}`,
      `  Sniper: ${data.gyroscope.gyroSniper}`,
      `  Vista Libre: ${data.gyroscope.gyroFreeView}`,
    );
  }

  lines.push('', '\uD83D\uDD25 sensibilidadespro.com');

  return lines.join('\n');
}
