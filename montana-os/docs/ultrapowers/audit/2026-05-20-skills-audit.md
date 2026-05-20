# Skills Audit Report — Montana OS CRM

**Date:** 2026-05-20  
**Project:** Montana OS CRM Redesign  
**Stack:** TypeScript + React 19 + Next.js 15 + Supabase + Tailwind v4 + shadcn/ui + Motion

---

## PART 1: LANGUAGE & FOUNDATIONAL SKILLS

### Language: TypeScript

| Language | Status | Skill | Notes |
|----------|--------|-------|-------|
| TypeScript | **COVERED** | `typescript-best-practices` | Type safety, generics, interfaces, project structure. Assume covered via React/Next.js training. |

---

### Category Skills (Language-Agnostic)

| Category | Required? | Status | Notes | Action |
|----------|-----------|--------|-------|--------|
| Testing / TDD | ✅ Yes | EXTERNAL | Industry standard. Covered by installed plugins or ecosystem knowledge. | Use in plan |
| Error handling | ✅ Yes | **MISSING** | Need custom error boundaries, Try/Catch patterns in async operations | CREATE |
| Design patterns | ✅ Yes | EXTERNAL | SOLID principles, component composition. Standard React patterns. | Use in plan |
| Architecture | ✅ Yes | EXTERNAL | Next.js App Router, client/server components, API routes. | Use in plan |
| Database | ✅ Yes | **MISSING** | Supabase-specific schema design, migrations, row-level security, triggers | CREATE or REFERENCE |
| API design | ✅ Yes | EXTERNAL | REST conventions, pagination, error responses. Standard. | Use in plan |
| Observability | ✅ Yes | **MISSING** | Structured logging, error tracking, performance monitoring | CREATE |
| Resilience | ✅ Yes | **MISSING** | Retries for API calls (WhatsApp, Calendar, Email), timeouts, graceful degradation | CREATE or INLINE |
| Security / Auth | ✅ Yes | **CRITICAL GAP** | Role-based access control (RBAC), Supabase Auth with custom roles, JWT, row-level security (RLS) | CREATE |
| Background jobs | ✅ Yes | **CRITICAL GAP** | Task scheduling, cron jobs (automations, reminders), idempotency | CREATE |
| Caching | ❓ Maybe | EXTERNAL | For reportes/analytics queries. Can defer to implementation. | Reference if needed |
| CI/CD | ❌ No | N/A | Vercel handles deployment; not critical for dev | N/A |
| RAG/AI | ❌ No | N/A | Future enhancement, not MVP | N/A |

---

## PART 2: DOMAIN COMPETENCIES

From research brief + spec, these are the domain-specific capabilities needed:

### Domain Competencies List

| Competency | Category | Priority | Status | Notes |
|------------|----------|----------|--------|-------|
| **React Role-Based Dashboard Pattern** | Frontend Architecture | CRITICAL | **MISSING** | 3 different dashboard views (Admin, Asesor, Coordinador) with conditional rendering + layout structure. |
| **React Kanban Pipeline Component** | Frontend Components | CRITICAL | **MISSING** | Drag-drop pipeline with 7 stages, real-time updates, card management. |
| **Next.js RBAC Middleware** | Backend/Security | CRITICAL | **MISSING** | Protect routes by role using Next.js middleware + Supabase RLS. |
| **Supabase Auth with Custom Roles** | Database/Auth | CRITICAL | **CRITICAL GAP** | Configure Supabase with custom roles (admin, asesor, coordinador), JWT claims, RLS policies. |
| **Supabase Row-Level Security (RLS)** | Database/Security | CRITICAL | **MISSING** | Asesor can only see their own leads; Manager sees all; Coordinador sees specific subset. |
| **Lead Ingestion System** | Backend/Integration | CRITICAL | **MISSING** | Accept leads from 3 sources: manual form, web form, CSV upload. Validate, deduplicate, assign. |
| **Task Automation Engine** | Backend/Async | CRITICAL | **CRITICAL GAP** | Create tasks, schedule reminders, escalations based on lead stage + time elapsed. |
| **Cron/Scheduled Jobs** | Backend/Async | CRITICAL | **CRITICAL GAP** | Run daily/hourly jobs: check for overdue leads, send reminders, escalate to manager. |
| **Real-Time Notifications** | Frontend/Backend | HIGH | **MISSING** | Notify asesor instantly when new lead arrives (WebSocket or polling). |
| **WhatsApp API Integration** | External Integration | HIGH | **MISSING** | Send messages via WhatsApp Business API, sync conversation history. |
| **Google Calendar API Integration** | External Integration | HIGH | **MISSING** | Sync appointments bidirectionally, send reminders. |
| **Email Integration** | External Integration | HIGH | **MISSING** | Send transactional emails, sync with lead history. |
| **CSV Lead Upload** | Backend/File Handling | MEDIUM | **MISSING** | Parse CSV, validate data, batch insert, handle duplicates. |
| **Analytics & Reportes Queries** | Database | MEDIUM | **MISSING** | Complex SQL queries for manager dashboard (conversion rate by etapa, by asesor, trends). |
| **Responsive Design System** | Frontend/Design | MEDIUM | **COVERED** | Montana OS design system already built (cards, buttons, colors, Tailwind). Use as-is. |

---

## PART 3: COVERAGE SUMMARY

### Category Skills Summary
- ✅ **Covered / External:** 6 categories (Testing, Design Patterns, Architecture, API Design, Caching, CI/CD)
- ❌ **Missing / Gaps:** 8 categories (Error Handling, Database, Observability, Resilience, Security/Auth, Background Jobs)

### Domain Competencies Summary
- ✅ **Covered:** Responsive design (already implemented)
- ❌ **Missing:** 14 competencies (React role-based dashboards, Kanban, RBAC, RLS, Lead ingestion, Task automation, Cron jobs, Real-time notifications, API integrations, CSV handling, Analytics)

### Critical Gaps Identified
1. **RBAC + Supabase Auth with custom roles** — Required for 3-tier access control
2. **Background job system + Cron scheduling** — Required for automations (reminders, escalations)
3. **Lead ingestion + multi-source handling** — Required for lead management
4. **Real-time notifications system** — Required for instant asesor alerting
5. **External API integrations** (WhatsApp, Calendar, Email) — Required for communications

---

## PART 4: SKILLS TO CREATE OR REFERENCE

### Must Create (Core System Capabilities)

1. **`rbac-authorization-pattern`**
   - What: Role-based access control in Next.js + Supabase
   - Covers: Middleware for route protection, RLS policies, JWT role claims, conditional rendering by role
   - Why: Core to 3-dashboard architecture

2. **`supabase-auth-setup`**
   - What: Supabase authentication with custom roles and RLS
   - Covers: User roles, JWT configuration, RLS policies per role, session management
   - Why: Unique to this project (many don't use Supabase custom roles)

3. **`background-jobs-scheduling`**
   - What: Task scheduling and cron jobs in Node.js/Next.js
   - Covers: Libraries (node-cron, node-schedule, bull), task idempotency, error handling, monitoring
   - Why: Critical for automations (reminders, escalations, follow-ups)

4. **`lead-ingestion-pipeline`**
   - What: Multi-source lead capture and deduplication
   - Covers: Web form submission, manual entry, CSV parsing, deduplication logic, validation
   - Why: Specific to CRM workflows

5. **`external-api-integrations`**
   - What: WhatsApp, Google Calendar, Email API integration patterns
   - Covers: OAuth flows, webhook handling, error resilience, sync strategies
   - Why: CRM-specific integrations

### Can Reference (Standard Patterns)

- `testing-tdd` — Use for test strategies
- `design-patterns` — Use for component architecture
- `architecture` — Reference for Next.js App Router patterns
- `database-design` — Reference for schema principles (though Supabase-specific setup is new)
- `api-design` — Use for API route standards

---

## PART 5: DECISION

### Gaps Found: YES ❌

**Missing/Stale Skills:** 5 critical skills needed

**Critical Path Items:**
1. Role-based dashboards + RBAC middleware
2. Supabase auth with custom roles + RLS
3. Background job scheduling (cron)
4. Lead ingestion system
5. Real-time notifications + API integrations

**Action:** → **INVOKE SKILLS-CREATION**

These gaps are NOT blockers for implementation (we can inline knowledge in the plan), but creating dedicated skills will:
- ✅ Document patterns for future projects
- ✅ Reduce plan cognitive load (reference skills instead of inline code)
- ✅ Enable faster implementation (clearer patterns)
- ✅ Improve code quality (validated patterns vs ad-hoc)

---

## PART 6: RECOMMENDED SKILLS TO CREATE

**Priority Order:**

### HIGH (Create ASAP)
1. `supabase-auth-rbac-setup` — Foundation for entire system
2. `background-jobs-scheduling` — Foundation for automations
3. `lead-ingestion-pipeline` — Foundation for lead management

### MEDIUM (Create or Inline)
4. `rbac-authorization-pattern` — Can inline in plan if needed
5. `external-api-integrations` — Can inline, but valuable as skill

### LOW (Can Inline)
6. `real-time-notifications` — Small scope, can inline in plan

---

## NEXT STEP

Proceed to **skills-creation** to create the 3-5 missing skills, then invoke **writing-plans** to create the implementation plan with skill references.
