import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { processFAQs } from "@/data/process";

const ProcessFAQ = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

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

  return (
    <section className="relative bg-[#050505] border-t border-white/[0.05] py-24 md:py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(196,30,58,0.03)_0%,transparent_50%)]" />
      </div>

      <div className="max-w-[900px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-site-crimson" />
            <span className="font-bold text-[10px] uppercase tracking-[0.4em] text-site-gold">Questions?</span>
            <div className="w-12 h-px bg-site-crimson" />
          </div>
          <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] tracking-tight text-white">
            Common <span className="italic font-medium text-site-crimson">Questions</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {processFAQs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.02]"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  {...{ "aria-expanded": isOpen ? "true" : "false" }}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left text-sm font-medium text-white hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-light leading-snug pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-stone-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-0">
                        <p className="text-sm text-white/60 font-light leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </section>
  );
};

export default ProcessFAQ;
