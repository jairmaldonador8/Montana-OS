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
