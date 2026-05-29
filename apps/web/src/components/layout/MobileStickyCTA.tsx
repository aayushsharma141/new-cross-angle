import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Calculator } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { SITE_CONSTANTS } from "@/lib/constants";
import { useAnalytics } from "@/analytics/AnalyticsProvider";
import { track } from "@/analytics/track";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useCookieConsent } from "@/components/cookies/CookieConsentProvider";

/** Official WhatsApp brand SVG mark (Green Bubble) */
const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.032 2C6.523 2 2.048 6.475 2.048 11.984c0 2.118.662 4.079 1.792 5.696L2 22l4.512-1.456a9.92 9.92 0 0 0 5.52 1.632h.016c5.492 0 9.984-4.475 9.984-9.984 0-5.509-4.492-9.984-9.984-9.984h-.016zm5.184 14.128c-.288.8-1.424 1.488-1.952 1.584-.528.08-1.2.144-1.92-.08-.432-.144-1.12-.384-2.112-.8-4.224-1.744-6.944-6.032-7.152-6.32-.208-.288-1.68-2.224-1.68-4.24 0-2.016 1.056-3.008 1.424-3.424.368-.416.816-.512 1.088-.512.272 0 .544 0 .784.016.24.016.448-.064.688.528.24.592.832 2.016.896 2.16.064.144.112.304.016.496-.096.192-.144.304-.288.48-.144.176-.32.384-.448.512-.16.176-.32.368-.144.672.176.304.784 1.296 1.68 2.096.944.832 1.728 1.088 2.032 1.216.304.128.48.112.656-.08.176-.192.768-.896.976-1.2.208-.304.416-.256.688-.144.272.112 1.744.816 2.048.976.304.16.512.24.592.368.08.128.08.736-.208 1.536z"
      fill="currentColor"
    />
  </svg>
);

const MobileStickyCTA: React.FC = () => {
  const { settings } = useSiteSettings();
  const analytics = useAnalytics();
  const { hasChoice } = useCookieConsent();
  const whatsappNumber = settings?.whatsapp || SITE_CONSTANTS.defaultWhatsApp;

  // ─── Hide-on-scroll logic ───────────────────────────────────────────────────
  const [visible, setVisible] = useState(true);
  const { scrollY } = useScroll();

  const scrollTimeout = useRef<NodeJS.Timeout>();

  useMotionValueEvent(scrollY, "change", (currentY) => {
    const prevY = scrollY.getPrevious();
    if (prevY === undefined) return;
    const direction = currentY - prevY;

    // Show at top
    if (currentY < 50) {
      setVisible(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      return;
    }

    // Hide while actively scrolling down
    if (direction > 5 && currentY > 150) {
      setVisible(false);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    } 
    // Show when scrolling up (even slightly)
    else if (direction < -2) {
      setVisible(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    }

    // Show on pause (800ms timeout)
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      setVisible(true);
    }, 800);
  });

  // ───────────────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {visible && hasChoice && (
        <motion.div
          key="mobile-cta-bar"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="md:hidden fixed bottom-8 left-4 right-4 z-[100] flex items-center justify-between gap-2 p-1.5 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.7)]"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
          role="complementary"
          aria-label="Quick contact and estimate bar"
        >
          {/* ── WhatsApp Pill ─────────────────────────────────────────── */}
          <motion.a
            href={`https://wa.me/${whatsappNumber}?text=Hi!%20I'm%20interested%20in%20your%20services.`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            onClick={() => track(analytics, "cta_clicked", { ctaId: "mobile_sticky_whatsapp", destination: "whatsapp" })}
            whileTap={{ scale: 0.95 }}
            className="flex-1 flex items-center justify-center gap-2 rounded-full
              bg-[#25D366] hover:bg-[#20bd5a]
              text-white font-bold text-[13px] tracking-wide select-none transition-colors"
            style={{ height: "48px" }}
          >
            <WhatsAppIcon size={22} />
            <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">WhatsApp</span>
          </motion.a>

          {/* ── Get Estimate Pill ─────────────────────────────────────── */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="flex-1"
          >
            <Link
              to="/contact-us"
              aria-label="Go to contact us page for an estimate"
              onClick={() => track(analytics, "cta_clicked", { ctaId: "mobile_sticky_contact", destination: "/contact-us" })}
              className="flex items-center justify-center gap-2 w-full rounded-full
                bg-site-crimson hover:bg-site-crimson/90
                text-white font-bold text-[13px] tracking-wide select-none transition-colors"
              style={{ height: "48px" }}
            >
              <Calculator className="w-[18px] h-[18px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" strokeWidth={2.5} />
              <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">Get Estimate</span>
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


export default MobileStickyCTA;

