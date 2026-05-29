-- Migration: Update gallery_items with working local image paths
-- Date: 2026-05-13
-- Images are served from the /public/images/projects/discovery/ folder.
-- These paths work immediately in dev and production (static assets).
-- When you upload images to ImageKit media library, replace the
-- base URL with: https://ik.imagekit.io/wdrs8y61o/cross-angle

-- Clear old broken data
DELETE FROM public.gallery_items;
DELETE FROM public.gallery_categories;

-- Recreate categories with consistent slugs
INSERT INTO public.gallery_categories (name, slug, display_order) VALUES
  ('Modular Kitchen',       'modular-kitchen',       1),
  ('Bedroom Interior',      'bedroom-interior',      2),
  ('Living Room Interior',  'living-room-interior',  3),
  ('Bathroom',              'bathroom',              4),
  ('Commercial',            'commercial',            5),
  ('Wardrobe',              'wardrobe',              6)
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  kitchen_id  uuid;
  bedroom_id  uuid;
  living_id   uuid;
  bath_id     uuid;
  comm_id     uuid;
  ward_id     uuid;
  -- Change this base to an ImageKit or Supabase URL when images are uploaded
  base TEXT := 'https://iuuivmwqodefdrrrewol.supabase.co/storage/v1/object/public/media/gallery';
BEGIN
  SELECT id INTO kitchen_id FROM gallery_categories WHERE slug = 'modular-kitchen';
  SELECT id INTO bedroom_id FROM gallery_categories WHERE slug = 'bedroom-interior';
  SELECT id INTO living_id  FROM gallery_categories WHERE slug = 'living-room-interior';
  SELECT id INTO bath_id    FROM gallery_categories WHERE slug = 'bathroom';
  SELECT id INTO comm_id    FROM gallery_categories WHERE slug = 'commercial';
  SELECT id INTO ward_id    FROM gallery_categories WHERE slug = 'wardrobe';

  -- ── Modular Kitchen ──────────────────────────────────────────────
  INSERT INTO public.gallery_items (category_id, title, image_url, location, year, description, display_order) VALUES
    (kitchen_id, 'Contemporary Modular Kitchen',   base || '/kitchen-1.jpg',    'Jamshedpur', 2024, 'A sleek modular kitchen with clean lines and optimised storage designed for effortless everyday cooking.', 1),
    (kitchen_id, 'Heritage Kitchen Remodel',       base || '/kitchen-2.jpg',    'Kolkata',    2023, 'Classic cabinetry meets modern appliances in this thoughtfully executed kitchen transformation.', 2),
    (kitchen_id, 'Minimalist Culinary Studio',     base || '/kitchen-3.jpg',    'Ranchi',     2024, 'Stripped-back minimalism with integrated handles and seamless stone surfaces.', 3),
    (kitchen_id, 'Open-Plan Cooking Space',        base || '/kitchen-4.jpg',    'Jamshedpur', 2024, 'Open-plan kitchen designed for entertaining with a central island worktop and ample storage.', 4);

  -- ── Bedroom Interior ─────────────────────────────────────────────
  INSERT INTO public.gallery_items (category_id, title, image_url, location, year, description, display_order) VALUES
    (bedroom_id, 'Serene Master Suite',            base || '/bedroom-1.jpg',    'Jamshedpur', 2023, 'Calming master bedroom with soft neutral tones, layered textures and custom built-in wardrobes.', 1),
    (bedroom_id, 'Modern Bedroom Design',          base || '/bedroom-2.jpg',    'Kolkata',    2023, 'Contemporary bedroom with a statement headboard, ambient lighting and rich earthy palette.', 2),
    (bedroom_id, 'Luxury Villa Bedroom',           base || '/bedroom-3.jpg',    'Jamshedpur', 2024, 'Premium bedroom with floor-to-ceiling drapes, custom wardrobes and a five-star feel.', 3),
    (bedroom_id, 'Cosy Guest Retreat',             base || '/bedroom-4.jpg',    'Ranchi',     2023, 'Warm guest bedroom designed for comfort and hospitality with a calming colour scheme.', 4);

  -- ── Living Room Interior ──────────────────────────────────────────
  INSERT INTO public.gallery_items (category_id, title, image_url, location, year, description, display_order) VALUES
    (living_id, 'Elegant Drawing Room',            base || '/living-1.jpg',     'Jamshedpur', 2023, 'Statement furniture, ambient lighting and a curated art wall define this grand living space.', 1),
    (living_id, 'Open Concept Living',             base || '/living-2.jpg',     'Kolkata',    2024, 'Seamless living-dining flow with cohesive material palette and double-height ceilings.', 2),
    (living_id, 'Contemporary Lounge',             base || '/living-3.jpg',     'Jamshedpur', 2023, 'Urban lounge with sleek lines, premium upholstery and mood-enhancing lighting zones.', 3),
    (living_id, 'Warm Earthy Living Space',        base || '/living-4.jpg',     'Ranchi',     2024, 'A warm earthy palette with layered textiles, indoor plants and warm pendant lighting.', 4);

  -- ── Bathroom ─────────────────────────────────────────────────────
  INSERT INTO public.gallery_items (category_id, title, image_url, location, year, description, display_order) VALUES
    (bath_id,   'Spa-Like Master Bath',            base || '/bathroom-1.jpg',   'Jamshedpur', 2023, 'Spa-inspired master bathroom with rain shower, freestanding tub and calming stone finishes.', 1),
    (bath_id,   'Modern Powder Room',              base || '/bathroom-2.jpg',   'Kolkata',    2024, 'Compact powder room with statement mirror, modern fixtures and dramatic accent wall.', 2),
    (bath_id,   'Minimalist Wet Room',             base || '/bathroom-3.jpg',   'Ranchi',     2024, 'Open wet-room concept with frameless glass, white marble and soft ambient lighting.', 3);

  -- ── Commercial ───────────────────────────────────────────────────
  INSERT INTO public.gallery_items (category_id, title, image_url, location, year, description, display_order) VALUES
    (comm_id,   'Corporate Office Fit-Out',        base || '/commercial-1.jpg', 'Jamshedpur', 2023, 'Brand-forward office focused on productivity with collaborative zones and acoustic panels.', 1),
    (comm_id,   'Boutique Retail Space',           base || '/commercial-2.jpg', 'Kolkata',    2024, 'Boutique interior with curated lighting, premium fixtures and an inviting brand experience.', 2),
    (comm_id,   'Creative Studio Hub',             base || '/commercial-3.jpg', 'Jamshedpur', 2023, 'Collaborative workspace with vibrant energy, flexible furniture and smart zoning.', 3);

  -- ── Wardrobe ─────────────────────────────────────────────────────
  INSERT INTO public.gallery_items (category_id, title, image_url, location, year, description, display_order) VALUES
    (ward_id,   'Walk-In Wardrobe',                base || '/wardrobe-1.jpg',   'Jamshedpur', 2024, 'Floor-to-ceiling walk-in wardrobe with soft-close drawers, pull-out trays and LED strip lighting.', 1),
    (ward_id,   'Sliding Door Wardrobe',           base || '/wardrobe-2.jpg',   'Kolkata',    2023, 'Space-saving sliding door wardrobe with integrated full-length mirrors and custom internal layout.', 2),
    (ward_id,   'Built-In Wardrobe',               base || '/wardrobe-3.jpg',   'Ranchi',     2024, 'Built-in wardrobe with backlit display shelving, velvet-lined jewellery drawers and a fitted dresser.', 3);

END $$;
