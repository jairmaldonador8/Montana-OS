---
name: background-jobs-scheduling
description: Use when implementing task scheduling (cron jobs, reminders, escalations) in Node.js/Next.js for CRM automations
---

# Background Jobs & Cron Scheduling

## Overview
Schedule recurring tasks and one-time delayed jobs (reminders, lead escalations, follow-ups) using node-cron or node-schedule. Ensure idempotency so re-runs don't duplicate work.

## When to Use
- Sending reminders at specific times
- Checking for overdue leads and escalating to manager
- Scheduled follow-up emails/SMS
- Daily/hourly batch operations

## Core Patterns

### 1. Setup node-cron for Simple Scheduling

```typescript
import cron from 'node-cron';
import { supabase } from '@/lib/supabase';

// Run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running hourly lead check...');
  await checkOverdueLeads();
});

async function checkOverdueLeads() {
  // Find leads that are > 7 days in same stage
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .lt('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .eq('needs_escalation', false);

  for (const lead of leads || []) {
    // Create escalation task for manager
    await supabase.from('tasks').insert({
      lead_id: lead.id,
      title: `Lead ${lead.nombre} overdue - in ${lead.etapa} for 7+ days`,
      assigned_to: lead.manager_id,
      type: 'escalation',
      priority: 'high'
    });

    // Mark as escalated (idempotency)
    await supabase
      .from('leads')
      .update({ needs_escalation: true })
      .eq('id', lead.id);
  }
}
```

### 2. Setup Jobs Endpoint (Serverless-Safe)

In a serverless environment (Vercel), use API routes as cron targets:

```typescript
// src/pages/api/cron/check-leads.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify cron secret to prevent unauthorized calls
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await checkOverdueLeads();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Cron job failed:', error);
    res.status(500).json({ error: 'Job failed' });
  }
}

// Trigger from external cron service (cron.io, EasyCron, etc)
// POST https://yourdomain.com/api/cron/check-leads
// Header: Authorization: Bearer <CRON_SECRET>
```

### 3. Ensure Idempotency (No Duplicate Work)

```typescript
async function sendReminderNotifications() {
  // Fetch reminders that haven't been sent yet
  const { data: reminders } = await supabase
    .from('reminders')
    .select('*')
    .eq('sent', false)
    .lte('scheduled_for', new Date().toISOString());

  for (const reminder of reminders || []) {
    try {
      // Send notification (WhatsApp, Email, etc)
      await sendWhatsAppMessage(reminder.phone, reminder.message);

      // Mark as sent (idempotency key)
      await supabase
        .from('reminders')
        .update({ sent: true, sent_at: new Date() })
        .eq('id', reminder.id);
    } catch (error) {
      console.error(`Failed to send reminder ${reminder.id}:`, error);
      // Don't mark as sent - will retry on next run
    }
  }
}
```

### 4. Handle Long-Running Jobs

For jobs that might take > 60 seconds, use a queue library:

```typescript
import Queue from 'bull';
import redis from 'redis';

const redisClient = redis.createClient(process.env.REDIS_URL!);
const leadImportQueue = new Queue('lead-import', redisClient);

// Process CSV imports asynchronously
leadImportQueue.process(async (job) => {
  const { csvData } = job.data;
  
  for (const row of csvData) {
    await supabase.from('leads').insert({
      nombre: row.nombre,
      email: row.email,
      // ... other fields
    });
  }

  return { imported: csvData.length };
});

// Enqueue job
app.post('/api/leads/import', async (req, res) => {
  const { csvData } = req.body;
  const job = await leadImportQueue.add({ csvData });
  res.json({ jobId: job.id });
});
```

## Common Mistakes

**Mistake 1:** No idempotency - cron runs twice, sends 2 notifications
- Problem: Job runs at same time twice (clock skew, server restart)
- Fix: Mark job as "done" BEFORE re-running. Use status flags like `sent`, `processed`, `completed`

**Mistake 2:** Long-running cron job blocks next execution
- Problem: Job takes 2 hours, next cron execution can't start
- Fix: Use async job queue (Bull, RabbitMQ) for long jobs; cron triggers job, returns immediately

**Mistake 3:** No error logging
- Problem: Job fails silently; you don't know why
- Fix: Log all errors. Use Sentry or similar for alerting

**Mistake 4:** Testing cron jobs is hard
- Problem: Can't easily test "runs every day at 3am"
- Fix: Extract job logic to separate function, test function directly; use node-cron for scheduling only

## Implementation Checklist

- [ ] Install `node-cron` or `node-schedule`
- [ ] Create cron job(s) for automations (overdue leads, reminders, escalations)
- [ ] Implement idempotency (status flags on completed items)
- [ ] Add error logging and alerting
- [ ] If job > 60s, consider Bull queue instead of cron
- [ ] Test job logic without cron (call function directly)
- [ ] Set up external cron trigger for Vercel (EasyCron, cron-job.org, etc)
- [ ] Monitor job execution (log start/end times)
