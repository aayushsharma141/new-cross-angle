/**
 * config/services/commercial.ts — Commercial interior design services.
 * Domains: Office Interiors, Retail & Showroom, Restaurant & Cafe
 */

import type { ServiceDetail } from "./types";

export const commercialServices: ServiceDetail[] = [
    // Commercial - 4. Office Interiors
    {
        id: "office",
        categoryId: "commercial",
        category_id: "commercial",
        title: "Office Interiors",
        slug: "office",
        description: "High-performance workspaces designed for employee well-being, collaborative synergy, and strong corporate brand presence.",
        longDescription: `
### Workspaces Built for Peak Productivity
A well-designed office elevates employee output, fosters creative collaboration, and reinforces your brand identity to visiting clients. We design corporate offices, startup hubs, and executive suites tailored to modern work dynamics.

### Strategic Zoning & Acoustics
Modern offices require a balance between quiet focus zones and dynamic collaborative spaces:
* **Executive Suites & Boardrooms:** Premium conference tables with integrated AV connectivity, acoustic wood slatted walls, and privacy glass.
* **Open-Plan Workstations:** Ergonomic desks with cable raceways, personal storage, and acoustic dividers.
* **Breakout & Reception Hubs:** Welcoming reception desks, biophilic greenery walls, and relaxed lounge areas.

### Infrastructure & Turnkey Services
We manage complete electrical, networking, HVAC ducting, access control, and fire safety compliance so your team can move in seamlessly.

### Explore Related Services
See how our [False Ceiling & Lighting](/services/specialized/ceilings) enhances commercial space efficiency, or browse our [Retail & Showroom](/services/commercial/retail) design capabilities.
        `,
        heroImage: "/images/projects/discovery/visual-16.jpg",
        hero_image: "/images/projects/discovery/visual-16.jpg",
        galleryImages: [
            "/images/projects/discovery/visual-14.jpg",
            "/images/projects/discovery/visual-11.jpg",
            "/images/projects/discovery/visual-8.jpg"
        ],
        features: [
            "Ergonomic Modular Workstations",
            "Acoustically Isolated Meeting Rooms",
            "Executive Suites & Boardroom Tables",
            "Brand-Centric Reception Entrances",
            "Turnkey Electrical, IT & HVAC Infrastructure"
        ],
        processSteps: [
            { title: "Workplace Dynamics Audit", description: "Analyzing headcount growth, department workflow, and AV/IT infrastructure needs." },
            { title: "Zoning & Compliance Plan", description: "Developing compliant floor plans for egress, emergency exits, and maximum natural light." },
            { title: "Material & Brand Integration", description: "Selecting commercial-grade flooring, acoustic ceilings, and corporate color branding." },
            { title: "Accelerated Site Execution", description: "Fast-track construction with strict adherence to building management quiet hours." }
        ],
        process_steps: [
            { title: "Workplace Dynamics Audit", description: "Analyzing headcount growth, department workflow, and AV/IT infrastructure needs." },
            { title: "Zoning & Compliance Plan", description: "Developing compliant floor plans for egress, emergency exits, and maximum natural light." },
            { title: "Material & Brand Integration", description: "Selecting commercial-grade flooring, acoustic ceilings, and corporate color branding." },
            { title: "Accelerated Site Execution", description: "Fast-track construction with strict adherence to building management quiet hours." }
        ],
        faq: [
            { question: "Can you complete office fit-outs without disrupting business operations?", answer: "Yes, we offer phased execution and night-shift construction schedules to minimize downtime for ongoing operations." },
            { question: "Do you handle IT networking and security access systems?", answer: "Yes, our turnkey corporate service covers server room setups, cat6 cabling, biometric access, and CCTV installation." },
            { question: "What is the typical timeline for a 5,000 sq ft office fit-out?", answer: "A 5,000 sq ft commercial workspace fit-out is typically delivered in 6 to 8 weeks." },
            { question: "Are your commercial materials fire and safety certified?", answer: "All our ceiling tiles, glass partitions, and carpet tiles comply with commercial fire safety standards." }
        ],
        relatedServices: ["retail", "ceilings", "lighting"]
    },


    // Commercial - 5. Retail & Showroom
    {
        id: "retail",
        categoryId: "commercial",
        category_id: "commercial",
        title: "Retail & Showroom",
        slug: "retail",
        description: "Immersive retail environments designed to maximize foot traffic flow, showcase products, and drive high customer conversions.",
        longDescription: `
### Spatial Commerce Engineering
In retail design, spatial layout directly drives customer purchasing behavior. We construct retail stores, luxury boutiques, and commercial showrooms that turn casual shoppers into brand advocates.

### Strategic Customer Journey
Every square foot of retail floor plan is engineered for maximum customer engagement:
* **High-Impact Storefronts:** Captivating window displays and illuminated entrance portals that attract passersby.
* **Guided Circulation Paths:** Intuitive aisle layouts encouraging customers to explore the full depth of the store.
* **High-CRI Product Display Lighting:** Precision spotlighting that accurately renders product colors and textures.

### Durable Commercial Finishes
Retail environments sustain intense daily foot traffic. We specify high-durability vitrified tile flooring, scratch-resistant display fixtures, and reinforced POS checkout counters.

### Related Capabilities
Explore our custom [Lighting Design](/services/specialized/lighting) for specialized merchandise display illumination, or consult our [Office Interiors](/services/commercial/office) for corporate headquarters.
        `,
        heroImage: "/images/projects/discovery/lifestyle-5.jpg",
        hero_image: "/images/projects/discovery/lifestyle-5.jpg",
        galleryImages: [
            "/images/projects/discovery/visual-17.jpg",
            "/images/projects/discovery/visual-6.jpg",
            "/images/projects/discovery/visual-4.jpg"
        ],
        features: [
            "Architectural Storefronts & Window Displays",
            "Guided Customer Flow Layouts",
            "High-CRI Merchandise Spotlighting",
            "Custom Modular Display Shelving",
            "Secure POS & Cash Wrap Counters"
        ],
        processSteps: [
            { title: "Brand & Merchandise Analysis", description: "Studying product dimensions, price points, target demographics, and brand guidelines." },
            { title: "Footfall & Display Planning", description: "Mapping focal display walls, impulse purchase zones, and fitting room layouts." },
            { title: "Fixture & Lighting Prototyping", description: "Designing custom display racks, glass showcases, and high-accent track lighting." },
            { title: "Rapid Commercial Build-Out", description: "Coordinated installation ensuring on-time launch prior to grand opening dates." }
        ],
        process_steps: [
            { title: "Brand & Merchandise Analysis", description: "Studying product dimensions, price points, target demographics, and brand guidelines." },
            { title: "Footfall & Display Planning", description: "Mapping focal display walls, impulse purchase zones, and fitting room layouts." },
            { title: "Fixture & Lighting Prototyping", description: "Designing custom display racks, glass showcases, and high-accent track lighting." },
            { title: "Rapid Commercial Build-Out", description: "Coordinated installation ensuring on-time launch prior to grand opening dates." }
        ],
        faq: [
            { question: "Do you have experience working within strict shopping mall guidelines?", answer: "Yes, we regularly coordinate with mall management teams to ensure compliance with store height, signage, fit-out times, and safety rules." },
            { question: "What lighting temperature is best for retail products?", answer: "We customize lighting temperature based on merchandise: warm 3000K for apparel, crisp 4000K for electronics, and high 95+ CRI for jewelry." },
            { question: "Can display fixtures be reconfigured for seasonal inventory?", answer: "Yes, we build modular, adjustable wall channels and mobile island fixtures for quick seasonal display updates." },
            { question: "What is the average timeline for a retail store setup?", answer: "Retail store fit-outs typically take 3 to 5 weeks from approved drawings." }
        ],
        relatedServices: ["office", "lighting", "restaurant"]
    },


    // Commercial - 6. Restaurant & Cafe
    {
        id: "restaurant",
        categoryId: "commercial",
        category_id: "commercial",
        title: "Restaurant & Cafe",
        slug: "restaurant",
        description: "Captivating dining atmospheres that combine sensory branding, comfortable seating, and efficient kitchen-to-table service flow.",
        longDescription: `
### Crafting Unforgettable Dining Experiences
Atmosphere is just as crucial to restaurant success as the menu itself. We design dining rooms, cafes, bars, and fine-dining spaces that captivate guests and encourage longer dwell times.

### Operational Efficiency Meets Visual Charm
A successful restaurant design balances customer warmth with kitchen workflow speed:
* **Acoustic & Mood Control:** Sound-absorbing wall baffles and layered dimmable lighting for intimate dining environments.
* **Ergonomic Seating Mix:** Customized booth seating, banquettes, bar counters, and flexible dining table configurations.
* **Commercial Kitchen Coordination:** Smooth integration between service pass, POS terminals, and customer dining tables.

### Robust Materials for Hospitality
Hospitality surfaces face frequent spills and heavy cleaning. We utilize commercial stain-proof fabrics, antimicrobial table surfaces, and non-slip commercial flooring.

### Complementary Offerings
Pair your dining space with custom [Lighting Design](/services/specialized/lighting) or discover our [Custom Furniture](/services/specialized/custom-furniture) options for bespoke banquettes and tables.
        `,
        heroImage: "/images/projects/discovery/visual-10.jpg",
        hero_image: "/images/projects/discovery/visual-10.jpg",
        galleryImages: [
            "/images/projects/discovery/visual-17.jpg",
            "/images/projects/discovery/visual-14.jpg",
            "/images/projects/discovery/visual-9.jpg"
        ],
        features: [
            "Acoustic Management & Mood Lighting",
            "Bespoke Banquette & Booth Seating",
            "Bar & Service Counter Engineering",
            "Commercial Anti-Slip & Stain-Proof Materials",
            "Kitchen-to-Dining Workflow Optimization"
        ],
        processSteps: [
            { title: "Concept & Atmosphere Ideation", description: "Defining restaurant identity, color theme, target customer profile, and mood." },
            { title: "Spatial & Capacity Layout", description: "Maximizing table covers without compromising guest comfort or waiter access." },
            { title: "Custom Furniture & Lighting Build", description: "Fabricating heavy-duty booths, custom bars, ambient light fixtures, and backdrops." },
            { title: "Turnkey Commercial Handover", description: "Complete installation, kitchen pass integration, acoustic tuning, and final cleaning." }
        ],
        process_steps: [
            { title: "Concept & Atmosphere Ideation", description: "Defining restaurant identity, color theme, target customer profile, and mood." },
            { title: "Spatial & Capacity Layout", description: "Maximizing table covers without compromising guest comfort or waiter access." },
            { title: "Custom Furniture & Lighting Build", description: "Fabricating heavy-duty booths, custom bars, ambient light fixtures, and backdrops." },
            { title: "Turnkey Commercial Handover", description: "Complete installation, kitchen pass integration, acoustic tuning, and final cleaning." }
        ],
        faq: [
            { question: "How do you control noise levels in busy dining spaces?", answer: "We integrate sound-absorbing ceiling clouds, upholstered seating, acoustic plaster walls, and soft wall drapery to eliminate harsh echoes." },
            { question: "Do you design the commercial kitchen area as well?", answer: "We focus on customer-facing dining, bar, and reception areas, while coordinating with kitchen equipment vendors for utility connections." },
            { question: "Are your upholstery fabrics stain-resistant?", answer: "Yes, we specify commercial-grade treated fabrics and marine leathers rated for 50,000+ double rubs on the Wyzenbeek scale." },
            { question: "How long does a restaurant interior project take?", answer: "Hospitality projects generally take 5 to 8 weeks depending on custom bar fabrication and municipal approvals." }
        ],
        relatedServices: ["retail", "lighting", "custom-furniture"]
    },
];