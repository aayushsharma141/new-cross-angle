import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import faqData from "@/data/contactFAQ.json";

const ContactFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const prioritizedFaqs = faqData;

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="home-section-frame relative z-10 px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-5xl">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <div className="home-kicker mx-auto mb-4 justify-center">Clarity First</div>
          <h2 className="home-title text-center text-[clamp(2.2rem,4.5vw,4.4rem)]">
            Questions that usually come
            <span className="home-title-accent"> before the first call.</span>
          </h2>
          <p className="home-body mx-auto mt-5 text-base">
            These answers are here to reduce friction before you reach out, not to
            overwhelm you with policy language.
          </p>
        </div>

        <div className="home-panel-muted overflow-hidden rounded-[30px] p-3 md:p-4">
          {prioritizedFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            // determine if another item is open so we can dim this one if it's inactive
            const isDimmed = openIndex !== null && !isOpen;
            
            return (
              <div
                key={index}
                className="overflow-hidden border-b last:border-b-0 transition-all duration-500"
                style={{
                  borderColor: isOpen ? "rgba(209, 175, 110, 0.2)" : "var(--home-border-soft)",
                  opacity: isDimmed ? 0.4 : 1,
                  transform: isDimmed ? "scale(0.99)" : "scale(1)",
                }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="group flex w-full items-center justify-between gap-6 px-4 md:px-6 py-6 text-left focus:outline-none relative"
                  aria-expanded={isOpen ? true : false}
                >
                  {/* Left glowing line indicator */}
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-md bg-[#d1af6e] transition-all duration-500 ${isOpen ? 'h-[60%] shadow-[0_0_15px_rgba(209,175,110,0.8)]' : 'h-0'}`} />
                  
                  <span
                    className={`text-base leading-7 transition-colors duration-300 md:text-lg pl-2 ${
                      isOpen
                        ? "text-[#d1af6e] font-medium"
                        : "text-[var(--site-text)] group-hover:text-white"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <div
                    className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-500 ${
                      isOpen
                        ? "border-[#d1af6e]/40 bg-[#d1af6e]/10 shadow-[0_0_15px_rgba(209,175,110,0.15)]"
                        : "border-[var(--home-border-soft)] bg-white/[0.02] group-hover:border-white/40"
                    }`}
                  >
                    {isOpen ? (
                      <Minus size={16} className="text-[#d1af6e] transition-transform duration-500 rotate-180" />
                    ) : (
                      <Plus size={16} className="text-[var(--site-text-muted)] group-hover:text-white transition-transform duration-500" />
                    )}
                  </div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: "auto", opacity: 1, marginTop: 10 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      transition={{ type: "spring", stiffness: 120, damping: 20, mass: 1 }}
                      className="px-4 text-[var(--site-text-muted)] leading-7 md:px-8 pb-6 pl-6 text-sm md:text-base border-l border-[#d1af6e]/10 ml-4 max-w-[90%]"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ContactFAQ;
