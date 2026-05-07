// src/types/pipeline.ts

export type LeadStatus =
  | 'lead_nuevo'
  | 'interesado'
  | 'pendiente_respuesta'
  | 'en_visita'
  | 'propuesta_enviada'
  | 'cerrado'
  | 'no_interesado';

export type ActivityType =
  | 'status_change'
  | 'whatsapp_msg'
  | 'call'
  | 'email'
  | 'note';

export interface Lead {
  id: string;
  property_id: string;
  assigned_to: string;
  status: LeadStatus;
  nombre: string;
  email?: string;
  whatsapp?: string;
  fuente?: string;
  created_at: string;
  updated_at: string;
  status_updated_at: string;
  last_contact?: string;
  dias_en_pipeline: number;
  created_by?: string;
  notas?: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: ActivityType;
  description?: string;
  old_value?: string;
  new_value?: string;
  external_id?: string;
  created_by?: string;
  created_at: string;
}

export interface PipelineAnalytics {
  total_leads: number;
  leads_by_status: Record<LeadStatus, number>;
  conversion_rate: number;
  avg_cycle_time: number;
  leads_at_risk: number;
  revenue_pipeline: number;
  top_agents: Array<{
    id: string;
    nombre: string;
    closes: number;
    revenue: number;
  }>;
}
