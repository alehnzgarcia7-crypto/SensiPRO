// ═══════════════════════════════════════════════════════════════
// ARES-802 — Social Tags & Share Text Generator
// WhatsApp-optimized preview tags + share text para plataformas.
// ═══════════════════════════════════════════════════════════════

const BASE_URL = 'https://sensibilidadespro.com';

type ShareType = 'device' | 'guide' | 'config';

interface ShareTextResult {
  whatsapp: string;
  twitter: string;
  telegram: string;
  default: string;
}

/**
 * WhatsApp-optimized preview URL.
 * WhatsApp fetches og:title, og:description, og:image.
 * Imagen debe ser 1200×630 para mejores resultados.
 */
export function getWhatsAppPreviewUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

/**
 * Genera texto de compartir optimizado para cada plataforma.
 */
export function getShareText(
  type: ShareType,
  data: Record<string, string>,
): ShareTextResult {
  if (type === 'device') {
    const text = `🎯 Sensibilidad perfecta para ${data.brand} ${data.model} en Free Fire — generada con SensiPRO`;
    return {
      whatsapp: text,
      twitter: `${text}\n\n#FreeFire #SensiPRO`,
      telegram: text,
      default: text,
    };
  }

  if (type === 'guide') {
    const text = `📚 ${data.title} — Guía de Free Fire en SensiPRO`;
    return {
      whatsapp: text,
      twitter: `${text}\n\n#FreeFire #SensiPRO`,
      telegram: text,
      default: text,
    };
  }

  // type === 'config'
  const text = `⚔️ Config de ${data.style} para ${data.device} — por ${data.author} en SensiPRO`;
  return {
    whatsapp: text,
    twitter: `${text}\n\n#FreeFire #SensiPRO`,
    telegram: text,
    default: text,
  };
}

/**
 * Genera la URL de la OG image dinámica para un dispositivo.
 */
export function getDeviceOgImageUrl(slug: string): string {
  return `${BASE_URL}/api/og/device/${slug}`;
}

/**
 * Genera la URL de la OG image dinámica para una guía.
 */
export function getGuideOgImageUrl(slug: string): string {
  return `${BASE_URL}/api/og/guide/${slug}`;
}
