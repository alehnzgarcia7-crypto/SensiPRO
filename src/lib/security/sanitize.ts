/**
 * Strip HTML tags from a string
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize general user input: strip HTML, trim, limit length
 */
export function sanitizeInput(input: string, maxLength = 500): string {
  return stripHtml(input).trim().slice(0, maxLength);
}

/**
 * Sanitize search query: only allow alphanumeric, spaces, and basic punctuation
 */
export function sanitizeSearchQuery(input: string): string {
  return input
    .replace(/[^\p{L}\p{N}\s\-_.]/gu, '')
    .trim()
    .slice(0, 100);
}

/**
 * Sanitize username input
 */
export function sanitizeUsername(input: string): string {
  return input.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30);
}

/**
 * Escape string for use in HTML attributes
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return input.replace(/[&<>"']/g, (char) => map[char] ?? char);
}
