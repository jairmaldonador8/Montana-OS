-- supabase/migrations/20260507_006_pipeline_rls_policies.sql

-- Agents see only their assigned leads + team leads see their team + admin sees all
CREATE POLICY "agents_see_own_leads" ON leads
  FOR SELECT
  USING (
    assigned_to = auth.uid()
    OR (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('team_lead', 'admin')
  );

CREATE POLICY "team_leads_see_team" ON leads
  FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'team_lead'
    OR (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

-- Agents can update only their assigned leads
CREATE POLICY "agents_update_own_leads" ON leads
  FOR UPDATE
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- Team leads can reassign
CREATE POLICY "team_leads_reassign" ON leads
  FOR UPDATE
  USING ((SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('team_lead', 'admin'))
  WITH CHECK ((SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('team_lead', 'admin'));

-- Activity log access follows lead access
CREATE POLICY "read_lead_activities" ON lead_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leads l
      WHERE l.id = lead_activities.lead_id
      AND (
        l.assigned_to = auth.uid()
        OR (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('team_lead', 'admin')
      )
    )
  );

CREATE POLICY "create_lead_activities" ON lead_activities
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads l
      WHERE l.id = lead_activities.lead_id
      AND (
        l.assigned_to = auth.uid()
        OR (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('team_lead', 'admin')
      )
    )
  );
