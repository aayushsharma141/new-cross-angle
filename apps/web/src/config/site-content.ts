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
        heroImage: "/reality_render.jpg",
        icon: Home,
    },
    {
        id: "commercial",
        title: "Commercial Design",
        slug: "commercial",
        description: "Strategic design solutions that enhance productivity and brand value.",
        heroImage: "/images/projects/discovery/visual-16.jpg",
        icon: Building2,
    },
    {
        id: "specialized",
        title: "Specialized Executions",
        slug: "specialized",
        description: "Expert solutions for niche requirements like modular systems and lighting.",
        heroImage: "/images/projects/discovery/visual-12.jpg",
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
        heroImage: "/reality_render.jpg",
        galleryImages: [
            "/images/projects/discovery/lifestyle-8.jpg",
            "/images/projects/discovery/visual-3.jpg",
            "/images/projects/portfolio-kitchen.jpg"
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
        heroImage: "/images/projects/discovery/lifestyle-7.jpg",
        galleryImages: [
            "/hero_reality_render_1775299733746.png",
            "/images/projects/discovery/visual-18.jpg",
            "/images/projects/discovery/visual-10.jpg"
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
        heroImage: "/images/projects/discovery/visual-12.jpg",
        galleryImages: [
            "/images/projects/discovery/visual-15.jpg",
            "/images/projects/discovery/visual-13.jpg",
            "/images/projects/discovery/visual-15.jpg"
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
        heroImage: "/images/projects/discovery/visual-16.jpg",
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
        heroImage: "/hero_reality_render_1775299733746.png",
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
        heroImage: "/images/projects/discovery/visual-12.jpg",
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
        heroImage: "/images/projects/discovery/visual-3.jpg",
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
    },

    {
        id: "restaurant",
        categoryId: "commercial",
        title: "Restaurant & Cafe",
        slug: "restaurant",
        description: "Memorable dining atmospheres with hospitality-grade detailing.",
        longDescription: `
### Crafting Dining Experiences
A successful restaurant or cafe is about more than just food; it's about the entire sensory experience. We specialize in designing hospitality spaces that captivate guests and streamline operations.

### Durable & Beautiful
Hospitality environments face immense wear and tear. We carefully select materials that offer both aesthetic appeal and commercial-grade durability, ensuring your space looks pristine even after years of high-volume service.
        `,
        heroImage: "/images/projects/discovery/visual-10.jpg", 
        galleryImages: [
            "/images/projects/discovery/visual-17.jpg",
            "/images/projects/discovery/visual-14.jpg",
            "/images/projects/discovery/visual-9.jpg"
        ],
        features: [
            "Optimized Seating Layouts",
            "Acoustic Management",
            "Atmospheric Lighting",
            "Durable Finishes"
        ],
        processSteps: [
            { title: "Concept Design", description: "Establishing the vibe and visual identity." },
            { title: "Spatial Planning", description: "Balancing table count with guest comfort and staff flow." },
            { title: "Material Detailing", description: "Specifying finishes that withstand heavy commercial use." },
            { title: "Execution", description: "Coordinated build-out to meet your opening timeline." }
        ],
        faq: [
            { question: "Do you design commercial kitchens too?", answer: "While we primarily focus on front-of-house design, we collaborate closely with commercial kitchen consultants for a seamless integration." }
        ],
        relatedServices: ["retail", "lighting"]
    },
    {
        id: "lighting",
        categoryId: "specialized",
        title: "Lighting Design",
        slug: "lighting",
        description: "Architectural lighting that transforms ambience and elevates experience.",
        longDescription: `
### The Power of Light
Lighting is the most transformative element of interior design. It has the power to dictate mood, highlight architectural features, and enhance functionality. Our specialized lighting design goes beyond basic illumination to create layered, dynamic environments.

### Technical Precision
We utilize advanced lighting plans that merge aesthetic goals with technical requirements. We consider color temperature (Kelvin), color rendering index (CRI), and beam angles to ensure perfect illumination for every unique space.
        `,
        heroImage: "/images/projects/discovery/visual-9.jpg",
        galleryImages: [
            "/images/projects/discovery/visual-13.jpg",
            "/images/projects/discovery/visual-4.jpg",
            "/images/projects/discovery/visual-12.jpg"
        ],
        features: [
            "Custom Lighting Layouts",
            "Smart Home Integration",
            "Ambient, Task & Accent Layers",
            "Energy Efficient Solutions"
        ],
        processSteps: [
            { title: "Analysis", description: "Evaluating natural light and spatial function." },
            { title: "Design", description: "Developing a comprehensive lighting plan and fixture schedule." },
            { title: "Implementation", description: "Precise electrical wiring and fixture installation." }
        ],
        faq: [
            { question: "Can you integrate with smart home systems?", answer: "Yes, our lighting designs are fully compatible with modern smart home automation systems for complete control." }
        ],
        relatedServices: ["ceilings", "living-room"]
    },
    {
        id: "custom-furniture",
        categoryId: "specialized",
        title: "Custom Furniture",
        slug: "custom-furniture",
        description: "Bespoke furniture crafted to your exact specifications.",
        longDescription: `
### Unique Pieces for Unique Spaces
Standard furniture often falls short when you require specific dimensions, precise color matching, or uncompromising quality. Our custom furniture service bridges this gap by creating pieces that perfectly integrate into your space.

### Superior Craftsmanship
Every piece of custom furniture is handcrafted by skilled artisans. We use premium materials, from solid hardwoods to high-grade upholstery fabrics, ensuring longevity and exceptional comfort.
        `,
        heroImage: "/images/projects/discovery/visual-2.jpg",
        galleryImages: [
            "/images/projects/discovery/visual-17.jpg",
            "/images/projects/discovery/visual-10.jpg",
            "/images/projects/discovery/visual-6.jpg"
        ],
        features: [
            "Made-to-Measure Dimensions",
            "Extensive Fabric & Finish Options",
            "Ergonomic Considerations",
            "Solid Wood Construction"
        ],
        processSteps: [
            { title: "Conceptualization", description: "Sketching and selecting materials based on your requirements." },
            { title: "Prototyping", description: "Reviewing shop drawings and fabric swatches." },
            { title: "Fabrication", description: "Handcrafting in our dedicated workshop." },
            { title: "Delivery", description: "Careful transportation and placement in your home." }
        ],
        faq: [
            { question: "How long does custom furniture take to build?", answer: "Depending on the complexity, it usually takes 4-8 weeks from final approval." }
        ],
        relatedServices: ["living-room", "bedroom"]
    }
];
