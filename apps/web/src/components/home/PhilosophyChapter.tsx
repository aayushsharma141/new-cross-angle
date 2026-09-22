import { useMemo } from "react";
import gsap from "gsap";
import { PinnedChapter } from "@/components/motion/PinnedChapter";
import { useSiteMediaSlot } from "@/hooks/useSiteMediaSlot";
import { getOptimizedUrl } from "@/lib/cdn";
import { ChapterKicker } from "@/components/home/ChapterKicker";

const PHILOSOPHY_LINES = [
  "We treat interior design as an engineering problem, not decoration.",
  "Every line has a purpose. Every material is chosen to last.",
];

/** Split a sentence into word spans the timeline can scrub one by one. */
const NBSP = String.fromCharCode(160);

/**
 * Backdrop photograph resolved through `site_media_assets`
 * (asset_key `home_philosophy_<slot>`) with a static fallback.
 */
const Backdrop = ({ slot, fallback }: { slot: string; fallback: string }) => {
  const { url } = useSiteMediaSlot(`home_philosophy_${slot}`, fallback);
  return (
    <img
      src={getOptimizedUrl(url, { width: 1920, quality: 82 })}
      alt=""
      loading="lazy"
      decoding="async"
      className="absolute inset-0 w-full h-full object-cover object-[70%_center] md:object-center"
    />
  );
};

const Words = ({ text, className }: { text: string; className?: string }) => {
  const words = useMemo(() => text.split(" "), [text]);
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="chapter-word inline-block will-change-[opacity]">
          {word}
          {i < words.length - 1 ? NBSP : ""}
        </span>
      ))}
    </span>
  );
};

/**
 * Chapter 01 — The Philosophy.
 *
 * A 250vh pinned chapter. As the visitor scrolls:
 *   0.00–0.22  the chapter title lifts away and the background slowly pushes in
 *   0.18–0.30  the philosophy statement settles into place
 *   0.30–0.78  each word of the statement brightens in turn (word-scrub)
 *   0.45–0.85  daytime photograph crossfades to the evening one
 *   0.82–1.00  the closing line and link surface
 *
 * Under prefers-reduced-motion the title layer is hidden and the statement
 * renders fully lit in a single static viewport.
 */
export const PhilosophyChapter = () => (
  <PinnedChapter
    id="philosophy"
    runway={1.5}
    className="group"
    stageClassName="bg-[var(--s-canvas-primary)] flex items-center justify-center"
    build={({ tl, q }) => {
      const words = q(".chapter-word");
      const wordSpan = 0.48;

      // Scrubbed timelines render lazily, so pin the hidden start states
      // explicitly instead of relying on fromTo's immediateRender.
      gsap.set(q(".chapter-body"), { autoAlpha: 0, y: "10vh" });
      gsap.set(words, { opacity: 0.14 });
      gsap.set(q(".chapter-outro"), { autoAlpha: 0, y: 24 });

      tl.to(q(".chapter-bg"), { scale: 1.12, duration: 1 }, 0)
        .to(q(".chapter-title"), { autoAlpha: 0, y: "-28vh", duration: 0.22, ease: "power1.in" }, 0)
        .to(q(".chapter-body"), { autoAlpha: 1, y: 0, duration: 0.14, ease: "power1.out" }, 0.18)
        .to(words, { opacity: 1, duration: 0.06, stagger: { amount: wordSpan - 0.06 } }, 0.3)
        .to(q(".chapter-bg-night"), { opacity: 1, duration: 0.4 }, 0.45)
        .to(q(".chapter-outro"), { autoAlpha: 1, y: 0, duration: 0.14, ease: "power1.out" }, 0.82);
    }}
  >
    {/* Background: two photographs, slow push-in, crossfade day → evening */}
    <div aria-hidden="true" className="chapter-bg absolute inset-0 will-change-transform transform-gpu">
      <Backdrop slot="backdrop-day" fallback="/luxury_interior_base.png" />
      <div className="chapter-bg-night absolute inset-0 opacity-0 will-change-[opacity] group-data-[motion=static]:opacity-100">
        <Backdrop slot="backdrop-night" fallback="/reality_render.jpg" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/62 to-black/85" />
      <div className="absolute inset-0 home-noise mix-blend-overlay" />
    </div>

    <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 h-full">
      {/* Layer A — chapter title (lifts away on scroll) */}
      <div className="chapter-title absolute inset-0 px-6 flex flex-col items-center justify-center text-center will-change-transform group-data-[motion=static]:hidden">
        <ChapterKicker align="center" className="mb-8">Chapter 01</ChapterKicker>
        <h2
          className="font-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] text-[var(--s-text-primary)] mb-8"
          style={{ letterSpacing: "-0.03em" }}
        >
          <span className="block font-light text-white/75">Homes Designed</span>
          <span className="block font-normal">For Living.</span>
        </h2>
        <p className="text-[10px] md:text-xs tracking-[0.35em] uppercase font-bold text-[#C9A85C]/80">Scroll to explore</p>
      </div>

      {/* Layer B — the philosophy statement (word-scrubbed) */}
      <div className="chapter-body absolute inset-0 flex flex-col justify-center max-w-5xl mx-auto px-6 md:px-12 will-change-transform group-data-[motion=static]:relative group-data-[motion=static]:py-[18vh]">
        <span className="home-kicker mb-6 md:mb-10 block uppercase text-[10px] tracking-[0.3em] font-bold text-white/50">The Philosophy</span>
        <p
          className="font-display text-[clamp(1.9rem,5.2vw,4.6rem)] leading-[1.12] md:leading-[1.06] text-[var(--s-text-primary)]"
          style={{ letterSpacing: "-0.02em" }}
        >
          <Words text={PHILOSOPHY_LINES[0]} className="block" />
          <Words text={PHILOSOPHY_LINES[1]} className="block mt-3 md:mt-2 font-light text-white/85" />
        </p>
        <div className="chapter-outro mt-10 md:mt-14 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
          <span className="text-[11px] md:text-xs tracking-[0.2em] uppercase font-semibold text-white/55">
            Engineered for predictability
          </span>
          <span aria-hidden="true" className="hidden sm:block w-10 h-px bg-[#C9A85C]/50" />
          <span className="text-[11px] md:text-xs tracking-[0.2em] uppercase font-semibold text-[#C9A85C]">
            The CrossAngle Predictable Interior System™
          </span>
        </div>
      </div>
    </div>
  </PinnedChapter>
);

export default PhilosophyChapter;
