import gsap from "gsap";
import { PinnedChapter } from "@/components/motion/PinnedChapter";
import { ChapterKicker } from "@/components/home/ChapterKicker";
import { useTransformationStories } from "@/hooks/useTransformationStories";
import { getOptimizedUrl } from "@/lib/cdn";

/**
 * Chapter 04 — Before / After.
 *
 * A 300vh pinned chapter that wipes the "after" photograph across the
 * "before" one as the visitor scrolls (progress 0.12 → 0.82), with a gold
 * seam at the wipe edge and the outcome line surfacing at the end. The
 * wipe is a single CSS custom property (`--wipe`) driven by GSAP, so
 * there is no per-frame layout — only a clip-path and a transform.
 *
 * Reads the first active transformation story that has both images;
 * renders nothing when there is none. Under prefers-reduced-motion it
 * shows a static half/half split.
 */
export const TransformationChapter = () => {
  const { data: stories = [] } = useTransformationStories();
  const story = stories[0];
  if (!story) return null;

  return (
    <PinnedChapter
      id="transformation"
      runway={2}
      mobileRunway={1.4}
      className="group"
      deps={[story.id]}
      stageClassName="bg-[var(--s-canvas-secondary)] text-[var(--s-text-primary)]"
      build={({ tl, q }) => {
        // Drive the wipe through a plain number and write the custom property
        // ourselves: GSAP's own CSS-variable handling loses the initial value
        // under React strict-mode remounts.
        const wipeEl = q(".wipe")[0] as HTMLElement | undefined;
        const state = { wipe: 0 };
        const apply = () => wipeEl?.style.setProperty("--wipe", `${state.wipe}%`);
        apply();
        gsap.set(q(".wipe-outro"), { autoAlpha: 0, y: 20 });
        gsap.set(q(".wipe-label-after"), { autoAlpha: 0 });

        tl.to(q(".wipe-frame"), { scale: 1.05, duration: 1 }, 0)
          .to(state, { wipe: 100, duration: 0.7, ease: "power1.inOut", onUpdate: apply }, 0.12)
          .to(q(".wipe-label-before"), { autoAlpha: 0, duration: 0.1 }, 0.55)
          .to(q(".wipe-label-after"), { autoAlpha: 1, duration: 0.1 }, 0.5)
          .to(q(".wipe-outro"), { autoAlpha: 1, y: 0, duration: 0.12, ease: "power1.out" }, 0.82);
      }}
    >
      <div className="relative z-10 h-full w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 flex flex-col justify-between pt-[12vh] pb-[7vh] md:pt-[13vh] md:pb-[8vh]">
        <div className="flex items-end justify-between gap-6 mb-5 md:mb-8">
          <div>
            <ChapterKicker className="mb-4 md:mb-6">Chapter 04</ChapterKicker>
            <h2
              className="font-display text-[clamp(2.25rem,5vw,5rem)] leading-[1] text-[var(--s-text-primary)]"
              style={{ letterSpacing: "-0.03em" }}
            >
              <span className="font-light text-white/70">{story.title}</span>
            </h2>
          </div>
          {story.location && (
            <span className="hidden md:block text-[10px] uppercase tracking-[0.3em] font-bold text-white/50">{story.location}</span>
          )}
        </div>

        {/* The wipe */}
        <div className="wipe relative flex-1 min-h-[38vh] overflow-hidden [--wipe:0%] group-data-[motion=static]:h-[60vh] group-data-[motion=static]:[--wipe:50%]">
          <div className="wipe-frame absolute inset-0 will-change-transform transform-gpu">
            <img
              src={getOptimizedUrl(story.beforeMedia, { width: 1920, quality: 82 })}
              alt={`${story.title} — before`}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover grayscale-[0.35]"
            />
            <img
              src={getOptimizedUrl(story.afterMedia, { width: 1920, quality: 82 })}
              alt={`${story.title} — after`}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ clipPath: "inset(0 calc(100% - var(--wipe)) 0 0)" }}
            />
          </div>
          {/* Seam */}
          <div
            aria-hidden="true"
            className="absolute top-0 bottom-0 w-px bg-[#C9A85C] shadow-[0_0_24px_rgba(201,168,92,0.6)]"
            style={{ left: "var(--wipe)" }}
          />
          <span className="wipe-label-before absolute left-4 md:left-8 bottom-4 md:bottom-8 text-[10px] uppercase tracking-[0.3em] font-bold text-white/80 px-3 py-2 bg-black/40 backdrop-blur-sm">
            Before
          </span>
          <span className="wipe-label-after absolute right-4 md:right-8 bottom-4 md:bottom-8 text-[10px] uppercase tracking-[0.3em] font-bold text-[#C9A85C] px-3 py-2 bg-black/40 backdrop-blur-sm group-data-[motion=static]:opacity-100">
            After
          </span>
        </div>

        <div className="wipe-outro mt-5 md:mt-8 flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-8">
          {story.challenge && (
            <p className="text-sm md:text-base leading-relaxed text-white/65 max-w-[52ch]">{story.challenge}</p>
          )}
          {story.outcomeMetric && (
            <span className="text-[11px] md:text-xs uppercase tracking-[0.2em] font-semibold text-[#C9A85C] shrink-0">
              {story.outcomeMetric}
            </span>
          )}
        </div>
      </div>
    </PinnedChapter>
  );
};

export default TransformationChapter;
