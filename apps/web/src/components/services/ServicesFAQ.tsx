import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "How long does a typical interior project take?",
    a: "A complete home interior (2–3 BHK) typically takes 90–120 days from design sign-off to handover. Larger homes and villas are scoped individually. Timeline commitments are built into your contract.",
  },
  {
    q: "Do you handle execution, or just design?",
    a: "We handle everything — design, material procurement, civil work, electrical, custom furniture fabrication, and final styling. The entire project runs under one contract with one point of accountability.",
  },
  {
    q: "Can I use my existing furniture?",
    a: "Absolutely. During the discovery phase, we inventory what you have and decide what stays, what gets repurposed, and what gets replaced. Nothing is discarded without your approval.",
  },
  {
    q: "Do you work outside the city?",
    a: "Yes. We operate across major Indian cities and handle pan-India projects for clients with villas or second homes. Outstation projects include on-site supervision visits at defined intervals.",
  },
  {
    q: "What is the minimum project size you take on?",
    a: "We typically work on single-room transformations upward. For full-home projects, there's no upper limit. Contact us with your scope and we'll tell you honestly if we're the right fit.",
  },
  {
    q: "What does a transparent BOQ actually mean?",
    a: "Before any work begins, you receive a line-item Bill of Quantities — every material, every fixture, every rate, fully itemised. You approve it. We execute against it. No hidden additions mid-project.",
  },
];

const ServicesFAQ = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative bg-[#040404] py-24 lg:py-36 px-6 overflow-hidden border-b border-white/[0.04]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_50%_40%_at_100%_50%,rgba(196,18,48,0.04),transparent)]" />

      <div className="max-w-[1100px] mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-7"
        >
          <div className="w-10 h-px bg-site-crimson" />
          <span className="font-bold text-[9px] uppercase tracking-[0.45em] text-site-gold">
            Common Questions
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif font-normal text-[clamp(2rem,3.8vw,3.2rem)] leading-[1.1] tracking-tight text-white mb-14"
        >
          Before You{" "}
          <em className="italic text-site-crimson font-light underline underline-offset-[10px] decoration-white/10 decoration-[3px]">
            Reach Out
          </em>
        </motion.h2>

        {/* FAQ accordion */}
        <div className="divide-y divide-white/[0.07]">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <button
                id={`faq-btn-${i}`}
                {...{"aria-expanded": open === i}}
                aria-controls={`faq-panel-${i}`}
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-start justify-between gap-6 py-7 text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-site-crimson"
              >
                <span
                  className={`font-sans text-[0.95rem] font-medium leading-snug transition-colors duration-300 ${
                    open === i ? "text-white" : "text-white/65 group-hover:text-white/90"
                  }`}
                >
                  {faq.q}
                </span>
                <div
                  className={`shrink-0 mt-0.5 w-6 h-6 flex items-center justify-center border transition-all duration-300 ${
                    open === i
                      ? "border-site-crimson text-site-crimson"
                      : "border-white/15 text-white/30 group-hover:border-white/30"
                  }`}
                >
                  {open === i ? (
                    <Minus className="w-3 h-3" />
                  ) : (
                    <Plus className="w-3 h-3" />
                  )}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-btn-${i}`}
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-7 text-[0.88rem] text-white/50 font-light leading-[1.8] max-w-[72ch]">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesFAQ;
