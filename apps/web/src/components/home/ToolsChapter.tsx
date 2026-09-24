import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ECOSYSTEM_ROUTES } from "@/addons/_shared/ecosystemCopy";
import {
  Section, Eyebrow, DisplayHeading, Body, Em, reveal,
  pillCtaClass, PillCtaInner, textLinkClass,
} from "@/components/editorial";
import { cn } from "@/lib/utils";

interface Tool {
  index: string;
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  duration: string;
  outputs: string[];
  href: string;
  cta: string;
  featured?: boolean;
}

const TOOLS: Tool[] = [
  {
    index: "01",
    eyebrow: "Style discovery",
    title: <>Find your design <Em>identity.</Em></>,
    description:
      "A guided read of instinct, emotion and texture that produces your interior archetype — the blueprint everything else is built from.",
    duration: "About 6 minutes",
    outputs: ["Your archetype, named", "Colour & material direction", "A practical design roadmap"],
    href: ECOSYSTEM_ROUTES.discovery,
    cta: "Take the style quiz",
    featured: true,
  },
  {
    index: "02",
    eyebrow: "Cost estimator",
    title: <>Know what it <Em>actually costs.</Em></>,
    description:
      "A costed range before the first meeting, built from real project data — and sharper still once it knows your taste.",
    duration: "About 3 minutes",
    outputs: ["Investment range for your scope", "Room-by-room breakdown", "Finish level comparison"],
    href: ECOSYSTEM_ROUTES.estimator,
    cta: "Get an estimate",
  },
];

/**
 * The two tools, presented on the home page as a headline attraction rather
 * than a pair of nav links.
 *
 * They are one system with two entry points: discovery answers what the space
 * should be, the estimator what it costs. Either can be taken alone, so both
 * are shown at full weight — mirroring the tools' own landing pages.
 */
export const ToolsChapter = () => (
  <Section rule>
    <motion.div {...reveal()} className="mb-16 max-w-3xl md:mb-24">
      <Eyebrow className="mb-6">Start before you commit</Eyebrow>
      <DisplayHeading className="mb-6">
        Two ways in. <Em>One system.</Em>
      </DisplayHeading>
      <Body className="max-w-xl">
        Most studios make you book a meeting to learn anything. Ours gives you a design direction and a costed range
        first — free, in minutes, with no obligation. Take either on its own, or let one feed the other.
      </Body>
    </motion.div>

    <ul className="grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-2">
      {TOOLS.map((tool, i) => (
        <motion.li
          key={tool.index}
          {...reveal(0.1 + i * 0.08)}
          className={cn("flex flex-col border-t pt-8", tool.featured ? "border-primary" : "border-white/15")}
        >
          <div className="mb-6 flex items-baseline gap-4">
            <span className="font-display text-xl leading-none text-primary">{tool.index}</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">{tool.eyebrow}</span>
            {tool.featured && (
              <span className="ml-auto text-[9px] font-bold uppercase tracking-[0.25em] text-primary">Start here</span>
            )}
          </div>

          <DisplayHeading as="h3" size="sm" className="mb-4">{tool.title}</DisplayHeading>
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
            {tool.featured ? (
              <Link to={tool.href} className={pillCtaClass}>
                <PillCtaInner>{tool.cta}</PillCtaInner>
              </Link>
            ) : (
              <Link to={tool.href} className={textLinkClass}>
                {tool.cta} <span aria-hidden="true">→</span>
              </Link>
            )}
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30">{tool.duration}</span>
          </div>
        </motion.li>
      ))}
    </ul>
  </Section>
);

export default ToolsChapter;
