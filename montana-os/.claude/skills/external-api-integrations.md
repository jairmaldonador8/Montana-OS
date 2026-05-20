---
name: external-api-integrations
description: Use when integrating WhatsApp, Google Calendar, and Email APIs with proper OAuth, error handling, and retry logic
---

# External API Integrations

## Overview
Integrate third-party services (WhatsApp, Google Calendar, Email) with proper OAuth authentication, error handling, and retry strategies to ensure reliability.

## When to Use
- Sending WhatsApp messages to leads/asesors
- Syncing appointments with Google Calendar
- Sending transactional emails
- Handling webhook callbacks from external services

## Core Patterns

### 1. WhatsApp Business API Integration

```typescript
// src/lib/whatsapp.ts
import axios from 'axios';

const WHATSAPP_API_URL = 'https://graph.instagram.com/v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export async function sendWhatsAppMessage(
  toPhone: string,
  message: string,
  maxRetries = 3
) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(
        `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: toPhone.replace(/\D/g, ''), // Remove non-digits
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
          timeout: 10000,
        }
      );

      console.log(`WhatsApp sent to ${toPhone}:`, response.data.messages);
      return response.data;
    } catch (error) {
      lastError = error;
      const isRetryable = error.response?.status >= 500 || error.code === 'ECONNREFUSED';

      if (attempt < maxRetries && isRetryable) {
        const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
        console.log(`Retry attempt ${attempt} after ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  console.error(`Failed to send WhatsApp after ${maxRetries} attempts:`, lastError);
  throw lastError;
}

// Usage in cron job or API
async function notifyAsesorNewLead(asesorPhone: string, leadName: string) {
  const message = `🔔 Nuevo lead: ${leadName}. Abre Montana OS para más detalles.`;
  await sendWhatsAppMessage(asesorPhone, message);
}
```

### 2. Google Calendar API (Sync)

```typescript
// src/lib/google-calendar.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function createCalendarEvent(
  userId: string,
  event: {
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
  }
) {
  try {
    // Get user's stored Google tokens
    const { data: user } = await supabase
      .from('user_oauth_tokens')
      .select('google_tokens')
      .eq('user_id', userId)
      .single();

    if (!user?.google_tokens) {
      throw new Error('User has not authorized Google Calendar');
    }

    oauth2Client.setCredentials(user.google_tokens);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.create({
      calendarId: 'primary',
      requestBody: {
        summary: event.title,
        description: event.description,
        start: { dateTime: event.startTime.toISOString() },
        end: { dateTime: event.endTime.toISOString() },
        conferenceData: {
          createRequest: {
            requestId: `${userId}-${Date.now()}`, // Idempotency key
            conferenceSolution: { key: { conferenceSolution: 'hangoutsMeet' } },
          },
        },
      },
      conferenceDataVersion: 1,
    });

    console.log(`Calendar event created: ${response.data.id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to create calendar event:', error);
    throw error;
  }
}

// Get events for a date range
export async function getCalendarEvents(userId: string, startDate: Date, endDate: Date) {
  // Similar pattern as above
  // Useful for checking availability before auto-scheduling
}
```

### 3. Email Integration (Transactional)

```typescript
// src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLeadNotificationEmail(
  asesorEmail: string,
  leadName: string,
  leadDetails: any
) {
  try {
    const response = await resend.emails.send({
      from: 'noreply@montanaos.com',
      to: asesorEmail,
      subject: `Nuevo lead: ${leadName}`,
      html: `
        <h2>Nuevo Lead</h2>
        <p><strong>${leadName}</strong></p>
        <p>Presupuesto: $${leadDetails.presupuesto_min} - $${leadDetails.presupuesto_max}</p>
        <p>Zona: ${leadDetails.zona}</p>
        <a href="https://montanaos.com/dashboard/asesor/leads/${leadDetails.id}">
          Ver Lead
        </a>
      `,
    });

    if (response.error) {
      throw response.error;
    }

    console.log(`Email sent to ${asesorEmail}:`, response.data.id);
    return response.data;
  } catch (error) {
    console.error('Email send failed:', error);
    throw error;
  }
}
```

### 4. Handle Webhook Callbacks

```typescript
// src/pages/api/webhooks/whatsapp.ts
// WhatsApp sends webhook events (message delivered, read, failed)

import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const WHATSAPP_WEBHOOK_TOKEN = process.env.WHATSAPP_WEBHOOK_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify webhook signature
  const signature = req.headers['x-hub-signature-256'];
  const body = JSON.stringify(req.body);
  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', WHATSAPP_WEBHOOK_TOKEN!)
    .update(body)
    .digest('hex')}`;

  if (signature !== expectedSignature) {
    return res.status(403).json({ error: 'Invalid signature' });
  }

  // Handle different webhook events
  const { entry } = req.body;

  for (const e of entry || []) {
    for (const change of e.changes || []) {
      const { value } = change;

      if (value.messages) {
        // Incoming message from lead
        const message = value.messages[0];
        await handleIncomingWhatsAppMessage(message, value.contacts[0]);
      }

      if (value.message_status) {
        // Message delivery/read status
        const { id, status } = value.message_status;
        await updateMessageStatus(id, status);
      }
    }
  }

  res.json({ received: true });
}

async function handleIncomingWhatsAppMessage(message: any, contact: any) {
  // Save message in lead's history
  const { data: lead } = await supabase
    .from('leads')
    .select('id')
    .eq('whatsapp', contact.wa_id)
    .single();

  if (lead) {
    await supabase.from('messages').insert({
      lead_id: lead.id,
      sender: 'lead',
      content: message.text.body,
      channel: 'whatsapp',
      received_at: new Date(parseInt(message.timestamp) * 1000),
    });
  }
}

async function updateMessageStatus(messageId: string, status: string) {
  await supabase
    .from('messages')
    .update({ status })
    .eq('whatsapp_message_id', messageId);
}
```

### 5. Error Handling & Retry Pattern

```typescript
// src/lib/api-client.ts
import axios, { AxiosError } from 'axios';

export async function callExternalAPI<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    backoffMultiplier?: number;
    timeout?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 3, backoffMultiplier = 2, timeout = 10000 } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await Promise.race([
        fn(),
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), timeout)
        ),
      ]);
      return result;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const isRetryable =
        (error instanceof AxiosError && error.response?.status! >= 500) ||
        error instanceof Error && error.message === 'Timeout';

      if (isLastAttempt || !isRetryable) {
        throw error;
      }

      const delayMs = Math.pow(backoffMultiplier, attempt - 1) * 1000;
      console.log(`Retry ${attempt}/${maxRetries} after ${delayMs}ms`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  throw new Error('Unreachable');
}

// Usage
await callExternalAPI(
  () => sendWhatsAppMessage(phone, message),
  { maxRetries: 3, backoffMultiplier: 2 }
);
```

## Common Mistakes

**Mistake 1:** No timeout on external API calls
- Problem: Request hangs forever if API is slow
- Fix: Always set timeout (10-30s depending on service)

**Mistake 2:** No retry logic
- Problem: Temporary failures (network hiccup) cause permanent failures
- Fix: Exponential backoff retry with idempotency keys

**Mistake 3:** Storing tokens in plaintext
- Problem: Tokens leaked if database is compromised
- Fix: Encrypt tokens at rest using Supabase encryption

**Mistake 4:** No logging
- Problem: Can't debug why integration failed
- Fix: Log all API calls, responses, errors with request IDs

## Implementation Checklist

- [ ] Set up WhatsApp Business API (get credentials)
- [ ] Implement sendWhatsAppMessage with retry logic
- [ ] Set up Google OAuth consent screen
- [ ] Implement Google Calendar sync
- [ ] Set up Resend or SendGrid for emails
- [ ] Implement email sending with templates
- [ ] Create webhook endpoint for WhatsApp events
- [ ] Test: send WhatsApp message
- [ ] Test: create calendar event
- [ ] Test: retry logic on simulated failure
- [ ] Add error logging (Sentry, LogRocket, etc)
