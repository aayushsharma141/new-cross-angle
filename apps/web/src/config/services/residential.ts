/**
 * config/services/residential.ts — Residential interior design services.
 * Domains: Living Room, Bedroom, Kitchen & Dining
 */

import type { ServiceDetail } from "./types";

export const residentialServices: ServiceDetail[] = [
    // Residential - 1. Living Room
    {
        id: "living-room",
        categoryId: "residential",
        category_id: "residential",
        title: "Living Room Design",
        slug: "living-room",
        description: "Complete updates for your main living space. We design custom TV walls, ergonomic seating, and ambient lighting for the perfect mood.",
        longDescription: `
### The Heart of Your Home
Your living room is where life happens. It's where you host guests, relax after a long day, and spend quality family time. We craft bespoke living environments that balance luxury aesthetics with everyday practical comfort.

### Tailored to Your Lifestyle
Whether you prefer a **Clean & Calm** minimalist look, a **Warm Contemporary** feel, or a **Rich & Bold** luxury aesthetic, our design team curates every detail to match your personality:
* **Space & Layout Flow:** Ergonomic arrangement ensuring effortless movement and conversational comfort.
* **Smart Storage Integration:** Custom wall-mounted media centers, hidden wire management, and architectural display units.
* **Multi-Layered Lighting:** Seamless integration of ambient ceiling coves, accent spotlights, and decorative drop pendants.

### Materials & Craftsmanship
We select top-tier moisture-resistant materials, soft-close hardware, stain-resistant upholstery, and premium wood veneers that maintain their beauty through years of active use.

### Complete Your Space
Enhance your home experience by pairing your living room with our [False Ceiling & Lighting](/services/specialized/ceilings) solutions, or revamp your dining space with our [Kitchen & Dining](/services/residential/kitchen) designs.
        `,
        heroImage: "/reality_render.jpg",
        hero_image: "/reality_render.jpg",
        galleryImages: [
            "/images/projects/discovery/lifestyle-8.jpg",
            "/images/projects/discovery/visual-3.jpg",
            "/images/projects/discovery/visual-1.jpg"
        ],
        features: [
            "Custom TV & Media Wall Units",
            "Ergonomic Seating Layouts",
            "Multi-Layered Ambient Lighting",
            "Architectural Wall Paneling & Finishes",
            "Concealed Cable & Wire Management"
        ],
        processSteps: [
            { title: "Discovery & Lifestyle Audit", description: "Understanding your family's routine, entertainment preferences, and functional needs." },
            { title: "Spatial & Lighting Layout", description: "Architectural floor plans maximizing natural light and conversational flow." },
            { title: "3D Visualization & Samples", description: "Photorealistic 3D renders with physical wood, fabric, and paint samples." },
            { title: "Craftsmanship & Installation", description: "Precision off-site fabrication and clean on-site installation by senior craftsmen." }
        ],
        process_steps: [
            { title: "Discovery & Lifestyle Audit", description: "Understanding your family's routine, entertainment preferences, and functional needs." },
            { title: "Spatial & Lighting Layout", description: "Architectural floor plans maximizing natural light and conversational flow." },
            { title: "3D Visualization & Samples", description: "Photorealistic 3D renders with physical wood, fabric, and paint samples." },
            { title: "Craftsmanship & Installation", description: "Precision off-site fabrication and clean on-site installation by senior craftsmen." }
        ],
        faq: [
            { question: "How long does a living room makeover take?", answer: "Turnkey living room projects typically take 3 to 5 weeks from final design approval to complete installation." },
            { question: "Do you supply loose furniture and custom sofas?", answer: "Yes, we design and build custom sofas, coffee tables, media consoles, and accent armchairs tailored precisely to your space dimensions." },
            { question: "Can you incorporate existing furniture pieces into the new layout?", answer: "辦理 Absolutely. We can integrate heirloom or favorite furniture items into the architectural color scheme and spatial layout." },
            { question: "What warranties do you provide on media units and cabinetry?", answer: "We offer a 10-year warranty on all structural cabinetry and premium hardware components." }
        ],
        relatedServices: ["ceilings", "modular-kitchens", "lighting"]
    },


    // Residential - 2. Bedroom Sanctuaries
    {
        id: "bedroom",
        categoryId: "residential",
        category_id: "residential",
        title: "Bedroom Sanctuaries",
        slug: "bedroom",
        description: "Quiet spaces designed for deep rest, featuring custom wardrobe systems, acoustic comfort, and warm mood lighting.",
        longDescription: `
### Your Private Sanctuary
A bedroom is more than just a place to sleep—it is your private sanctuary for rest and mental restoration. We design bedrooms that promote restfulness through acoustic damping, soft color palettes, and ergonomic layout planning.

### Intelligent Wardrobes & Storage
Storage is central to a clutter-free bedroom. We engineer specialized storage solutions tailored to your wardrobe:
* **Floor-to-Ceiling Wardrobes:** Full-height cabinetry maximizing vertical space with internal sensor LED lighting.
* **Walk-In Closets & Sliding Systems:** Smooth-sliding glass or lacquer doors with specialized accessories for ties, watches, and footwear.
* **Integrated Headboard Storage:** Concealed nightstand compartments and integrated wireless charging zones.

### Atmospheric Mood Lighting
Lighting is engineered to sync with your circadian rhythm, featuring dimmable warm ambient coves, glare-free reading lights, and automatic under-bed sensor illumination.

### Enhance Your Bedroom
Pair your bedroom sanctuary with custom [False Ceiling & Lighting](/services/specialized/ceilings) for atmospheric warmth, or explore our bespoke [Custom Furniture](/services/specialized/custom-furniture) for handcrafted beds and vanities.
        `,
        heroImage: "/images/projects/discovery/lifestyle-7.jpg",
        hero_image: "/images/projects/discovery/lifestyle-7.jpg",
        galleryImages: [
            "/images/projects/discovery/visual-18.jpg",
            "/images/projects/discovery/visual-10.jpg",
            "/images/projects/discovery/visual-7.jpg"
        ],
        features: [
            "Floor-to-Ceiling Custom Wardrobes",
            "Circadian Mood & Accent Lighting",
            "Acoustic Wall Damping & Padded Headboards",
            "Concealed Cable & Tech Integration",
            "Integrated Dresser & Vanity Workstations"
        ],
        processSteps: [
            { title: "Storage & Spatial Assessment", description: "Evaluating wardrobe capacity requirements, bed positioning, and natural lighting." },
            { title: "3D Spatial Design", description: "Detailed 3D models illustrating closet layouts, headboard details, and ambient lighting scenes." },
            { title: "Material & Fabric Selection", description: "Hand-picking veneer finishes, soft velvet or leatherette upholstery, and low-VOC paints." },
            { title: "White-Glove Installation", description: "Dust-controlled installation of cabinetry, backlighting, and padded panels." }
        ],
        process_steps: [
            { title: "Storage & Spatial Assessment", description: "Evaluating wardrobe capacity requirements, bed positioning, and natural lighting." },
            { title: "3D Spatial Design", description: "Detailed 3D models illustrating closet layouts, headboard details, and ambient lighting scenes." },
            { title: "Material & Fabric Selection", description: "Hand-picking veneer finishes, soft velvet or leatherette upholstery, and low-VOC paints." },
            { title: "White-Glove Installation", description: "Dust-controlled installation of cabinetry, backlighting, and padded panels." }
        ],
        faq: [
            { question: "How do you maximize storage in compact bedrooms?", answer: "We utilize full-height wardrobe modules, hydraulic lift-up bed storage, and multi-functional nightstands with integrated power." },
            { question: "What materials do you use for wardrobes?", answer: "We use high-density moisture-resistant (HDMR) boards and marine-grade plywood finished with premium laminates, acrylics, or natural wood veneers." },
            { question: "Can you incorporate acoustic soundproofing?", answer: "Yes, we install upholstered fabric wall panels, acoustic backing boards, and double-glazed window treatments to isolate outside noise." },
            { question: "What is the typical completion timeline?", answer: "A complete bedroom transformation is completed in 3 to 4 weeks after design sign-off." }
        ],
        relatedServices: ["ceilings", "custom-furniture", "living-room"]
    },

    // Residential - 3. Kitchen & Dining
    {
        id: "kitchen",
        categoryId: "residential",
        category_id: "residential",
        title: "Kitchen & Dining",
        slug: "kitchen",
        description: "Ergonomic, beautiful kitchens and integrated dining areas built for effortless cooking and memorable family gatherings.",
        longDescription: `
### The Heart of Modern Living
In contemporary homes, the kitchen and dining area serves as the central hub of daily life. We create kitchens that harmoniously merge culinary efficiency with architectural elegance.

### Golden Triangle Ergonomics
Our spatial layouts follow strict ergonomic principles, optimizing movement between the sink, cooktop, and refrigeration zones:
* **Island & Breakfast Counters:** Multi-purpose islands featuring waterfall quartz countertops and integrated breakfast seating.
* **Heavy-Duty Materials:** Water-resistant marine plywood cores, heat-resistant quartz tops, and anti-fingerprint matte finishes.
* **Integrated Dining Spaces:** Customized dining tables and banquette seating designed to complement kitchen cabinetry.

### High-Performance Storage
Say goodbye to cluttered countertops. We incorporate pull-out pantries, corner carousel organizers, under-sink waste management, and dedicated appliance garages.

### Complementary Upgrades
For factory-precision cabinetry, explore our specialized [Modular Kitchen Systems](/services/specialized/modular-kitchens) or check our [Lighting Design](/services/specialized/lighting) for Task and Accent illumination.
        `,
        heroImage: "/images/projects/discovery/visual-12.jpg",
        hero_image: "/images/projects/discovery/visual-12.jpg",
        galleryImages: [
            "/images/projects/discovery/visual-15.jpg",
            "/images/projects/discovery/visual-13.jpg",
            "/images/projects/discovery/visual-11.jpg"
        ],
        features: [
            "Golden Triangle Ergonomic Layouts",
            "Heat & Stain Resistant Countertops",
            "Soft-Close Drawer & Pantry Systems",
            "Appliance Garages & Concealed Outlets",
            "Integrated Dining & Bar Counters"
        ],
        processSteps: [
            { title: "Civil & Utility Mapping", description: "Mapping plumbing points, gas lines, electrical load, and ventilation ducts." },
            { title: "Ergonomic 3D Layout", description: "Designing work zones, storage modules, and dining seating layouts." },
            { title: "Precision Manufacturing", description: "Machine-cutting and edge-banding in controlled factory environments." },
            { title: "Installation & Appliance Hookup", description: "On-site assembly, countertop fitting, backsplash tiling, and appliance testing." }
        ],
        process_steps: [
            { title: "Civil & Utility Mapping", description: "Mapping plumbing points, gas lines, electrical load, and ventilation ducts." },
            { title: "Ergonomic 3D Layout", description: "Designing work zones, storage modules, and dining seating layouts." },
            { title: "Precision Manufacturing", description: "Machine-cutting and edge-banding in controlled factory environments." },
            { title: "Installation & Appliance Hookup", description: "On-site assembly, countertop fitting, backsplash tiling, and appliance testing." }
        ],
        faq: [
            { question: "What countertops perform best for heavy cooking?", answer: "We recommend quartz or granite countertops due to their non-porous nature, heat resistance, and ease of maintenance." },
            { question: "How long does a kitchen renovation take?", answer: "Complete kitchen and dining transformations take 4 to 6 weeks, including civil modifications and countertop fitting." },
            { question: "Are your kitchen materials waterproof?", answer: "Yes, we exclusively use BWP (Boiling Water Proof) marine-grade plywood for kitchen sink and base modules." },
            { question: "Do you assist with selecting built-in appliances?", answer: "Yes, we coordinate exact dimensions and power requirements for hobs, chimneys, ovens, and dishwashers." }
        ],
        relatedServices: ["modular-kitchens", "living-room", "ceilings"]
    }
];