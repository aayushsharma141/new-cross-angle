import { motion } from "framer-motion";
import { Section, Eyebrow, DisplayHeading, Body, Em, reveal } from "@/components/editorial";
import { useSiteContent } from "@/content/useSiteContent";

/** Everything included in a turn-key engagement, as one plain list. */
const ServicesDeliverables = () => {
  const c = useSiteContent("services.deliverables");
  return (
  <Section rule>
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
      <motion.div {...reveal()} className="lg:sticky lg:top-32 lg:self-start">
        <Eyebrow className="mb-6">{c.eyebrow}</Eyebrow>
        <DisplayHeading className="mb-6">
          {c.headingLead} <Em>{c.headingEmphasis}</Em>
        </DisplayHeading>
        <Body className="max-w-sm">{c.body}</Body>
      </motion.div>

      <ul className="grid grid-cols-1 gap-x-12 sm:grid-cols-2">
        {c.items.map((item, i) => (
          <motion.li
            key={`${item.label}-${i}`}
            {...reveal(Math.min(i, 6) * 0.04)}
            className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-white/10 py-6"
          >
            <span className="pt-1 text-[10px] font-bold tracking-[0.2em] text-primary">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="font-display text-lg text-white md:text-xl">{item.label}</h3>
              <Body className="mt-1.5 text-sm">{item.desc}</Body>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  </Section>
  );
};

export default ServicesDeliverables;
