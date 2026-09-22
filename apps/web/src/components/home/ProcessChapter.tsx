import gsap from "gsap";
import { useQuery } from "@tanstack/react-query";
import { PinnedChapter } from "@/components/motion/PinnedChapter";
import { ChapterKicker } from "@/components/home/ChapterKicker";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { getOptimizedUrl } from "@/lib/cdn";

interface ProcessStep {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  image: string;
  imageAlt: string;
}

const FALLBACK_STEPS: ProcessStep[] = [
  {
    id: "01",
    title: "Consult",
    subtitle: "First Meeting",
    detail: "We start by understanding your daily routine, budget and project goals, so the brief is right before a single line is drawn.",
    image: "/reality_render.jpg",
    imageAlt: "Consultation in a finished living room",
  },
  {
    id: "02",
    title: "Measure & Plan",
    subtitle: "Technical Layout",
    detail: "Laser-measured surveys and floor plans that optimise movement and make the best use of every room.",
    image: "/blueprint_shell.jpg",
    imageAlt: "Architectural blueprint and measured planning sheet",
  },
  {
    id: "03",
    title: "Design",
    subtitle: "3D Visuals",
    detail: "Materials, lighting and colour are chosen and rendered photorealistically, so you decide with confidence.",
    image: "/luxury_interior_base.png",
    imageAlt: "Photorealistic interior design preview",
  },
  {
    id: "04",
    title: "Execute",
    subtitle: "Build & Install",
    detail: "Modular cabinetry is manufactured off-site and all on-site work is coordinated to a fixed schedule.",
    image: "/modern_interior_base.png",
    imageAlt: "Interior under installation and styling",
  },
  {
    id: "05",
    title: "Handover",
    subtitle: "Moving In",
    detail: "A final quality check, a full clean, and the keys to a home that is ready to live in.",
    image: "/bedroom_dining_base.png",
    imageAlt: "Completed interior ready for handover",
  },
];

/**
 * Chapter 03 — The Journey.
 *
 * A 500vh pinned chapter, one fifth per step. Each step swaps the large
 * numeral, title and detail on the left and crossfades its photograph on
 * the right, while a horizontal gold rail along the bottom fills with
 * overall progress and the matching marker lights up.
 *
 * Under prefers-reduced-motion the five steps stack vertically.
 */
interface ProcessChapterProps {
  /** Eyebrow text; the homepage numbers it, inner pages name it. */
  kicker?: string;
}

export const ProcessChapter = ({ kicker = "Chapter 03" }: ProcessChapterProps) => {
  const { data: steps = FALLBACK_STEPS } = useQuery({
    queryKey: queryKeys.designProcess.steps,
    queryFn: async (): Promise<ProcessStep[]> => {
      const stages = await api.getProcessStages();
      if (stages.length === 0) return FALLBACK_STEPS;
      return stages.map((stage, i) => ({
        id: stage.number !== "00" ? stage.number : FALLBACK_STEPS[i]?.id || String(i + 1).padStart(2, "0"),
        title: stage.title,
        subtitle: stage.subtitle,
        detail: stage.detail || stage.summary,
        image: stage.image || FALLBACK_STEPS[i]?.image || FALLBACK_STEPS[0].image,
        imageAlt: stage.title,
      }));
    },
  });

  return (
    <PinnedChapter
      id="journey"
      runway={4}
      mobileRunway={2.5}
      className="group"
      deps={[steps]}
      stageClassName="bg-[var(--s-canvas-primary)] text-[var(--s-text-primary)]"
      build={({ tl, q }) => {
        const panels = q(".proc-panel");
        const photos = q(".proc-photo");
        const markers = q(".proc-marker");
        const n = panels.length;
        if (n === 0) return;
        const seg = 1 / n;

        gsap.set(panels, { autoAlpha: 0, y: 28 });
        gsap.set(photos, { opacity: 0 });
        gsap.set(markers, { opacity: 0.35 });
        gsap.set(panels[0], { autoAlpha: 1, y: 0 });
        gsap.set(photos[0], { opacity: 1 });
        gsap.set(markers[0], { opacity: 1 });
        gsap.set(q(".proc-rail"), { scaleX: 0, transformOrigin: "left" });

        tl.to(q(".proc-rail"), { scaleX: 1, duration: 1 }, 0)
          .to(q(".proc-frame"), { scale: 1.08, duration: 1 }, 0);

        for (let i = 1; i < n; i++) {
          const at = i * seg - 0.03;
          tl.to(panels[i - 1], { autoAlpha: 0, y: -20, duration: 0.05 }, at)
            .to(markers[i - 1], { opacity: 0.35, duration: 0.05 }, at)
            .to(photos[i - 1], { opacity: 0, duration: 0.08 }, at + 0.02)
            .to(panels[i], { autoAlpha: 1, y: 0, duration: 0.06, ease: "power1.out" }, at + 0.03)
            .to(markers[i], { opacity: 1, duration: 0.05 }, at + 0.03)
            .to(photos[i], { opacity: 1, duration: 0.08 }, at);
        }
      }}
    >
      <div className="relative z-10 h-full w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 flex flex-col justify-between pt-[12vh] pb-[7vh] md:pt-[13vh] md:pb-[8vh]">
        {/* Top: kicker + heading */}
        <div className="proc-intro flex items-end justify-between gap-6 mb-4 md:mb-0">
          <div>
            <ChapterKicker className="mb-4 md:mb-6">{kicker}</ChapterKicker>
            <h2
              className="font-display text-[clamp(2.25rem,5vw,5rem)] leading-[1] text-[var(--s-text-primary)]"
              style={{ letterSpacing: "-0.03em" }}
            >
              <span className="font-light text-white/70">The </span>
              <span>Journey</span>
            </h2>
          </div>
          <p className="hidden md:block max-w-[30ch] text-sm leading-relaxed text-white/55 text-right">
            Five stages, one fixed schedule. Nothing is left to interpretation.
          </p>
        </div>

        {/* Middle: photograph + step panels */}
        <div className="grid grid-rows-[auto_1fr] md:grid-rows-1 md:grid-cols-12 gap-5 md:gap-12 lg:gap-20 items-center flex-1 min-h-0 py-4 md:py-6 group-data-[motion=static]:block">
          <div className="md:col-span-6 h-[28vh] md:h-[52vh] relative overflow-hidden group-data-[motion=static]:hidden">
            <div className="proc-frame absolute inset-0 will-change-transform transform-gpu">
              {steps.map((step) => (
                <img
                  key={step.id}
                  src={getOptimizedUrl(step.image, { width: 1600, quality: 82 })}
                  alt={step.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className="proc-photo absolute inset-0 w-full h-full object-cover"
                />
              ))}
            </div>
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>

          <div className="md:col-span-6 relative min-h-[34vh] md:min-h-0 md:h-[52vh] group-data-[motion=static]:h-auto group-data-[motion=static]:space-y-16">
            {steps.map((step, i) => (
              <article
                key={step.id}
                className={`proc-panel md:absolute md:inset-0 flex flex-col justify-center will-change-transform ${i > 0 ? "absolute inset-0 group-data-[motion=static]:relative" : ""} group-data-[motion=static]:static`}
              >
                <span
                  aria-hidden="true"
                  className="font-display text-[clamp(4rem,10vw,9rem)] leading-none text-white/[0.08] select-none mb-[-0.35em]"
                >
                  {step.id}
                </span>
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-[#C9A85C] mb-3">{step.subtitle}</span>
                <h3 className="font-display text-[clamp(1.75rem,3.6vw,3.25rem)] leading-tight mb-4" style={{ letterSpacing: "-0.02em" }}>
                  {step.title}
                </h3>
                <p className="text-sm md:text-base leading-relaxed text-white/65 max-w-[44ch]">{step.detail}</p>
                {/* Static fallback: show each step's photo inline */}
                <img
                  src={getOptimizedUrl(step.image, { width: 1200, quality: 80 })}
                  alt={step.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className="hidden group-data-[motion=static]:block mt-6 w-full aspect-[16/9] object-cover"
                />
              </article>
            ))}
          </div>
        </div>

        {/* Bottom: progress rail with markers */}
        <div className="relative pt-5 md:pt-6 group-data-[motion=static]:hidden">
          <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-px bg-white/10" />
          <div aria-hidden="true" className="proc-rail absolute top-0 left-0 right-0 h-px bg-[#C9A85C]" />
          <ol className="flex justify-between gap-2">
            {steps.map((step) => (
              <li key={step.id} className="proc-marker flex flex-col gap-1.5 min-w-0">
                <span className="text-[10px] tracking-[0.3em] font-bold text-[#C9A85C]">{step.id}</span>
                <span className="hidden sm:block text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-white/70 truncate">{step.title}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </PinnedChapter>
  );
};

export default ProcessChapter;
