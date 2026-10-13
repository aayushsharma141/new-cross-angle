import { WordSwap, useWordCycle } from "@/components/motion/WordSwap";
import { useSiteContent } from "@/content/useSiteContent";

/**
 * "Architecture Without ___ / Is ___." — both words roll together every
 * 3.5 s. Rendered inside PageHero's lede on the Services page.
 */
export const ServicesHeroTagline = () => {
  const { prefix, connector, pairs } = useSiteContent("services.tagline");
  const index = useWordCycle(Math.max(pairs.length, 1));
  const pair = pairs[index % Math.max(pairs.length, 1)];
  if (!pair) return null;

  return (
    <span className="block font-sans text-[clamp(1.15rem,2vw,1.75rem)] font-light leading-[1.4] text-white/85">
      {prefix}{" "}
      <WordSwap word={pair.top} minWidth="12ch" className="text-[#C9A85C] font-semibold" />
      <br />
      {connector} <WordSwap word={`${pair.bottom}.`} minWidth="11.5ch" className="text-[#C9A85C] font-semibold" />
    </span>
  );
};

export default ServicesHeroTagline;
