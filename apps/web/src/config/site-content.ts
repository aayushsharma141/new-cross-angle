import { LucideIcon, Home, Building2, Lamp, Sofa, UtensilsCrossed, Bed } from "lucide-react";

export type ServiceCategory = {
    id: string;
    title: string;
    description: string;
    heroImage: string;
    slug: string; // e.g., 'residential'
    icon: LucideIcon;
};

export type ServiceDetail = {
    id: string;
    categoryId: string;
    title: string;
    slug: string; // e.g., 'living-room'
    description: string;
    heroImage: string;
    features: string[];
    processSteps: { title: string; description: string }[];
    faq: { question: string; answer: string }[];
};

export const serviceCategories: ServiceCategory[] = [
    {
        id: "residential",
        title: "Residential Design",
        slug: "residential",
        description: "Crafting personalized homes that reflect your lifestyle and personality.",
        heroImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200",
        icon: Home,
    },
    {
        id: "commercial",
        title: "Commercial Design",
        slug: "commercial",
        description: "Strategic design solutions that enhance productivity and brand value.",
        heroImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200",
        icon: Building2,
    },
    {
        id: "specialized",
        title: "Specialized Executions",
        slug: "specialized",
        description: "Expert solutions for niche requirements like modular systems and lighting.",
        heroImage: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200",
        icon: Lamp,
    },
];

export const services: ServiceDetail[] = [
    // Residential
    {
        id: "living-room",
        categoryId: "residential",
        title: "Living Room Design",
        slug: "living-room",
        description: "Complete makeovers for your main gathering space. TV units, seating layouts, and ambient lighting to create the perfect atmosphere.",
        heroImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200",
        features: [
            "Custom TV Units & Entertainment centers",
            "Strategic Seating Arrangements",
            "Ambient & Accent Lighting",
            "Wall Treatments & Textures"
        ],
        processSteps: [
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
        categoryId: "residential",
        title: "Bedroom Sanctuaries",
        slug: "bedroom",
        description: "Peaceful retreats with custom wardrobes, false ceilings, and cozy aesthetics designed for relaxation.",
        heroImage: "https://images.unsplash.com/photo-1616594039964-40891a90c309?q=80&w=1200",
        features: [
            "Floor-to-Ceiling Wardrobes",
            "Cozy Lighting Schemes",
            "Acoustic Treatments",
            "Ergonomic Bed Layouts"
        ],
        processSteps: [
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
        categoryId: "residential",
        title: "Kitchen & Dining",
        slug: "kitchen",
        description: "Functional and stylish kitchens that become the heart of your home.",
        heroImage: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200",
        features: [
            "Modular Cabinetry",
            "Efficient Work Triangles",
            "Durable Countertops",
            "Smart Storage Accessories"
        ],
        processSteps: [
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
        categoryId: "commercial",
        title: "Office Interiors",
        slug: "office",
        description: "Productive workspaces with ergonomic planning, conference rooms, and reception areas.",
        heroImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200",
        features: [
            "Ergonomic Workstations",
            "Acoustic Meeting Pods",
            "Brand-aligned Reception Areas",
            "Efficient HVAC Integration"
        ],
        processSteps: [
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
        categoryId: "commercial",
        title: "Retail & Showroom",
        slug: "retail",
        description: "Engaging retail environments designed to maximize customer flow and product display.",
        heroImage: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=1200",
        features: [
            "Strategic Product Displays",
            "Customer Flow Optimization",
            "Focus Lighting",
            "Checkout Counters"
        ],
        processSteps: [
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
        categoryId: "specialized",
        title: "Modular Kitchen Systems",
        slug: "modular-kitchens",
        description: "State-of-the-art modular kitchen systems with premium hardware and finishes.",
        heroImage: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200",
        features: [
            "Hettich/Hafele Hardware",
            "Soft-close Mechanisms",
            "Corner Solutions (Magic Corners)",
            "Under-sink Organizers"
        ],
        processSteps: [
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
        categoryId: "specialized",
        title: "False Ceiling & Lighting",
        slug: "ceilings",
        description: "Transformative ceiling designs that define spaces and house advanced lighting systems.",
        heroImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200",
        features: [
            "Gypsum & POP Designs",
            "Cove & Profile Lighting",
            "Wooden Rafter Ceilings",
            "Acoustic Ceiling Panels"
        ],
        processSteps: [
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
