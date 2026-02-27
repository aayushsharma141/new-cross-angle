ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_leads" ON leads FOR
INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth_all_leads" ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);