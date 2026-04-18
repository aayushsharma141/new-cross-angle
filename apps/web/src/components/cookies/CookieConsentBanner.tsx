import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { useCookieConsent } from "./CookieConsentProvider";

export const CookieConsentBanner = () => {
  const { hasChoice, acceptAll, acceptStrictOnly } = useCookieConsent();

  return (
    <AnimatePresence>
      {!hasChoice && (
        <motion.aside
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-4 z-[120] px-4 md:bottom-6"
          aria-live="polite"
        >
          <div className="mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(16,16,16,0.94),rgba(8,8,8,0.88))] shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(182,24,38,0.18),transparent_34%)] pointer-events-none" />

            <div className="relative flex flex-col gap-5 px-5 py-5 md:flex-row md:items-end md:justify-between md:px-7 md:py-6">
              <div className="max-w-xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#D1AF6E]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Privacy Controls
                </div>

                <h2 className="text-lg font-semibold text-white md:text-xl">
                  Essential storage keeps the site fast. Optional analytics helps us improve it.
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/62 md:text-[15px]">
                  Choose whether we can load measurement scripts. Strict mode keeps only the
                  experience-critical pieces and skips analytics or tracking.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={acceptStrictOnly}
                  className="h-11 rounded-full border-white/12 bg-white/[0.03] px-5 text-[11px] uppercase tracking-[0.2em] text-white/78 hover:bg-white/[0.07] hover:text-white"
                >
                  Strict Only
                </Button>
                <Button
                  type="button"
                  onClick={acceptAll}
                  className="h-11 rounded-full border border-[#B61826]/50 bg-[linear-gradient(135deg,#B61826,#7A0E19)] px-5 text-[11px] uppercase tracking-[0.2em] text-white shadow-[0_18px_45px_rgba(182,24,38,0.28)] hover:brightness-110"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
