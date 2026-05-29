-- transformation_stories table for Before & After showcase
CREATE TABLE IF NOT EXISTS public.transformation_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT '',
    before_media TEXT NOT NULL DEFAULT '',
    after_media TEXT NOT NULL DEFAULT '',
    challenge TEXT NOT NULL DEFAULT '',
    design_moves TEXT[] NOT NULL DEFAULT '{}',
    products_used JSONB NOT NULL DEFAULT '[]',
    outcome_metric TEXT NOT NULL DEFAULT '',
    testimonial_quote TEXT,
    testimonial_client_name TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.transformation_stories ENABLE ROW LEVEL SECURITY;

-- Public read for active stories
CREATE POLICY "Public can read active transformation stories"
    ON public.transformation_stories FOR SELECT
    USING (active = true);

-- Admin full access
CREATE POLICY "Admins can manage transformation stories"
    ON public.transformation_stories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_transformation_stories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_transformation_stories_updated_at
    BEFORE UPDATE ON public.transformation_stories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_transformation_stories_updated_at();

-- Seed with existing hardcoded data
INSERT INTO public.transformation_stories (title, location, before_media, after_media, challenge, design_moves, products_used, outcome_metric, testimonial_quote, testimonial_client_name, display_order)
VALUES
(
    'Master Bedroom Makeover',
    'JAMSHEDPUR',
    '',
    '',
    'A dated 450 sq.ft bedroom that felt cramped, disconnected, and visually noisy. The clients wanted calm without sterility.',
    ARRAY['Stripped the accent wall to bare plaster and introduced fluted walnut paneling for acoustic warmth.', 'Replaced generic overhead light with a layered ambient lighting scheme using Philips Hue profiles.', 'Chose Italian marble flooring with underfloor heating to ground the room in tactile luxury.'],
    '[{"name":"Fluted Wall Panels","brand":"Custom Millwork","spec":"American Walnut, 12mm flutes"},{"name":"Ambient Lighting","brand":"Philips Hue","spec":"White Ambiance gradient strips"},{"name":"Italian Marble","brand":"Florim","spec":"Magnum 120x260cm, Calacatta finish"}]'::jsonb,
    'Completed in 30 days — client-reported 40% improvement in sleep quality.',
    'CrossAngle didn''t just redesign our bedroom; they completely changed how we feel when we wake up. The acoustic panelling and lighting made it a true sanctuary.',
    'Rahul & Megha',
    0
),
(
    'Minimalist Kitchen',
    'KOLKATA',
    '',
    '',
    'A 300 sq.ft kitchen with cluttered counters, outdated cabinetry, and zero workflow logic. The family needed both beauty and performance.',
    ARRAY['Implemented handle-less push-to-open cabinetry with Häfele soft-close mechanisms.', 'Installed Arctic White quartz countertop with integrated drainboard for seamless utility.', 'Subway tile backsplash with gold grout accents to anchor the material palette.'],
    '[{"name":"Quartz Countertop","brand":"Caesarstone","spec":"Arctic White, 20mm polished edge"},{"name":"Soft-Close Cabinets","brand":"Häfele","spec":"Blumotion integrated, laminate finish"},{"name":"Built-in Appliances","brand":"Bosch","spec":"Serie 6 oven, induction hob, dishwasher"}]'::jsonb,
    'Completed in 35 days — 60% increase in usable counter space.',
    'We asked for functionality, but they delivered a masterpiece. Every drawer, every hinge feels intentional. It''s the heart of our home now.',
    'The Senguptas',
    1
),
(
    'Executive Office',
    'JAMSHEDPUR',
    '',
    '',
    'A 2000 sq.ft generic office space that felt sterile and uninspiring. The startup needed a space that reflected its innovative culture.',
    ARRAY['Created dedicated biophilic zones with living walls and natural light channels.', 'Engineered ergonomic workstations with sit-stand desks in quiet-zone pods.', 'Acoustic panel accent walls in brand colors to absorb sound while reinforcing identity.'],
    '[{"name":"Engineered Wood Flooring","brand":"Pergo","spec":"Laminate oak with carpet tile zones"},{"name":"Acoustic Panels","brand":"Baux","spec":"Triangular felt tiles, custom color match"},{"name":"LED Panels","brand":"Philips","spec":"TrueForce daylight simulation, 5000K"}]'::jsonb,
    'Completed in 45 days — employee satisfaction survey up 35%.',
    'A space that reflects authority yet feels incredibly inviting. My productivity has genuinely improved since the redesign.',
    'Vikram S.',
    2
);
