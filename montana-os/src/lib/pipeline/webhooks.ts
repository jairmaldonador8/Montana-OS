import crypto from 'crypto';

export function verifyWhatsAppSignature(
  payload: string,
  signature: string,
  token: string = process.env.WHATSAPP_WEBHOOK_TOKEN!
): boolean {
  const expected = crypto
    .createHmac('sha256', token)
    .update(payload)
    .digest('hex');

  return signature === expected;
}

export async function checkWebhookIdempotency(
  supabase: any,
  externalId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('lead_activities')
    .select('id')
    .eq('external_id', externalId)
    .single();

  return !!data; // True if already processed
}

export async function createWebhookActivity(
  supabase: any,
  leadId: string,
  description: string,
  externalId: string
) {
  const { error } = await supabase
    .from('lead_activities')
    .insert({
      lead_id: leadId,
      activity_type: 'whatsapp_msg',
      description,
      external_id: externalId,
    });

  if (error) throw error;
}
