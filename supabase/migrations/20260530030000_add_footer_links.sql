-- Migration: Create footer_links table

CREATE TABLE IF NOT EXISTS public.footer_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section TEXT NOT NULL CHECK (section IN ('navigate', 'tools')),
    label TEXT NOT NULL,
    path TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on footer_links"
    ON public.footer_links
    FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated full access on footer_links"
    ON public.footer_links
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Insert initial data
INSERT INTO public.footer_links (section, label, path, display_order)
VALUES
    ('navigate', 'Home', '/', 10),
    ('navigate', 'Services', '/services', 20),
    ('navigate', 'Portfolio', '/portfolio', 30),
    ('navigate', 'About Us', '/about-us', 40),
    ('navigate', 'Blog', '/blog', 50),
    ('navigate', 'Contact Us', '/contact-us', 60),
    
    ('tools', 'Gallery', '/gallery', 10),
    ('tools', 'Cost Estimator', '/estimate', 20),
    ('tools', 'Style Discovery', '/aesthetic-discovery-engine', 30),
    ('tools', 'Design Blueprint', '/blueprint', 40)
ON CONFLICT DO NOTHING;
