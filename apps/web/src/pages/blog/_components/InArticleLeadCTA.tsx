/**
 * InArticleLeadCTA.tsx — Sticky right sidebar estimator CTA card.
 * Appears after 25% scroll, dismissible per session.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calculator } from "lucide-react";
import { trackCtaClick } from "@/hooks/useBlogTracking";

interface Props {
  postId?: string;
}

const InArticleLeadCTA = ({ postId }: Props) => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const handler = () => {
      const scrollY = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      if (docH <= 0) return;
      const pct = scrollY / docH;
      const hideThreshold = Math.max(docH - 1500, docH * 0.75);
      setVisible(pct > 0.25 && scrollY < hideThreshold);
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div className={`w-full transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
      <div
        className="rounded-2xl p-5 border shadow-[0_16px_48px_rgba(0,0,0,0.6)] relative"
        style={{ background: "#111", borderColor: "#222" }}
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-3 text-white/20 hover:text-white/60 text-xs transition-colors"
          aria-label="Dismiss"
        >
          ✕
        </button>
        <div className="flex items-center gap-2.5 mb-3">
          <Calculator className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Free Tool</span>
        </div>
        <p className="text-[14px] font-serif font-bold text-white mb-1.5">Calculate Your Interior Budget</p>
        <p className="text-[12px] text-white/40 mb-4 leading-relaxed">
          Get an instant cost estimate for your turnkey interior project — no signup needed.
        </p>
        <Link
          to="/estimate"
          onClick={() => trackCtaClick(postId || "", "in_article_estimator")}
          className="block w-full text-center py-2.5 rounded-full text-[12px] font-semibold transition-all duration-200 hover:opacity-90 bg-primary text-white"
        >
          Get Free Estimate →
        </Link>
      </div>
    </div>
  );
};

export default InArticleLeadCTA;
