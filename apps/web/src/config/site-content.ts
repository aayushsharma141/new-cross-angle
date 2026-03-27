import { LucideIcon, Home, Building2, Lamp, Sofa, UtensilsCrossed, Bed } from "lucide-react";

type ServiceCategory = {
    id: string;
    title: string;
    description: string;
    heroImage: string;
    slug: string; // e.g., 'residential'
    icon: LucideIcon;
};

type ServiceDetail = {
    id: string;
    categoryId: string;
    title: string;
    slug: string; // e.g., 'living-room'
    description: string;
    longDescription?: string; // Markdown supported
    heroImage: string;
    galleryImages?: string[];
    features: string[];
    processSteps: { title: string; description: string }[];
    faq: { question: string; answer: string }[];
    relatedServices?: string[]; // IDs of related services
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
        longDescription: `
### The Heart of Your Home
Your living room is where life happens. It's where you entertain guests, unwind after a long day, and make memories with family. At Cross Angle Interior, we believe your living room should be a perfect reflection of your personality while delivering exceptional comfort.

### Tailored to Your Lifestyle
Whether you prefer a **Minimalist Zen** aesthetic with clean lines and neutral tones, or a **Maximalist Bohemian** vibe with rich textures and colors, our design team works with you to bring your vision to life. We consider every aspect:
*   **Flow & Layout:** ensuring easy movement and conversation circles.
*   **Storage Solutions:** custom TV units and hidden storage to keep clutter at bay.
*   **Lighting Design:** layered lighting from statement chandeliers to cozy floor lamps.

### Premium Materials
We use only high-grade materials for our joinery and soft furnishings, ensuring your living room not only looks stunning on day one but stands the test of time.
        `,
        heroImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200",
        galleryImages: [
            "https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=800",
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800",
            "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?q=80&w=800"
        ],
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
        ],
        relatedServices: ["ceilings", "modular-kitchens"]
    },
    {
        id: "bedroom",
        categoryId: "residential",
        title: "Bedroom Sanctuaries",
        slug: "bedroom",
        description: "Peaceful retreats with custom wardrobes, false ceilings, and cozy aesthetics designed for relaxation.",
        longDescription: `
### Your Private Retreat
A bedroom should be more than just a place to sleep; it should be a sanctuary where you can recharge. We design bedrooms that balance serenity with functionality.

### Custom Wardrobes
Our speciality lies in creating specialized storage solutions. From **Walk-in Closets** with island counters to space-saving **Sliding Wardrobes** with loft storage, we maximize every inch of vertical space.

### Mood Lighting
Lighting plays a crucial role in setting the mood. We integrate warm cove lighting in false ceilings, reading lights in headboards, and automated dimmer systems to help you transition from day to night effortlessly.
        `,
        heroImage: "https://images.unsplash.com/photo-1616594039964-40891a90c309?q=80&w=1200",
        galleryImages: [
            "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800",
            "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=800",
            "https://images.unsplash.com/photo-1505693314120-0a44176374b1?q=80&w=800"
        ],
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
        ],
        relatedServices: ["ceilings", "living-room"]
    },
    {
        id: "kitchen",
        categoryId: "residential",
        title: "Kitchen & Dining",
        slug: "kitchen",
        description: "Functional and stylish kitchens that become the heart of your home.",
        longDescription: `
### The Culinary Hub
In modern Indian homes, the kitchen is often an extension of the living space. We design kitchens that are not only high-performance workspaces but also beautiful enough to show off.

### Ergonomics First
We follow the 'Golden Triangle' rule of kitchen design to ensure your stove, sink, and refrigerator are positioned for maximum efficiency. No more walking unnecessary miles while cooking!

### Material Excellence
Kitchens face heat, moisture, and heavy use. That's why we use:
*   **BWR/BWP Grade Plywood:** Boiling water resistant core.
*   **Quartz Countertops:** Stain and scratch resistant.
*   **Soft-Close Hettich/Hafele Hardware:** For smooth, silent operation.
        `,
        heroImage: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200",
        galleryImages: [
            "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?q=80&w=800",
            "https://images.unsplash.com/photo-1484154218962-a1c00207bf9a?q=80&w=800",
            "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?q=80&w=800"
        ],
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
        ],
        relatedServices: ["modular-kitchens", "living-room"]
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
        ],
        relatedServices: ["retail", "ceilings"]
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
        longDescription: `
### Precision Engineering
Our modular kitchens are not just carpentry; they are engineered systems. Manufactured in state-of-the-art factories, every cabinet is machine-pressed and edge-banded for a finish that hand-carpentry simply cannot match.

### Hardware Partners
We partner with world leaders like **Hettich**, **Hafele**, and **Blum** to bring you the best in kitchen hardware.
*   **Soft-Close Drawers:** Rated for 50,000+ cycles.
*   **Tall Units:** For pantry storage that slides out effortlessly.
*   **Corner Solutions:** Magic corners and carousels to utilize blind corners.
        `,
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
        ],
        relatedServices: ["kitchen", "ceilings"]
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
