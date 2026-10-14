import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Section, Eyebrow, DisplayHeading, Body, Em, reveal, textLinkClass } from "@/components/editorial";
import { cn } from "@/lib/utils";
import { useSiteContent } from "@/content/useSiteContent";

/** Three engagement levels as plain columns; the chosen one carries a gold rule. */
const ServicesInvestmentTiers = () => {
  const c = useSiteContent("services.tiers");
  return (
  <Section rule>
    <motion.div {...reveal()} className="mb-14 max-w-3xl md:mb-20">
      <Eyebrow className="mb-6">{c.eyebrow}</Eyebrow>
      <DisplayHeading className="mb-6">
        {c.headingLead} <Em>{c.headingEmphasis}</Em>
      </DisplayHeading>
      <Body className="max-w-xl">{c.body}</Body>
    </motion.div>

    <ul className="grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-3">
      {c.items.map((tier, i) => (
        <motion.li
          key={`${tier.label}-${i}`}
          {...reveal(i * 0.06)}
          className={cn("border-t pt-8", tier.featured ? "border-primary" : "border-white/15")}
        >
          <div className="mb-5 flex items-baseline gap-3">
            <h3 className="font-display text-2xl text-white md:text-[1.75rem]">{tier.label}</h3>
            {tier.featured && (
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary">{c.featuredLabel}</span>
            )}
          </div>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">{tier.tagline}</p>
          <Body className="mb-8 text-sm">{tier.description}</Body>
          <ul className="flex flex-col gap-3">
            {tier.includes.map((item) => (
              <li key={item} className="flex items-baseline gap-3 text-sm font-light text-white/70">
                <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                {item}
              </li>
            ))}
          </ul>
        </motion.li>
      ))}
    </ul>

    <motion.div {...reveal(0.2)} className="mt-16">
      <Link to="/estimate" className={textLinkClass}>
        {c.linkLabel} <span aria-hidden="true">→</span>
      </Link>
    </motion.div>
  </Section>
  );
};

export default ServicesInvestmentTiers;
