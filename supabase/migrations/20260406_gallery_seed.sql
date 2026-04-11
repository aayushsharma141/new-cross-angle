-- Seed Gallery Data
-- Run this to populate initial gallery content

-- First, clear existing data (optional)
-- DELETE FROM public.gallery_items;
-- DELETE FROM public.gallery_categories;

-- Insert Categories
INSERT INTO public.gallery_categories (name, slug, display_order) VALUES
  ('Modular Kitchen', 'modular-kitchen', 1),
  ('Bedroom', 'bedroom', 2),
  ('Living Room', 'living-room', 3),
  ('Bathroom', 'bathroom', 4),
  ('Office', 'office', 5)
ON CONFLICT (slug) DO NOTHING;

-- Get category IDs for reference
DO $$
DECLARE
  kitchen_id uuid;
  bedroom_id uuid;
  living_id uuid;
  bathroom_id uuid;
  office_id uuid;
BEGIN
  SELECT id INTO kitchen_id FROM gallery_categories WHERE slug = 'modular-kitchen';
  SELECT id INTO bedroom_id FROM gallery_categories WHERE slug = 'bedroom';
  SELECT id INTO living_id FROM gallery_categories WHERE slug = 'living-room';
  SELECT id INTO bathroom_id FROM gallery_categories WHERE slug = 'bathroom';
  SELECT id INTO office_id FROM gallery_categories WHERE slug = 'office';

  -- Insert Gallery Items (sample URLs - replace with actual images)
  INSERT INTO public.gallery_items (category_id, title, subtitle, image_url, location, year, description, display_order) VALUES
    (kitchen_id, 'Contemporary Modular Kitchen', 'White & Wood Design', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-K1.png', 'Jamshedpur', 2023, 'A sleek white-and-wood modular kitchen designed for effortless functionality and modern appeal.', 1),
    (kitchen_id, 'Heritage Kitchen Remodel', 'Classic Cabinetry', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-K2.png', 'Kolkata', 2023, 'Classic cabinetry meets modern appliances in this thoughtfully executed kitchen transformation.', 2),
    (kitchen_id, 'Minimalist Culinary Studio', 'Stripped-Back Design', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-K3.png', 'Ranchi', 2024, 'A stripped-back minimalist kitchen with integrated handles and seamless surfaces.', 3),
    (kitchen_id, 'Open-Plan Cooking Space', 'Entertainment Kitchen', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-K4.png', 'Jamshedpur', 2024, 'An open-plan kitchen designed for entertaining, combining island worktop with ample storage.', 4),
    
    (bedroom_id, 'Serene Master Bedroom', 'Peaceful Retreat', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-1.png', 'Jamshedpur', 2023, 'A calming master bedroom with soft neutral tones and luxurious textures.', 1),
    (bedroom_id, 'Modern Kids Room', 'Playful & Functional', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-2.png', 'Kolkata', 2023, 'A vibrant kids room combining playful colors with smart storage solutions.', 2),
    (bedroom_id, 'Luxury Villa Bedroom', 'Premium Finish', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-3.png', 'Jamshedpur', 2024, 'Expensive bedroom design with premium finishes and custom wardrobes.', 3),
    (bedroom_id, 'Cozy Guest Room', 'Warm & Inviting', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-4.png', 'Ranchi', 2023, 'A warm guest bedroom designed for comfort and hospitality.', 4),
    
    (living_id, 'Elegant Drawing Room', 'Grand Living Space', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-5.png', 'Jamshedpur', 2023, 'An elegant living room with statement furniture and ambient lighting.', 1),
    (living_id, 'Open Concept Living', 'Seamless Flow', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-6.png', 'Kolkata', 2024, 'Open concept living dining area with cohesive design language.', 2),
    (living_id, 'Contemporary Lounge', 'Urban Style', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-7.png', 'Jamshedpur', 2023, 'Modern lounge space with sleek lines and premium materials.', 3),
    (living_id, 'Classic Sofa Setup', 'Timeless Design', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-8.png', 'Ranchi', 2024, 'Classic living room arrangement with traditional touches.', 4),
    
    (bathroom_id, 'Spa-Like Bathroom', 'Luxury Retreat', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-9.png', 'Jamshedpur', 2023, 'A spa-inspired bathroom with premium fixtures and calming aesthetics.', 1),
    (bathroom_id, 'Modern Powder Room', 'Sleek & Compact', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-10.png', 'Kolkata', 2024, 'Contemporary powder room with modern fittings and mirror.', 2),
    
    (office_id, 'Corporate Office', 'Professional Space', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-11.png', 'Jamshedpur', 2023, 'Corporate office design focused on productivity and brand identity.', 1),
    (office_id, 'Home Office Setup', 'Work From Home', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-12.png', 'Ranchi', 2024, 'Functional home office with ergonomic furniture and storage.', 2),
    (office_id, 'Startup Workspace', 'Creative Hub', 'https://crossangleinterior.com/wp-content/uploads/2023/10/660x400px-13.png', 'Kolkata', 2023, 'Modern startup office with collaborative spaces and vibrant energy.', 3);
END $$;
