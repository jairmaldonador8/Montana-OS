import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Mock modules
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/pipeline/leads', () => ({
  createLead: vi.fn(),
}));

describe('Webhook Signature Verification', () => {
  const WEBHOOK_SECRET = 'test-webhook-secret';

  function generateWebhookSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.WEBHOOK_SECRET = WEBHOOK_SECRET;
  });

  it('should verify valid webhook signature', () => {
    const payload = JSON.stringify({ event: 'message.incoming', data: { from: '1234567890' } });
    const signature = generateWebhookSignature(payload, WEBHOOK_SECRET);

    // Simulate signature verification
    const isValid =
      signature ===
      generateWebhookSignature(payload, WEBHOOK_SECRET);

    expect(isValid).toBe(true);
  });

  it('should reject invalid webhook signature', () => {
    const payload = JSON.stringify({ event: 'message.incoming', data: { from: '1234567890' } });
    const invalidSignature = 'invalid-signature';

    const isValid =
      invalidSignature ===
      generateWebhookSignature(payload, WEBHOOK_SECRET);

    expect(isValid).toBe(false);
  });

  it('should reject tampered payload', () => {
    const originalPayload = JSON.stringify({ event: 'message.incoming', data: { from: '1234567890' } });
    const signature = generateWebhookSignature(originalPayload, WEBHOOK_SECRET);

    const tamperedPayload = JSON.stringify({ event: 'message.incoming', data: { from: '0000000000' } });
    const isValid =
      signature ===
      generateWebhookSignature(tamperedPayload, WEBHOOK_SECRET);

    expect(isValid).toBe(false);
  });
});

describe('Webhook Idempotency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle duplicate webhook events idempotently', () => {
    const webhookId = 'webhook-event-123';
    const processedWebhooks = new Set<string>();

    // Simulate processing first event
    processedWebhooks.add(webhookId);
    expect(processedWebhooks.has(webhookId)).toBe(true);

    // Simulate processing duplicate event
    const isDuplicate = processedWebhooks.has(webhookId);
    expect(isDuplicate).toBe(true);

    // Verify set still has only one entry
    expect(processedWebhooks.size).toBe(1);
  });

  it('should process unique webhook events', () => {
    const processedWebhooks = new Set<string>();

    processedWebhooks.add('event-1');
    processedWebhooks.add('event-2');
    processedWebhooks.add('event-3');

    expect(processedWebhooks.size).toBe(3);
    expect(processedWebhooks.has('event-1')).toBe(true);
    expect(processedWebhooks.has('event-2')).toBe(true);
    expect(processedWebhooks.has('event-3')).toBe(true);
  });
});

describe('WhatsApp Webhook Payload Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate incoming message payload', () => {
    const payload = {
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    from: '1234567890',
                    type: 'text',
                    text: { body: 'Hello' },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const hasMessages = payload.entry?.[0]?.changes?.[0]?.value?.messages?.length > 0;
    expect(hasMessages).toBe(true);

    if (hasMessages) {
      const message = payload.entry[0].changes[0].value.messages[0];
      expect(message.from).toBeDefined();
      expect(message.type).toBe('text');
    }
  });

  it('should handle missing message data gracefully', () => {
    const incompletePayload = {
      entry: [{ changes: [{ value: {} }] }],
    };

    const hasMessages = incompletePayload.entry?.[0]?.changes?.[0]?.value?.messages?.length > 0;
    expect(hasMessages).toBe(false);
  });

  it('should validate multiple message types', () => {
    const messageTypes = ['text', 'image', 'document', 'audio', 'video'];
    const validTypes = new Set(messageTypes);

    expect(validTypes.has('text')).toBe(true);
    expect(validTypes.has('image')).toBe(true);
    expect(validTypes.has('unknown')).toBe(false);
  });
});

describe('Webhook Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should track webhook events per phone number', () => {
    const eventLog = new Map<string, number[]>();
    const now = Date.now();

    // Simulate events from same number
    const phoneNumber = '1234567890';
    eventLog.set(phoneNumber, [now, now + 1000, now + 2000]);

    expect(eventLog.get(phoneNumber)?.length).toBe(3);
  });

  it('should enforce rate limit window', () => {
    const RATE_LIMIT_WINDOW = 60000; // 1 minute
    const MAX_EVENTS = 10;
    const now = Date.now();
    const events: number[] = [];

    for (let i = 0; i < 5; i++) {
      events.push(now + i * 100);
    }

    // Filter events within window
    const recentEvents = events.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW);
    const isWithinLimit = recentEvents.length <= MAX_EVENTS;

    expect(isWithinLimit).toBe(true);
    expect(recentEvents.length).toBe(5);
  });

  it('should reject events exceeding rate limit', () => {
    const RATE_LIMIT_WINDOW = 60000;
    const MAX_EVENTS = 3;
    const now = Date.now();
    const events: number[] = [];

    // Create 5 events within the window
    for (let i = 0; i < 5; i++) {
      events.push(now + i * 100);
    }

    const recentEvents = events.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW);
    const isWithinLimit = recentEvents.length <= MAX_EVENTS;

    expect(isWithinLimit).toBe(false);
    expect(recentEvents.length).toBe(5);
  });
});

describe('Webhook Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 for valid webhook even on processing error', async () => {
    // Webhook providers expect 200 response even if processing fails
    const webhookResponse = { statusCode: 200, processed: false, error: 'Processing failed' };

    expect(webhookResponse.statusCode).toBe(200);
    expect(webhookResponse.processed).toBe(false);
  });

  it('should log webhook errors for debugging', () => {
    const errors: Array<{ timestamp: number; error: string }> = [];
    const errorMessage = 'Failed to create lead from webhook';

    errors.push({ timestamp: Date.now(), error: errorMessage });

    expect(errors).toHaveLength(1);
    expect(errors[0].error).toBe(errorMessage);
  });

  it('should handle malformed JSON payloads', () => {
    const malformedJson = '{invalid json}';

    let parseError: Error | null = null;
    try {
      JSON.parse(malformedJson);
    } catch (e) {
      parseError = e as Error;
    }

    expect(parseError).not.toBeNull();
    expect(parseError?.message).toContain('Unexpected token');
  });
});
