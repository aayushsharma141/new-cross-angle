import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSiteContent } from "@/content/useSiteContent";
import { Section, Eyebrow, DisplayHeading, Body, Em, FaqAccordion, reveal } from "@/components/editorial";

const ProcessFAQ = () => {
  const intro = useSiteContent("process.faq_intro");
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
          <Eyebrow className="mb-6">{intro.eyebrow}</Eyebrow>
          <DisplayHeading className="mb-6">
            {intro.headingLead} <Em>{intro.headingEmphasis}</Em>
          </DisplayHeading>
          <Body className="max-w-sm">{intro.intro}</Body>
        </motion.div>

        <FaqAccordion items={processFAQs} idPrefix="process-faq" />
      </div>
    </Section>
  );
};

export default ProcessFAQ;
