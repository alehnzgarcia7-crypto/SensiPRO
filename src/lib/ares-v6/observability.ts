import { createHash, randomUUID } from 'crypto';

import { logger } from '@ares/logger';

import type { AresV6GenerationOutput } from '@ares/algorithms/engine-v6';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Observability (structured, NO PII)
//
// Lab-grade telemetry for the isolated v6 endpoint. We never log raw IPs,
// user agents, request bodies, tokens, cookies or stack traces. IP/UA are
// reduced to short salted hashes purely for correlation across log lines.
// ═══════════════════════════════════════════════════════════════

const ENDPOINT = '/api/generate/v6';
const HASH_LENGTH = 16;
const MAX_REDACT_DEPTH = 5;
const MAX_STRING_LENGTH = 256;

/**
 * Salt for pseudonymising IP/UA in logs. This is correlation hygiene, not a
 * security boundary; set ARES_V6_LOG_SALT in lab to make hashes per-deploy.
 */
function logSalt(): string {
  return process.env.ARES_V6_LOG_SALT ?? 'ares-v6-lab-salt';
}

function shortHash(value: string): string {
  return createHash('sha256').update(`${logSalt()}:${value}`).digest('hex').slice(0, HASH_LENGTH);
}

/** Hash a client IP for logs/keys so the raw address never leaves the request. */
export function hashAresV6Ip(ip: string): string {
  return shortHash(ip);
}

const IP_PATTERN = /^[0-9a-fA-F:.]{3,45}$/;

/**
 * Best-effort client IP from forwarding headers. Values are validated against a
 * conservative pattern so a hostile header can never become an unbounded key.
 * Returns null when no trustworthy IP is present (caller applies a stricter policy).
 */
export function extractClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first && IP_PATTERN.test(first)) return first;
  }
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp && IP_PATTERN.test(realIp)) return realIp;
  return null;
}

export interface AresV6RequestContext {
  requestId: string;
  method: string;
  endpoint: string;
  ipHash: string;
  userAgentHash: string;
  startedAt: number;
}

/** Build a per-request context. requestId is a random UUID for log correlation. */
export function createAresV6RequestContext(request: Request): AresV6RequestContext {
  const ip = extractClientIp(request);
  const userAgent = request.headers.get('user-agent');
  return {
    requestId: randomUUID(),
    method: request.method,
    endpoint: ENDPOINT,
    ipHash: ip ? shortHash(ip) : 'unknown',
    userAgentHash: userAgent ? shortHash(userAgent) : 'unknown',
    startedAt: Date.now(),
  };
}

const REDACT_KEYS: ReadonlySet<string> = new Set([
  'ip',
  'ipaddress',
  'ip_address',
  'x-forwarded-for',
  'x-real-ip',
  'forwarded',
  'useragent',
  'user-agent',
  'ua',
  'email',
  'password',
  'pass',
  'token',
  'authorization',
  'auth',
  'cookie',
  'set-cookie',
  'secret',
  'apikey',
  'api-key',
  'body',
  'rawbody',
  'raw_body',
  'stack',
]);

function redactValue(value: unknown, depth: number): unknown {
  if (depth > MAX_REDACT_DEPTH) return '[truncated]';
  if (Array.isArray(value)) return value.map((item) => redactValue(item, depth + 1));
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = REDACT_KEYS.has(key.toLowerCase()) ? '[redacted]' : redactValue(val, depth + 1);
    }
    return out;
  }
  if (typeof value === 'string' && value.length > MAX_STRING_LENGTH) {
    return `${value.slice(0, MAX_STRING_LENGTH)}…`;
  }
  return value;
}

/** Return a copy of a log payload with sensitive keys masked and long strings clipped. */
export function redactAresV6LogPayload(payload: Record<string, unknown>): Record<string, unknown> {
  return redactValue(payload, 0) as Record<string, unknown>;
}

export type AresV6EventType =
  | 'ares_v6.request_blocked_flag_off'
  | 'ares_v6.validation_failed'
  | 'ares_v6.rate_limited'
  | 'ares_v6.device_not_found'
  | 'ares_v6.generated'
  | 'ares_v6.failed';

export interface AresV6Event {
  type: AresV6EventType;
  ctx: AresV6RequestContext;
  data?: Record<string, unknown>;
}

export interface AresV6LogRecord {
  event: AresV6EventType;
  requestId: string;
  endpoint: string;
  method: string;
  ipHash: string;
  userAgentHash: string;
  data?: Record<string, unknown>;
}

const WARN_EVENTS: ReadonlySet<AresV6EventType> = new Set([
  'ares_v6.validation_failed',
  'ares_v6.rate_limited',
  'ares_v6.device_not_found',
]);
const ERROR_EVENTS: ReadonlySet<AresV6EventType> = new Set(['ares_v6.failed']);

/** Emit a structured, redacted event. Returns the exact record that was logged. */
export function logAresV6Event(event: AresV6Event): AresV6LogRecord {
  const data = event.data ? redactAresV6LogPayload(event.data) : undefined;
  const record: AresV6LogRecord = {
    event: event.type,
    requestId: event.ctx.requestId,
    endpoint: event.ctx.endpoint,
    method: event.ctx.method,
    ipHash: event.ctx.ipHash,
    userAgentHash: event.ctx.userAgentHash,
    ...(data ? { data } : {}),
  };

  const payload: Record<string, unknown> = {
    event: record.event,
    requestId: record.requestId,
    endpoint: record.endpoint,
    method: record.method,
    ipHash: record.ipHash,
    userAgentHash: record.userAgentHash,
    ...(record.data ? { data: record.data } : {}),
  };

  if (ERROR_EVENTS.has(event.type)) logger.error(event.type, payload);
  else if (WARN_EVENTS.has(event.type)) logger.warn(event.type, payload);
  else logger.info(event.type, payload);

  return record;
}

export interface AresV6GenerationMetrics {
  status: 'ok';
  durationMs: number;
  deviceId: string;
  presetId: string;
  mode: string;
  fingers: number;
  ppiSource: string;
  detectedPpi: number | null;
  fallbackPpi: boolean;
  confidenceGrade: string;
  confidenceScore: number;
  usedGyro: boolean;
  symptomsCount: number;
  tuningStepsCount: number;
}

/** Derive the (non-PII) metrics of a successful generation for logging. */
export function buildAresV6GenerationMetrics(params: {
  deviceId: string;
  durationMs: number;
  player: { mode: string; fingers: number; symptoms?: readonly string[]; usesGyroscope?: boolean };
  generation: AresV6GenerationOutput;
}): AresV6GenerationMetrics {
  const { deviceId, durationMs, player, generation } = params;
  return {
    status: 'ok',
    durationMs,
    deviceId,
    presetId: generation.presetId,
    mode: player.mode,
    fingers: player.fingers,
    ppiSource: generation.dpi.source,
    detectedPpi: generation.dpi.detectedPpi,
    fallbackPpi: generation.dpi.detectedPpi === null,
    confidenceGrade: generation.confidence.grade,
    confidenceScore: generation.confidence.score,
    usedGyro: generation.gyroscope !== null,
    symptomsCount: player.symptoms?.length ?? 0,
    tuningStepsCount: generation.firstTuningSteps.length,
  };
}
