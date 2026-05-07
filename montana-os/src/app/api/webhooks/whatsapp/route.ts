import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  verifyWhatsAppSignature,
  checkWebhookIdempotency,
  createWebhookActivity,
} from '@/lib/pipeline/webhooks';
import { createLead } from '@/lib/pipeline/leads';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-hub-signature-256');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    const body = await request.text();
    const token = process.env.WHATSAPP_WEBHOOK_TOKEN!;

    if (!verifyWhatsAppSignature(body, signature, token)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);
    const message = payload.entry[0].changes[0].value.messages?.[0];

    if (!message) {
      return NextResponse.json({ ok: true }); // Ignore non-message events
    }

    const externalId = message.id;

    // Check idempotency
    const supabase = await createClient();
    const isProcessed = await checkWebhookIdempotency(supabase, externalId);

    if (isProcessed) {
      return NextResponse.json({ ok: true }); // Already processed
    }

    const { from, text } = message;
    const messageText = text?.body || '';

    // Find or create lead
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, assigned_to')
      .eq('whatsapp', from)
      .single();

    let leadId: string;

    if (existingLead) {
      leadId = existingLead.id;
    } else {
      // Create new lead - use a default property_id or get from message metadata
      // For now, we'll need to handle this scenario appropriately
      // In production, extract property from message context or create without property reference
      const newLead = await createLead({
        property_id: 'default', // Placeholder - should be handled in production
        nombre: from,
        whatsapp: from,
        fuente: 'whatsapp_directo',
      });
      leadId = newLead.id;
    }

    // Log activity
    await createWebhookActivity(
      supabase,
      leadId,
      messageText,
      externalId
    );

    // Return 200 immediately (non-blocking)
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    // Always return 200 to prevent retries from WhatsApp
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}

export async function GET(request: NextRequest) {
  // Webhook verification endpoint for WhatsApp subscription
  const mode = request.nextUrl.searchParams.get('hub.mode');
  const token = request.nextUrl.searchParams.get('hub.verify_token');
  const challenge = request.nextUrl.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN!) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
}
