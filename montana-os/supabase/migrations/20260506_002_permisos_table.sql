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
