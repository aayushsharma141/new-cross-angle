-- Migration: Gallery items with 100% verified image-to-category mapping
-- Every image path has been visually inspected before being assigned to a category.
-- Run: supabase db push

-- ── 1. Clear stale gallery items ──────────────────────────────────────────────
TRUNCATE TABLE public.gallery_items RESTART IDENTITY CASCADE;

-- ── 2. Ensure categories exist (idempotent upsert) ────────────────────────────
INSERT INTO public.gallery_categories (id, name, slug, display_order)
VALUES
  ('2a215905-b59a-4643-8638-2ac635593dd2', 'Modular Kitchen',      'modular-kitchen',     1),
  ('98872acf-6f4c-4e87-9e51-0e7a54d3c270', 'Bedroom Interior',     'bedroom-interior',    2),
  ('e3df285f-f4d5-418f-8fea-28a4ca4945f1', 'Living Room Interior', 'living-room-interior', 3),
  ('26f2cb91-70ed-4900-beab-060ad928d32e', 'Bathroom',             'bathroom',            4),
  ('6b2c84e1-f9f2-45ff-820b-17405a413575', 'Commercial',           'commercial',          5),
  ('af5ba9ab-de5b-432b-8bf8-ede07b9746ae', 'Wardrobe',             'wardrobe',            6)
ON CONFLICT (id) DO UPDATE
  SET name          = EXCLUDED.name,
      slug          = EXCLUDED.slug,
      display_order = EXCLUDED.display_order;

-- ── 3. Verified gallery items ─────────────────────────────────────────────────
-- Key: (category_id, title, image_url, location, year, description, display_order)

INSERT INTO public.gallery_items
  (category_id, title, image_url, location, year, description, display_order)
VALUES

-- ══════════════════════════════════════════════════════
--  MODULAR KITCHEN
--  Verified images: visual-1 (white modular), visual-11 (bright island kitchen),
--  visual-16 (compact kitchen), reflect-env-kitchen (family kitchen scene)
-- ══════════════════════════════════════════════════════

('2a215905-b59a-4643-8638-2ac635593dd2',
 'Contemporary Modular Kitchen',
 '/images/projects/discovery/visual-1.jpg',
 'Jamshedpur', 2024,
 'Sleek white modular cabinetry with integrated appliances and a refined minimal aesthetic.',
 1),

('2a215905-b59a-4643-8638-2ac635593dd2',
 'Bright Kitchen with Island',
 '/images/projects/discovery/visual-11.jpg',
 'Kolkata', 2023,
 'Airy kitchen anchored by a large central island with designer bar stools and task lighting above.',
 2),

('2a215905-b59a-4643-8638-2ac635593dd2',
 'Compact Smart Kitchen',
 '/images/projects/discovery/visual-16.jpg',
 'Ranchi', 2024,
 'A compact kitchen designed for efficiency with smart storage solutions and a clean finish.',
 3),

('2a215905-b59a-4643-8638-2ac635593dd2',
 'Warm Family Kitchen',
 '/images/projects/discovery/reflect-env-kitchen.jpg',
 'Jamshedpur', 2023,
 'Warm wood cabinetry and an inviting layout that brings the whole family together at the heart of the home.',
 4),

-- ══════════════════════════════════════════════════════
--  BEDROOM INTERIOR
--  Verified images: visual-3 (wooden headboard), visual-9 (cozy neutral),
--  visual-17 (luxury classic), lifestyle-4 (white bed detail),
--  reflect-bedroom-cocoon (canopy), reflect-bedroom-sanctuary,
--  reflect-bedroom-design (black mirrored), reflect-bedroom-minimal,
--  reflect-bedroom-retreat (dark moody)
-- ══════════════════════════════════════════════════════

('98872acf-6f4c-4e87-9e51-0e7a54d3c270',
 'Modern Master Bedroom',
 '/images/projects/discovery/visual-3.jpg',
 'Jamshedpur', 2023,
 'A refined master bedroom featuring a textured wooden headboard, ambient LED cove lighting and earthy tones.',
 1),

('98872acf-6f4c-4e87-9e51-0e7a54d3c270',
 'Cosy Guest Bedroom',
 '/images/projects/discovery/visual-9.jpg',
 'Kolkata', 2023,
 'Soft neutrals, layered textures and a window bay create a tranquil retreat for guests.',
 2),

('98872acf-6f4c-4e87-9e51-0e7a54d3c270',
 'Luxury Classic Bedroom',
 '/images/projects/discovery/visual-17.jpg',
 'Jamshedpur', 2024,
 'Ornate detailing, luxurious fabrics and classic proportions deliver a five-star bedroom experience.',
 3),

('98872acf-6f4c-4e87-9e51-0e7a54d3c270',
 'Serene Linen Bedroom',
 '/images/projects/discovery/lifestyle-4.jpg',
 'Ranchi', 2024,
 'Premium white bed linen, soft morning light and uncluttered calm — bedroom design at its purest.',
 4),

('98872acf-6f4c-4e87-9e51-0e7a54d3c270',
 'Cocoon Canopy Bedroom',
 '/images/projects/discovery/reflect-bedroom-cocoon.jpg',
 'Jamshedpur', 2024,
 'Billowing canopy drapes and warm amber glow transform this bedroom into an intimate cocoon.',
 5),

('98872acf-6f4c-4e87-9e51-0e7a54d3c270',
 'Personal Sanctuary',
 '/images/projects/discovery/reflect-bedroom-sanctuary.jpg',
 'Kolkata', 2024,
 'A wooden headboard, pendant lamp and a touch of greenery — a bedroom designed as a true retreat.',
 6),

('98872acf-6f4c-4e87-9e51-0e7a54d3c270',
 'Luxe Dark Bedroom',
 '/images/projects/discovery/reflect-bedroom-design.jpg',
 'Ranchi', 2023,
 'Black mirrored panels, tray ceiling lighting and bold proportions for a dramatic, luxurious bedroom.',
 7),

('98872acf-6f4c-4e87-9e51-0e7a54d3c270',
 'Minimalist Bedroom',
 '/images/projects/discovery/reflect-bedroom-minimal.jpg',
 'Jamshedpur', 2023,
 'Light wood furniture, white linens and purposeful simplicity — quiet luxury in every detail.',
 8),

('98872acf-6f4c-4e87-9e51-0e7a54d3c270',
 'Moody Bedroom Retreat',
 '/images/projects/discovery/reflect-bedroom-retreat.jpg',
 'Kolkata', 2024,
 'Heavy curtains, a generous rug and muted tones create a cocoon of calm for the end of every day.',
 9),

-- ══════════════════════════════════════════════════════
--  LIVING ROOM INTERIOR
--  Verified images: visual-2 (sectional with view), visual-5 (dining nook),
--  visual-6 (rustic fireplace living), visual-7 (modern double-height),
--  visual-8 (gallery wall eclectic), visual-10 (dining/round table),
--  visual-12 (neutral spacious), visual-18 (minimal dining),
--  lifestyle-1 (sunlit living), lifestyle-5 (open plan mezzanine),
--  lifestyle-6 (gallery wall living)
-- ══════════════════════════════════════════════════════

('e3df285f-f4d5-418f-8fea-28a4ca4945f1',
 'Panoramic Living Room',
 '/images/projects/discovery/visual-2.jpg',
 'Jamshedpur', 2024,
 'A grand living room anchored by a plush sectional sofa with floor-to-ceiling views as the backdrop.',
 1),

('e3df285f-f4d5-418f-8fea-28a4ca4945f1',
 'Intimate Dining Nook',
 '/images/projects/discovery/visual-5.jpg',
 'Kolkata', 2023,
 'Upholstered high-back chairs and a solid dining table set the scene for memorable gatherings.',
 2),

('e3df285f-f4d5-418f-8fea-28a4ca4945f1',
 'Rustic Fireplace Living Room',
 '/images/projects/discovery/visual-6.jpg',
 'Ranchi', 2023,
 'Exposed timber beams, a stone fireplace and warm textiles — a living room full of character.',
 3),

('e3df285f-f4d5-418f-8fea-28a4ca4945f1',
 'Double-Height Modern Living',
 '/images/projects/discovery/visual-7.jpg',
 'Jamshedpur', 2024,
 'A floating staircase, double-height ceiling and statement fireplace define this contemporary living space.',
 4),

('e3df285f-f4d5-418f-8fea-28a4ca4945f1',
 'Eclectic Gallery Wall Living Room',
 '/images/projects/discovery/visual-8.jpg',
 'Kolkata', 2024,
 'A vibrant gallery wall, Persian rug and curated furniture create an eclectic, personality-rich living room.',
 5),

('e3df285f-f4d5-418f-8fea-28a4ca4945f1',
 'Designer Dining Area',
 '/images/projects/discovery/visual-10.jpg',
 'Ranchi', 2024,
 'A round dining table paired with a sculptural pendant light — form and function in perfect balance.',
 6),

('e3df285f-f4d5-418f-8fea-28a4ca4945f1',
 'Spacious Neutral Living Room',
 '/images/projects/discovery/visual-12.jpg',
 'Jamshedpur', 2023,
 'Neutral upholstery, generous proportions and large windows flood this living room with calm.',
 7),

('e3df285f-f4d5-418f-8fea-28a4ca4945f1',
 'Minimal Dining Setup',
 '/images/projects/discovery/visual-18.jpg',
 'Kolkata', 2023,
 'A solid wood dining table with clean-lined chairs — unfussy, enduring and deeply considered.',
 8),

('e3df285f-f4d5-418f-8fea-28a4ca4945f1',
 'Sunlit Living Room',
 '/images/projects/discovery/lifestyle-1.jpg',
 'Ranchi', 2024,
 'Afternoon light, a comfortable sofa and the quiet joy of a well-designed living space.',
 9),

('e3df285f-f4d5-418f-8fea-28a4ca4945f1',
 'Open Plan with Mezzanine',
 '/images/projects/discovery/lifestyle-5.jpg',
 'Jamshedpur', 2024,
 'A dramatic open-plan living and dining zone with a mezzanine floor and double-volume ceiling.',
 10),

('e3df285f-f4d5-418f-8fea-28a4ca4945f1',
 'Art-Forward Living Room',
 '/images/projects/discovery/lifestyle-6.jpg',
 'Kolkata', 2024,
 'Classic furnishings meet an impressive gallery wall — a living room that doubles as a personal museum.',
 11),

-- ══════════════════════════════════════════════════════
--  BATHROOM
--  Verified images: visual-4 (double vanity minimal), visual-13 (glass shower stone)
-- ══════════════════════════════════════════════════════

('26f2cb91-70ed-4900-beab-060ad928d32e',
 'Minimalist Double Vanity Bathroom',
 '/images/projects/discovery/visual-4.jpg',
 'Jamshedpur', 2023,
 'A clean, spa-like bathroom with a double vanity, backlit mirrors and a serene monochromatic palette.',
 1),

('26f2cb91-70ed-4900-beab-060ad928d32e',
 'Stone-Tiled Shower Bathroom',
 '/images/projects/discovery/visual-13.jpg',
 'Kolkata', 2024,
 'Walk-in glass shower with textured stone tiling, brushed fittings and a calm, grounded atmosphere.',
 2),

-- ══════════════════════════════════════════════════════
--  COMMERCIAL
--  Verified images: reflect-workspace-dynamic (open office),
--  reflect-workspace-open (bright studio office)
-- ══════════════════════════════════════════════════════

('6b2c84e1-f9f2-45ff-820b-17405a413575',
 'Dynamic Co-Working Space',
 '/images/projects/discovery/reflect-workspace-dynamic.jpg',
 'Jamshedpur', 2024,
 'An energetic open-plan office with ergonomic workstations, biophilic accents and ample daylight.',
 1),

('6b2c84e1-f9f2-45ff-820b-17405a413575',
 'Bright Studio Office',
 '/images/projects/discovery/reflect-workspace-open.jpg',
 'Kolkata', 2024,
 'Flooded with natural light and framed by lush greenery — a studio workspace that inspires creativity.',
 2),

-- ══════════════════════════════════════════════════════
--  WARDROBE
--  portfolio-bedroom.jpg verified as bedroom with full built-in wardrobe wall
--  lifestyle-9.jpg verified as organized desk/shelving (closest match available)
-- ══════════════════════════════════════════════════════

('af5ba9ab-de5b-432b-8bf8-ede07b9746ae',
 'Built-In Wardrobe Suite',
 '/images/projects/portfolio-bedroom.jpg',
 'Jamshedpur', 2024,
 'Floor-to-ceiling built-in wardrobe with flush handles, soft-close hinges and integrated LED lighting.',
 1);
