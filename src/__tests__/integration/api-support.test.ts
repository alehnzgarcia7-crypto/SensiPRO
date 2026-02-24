import { describe, it, expect } from 'vitest';

const BASE = 'http://localhost:3000';

// ═══════════════════════════════════════════════════════════════
// ARES-805 — Integration tests: /api/support
// Requiere dev server corriendo en localhost:3000 con DB seeded
// ═══════════════════════════════════════════════════════════════

describe('POST /api/support', () => {
  it('creates a support ticket with all fields', async () => {
    const res = await fetch(`${BASE}/api/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test-integration@example.com',
        subject: 'Test ticket from integration tests',
        message: 'This is a test support ticket created during integration testing. Please ignore.',
        category: 'OTHER',
      }),
    });

    const json: { success: boolean; data: { ticketId: string } } = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty('ticketId');
    expect(typeof json.data.ticketId).toBe('string');
    expect(json.data.ticketId.length).toBeGreaterThan(0);
  });

  it('creates a ticket with BUG category', async () => {
    const res = await fetch(`${BASE}/api/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bug-report@example.com',
        subject: 'Bug report from integration test',
        message: 'Found a bug during testing. This is an automated integration test ticket.',
        category: 'BUG',
      }),
    });

    const json: { success: boolean; data: { ticketId: string } } = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.ticketId).toBeTruthy();
  });

  it('creates a ticket with default category when omitted', async () => {
    const res = await fetch(`${BASE}/api/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'default-cat@example.com',
        subject: 'Ticket sin categoria explicita',
        message: 'Este ticket no especifica categoria, deberia usar OTHER por defecto.',
      }),
    });

    const json: { success: boolean; data: { ticketId: string } } = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.ticketId).toBeTruthy();
  });

  it('rejects subject shorter than 5 characters', async () => {
    const res = await fetch(`${BASE}/api/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        subject: 'Hi',
        message: 'This should fail validation because subject is too short.',
      }),
    });

    const json: { success: boolean; error: { code: string } } = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects message shorter than 10 characters', async () => {
    const res = await fetch(`${BASE}/api/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        subject: 'Valid subject here',
        message: 'Short',
      }),
    });

    const json: { success: boolean; error: { code: string } } = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects invalid email', async () => {
    const res = await fetch(`${BASE}/api/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'not-an-email',
        subject: 'Valid subject here',
        message: 'Valid message content here for the test.',
      }),
    });

    const json: { success: boolean; error: { code: string } } = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects missing required fields', async () => {
    const res = await fetch(`${BASE}/api/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        // Sin subject ni message
      }),
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
    const json: { success: boolean } = await res.json();
    expect(json.success).toBe(false);
  });

  it('rejects invalid category', async () => {
    const res = await fetch(`${BASE}/api/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        subject: 'Valid subject for test',
        message: 'Valid message content for integration test.',
        category: 'NONEXISTENT_CATEGORY',
      }),
    });

    expect(res.status).toBe(400);
    const json: { success: boolean; error: { code: string } } = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('accepts all valid categories', async () => {
    const categories = ['BUG', 'PAYMENT', 'ACCOUNT', 'FEATURE', 'OTHER'] as const;

    for (const category of categories) {
      const res = await fetch(`${BASE}/api/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test-${category.toLowerCase()}@example.com`,
          subject: `Test ticket category ${category}`,
          message: `Testing that category ${category} is accepted by the support API.`,
          category,
        }),
      });

      const json: { success: boolean } = await res.json();
      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
    }
  });
});
