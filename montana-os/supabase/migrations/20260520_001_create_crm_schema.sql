-- supabase/migrations/20260520_001_create_crm_schema.sql
-- CRM Database Schema for Montana OS
-- Includes: users, leads, tasks, messages, offers tables with RLS policies

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'asesor', 'coordinador')),
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  whatsapp TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view own profile, admins can view all
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Only admins can update users
CREATE POLICY "Admins can update users"
  ON public.users FOR UPDATE
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Only admins can delete users
CREATE POLICY "Admins can delete users"
  ON public.users FOR DELETE
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- ============================================================================
-- LEADS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  whatsapp TEXT,
  ubicacion_actual TEXT,
  tipo_propiedad TEXT,
  presupuesto_min NUMERIC,
  presupuesto_max NUMERIC,
  zona TEXT,
  recamaras INT,
  banos INT,
  timeline TEXT,
  financiamiento TEXT,
  etapa TEXT NOT NULL DEFAULT 'Nuevo' CHECK (etapa IN (
    'Nuevo', 'Primer Contacto', 'Calificado', 'Presentación Programada',
    'Viendo Propiedad', 'Negociación', 'Cierre'
  )),
  asesor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  temperatura TEXT DEFAULT 'Warm' CHECK (temperatura IN ('Frio', 'Warm', 'Caliente')),
  fuente_lead TEXT NOT NULL CHECK (fuente_lead IN ('manual', 'web_form', 'csv_import')),
  proxima_accion TEXT,
  fecha_proxima_accion TIMESTAMP,
  ultima_interaccion TIMESTAMP,
  tipo_ultima_interaccion TEXT,
  needs_escalation BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for leads
CREATE INDEX IF NOT EXISTS idx_leads_asesor_id ON public.leads(asesor_id);
CREATE INDEX IF NOT EXISTS idx_leads_etapa ON public.leads(etapa);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_needs_escalation ON public.leads(needs_escalation) WHERE needs_escalation = TRUE;

-- Enable RLS for leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Asesors can view own leads
CREATE POLICY "Asesor can view own leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = asesor_id);

-- Admins and coordinadores can view all leads
CREATE POLICY "Admin and coordinador can view all leads"
  ON public.leads FOR SELECT
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'coordinador'));

-- Asesors can update own leads
CREATE POLICY "Asesor can update own leads"
  ON public.leads FOR UPDATE
  USING (auth.uid() = asesor_id);

-- Admins can update any leads
CREATE POLICY "Admin can update all leads"
  ON public.leads FOR UPDATE
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Asesors can insert leads
CREATE POLICY "Asesor can insert leads"
  ON public.leads FOR INSERT
  WITH CHECK (auth.uid() = asesor_id);

-- Admins can insert leads for anyone
CREATE POLICY "Admin can insert leads"
  ON public.leads FOR INSERT
  WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- ============================================================================
-- TASKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES public.users(id),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('contact', 'follow_up', 'escalation', 'reminder')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id)
);

-- Indexes for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON public.tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- Enable RLS for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Users can view tasks assigned to them
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = assigned_to);

-- Admins and coordinadores can view all tasks
CREATE POLICY "Admin and coordinador can view all tasks"
  ON public.tasks FOR SELECT
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'coordinador'));

-- Users can update own tasks
CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = assigned_to);

-- Admins can update any tasks
CREATE POLICY "Admin can update all tasks"
  ON public.tasks FOR UPDATE
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  sender TEXT NOT NULL, -- 'asesor' or 'lead'
  channel TEXT NOT NULL CHECK (channel IN ('call', 'email', 'whatsapp', 'sms')),
  content TEXT NOT NULL,
  duration_seconds INT,
  whatsapp_message_id TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON public.messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON public.messages(channel);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages for leads they manage
CREATE POLICY "Users can view messages for their leads"
  ON public.messages FOR SELECT
  USING (
    lead_id IN (
      SELECT id FROM public.leads WHERE asesor_id = auth.uid()
    )
  );

-- Admins and coordinadores can view all messages
CREATE POLICY "Admin and coordinador can view all messages"
  ON public.messages FOR SELECT
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'coordinador'));

-- ============================================================================
-- OFFERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  monto NUMERIC NOT NULL,
  condiciones TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'counter')),
  fecha_respuesta_esperada TIMESTAMP,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for offers
CREATE INDEX IF NOT EXISTS idx_offers_lead_id ON public.offers(lead_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_created_at ON public.offers(created_at DESC);

-- Enable RLS for offers
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Users can view offers for leads they manage
CREATE POLICY "Users can view offers for their leads"
  ON public.offers FOR SELECT
  USING (
    lead_id IN (
      SELECT id FROM public.leads WHERE asesor_id = auth.uid()
    )
  );

-- Admins and coordinadores can view all offers
CREATE POLICY "Admin and coordinador can view all offers"
  ON public.offers FOR SELECT
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'coordinador'));

-- ============================================================================
-- TRIGGER: Automatically create user on auth signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, nombre)
  VALUES (NEW.id, NEW.email, 'asesor', COALESCE(NEW.user_metadata->>'name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- TRIGGER: Update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for leads table
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for offers table
DROP TRIGGER IF EXISTS update_offers_updated_at ON public.offers;
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
