import { motion } from "framer-motion";
import { Section, Eyebrow, DisplayHeading, Body, Em, FaqAccordion, reveal } from "@/components/editorial";
import { useSiteContent } from "@/content/useSiteContent";

/** Hairline accordion — one open at a time, first open by default. */
const ContactFAQ = () => {
  const c = useSiteContent("contact.faq");
  if (c.items.length === 0) return null;
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

      <FaqAccordion items={c.items} idPrefix="contact-faq" />
    </div>
  </Section>
  );
};

export default ContactFAQ;
