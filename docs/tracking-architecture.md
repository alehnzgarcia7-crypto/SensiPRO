# Tracking Architecture — SensiPRO

## Overview

Enterprise-grade tracking stack with two independent layers:

- **Capa A — TikTok / Marketing Events**: Standard TikTok events for campaign optimization and retargeting
- **Capa B — Internal SensiPRO Analytics**: Granular funnel events for Command Center, CRO, and debugging

## Architecture

```
src/lib/analytics/
├── constants.ts          # Event names, content IDs, product info
├── session.ts            # visitor_id (localStorage) + session_id (sessionStorage, 30min timeout)
├── attribution.ts        # UTM, ttclid, referrer, deep-link param capture & persistence
├── dedup.ts              # Event deduplication — deterministic IDs for checkout/purchase
├── pixel.ts              # TikTok Pixel client-side wrapper (SSR-safe)
├── server-events.ts      # TikTok Events API server-side sender
├── track-client.ts       # Unified client tracking → /api/analytics/track
├── track-server.ts       # Server tracking → Prisma + TikTok Events API
└── index.ts              # Barrel exports

src/components/analytics/
└── analytics-provider.tsx  # Initializes pixel + captures attribution + page view tracking

src/app/api/analytics/
└── track/route.ts          # Internal analytics endpoint (batched, rate-limited, validated)
```

## Environment Variables

```bash
# Client-side pixel (loads in browser)
NEXT_PUBLIC_TIKTOK_PIXEL_ID=""

# Server-side Events API
TIKTOK_PIXEL_ID=""
TIKTOK_EVENTS_API_ACCESS_TOKEN=""
TIKTOK_TEST_EVENT_CODE=""       # Optional, for testing
```

## TikTok Standard Events

| Event | Where Fired | Client/Server | Dedup |
|-------|------------|---------------|-------|
| `PageView` | Every route change | Client (pixel) | No (standard) |
| `ViewContent` | Landing, generator, results, pricing, headshot, academy, paywall blur | Client (pixel) | No |
| `Search` | Brand selected, model selected | Client (pixel) | No |
| `ClickButton` | Landing CTAs, generator submit, unlock CTA, payment method select | Client (pixel) | No |
| `InitiateCheckout` | `/api/payments/create` — when checkout session is actually created | Server (Events API) | Yes — `checkout_{sessionId}` |
| `Purchase` | Stripe/MP webhooks — when payment is confirmed | Server (Events API) | Yes — `purchase_{paymentId}` |

## Internal SensiPRO Events

### Landing
| Event | Trigger |
|-------|---------|
| `landing_short_viewed` | Landing page loads |
| `landing_cta_generate_clicked` | Hero or footer CTA clicked |

### Generator
| Event | Trigger |
|-------|---------|
| `generator_viewed` | Generator page loads |
| `brand_selected` | User selects a brand |
| `model_selected` | User selects a device model |
| `style_selected` | User selects play style |
| `generator_submitted` | User clicks "Generate" |
| `generator_completed` | Results are received |
| `result_viewed` | Results are displayed |

### Paywall
| Event | Trigger |
|-------|---------|
| `blur_shown` | PremiumBlur component renders for free users |
| `unlock_cta_clicked` | User clicks unlock/desbloquear button |
| `payment_method_selected` | User selects card/oxxo/mercadopago |

### Checkout
| Event | Trigger |
|-------|---------|
| `checkout_created` | Checkout session/preference created successfully |
| `checkout_completed` | Payment confirmed via webhook |
| `checkout_failed` | Payment failed |
| `checkout_cancelled` | User lands on failure page |

### Modules
| Event | Trigger |
|-------|---------|
| `headshot_opened` | Headshot mode page loads |
| `academy_opened` | Academy page loads |
| `pricing_viewed` | Pricing page loads |
| `success_viewed` | Success page loads |
| `cancel_viewed` | Cancel/failure page loads |

## Deduplication Strategy

### InitiateCheckout
- **ID format**: `checkout_{checkoutSessionId|paymentIntentId|preferenceId}`
- **Client**: Not fired (only server-side)
- **Server**: Fired in `/api/payments/create` after checkout session is created
- Result: No duplicate — only one source

### Purchase
- **ID format**: `purchase_{stripeSessionId|paymentIntentId|mpPaymentId}`
- **Client**: Not fired (never from success page)
- **Server**: Fired ONLY in webhook handlers when payment is confirmed
- Result: No duplicate — only fires on confirmed payment, never from client

### Other Events
- Generated random IDs (`evt_{timestamp}_{random}`)
- Page-level dedup via `hasEventFired()` / `markEventFired()` set (prevents re-fire on rerender)

## Attribution System

### Captured Parameters
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- `ttclid` (TikTok click ID)
- `referrer`
- Landing page URL
- Deep-link params: `brand`, `model`, `style`

### Persistence
- Stored in `sessionStorage` as `sp_attribution`
- Only overwritten if new visit has actual source data (not on internal navigation)
- `ttclid` also stored separately in `sensipro_ttclid` for payment attribution
- Attached to all events automatically via `getAttributionForEvent()`

### Flow
1. User arrives from TikTok ad: `?utm_source=tiktok&ttclid=xxx&brand=samsung`
2. `AnalyticsProvider` captures and persists attribution on mount
3. All subsequent events include attribution data in metadata
4. When checkout is created, `ttclid` is passed to server for Events API
5. Purchase event on webhook includes `ttclid` for full attribution loop

## Deep Link Support

The generator supports URL parameters for ad campaigns:

```
/generator?brand=Samsung&model=galaxy-s24-ultra&style=BALANCED&source=tiktok&campaign=samsung_q1&ttclid=xxx
```

| Parameter | Effect |
|-----------|--------|
| `brand` | Pre-selects brand step |
| `model` | Pre-selects device (fetches by slug) |
| `style` | Pre-selects play style |
| `source` | Stored for attribution |
| `campaign` | Stored for attribution |
| `ttclid` | Stored for TikTok attribution |

## Identity System

| ID | Storage | Scope | Purpose |
|----|---------|-------|---------|
| `visitor_id` | localStorage `sp_visitor_id` | Cross-session | Unique visitor tracking |
| `session_id` | sessionStorage `sp_session_id` | 30-min timeout | Session grouping |
| `user_id` | NextAuth session | Authenticated | User-level attribution |

## Testing

### Debug Mode
In development (`NODE_ENV=development`):
1. TikTok Pixel won't load unless `NEXT_PUBLIC_TIKTOK_PIXEL_ID` is set
2. Events API won't send unless both `TIKTOK_PIXEL_ID` and `TIKTOK_EVENTS_API_ACCESS_TOKEN` are set
3. Internal events are always tracked to `/api/analytics/track` → Prisma

### Verifying Events
1. **Internal events**: Query `analytics_events` table in DB or check Command Center
2. **TikTok Pixel**: Use TikTok Pixel Helper browser extension
3. **TikTok Events API**: Use `TIKTOK_TEST_EVENT_CODE` env var for test mode
4. **Attribution**: Check `sessionStorage` key `sp_attribution`

### Rate Limiting
- `/api/analytics/track`: 100 events/minute per IP (in-memory)
- Batched: up to 10 events per request, max 50 per batch

## What's NOT Tracked

- `AddPaymentInfo` — Not implemented because we can't reliably detect when payment info is entered (happens on Stripe/MP hosted pages)
- `CompleteRegistration` — Not fired automatically; can be added when auth flow tracking is needed
- Purchase from client-side — Intentionally excluded; only webhook-confirmed purchases are tracked

## Files Modified

### New Files
- `src/lib/analytics/` (9 modules)
- `src/components/analytics/analytics-provider.tsx`
- `src/app/api/analytics/track/route.ts`
- `docs/tracking-architecture.md`

### Modified Files
- `src/components/providers.tsx` — Added AnalyticsProvider
- `src/components/paywall/paywall-modal.tsx` — blur_shown, unlock_cta, payment_method_selected, checkout_created events
- `src/components/paywall/premium-blur.tsx` — blur_shown, unlock_cta events
- `src/app/api/payments/create/route.ts` — Server-side InitiateCheckout
- `src/app/api/webhooks/stripe/route.ts` — Server-side Purchase
- `src/app/api/webhooks/mercadopago/route.ts` — Server-side Purchase
- `src/app/(app)/generator/page.tsx` — ttclid capture, attribution persistence
- `src/components/generator/steps/brand-step.tsx` — brand_selected event
- `src/components/generator/steps/device-step.tsx` — model_selected event
- `src/components/generator/steps/style-step.tsx` — style_selected, generator_submitted, generator_completed events
- `src/components/landing/hero-section.tsx` — landing CTA click event
- `src/components/landing/cta-section.tsx` — landing CTA click event
- `.env.example` — TikTok env vars
