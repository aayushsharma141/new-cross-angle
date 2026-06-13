-- Site Media Assets
-- Maps logical asset keys (e.g. "home_hero_bg") to media_files records.
-- Created out-of-band; this migration formalises the table and seeds all keys.

CREATE TABLE IF NOT EXISTS site_media_assets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_key   TEXT UNIQUE NOT NULL,
    description TEXT,
    media_file_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE site_media_assets ENABLE ROW LEVEL SECURITY;

-- Everyone can read base asset metadata (media_file_id is opaque without join)
CREATE POLICY "Public can read site_media_assets"
    ON site_media_assets FOR SELECT
    USING (true);

-- Only authenticated admins can mutate
CREATE POLICY "Admins can manage site_media_assets"
    ON site_media_assets FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_site_media_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_site_media_assets_updated_at ON site_media_assets;
CREATE TRIGGER trg_site_media_assets_updated_at
    BEFORE UPDATE ON site_media_assets
    FOR EACH ROW EXECUTE FUNCTION update_site_media_assets_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: All asset keys
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO site_media_assets (asset_key, description) VALUES

-- ===== HOME PAGE =====
('home_hero_bg',             'Home page hero fallback background image (reality render)'),
('home_logo',                'Brand logo displayed in navbar'),
('home_og_image',            'OG image for home page social sharing'),
('home_schema_logo',         'Logo URL used in structured data markup'),
('home_schema_og',           'OG image URL used in structured data'),

-- Tactile Journey
('home_tactile_bedroom',     'Tactile Journey mood image — bedroom'),
('home_tactile_kitchen',     'Tactile Journey mood image — kitchen'),
('home_tactile_office',      'Tactile Journey mood image — office'),

-- Process Steps
('home_process_consult',     'Home process step — Consult'),
('home_process_measure',     'Home process step — Measure & Plan'),
('home_process_design',      'Home process step — Design'),
('home_process_execute',     'Home process step — Execute'),
('home_process_handover',    'Home process step — Handover'),

-- Brand Partners
('home_brand_asian_paints',  'Asian Paints partner logo'),
('home_brand_hafele',        'Hafele partner logo'),
('home_brand_godrej',        'Godrej partner logo'),
('home_brand_philips',       'Philips partner logo'),
('home_brand_hettich',       'Hettich partner logo'),
('home_brand_jaquar',        'Jaquar partner logo'),

-- ===== ABOUT PAGE =====
('about_hero_bg',            'About page hero background image'),
('about_video_cover',        'About page video cover / placeholder'),
('about_schema_logo',        'Logo URL for about page schema markup'),
('about_timeline_2012',      'About page timeline milestone — 2012 Foundation'),
('about_timeline_2016',      'About page timeline milestone — 2016 Scaling'),
('about_timeline_2020',      'About page timeline milestone — 2020 New Standard'),
('about_timeline_2024',      'About page timeline milestone — 2024 Present Day'),

-- ===== SERVICES PAGE =====
('services_hero_bg',         'Services page hero background image'),
('services_hero_blueprint',  'Services page blueprint shell hero image'),
('services_why_us',          'Services "Why Us" section illustration'),

-- ===== PORTFOLIO HUB =====
('portfolio_hub_hero_1',     'Portfolio hub hero rotating image 1 — bedroom'),
('portfolio_hub_hero_2',     'Portfolio hub hero rotating image 2 — kitchen'),
('portfolio_hub_hero_3',     'Portfolio hub hero rotating image 3 — office'),
('portfolio_hub_lifestyle',  'Portfolio hub Light Experience feature image'),
('portfolio_hub_cta',        'Portfolio hub final CTA background'),

-- ===== PROJECT PAGE =====
('project_gallery_fallback_1', 'Project gallery fallback image 1'),
('project_gallery_fallback_2', 'Project gallery fallback image 2'),
('project_gallery_fallback_3', 'Project gallery fallback image 3'),
('project_gallery_fallback_4', 'Project gallery fallback image 4'),
('project_gallery_fallback_5', 'Project gallery fallback image 5'),
('project_video_placeholder',  'Project page video section placeholder'),

-- ===== BLOG =====
('blog_newsletter_bg',       'Blog newsletter signup decorative background'),

-- ===== CONTACT PAGE =====
('contact_hero_bg',          'Contact page hero background image'),
('contact_map_fallback',     'Contact page map fallback image'),

-- ===== LOCATION PAGE =====
('location_hero_bg',         'Location page hero background image'),
('location_jamshedpur',      'Jamshedpur location card image'),
('location_bistupur',        'Bistupur location card image'),
('location_adityapur',       'Adityapur location card image'),
('location_kadma',           'Kadma location card image'),

-- ===== NOT FOUND =====
('not_found_bg',             '404 page background image'),

-- ===== DISCOVERY ENGINE =====
('discovery_light_calibration', 'Discovery light calibration room base image'),
('discovery_welcome',           'Discovery welcome screen preview'),

-- Discovery — Visual Instinct (18 images)
('discovery_visual-1',  'Discovery visual instinct image 1'),
('discovery_visual-2',  'Discovery visual instinct image 2'),
('discovery_visual-3',  'Discovery visual instinct image 3'),
('discovery_visual-4',  'Discovery visual instinct image 4'),
('discovery_visual-5',  'Discovery visual instinct image 5'),
('discovery_visual-6',  'Discovery visual instinct image 6'),
('discovery_visual-7',  'Discovery visual instinct image 7'),
('discovery_visual-8',  'Discovery visual instinct image 8'),
('discovery_visual-9',  'Discovery visual instinct image 9'),
('discovery_visual-10', 'Discovery visual instinct image 10'),
('discovery_visual-11', 'Discovery visual instinct image 11'),
('discovery_visual-12', 'Discovery visual instinct image 12'),
('discovery_visual-13', 'Discovery visual instinct image 13'),
('discovery_visual-14', 'Discovery visual instinct image 14'),
('discovery_visual-15', 'Discovery visual instinct image 15'),
('discovery_visual-16', 'Discovery visual instinct image 16'),
('discovery_visual-17', 'Discovery visual instinct image 17'),
('discovery_visual-18', 'Discovery visual instinct image 18'),

-- Discovery — Lifestyle Reflection (9 images)
('discovery_lifestyle-1', 'Discovery lifestyle reflection image 1'),
('discovery_lifestyle-2', 'Discovery lifestyle reflection image 2'),
('discovery_lifestyle-3', 'Discovery lifestyle reflection image 3'),
('discovery_lifestyle-4', 'Discovery lifestyle reflection image 4'),
('discovery_lifestyle-5', 'Discovery lifestyle reflection image 5'),
('discovery_lifestyle-6', 'Discovery lifestyle reflection image 6'),
('discovery_lifestyle-7', 'Discovery lifestyle reflection image 7'),
('discovery_lifestyle-8', 'Discovery lifestyle reflection image 8'),
('discovery_lifestyle-9', 'Discovery lifestyle reflection image 9'),

-- Discovery — Reflection Prompt (33 images)
('discovery_reflect-1',  'Discovery reflection prompt image 1'),
('discovery_reflect-2',  'Discovery reflection prompt image 2'),
('discovery_reflect-3',  'Discovery reflection prompt image 3'),
('discovery_reflect-4',  'Discovery reflection prompt image 4'),
('discovery_reflect-5',  'Discovery reflection prompt image 5'),
('discovery_reflect-6',  'Discovery reflection prompt image 6'),
('discovery_reflect-7',  'Discovery reflection prompt image 7'),
('discovery_reflect-8',  'Discovery reflection prompt image 8'),
('discovery_reflect-9',  'Discovery reflection prompt image 9'),
('discovery_reflect-10', 'Discovery reflection prompt image 10'),
('discovery_reflect-11', 'Discovery reflection prompt image 11'),
('discovery_reflect-12', 'Discovery reflection prompt image 12'),
('discovery_reflect-13', 'Discovery reflection prompt image 13'),
('discovery_reflect-14', 'Discovery reflection prompt image 14'),
('discovery_reflect-15', 'Discovery reflection prompt image 15'),
('discovery_reflect-16', 'Discovery reflection prompt image 16'),
('discovery_reflect-17', 'Discovery reflection prompt image 17'),
('discovery_reflect-18', 'Discovery reflection prompt image 18'),
('discovery_reflect-19', 'Discovery reflection prompt image 19'),
('discovery_reflect-20', 'Discovery reflection prompt image 20'),
('discovery_reflect-21', 'Discovery reflection prompt image 21'),
('discovery_reflect-22', 'Discovery reflection prompt image 22'),
('discovery_reflect-23', 'Discovery reflection prompt image 23'),
('discovery_reflect-24', 'Discovery reflection prompt image 24'),
('discovery_reflect-25', 'Discovery reflection prompt image 25'),
('discovery_reflect-26', 'Discovery reflection prompt image 26'),
('discovery_reflect-27', 'Discovery reflection prompt image 27'),
('discovery_reflect-28', 'Discovery reflection prompt image 28'),
('discovery_reflect-29', 'Discovery reflection prompt image 29'),
('discovery_reflect-30', 'Discovery reflection prompt image 30'),
('discovery_reflect-31', 'Discovery reflection prompt image 31'),
('discovery_reflect-32', 'Discovery reflection prompt image 32'),
('discovery_reflect-33', 'Discovery reflection prompt image 33'),

-- ===== OG / ARCHETYPES =====
('og_archetype_the minimal modernist',   'OG image for Minimal Modernist archetype'),
('og_archetype_the warm eclectic',       'OG image for Warm Eclectic archetype'),
('og_archetype_the bold maximalist',     'OG image for Bold Maximalist archetype'),
('og_archetype_the serene naturalist',   'OG image for Serene Naturalist archetype'),
('og_archetype_the industrial edge',     'OG image for Industrial Edge archetype'),
('og_archetype_the classic traditional', 'OG image for Classic Traditional archetype'),
('og_archetype_the scandi soul',         'OG image for Scandi Soul archetype'),
('og_archetype_the bohemian spirit',     'OG image for Bohemian Spirit archetype'),
('og_archetype_the coastal calm',        'OG image for Coastal Calm archetype'),
('og_archetype_the urban luxe',          'OG image for Urban Luxe archetype'),
('og_style_quiz',                        'OG image for style quiz sharing'),

-- ===== GLOBAL BRAND =====
('brand_logo_light',   'Brand logo — light variant'),
('brand_logo_dark',    'Brand logo — dark variant'),
('brand_favicon',      'Site favicon'),
('brand_og_default',   'Default OG image for social sharing') ON CONFLICT (asset_key) DO NOTHING;
