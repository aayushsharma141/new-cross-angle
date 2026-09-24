import { motion } from "framer-motion";
import faqData from "@/data/contactFAQ.json";
import { Section, Eyebrow, DisplayHeading, Body, Em, FaqAccordion, reveal } from "@/components/editorial";

/** Hairline accordion — one open at a time, first open by default. */
const ContactFAQ = () => (
  <Section rule>
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
      <motion.div {...reveal()} className="lg:sticky lg:top-32 lg:self-start">
        <Eyebrow className="mb-6">Client queries</Eyebrow>
        <DisplayHeading className="mb-6">
          Questions that come <Em>before the first call.</Em>
        </DisplayHeading>
        <Body className="max-w-sm">
          Clarity is the foundation of every successful project. Answers to what we're most often asked about
          process, timelines, and execution.
        </Body>
      </motion.div>

      <FaqAccordion items={faqData} idPrefix="contact-faq" />
    </div>
  </Section>
);

export default ContactFAQ;
