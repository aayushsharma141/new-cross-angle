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
        description: "Creating custom homes that match your lifestyle.",
        heroImage: "/reality_render.jpg",
        icon: Home,
    },
    {
        id: "commercial",
        title: "Commercial Design",
        slug: "commercial",
        description: "Smart designs that improve work and build your brand.",
        heroImage: "/images/projects/discovery/visual-16.jpg",
        icon: Building2,
    },
    {
        id: "specialized",
        title: "Specialized Executions",
        slug: "specialized",
        description: "Special focus on custom lighting and modular setups.",
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
        description: "Complete updates for your main living space. We design TV areas, seating, and lighting for the perfect mood.",
        longDescription: `
### The Heart of Your Home
Your living room is where life happens. It's where you host guests, relax, and enjoy family time. We make sure it feels like you and is completely comfortable.

### Tailored to Your Lifestyle
Whether you prefer a **Clean & Calm** look or a **Rich & Bold** style, our team makes it happen. We focus on:
*   **Space & Flow:** Easy movement and great conversation spots.
*   **Smart Storage:** Custom TV units and hidden storage to keep things tidy.
*   **Great Lighting:** A mix of bright and cozy lights for any time of day.

### Premium Materials
We use only high-quality materials for your cabinets and fabrics, ensuring your room looks great and lasts long.
        `,
        heroImage: "/reality_render.jpg",
        galleryImages: [
            "/images/projects/discovery/lifestyle-8.jpg",
            "/images/projects/discovery/visual-3.jpg",
            "/images/projects/portfolio-kitchen.jpg"
        ],
        features: [
            "Custom TV & Media Units",
            "Smart Seating Layouts",
            "Layered Lighting",
            "Premium Wall Finishes"
        ],
        processSteps: [
            { title: "Consultation", description: "Understanding your lifestyle and needs." },
            { title: "Layout Planning", description: "Planning the best use of space." },
            { title: "3D Visuals", description: "See your new living room before we build." },
            { title: "Execution", description: "Seamless setup of cabinets and decor." }
        ],
        faq: [
            { question: "How long does a living room makeover take?", answer: "Typically 3-4 weeks depending on the custom furniture." },
            { question: "Do you provide loose furniture?", answer: "Yes, we can source and customize sofas, tables, and chairs." }
        ],
        relatedServices: ["ceilings", "modular-kitchens"]
    },
    {
        id: "bedroom",
        categoryId: "residential",
        title: "Bedroom Sanctuaries",
        slug: "bedroom",
        description: "Quiet spaces designed for rest, featuring custom wardrobes and warm lighting.",
        longDescription: `
### Your Private Retreat
A bedroom is your personal sanctuary. We design rooms that offer true rest and comfort. 

### Custom Wardrobes
Our speciality lies in creating great storage. From **Walk-in Closets** to space-saving **Sliding Wardrobes**, we make use of every inch of space.

### Mood Lighting
Lighting plays a big role in setting the mood. We include warm ceiling lights, reading lamps, and easy dimmers to help you relax effortlessly.
        `,
        heroImage: "/images/projects/discovery/lifestyle-7.jpg",
        galleryImages: [
            "/hero_reality_render_1775299733746.png",
            "/images/projects/discovery/visual-18.jpg",
            "/images/projects/discovery/visual-10.jpg"
        ],
        features: [
            "Full-Height Wardrobes",
            "Warm Lighting Setup",
            "Sound-Damping Materials",
            "Comfortable Bed Designs"
        ],
        processSteps: [
            { title: "Understanding Needs", description: "Checking your storage needs and habits." },
            { title: "Smart Layouts", description: "Maximizing wardrobes without crowding." },
            { title: "Choosing Materials", description: "Soft, calming textures and colors." },
            { title: "Fitting & Assembly", description: "Precision setup of wardrobes and beds." }
        ],
        faq: [
            { question: "Can you maximize storage in small bedrooms?", answer: "Absolutely. We specialize in beds with storage and tall wardrobes to use all the space." }
        ],
        relatedServices: ["ceilings", "living-room"]
    },
    {
        id: "kitchen",
        categoryId: "residential",
        title: "Kitchen & Dining",
        slug: "kitchen",
        description: "Beautiful, easy-to-use kitchens made for your home.",
        longDescription: `
### The Culinary Hub
In modern homes, the kitchen is where everyone gathers. We build kitchens that look amazing and make cooking easy.

### Easy Layouts
We follow smart layout rules so your stove, sink, and fridge are exactly where you need them. No more walking extra steps while cooking!

### Built to Last
Kitchens face heat, water, and heavy use. That's why we use:
*   **Water-Proof Premium Wood:** For a strong core.
*   **Strong Countertops:** Stain and scratch resistant.
*   **Smooth Hardware:** For easy, silent drawers.
        `,
        heroImage: "/images/projects/discovery/visual-12.jpg",
        galleryImages: [
            "/images/projects/discovery/visual-15.jpg",
            "/images/projects/discovery/visual-13.jpg",
            "/images/projects/discovery/visual-15.jpg"
        ],
        features: [
            "Custom Cabinets",
            "Smart Cooking Layout",
            "Strong Countertops",
            "Clever Storage"
        ],
        processSteps: [
            { title: "Checking Plumbing & Power", description: "Making sure water and electrics are ready." },
            { title: "3D Planning", description: "Seeing the cabinets and appliances together." },
            { title: "Building the Cabinets", description: "Factory-finish manufacturing." },
            { title: "Final Setup", description: "On-site assembly and appliance fitting." }
        ],
        faq: [
            { question: "What materials do you use for kitchens?", answer: "We use premium water-proof wood with strong finishes for durability." }
        ],
        relatedServices: ["modular-kitchens", "living-room"]
    },

    // Commercial
    {
        id: "office",
        categoryId: "commercial",
        title: "Office Interiors",
        slug: "office",
        description: "Workspaces built for comfort and focus, including meeting and reception areas.",
        heroImage: "/images/projects/discovery/visual-16.jpg",
        features: [
            "Comfortable Desks",
            "Quiet Meeting Rooms",
            "Branded Reception Areas",
            "Good Air & Cooling Setup"
        ],
        processSteps: [
            { title: "Understanding Your Work", description: "Seeing how your team works." },
            { title: "Best Use of Space", description: "Balancing desks and break areas." },
            { title: "Adding Your Brand Look", description: "Making the office reflect your company." },
            { title: "Quick Setup", description: "Fast execution to save time." }
        ],
        faq: [
            { question: "Do you handle IT and networking?", answer: "Yes, we handle everything from start to finish, including networking." }
        ],
        relatedServices: ["retail", "ceilings"]
    },
    {
        id: "retail",
        categoryId: "commercial",
        title: "Retail & Showroom",
        slug: "retail",
        description: "Store designs that look great and guide customers easily.",
        heroImage: "/hero_reality_render_1775299733746.png",
        features: [
            "Smart Product Displays",
            "Easy Customer Walkways",
            "Focus Lighting",
            "Checkout Counters"
        ],
        processSteps: [
            { title: "Design Idea", description: "Matching design with your products." },
            { title: "Store Layout", description: "Making sure the store is easy to walk through." },
            { title: "Product Lighting", description: "Special lighting to make products stand out." },
            { title: "Ready to Open", description: "Getting it all done for your opening day." }
        ],
        faq: [
            { question: "Can you work within mall guidelines?", answer: "Yes, we know how to follow strict mall rules." }
        ]
    },

    // Specialized
    {
        id: "modular-kitchens",
        categoryId: "specialized",
        title: "Modular Kitchen Systems",
        slug: "modular-kitchens",
        description: "Modern kitchen setups made with the best materials.",
        longDescription: `
### Precision Engineering
Our kitchens are built in top-tier factories for a perfect finish. Every cabinet is made by machine, giving a result that standard carpentry can't match.

### Top Hardware Brands
We use the best brands to bring you smooth and easy-to-use kitchens.
*   **Soft-Close Drawers:** Quiet and smooth every time.
*   **Tall Units:** For pantry storage that slides out easily.
*   **Corner Solutions:** Smart racks to use every inch of space.
        `,
        heroImage: "/images/projects/discovery/visual-12.jpg",
        features: [
            "Premium Hardware",
            "Soft-Close Drawers",
            "Smart Corner Storage",
            "Under-Sink Organizers"
        ],
        processSteps: [
            { title: "Taking Measurements", description: "Exact measurements at your home." },
            { title: "Factory Building", description: "Machine-made for a perfect finish." },
            { title: "Quick Assembly", description: "Fast and clean setup." }
        ],
        faq: [
            { question: "What is the warranty on modular kitchens?", answer: "We offer up to 10 years of warranty on select hardware." }
        ],
        relatedServices: ["kitchen", "ceilings"]
    },
    {
        id: "ceilings",
        categoryId: "specialized",
        title: "False Ceiling & Lighting",
        slug: "ceilings",
        description: "Beautiful ceiling designs that include modern lighting.",
        heroImage: "/images/projects/discovery/visual-3.jpg",
        features: [
            "Clean Modern Designs",
            "Hidden & Border Lighting",
            "Wooden Touches",
            "Sound-Reducing Panels"
        ],
        processSteps: [
            { title: "Ceiling Design", description: "Detailed ceiling plans." },
            { title: "Metal Framing", description: "Strong framing support." },
            { title: "Boarding", description: "Smooth ceiling boards." },
            { title: "Finishing Touches", description: "Painting and adding the lights." }
        ],
        faq: [
            { question: "Does a false ceiling reduce room height?", answer: "It only takes a few inches, which is barely noticeable." }
        ]
    },

    {
        id: "restaurant",
        categoryId: "commercial",
        title: "Restaurant & Cafe",
        slug: "restaurant",
        description: "Great dining spaces built to handle busy crowds.",
        longDescription: `
### Crafting Dining Experiences
A great restaurant design makes the food taste better. We create spaces that guests love and that make it easy for your staff to work.

### Durable & Beautiful
Restaurants face a lot of daily wear. We choose materials that look great and are tough enough to last for years, even on your busiest days.
        `,
        heroImage: "/images/projects/discovery/visual-10.jpg", 
        galleryImages: [
            "/images/projects/discovery/visual-17.jpg",
            "/images/projects/discovery/visual-14.jpg",
            "/images/projects/discovery/visual-9.jpg"
        ],
        features: [
            "Smart Seating Layouts",
            "Sound Control",
            "Mood Lighting",
            "Tough & Lasting Finishes"
        ],
        processSteps: [
            { title: "Concept Design", description: "Setting the vibe and look." },
            { title: "Space Planning", description: "Balancing tables with guest comfort." },
            { title: "Choosing Materials", description: "Picking tough, beautiful finishes." },
            { title: "Build & Setup", description: "Getting it built on time." }
        ],
        faq: [
            { question: "Do you design commercial kitchens too?", answer: "We focus on the dining area but work closely with kitchen experts for a smooth process." }
        ],
        relatedServices: ["retail", "lighting"]
    },
    {
        id: "lighting",
        categoryId: "specialized",
        title: "Lighting Design",
        slug: "lighting",
        description: "Custom lighting that changes the mood of any room.",
        longDescription: `
### The Power of Light
Lighting is the most powerful tool in design. It sets the mood and makes everything look better. We plan our lighting carefully to make sure every space is lit perfectly.

### The Right Setup
We mix different types of lights to get the right feel. Whether you want a bright workspace or a cozy bedroom, we pick the right colors and brightness for you.
        `,
        heroImage: "/images/projects/discovery/visual-9.jpg",
        galleryImages: [
            "/images/projects/discovery/visual-13.jpg",
            "/images/projects/discovery/visual-4.jpg",
            "/images/projects/discovery/visual-12.jpg"
        ],
        features: [
            "Custom Lighting Plans",
            "Smart Home Setup",
            "Mix of Bright & Cozy Lights",
            "Energy Saving Options"
        ],
        processSteps: [
            { title: "Checking the Room", description: "Seeing how much natural light there is." },
            { title: "Lighting Plan", description: "Choosing where each light goes." },
            { title: "Installation", description: "Safe wiring and setup." }
        ],
        faq: [
            { question: "Can you connect the lights to my phone?", answer: "Yes, our lighting works perfectly with modern smart home systems." }
        ],
        relatedServices: ["ceilings", "living-room"]
    },
    {
        id: "custom-furniture",
        categoryId: "specialized",
        title: "Custom Furniture",
        slug: "custom-furniture",
        description: "Custom-made furniture built exactly how you want it.",
        longDescription: `
### Made Just For You
When standard sizes don't fit, we build exactly what you need. Every piece is made to match your style perfectly and fit right into your room.

### High Quality
Every piece of custom furniture is made by skilled craftsmen. We use top-quality wood and fabrics so your furniture is comfortable and lasts a long time.
        `,
        heroImage: "/images/projects/discovery/visual-2.jpg",
        galleryImages: [
            "/images/projects/discovery/visual-17.jpg",
            "/images/projects/discovery/visual-10.jpg",
            "/images/projects/discovery/visual-6.jpg"
        ],
        features: [
            "Perfect Sizing",
            "Many Fabric Choices",
            "Comfortable Designs",
            "Solid Wood Builds"
        ],
        processSteps: [
            { title: "Ideas & Planning", description: "Sketching what you need." },
            { title: "Checking Details", description: "Looking at fabric and wood samples." },
            { title: "Building", description: "Handcrafting in our workshop." },
            { title: "Delivery", description: "Safe delivery and setup in your home." }
        ],
        faq: [
            { question: "How long does custom furniture take to build?", answer: "It usually takes 4-8 weeks once we agree on the design." }
        ],
        relatedServices: ["living-room", "bedroom"]
    }
];
