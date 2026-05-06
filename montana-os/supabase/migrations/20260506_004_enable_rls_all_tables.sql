-- supabase/migrations/20260506_004_enable_rls_all_tables.sql

-- Verify all user-created tables have RLS enabled
-- (auth.users is managed by Supabase, not us)

ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
