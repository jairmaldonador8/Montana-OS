import { createClient } from '@/lib/supabase/server';
import { Lead, LeadActivity } from '@/types/pipeline';

export async function getLeads(
  options?: {
    status?: string;
    assigned_to?: string;
    limit?: number;
    offset?: number;
  }
) {
  const supabase = await createClient();
  let query = supabase.from('leads').select('*');

  if (options?.status) {
    query = query.eq('status', options.status);
  }
  if (options?.assigned_to) {
    query = query.eq('assigned_to', options.assigned_to);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(options?.limit || 50)
    .offset(options?.offset || 0);

  if (error) throw error;
  return data as Lead[];
}

export async function getLead(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Lead;
}

export async function createLead(data: {
  property_id: string;
  nombre: string;
  email?: string;
  whatsapp?: string;
  fuente?: string;
  notas?: string;
  assigned_to?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      ...data,
      assigned_to: data.assigned_to || user?.id,
      created_by: user?.id,
      status: 'lead_nuevo',
    })
    .select()
    .single();

  if (error) throw error;
  return lead as Lead;
}

export async function updateLeadStatus(
  id: string,
  newStatus: string,
  notes?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const lead = await getLead(id);

  // Update lead
  const { data: updated, error: updateError } = await supabase
    .from('leads')
    .update({
      status: newStatus,
      status_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) throw updateError;

  // Log activity
  const { error: activityError } = await supabase
    .from('lead_activities')
    .insert({
      lead_id: id,
      activity_type: 'status_change',
      old_value: lead.status,
      new_value: newStatus,
      description: notes || `Status changed to ${newStatus}`,
      created_by: user?.id,
    });

  if (activityError) throw activityError;
  return updated as Lead;
}

export async function deleteLead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
