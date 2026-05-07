-- Montana OS Pipeline Database Setup
-- Run this in Supabase SQL Editor

-- ===== 20260506_001_usuarios_table.sql =====
-- supabase/migrations/20260506_001_usuarios_table.sql

CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  rol TEXT CHECK (rol IN ('agent', 'admin', 'publisher')) NOT NULL,
  nombre TEXT NOT NULL,
  avatar_url TEXT,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for RLS performance
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- Enable RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Admin can see all users, agents see only themselves
CREATE POLICY "admin_select_all_usuarios" ON usuarios
  FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
    OR id = auth.uid()
  );

CREATE POLICY "admin_update_usuarios" ON usuarios
  FOR UPDATE
  USING ((SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin');

CREATE POLICY "admin_delete_usuarios" ON usuarios
  FOR DELETE
  USING ((SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin');


-- ===== 20260506_002_permisos_table.sql =====
-- supabase/migrations/20260506_002_permisos_table.sql

CREATE TABLE permisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  puede_crear_propiedades BOOLEAN DEFAULT false,
  puede_editar_propiedades BOOLEAN DEFAULT false,
  puede_enviar_revision BOOLEAN DEFAULT false,
  puede_aprobar_propiedades BOOLEAN DEFAULT false,
  puede_rechazar_propiedades BOOLEAN DEFAULT false,
  puede_ver_todas_propiedades BOOLEAN DEFAULT false,
  puede_bajar_propiedades BOOLEAN DEFAULT false,
  puede_autorizar_bajar BOOLEAN DEFAULT false,
  puede_crear_usuarios BOOLEAN DEFAULT false,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(usuario_id)
);

-- Index for lookups
CREATE INDEX idx_permisos_usuario_id ON permisos(usuario_id);

-- Enable RLS
ALTER TABLE permisos ENABLE ROW LEVEL SECURITY;

-- Users see only their own permissions, admins see all
CREATE POLICY "select_own_permisos" ON permisos
  FOR SELECT
  USING (
    usuario_id = auth.uid()
    OR (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "admin_update_permisos" ON permisos
  FOR UPDATE
  USING ((SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin');


-- ===== 20260506_003_audit_log_table.sql =====
-- supabase/migrations/20260506_003_audit_log_table.sql

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  accion TEXT NOT NULL,
  tabla_afectada TEXT NOT NULL,
  registro_id UUID NOT NULL,
  cambios JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for queries
CREATE INDEX idx_audit_log_usuario_timestamp ON audit_log(usuario_id, timestamp DESC);
CREATE INDEX idx_audit_log_tabla_registro ON audit_log(tabla_afectada, registro_id);
CREATE INDEX idx_audit_log_accion ON audit_log(accion);

-- Enable RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Agents see only their own actions, admins see all
CREATE POLICY "select_audit_log" ON audit_log
  FOR SELECT
  USING (
    usuario_id = auth.uid()
    OR (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );


-- ===== 20260506_004_enable_rls_all_tables.sql =====
-- supabase/migrations/20260506_004_enable_rls_all_tables.sql

-- Verify all user-created tables have RLS enabled
-- (auth.users is managed by Supabase, not us)

ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;


-- ===== 20260507_005_pipeline_tables.sql =====
-- supabase/migrations/20260507_005_pipeline_tables.sql

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES usuarios(id) ON DELETE SET NULL,

  status TEXT NOT NULL CHECK (status IN (
    'lead_nuevo',
    'interesado',
    'pendiente_respuesta',
    'en_visita',
    'propuesta_enviada',
    'cerrado',
    'no_interesado'
  )),

  nombre TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  fuente TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_contact TIMESTAMP WITH TIME ZONE,

  dias_en_pipeline INT GENERATED ALWAYS AS (
    EXTRACT(DAY FROM now() - created_at)
  ) STORED,

  created_by UUID REFERENCES usuarios(id),
  notas TEXT,

  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'
);

CREATE TABLE lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,

  old_value TEXT,
  new_value TEXT,

  external_id TEXT UNIQUE, -- For webhook deduplication

  created_by UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;


-- ===== 20260507_006_pipeline_rls_policies.sql =====
-- supabase/migrations/20260507_006_pipeline_rls_policies.sql

-- Agents see only their assigned leads + team leads see their team + admin sees all
CREATE POLICY "agents_see_own_leads" ON leads
  FOR SELECT
  USING (
    assigned_to = auth.uid()
    OR (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('team_lead', 'admin')
  );

CREATE POLICY "team_leads_see_team" ON leads
  FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'team_lead'
    OR (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

-- Agents can update only their assigned leads
CREATE POLICY "agents_update_own_leads" ON leads
  FOR UPDATE
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- Team leads can reassign
CREATE POLICY "team_leads_reassign" ON leads
  FOR UPDATE
  USING ((SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('team_lead', 'admin'))
  WITH CHECK ((SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('team_lead', 'admin'));

-- Activity log access follows lead access
CREATE POLICY "read_lead_activities" ON lead_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leads l
      WHERE l.id = lead_activities.lead_id
      AND (
        l.assigned_to = auth.uid()
        OR (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('team_lead', 'admin')
      )
    )
  );

CREATE POLICY "create_lead_activities" ON lead_activities
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads l
      WHERE l.id = lead_activities.lead_id
      AND (
        l.assigned_to = auth.uid()
        OR (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('team_lead', 'admin')
      )
    )
  );


-- ===== 20260507_007_pipeline_indexes.sql =====
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


