# Montana OS Pipeline - Research Brief

**Date:** 2026-05-07  
**Research Focus:** State-of-art best practices for real estate CRM pipelines, real-time data sync, webhooks, and analytics dashboards.  
**Status:** Complete

---

## CONTEXT

Montana OS is building a unified, real-time pipeline system combining sales, property, and deal pipelines. The approved design specification (2026-05-07-montana-os-pipeline-design.md) uses Next.js, Supabase realtime, PostgreSQL, and webhooks for WhatsApp/Facebook integration. This research validates architectural choices and identifies best practices for implementation.

---

## KEY FINDINGS

### 1. REAL ESTATE PIPELINE BEST PRACTICES

**Finding:** Speed-to-lead and data quality are the two highest-leverage factors in real estate conversion.

**Evidence:**
- 87% of deals are lost due to slow follow-ups
- 71% of buyers reach out to only one agent, making first-responder advantage critical
- Agents using CRM tools see 29% increase in sales, 34% increase in productivity, 40% increase in forecast accuracy
- 90% of clients would use their agent again but only 12% do without follow-up

**Recommended Approach:**
Montana OS's emphasis on **speed and intuitiveness** (Kanban board, real-time updates, WhatsApp webhook automation) directly addresses the industry's top pain point. The architecture prevents "lead cooling" by:
1. Automatic lead creation on WhatsApp/Facebook contact
2. Instant team notification via real-time channels
3. One-click assignment to available asesor
4. Friction-free drag-drop status updates

**Implementation Notes:**
- Define clear entry/exit criteria for each pipeline stage (prevent zombie leads)
- Automate follow-ups but trigger human actions, not replace them
- Post-closing nurture stage is critical (90% repeat customer potential if followed up)
- Separate pipelines for different deal types (buyers vs sellers have different milestone sequences)

**Sources:**
- [Goliath: Real Estate CRM Pipeline Management 2026](https://goliathdata.com/real-estate-crm-pipeline-management-feature-checklist-2026)
- [BoldTrail: Sales Pipeline Management Best Practices](https://boldtrail.com/blog/real-estate-sales-pipeline-management-a-key-to-success/)
- [Prospeo: Pipeline Stages Guide 2026](https://prospeo.io/s/real-estate-pipeline-stages)

---

### 2. SUPABASE REALTIME FOR MULTI-USER SYNCHRONIZATION

**Finding:** Supabase Realtime is production-ready for multi-user systems but requires careful configuration for scalability.

**Evidence:**
- Realtime uses PostgreSQL's WAL (Write-Ahead Log) and publishes changes via WebSocket channels
- Presence feature enables tracking who's online and their state
- RLS policies are automatically enforced in realtime subscriptions
- Private channels are required for production (prevent unauthorized subscribers)

**Recommended Approach:**
Montana OS's architecture using Supabase Realtime Postgres Changes subscriptions is sound. Recommended configuration:

```typescript
// Subscribe to lead changes (filtered by RLS)
const channel = supabase
  .channel('pipeline-leads')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'leads' },
    (payload) => updateUI(payload.new)
  )
  .subscribe();
```

**Implementation Notes:**
- Monitor "Concurrent Peak Connections" quota (scales with plan)
- For high load, consider separate "public" table without RLS + broadcast pattern
- Presence tracking useful for "seeing who's online" but not needed for lead updates
- Always use private channels (`supabase.channel('pipeline-leads')` not broadcast channels)

**Performance Considerations:**
- Each client connection costs roughly ~50KB baseline memory
- At 100 concurrent agents, budget for ~5MB overhead per Supabase instance
- Consider caching KPIs (refresh every 5 min) vs querying live for non-critical data

**Sources:**
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Supabase Realtime Benchmarks](https://supabase.com/docs/guides/realtime/benchmarks)
- [Supabase Realtime Connection Quota Guide](https://supabase.com/docs/guides/troubleshooting/realtime-concurrent-peak-connections-quota-jdDqcp)

---

### 3. POSTGRESQL OPTIMIZATION FOR HIGH-VELOCITY LEAD OPERATIONS

**Finding:** PostgreSQL is highly optimizable for high-velocity transactional workloads with proper tuning.

**Evidence:**
- `shared_buffers` (25% of RAM) has single-largest performance impact
- `work_mem` for sorts/joins, `effective_cache_size` (50-75% RAM) for query planning
- VACUUM/ANALYZE maintenance critical for high-write systems
- Indexes on frequently queried columns reduce query time by 10-100x

**Recommended Approach:**
Implement indexes as specified in Montana OS spec:

```sql
-- Critical for pipeline filtering
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_last_contact ON leads(last_contact DESC);
CREATE INDEX idx_leads_dias_en_pipeline ON leads(dias_en_pipeline DESC);

-- For analytics queries
CREATE INDEX idx_propiedades_created_by ON propiedades(created_by);
CREATE INDEX idx_lead_activities_created_at ON lead_activities(created_at DESC);
```

**Implementation Notes:**
- Use EXPLAIN ANALYZE to verify index usage
- Supabase handles autovacuum by default (no manual tuning needed)
- Monitor query performance as data grows (re-run ANALYZE weekly)
- For 10K+ leads, consider partitioning by date if query performance degrades

**Sources:**
- [PostgreSQL Official Performance Tips](https://www.postgresql.org/docs/current/performance-tips.html)
- [Percona PostgreSQL Tuning Guide](https://www.percona.com/blog/tuning-postgresql-database-parameters-to-optimize-performance/)
- [Mydbops PostgreSQL Parameter Tuning 2025](https://www.mydbops.com/blog/postgresql-parameter-tuning-best-practices)

---

### 4. WHATSAPP + FACEBOOK WEBHOOK INTEGRATION PATTERNS

**Finding:** WhatsApp Business API and Facebook Lead Ads are mature, well-documented, and critical for lead capture automation in 2025-2026.

**Evidence:**
- WhatsApp Business API supports webhooks for message ingestion, form submission, and Click-to-WhatsApp ads
- Since July 2025, Meta charges per template message (no more 24h conversation flat fee)
- Click-to-WhatsApp ads trigger 72-hour free messaging window (massive opportunity for quick follow-up)
- WhatsApp Flows (in-chat forms) enable qualification without leaving the app

**Recommended Approach:**
Montana OS's webhook architecture is correct. Implementation details:

```typescript
// POST /api/webhooks/whatsapp
export async function POST(req: Request) {
  const payload = await req.json();
  
  // 1. Verify signature (security critical)
  if (!verifyWhatsAppSignature(req.headers, payload)) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // 2. Idempotency check (prevent duplicates)
  const eventId = payload.messages[0]?.id;
  if (await eventExists(eventId)) {
    return new Response('OK', { status: 200 }); // Return 200 even for duplicates
  }
  
  // 3. Create or update lead
  const { from, message } = payload.messages[0];
  const lead = await findOrCreateLead(from, message);
  
  // 4. Assign to available asesor
  const asesor = await getAvailableAsesor();
  await assignLead(lead.id, asesor.id);
  
  // 5. Send welcome message (using template)
  await sendWhatsAppTemplate(from, 'welcome_template');
  
  // 6. Create activity log
  await logActivity(lead.id, 'whatsapp_msg', message);
  
  return new Response('OK', { status: 200 });
}
```

**Implementation Notes:**
- **Signature Verification:** WhatsApp signs every webhook with HMAC-SHA256. Verify before processing.
- **Idempotency:** WhatsApp retries failed webhooks. Use message ID as unique key to prevent duplicate leads.
- **Rate Limiting:** WhatsApp allows ~1000 messages/sec per account. Plan for bursts.
- **Message Templates:** Use templates for reliable delivery (follow-up, confirmation). Custom messages cost extra.
- **Facebook Leads:** Similar flow but simpler (form data instead of chat). No retries from Facebook.

**Performance Considerations:**
- Webhook processing should be <1 second (return 200 immediately)
- For complex logic, queue webhook payload to background worker
- Store webhook logs for audit trail (required for debugging)

**2025-2026 Pricing Notes:**
- Template messages: ~$0.001-0.004 per message depending on language/region
- Click-to-WhatsApp ads: Free 72h window, then standard rates apply
- Storage: 15MB free, then ~$1/GB/month

**Sources:**
- [WhatsApp Business API Webhooks](https://whatsappbusiness.com/blog/how-to-use-webhooks-from-whatsapp-business-api/)
- [Complete WhatsApp Webhook Guide](https://m.aisensy.com/blog/whatsapp-webhooks-guide/)
- [WhatsApp Lead Forms CRM Integration](https://www.reform.app/blog/whatsapp-lead-forms-crm-integration-guide/)

---

### 5. REACT DASHBOARD ANALYTICS BEST PRACTICES

**Finding:** React dashboards perform best with virtual scrolling, lazy-loaded charts, and real-time WebSocket updates.

**Evidence:**
- React's virtual DOM ensures efficient re-rendering when data changes
- Chart.js/Recharts/D3.js each serve different use cases (simplicity vs customization)
- Virtual Scrolling handles 1000+ row tables without performance degradation
- Real-time updates via WebSocket/polling keep dashboards fresh without constant refetch

**Recommended Approach:**
Montana OS dashboard should implement:

1. **KPI Cards (Top Section)**
   - Simple metric displays (total, percentage, trend arrow)
   - Update frequency: Every 5-10 seconds (to avoid constantly recalculating)
   - Use `useMemo` to prevent recalculation on every render

2. **Funnel Chart (Middle Section)**
   - Recharts library (simple, out-of-the-box)
   - Shows conversion at each stage with drop-off %
   - Update on lead status change (via realtime subscription)

3. **Trends Line Chart (Bottom Section)**
   - Shows leads created vs closed over time
   - Data aggregated daily (not hourly, too noisy)
   - Toggle between weekly/monthly views

4. **Performance Optimization**
   - Virtualize table rows if 100+ leads visible
   - Lazy-load chart components (only render when visible)
   - Memoize expensive calculations

**Library Recommendations:**
- **Recharts:** Best for dashboards, simple syntax, handles real-time updates
- **React-table (Tanstack Table):** Best for large tables with sorting/filtering
- **dnd-kit or hello-pangea/dnd:** Best for drag-drop Kanban (see section 6)

**Implementation Notes:**
```typescript
// KPI card with real-time update
const KPICard = ({ metric, label, realtime$ }) => {
  const [value, setValue] = useState(metric);
  
  useEffect(() => {
    // Subscribe to realtime changes
    const subscription = realtime$.subscribe(newValue => {
      setValue(newValue);
    });
    return () => subscription.unsubscribe();
  }, []);
  
  return <Card>{value} {label}</Card>;
};
```

**Sources:**
- [ReactJS for Dashboards](https://www.esparkinfo.com/blog/reactjs-for-dashboards-and-data-visualization.html)
- [React Dashboard Best Practices](https://medium.com/front-end-weekly/create-stunning-dashboards-with-reactjs-step-by-step-guide-%EF%B8%8F-3e6860c75030)
- [Material UI Dashboard Examples](https://cube.dev/blog/material-ui-dashboard-with-react)

---

### 6. REACT DRAG-DROP KANBAN IMPLEMENTATION

**Finding:** Three mature libraries dominate; `hello-pangea/dnd` is the best choice for new projects in 2025-2026.

**Evidence & Comparison:**

| Library | Status | Performance | Accessibility | Bundle Size | Recommendation |
|---------|--------|-----------|------------|------------|-----------------|
| **hello-pangea/dnd** | Actively maintained | Excellent (smooth) | Keyboard + screen reader | ~40KB | ✅ **RECOMMENDED** |
| **dnd-kit** | Actively maintained | Excellent | Good (needs work) | ~20KB | Good alternative |
| **react-beautiful-dnd** | Maintenance mode (2023) | Good | Excellent | ~50KB | Legacy, avoid |

**Recommended Approach:**
Use `hello-pangea/dnd` for Kanban board:

```typescript
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export const PipelineKanban = ({ leads }) => (
  <DragDropContext onDragEnd={handleDragEnd}>
    {STATUSES.map(status => (
      <Droppable droppableId={status} key={status}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {leads[status].map((lead, idx) => (
              <Draggable key={lead.id} draggableId={lead.id} index={idx}>
                {(provided, snapshot) => (
                  <LeadCard {...provided.draggableProps} {...provided.dragHandleProps} />
                )}
              </Draggable>
            ))}
          </div>
        )}
      </Droppable>
    ))}
  </DragDropContext>
);

const handleDragEnd = (result) => {
  const { source, destination, draggableId } = result;
  if (!destination) return;
  
  // Update lead status
  updateLeadStatus(draggableId, destination.droppableId);
};
```

**Why hello-pangea/dnd?**
- Smooth physics-based animations (feels like moving real objects)
- Built-in keyboard support (accessibility)
- Screen reader announcements
- Forked from react-beautiful-dnd with active maintenance
- Community support excellent

**Implementation Notes:**
- Initialize with `<DragDropContext>` wrapper
- `<Droppable>` = column (one per status)
- `<Draggable>` = lead card
- On drop, API call updates `leads.status`, which triggers realtime update for all users

**Sources:**
- [Top 5 React Drag-Drop Libraries 2025](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react)
- [Building Kanban with dnd-kit](https://plaintext-engineering.com/blog/drag-n-drop-kanban-board-react/)
- [hello-pangea/dnd Documentation](https://github.com/hello-pangea/dnd)

---

### 7. SUPABASE ROW LEVEL SECURITY (RLS) FOR MULTI-ROLE ACCESS

**Finding:** RLS is production-ready for multi-role systems; policies must be carefully designed for performance.

**Evidence:**
- RLS adds implicit WHERE clauses to every query (enforced at database level)
- Performance impact is negligible for well-indexed queries
- Supabase has built-in roles: `anon` (not logged in), `authenticated` (logged in)
- Custom roles can be created via Postgres for team/account-based access

**Recommended Approach:**
Implement policies as specified in Montana OS spec:

```sql
-- Agent sees only their assigned leads
CREATE POLICY "agents_see_own_leads" ON leads
  FOR SELECT
  USING (
    assigned_to = auth.uid() 
    OR (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('team_lead', 'admin')
  );

-- Team lead sees their team's leads
CREATE POLICY "team_leads_see_team" ON leads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() 
      AND rol = 'team_lead'
      AND (SELECT team_lead_id FROM usuarios WHERE id = leads.assigned_to) = auth.uid()
    )
    OR (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

-- Admin sees all leads
CREATE POLICY "admin_sees_all" ON leads
  FOR SELECT
  USING ((SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin');

-- Agents can only update their own leads
CREATE POLICY "agents_update_own" ON leads
  FOR UPDATE
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- Team leads can reassign
CREATE POLICY "team_leads_can_reassign" ON leads
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()
      AND rol = 'team_lead'
      AND (SELECT team_lead_id FROM usuarios WHERE id = leads.assigned_to) = auth.uid()
    )
  );
```

**Implementation Notes:**
- **Primitive Policies:** Permissive (if ANY policy grants access, user gets it)
- **Restrictive Policies:** All must grant access (AND logic)
- **Testing RLS:** Use `supabase.rpc('get_current_user_role')` to debug
- **Performance:** Use `USING` clause (WHERE at read time) not `WITH CHECK` (WHERE at write time)
- **Auditing:** `lead_activities` table should also have RLS to prevent sensitive access logs being exposed

**Sources:**
- [Supabase RLS Official Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [RLS Best Practices Guide](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices)
- [RLS Multi-Tenant Patterns](https://medium.com/@jigsz6391/supabase-row-level-security-explained-with-real-examples-6d06ce8d221c)

---

### 8. WEBHOOK ERROR HANDLING & RETRY LOGIC IN NEXT.JS

**Finding:** Serverless webhook processing requires idempotency, signature verification, and careful state management.

**Evidence:**
- Webhook platforms (WhatsApp, Facebook) retry failed requests exponentially (up to 72 hours)
- Serverless functions are stateless; each request treated independently
- Duplicate webhooks are inevitable; application must deduplicate
- Timeout errors leave systems in inconsistent state

**Recommended Approach:**
Implement webhook handler with idempotency and retry safety:

```typescript
// POST /api/webhooks/whatsapp
export async function POST(req: Request) {
  try {
    // 1. Signature verification (prevents spoofing)
    const signature = req.headers.get('x-hub-signature-256');
    if (!verifyWhatsAppSignature(await req.text(), signature)) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    const payload = await req.json();
    const eventId = payload.messages[0]?.id;
    
    // 2. Idempotency check (prevent duplicate processing)
    const existingActivity = await supabase
      .from('lead_activities')
      .select('id')
      .eq('external_id', eventId)
      .single();
    
    if (existingActivity) {
      return new Response('OK', { status: 200 }); // Already processed
    }
    
    // 3. Start transaction
    const { data, error } = await supabase
      .from('leads')
      .upsert({
        whatsapp: payload.from,
        status: 'lead_nuevo',
        fuente: 'whatsapp_directo'
      }, { onConflict: 'whatsapp' });
    
    if (error) throw error;
    
    // 4. Log activity with external_id for deduplication
    await supabase.from('lead_activities').insert({
      lead_id: data[0].id,
      activity_type: 'whatsapp_msg',
      description: payload.messages[0].text.body,
      external_id: eventId // KEY: prevents duplicates
    });
    
    // 5. Return 200 immediately (don't block)
    return new Response('OK', { status: 200 });
    
  } catch (error) {
    // Log error but still return 200
    // (WhatsApp will retry if we return 5xx)
    console.error('Webhook error:', error);
    return new Response('OK', { status: 200 });
  }
}
```

**Key Principles:**
- **Always return 200 for processing complete** (even if client's system is partially updated)
- **Use idempotency keys** (`external_id`) to prevent duplicates on retry
- **Verify signatures** before processing (security critical)
- **Keep webhook handler fast** (<1 second)
- **For complex logic, queue to background job** (Bull/BullMQ)

**Implementation Notes:**
- Store webhook logs in separate table for debugging
- Monitor webhook delivery metrics (latency, retry rate)
- Set timeout to 25 seconds (Vercel's max is 30s, leave buffer)

**Sources:**
- [Next.js Error Handling Docs](https://nextjs.org/docs/app/getting-started/error-handling)
- [Stripe Webhook Retry Behavior](https://www.hookrelay.io/guides/stripe-webhook-retry)
- [Production Webhook Handling](https://dev.to/whoffagents/how-i-handle-stripe-webhooks-in-production-the-right-way-32jd)
- [Next.js Webhook Implementation](https://damianhodgkiss.com/tutorials/implementing-webhooks-nextjs)

---

### 9. AI LEAD SCORING FOR REAL ESTATE (FUTURE ENHANCEMENT)

**Finding:** AI lead scoring is production-ready and delivers measurable ROI in real estate.

**Evidence:**
- ML-powered lead scoring improves conversion by 25-30%
- Personalized automation can boost conversions by up to 50%
- 98% of sales teams using AI report better lead prioritization
- Common factors: property viewing habits, response rate history, buyer profile match

**Recommended Approach for Future:**
Not required for MVP but valuable add-on. When implemented:

1. **Data Collection Phase:**
   - Track lead engagement: site visits, property views, form fills, message response time
   - Historical conversion data: which leads closed, how long in pipeline
   - Property data: price, location, type, time-on-market

2. **Model Training:**
   - Use logistic regression (simple, interpretable) or gradient boosting (better accuracy)
   - Features: days_in_pipeline, response_time_avg, property_price_range_match, etc.
   - Target: probability of closing within 30 days

3. **Integration:**
   - Run inference nightly or on new lead creation
   - Store score in `leads.conversion_probability` column
   - Display on Kanban: color-code or badge high-probability leads
   - Sort table by score by default

**2025-2026 Tools:**
- **Anthropic Claude API:** Can generate lead insights via `claude-opus-4-7` with prompt caching
- **Vercel AI SDK:** Integrates Claude with Next.js, perfect for serverless inference
- **AutoML (Google Cloud):** Pre-trained models if want to avoid custom training

**Implementation Timeline:**
- MVP (Month 1): Manual pipeline, no AI
- V2 (Month 3-4): Add basic lead scoring based on response time
- V3 (Month 6): ML-based scoring with buyer-seller segmentation

**Sources:**
- [AI Lead Scoring for Real Estate 2025](https://theaiconsultancy.ai/ai-lead-scoring-for-real-estate-agents/)
- [5 Ways to Use AI for Real Estate Leads](https://www.luxurypresence.com/blogs/real-estate-ai-lead-generation/)
- [How AI Lead Scoring Works](https://www.reform.app/blog/ai-lead-scoring-for-real-estate-how-it-works/)

---

## ARCHITECTURE VALIDATION

### Strengths of Approved Design
✅ **Supabase realtime + Next.js API is correct stack** — Production-ready, mature libraries, good documentation  
✅ **Webhook architecture is sound** — Idempotency pattern is industry-standard  
✅ **RLS policies will work** — Well-defined role hierarchy matches common CRM patterns  
✅ **PostgreSQL indexes are well-chosen** — Covers all critical query paths  
✅ **hello-pangea/dnd for Kanban is best choice** — Active maintenance, accessibility included  

### Potential Risks & Mitigations
⚠️ **Risk:** Webhook timeout at high volume  
→ **Mitigation:** Return 200 immediately, queue complex logic to background job (Bull queue)

⚠️ **Risk:** Supabase realtime connection limits at 200+ concurrent agents  
→ **Mitigation:** Monitor connection metrics, upgrade plan, or implement broadcast pattern for high-load scenarios

⚠️ **Risk:** RLS policy performance with deeply nested EXISTS checks  
→ **Mitigation:** Test with 10K+ leads, add `enable_seqscan = off` if needed, use function-based policies for complex logic

⚠️ **Risk:** PostgreSQL bloat if leads accumulate to 1M+  
→ **Mitigation:** Archive closed leads to separate table, implement partition strategy

---

## IMPLEMENTATION PRIORITY

### Phase 1: MVP (Weeks 1-3)
- Core Kanban board + table view
- Basic analytics (KPI cards, funnel)
- WhatsApp webhook for lead creation
- RLS policies for role-based access
- Libraries: hello-pangea/dnd, Recharts

### Phase 2: Enhancement (Weeks 4-6)
- Facebook Lead Ads webhook
- Landing page form integration
- Advanced filters + saved views
- Batch operations (reassign, bulk close)

### Phase 3: Intelligence (Weeks 7-10)
- AI lead scoring (Claude API)
- Predictive close probability
- Smart follow-up reminders
- Revenue forecasting

---

## CONCLUSION

Montana OS's approved architecture is **production-ready** and aligns with 2025-2026 industry best practices. The combination of Supabase realtime, Next.js webhooks, and hello-pangea/dnd creates a platform that is:

1. **Fast:** Real-time updates prevent lead cooling
2. **Scalable:** PostgreSQL indexes + RLS designed for growth
3. **Integrable:** Webhook patterns support WhatsApp, Facebook, future APIs
4. **Future-proof:** AI lead scoring can be added without architecture changes

Proceed with implementation confidence. Focus on **execution speed** (first-to-lead advantage) and **data quality** (clean lead entry). The technology is sound.

---

**Research completed by:** Claude Code (deep-research skill)  
**Next step:** Skills audit to identify supporting skills needed for implementation
