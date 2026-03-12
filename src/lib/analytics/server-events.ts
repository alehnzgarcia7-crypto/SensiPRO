/**
 * TikTok Events API server-side sender
 *
 * Used for high-value events: InitiateCheckout, Purchase
 * These are sent server-side for accuracy and deduplication with client events.
 */

import { createHash } from 'crypto';

import { logger } from '@ares/logger';

const EVENTS_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';

interface ServerEventParams {
  event: string;
  eventId: string;
  timestamp?: string;
  // User data
  email?: string;
  externalId?: string;
  ipAddress?: string;
  userAgent?: string;
  // Event data
  value?: number;
  currency?: string;
  contentId?: string;
  contentType?: string;
  description?: string;
  // Context
  pageUrl?: string;
  referrer?: string;
  // Attribution
  ttclid?: string;
}

function hashSHA256(value: string): string {
  return createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

export async function sendTikTokServerEvent(params: ServerEventParams): Promise<boolean> {
  const pixelId = process.env.TIKTOK_PIXEL_ID;
  const accessToken = process.env.TIKTOK_EVENTS_API_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    logger.warn('TikTok Events API not configured', { event: params.event });
    return false;
  }

  try {
    const user: Record<string, unknown> = {};
    if (params.email) user.email = hashSHA256(params.email);
    if (params.externalId) user.external_id = hashSHA256(params.externalId);
    if (params.ipAddress) user.ip = params.ipAddress;
    if (params.userAgent) user.user_agent = params.userAgent;
    if (params.ttclid) user.ttclid = params.ttclid;

    const properties: Record<string, unknown> = {};
    if (params.value !== undefined) properties.value = params.value;
    if (params.currency) properties.currency = params.currency;
    if (params.contentId) properties.content_id = params.contentId;
    if (params.contentType) properties.content_type = params.contentType;
    if (params.description) properties.description = params.description;

    const page: Record<string, string> = {};
    if (params.pageUrl) page.url = params.pageUrl;
    if (params.referrer) page.referrer = params.referrer;

    const eventData: Record<string, unknown> = {
      event: params.event,
      event_id: params.eventId,
      event_time: params.timestamp
        ? Math.floor(new Date(params.timestamp).getTime() / 1000)
        : Math.floor(Date.now() / 1000),
      user,
      properties,
      page,
    };

    const testEventCode = process.env.TIKTOK_TEST_EVENT_CODE;

    const body = {
      pixel_code: pixelId,
      partner_name: 'SensiPRO',
      data: [eventData],
      ...(testEventCode ? { test_event_code: testEventCode } : {}),
    };

    const response = await fetch(EVENTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': accessToken,
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (result.code !== 0) {
      logger.error('TikTok Events API error', {
        event: params.event,
        eventId: params.eventId,
        code: result.code,
        message: result.message,
      });
      return false;
    }

    logger.info('TikTok server event sent', {
      event: params.event,
      eventId: params.eventId,
    });

    return true;
  } catch (error) {
    logger.error('TikTok Events API request failed', {
      event: params.event,
      error: error instanceof Error ? error.message : 'Unknown',
    });
    return false;
  }
}
