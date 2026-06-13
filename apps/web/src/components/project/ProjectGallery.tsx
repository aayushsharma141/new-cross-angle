import { motion } from "framer-motion";
import { MediaSlot } from "@/components/ui/enhanced/MediaSlot";

interface GalleryItem {
  room: string;
  images: string[];
}

interface ProjectGalleryProps {
  gallery: GalleryItem[];
  title?: string;
}

interface WalkthroughEntry {
  image: string;
  room: string;
  narrative: string;
  localContext: string;
  assetKey?: string;
}

const defaultEntries: WalkthroughEntry[] = [
  {
    image: "/images/projects/discovery/lifestyle-5.jpg",
    room: "Entry Experience",
    narrative: "The threshold between outside and inside was redesigned as a decompression sequence. Dropping ceiling height at entry then opening to full volume creates an immediate sense of arrival.",
    localContext: "In Jamshedpur's industrial context, a strong decompression sequence between public street noise and private interior calm was prioritised from the first sketch.",
    assetKey: "project_gallery_fallback_1"
  },
  {
    image: "/images/projects/portfolio-bedroom.jpg",
    room: "Primary Suite",
    narrative: "Form follows daily ritual. The layout was mapped against the client's actual morning and evening routines before a single furniture piece was selected.",
    localContext: "Seasonal wardrobe rotation, festival clothing storage, and daily-use separation were all integrated into the wall system — designed around Indian household realities, not Western minimalist assumptions.",
    assetKey: "project_gallery_fallback_2"
  },
  {
    image: "/images/projects/discovery/visual-11.jpg",
    room: "Material Moment",
    narrative: "Material transitions act as psychological boundaries. No hard partitions were needed — the change from oak to terrazzo signals a shift in zone and pace.",
    localContext: "All finishes were selected for durability under high-humidity Jharkhand conditions. The smoked oak veneer is pre-treated for dimensional stability across temperature cycles.",
    assetKey: "project_gallery_fallback_3"
  },
  {
    image: "/images/projects/portfolio-office.jpg",
    room: "Executive Focus Zone",
    narrative: "Proportions were mathematically scaled to human comfort metrics — not standard office dimensions. The result is a room that breathes, feels expansive yet intimate during occupancy.",
    localContext: "Natural daylight was prioritised to reduce dependence on artificial lighting during Jamshedpur's long summer days, reducing occupant fatigue over 10+ hour workdays.",
    assetKey: "project_gallery_fallback_4"
  },
];

const getNarrative = (room: string, image: string, idx: number, gallery: WalkthroughEntry[]): WalkthroughEntry => {
  if (gallery[idx]) return gallery[idx];
  return defaultEntries[idx % defaultEntries.length];
};

const ProjectGallery = ({ gallery }: ProjectGalleryProps) => {
  // Build walkthrough entries from gallery or fallback
  const rawImages = gallery.flatMap((item) =>
    item.images.map((img) => ({ image: img, room: item.room }))
  );

  const entries: WalkthroughEntry[] = rawImages.length > 0
    ? rawImages.map((img, idx) => ({
        image: img.image,
        room: img.room,
        narrative: defaultEntries[idx % defaultEntries.length].narrative,
        localContext: defaultEntries[idx % defaultEntries.length].localContext,
      }))
    : defaultEntries;

  return (
    <section className="py-24 md:py-36 border-t border-white/5">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="max-w-6xl mx-auto px-6 md:px-12 mb-24 flex items-center gap-4"
      >
        <span className="text-xs font-medium tracking-[0.3em] uppercase text-primary">Guided Walkthrough</span>
        <span className="flex-1 h-px bg-white/10 max-w-xs" />
      </motion.div>

      <div className="flex flex-col gap-0">
        {entries.map((entry, idx) => {
          const isEven = idx % 2 === 0;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`grid grid-cols-1 lg:grid-cols-2 min-h-[60vh] ${!isEven ? "lg:flex-row-reverse" : ""}`}
            >
              {/* Image panel */}
              <div className={`relative overflow-hidden bg-neutral-900 group shadow-2xl shadow-black/80 ring-1 ring-white/5 ${!isEven ? "lg:order-2" : ""}`}>
                <MediaSlot
                  assetKey={entry.assetKey || ""}
                  fallbackUrl={entry.image}
                  alt={entry.room}
                  className="w-full h-full object-cover object-center min-h-[50vw] lg:min-h-0 aspect-[4/3] transition-transform duration-[2s] ease-out group-hover:scale-105"
                />
                {/* Room number overlay */}
                <div className="absolute top-8 left-8 lg:top-10 lg:left-10">
                  <span className="text-[10px] font-mono text-white/40 tracking-[0.3em]">
                    0{idx + 1} / 0{entries.length}
                  </span>
                </div>
              </div>

              {/* Text panel */}
              <div className={`flex flex-col justify-center px-8 py-16 md:px-12 md:py-20 lg:px-20 bg-gradient-to-b from-transparent to-neutral-950/50 ${!isEven ? "lg:order-1 bg-neutral-950" : "bg-neutral-900/40"}`}>
                <div className="max-w-md">
                  <span className="text-[9px] font-medium tracking-[0.3em] uppercase text-primary mb-6 block">
                    {entry.room}
                  </span>

                  <p className="text-2xl md:text-3xl font-serif text-white leading-[1.3] mb-8 font-normal">
                    {entry.narrative}
                  </p>

                  {/* Local context callout */}
                  <div className="border-l-2 border-primary/30 pl-5 mt-8">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-primary mb-2 block">Local Context</span>
                    <p className="text-stone-500 font-light text-sm leading-relaxed italic">
                      {entry.localContext}
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default ProjectGallery;
