-- Add studio_stats to site_settings
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'site_settings'
) THEN
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS studio_stats JSONB DEFAULT '{"yearsExperience": 15, "happyClients": 500, "projectsCompleted": 750, "awardsWon": 25}'::jsonb;
END IF;
END $$;

-- Create studio_milestones
CREATE TABLE IF NOT EXISTS public.studio_milestones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  year text NOT NULL,
  title text NOT NULL,
  event text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.studio_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view studio milestones" ON public.studio_milestones FOR SELECT USING (true);
CREATE POLICY "Admin can insert studio milestones" ON public.studio_milestones FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admin can update studio milestones" ON public.studio_milestones FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admin can delete studio milestones" ON public.studio_milestones FOR DELETE USING (public.is_admin_or_editor(auth.uid()));

-- Create design_process_steps
CREATE TABLE IF NOT EXISTS public.design_process_steps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  step_number text NOT NULL,
  icon_name text NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL,
  description text NOT NULL,
  detail text NOT NULL,
  image_url text,
  image_alt text,
  kicker text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.design_process_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view design process steps" ON public.design_process_steps FOR SELECT USING (true);
CREATE POLICY "Admin can insert design process steps" ON public.design_process_steps FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admin can update design process steps" ON public.design_process_steps FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admin can delete design process steps" ON public.design_process_steps FOR DELETE USING (public.is_admin_or_editor(auth.uid()));

-- Insert default milestones
INSERT INTO public.studio_milestones (year, title, event, display_order) VALUES
('2010', 'The Beginning', 'Founded Cross Angle Interior in Jamshedpur with a vision to transform spaces.', 1),
('2015', 'Expansion', 'Expanded into commercial interior design, partnering with leading businesses.', 2),
('2018', 'Milestone', 'Celebrated completion of 100+ residential projects across Jharkhand.', 3),
('2020', 'Innovation', 'Launched comprehensive turnkey project solutions for seamless delivery.', 4),
('2024', 'Recognition', 'Recognized as the leading interior design studio in Jharkhand.', 5)
ON CONFLICT DO NOTHING;

-- Insert default process steps
INSERT INTO public.design_process_steps (step_number, icon_name, title, subtitle, description, detail, image_url, image_alt, kicker, display_order) VALUES
('01', 'Home', 'Consult', 'Private Briefing', 'Share your vision, priorities, and timeline with our design team.', 'We begin with a precise understanding of lifestyle, site realities, and investment intent so the project starts with clarity.', '/reality_render.jpg', 'Luxury living room consultation setting', 'Stage One', 1),
('02', 'Ruler', 'Measure & Plan', 'Technical Mapping', 'Laser-precise measurement, circulation logic, and planning discipline.', 'Spatial planning, dimensions, and constraints are translated into an execution-ready foundation before any major design decision.', '/blueprint_shell.jpg', 'Architectural blueprint and measured planning sheet', 'Stage Two', 2),
('03', 'Palette', 'Design', 'Visual Direction', 'See palettes, finishes, and realistic views before execution begins.', 'Materials, lighting mood, and 3D visuals align taste with feasibility, allowing decisions to feel confident instead of speculative.', '/hero_reality_render_1775299733746.png', 'Photorealistic interior design preview', 'Stage Three', 3),
('04', 'Hammer', 'Execute', 'Craft & Install', 'Specialist teams bring the approved design into built form.', 'Fabrication, site coordination, and finishing are managed as one controlled delivery stream to reduce friction and protect quality.', '/reality_render.jpg', 'Finished interior under installation and styling', 'Stage Four', 4),
('05', 'Check', 'Handover', 'Final Reveal', 'Walk through a polished, ready-to-live space with full confidence.', 'The closing stage focuses on finishing, quality checks, and a composed reveal that feels complete rather than merely delivered.', '/hero_reality_render_1775299733746.png', 'Completed premium interior ready for handover', 'Stage Five', 5)
ON CONFLICT DO NOTHING;
