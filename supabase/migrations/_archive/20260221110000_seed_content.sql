-- Seed Data for Crossangle CMS
-- Generated based on existing hardcoded content in apps/web/src
-- 1. Site Settings
INSERT INTO public.site_settings (
        studio_name,
        tagline,
        email,
        phone,
        address,
        social_links,
        nav_links
    )
VALUES (
        'Crossangle Interior',
        'Architects of Anticipation',
        'info@crossangleinterior.com',
        '+91 7909041132',
        '2-G, 2nd floor, Aditya Signature building, Dimna Rd, Mango, Jamshedpur, Jharkhand 831012',
        '{"instagram": "https://www.instagram.com/crossangleinterior/", "facebook": "https://www.facebook.com/crossangleinterior"}'::jsonb,
        '[
        {"name": "Home", "href": "/"},
        {"name": "About Us", "href": "/about-us"},
        {"name": "Services", "href": "/services"},
        {"name": "Our Works", "href": "/gallery"},
        {"name": "Blog", "href": "/blog"},
        {"name": "Contact Us", "href": "/contact-us"},
        {"name": "Get Estimate", "href": "/estimate"}
    ]'::jsonb
    ) ON CONFLICT DO NOTHING;
-- 2. Page Sections
-- Home Hero
INSERT INTO public.page_sections (page, section_key, title, subtitle, extra)
VALUES (
        'home',
        'hero',
        'Elevate Your Space Into Luxury',
        'Transforming your vision into exquisite living spaces with innovative and personalized interior design solutions.',
        '{"badge": "Premier Interior Design Studio"}'::jsonb
    ) ON CONFLICT (page, section_key) DO NOTHING;
-- About Intro
INSERT INTO public.page_sections (page, section_key, title, body, extra)
VALUES (
        'about',
        'intro',
        'Creating Spaces That Inspire',
        'Welcome to Cross Angle Interior—where we architect anticipation. Our studio is a sanctuary for visionary design, where every commission is treated as a silent curation of legacy. We believe true design transcends the ornamental. It is the silent curator of experience, crafting atmospheres that resonate with the soul and anticipate the future of living.',
        '{"stats": [
        {"label": "Years Experience", "value": 15, "suffix": "+"}, 
        {"label": "Happy Clients", "value": 500, "suffix": "+"}, 
        {"label": "Projects Completed", "value": 750, "suffix": "+"}, 
        {"label": "Design Awards", "value": 25, "suffix": "+"}
    ]}'::jsonb
    ) ON CONFLICT (page, section_key) DO NOTHING;
-- 3. Project Categories
INSERT INTO public.project_categories (name, slug, display_order)
VALUES ('Residential', 'residential', 1),
    ('Commercial', 'commercial', 2) ON CONFLICT (name) DO NOTHING;
-- 4. Projects
-- variables for category ids
DO $$
DECLARE cat_res_id UUID;
cat_com_id UUID;
proj_id UUID;
svc_id UUID;
BEGIN
SELECT id INTO cat_res_id
FROM public.project_categories
WHERE slug = 'residential';
SELECT id INTO cat_com_id
FROM public.project_categories
WHERE slug = 'commercial';
-- Project 1: Serene Master Suite
INSERT INTO public.projects (
        title,
        slug,
        client_name,
        location,
        year_completed,
        category_id,
        style_tags,
        short_description,
        description,
        cover_image_url,
        status,
        featured
    )
VALUES (
        'Serene Master Suite',
        'serene-master-suite',
        'Mr. & Mrs. Sharma',
        'Jamshedpur',
        2024,
        cat_res_id,
        ARRAY ['Contemporary Modern'],
        'The clients wanted a serene, calming bedroom retreat that promotes relaxation and restful sleep while maintaining a modern aesthetic.',
        '{"brief": "The clients wanted a serene, calming bedroom retreat that promotes relaxation and restful sleep while maintaining a modern aesthetic.", "approach": "We focused on a neutral color palette with natural materials, incorporating soft textures and ambient lighting.", "materials": [{"name": "Flooring", "details": "Italian Marble"}, {"name": "Wall Finish", "details": "Asian Paints Royale"}]}'::jsonb,
        '/assets/portfolio-bedroom.jpg',
        -- Placeholder path, needs real URL update eventually
        'live',
        true
    ) ON CONFLICT (slug) DO NOTHING;
-- Project 2: Modern Culinary Space
INSERT INTO public.projects (
        title,
        slug,
        client_name,
        location,
        year_completed,
        category_id,
        style_tags,
        short_description,
        description,
        cover_image_url,
        status,
        featured
    )
VALUES (
        'Modern Culinary Space',
        'modern-culinary-space',
        'Desai Family',
        'Kolkata',
        2024,
        cat_res_id,
        ARRAY ['Modern Minimalist'],
        'A complete kitchen renovation with focus on functionality, storage optimization, and a clean aesthetic.',
        '{"brief": "Complete kitchen renovation.", "approach": "Modular kitchen with max storage efficiency."}'::jsonb,
        '/assets/portfolio-kitchen.jpg',
        'live',
        true
    ) ON CONFLICT (slug) DO NOTHING;
-- Project 3: Executive Workspace
INSERT INTO public.projects (
        title,
        slug,
        client_name,
        location,
        year_completed,
        category_id,
        style_tags,
        short_description,
        description,
        cover_image_url,
        status,
        featured
    )
VALUES (
        'Executive Workspace',
        'executive-workspace',
        'TechStart Solutions',
        'Jamshedpur',
        2023,
        cat_com_id,
        ARRAY ['Corporate Modern'],
        'Design a professional office environment that promotes creativity and productivity.',
        '{"brief": "Professional office environment.", "approach": "Open-plan workspace with zones."}'::jsonb,
        '/assets/portfolio-office.jpg',
        'live',
        true
    ) ON CONFLICT (slug) DO NOTHING;
-- 5. Services
-- Residential: Living Room
INSERT INTO public.services (
        name,
        slug,
        short_tag,
        short_description,
        description,
        display_order
    )
VALUES (
        'Living Room Design',
        'living-room',
        'Residential',
        'Complete makeovers for your main gathering space. TV units, seating layouts, and ambient lighting.',
        '{"longDescription": "Your living room is where life happens..."}'::jsonb,
        1
    ) ON CONFLICT (slug) DO
UPDATE
SET updated_at = NOW()
RETURNING id INTO svc_id;
-- Steps for Living Room
IF svc_id IS NOT NULL THEN
INSERT INTO public.service_steps (service_id, step_number, title, description)
VALUES (
        svc_id,
        1,
        'Consultation',
        'Understanding your lifestyle and entertainment needs.'
    ),
    (
        svc_id,
        2,
        'Layout Planning',
        'Optimizing flow and seating capacity.'
    ),
    (
        svc_id,
        3,
        '3D Visualization',
        'See your new living room before we build.'
    ),
    (
        svc_id,
        4,
        'Execution',
        'Seamless installation of joinery and decor.'
    );
INSERT INTO public.service_faqs (service_id, question, answer)
VALUES (
        svc_id,
        'How long does a living room makeover take?',
        'Typically 3-4 weeks depending on the complexity.'
    ),
    (
        svc_id,
        'Do you provide loose furniture?',
        'Yes, we can source and customize sofas, coffee tables, etc.'
    );
END IF;
-- Residential: Bedroom
INSERT INTO public.services (
        name,
        slug,
        short_tag,
        short_description,
        description,
        display_order
    )
VALUES (
        'Bedroom Sanctuaries',
        'bedroom',
        'Residential',
        'Peaceful retreats with custom wardrobes, false ceilings, and cozy aesthetics.',
        '{"longDescription": "A bedroom should be more than just a place to sleep..."}'::jsonb,
        2
    ) ON CONFLICT (slug) DO
UPDATE
SET updated_at = NOW()
RETURNING id INTO svc_id;
IF svc_id IS NOT NULL THEN
INSERT INTO public.service_steps (service_id, step_number, title, description)
VALUES (
        svc_id,
        1,
        'Needs Analysis',
        'Storage requirements and sleep habits.'
    ),
    (
        svc_id,
        2,
        'Space Planning',
        'Maximizing wardrobes without cramping.'
    ),
    (
        svc_id,
        3,
        'Material Selection',
        'Soft, calming textures and finishes.'
    ),
    (
        svc_id,
        4,
        'Installation',
        'Precision fitting of wardrobes and beds.'
    );
INSERT INTO public.service_faqs (service_id, question, answer)
VALUES (
        svc_id,
        'Can you maximize storage in small bedrooms?',
        'Absolutely. We specialize in hydraulic beds and loft wardrobes.'
    );
END IF;
-- Residential: Kitchen
INSERT INTO public.services (
        name,
        slug,
        short_tag,
        short_description,
        description,
        display_order
    )
VALUES (
        'Kitchen & Dining',
        'kitchen',
        'Residential',
        'Functional and stylish kitchens that become the heart of your home.',
        '{"longDescription": "The Culinary Hub..."}'::jsonb,
        3
    ) ON CONFLICT (slug) DO
UPDATE
SET updated_at = NOW()
RETURNING id INTO svc_id;
IF svc_id IS NOT NULL THEN
INSERT INTO public.service_steps (service_id, step_number, title, description)
VALUES (
        svc_id,
        1,
        'Utility Check',
        'Plumbing, gas, and electrical assessment.'
    ),
    (
        svc_id,
        2,
        'Design',
        '3D modelling of cabinets and appliances.'
    ),
    (
        svc_id,
        3,
        'Fabrication',
        'Factory-finish manufacturing.'
    ),
    (
        svc_id,
        4,
        'Install',
        'On-site assembly and appliance fitting.'
    );
INSERT INTO public.service_faqs (service_id, question, answer)
VALUES (
        svc_id,
        'What materials do you use for kitchens?',
        'We use BWR/BWP grade plywood with laminates, acrylic, or PU finishes.'
    );
END IF;
-- Commercial: Office
INSERT INTO public.services (
        name,
        slug,
        short_tag,
        short_description,
        description,
        display_order
    )
VALUES (
        'Office Interiors',
        'office',
        'Commercial',
        'Productive workspaces with ergonomic planning, conference rooms, and reception areas.',
        '{"longDescription": "Productive workspaces..."}'::jsonb,
        4
    ) ON CONFLICT (slug) DO
UPDATE
SET updated_at = NOW()
RETURNING id INTO svc_id;
IF svc_id IS NOT NULL THEN
INSERT INTO public.service_steps (service_id, step_number, title, description)
VALUES (
        svc_id,
        1,
        'Workflow Analysis',
        'Mapping how your team works.'
    ),
    (
        svc_id,
        2,
        'Space Optimization',
        'Maximizing desk count vs. breakout areas.'
    ),
    (
        svc_id,
        3,
        'Branding',
        'Integrating corporate identity.'
    ),
    (
        svc_id,
        4,
        'Fit-out',
        'Rapid execution to minimize downtime.'
    );
INSERT INTO public.service_faqs (service_id, question, answer)
VALUES (
        svc_id,
        'Do you handle IT and electrical networking?',
        'Yes, we provide end-to-end turnkey solutions.'
    );
END IF;
-- Specialized: Modular Kitchens
INSERT INTO public.services (
        name,
        slug,
        short_tag,
        short_description,
        description,
        display_order
    )
VALUES (
        'Modular Kitchen Systems',
        'modular-kitchens',
        'Specialized',
        'State-of-the-art modular kitchen systems with premium hardware and finishes.',
        '{"longDescription": "Precision Engineering..."}'::jsonb,
        5
    ) ON CONFLICT (slug) DO
UPDATE
SET updated_at = NOW()
RETURNING id INTO svc_id;
IF svc_id IS NOT NULL THEN
INSERT INTO public.service_steps (service_id, step_number, title, description)
VALUES (
        svc_id,
        1,
        'Measurement',
        'Laser-precise site measurement.'
    ),
    (
        svc_id,
        2,
        'Factory Production',
        'Machine-pressed finishes.'
    ),
    (
        svc_id,
        3,
        'Assembly',
        'Quick, mess-free installation.'
    );
INSERT INTO public.service_faqs (service_id, question, answer)
VALUES (
        svc_id,
        'What is the warranty on modular kitchens?',
        'We offer up to 10 years warranty on select hardware and finishes.'
    );
END IF;
-- 6. Testimonials
INSERT INTO public.testimonials (
        author_name,
        role,
        content,
        rating,
        active,
        project_id
    )
VALUES (
        'Priya Sharma',
        'Homeowner',
        'Crossangle Interior transformed our home beyond our expectations. Their attention to detail and creative vision made our space truly luxurious.',
        5,
        true,
        NULL
    ),
    (
        'Rajesh Kumar',
        'Business Owner',
        'The team delivered an exceptional office design that perfectly reflects our brand identity. Professional, timely, and incredibly talented.',
        5,
        true,
        NULL
    ),
    (
        'Anita Desai',
        'Apartment Owner',
        'From concept to completion, the entire experience was seamless. They understood our vision and executed it flawlessly.',
        5,
        true,
        NULL
    );
END $$;
END $$;