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
