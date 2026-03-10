import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://iuuivmwqodefdrrrewol.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_nFloBfKOfoRMtDV0K90b6A_oVxQXUfQ';
const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
    { name: "Residential", slug: "residential" },
    { name: "Commercial", slug: "commercial" },
    { name: "Modular Kitchen", slug: "modular-kitchen" },
    { name: "Bedroom Interior", slug: "bedroom-interior" },
    { name: "Living Room Interior", slug: "living-room-interior" },
    { name: "Exterior", slug: "exterior-interior" }
];

const localProjects = [
    {
        slug: "serene-master-suite",
        title: "Serene Master Suite",
        client_name: "Mr. & Mrs. Sharma",
        location: "Jamshedpur",
        type: "residential",
        category_slug: "residential",
        short_description: "A serene, calming bedroom retreat.",
        area: "450 sq.ft",
        budget: "₹8-10 Lakhs",
        duration: "30 days",
        style: "Contemporary Modern",
        year_completed: 2024,
        cover_image_url: "/src/assets/portfolio-bedroom.jpg",
        brief: "The clients wanted a serene, calming bedroom retreat that promotes relaxation and restful sleep while maintaining a modern aesthetic.",
        approach: "We focused on a neutral color palette with natural materials, incorporating soft textures and ambient lighting to create a peaceful sanctuary.",
        testimonial: {
            quote: "Our bedroom has become our personal retreat. The attention to detail and quality of work exceeded our expectations.",
            author: "Mrs. Sharma",
            role: "Homeowner",
        },
        status: 'live',
        featured: true
    },
    {
        slug: "modern-culinary-space",
        title: "Modern Culinary Space",
        client_name: "Desai Family",
        location: "Kolkata",
        type: "residential",
        category_slug: "residential",
        short_description: "A complete kitchen renovation.",
        area: "300 sq.ft",
        budget: "₹12-15 Lakhs",
        duration: "35 days",
        style: "Modern Minimalist",
        year_completed: 2024,
        cover_image_url: "/src/assets/portfolio-kitchen.jpg",
        brief: "A complete kitchen renovation with focus on functionality, storage optimization, and a clean aesthetic that matches the rest of the home.",
        approach: "We designed a modular kitchen with maximum storage efficiency, incorporating high-end appliances and premium finishes for a luxurious cooking experience.",
        testimonial: {
            quote: "The kitchen is now the heart of our home. Cooking has become a joy!",
            author: "Mrs. Desai",
            role: "Homeowner",
        },
        status: 'live',
        featured: true
    },
    {
        slug: "executive-workspace",
        title: "Executive Workspace",
        client_name: "TechStart Solutions",
        location: "Jamshedpur",
        type: "commercial",
        category_slug: "commercial",
        short_description: "A professional office environment.",
        area: "2000 sq.ft",
        budget: "₹25-30 Lakhs",
        duration: "45 days",
        style: "Corporate Modern",
        year_completed: 2023,
        cover_image_url: "/src/assets/portfolio-office.jpg",
        brief: "Design a professional office environment that promotes creativity, productivity, and reflects the innovative spirit of a tech startup.",
        approach: "We created an open-plan workspace with dedicated zones for collaboration, focus work, and client meetings, incorporating biophilic design elements.",
        testimonial: {
            quote: "Our new office has transformed how our team works. The space truly reflects our company culture.",
            author: "Vikram Singh",
            role: "CEO, TechStart Solutions",
        },
        status: 'live',
        featured: true
    }
];

async function run() {
    console.log('Logging in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'sharma1.aayu@gmail.com',
        password: 'cross1@AS'
    });

    if (authError) {
        console.error('Login Failed:', authError);
        return;
    }

    console.log('Creating categories...');
    const catMap = {};

    for (let i = 0; i < categories.length; i++) {
        const c = categories[i];
        let { data: existing } = await supabase.from('project_categories').select('*').eq('name', c.name).single();

        if (!existing) {
            const { data: inserted, error: insertError } = await supabase.from('project_categories').insert({
                name: c.name,
                slug: c.slug,
                display_order: i
            }).select().single();

            if (insertError) console.error("Error inserting cat:", insertError);
            else existing = inserted;
        }

        if (existing) {
            catMap[c.slug] = existing.id;
            console.log(`Prepared category: ${existing.name}`);
        }
    }

    console.log('Creating projects...');
    for (const p of localProjects) {
        const descriptionJson = {
            area: p.area,
            budget: p.budget,
            duration: p.duration,
            brief: p.brief,
            approach: p.approach
        };

        const payload = {
            title: p.title,
            slug: p.slug,
            category_id: catMap[p.category_slug] || null,
            client_name: p.client_name,
            location: p.location,
            year_completed: p.year_completed,
            style_tags: [p.style],
            short_description: p.short_description,
            description: descriptionJson,
            cover_image_url: p.cover_image_url,
            featured: p.featured,
            status: p.status,
            published_at: new Date().toISOString()
        };

        const { data: existing } = await supabase.from('projects').select('id').eq('slug', p.slug).single();

        if (existing) {
            await supabase.from('projects').update(payload).eq('id', existing.id);
            console.log(`Updated project: ${p.title}`);
        } else {
            const { error } = await supabase.from('projects').insert(payload);
            if (error) console.error(`Error inserting ${p.title}:`, error);
            else console.log(`Inserted project: ${p.title}`);
        }
    }

    console.log('Database seeded with fallback portfolio structure successfully.');
}
run();
