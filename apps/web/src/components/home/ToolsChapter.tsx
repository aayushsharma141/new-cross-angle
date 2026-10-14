import { motion } from "framer-motion";
import { ContentLink } from "@/content/ContentLink";
import { useSiteContent } from "@/content/useSiteContent";
import {
  Section, Eyebrow, DisplayHeading, Body, Em, reveal,
  pillCtaClass, PillCtaInner, textLinkClass,
} from "@/components/editorial";
import { cn } from "@/lib/utils";

/**
 * The two tools, presented on the home page as a headline attraction rather
 * than a pair of nav links.
 *
 * They are one system with two entry points: discovery answers what the space
 * should be, the estimator what it costs. Either can be taken alone, so both
 * are shown at full weight — mirroring the tools' own landing pages.
 */
export const ToolsChapter = () => {
  const { eyebrow, headingLead, headingEmphasis, intro, items: tools } = useSiteContent("home.tools");
  return (
  <Section rule>
    <motion.div {...reveal()} className="mb-16 max-w-3xl md:mb-24">
      <Eyebrow className="mb-6">{eyebrow}</Eyebrow>
      <DisplayHeading className="mb-6">
        {headingLead} <Em>{headingEmphasis}</Em>
      </DisplayHeading>
      <Body className="max-w-xl">{intro}</Body>
    </motion.div>

    <ul className="grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-2">
      {tools.map((tool, i) => {
        const featured = i === 0;
        return (
        <motion.li
          key={`${tool.index}-${i}`}
          {...reveal(0.1 + i * 0.08)}
          className={cn("flex flex-col border-t pt-8", featured ? "border-primary" : "border-white/15")}
        >
          <div className="mb-6 flex items-baseline gap-4">
            <span className="font-display text-xl leading-none text-primary">{tool.index}</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">{tool.eyebrow}</span>
            {featured && (
              <span className="ml-auto text-[9px] font-bold uppercase tracking-[0.25em] text-primary">Start here</span>
            )}
          </div>

          <DisplayHeading as="h3" size="sm" className="mb-4">{tool.titleLead} <Em>{tool.titleEmphasis}</Em></DisplayHeading>
          <Body className="mb-8 max-w-sm text-sm md:text-[15px]">{tool.description}</Body>

          <div className="mb-10 border-t border-white/10 pt-6">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">You receive</p>
            <ul className="flex flex-col gap-2">
              {tool.outputs.map((output) => (
                <li key={output} className="flex items-baseline gap-3 text-sm font-light text-white/70">
                  <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                  {output}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3">
            {featured ? (
              <ContentLink href={tool.href} className={pillCtaClass}>
                <PillCtaInner>{tool.ctaLabel}</PillCtaInner>
              </ContentLink>
            ) : (
              <ContentLink href={tool.href} className={textLinkClass}>
                {tool.ctaLabel} <span aria-hidden="true">→</span>
              </ContentLink>
            )}
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30">{tool.duration}</span>
          </div>
        </motion.li>
        );
      })}
    </ul>
  </Section>
  );
};

export default ToolsChapter;
