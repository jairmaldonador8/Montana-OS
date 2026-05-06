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
