import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import faqData from "@/data/contactFAQ.json";

const ContactFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative z-10 px-4 py-16 md:py-20">
      <div className="container mx-auto max-w-3xl">

        {/* Section header — compact and centred */}
        <div className="mb-12 text-center">
          <div className="home-kicker mx-auto mb-4 justify-center">Clarity First</div>
          <h2 className="font-serif text-[clamp(1.9rem,3.8vw,3.2rem)] font-medium leading-[1.12] text-white">
            Questions that usually come{" "}
            <span className="text-[#d1af6e]">before the first call.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/40">
            These answers are here to reduce friction before you reach out, not to overwhelm you.
          </p>
        </div>

        {/* Accordion */}
        <div className="rounded-[24px] border border-white/[0.06] bg-[#0A0A0A]/60 overflow-hidden backdrop-blur-xl divide-y divide-white/[0.05]">
          {faqData.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="transition-all duration-400"
                style={{ opacity: openIndex !== null && !isOpen ? 0.7 : 1 }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="group flex w-full items-center justify-between gap-5 px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d1af6e]/40 relative"
                  aria-controls={`contact-faq-panel-${index}`}
                  id={`contact-faq-trigger-${index}`}
                  {...{ "aria-expanded": isOpen }}
                >
                  {/* Active left accent bar */}
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r-full bg-[#d1af6e] transition-all duration-400"
                    style={{ height: isOpen ? "55%" : "0%", boxShadow: isOpen ? "0 0 12px rgba(209,175,110,0.6)" : "none" }}
                  />

                  <div className="flex flex-col gap-1.5 pl-3 flex-1">
                    {index === 0 && (
                      <span className="inline-flex w-fit rounded-full border border-[#d1af6e]/25 bg-[#d1af6e]/8 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#d1af6e]">
                        Most asked
                      </span>
                    )}
                    <span className={`text-sm leading-6 transition-colors duration-300 md:text-[0.95rem] ${
                      isOpen ? "font-medium text-[#d1af6e]" : "text-white/75 group-hover:text-white"
                    }`}>
                      {faq.question}
                    </span>
                  </div>

                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-400 ${
                    isOpen
                      ? "border-[#d1af6e]/35 bg-[#d1af6e]/8"
                      : "border-white/[0.08] bg-white/[0.02] group-hover:border-white/20"
                  }`}>
                    {isOpen
                      ? <Minus size={13} className="text-[#d1af6e]" />
                      : <Plus size={13} className="text-white/40 group-hover:text-white/70 transition-colors" />
                    }
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      id={`contact-faq-panel-${index}`}
                      aria-labelledby={`contact-faq-trigger-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 130, damping: 22, mass: 0.9 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 pt-1 pl-10 text-sm leading-7 text-white/45 border-l-2 border-[#d1af6e]/10 ml-6 mr-6 mb-2">
                        {faq.answer}
                      </p>
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
