import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useNewsletter } from "../_hooks/useNewsletter";
import { Section, Eyebrow, DisplayHeading, Body, Em, reveal, pillCtaClass, PillCtaInner } from "@/components/editorial";
import { cn } from "@/lib/utils";

/** Newsletter capture — same lead insert and honeypot, editorial shell. */
export function BlogNewsletter() {
  const {
    email,
    setEmail,
    isSubmitting,
    isDone,
    honeypot,
    setHoneypot,
    handleNewsletter,
  } = useNewsletter();

  return (
    <Section rule spacing="loose">
      <motion.div {...reveal()} className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-end lg:gap-20">
        <div>
          <Eyebrow className="mb-6">Newsletter</Eyebrow>
          <DisplayHeading className="mb-5">
            Design <Em>decoded.</Em>
          </DisplayHeading>
          <Body className="max-w-sm">
            Monthly design insights, trends and case studies from the studio — sent to 5,000+ industry professionals.
          </Body>
        </div>

        {isDone ? (
          <p className="border-t border-primary/40 pt-8 text-base font-light text-white/70">
            <span className="text-primary">Welcome aboard.</span> Your first edition is on its way.
          </p>
        ) : (
          <form onSubmit={handleNewsletter} className="flex flex-col gap-6 sm:flex-row sm:items-end">
            {/* Honeypot — hidden from real users, catches bots */}
            <div aria-hidden="true" className="absolute left-[-9999px]">
              <label htmlFor="company-website">Company website</label>
              <input
                id="company-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="flex-1">
              <label htmlFor="newsletter-email" className="mb-3 block text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                className="w-full rounded-none border-0 border-b border-white/15 bg-transparent pb-3 text-[15px] font-light text-white placeholder:text-white/25 transition-colors duration-300 focus:border-primary focus:outline-none"
              />
            </div>

            <button type="submit" disabled={isSubmitting} className={cn(pillCtaClass, "shrink-0 disabled:opacity-60")}>
              <PillCtaInner>
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Joining
                  </span>
                ) : (
                  "Subscribe"
                )}
              </PillCtaInner>
            </button>
          </form>
        )}
      </motion.div>
    </Section>
  );
}
