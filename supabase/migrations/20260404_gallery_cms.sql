-- Gallery CMS Tables
-- Created: 2026-04-04

-- Gallery Categories
CREATE TABLE IF NOT EXISTS public.gallery_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery Items
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.gallery_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    location TEXT,
    year INTEGER,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_gallery_categories_updated_at ON public.gallery_categories;
CREATE TRIGGER update_gallery_categories_updated_at 
    BEFORE UPDATE ON public.gallery_categories 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_gallery_items_updated_at ON public.gallery_items;
CREATE TRIGGER update_gallery_items_updated_at 
    BEFORE UPDATE ON public.gallery_items 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- RLS Policies
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read gallery_categories" ON public.gallery_categories FOR SELECT USING (true);
CREATE POLICY "Public read gallery_items" ON public.gallery_items FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "Admin all gallery_categories" ON public.gallery_categories 
    FOR ALL TO authenticated USING (auth.role() = 'authenticated');

CREATE POLICY "Admin all gallery_items" ON public.gallery_items 
    FOR ALL TO authenticated USING (auth.role() = 'authenticated');

-- Insert default categories
INSERT INTO gallery_categories (name, slug, display_order) VALUES
    ('Modular Kitchen', 'modular-kitchen', 1),
    ('Bedroom Interior', 'bedroom-interior', 2),
    ('Living Room', 'living-room', 3),
    ('Bathroom', 'bathroom', 4),
    ('Office', 'office', 5)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample gallery items (based on existing data)
INSERT INTO gallery_items (category_id, title, subtitle, image_url, location, year, description, display_order)
SELECT 
    gc.id,
    gi.title,
    gi.description,
    gi.image,
    gi.location,
    gi.year,
    gi.description,
    ROW_NUMBER() OVER (PARTITION BY gi.category ORDER BY gi.id)::int - 1
FROM (
    VALUES
        ('Modular Kitchen', 'Contemporary Modular Kitchen', 'A sleek white-and-wood modular kitchen', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-K1.png', 'Jamshedpur', 2023),
        ('Modular Kitchen', 'Heritage Kitchen Remodel', 'Classic cabinetry meets modern appliances', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-K2.png', 'Kolkata', 2023),
        ('Modular Kitchen', 'Minimalist Culinary Studio', 'A stripped-back minimalist kitchen', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-K3.png', 'Ranchi', 2024),
        ('Modular Kitchen', 'Open-Plan Cooking Space', 'An open-plan kitchen for entertaining', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-K4.png', 'Jamshedpur', 2024),
        ('Bedroom Interior', 'Serene Master Suite', 'A peaceful retreat', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-1.png', 'Jamshedpur', 2023),
        ('Bedroom Interior', 'Modern Bedroom Design', 'Contemporary bedroom styling', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-2.png', 'Kolkata', 2023),
        ('Living Room', 'Elegant Living Space', 'Sophisticated living room', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-3.png', 'Ranchi', 2024),
        ('Bathroom', 'Luxury Bathroom', 'Spa-like bathroom experience', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-4.png', 'Jamshedpur', 2024),
        ('Office', 'Professional Workspace', 'Productive office environment', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-5.png', 'Kolkata', 2023)
) AS gi(category, title, subtitle, image_url, location, year, description)
JOIN gallery_categories gc ON gc.slug = LOWER(REPLACE(gi.category, ' ', '-'))
WHERE NOT EXISTS (SELECT 1 FROM gallery_items WHERE title = gi.title);
