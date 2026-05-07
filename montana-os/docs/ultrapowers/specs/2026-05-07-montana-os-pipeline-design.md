# Montana OS Pipeline - Design Specification

**Date:** 2026-05-07  
**Author:** Claude Code + Jair Maldonador  
**Status:** Approved for Implementation  
**Vision:** The next unicorn CRM for real estate — unified pipeline management combining sales, property, and deal pipelines into one professional platform.

---

## 1. OVERVIEW

Montana OS Pipeline is a real-time, unified lead and deal management system designed for high-velocity real estate operations. It integrates three critical pipelines:

1. **Sales Pipeline** — Tracking leads from initial interest through sale closure
2. **Property Pipeline** — Managing inventory and performance metrics per property
3. **Deal Pipeline** — Detailed transaction tracking with documents, inspections, financing

The system prioritizes **speed** and **intuitive UX** to prevent lead cooling, while providing deep analytics for strategic decision-making.

---

## 2. ARCHITECTURE

### 2.1 High-Level Design

```
Frontend (Next.js + React)
  ├── Kanban Board (Primary view)
  ├── Grid/Table (Search & filters)
  └── Funnel Analytics (Drop-off analysis)
         ↓
  API Layer (Next.js API Routes)
         ↓
  Supabase (Database + Realtime + RLS)
         ↓
  External Integrations
  ├── WhatsApp Business API (Lead creation)
  ├── Facebook Lead Ads (Lead import)
  └── Landing Pages (Form submissions)
```

### 2.2 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14, React 18, TailwindCSS | UI/UX with server components |
| State | React hooks + Context/Zustand | Component state management |
| Database | Supabase (PostgreSQL) | Primary data store with RLS |
| Realtime | Supabase Realtime | Live updates across users |
| API | Next.js API Routes | RESTful backend |
| Auth | Supabase Auth | Role-based access control |
| Webhooks | Next.js API Routes | WhatsApp & Facebook integration |

---

## 3. DATA MODEL

### 3.1 Database Tables

#### `leads` (Core pipeline table)

```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES usuarios(id),
  
  -- Lead status (7 states)
  status TEXT NOT NULL CHECK (status IN (
    'lead_nuevo',
    'interesado',
    'pendiente_respuesta',
    'en_visita',
    'propuesta_enviada',
    'cerrado',
    'no_interesado'
  )),
  
  -- Lead information
  nombre TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  fuente TEXT, -- 'form', 'whatsapp_directo', 'facebook', 'landing_page'
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_contact TIMESTAMP WITH TIME ZONE,
  
  -- Computed fields
  dias_en_pipeline INT GENERATED ALWAYS AS (
    EXTRACT(DAY FROM now() - created_at)
  ) STORED,
  
  -- Metadata
  created_by UUID REFERENCES usuarios(id),
  notas TEXT,
  
  -- RLS field
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'
);

-- Indexes
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_property_id ON leads(property_id);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_last_contact ON leads(last_contact DESC);
CREATE INDEX idx_leads_dias_en_pipeline ON leads(dias_en_pipeline DESC);
```

#### `lead_activities` (Audit trail + timeline)

```sql
CREATE TABLE lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'status_change', 'whatsapp_msg', 'call', 'email', 'note'
  description TEXT,
  
  -- For tracking changes
  old_value TEXT,
  new_value TEXT,
  
  created_by UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_created_at ON lead_activities(created_at DESC);
```

#### `propiedades` (Properties)

```sql
CREATE TABLE propiedades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(15,2),
  ubicacion TEXT,
  fotos_urls TEXT[],
  caracteristicas JSONB, -- { m2, habitaciones, garajes, etc }
  
  created_by UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Metrics
  total_leads INT DEFAULT 0,
  cerrados INT DEFAULT 0,
  conversion_rate DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_leads = 0 THEN 0
    ELSE ROUND((cerrados::DECIMAL / total_leads) * 100, 2) END
  ) STORED
);

CREATE INDEX idx_propiedades_created_by ON propiedades(created_by);
```

### 3.2 RLS (Row Level Security) Policies

```sql
-- leads: Agents see only their assigned leads; team leads see their team; admins see all
CREATE POLICY "agents_see_own_leads" ON leads
  FOR SELECT
  USING (
    assigned_to = auth.uid() 
    OR (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('team_lead', 'admin')
  );

CREATE POLICY "agents_update_own_leads" ON leads
  FOR UPDATE
  USING (assigned_to = auth.uid() OR (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('team_lead', 'admin'));

-- lead_activities: Read access follows lead access
CREATE POLICY "read_lead_activities" ON lead_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leads l
      WHERE l.id = lead_activities.lead_id
      AND (l.assigned_to = auth.uid() OR (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('team_lead', 'admin'))
    )
  );
```

---

## 4. FRONTEND COMPONENTS

### 4.1 Pipeline Page Layout

**Primary View: Kanban Board**
- 7 columns (one per status)
- Lead cards draggable between columns
- Card color-coded by lead age: green (fresh) → yellow (4+ days) → red (7+ days)
- Click card → Open sidebar with full lead details
- Header shows count per column with real-time updates

**Secondary Views (Tabs)**
- **Table:** Searchable grid with columns (Nombre, Propiedad, Status, Asesor, Última actividad, Días, Acciones)
- **Funnel:** Visualization of conversion at each stage with drop-off percentages

**Sidebar (Lead Details)**
- Lead info: Name, email, WhatsApp, property
- Assigned to: Current asesor (clickable to reassign if team lead/admin)
- Status dropdown (if permission allows)
- Activity timeline (chronological feed of all interactions)
- Action buttons: Send WhatsApp, log call, send email, add note, delete

### 4.2 Dashboard Metrics

**Top Section (6 KPI cards)**
1. Leads Activos — Total active leads
2. Conversion % — (Cerrados / Total) × 100
3. Cycle Time — Average days from Nuevo to Cerrado
4. Revenue Pipeline — Sum of property prices for active leads
5. Leads en Riesgo — Leads with no activity for 7+ days (red badge)
6. Top 3 Agentes — Ranked by closes this week

**Middle Section (Funnel Chart)**
Visualization of conversion funnel with percentages at each stage

**Bottom Section (Trends)**
- Line chart: Leads created vs. closed over time (weekly/monthly)
- Quick insights: "You're 15% above target this month"

### 4.3 Detailed Reports (Expandable sections)

1. **Performance por Agente**
   - Columns: Agente | Asignados | Cerrados | % Conv | Cycle Time | Revenue
   - Sortable, filterable

2. **Performance por Propiedad**
   - Columns: Propiedad | Precio | Leads | Cerrados | % Conv
   - Identifies high-performer and underperformer properties

3. **Drop-off Analysis**
   - Shows where leads exit: "30% of Interesados don't reach Pendiente Respuesta"
   - Actionable: "Avg response time is 8h. Reduce to 4h?"

4. **Trends Semanales/Mensuales**
   - Line/bar charts showing lead volume, closes, conversion over time

5. **Custom Filters**
   - By date range, agente, propiedad, fuente (WhatsApp, form, Facebook)
   - Apply filters across all views

---

## 5. API SPECIFICATION

### 5.1 Leads Endpoints

#### `GET /api/pipeline/leads`
**Query params:**
- `status` (optional): Filter by status
- `assigned_to` (optional): Filter by asesor UUID
- `property_id` (optional): Filter by property
- `limit` (default 50): Pagination limit
- `offset` (default 0): Pagination offset
- `search` (optional): Search by lead name

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "whatsapp": "+34612345678",
      "status": "interesado",
      "assigned_to": "uuid",
      "property_id": "uuid",
      "property": { "titulo": "Apt 3B", "precio": 150000 },
      "last_contact": "2026-05-06T14:30:00Z",
      "created_at": "2026-05-05T10:00:00Z",
      "dias_en_pipeline": 2
    }
  ],
  "total": 69,
  "page": 1
}
```

#### `POST /api/pipeline/leads/:id/status`
**Body:**
```json
{
  "new_status": "en_visita",
  "notes": "Cliente confirmó visita para el 10/5"
}
```

**Response:** Updated lead object + creates entry in lead_activities table

#### `GET /api/pipeline/leads/:id`
**Response:** Complete lead object + full activity timeline

#### `POST /api/pipeline/leads/:id/activities`
**Body:**
```json
{
  "activity_type": "whatsapp_msg",
  "description": "Cliente preguntó por condiciones de financiamiento"
}
```

### 5.2 Analytics Endpoints

#### `GET /api/pipeline/analytics`
**Query params:**
- `date_from` (optional): ISO date
- `date_to` (optional): ISO date
- `assigned_to` (optional): Filter by agente

**Response:**
```json
{
  "total_leads": 69,
  "leads_by_status": {
    "lead_nuevo": 12,
    "interesado": 8,
    "pendiente_respuesta": 5,
    "en_visita": 3,
    "propuesta_enviada": 4,
    "cerrado": 18,
    "no_interesado": 19
  },
  "conversion_rate": 26.1,
  "avg_cycle_time": 8.3,
  "leads_at_risk": 5,
  "revenue_pipeline": 1250000,
  "leads_by_source": {
    "whatsapp_directo": 20,
    "form": 30,
    "facebook": 19
  },
  "top_agents": [
    { "id": "uuid", "nombre": "Carlos M.", "closes": 8, "revenue": 480000 },
    { "id": "uuid", "nombre": "Sofia R.", "closes": 6, "revenue": 320000 },
    { "id": "uuid", "nombre": "David L.", "closes": 4, "revenue": 280000 }
  ]
}
```

#### `GET /api/pipeline/analytics/funnel`
Returns conversion data per stage for funnel visualization

#### `GET /api/pipeline/analytics/trends`
**Query params:** `interval` (daily|weekly|monthly), `metric` (leads_created|closes|conversion)

---

## 6. REAL-TIME UPDATES (Supabase Realtime)

### 6.1 Frontend Subscription

```typescript
// Subscribe to lead changes
const channel = supabase
  .channel('pipeline-leads')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'leads'
    },
    (payload) => {
      // Lead updated → Refresh Kanban
      updateLeadInUI(payload.new);
    }
  )
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'lead_activities'
    },
    (payload) => {
      // New activity → Update sidebar timeline
      addActivityToTimeline(payload.new);
    }
  )
  .subscribe();
```

### 6.2 Realtime Behavior

- When an agent moves a lead (status change), **all users see the update instantly**
- No polling, no stale data
- RLS filters apply: Users only see updates for leads they have access to
- Activity feed updates in real-time for open sidebars

---

## 7. WEBHOOKS & INTEGRATIONS

### 7.1 WhatsApp Business API Webhook

**Endpoint:** `POST /api/webhooks/whatsapp`

**Incoming payload:**
```json
{
  "from": "+34612345678",
  "message": "Hola, sigo interesado en el departamento",
  "timestamp": "2026-05-07T15:30:00Z",
  "message_id": "wamid.xxx"
}
```

**Logic:**
1. Check if WhatsApp number exists in leads table
2. If yes: Create lead_activity entry (tipo: whatsapp_msg)
3. If no: Create new lead with fuente: 'whatsapp_directo', status: 'lead_nuevo'
4. Assign to team lead or round-robin available agente
5. Send confirmation response to WhatsApp

### 7.2 Facebook Lead Ads Webhook

**Endpoint:** `POST /api/webhooks/facebook`

**Incoming payload:**
```json
{
  "lead_id": "facebook_id",
  "form_data": {
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "telefono": "+34612345678",
    "propiedad_interes": "Apt 3B"
  },
  "timestamp": "2026-05-07T15:30:00Z"
}
```

**Logic:**
1. Match property by name/ID
2. Create new lead with fuente: 'facebook'
3. Assign to available agente
4. Send welcome WhatsApp (if phone provided)

### 7.3 Landing Page Form Webhook

**Endpoint:** `POST /api/webhooks/landing-page`

Similar logic to Facebook: Create lead, assign asesor, trigger welcome message.

---

## 8. PERMISSIONS & ROLES

### 8.1 Role Matrix

| Action | Agent | Team Lead | Admin | Marketing |
|--------|-------|-----------|-------|-----------|
| View own leads | ✅ | ✅ | ✅ | ❌ |
| View team leads | ❌ | ✅ | ✅ | ❌ |
| Update own leads | ✅ | ✅ | ✅ | ❌ |
| Reassign leads | ❌ | ✅ | ✅ | ❌ |
| View all analytics | ❌ | ✅ | ✅ | ❌ |
| Upload properties | ❌ | ❌ | ✅ | ✅ |
| Configure Facebook ads | ❌ | ❌ | ✅ | ✅ |
| View landing page stats | ❌ | ❌ | ✅ | ✅ |
| Delete leads | ❌ | ❌ | ✅ | ❌ |

### 8.2 Implementation

Permissions enforced via:
1. **Frontend:** Conditional rendering based on user.rol
2. **API:** Row-level checks before returning/modifying data
3. **Database:** RLS policies prevent unauthorized data access

---

## 9. ERROR HANDLING & EDGE CASES

| Scenario | Behavior |
|----------|----------|
| Lead moved to same status | No-op, no activity logged |
| Reassign lead to invalid agente | API returns 400, validation error |
| Webhook from unknown WhatsApp | Create new lead, start onboarding flow |
| Realtime subscription drops | Auto-reconnect with exponential backoff |
| Concurrent status updates | Last write wins (timestamp-based) |
| Deleted asesor with assigned leads | Reassign to team lead, notify admin |

---

## 10. TESTING STRATEGY

### 10.1 Unit Tests
- API routes: Input validation, business logic
- Utils: Lead status transitions, analytics calculations
- Components: Kanban drag-drop, filters, sidebar

### 10.2 Integration Tests
- Webhook → Database flow
- Real-time subscription → UI update
- RLS policies: Verify users only see their data

### 10.3 E2E Tests
- Agent flow: Create lead → Move through pipeline → Close
- Team lead flow: View team, reassign, see analytics
- Admin flow: Full access, analytics, reports

---

## 11. PERFORMANCE CONSIDERATIONS

1. **Database:** Indexed on status, assigned_to, created_at for fast queries
2. **Real-time:** Supabase limits subscriptions to ~100 connections/client—monitor and scale
3. **API:** Pagination (50 leads per request) prevents large data transfers
4. **Frontend:** Virtual scrolling for large Kanban boards (100+ leads)
5. **Analytics:** Cache KPI calculations (refresh every 5 min) to avoid expensive aggregations

---

## 12. FUTURE ENHANCEMENTS

- Document management (contracts, inspection reports)
- Automated reminders (follow-up after X days no contact)
- AI-powered lead scoring (predict close probability)
- Integration with property management systems
- Mobile app for field agents
- SMS notifications for team leads
- Custom fields per property type

---

## 13. SUCCESS METRICS

1. **Speed:** First lead view < 2 seconds
2. **Adoption:** 95%+ of team using pipeline daily
3. **Conversion:** Track improvement in close rate over time
4. **Engagement:** Real-time updates reduce "missed lead" incidents by 90%
5. **Insights:** Team lead spend < 5 min/day on analytics vs. 30 min with spreadsheets

---

**Approval:** User approved on 2026-05-07. Ready for deep-research phase.
