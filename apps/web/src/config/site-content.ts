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
        heroImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200", 
        galleryImages: [
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800",
            "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800",
            "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=800"
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
        heroImage: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=1200",
        galleryImages: [
            "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?q=80&w=800",
            "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=800",
            "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=800"
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
        heroImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200",
        galleryImages: [
            "https://images.unsplash.com/photo-1538688423619-a8ddccfb10df?q=80&w=800",
            "https://images.unsplash.com/photo-1505693314120-0a44176374b1?q=80&w=800",
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800"
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
