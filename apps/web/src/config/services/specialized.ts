/**
 * config/services/specialized.ts — Specialized execution services.
 * Domains: Modular Kitchens, False Ceilings, Lighting Design, Custom Furniture
 */

import type { ServiceDetail } from "./types";

export const specializedServices: ServiceDetail[] = [
    // Specialized - 7. Modular Kitchen Systems
    {
        id: "modular-kitchens",
        categoryId: "specialized",
        category_id: "specialized",
        title: "Modular Kitchen Systems",
        slug: "modular-kitchens",
        description: "Precision-engineered factory-built kitchen cabinetry with soft-close German hardware, custom pantries, and lifetime durability.",
        longDescription: `
### Factory Precision Engineering
Unlike traditional site-built carpentry, our modular kitchen systems are manufactured in high-tech computer-controlled factories. This guarantees micrometer precision, seamless edge-banding, and flawless alignment.

### World-Class Hardware Integration
We partner with top-tier hardware manufacturers (Hettich, Blum, Hafele) to bring you fluid motion technology:
* **Soft-Close Drawers & Hinges:** Silent, smooth operation rated for over 100,000 open-close cycles.
* **Pull-Out Tall Pantries:** Multi-tier sliding pantry systems for organized dry food storage.
* **Blind Corner Magic Racks:** Transforming awkward corner spaces into accessible storage shelves.

### Water-Proof & Pest-Resistant Cores
Our modular carcasses are crafted from High-Density Moisture-Resistant (HDMR) boards and Boiling Water Proof (BWP) marine plywood, sealed with zero-joint PUR edge banding.

### Complete Your Kitchen
Combine your modular cabinetry with our full [Kitchen & Dining](/services/residential/kitchen) services or enhance illumination with [Lighting Design](/services/specialized/lighting).
        `,
        heroImage: "/images/projects/discovery/visual-12.jpg",
        hero_image: "/images/projects/discovery/visual-12.jpg",
        galleryImages: [
            "/images/projects/discovery/visual-15.jpg",
            "/images/projects/discovery/visual-13.jpg",
            "/images/projects/discovery/visual-3.jpg"
        ],
        features: [
            "Computer-Controlled Factory Precision",
            "BWP Marine Plywood & HDMR Cores",
            "German Soft-Close Hardware (Hettich/Blum)",
            "Zero-Joint PUR Moisture-Proof Edge Banding",
            "Custom Tall Pantries & Corner Organizers"
        ],
        processSteps: [
            { title: "Precision Laser Measurement", description: "On-site 3D laser measurement of walls, floor levels, plumbing, and electrical points." },
            { title: "Modular 3D CAD Engineering", description: "Customizing cabinet dimensions, internal drawer organizers, and finish options." },
            { title: "Automated Factory Production", description: "Precision CNC cutting, drilling, and PUR edge-banding in clean factory conditions." },
            { title: "Dust-Free Fast Assembly", description: "On-site interlocking module installation completed in as little as 3 to 5 days." }
        ],
        process_steps: [
            { title: "Precision Laser Measurement", description: "On-site 3D laser measurement of walls, floor levels, plumbing, and electrical points." },
            { title: "Modular 3D CAD Engineering", description: "Customizing cabinet dimensions, internal drawer organizers, and finish options." },
            { title: "Automated Factory Production", description: "Precision CNC cutting, drilling, and PUR edge-banding in clean factory conditions." },
            { title: "Dust-Free Fast Assembly", description: "On-site interlocking module installation completed in as little as 3 to 5 days." }
        ],
        faq: [
            { question: "What is the warranty period for modular kitchen hardware?", answer: "We provide up to a 10-year warranty on all structural cabinets and lifetime warranties on select Blum and Hettich hardware." },
            { question: "How does factory modular construction compare to site carpentry?", answer: "Factory modular cabinets feature machine-applied zero-joint edge banding, exact 90-degree CNC cuts, and zero wood dust inside your home." },
            { question: "Can modular kitchens be dismantled and relocated?", answer: "Yes, because modular units are assembled using knock-down fittings, they can be safely dismantled and re-installed in a new home." },
            { question: "How long does factory manufacturing take?", answer: "Factory manufacturing takes 2 to 3 weeks, followed by 3 to 5 days of clean on-site assembly." }
        ],
        relatedServices: ["kitchen", "ceilings", "lighting"]
    },


    // Specialized - 8. False Ceiling & Lighting
    {
        id: "ceilings",
        categoryId: "specialized",
        category_id: "specialized",
        title: "False Ceiling & Lighting",
        slug: "ceilings",
        description: "Architectural ceiling designs featuring cove illumination, recessed magnetic tracks, wooden rafters, and acoustic isolation.",
        longDescription: `
### Elevate Your Spatial Architecture
The ceiling is often referred to as the 'fifth wall' of a room. A professionally designed false ceiling transforms a flat ceiling into an architectural statement while concealing AC ducting, electrical wiring, and ambient light channels.

### Integrated Lighting Architecture
We integrate multiple lighting layers directly into the ceiling structural grid:
* **Indirect Cove Illumination:** Soft, shadow-free perimeter lighting that makes rooms feel taller and airier.
* **Magnetic Track Profiles:** Modern recessed magnetic tracks allowing flexible spotlight positioning.
* **Wooden Rafters & Fluted Panels:** Adding organic warmth and texture to living rooms and dining zones.

### Thermal & Acoustic Insulation
Our ceiling installations utilize premium Saint-Gobain Gyproc boards, providing fire resistance, sound damping between floors, and thermal insulation that reduces air conditioning power costs.

### Explore Related Upgrades
Enhance your ceiling feature with specialized [Lighting Design](/services/specialized/lighting) or apply this design to your [Living Room Design](/services/residential/living-room).
        `,
        heroImage: "/images/projects/discovery/visual-3.jpg",
        hero_image: "/images/projects/discovery/visual-3.jpg",
        galleryImages: [
            "/images/projects/discovery/visual-9.jpg",
            "/images/projects/discovery/visual-4.jpg",
            "/images/projects/discovery/visual-1.jpg"
        ],
        features: [
            "Saint-Gobain Gyproc Premium Boarding",
            "Concealed LED Cove Lighting Channels",
            "Recessed Magnetic Track Lighting Profiles",
            "Wooden Rafter & Fluted Accent Paneling",
            "Acoustic & Thermal Insulation Layering"
        ],
        processSteps: [
            { title: "Ceiling Grid Design", description: "Mapping light cutout locations, AC vents, sprinkler heads, and ceiling height drops." },
            { title: "Heavy-Duty Galvanized Framing", description: "Erecting rust-proof GI metal framing anchored firmly to the RCC slab." },
            { title: "Gyproc Boarding & Jointing", description: "Fixing fire-rated gypsum boards with seamless jointing compound and mesh tape." },
            { title: "Sanding, Painting & Light Fitting", description: "Multi-coat primer, premium emulsion paint, and precision fixture insertion." }
        ],
        process_steps: [
            { title: "Ceiling Grid Design", description: "Mapping light cutout locations, AC vents, sprinkler heads, and ceiling height drops." },
            { title: "Heavy-Duty Galvanized Framing", description: "Erecting rust-proof GI metal framing anchored firmly to the RCC slab." },
            { title: "Gyproc Boarding & Jointing", description: "Fixing fire-rated gypsum boards with seamless jointing compound and mesh tape." },
            { title: "Sanding, Painting & Light Fitting", description: "Multi-coat primer, premium emulsion paint, and precision fixture insertion." }
        ],
        faq: [
            { question: "How much ceiling height is lost when installing a false ceiling?", answer: "A standard cove false ceiling requires a drop of only 4 to 5 inches, maintaining ample room height." },
            { question: "Are false ceilings safe and durable?", answer: "Yes, we use heavy-gauge galvanized iron (GI) framing and authentic Gyproc boards capable of supporting light fixtures and fans securely." },
            { question: "Does a false ceiling help reduce noise from upstairs neighbors?", answer: "Adding rockwool insulation inside the ceiling cavity significantly dampens impact noise and speech transmission from upper floors." },
            { question: "How long does ceiling installation take for a whole home?", answer: "A standard 3-bedroom apartment false ceiling is completed in 7 to 10 days." }
        ],
        relatedServices: ["lighting", "living-room", "bedroom"]
    },


    // Specialized - 9. Lighting Design
    {
        id: "lighting",
        categoryId: "specialized",
        category_id: "specialized",
        title: "Lighting Design",
        slug: "lighting",
        description: "Custom architectural lighting schemes combining ambient, task, and accent fixtures with smart automation controls.",
        longDescription: `
### The Essence of Architectural Ambiance
Light transforms how we experience architecture, color, and space. Our specialized lighting design services ensure every corner of your home or commercial venue is illuminated with intention, comfort, and dramatic flare.

### The Three Layers of Light
We craft bespoke lighting schemes based on proven architectural lighting principles:
* **Ambient Lighting:** Soft, even illumination providing comfortable baseline visibility without glare.
* **Task Lighting:** Focused, high-CRI illumination over kitchen countertops, study desks, and reading nooks.
* **Accent & Art Lighting:** Precision narrow-beam spotlights highlighting artwork, textured stone walls, and architectural columns.

### Smart Automation & Dimming
We integrate smart lighting controllers (Lutron, Schneider, Smart Life) allowing you to change lighting scenes with a touch of a button or voice command.

### Related Services
Pair your lighting scheme with custom [False Ceiling & Lighting](/services/specialized/ceilings) or review our [Restaurant & Cafe](/services/commercial/restaurant) hospitality lighting.
        `,
        heroImage: "/images/projects/discovery/visual-9.jpg",
        hero_image: "/images/projects/discovery/visual-9.jpg",
        galleryImages: [
            "/images/projects/discovery/visual-13.jpg",
            "/images/projects/discovery/visual-4.jpg",
            "/images/projects/discovery/visual-12.jpg"
        ],
        features: [
            "Architectural 3-Layer Lighting Plans",
            "High CRI 95+ LED Fixture Selection",
            "Smart Home Scene Automation",
            "Energy-Efficient Low-Voltage Drivers",
            "Accent & Wall-Grazing Feature Lights"
        ],
        processSteps: [
            { title: "Lux & Spatial Lighting Calculation", description: "Calculating required lumen levels, glare indexes, and color temperature targets for each space." },
            { title: "Fixture Specification & Circuitry", description: "Selecting COB downlights, magnetic tracks, linear profiles, and dimmable LED drivers." },
            { title: "Precision Wiring & Driver Placement", description: "Installing concealed conduit wiring and accessible central driver enclosures." },
            { title: "Scene Programming & Aiming", description: "Aiming accent spotlights, programming mood scenes, and testing smart controls." }
        ],
        process_steps: [
            { title: "Lux & Spatial Lighting Calculation", description: "Calculating required lumen levels, glare indexes, and color temperature targets for each space." },
            { title: "Fixture Specification & Circuitry", description: "Selecting COB downlights, magnetic tracks, linear profiles, and dimmable LED drivers." },
            { title: "Precision Wiring & Driver Placement", description: "Installing concealed conduit wiring and accessible central driver enclosures." },
            { title: "Scene Programming & Aiming", description: "Aiming accent spotlights, programming mood scenes, and testing smart controls." }
        ],
        faq: [
            { question: "What is Color Rendering Index (CRI) and why does it matter?", answer: "CRI measures how accurately light reveals true colors. We use CRI 90+ fixtures so fabrics, woods, and skin tones look natural and vibrant." },
            { question: "Can I control all lighting from my smartphone?", answer: "Yes, we integrate smart automation hubs allowing scene control, scheduling, and remote operation via smartphone apps and voice assistants." },
            { question: "What color temperature do you recommend for residential interiors?", answer: "We recommend warm white (2700K - 3000K) for bedrooms and living rooms, and neutral white (4000K) for kitchen task areas." },
            { question: "How long does a full home lighting installation take?", answer: "Lighting installation and programming typically take 5 to 7 days during final fit-out stages." }
        ],
        relatedServices: ["ceilings", "living-room", "restaurant"]
    },


    // Specialized - 10. Custom Furniture
    {
        id: "custom-furniture",
        categoryId: "specialized",
        category_id: "specialized",
        title: "Custom Furniture",
        slug: "custom-furniture",
        description: "Bespoke handcrafted furniture tailored to your exact space dimensions, material preferences, and design vision.",
        longDescription: `
### Handcrafted Exclusivity for Your Home
Off-the-shelf mass-produced furniture rarely fits room proportions perfectly. Our custom furniture design atelier crafts one-of-a-kind pieces tailored to your exact space, aesthetic taste, and comfort requirements.

### Master Artisan Craftsmanship
Every custom piece is built by seasoned carpenters and upholsterers using premium raw materials:
* **Solid Hardwood Frame Construction:** Seasoned teak, oak, and walnut woods providing structural longevity.
* **Bespoke Upholstery Selection:** Choose from hundreds of luxury velvets, bouclés, top-grain leathers, and stain-resistant linens.
* **Custom Metal & Marble Inlays:** Precision brass detailing, fluted wood carving, and natural Italian marble table tops.

### Tailored Ergonomics
Whether crafting a custom 10-seater dining table, a plush velvet tufted bedhead, or a curved sectional sofa, we tailor cushion density and seat depth to your personal preference.

### Complementary Services
Explore how our custom furniture elevates [Living Room Design](/services/residential/living-room) or pairs with our [Bedroom Sanctuaries](/services/residential/bedroom).
        `,
        heroImage: "/images/projects/discovery/visual-2.jpg",
        hero_image: "/images/projects/discovery/visual-2.jpg",
        galleryImages: [
            "/images/projects/discovery/visual-17.jpg",
            "/images/projects/discovery/visual-10.jpg",
            "/images/projects/discovery/visual-6.jpg"
        ],
        features: [
            "Bespoke Dimensions & Proportions",
            "Seasoned Solid Teak & Hardwood Frames",
            "Luxury Fabric & Top-Grain Leather Options",
            "Hand-Carved & Metal Inlay Detailing",
            "Custom High-Density Foam Ergonomics"
        ],
        processSteps: [
            { title: "Design Concept & CAD Drafting", description: "Drafting detailed scale drawings with exact length, depth, seat height, and finish specs." },
            { title: "Material & Swatch Selection", description: "Selecting wood stains, metal plating samples, and testing fabric cushion comfort." },
            { title: "Artisan Workshop Fabrication", description: "Precision wood joinery, hand sanding, multi-layer lacquering, and custom upholstery." },
            { title: "White-Glove Home Delivery", description: "Careful packaging, white-glove transport, placement, and final inspection." }
        ],
        process_steps: [
            { title: "Design Concept & CAD Drafting", description: "Drafting detailed scale drawings with exact length, depth, seat height, and finish specs." },
            { title: "Material & Swatch Selection", description: "Selecting wood stains, metal plating samples, and testing fabric cushion comfort." },
            { title: "Artisan Workshop Fabrication", description: "Precision wood joinery, hand sanding, multi-layer lacquering, and custom upholstery." },
            { title: "White-Glove Home Delivery", description: "Careful packaging, white-glove transport, placement, and final inspection." }
        ],
        faq: [
            { question: "How long does custom furniture take to manufacture?", answer: "Custom furniture manufacturing takes 3 to 5 weeks from fabric approval to delivery." },
            { question: "Can you replicate a designer furniture piece from a photo or drawing?", answer: "Yes, our master craftsmen can reproduce high-end furniture concepts while customizing dimensions to fit your space perfectly." },
            { question: "What wood species do you use for solid furniture?", answer: "We primarily work with kiln-dried CP Teak, American Walnut, White Oak, and Rosewood for exceptional strength and grain beauty." },
            { question: "What warranties are included with custom furniture?", answer: "We provide a 5-year warranty on solid wood frame structures and joinery." }
        ],
        relatedServices: ["living-room", "bedroom", "restaurant"]
    }
];