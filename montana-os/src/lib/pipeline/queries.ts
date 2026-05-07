import { createClient } from '@/lib/supabase/server';
import { PipelineAnalytics, LeadStatus } from '@/types/pipeline';

export async function getPipelineAnalytics(): Promise<PipelineAnalytics> {
  const supabase = await createClient();

  // Get all leads grouped by status
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('id, status, created_at, status_updated_at, property_id');

  if (leadsError) throw leadsError;

  const total_leads = leads?.length || 0;

  // Count by status
  const leads_by_status: Record<LeadStatus, number> = {
    lead_nuevo: 0,
    interesado: 0,
    pendiente_respuesta: 0,
    en_visita: 0,
    propuesta_enviada: 0,
    cerrado: 0,
    no_interesado: 0,
  };

  let total_cycle_time = 0;
  let closed_count = 0;

  leads?.forEach((lead: any) => {
    leads_by_status[lead.status]++;

    if (lead.status === 'cerrado') {
      closed_count++;
      const cycle = Math.floor(
        (new Date(lead.status_updated_at).getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      total_cycle_time += cycle;
    }
  });

  const conversion_rate = total_leads > 0 ? ((closed_count / total_leads) * 100).toFixed(1) : '0';
  const avg_cycle_time = closed_count > 0 ? (total_cycle_time / closed_count).toFixed(1) : '0';

  // Count leads at risk (no activity for 7+ days)
  const seven_days_ago = new Date();
  seven_days_ago.setDate(seven_days_ago.getDate() - 7);

  const leads_at_risk = (leads || []).filter((l: any) => {
    return l.status !== 'cerrado' &&
           l.status !== 'no_interesado' &&
           new Date(l.created_at) < seven_days_ago;
  }).length;

  // Get top agents (by closes)
  const { data: top_agents, error: agentsError } = await supabase
    .from('leads')
    .select('assigned_to, usuarios(nombre), property_id, propiedades(precio)')
    .eq('status', 'cerrado')
    .limit(100);

  const agent_map: Record<string, { nombre: string; closes: number; revenue: number }> = {};

  (top_agents || []).forEach((lead: any) => {
    const agent_id = lead.assigned_to;
    if (!agent_map[agent_id]) {
      agent_map[agent_id] = {
        nombre: lead.usuarios?.nombre || 'Unknown',
        closes: 0,
        revenue: 0,
      };
    }
    agent_map[agent_id].closes++;
    agent_map[agent_id].revenue += lead.propiedades?.precio || 0;
  });

  const sorted_agents = Object.entries(agent_map)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.closes - a.closes)
    .slice(0, 3);

  // Calculate revenue pipeline
  const { data: active_leads } = await supabase
    .from('leads')
    .select('propiedades(precio)')
    .neq('status', 'cerrado')
    .neq('status', 'no_interesado');

  const revenue_pipeline = (active_leads || []).reduce(
    (sum: number, l: any) => sum + (l.propiedades?.precio || 0),
    0
  );

  return {
    total_leads,
    leads_by_status,
    conversion_rate: parseFloat(conversion_rate as string),
    avg_cycle_time: parseFloat(avg_cycle_time as string),
    leads_at_risk,
    revenue_pipeline,
    top_agents: sorted_agents as any,
  };
}
