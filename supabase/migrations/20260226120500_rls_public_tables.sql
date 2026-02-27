ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_projects" ON projects FOR
SELECT TO anon USING (status = 'published');
CREATE POLICY "auth_all_projects" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_services" ON services FOR
SELECT TO anon USING (true);
CREATE POLICY "auth_all_services" ON services FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_blogs" ON blogs FOR
SELECT TO anon USING (status = 'published');
CREATE POLICY "auth_all_blogs" ON blogs FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_testimonials" ON testimonials FOR
SELECT TO anon USING (active = true);
CREATE POLICY "auth_all_testimonials" ON testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);