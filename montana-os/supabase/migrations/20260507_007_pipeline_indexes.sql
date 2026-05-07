-- supabase/migrations/20260507_007_pipeline_indexes.sql

-- Leads table indexes
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_property_id ON leads(property_id);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_last_contact ON leads(last_contact DESC);
CREATE INDEX idx_leads_dias_en_pipeline ON leads(dias_en_pipeline DESC);

-- Lead_activities indexes
CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_created_at ON lead_activities(created_at DESC);
