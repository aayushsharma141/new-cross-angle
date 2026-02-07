
import { createClient } from '@supabase/supabase-js';

// Assumes env vars are loaded via node --env-file=.env
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in environment");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const services = [
    // Residential
    {
        id: "living-room",
        category_id: "residential",
        title: "Living Room Design",
        slug: "living-room",
        description: "Complete makeovers for your main gathering space. TV units, seating layouts, and ambient lighting to create the perfect atmosphere.",
        hero_image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200",
        icon: "Sofa",
        features: [
            "Custom TV Units & Entertainment centers",
            "Strategic Seating Arrangements",
            "Ambient & Accent Lighting",
            "Wall Treatments & Textures"
        ],
        process_steps: [
            { title: "Consultation", description: "Understanding your lifestyle and entertainment needs." },
            { title: "Layout Planning", description: "Optimizing flow and seating capacity." },
            { title: "3D Visualization", description: "See your new living room before we build." },
            { title: "Execution", description: "Seamless installation of joinery and decor." }
        ],
        faq: [
            { question: "How long does a living room makeover take?", answer: "Typically 3-4 weeks depending on the complexity of custom furniture." },
            { question: "Do you provide loose furniture?", answer: "Yes, we can source and customize sofas, coffee tables, and accent chairs." }
        ]
    },
    {
        id: "bedroom",
        category_id: "residential",
        title: "Bedroom Sanctuaries",
        slug: "bedroom",
        description: "Peaceful retreats with custom wardrobes, false ceilings, and cozy aesthetics designed for relaxation.",
        hero_image: "https://images.unsplash.com/photo-1616594039964-40891a90c309?q=80&w=1200",
        icon: "Home",
        features: [
            "Floor-to-Ceiling Wardrobes",
            "Cozy Lighting Schemes",
            "Acoustic Treatments",
            "Ergonomic Bed Layouts"
        ],
        process_steps: [
            { title: "Needs Analysis", description: "Storage requirements and sleep habits." },
            { title: "Space Planning", description: "Maximizing wardrobes without cramping." },
            { title: "Material Selection", description: "Soft, calming textures and finishes." },
            { title: "Installation", description: "Precision fitting of wardrobes and beds." }
        ],
        faq: [
            { question: "Can you maximize storage in small bedrooms?", answer: "Absolutely. We specialize in hydraulic beds and loft wardrobes to use vertical space." }
        ]
    },
    {
        id: "kitchen",
        category_id: "residential",
        title: "Kitchen & Dining",
        slug: "kitchen",
        description: "Functional and stylish kitchens that become the heart of your home.",
        hero_image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200",
        icon: "UtensilsCrossed",
        features: [
            "Modular Cabinetry",
            "Efficient Work Triangles",
            "Durable Countertops",
            "Smart Storage Accessories"
        ],
        process_steps: [
            { title: "Utility Check", description: "Plumbing, gas, and electrical assessment." },
            { title: "Design", description: "3D modelling of cabinets and appliances." },
            { title: "Fabrication", description: "Factory-finish manufacturing." },
            { title: "Install", description: "On-site assembly and appliance fitting." }
        ],
        faq: [
            { question: "What materials do you use for kitchens?", answer: "We use BWR/BWP grade plywood with laminates, acrylic, or PU finishes for durability." }
        ]
    },
    // Commercial
    {
        id: "office",
        category_id: "commercial",
        title: "Office Interiors",
        slug: "office",
        description: "Productive workspaces with ergonomic planning, conference rooms, and reception areas.",
        hero_image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200",
        icon: "Building2",
        features: [
            "Ergonomic Workstations",
            "Acoustic Meeting Pods",
            "Brand-aligned Reception Areas",
            "Efficient HVAC Integration"
        ],
        process_steps: [
            { title: "Workflow Analysis", description: "Mapping how your team works." },
            { title: "Space Optimization", description: "Maximizing desk count vs. breakout areas." },
            { title: "Branding", description: "Integrating corporate identity into the built environment." },
            { title: "Fit-out", description: "Rapid execution to minimize downtime." }
        ],
        faq: [
            { question: "Do you handle IT and electrical networking?", answer: "Yes, we provide end-to-end turnkey solutions including networking and electricals." }
        ]
    },
    {
        id: "retail",
        category_id: "commercial",
        title: "Retail & Showroom",
        slug: "retail",
        description: "Engaging retail environments designed to maximize customer flow and product display.",
        hero_image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=1200",
        icon: "Lamp",
        features: [
            "Strategic Product Displays",
            "Customer Flow Optimization",
            "Focus Lighting",
            "Checkout Counters"
        ],
        process_steps: [
            { title: "Concept", description: " aligning design with merchandise strategy." },
            { title: "Layout", description: "Preventing bottlenecks and ensuring visibility." },
            { title: "Lighting", description: "Specialized lighting to make products pop." },
            { title: "Launch", description: "Ready for your grand opening." }
        ],
        faq: [
            { question: "Can you work within mall guidelines?", answer: "Yes, we are experienced in adhering to strict mall fit-out guidelines." }
        ]
    },
    // Specialized
    {
        id: "modular-kitchens",
        category_id: "specialized",
        title: "Modular Kitchen Systems",
        slug: "modular-kitchens",
        description: "State-of-the-art modular kitchen systems with premium hardware and finishes.",
        hero_image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200",
        icon: "UtensilsCrossed",
        features: [
            "Hettich/Hafele Hardware",
            "Soft-close Mechanisms",
            "Corner Solutions (Magic Corners)",
            "Under-sink Organizers"
        ],
        process_steps: [
            { title: "Measurement", description: "Laser-precise site measurement." },
            { title: "Factory Production", description: "Machine-pressed finishes for longevity." },
            { title: "Assembly", description: "Quick, mess-free installation." }
        ],
        faq: [
            { question: "What is the warranty on modular kitchens?", answer: "We offer up to 10 years warranty on select hardware and finishes." }
        ]
    },
    {
        id: "ceilings",
        category_id: "specialized",
        title: "False Ceiling & Lighting",
        slug: "ceilings",
        description: "Transformative ceiling designs that define spaces and house advanced lighting systems.",
        hero_image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200",
        icon: "Lightbulb",
        features: [
            "Gypsum & POP Designs",
            "Cove & Profile Lighting",
            "Wooden Rafter Ceilings",
            "Acoustic Ceiling Panels"
        ],
        process_steps: [
            { title: "Design", description: "Reflected Ceiling Plans (RCP)." },
            { title: "Framing", description: "Sturdy GI framing." },
            { title: "Boarding", description: "Seamless gypsum board installation." },
            { title: "Finishing", description: "Painting and light fixture installation." }
        ],
        faq: [
            { question: "Does false ceiling reduce room height?", answer: "It typically takes 4-6 inches, which is negligible for the aesthetic return." }
        ]
    }
];

async function seed() {
    console.log("🌱 Starting seed...");

    // Seed Services
    for (const service of services) {
        // Upsert is safer
        const { error } = await supabase.from('services').upsert({
            id: service.id,
            title: service.title,
            slug: service.slug,
            description: service.description,
            hero_image: service.hero_image,
            category_id: service.category_id,
            icon: service.icon,
            features: service.features,
            process_steps: service.process_steps,
            faq: service.faq,
            display_order: services.indexOf(service)
        }, { onConflict: 'id' });

        if (error) {
            console.error(`❌ Error seeding ${service.title}:`, error.message);
        } else {
            console.log(`✅ Seeded: ${service.title}`);
        }
    }

    console.log("✨ Seed complete!");
}

seed();
