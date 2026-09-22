import gsap from "gsap";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PinnedChapter } from "@/components/motion/PinnedChapter";
import { ChapterKicker } from "@/components/home/ChapterKicker";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { getOptimizedUrl } from "@/lib/cdn";

interface ExpertiseItem {
  index: string;
  title: string;
  description: string;
  href: string;
  image: string;
}

const FALLBACK_ITEMS: Omit<ExpertiseItem, "image">[] = [
  {
    index: "01",
    title: "Complete Home Interiors",
    description: "Turn-key residences planned room by room, from the first drawing to the final styling.",
    href: "/services/residential",
  },
  {
    index: "02",
    title: "Modular Kitchens",
    description: "Factory-built cabinetry, engineered storage and finishes specified for daily use.",
    href: "/services/specialized/modular-kitchens",
  },
  {
    index: "03",
    title: "Luxury Renovations",
    description: "Bedrooms, living areas and wardrobes reworked without disturbing the rest of the home.",
    href: "/services/residential",
  },
  {
    index: "04",
    title: "Commercial Spaces",
    description: "Offices, clinics and retail fit-outs delivered to a fixed schedule.",
    href: "/services/commercial",
  },
];

const FALLBACK_IMAGES = [
  "/reality_render.jpg",
  "/images/projects/discovery/reflect-env-kitchen.jpg",
  "/images/projects/discovery/visual-3.jpg",
  "/images/projects/discovery/visual-16.jpg",
];

/**
 * Chapter 02 — Our Expertise.
 *
 * A 400vh pinned chapter. The runway is split evenly between the four
 * services: as each one becomes active its description unfolds, its
 * photograph crossfades into the frame on the right, and the gold rail
 * beside the list fills to match overall progress.
 *
 * Under prefers-reduced-motion every description is open and only the
 * first photograph renders.
 */
export const ExpertiseChapter = () => {
  const { data: services = [] } = useQuery({
    queryKey: queryKeys.services.all,
    queryFn: api.getServices,
  });

  const pick = (predicate: (s: (typeof services)[number]) => boolean) => services.find(predicate)?.hero_image;
  const images = [
    pick((s) => s.slug === "living-room" || s.category_id === "residential") || FALLBACK_IMAGES[0],
    pick((s) => s.slug === "modular-kitchens") || FALLBACK_IMAGES[1],
    pick((s) => s.slug === "bedroom" || s.category_id === "residential") || FALLBACK_IMAGES[2],
    pick((s) => s.category_id === "commercial") || FALLBACK_IMAGES[3],
  ];
  const items: ExpertiseItem[] = FALLBACK_ITEMS.map((item, i) => ({ ...item, image: images[i] }));

  return (
    <PinnedChapter
      id="expertise"
      runway={3}
      mobileRunway={2}
      className="group"
      deps={[services]}
      stageClassName="bg-[var(--s-canvas-secondary)] text-[var(--s-text-primary)]"
      build={({ tl, q }) => {
        const n = items.length;
        const seg = 1 / n;
        const bodies = q(".exp-body");
        const heads = q(".exp-head");
        const photos = q(".exp-photo");

        // Start closed / unlit; item 0 is open before the pin engages.
        gsap.set(bodies, { height: 0, autoAlpha: 0, overflow: "hidden" });
        gsap.set(heads, { opacity: 0.38 });
        gsap.set(photos, { opacity: 0 });
        gsap.set(bodies[0], { height: "auto", autoAlpha: 1 });
        gsap.set(heads[0], { opacity: 1 });
        gsap.set(photos[0], { opacity: 1 });
        gsap.set(q(".exp-rail"), { scaleY: 0, transformOrigin: "top" });
        gsap.set(q(".exp-intro"), { autoAlpha: 0, y: 24 });

        tl.to(q(".exp-rail"), { scaleY: 1, duration: 1 }, 0)
          .to(q(".exp-frame"), { scale: 1.06, duration: 1 }, 0)
          .to(q(".exp-intro"), { autoAlpha: 1, y: 0, duration: 0.08, ease: "power1.out" }, 0);

        for (let i = 1; i < n; i++) {
          const at = i * seg - 0.04;
          tl.to(bodies[i - 1], { height: 0, autoAlpha: 0, duration: 0.08 }, at)
            .to(heads[i - 1], { opacity: 0.38, duration: 0.08 }, at)
            .to(photos[i - 1], { opacity: 0, duration: 0.1 }, at + 0.02)
            .to(bodies[i], { height: "auto", autoAlpha: 1, duration: 0.08 }, at + 0.02)
            .to(heads[i], { opacity: 1, duration: 0.08 }, at + 0.02)
            .to(photos[i], { opacity: 1, duration: 0.1 }, at);
        }
      }}
    >
      <div className="relative z-10 h-full w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 grid grid-rows-[auto_1fr] md:grid-rows-1 md:grid-cols-12 gap-6 md:gap-12 lg:gap-20 items-center pt-[12vh] pb-[8vh] md:py-0">
        {/* Photograph frame — mobile: on top; desktop: right column */}
        <div className="order-1 md:order-2 md:col-span-6 lg:col-span-6 h-[30vh] md:h-[68vh] relative overflow-hidden">
          <div className="exp-frame absolute inset-0 will-change-transform transform-gpu">
            {items.map((item, i) => (
              <img
                key={item.index}
                src={getOptimizedUrl(item.image, { width: 1600, quality: 82 })}
                alt={item.title}
                loading="lazy"
                decoding="async"
                className={`exp-photo absolute inset-0 w-full h-full object-cover ${i > 0 ? "group-data-[motion=static]:hidden" : ""}`}
              />
            ))}
          </div>
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <div aria-hidden="true" className="absolute bottom-0 left-0 w-16 h-px bg-[#C9A85C]/60" />
        </div>

        {/* Copy + list — mobile: below; desktop: left column */}
        <div className="order-2 md:order-1 md:col-span-6 lg:col-span-5 flex flex-col justify-center min-h-0">
          <div className="exp-intro mb-6 md:mb-12">
            <ChapterKicker className="mb-5 md:mb-8">Chapter 02</ChapterKicker>
            <h2
              className="font-display text-[clamp(2.25rem,5vw,5rem)] leading-[1] text-[var(--s-text-primary)]"
              style={{ letterSpacing: "-0.03em" }}
            >
              <span className="font-light text-white/70">Our </span>
              <span>Expertise</span>
            </h2>
          </div>

          <div className="relative pl-6 md:pl-10">
            <div aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-px bg-white/10" />
            <div aria-hidden="true" className="exp-rail absolute left-0 top-0 bottom-0 w-px bg-[#C9A85C]" />

            <ol className="divide-y divide-white/10">
              {items.map((item) => (
                <li key={item.index} className="py-4 md:py-6">
                  <div className="exp-head flex items-baseline gap-4 md:gap-6">
                    <span className="text-[10px] tracking-[0.3em] font-bold text-[#C9A85C] shrink-0">{item.index}</span>
                    <h3 className="font-display text-xl md:text-3xl lg:text-4xl leading-tight" style={{ letterSpacing: "-0.02em" }}>
                      {item.title}
                    </h3>
                  </div>
                  <div className="exp-body">
                    <p className="pt-3 md:pt-4 pl-8 md:pl-11 text-sm md:text-base leading-relaxed text-white/65 max-w-[40ch]">
                      {item.description}
                    </p>
                    <Link
                      to={item.href}
                      className="mt-4 ml-8 md:ml-11 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-semibold text-[#C9A85C] border-b border-[#C9A85C]/40 pb-1.5 hover:border-[#C9A85C] transition-colors duration-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A85C] motion-reduce:transition-none"
                    >
                      Explore
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </PinnedChapter>
  );
};

export default ExpertiseChapter;
