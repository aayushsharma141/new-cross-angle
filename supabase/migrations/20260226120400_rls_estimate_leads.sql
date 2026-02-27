ALTER TABLE estimate_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_estimate_leads" ON estimate_leads FOR
INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth_all_estimate_leads" ON estimate_leads FOR ALL TO authenticated USING (true) WITH CHECK (true);