import { motion } from "framer-motion";
import { Section, Eyebrow, DisplayHeading, Body, Em, FaqAccordion, reveal } from "@/components/editorial";

const faqs = [
  {
    question: "How long does a typical interior project take?",
    answer:
      "A complete home interior (2–3 BHK) typically takes 90–120 days from design sign-off to handover. Larger homes and villas are scoped individually. Timeline commitments are built into your contract.",
  },
  {
    question: "Do you handle execution, or just design?",
    answer:
      "We handle everything — design, material procurement, civil work, electrical, custom furniture fabrication, and final styling. The entire project runs under one contract with one point of accountability.",
  },
  {
    question: "Can I use my existing furniture?",
    answer:
      "Absolutely. During the discovery phase, we inventory what you have and decide what stays, what gets repurposed, and what gets replaced. Nothing is discarded without your approval.",
  },
  {
    question: "Do you work outside the city?",
    answer:
      "Yes. We operate across major Indian cities and handle pan-India projects for clients with villas or second homes. Outstation projects include on-site supervision visits at defined intervals.",
  },
  {
    question: "What is the minimum project size you take on?",
    answer:
      "We typically work on single-room transformations upward. For full-home projects, there's no upper limit. Contact us with your scope and we'll tell you honestly if we're the right fit.",
  },
  {
    question: "What does a transparent BOQ actually mean?",
    answer:
      "Before any work begins, you receive a line-item Bill of Quantities — every material, every fixture, every rate, fully itemised. You approve it. We execute against it. No hidden additions mid-project.",
  },
];

const ServicesFAQ = () => (
  <Section rule>
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
      <motion.div {...reveal()} className="lg:sticky lg:top-32 lg:self-start">
        <Eyebrow className="mb-6">Common questions</Eyebrow>
        <DisplayHeading className="mb-6">
          Before you <Em>commit.</Em>
        </DisplayHeading>
        <Body className="max-w-sm">
          What clients most often want settled before a project starts — scope, timelines and how the money is
          accounted for.
        </Body>
      </motion.div>

      <FaqAccordion items={faqs} idPrefix="services-faq" />
    </div>
  </Section>
);

export default ServicesFAQ;
