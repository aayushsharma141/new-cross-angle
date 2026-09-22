import { WordSwap, useWordCycle } from "@/components/motion/WordSwap";

const PAIRS = [
  { top: "Intelligence", bottom: "Decoration" },
  { top: "Execution", bottom: "Incomplete" },
  { top: "Experience", bottom: "Forgettable" },
];

/**
 * "Architecture Without ___ / Is ___." — both words roll together every
 * 3.5 s. Rendered inside PageHero's lede on the Services page.
 */
export const ServicesHeroTagline = () => {
  const index = useWordCycle(PAIRS.length);
  const pair = PAIRS[index];

  return (
    <span className="block font-sans text-[clamp(1.15rem,2vw,1.75rem)] font-light leading-[1.4] text-white/85">
      Architecture Without{" "}
      <WordSwap word={pair.top} minWidth="12ch" className="text-[#C9A85C] font-semibold" />
      <br />
      Is <WordSwap word={`${pair.bottom}.`} minWidth="11.5ch" className="text-[#C9A85C] font-semibold" />
    </span>
  );
};

export default ServicesHeroTagline;
