import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What interior design services does Cross Angle Interior provide in Jamshedpur?",
    answer: "We offer comprehensive, turn-key interior design services for luxury residential homes, apartments, custom modular kitchens, premium false ceilings, and bespoke commercial spaces/offices across Jamshedpur and surrounding regions."
  },
  {
    question: "How long does a typical home interior project take?",
    answer: "Most premium residential projects take between 45 to 75 days from concept design approval to material execution and final handover. Timeline details are provided transparently during our 3D visualization phase."
  },
  {
    question: "Do you offer custom modular kitchens and modern finishes?",
    answer: "Yes, we specialize in high-end modular kitchens with soft-close mechanisms, custom acrylic or PU finishes, premium quartz countertops, and sleek space-saving accessories designed to last a lifetime."
  },
  {
    question: "What is the process of getting an interior design estimate?",
    answer: "You can use our interactive digital cost estimator page online or contact us directly. We provide a detailed spatial planning consult, followed by exact line-item material estimations and 3D design iterations."
  }
];

export const HomeFAQ = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="relative bg-background py-24 md:py-32 px-6 overflow-hidden">
      <div className="max-w-[900px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-[#D1AF6E]" />
            <span className="font-bold text-[10px] uppercase tracking-[0.4em] text-[#D1AF6E]">Common Questions</span>
            <div className="w-12 h-px bg-[#D1AF6E]" />
          </div>
          <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] tracking-tight text-white">
            Answers <span className="italic font-medium text-[#D1AF6E]">For You</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
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
                  id={`home-faq-btn-${idx}`}
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  aria-controls={isOpen ? `home-faq-panel-${idx}` : undefined}
                  {...{ "aria-expanded": isOpen ? "true" : "false" }}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left text-sm font-medium text-white hover:bg-white/[0.02] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="font-light leading-snug pr-4 text-base md:text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 text-stone-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      id={`home-faq-panel-${idx}`}
                      role="region"
                      aria-labelledby={`home-faq-btn-${idx}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-0">
                        <p className="text-sm md:text-base text-white/60 font-light leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
