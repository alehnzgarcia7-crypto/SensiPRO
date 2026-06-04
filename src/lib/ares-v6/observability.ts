import { createHash, randomUUID } from 'crypto';

import { logger } from '@ares/logger';

import type { AresV6GenerationOutput } from '@ares/algorithms/engine-v6';

import { getAresV6LogSalt } from './observability-policy';
import { getTrustedClientIp, type AresV6ClientIpResult } from './proxy-trust';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Observability (structured, NO PII)
//
// Lab-grade telemetry for the isolated v6 endpoint. We never log raw IPs,
// user agents, request bodies, tokens, cookies, salt values or stack traces.
// IP/UA are reduced to short salted hashes (salt from observability-policy)
// purely for correlation. The raw IP is hashed ONLY when the proxy trust
// policy trusts it; untrusted clients log ipHash 'unknown'.
// ═══════════════════════════════════════════════════════════════

const ENDPOINT = '/api/generate/v6';
const HASH_LENGTH = 16;
const MAX_REDACT_DEPTH = 5;
const MAX_STRING_LENGTH = 256;

function shortHash(value: string): string {
  return createHash('sha256').update(`${getAresV6LogSalt()}:${value}`).digest('hex').slice(0, HASH_LENGTH);
}

/** Hash a client IP for logs/keys so the raw address never leaves the request. */
export function hashAresV6Ip(ip: string): string {
  return shortHash(ip);
}

/** Backwards-compatible client IP getter; delegates to the proxy trust policy. */
export function extractClientIp(request: Request): string | null {
  return getTrustedClientIp(request).ip;
}

export interface AresV6RequestContext {
  requestId: string;
  method: string;
  endpoint: string;
  ipHash: string;
  userAgentHash: string;
  proxyIpSource: AresV6ClientIpResult['source'];
  proxyTrusted: boolean;
  startedAt: number;
}

/** Build a per-request context. Pass a pre-resolved clientIp to avoid re-parsing. */
export function createAresV6RequestContext(
  request: Request,
  clientIp?: AresV6ClientIpResult,
): AresV6RequestContext {
  const resolved = clientIp ?? getTrustedClientIp(request);
  const userAgent = request.headers.get('user-agent');
  const hasTrustedIp = resolved.trusted && resolved.ip !== null;

  return {
    requestId: randomUUID(),
    method: request.method,
    endpoint: ENDPOINT,
    ipHash: hasTrustedIp && resolved.ip ? shortHash(resolved.ip) : 'unknown',
    userAgentHash: userAgent ? shortHash(userAgent) : 'unknown',
    proxyIpSource: resolved.source,
    proxyTrusted: resolved.trusted,
    startedAt: Date.now(),
  };
}

const REDACT_KEYS: ReadonlySet<string> = new Set([
  'ip',
  'ipaddress',
  'ip_address',
  'x-forwarded-for',
  'x-real-ip',
  'x-vercel-forwarded-for',
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
  'salt',
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
  | 'ares_v6.internal_access_denied'
  | 'ares_v6.config_error'
  | 'ares_v6.validation_failed'
  | 'ares_v6.rate_limited'
  | 'ares_v6.rate_limit_store_unavailable'
  | 'ares_v6.device_not_found'
  | 'ares_v6.generated'
  | 'ares_v6.real_infra_smoke_generated'
  | 'ares_v6.persistence_failed'
  | 'ares_v6.feedback_received'
  | 'ares_v6.feedback_rejected'
  | 'ares_v6.lab_metrics_served'
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
  proxyIpSource: string;
  proxyTrusted: boolean;
  data?: Record<string, unknown>;
}

const WARN_EVENTS: ReadonlySet<AresV6EventType> = new Set([
  'ares_v6.internal_access_denied',
  'ares_v6.validation_failed',
  'ares_v6.rate_limited',
  'ares_v6.rate_limit_store_unavailable',
  'ares_v6.device_not_found',
  'ares_v6.feedback_rejected',
]);
const ERROR_EVENTS: ReadonlySet<AresV6EventType> = new Set([
  'ares_v6.failed',
  'ares_v6.config_error',
  'ares_v6.persistence_failed',
]);

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
    proxyIpSource: event.ctx.proxyIpSource,
    proxyTrusted: event.ctx.proxyTrusted,
    ...(data ? { data } : {}),
  };

  const payload: Record<string, unknown> = {
    event: record.event,
    requestId: record.requestId,
    endpoint: record.endpoint,
    method: record.method,
    ipHash: record.ipHash,
    userAgentHash: record.userAgentHash,
    proxyIpSource: record.proxyIpSource,
    proxyTrusted: record.proxyTrusted,
    ...(record.data ? { data: record.data } : {}),
  };

  if (ERROR_EVENTS.has(event.type)) logger.error(event.type, payload);
  else if (WARN_EVENTS.has(event.type)) logger.warn(event.type, payload);
  else logger.info(event.type, payload);

  return record;
}

/** Operational (non-engine) metrics added in Phase 3B. */
export interface AresV6GenerationOperational {
  rateLimitScopes?: readonly string[];
  rateLimitDegraded?: boolean;
  rateLimitFailMode?: string;
  proxyIpSource?: string;
  proxyTrusted?: boolean;
  dbDurationMs?: number;
  engineDurationMs?: number;
  totalDurationMs?: number;
  realInfraSmoke?: boolean;
}

export interface AresV6GenerationMetrics extends AresV6GenerationOperational {
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
  operational?: AresV6GenerationOperational;
}): AresV6GenerationMetrics {
  const { deviceId, durationMs, player, generation, operational } = params;
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
    ...(operational ?? {}),
  };
}
