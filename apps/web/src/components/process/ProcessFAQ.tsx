import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Section, Eyebrow, DisplayHeading, Body, Em, FaqAccordion, reveal } from "@/components/editorial";

const ProcessFAQ = () => {
  const { data: processFAQs = [] } = useQuery({
    queryKey: ['processFAQs'],
    queryFn: api.getProcessFAQs
  });

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: processFAQs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };

  if (processFAQs.length === 0) return null;

  return (
    <Section rule>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
        <motion.div {...reveal()} className="lg:sticky lg:top-32 lg:self-start">
          <Eyebrow className="mb-6">Questions</Eyebrow>
          <DisplayHeading className="mb-6">
            How the process <Em>actually runs.</Em>
          </DisplayHeading>
          <Body className="max-w-sm">
            What clients ask before signing — how changes are handled, what happens if a stage slips, and who is
            accountable for what.
          </Body>
        </motion.div>

        <FaqAccordion items={processFAQs} idPrefix="process-faq" />
      </div>
    </Section>
  );
};

export default ProcessFAQ;
