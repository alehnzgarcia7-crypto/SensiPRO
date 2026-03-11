/**
 * Admin Override System — Emails con acceso total permanente
 *
 * Los emails en esta lista SIEMPRE tienen isPremium = true,
 * sin importar si pagaron o no. Son creadores/admins.
 */

export const ADMIN_EMAILS = ['alehnzgarcia7@gmail.com'] as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return (ADMIN_EMAILS as readonly string[]).includes(email.toLowerCase().trim());
}
