/**
 * Event deduplication — Ensures same event isn't counted twice
 *
 * Strategy:
 * - Critical events (InitiateCheckout, Purchase) use deterministic IDs
 *   based on checkout session ID or payment ID
 * - Other events use generated IDs (UUID-like)
 * - Both client + server use the SAME event_id for deduplication
 */

/** Generate a random event ID for non-critical events */
export function generateEventId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `evt_${ts}_${rand}`;
}

/**
 * Generate deterministic event ID for checkout events
 * Same session = same ID = deduplicated
 */
export function checkoutEventId(checkoutSessionId: string): string {
  return `checkout_${checkoutSessionId}`;
}

/**
 * Generate deterministic event ID for purchase events
 * Same payment = same ID = deduplicated
 */
export function purchaseEventId(paymentId: string): string {
  return `purchase_${paymentId}`;
}

/**
 * Track which events have been fired this session to prevent duplicates
 * within the same page lifecycle
 */
const firedEvents = new Set<string>();

export function hasEventFired(key: string): boolean {
  return firedEvents.has(key);
}

export function markEventFired(key: string): void {
  firedEvents.add(key);
}

export function resetFiredEvents(): void {
  firedEvents.clear();
}
