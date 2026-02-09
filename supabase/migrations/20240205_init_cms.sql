-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  client TEXT,
  location TEXT,
  type TEXT CHECK (type IN ('residential', 'commercial')),
  category TEXT,
  area TEXT,
  budget TEXT,
  duration TEXT,
  style TEXT,
  year INTEGER,
  hero_image TEXT,
  brief TEXT,
  approach TEXT,
  testimonial_quote TEXT,
  testimonial_author TEXT,
  testimonial_role TEXT,
  video_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project_gallery table
CREATE TABLE IF NOT EXISTS project_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  room_name TEXT,
  image_url TEXT NOT NULL,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project_materials table
CREATE TABLE IF NOT EXISTS project_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  details TEXT,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_materials ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow Public Read, Auth Write)
-- Policy regarding published blogs removed from here and moved to 20260208000001_fix_blogs_schema.sql
-- (Deleted problematic CREATE POLICY statement)

CREATE POLICY "Admin can view all blogs" ON blogs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can insert blogs" ON blogs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin can update blogs" ON blogs
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admin can delete blogs" ON blogs
  FOR DELETE TO authenticated USING (true);

-- Projects policies (Public can view all for now, or add is_featured/published check if needed)
CREATE POLICY "Public can view projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Admin can insert projects" ON projects
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin can update projects" ON projects
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admin can delete projects" ON projects
  FOR DELETE TO authenticated USING (true);

-- Gallery policies
CREATE POLICY "Public can view project gallery" ON project_gallery
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage project gallery" ON project_gallery
  FOR ALL TO authenticated USING (true);

-- Materials policies
CREATE POLICY "Public can view project materials" ON project_materials
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage project materials" ON project_materials
  FOR ALL TO authenticated USING (true);

-- Storage bucket for media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media');
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media');
