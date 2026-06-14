import { motion } from "framer-motion";
import { Sparkles, Hammer, ShieldAlert, HeartHandshake } from "lucide-react";
import { useParams } from "react-router-dom";

interface Swatch {
  name: string;
  type: string;
  whyChosen: string;
  durability: string;
  maintenance: string;
  img: string;
}

const mockSwatchesData: Record<string, Swatch[]> = {
  "serene-master-suite": [
    { name: "Italian Marble", type: "Flooring", whyChosen: "Selected for its cooling property and soft ambient reflection under low cove LEDs.", durability: "Ultra-high density natural stone, treated for non-porous resistance.", maintenance: "Easy wipe with pH-neutral stone detergent.", img: "https://images.unsplash.com/photo-1620215758223-95c0291936c5?q=80&w=600&auto=format&fit=crop" },
    { name: "Walnut Veneer panels", type: "Wall Finish", whyChosen: "Sourced to inject natural grain contrast against the matte plaster finishes.", durability: "Multi-ply engineered substrate preventing warps under moisture.", maintenance: "Dry microfiber dust and periodic timber polish.", img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=600&auto=format&fit=crop" },
    { name: "Tactile Headboard Fabric", type: "Furniture", whyChosen: "Suede-velvet hybrid chosen for high tactility and sound dampening traits.", durability: "100,000 double rubs score, stain-repellent finish coating.", maintenance: "Vacuum vacuum-cleaning and soft damp cloth care.", img: "https://images.unsplash.com/photo-1588693816654-20a232236a28?q=80&w=600&auto=format&fit=crop" },
    { name: "Warm Plaster Plinth", type: "Base", whyChosen: "Clay-based porous plaster coating to provide earthy tactile borders.", durability: "High hardness coating, impact resistance polymer additive.", maintenance: "Water-based wipe-down.", img: "https://images.unsplash.com/photo-1606170033648-5d55a3edf314?q=80&w=600&auto=format&fit=crop" }
  ],
  "modern-culinary-space": [
    { name: "Arctic White Quartz", type: "Countertop", whyChosen: "Provides seamless visual purity while being entirely food-grade resistant.", durability: "Engineered mineral substrate, scratch-proof, zero heat damage.", maintenance: "Immediate wipe with damp sponge, no special sealing needed.", img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=600&auto=format&fit=crop" },
    { name: "Fluted Screen Glass", type: "Partition", whyChosen: "Diffuses heavy cooking silhouettes while allowing light pathways through zones.", durability: "Tempered safety glass panel frame with metal boundary brackets.", maintenance: "Standard glass spray wipe.", img: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=600&auto=format&fit=crop" },
    { name: "Brushed Brass mix", type: "Fixtures", whyChosen: "Injects metallic warmth highlights against the minimalist cabinetry.", durability: "PVD surface treatment, zero color oxidation, scratch-resistant.", maintenance: "Gentle soap wash, avoid abrasive cleaning pad scrubbers.", img: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=600&auto=format&fit=crop" },
    { name: "German Acrylic fronts", type: "Cabinet Fronts", whyChosen: "Delivers sleek high-gloss reflections that make 300 sq.ft feel open.", durability: "Anti-scratch acrylic film coat, dust repellent properties.", maintenance: "Wipe with glass microfiber cloth.", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop" }
  ],
  "executive-workspace": [
    { name: "White Oak Timber", type: "Executive Desk", whyChosen: "Selected for its strong grain texture and premium organic authority.", durability: "Solid kiln-dried hardwood timber slab with matte sealant coatings.", maintenance: "Dry dusting, immediate coaster wipe for spills.", img: "https://images.unsplash.com/photo-1517502884422-41eaaced0168?q=80&w=600&auto=format&fit=crop" },
    { name: "Grooved Acoustic Felt", type: "Wall Lining", whyChosen: "Sourced to reduce boardroom audio resonance and optimize conference calls.", durability: "Fire-rated recycled PET fiber, impact absorption structure.", maintenance: "Dry vacuuming with brush attachment.", img: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?q=80&w=600&auto=format&fit=crop" },
    { name: "Matte Black Aluminum", type: "Framework", whyChosen: "Brings strong structural geometry lines outlining workspace boundaries.", durability: "Anodized structural grade aluminum profile frame.", maintenance: "Periodic dry dusting.", img: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=600&auto=format&fit=crop" },
    { name: "Biophilic Moss Wall", type: "Focal Panel", whyChosen: "Acts as a visual stress reducer while cleaning and balancing air levels.", durability: "Preserved natural mountain moss requiring zero light/soil feeding.", maintenance: "Self-sustaining, avoid direct water sprays.", img: "https://images.unsplash.com/photo-1572435551855-9084883441a2?q=80&w=600&auto=format&fit=crop" }
  ]
};

const ProjectPalette = () => {
  const { slug } = useParams<{ slug: string }>();

  const activeSlug = slug || "serene-master-suite";
  const swatches = mockSwatchesData[activeSlug] || mockSwatchesData["serene-master-suite"];

  return (
    <section className="py-24 md:py-32 bg-neutral-950 border-t border-white/5 relative overflow-hidden">
      {/* Background illumination */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900/20 via-neutral-950 to-neutral-950 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Title */}
        <div className="mb-20 text-center md:text-left">
          <span className="text-xs font-semibold tracking-[0.35em] uppercase text-site-gold block mb-4">— MATERIAL INTELLIGENCE</span>
          <h2 className="text-3xl md:text-5xl text-white tracking-tight font-serif font-normal leading-[1.2]">
            Material <span className="italic text-site-crimson font-light">Swatches Board</span>
          </h2>
        </div>

        {/* Unfolding Swatches Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {swatches.map((swatch, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.15 }}
              className="group relative aspect-[3/4] overflow-hidden bg-neutral-900 border border-white/10 rounded-xl cursor-pointer shadow-2xl flex flex-col justify-end"
            >
              {/* Texture Image Layer */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={swatch.img} 
                  alt={swatch.name} 
                  className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 opacity-75 group-hover:opacity-40"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent z-1 pointer-events-none" />
              </div>

              {/* Swatch Header Info */}
              <div className="p-6 relative z-10 w-full transition-transform duration-500 transform group-hover:-translate-y-48">
                <span className="text-[9px] uppercase tracking-widest text-site-gold font-mono block mb-1">
                  {swatch.type}
                </span>
                <h3 className="text-white font-serif text-xl font-medium">
                  {swatch.name}
                </h3>
              </div>

              {/* Unfolding Details Drawer (Sliding up from bottom on hover) */}
              <div className="absolute inset-x-0 bottom-0 h-48 bg-neutral-900/95 border-t border-white/10 p-6 flex flex-col justify-between translate-y-48 group-hover:translate-y-0 transition-transform duration-500 z-20">
                <div className="space-y-4">
                  {/* Why Chosen */}
                  <div className="flex gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-site-gold shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[8px] uppercase tracking-widest text-stone-500 font-bold block">Why Chosen</span>
                      <p className="text-[11px] text-stone-300 font-light leading-snug">{swatch.whyChosen}</p>
                    </div>
                  </div>

                  {/* Durability */}
                  <div className="flex gap-2">
                    <Hammer className="w-3.5 h-3.5 text-site-crimson shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[8px] uppercase tracking-widest text-stone-500 font-bold block">Durability</span>
                      <p className="text-[11px] text-stone-300 font-light leading-snug">{swatch.durability}</p>
                    </div>
                  </div>

                  {/* Maintenance */}
                  <div className="flex gap-2">
                    <HeartHandshake className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[8px] uppercase tracking-widest text-stone-500 font-bold block">Maintenance</span>
                      <p className="text-[11px] text-stone-300 font-light leading-snug">{swatch.maintenance}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ProjectPalette;
