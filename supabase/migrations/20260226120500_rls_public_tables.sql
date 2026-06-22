DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='status') THEN
    EXECUTE 'ALTER TABLE projects ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS "public_read_projects" ON projects;';
    EXECUTE 'CREATE POLICY "public_read_projects" ON projects FOR SELECT TO anon USING (status = ''published'');';
    EXECUTE 'DROP POLICY IF EXISTS "auth_all_projects" ON projects;';
    EXECUTE 'CREATE POLICY "auth_all_projects" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='services') THEN
    EXECUTE 'ALTER TABLE services ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS "public_read_services" ON services;';
    EXECUTE 'CREATE POLICY "public_read_services" ON services FOR SELECT TO anon USING (true);';
    EXECUTE 'DROP POLICY IF EXISTS "auth_all_services" ON services;';
    EXECUTE 'CREATE POLICY "auth_all_services" ON services FOR ALL TO authenticated USING (true) WITH CHECK (true);';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blogs' AND column_name='status') THEN
    EXECUTE 'ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS "public_read_blogs" ON blogs;';
    EXECUTE 'CREATE POLICY "public_read_blogs" ON blogs FOR SELECT TO anon USING (status = ''published'');';
    EXECUTE 'DROP POLICY IF EXISTS "auth_all_blogs" ON blogs;';
    EXECUTE 'CREATE POLICY "auth_all_blogs" ON blogs FOR ALL TO authenticated USING (true) WITH CHECK (true);';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='active') THEN
    EXECUTE 'ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS "public_read_testimonials" ON testimonials;';
    EXECUTE 'CREATE POLICY "public_read_testimonials" ON testimonials FOR SELECT TO anon USING (active = true);';
    EXECUTE 'DROP POLICY IF EXISTS "auth_all_testimonials" ON testimonials;';
    EXECUTE 'CREATE POLICY "auth_all_testimonials" ON testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);';
  END IF;
END $$;