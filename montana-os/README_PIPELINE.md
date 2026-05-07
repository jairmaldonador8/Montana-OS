# Montana OS Pipeline

## Overview

Montana OS Pipeline is a **real-time sales pipeline management system** designed for high-velocity real estate operations. It provides a unified interface for tracking leads through multiple stages, from initial interest to deal closure.

The system integrates three critical pipelines:
- **Sales Pipeline** — Tracking leads from initial contact through sale closure
- **Property Pipeline** — Managing inventory and performance metrics per property  
- **Deal Pipeline** — Detailed transaction tracking with activities and audit trails

### Key Characteristics
- **Speed-first UX** — Designed to prevent lead cooling with instant visibility
- **Real-time collaboration** — Multi-user pipeline updates with Supabase realtime
- **Role-based access** — RLS policies enforce permissions at database level
- **Intuitive kanban** — Drag-and-drop lead management with visual age indicators
- **Deep analytics** — KPIs, funnel analysis, and performance tracking

---

## Features

### Core Features

**Kanban Board**
- 7-stage lead status columns (Lead Nuevo → Cerrado)
- Drag-and-drop lead movement with real-time sync
- Visual lead age indicators (green < 1 day, yellow 1-4 days, red 4+ days)
- Click card to open detailed lead sidebar with full history
- Column headers show live lead count

**Real-time Updates**
- Supabase realtime subscriptions for instant multi-user sync
- No polling required — changes appear immediately
- RLS policies ensure users only see authorized data
- Activity timeline updates live as team collaborates

**Lead Management**
- Create leads from forms, WhatsApp, or Facebook Lead Ads
- Track lead contact info (email, phone, WhatsApp)
- Log activities: status changes, calls, messages, notes
- Full audit trail with timestamps and user attribution
- Reassign leads between team members (for team leads/admins)

**Dashboard Analytics**
- KPI cards: Active leads, conversion rate, cycle time, revenue pipeline
- Risk alerts: Leads with no activity for 7+ days
- Top agents leaderboard by closes and revenue
- Conversion funnel visualization
- Performance trends (daily/weekly/monthly)

**Multi-view Interface**
- **Kanban view** — Primary visual pipeline management
- **Table view** — Grid-based leads with filtering and search (coming soon)
- **Funnel view** — Drop-off analysis by stage (coming soon)
- **Analytics view** — Deep KPI and performance analysis

**Webhooks & Integrations**
- **WhatsApp Business API** — Incoming messages create/update leads automatically
- **Facebook Lead Ads** — Lead form submissions integrated into pipeline
- **Landing Page Forms** — Custom web form integration
- Signature verification and idempotency protection for all webhooks

**Permissions & Roles**

| Action | Agent | Team Lead | Admin |
|--------|-------|-----------|-------|
| View own leads | ✅ | ✅ | ✅ |
| View team leads | ❌ | ✅ | ✅ |
| Update own leads | ✅ | ✅ | ✅ |
| Reassign leads | ❌ | ✅ | ✅ |
| View analytics | ❌ | ✅ | ✅ |
| Delete leads | ❌ | ❌ | ✅ |

---

## Architecture Summary

### High-Level Design

```
Frontend (Next.js + React)
  ├── Kanban Board (drag-drop with hello-pangea/dnd)
  ├── Table View (searchable grid with filters)
  ├── Analytics Dashboard (KPI cards + charts)
  └── Lead Sidebar (full details + activity timeline)
         ↓
  API Layer (Next.js API Routes)
  ├── /api/pipeline/leads (CRUD)
  ├── /api/pipeline/analytics (KPIs)
  ├── /api/pipeline/activities (audit trail)
  └── /api/webhooks/{whatsapp,facebook} (integrations)
         ↓
  Supabase (Database + Realtime + Auth)
  ├── PostgreSQL (leads, lead_activities, propiedades tables)
  ├── RLS Policies (row-level authorization)
  ├── Realtime Subscriptions (WebSocket sync)
  └── Auth (user management + roles)
         ↓
  External Integrations
  ├── WhatsApp Business API (lead creation)
  ├── Facebook Lead Ads (lead import)
  └── Landing Pages (form submissions)
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, React 18, TailwindCSS | Modern SSR framework with server components |
| **State** | React hooks + Context | Component and real-time state |
| **Drag-Drop** | @hello-pangea/dnd | Accessible kanban implementation |
| **Charts** | Recharts | Responsive analytics visualizations |
| **Database** | Supabase (PostgreSQL) | Primary data store with RLS |
| **Realtime** | Supabase Realtime | Live updates via WebSocket |
| **API** | Next.js API Routes | RESTful backend for CRUD and webhooks |
| **Auth** | Supabase Auth | User identity and role-based access |
| **Validation** | Zod | Type-safe request validation |
| **Testing** | Vitest | Unit and integration tests |

### Database Schema

**Tables:**
- `leads` — Core pipeline data with 7-stage status and computed fields
- `lead_activities` — Audit trail of all changes (status, messages, notes, calls)
- `propiedades` — Properties (reused from properties module)
- `usuarios` — Users with roles (agent, team_lead, admin)

**Key Indexes:**
- `leads(status)` — Filter by pipeline stage
- `leads(assigned_to)` — Filter by agent
- `leads(created_at DESC)` — Sort by recency
- `leads(dias_en_pipeline DESC)` — Identify at-risk leads
- `lead_activities(lead_id)` — Activity timeline queries
- `lead_activities(external_id)` — Webhook idempotency

See `docs/ultrapowers/specs/2026-05-07-montana-os-pipeline-design.md` for full spec.

---

## Development Setup

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase CLI (optional, for migrations)
- Git

### Installation

```bash
# Clone and navigate to project
cd montana-os

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
supabase migration up

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Project Structure

```
src/
├── app/
│   ├── (dashboard)/pipeline/
│   │   └── page.tsx                 # Main pipeline page
│   └── api/pipeline/
│       ├── leads/route.ts           # GET/POST leads
│       ├── leads/[id]/route.ts      # GET/PUT/DELETE single lead
│       ├── analytics/route.ts       # Dashboard KPIs
│       └── webhooks/
│           ├── whatsapp/route.ts    # WhatsApp integration
│           └── facebook/route.ts    # Facebook Lead Ads
│
├── components/pipeline/
│   ├── kanban/
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   ├── LeadCard.tsx
│   │   └── LeadSidebar.tsx
│   ├── dashboard/
│   │   ├── PipelineDashboard.tsx
│   │   ├── MetricCard.tsx
│   │   └── TrendsChart.tsx
│   └── table/
│       └── LeadsTable.tsx
│
├── hooks/
│   ├── usePipelineLeads.ts          # Real-time leads subscription
│   ├── usePipelineAnalytics.ts      # Analytics data hook
│   └── useDragDrop.ts               # Drag-drop logic
│
├── lib/pipeline/
│   ├── leads.ts                     # Lead CRUD helpers
│   ├── queries.ts                   # Analytics queries
│   └── webhooks.ts                  # Webhook utilities
│
├── lib/validators/
│   └── pipeline.ts                  # Zod schemas
│
└── types/
    └── pipeline.ts                  # TypeScript types
```

---

## Environment Variables

### Required for Pipeline

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# WhatsApp Business API
WHATSAPP_WEBHOOK_TOKEN=your_webhook_signing_token
WHATSAPP_VERIFY_TOKEN=your_webhook_verification_token

# Facebook Lead Ads (optional, for future integration)
FACEBOOK_LEAD_WEBHOOK_TOKEN=your_facebook_token

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Webhook Token Setup

**WhatsApp Business API:**
1. Go to your WhatsApp Business App dashboard
2. Navigate to Webhooks → Verify Token
3. Generate a secure random token (save as `WHATSAPP_VERIFY_TOKEN`)
4. Click "Show" to reveal the App Secret
5. Create HMAC-SHA256 hash of requests (saved as `WHATSAPP_WEBHOOK_TOKEN`)

**Facebook Lead Ads:**
1. In your Facebook App, navigate to Webhooks
2. Generate a token for Lead Ads subscriptions
3. Save as `FACEBOOK_LEAD_WEBHOOK_TOKEN`

---

## Running Tests

### Unit & Integration Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- src/__tests__/api/pipeline/leads.test.ts

# Watch mode (auto-rerun on file changes)
npm run test -- --watch

# Coverage report
npm run test -- --coverage
```

### Test Files

- `src/__tests__/api/pipeline/leads.test.ts` — Lead CRUD endpoints
- `src/__tests__/api/pipeline/analytics.test.ts` — Analytics calculations
- `src/__tests__/api/pipeline/webhooks.test.ts` — Webhook signature verification
- `src/__tests__/components/KanbanBoard.test.tsx` — Kanban interactions
- `src/__tests__/hooks/usePipelineLeads.test.ts` — Real-time subscription logic

### E2E Testing (Manual)

```bash
# Start dev server
npm run dev

# In another terminal, test workflow:
1. Login as agent
2. Navigate to /pipeline
3. See kanban with sample leads
4. Drag lead to "Interesado"
5. Verify status change propagates instantly
6. Click lead card → sidebar appears
7. Switch to Analytics tab
8. Verify KPIs load and update

# Test webhook locally:
curl -X POST http://localhost:3000/api/webhooks/whatsapp \
  -H "x-hub-signature-256: sha256=<signature>" \
  -H "Content-Type: application/json" \
  -d '{"entry":[{"changes":[{"value":{"messages":[{"id":"msg_123","from":"1234567890","text":{"body":"Hola"}}]}}]}]}'
```

---

## Deployment

### Database Migrations

Migrations are automatically applied when deploying via Supabase CI/CD:

```bash
# Local development
supabase migration up

# On Vercel deployment
# - Supabase integrations automatically run migrations
# - Or manually run: supabase migration up in production
```

### Deployment Steps

**1. Vercel Deployment**
```bash
# Push to main (if using CD)
git push origin main

# Or deploy manually
vercel
```

**2. Environment Variables on Vercel**
- Add all `.env.local` variables to Vercel project settings
- Ensure webhook URLs point to production domain

**3. Webhook Configuration**
- Update WhatsApp webhook URL to `https://your-domain/api/webhooks/whatsapp`
- Update Facebook webhook URL to `https://your-domain/api/webhooks/facebook`
- Verify tokens match environment variables

**4. Real-time Subscriptions**
- Supabase realtime is managed service — no configuration needed
- Auto-scales based on connection count

**5. Monitoring**
- Monitor Supabase dashboard for database performance
- Check Vercel analytics for API response times
- Track webhook delivery via provider dashboards

---

## API Reference

### Leads Endpoints

**GET /api/pipeline/leads**
- Query params: `status`, `assigned_to`, `limit`, `offset`, `search`
- Response: Array of leads with pagination info
- Auth: Required

**POST /api/pipeline/leads**
- Body: `{ property_id, nombre, email?, whatsapp?, fuente?, notas? }`
- Response: Created lead object
- Auth: Required

**GET /api/pipeline/leads/:id**
- Response: Single lead with full activity timeline
- Auth: Required

**PUT /api/pipeline/leads/:id**
- Body: `{ status, notes? }`
- Response: Updated lead object
- Creates lead_activity entry automatically
- Auth: Required

**DELETE /api/pipeline/leads/:id**
- Auth: Admin only

### Analytics Endpoints

**GET /api/pipeline/analytics**
- Response: KPI object (total_leads, conversion_rate, cycle_time, etc.)
- Query params: `date_from`, `date_to`, `assigned_to`
- Auth: Team lead/Admin only

### Webhook Endpoints

**POST /api/webhooks/whatsapp**
- Signature verification required
- Creates lead_activities entries
- Idempotency key: `external_id`

**POST /api/webhooks/facebook**
- Creates new leads from form submissions
- Auto-assigns to available agent

---

## Future Enhancements

### Short-term (Next Sprint)
- [ ] Table view with advanced filtering and search
- [ ] Funnel visualization with drop-off analysis
- [ ] Facebook Lead Ads webhook implementation
- [ ] Lead bulk assignment and import
- [ ] Custom fields per property type

### Medium-term (Q3 2026)
- [ ] AI lead scoring (predict close probability)
- [ ] Automated follow-up reminders
- [ ] Document management (contracts, inspections)
- [ ] SMS notifications for team leads
- [ ] Email campaign integration

### Long-term (Q4 2026+)
- [ ] Mobile app for field agents
- [ ] Integration with property management systems
- [ ] Advanced reporting with custom date ranges
- [ ] Lead source attribution and ROI tracking
- [ ] Predictive analytics (seasonal trends, market insights)

---

## Success Metrics

1. **Speed**: First lead view < 2 seconds
2. **Adoption**: 95%+ of team using pipeline daily
3. **Conversion**: Track improvement in close rate over time
4. **Engagement**: Real-time updates reduce "missed lead" incidents by 90%
5. **Efficiency**: Team lead spend < 5 min/day on analytics vs. 30 min with spreadsheets

---

## Troubleshooting

### Real-time Subscriptions Not Updating

**Problem**: Lead status changes don't appear instantly

**Solution**:
1. Check Supabase realtime is enabled: `Supabase Dashboard → Replication → Turn on`
2. Verify RLS policies allow user to see leads
3. Check browser console for WebSocket errors
4. Restart dev server: `Ctrl+C` then `npm run dev`

### Webhook Signature Verification Fails

**Problem**: `Invalid signature` error when receiving webhooks

**Solution**:
1. Verify `WHATSAPP_WEBHOOK_TOKEN` matches provider
2. Check signature header format: `x-hub-signature-256: sha256=<hex>`
3. Ensure token is URL-encoded correctly
4. Test locally with ngrok: `ngrok http 3000`

### Analytics Endpoint Slow

**Problem**: Dashboard metrics take >5 seconds to load

**Solution**:
1. Check database indexes exist: `CREATE INDEX idx_leads_status ON leads(status)`
2. Verify data volume (pagination helps: limit=50)
3. Cache analytics: refresh every 5 minutes instead of on each load
4. Consider materialized views for complex aggregations

### Leads Not Creating from WhatsApp

**Problem**: WhatsApp messages don't create leads

**Solution**:
1. Verify webhook URL is correct in WhatsApp settings
2. Check `WHATSAPP_VERIFY_TOKEN` in environment
3. Ensure `property_id` is provided (currently hardcoded in webhook)
4. Check Supabase logs for insert errors
5. Verify RLS policies allow webhook service account to insert

---

## Additional Resources

- **Design Spec**: `docs/ultrapowers/specs/2026-05-07-montana-os-pipeline-design.md`
- **Implementation Plan**: `docs/ultrapowers/plans/2026-05-07-montana-os-pipeline-implementation.md`
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **hello-pangea/dnd Docs**: https://github.com/hello-pangea/dnd

---

**Last Updated**: 2026-05-07  
**Status**: Production Ready  
**Maintainer**: Montana OS Team
