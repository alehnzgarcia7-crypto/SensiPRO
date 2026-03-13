/**
 * Detector de navegadores in-app (WebView)
 *
 * Los navegadores internos de TikTok, Instagram, Facebook, etc.
 * NO pueden abrir checkout.stripe.com ni checkout de MercadoPago.
 * Este módulo detecta esos navegadores para redirigir al navegador
 * del sistema antes del checkout.
 */

export interface InAppBrowserInfo {
  /** true si el usuario está en un navegador in-app */
  isInAppBrowser: boolean;
  /** Nombre del navegador detectado para analytics */
  browserName: 'tiktok' | 'instagram' | 'facebook' | 'twitter' | 'snapchat' | 'pinterest' | 'line' | 'unknown_inapp' | 'normal';
}

const IN_APP_PATTERNS: Array<{ pattern: RegExp; name: InAppBrowserInfo['browserName'] }> = [
  // TikTok
  { pattern: /TikTok|BytedanceWebview|ByteLocale|musical_ly/i, name: 'tiktok' },
  // Instagram
  { pattern: /Instagram/i, name: 'instagram' },
  // Facebook
  { pattern: /FBAN|FBAV|FB_IAB|FBIOS|FB4A/i, name: 'facebook' },
  // Twitter/X
  { pattern: /Twitter/i, name: 'twitter' },
  // Snapchat
  { pattern: /Snapchat/i, name: 'snapchat' },
  // Pinterest
  { pattern: /Pinterest/i, name: 'pinterest' },
  // Line
  { pattern: /\bLine\//i, name: 'line' },
  // Android WebView genérico (debe ir al final)
  { pattern: /; wv\)|WebView/i, name: 'unknown_inapp' },
];

/**
 * Detecta si el usuario está en un navegador in-app.
 * Solo funciona en client-side (necesita navigator.userAgent).
 */
export function detectInAppBrowser(): InAppBrowserInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { isInAppBrowser: false, browserName: 'normal' };
  }

  const ua = navigator.userAgent || '';

  for (const { pattern, name } of IN_APP_PATTERNS) {
    if (pattern.test(ua)) {
      return { isInAppBrowser: true, browserName: name };
    }
  }

  return { isInAppBrowser: false, browserName: 'normal' };
}

/**
 * Intenta abrir una URL en el navegador del sistema.
 * Prueba múltiples estrategias según la plataforma.
 * Retorna true si se intentó alguna estrategia.
 */
export function openInSystemBrowser(url: string): boolean {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  // Estrategia 1: window.open con _system (funciona en algunos WebViews)
  try {
    const opened = window.open(url, '_system');
    if (opened) return true;
  } catch {
    // Continuar con siguiente estrategia
  }

  // Estrategia 2: Android intent URI para Chrome
  if (isAndroid) {
    try {
      const intentUrl = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = intentUrl;
      return true;
    } catch {
      // Continuar
    }
  }

  // Estrategia 3: iOS — intentar abrir directamente
  // En iOS WebViews a veces un window.open con _blank funciona
  if (isIOS) {
    try {
      const opened = window.open(url, '_blank');
      if (opened) return true;
    } catch {
      // Continuar
    }
  }

  // Estrategia 4: Fallback — redirigir directamente
  // Algunos WebViews abren URLs externas en el navegador del sistema
  try {
    window.location.href = url;
    return true;
  } catch {
    return false;
  }
}

/**
 * Copia texto al clipboard con fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback para contextos no seguros (algunos WebViews)
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const result = document.execCommand('copy');
    document.body.removeChild(textarea);
    return result;
  } catch {
    return false;
  }
}
