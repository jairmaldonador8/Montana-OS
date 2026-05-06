-- ============================================================================
-- Montana OS · Schema inicial de Supabase
-- Versión: 1.0 · Mayo 2026
-- ============================================================================
-- Ejecutar este script completo en el SQL Editor de Supabase
-- después de crear el proyecto.
-- ============================================================================

-- Extensions necesarias
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- ============================================================================
-- TABLA: users (extensión de auth.users de Supabase)
-- ============================================================================
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text not null,
  phone text,
  avatar_url text,
  role text not null check (role in ('admin', 'broker', 'publisher', 'agent')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_users_role on public.users(role);
create index idx_users_active on public.users(is_active) where is_active = true;

-- ============================================================================
-- TABLA: publication_presets
-- Presets reutilizables que la asistente aplica al publicar
-- ============================================================================
create table public.publication_presets (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  channels text[] not null,
  default_for_operation text check (default_for_operation in ('sale', 'rental', 'both')),
  default_for_price_min bigint,
  default_for_price_max bigint,
  is_active boolean default true,
  created_by uuid references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Seeds iniciales de presets (los configuras al inicializar)
insert into public.publication_presets (name, description, channels, default_for_operation, default_for_price_min, default_for_price_max) values
  ('Premium', 'Para propiedades $20M+ · curaduría exclusiva', 
   array['inmuebles24', 'lamudi', 'easybroker', 'web_montana', 'instagram', 'facebook', 'red_corredores'],
   'sale', 20000000, 100000000),
  ('Cobertura Completa', 'Para propiedades $5M-$20M · máxima exposición',
   array['inmuebles24', 'lamudi', 'vivanuncios', 'easybroker', 'properati', 'proppit', 'trovit', 'mitula', 'nuroa', 'nestoria', 'pincali', 'icasas', 'clasco', 'web_montana', 'instagram', 'facebook'],
   'sale', 5000000, 20000000),
  ('Renta', 'Optimizado para rentas · volumen y velocidad',
   array['inmuebles24', 'lamudi', 'vivanuncios', 'easybroker', 'properati', 'web_montana', 'instagram', 'facebook'],
   'rental', null, null),
  ('Off-Market', 'Listings privados · sin portales públicos',
   array['whatsapp_grupos', 'red_corredores', 'web_montana_privado'],
   'sale', null, null),
  ('Coming Soon', 'Pre-launch · solo redes propias para generar expectativa',
   array['instagram', 'facebook', 'web_montana_privado'],
   'both', null, null);

-- ============================================================================
-- TABLA: properties
-- ============================================================================
create table public.properties (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null, -- MR-2026-0158
  
  -- Captura
  captured_by uuid references public.users(id) not null,
  captured_at timestamptz default now(),
  
  -- Estado del flujo de aprobación
  status text not null default 'draft' check (status in (
    'draft',           -- el asesor aún no termina de subir
    'pending_review',  -- en cola de la asistente
    'rejected',        -- rechazada por la asistente con notas
    'approved',        -- aprobada, lista para publicar
    'published',       -- publicada en al menos 1 canal
    'paused',          -- pausada temporalmente
    'sold',
    'rented',
    'archived'
  )),
  rejection_notes text,
  reviewed_by uuid references public.users(id),
  reviewed_at timestamptz,
  
  -- Datos básicos
  type text not null check (type in ('casa', 'departamento', 'terreno', 'penthouse', 'residencia', 'oficina', 'local', 'bodega', 'edificio')),
  operation text not null check (operation in ('venta', 'renta', 'venta_o_renta')),
  price bigint not null,
  rental_price bigint, -- si operation = venta_o_renta
  currency text default 'MXN' check (currency in ('MXN', 'USD')),
  
  -- Ubicación
  address text not null,
  neighborhood text not null,
  city text default 'Monterrey',
  state text default 'Nuevo León',
  zip_code text,
  geo_lat numeric(10, 8),
  geo_lng numeric(11, 8),
  
  -- Características técnicas
  m2_built numeric(10, 2),
  m2_land numeric(10, 2),
  bedrooms integer,
  bathrooms numeric(3, 1), -- permite medios baños (2.5)
  parking integer,
  levels integer,
  age_years integer,
  
  -- Amenidades (catálogo cerrado)
  amenities text[] default array[]::text[],
  
  -- Estatus legal
  legal_escrituras boolean default false,
  legal_predial_corriente boolean default false,
  legal_libre_gravamen boolean default false,
  legal_notes text,
  
  -- Descripciones
  description_raw text, -- bullets que metió el asesor
  description_final text, -- versión generada por IA y editada por asistente
  description_ig text, -- versión corta para Instagram
  
  -- Sugerencia del asesor sobre canales (opcional, la asistente decide)
  agent_channel_suggestion uuid references public.publication_presets(id),
  
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_properties_status on public.properties(status);
create index idx_properties_captured_by on public.properties(captured_by);
create index idx_properties_operation on public.properties(operation);
create index idx_properties_price on public.properties(price);
create index idx_properties_neighborhood on public.properties(neighborhood);

-- ============================================================================
-- TABLA: property_photos
-- ============================================================================
create table public.property_photos (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade,
  url text not null,
  variant text default 'original' check (variant in ('original', 'web', 'ig_square', 'ig_story', 'whatsapp_card')),
  position integer not null,
  is_cover boolean default false,
  width integer,
  height integer,
  size_bytes bigint,
  created_at timestamptz default now()
);

create index idx_property_photos_property on public.property_photos(property_id, position);
create unique index idx_property_photos_one_cover 
  on public.property_photos(property_id) 
  where is_cover = true;

-- ============================================================================
-- TABLA: property_publications
-- Tracking de en qué canales está publicada cada propiedad
-- ============================================================================
create table public.property_publications (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade,
  channel text not null,
  status text not null default 'queued' check (status in ('queued', 'publishing', 'published', 'error', 'paused', 'removed')),
  external_id text, -- ID que da el portal
  external_url text,
  published_at timestamptz,
  last_synced_at timestamptz,
  error_log text,
  leads_count integer default 0,
  views_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(property_id, channel)
);

create index idx_publications_property on public.property_publications(property_id);
create index idx_publications_channel on public.property_publications(channel);
create index idx_publications_status on public.property_publications(status);

-- ============================================================================
-- TABLA: leads
-- ============================================================================
create table public.leads (
  id uuid default uuid_generate_v4() primary key,
  
  -- De dónde vino
  source_channel text not null, -- 'whatsapp', 'inmuebles24', 'lamudi', 'web', 'instagram', etc.
  source_property_id uuid references public.properties(id), -- si vino interesado en una propiedad específica
  
  -- Datos del lead
  name text,
  phone text,
  email text,
  message text,
  
  -- Calificación por IA
  ai_score text check (ai_score in ('hot', 'warm', 'cold')),
  ai_summary text,
  ai_budget_min bigint,
  ai_budget_max bigint,
  ai_urgency text check (ai_urgency in ('inmediata', 'corta', 'media', 'larga')),
  ai_financing text check (ai_financing in ('cash', 'credito_bancario', 'infonavit', 'fovissste', 'mixto', 'desconocido')),
  
  -- Asignación
  assigned_to uuid references public.users(id),
  assigned_at timestamptz,
  reassigned_count integer default 0,
  
  -- Status
  status text not null default 'new' check (status in (
    'new',         -- recién entró
    'contacted',   -- el asesor ya respondió
    'qualified',   -- pasó cualificación
    'visiting',    -- visita programada o realizada
    'negotiating', -- oferta presentada
    'closed_won',
    'closed_lost'
  )),
  lost_reason text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_leads_assigned on public.leads(assigned_to);
create index idx_leads_status on public.leads(status);
create index idx_leads_property on public.leads(source_property_id);
create index idx_leads_score on public.leads(ai_score);
create index idx_leads_created on public.leads(created_at desc);

-- ============================================================================
-- TABLA: conversations
-- Cada lead tiene una conversación (puede ser multi-canal)
-- ============================================================================
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  lead_id uuid references public.leads(id) on delete cascade,
  channel text not null, -- 'whatsapp', 'email', 'sms'
  external_id text, -- WhatsApp wa_id, etc.
  last_message_at timestamptz,
  unread_count integer default 0,
  created_at timestamptz default now()
);

create index idx_conversations_lead on public.conversations(lead_id);
create index idx_conversations_last_msg on public.conversations(last_message_at desc);

-- ============================================================================
-- TABLA: messages
-- ============================================================================
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  sender_type text not null check (sender_type in ('lead', 'ai', 'agent', 'system')),
  sender_user_id uuid references public.users(id),
  content text,
  attachments jsonb default '[]'::jsonb,
  read_at timestamptz,
  sent_at timestamptz default now()
);

create index idx_messages_conversation on public.messages(conversation_id, sent_at);

-- ============================================================================
-- TABLA: deals
-- Cuando un lead avanza al pipeline serio
-- ============================================================================
create table public.deals (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) not null,
  lead_id uuid references public.leads(id) not null,
  
  -- Roles del deal (split 50/50)
  captador_user_id uuid references public.users(id) not null,
  vendedor_user_id uuid references public.users(id) not null,
  
  -- Pipeline
  stage text not null default 'lead_qualified' check (stage in (
    'lead_qualified',
    'visit_scheduled',
    'visit_done',
    'offer_presented',
    'offer_accepted',
    'in_escrituration',
    'closed_won',
    'closed_lost'
  )),
  
  -- Comisiones
  agreed_price bigint,
  commission_pct numeric(4, 2), -- 5.00, 6.00, 7.00
  gross_commission bigint,
  captador_split bigint, -- siempre 50% del gross
  vendedor_split bigint, -- siempre 50% del gross
  broker_fee bigint default 0,
  
  -- Fechas clave
  closed_at timestamptz,
  expected_close_date date,
  lost_reason text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_deals_stage on public.deals(stage);
create index idx_deals_property on public.deals(property_id);
create index idx_deals_captador on public.deals(captador_user_id);
create index idx_deals_vendedor on public.deals(vendedor_user_id);

-- ============================================================================
-- TABLA: activities
-- Audit log universal: quién hizo qué cuándo
-- ============================================================================
create table public.activities (
  id uuid default uuid_generate_v4() primary key,
  entity_type text not null, -- 'property', 'lead', 'deal', 'user'
  entity_id uuid not null,
  user_id uuid references public.users(id),
  action text not null, -- 'created', 'updated', 'approved', 'rejected', 'reassigned', etc.
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index idx_activities_entity on public.activities(entity_type, entity_id);
create index idx_activities_user on public.activities(user_id);
create index idx_activities_created on public.activities(created_at desc);

-- ============================================================================
-- TABLA: notifications
-- Sistema interno de notificaciones (badge en el CRM)
-- ============================================================================
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  type text not null, -- 'property_rejected', 'lead_assigned', 'deal_closed', etc.
  title text not null,
  body text,
  link text,
  metadata jsonb default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index idx_notifications_user on public.notifications(user_id, read_at, created_at desc);

-- ============================================================================
-- FUNCTIONS · helpers
-- ============================================================================

-- Generar código único MR-YYYY-NNNN
create or replace function generate_property_code()
returns trigger as $$
declare
  next_num integer;
  year_str text;
begin
  if new.code is null then
    year_str := to_char(now(), 'YYYY');
    select coalesce(max(cast(substring(code from 9) as integer)), 0) + 1
    into next_num
    from public.properties
    where code like 'MR-' || year_str || '-%';
    
    new.code := 'MR-' || year_str || '-' || lpad(next_num::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_generate_property_code
  before insert on public.properties
  for each row execute function generate_property_code();

-- Update updated_at automáticamente
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger trg_users_updated_at before update on public.users for each row execute function update_updated_at();
create trigger trg_properties_updated_at before update on public.properties for each row execute function update_updated_at();
create trigger trg_publications_updated_at before update on public.property_publications for each row execute function update_updated_at();
create trigger trg_leads_updated_at before update on public.leads for each row execute function update_updated_at();
create trigger trg_deals_updated_at before update on public.deals for each row execute function update_updated_at();
create trigger trg_presets_updated_at before update on public.publication_presets for each row execute function update_updated_at();

-- Calcular comisión automáticamente al cerrar un deal
create or replace function calculate_commission_split()
returns trigger as $$
begin
  if new.stage = 'closed_won' and new.agreed_price is not null and new.commission_pct is not null then
    new.gross_commission := round(new.agreed_price * new.commission_pct / 100);
    new.captador_split := round(new.gross_commission * 0.5);
    new.vendedor_split := new.gross_commission - new.captador_split;
    if new.closed_at is null then
      new.closed_at := now();
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_calculate_commission
  before update on public.deals
  for each row execute function calculate_commission_split();

-- ============================================================================
-- ROW LEVEL SECURITY · básico para MVP
-- En SaaS multi-tenant esto se vuelve más complejo
-- ============================================================================

alter table public.users enable row level security;
alter table public.properties enable row level security;
alter table public.property_photos enable row level security;
alter table public.property_publications enable row level security;
alter table public.publication_presets enable row level security;
alter table public.leads enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.deals enable row level security;
alter table public.activities enable row level security;
alter table public.notifications enable row level security;

-- Por ahora, todos los usuarios autenticados pueden leer todo (es Montana, equipo chico)
-- En SaaS esto se restringe por organization_id
create policy "Authenticated users read all" on public.users for select using (auth.role() = 'authenticated');
create policy "Authenticated users read all" on public.properties for select using (auth.role() = 'authenticated');
create policy "Authenticated users read all" on public.property_photos for select using (auth.role() = 'authenticated');
create policy "Authenticated users read all" on public.property_publications for select using (auth.role() = 'authenticated');
create policy "Authenticated users read all" on public.publication_presets for select using (auth.role() = 'authenticated');
create policy "Authenticated users read all" on public.leads for select using (auth.role() = 'authenticated');
create policy "Authenticated users read all" on public.conversations for select using (auth.role() = 'authenticated');
create policy "Authenticated users read all" on public.messages for select using (auth.role() = 'authenticated');
create policy "Authenticated users read all" on public.deals for select using (auth.role() = 'authenticated');
create policy "Authenticated users read all" on public.activities for select using (auth.role() = 'authenticated');

-- Notificaciones solo el dueño las ve
create policy "Users see own notifications" on public.notifications for select using (auth.uid() = user_id);

-- Asesores pueden crear sus propias propiedades
create policy "Agents create properties" on public.properties for insert 
  with check (auth.uid() = captured_by);

-- Asesores actualizan sus propiedades en draft o rejected
create policy "Agents update own draft properties" on public.properties for update 
  using (auth.uid() = captured_by and status in ('draft', 'rejected'));

-- Publishers (asistente) y admins pueden actualizar cualquier propiedad
create policy "Publishers update any property" on public.properties for update 
  using (exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'broker', 'publisher')));

-- ============================================================================
-- FIN DEL SCHEMA
-- ============================================================================
-- Próximos pasos:
-- 1. Crear el proyecto en Supabase
-- 2. Copiar este SQL completo en SQL Editor y ejecutar
-- 3. Crear los 13 asesores + 1 asistente + 1 admin (tú) desde Authentication
-- 4. Insertar registros en public.users con los roles correctos
-- ============================================================================
