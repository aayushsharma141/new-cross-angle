import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import faqData from "@/data/contactFAQ.json";
import { Section, Eyebrow, DisplayHeading, Body, Em, reveal, EASE_OUT_EXPO } from "@/components/editorial";

/** Hairline accordion — one open at a time, first open by default. */
const ContactFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
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

        <ul>
          {faqData.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `contact-faq-panel-${index}`;
            const triggerId = `contact-faq-trigger-${index}`;
            return (
              <motion.li key={faq.question} {...reveal(index * 0.04)} className="border-t border-white/10 last:border-b">
                <button
                  type="button"
                  id={triggerId}
                  aria-controls={panelId}
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="group flex w-full items-start justify-between gap-8 py-6 text-left focus-visible:outline-none"
                >
                  <span className="grid grid-cols-[2.5rem_1fr] gap-4">
                    <span className="pt-1.5 text-[10px] font-bold tracking-[0.2em] text-primary">{String(index + 1).padStart(2, "0")}</span>
                    <span
                      className={`font-display text-xl transition-colors duration-300 md:text-2xl group-focus-visible:text-primary ${
                        isOpen ? "text-white" : "text-white/70 group-hover:text-white"
                      }`}
                    >
                      {faq.question}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`mt-2 shrink-0 text-lg font-light leading-none text-white/40 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
                      className="overflow-hidden"
                    >
                      <Body className="pb-7 pl-[3.5rem] pr-8 text-sm md:text-[15px]">{faq.answer}</Body>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
};

export default ContactFAQ;
