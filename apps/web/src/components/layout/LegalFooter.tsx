import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

/**
 * LegalFooter — Minimal footer for Privacy & Terms pages.
 * No nav columns, no social links, no CTA — just copyright + legal links.
 */
const LegalFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] bg-[#080808]">
      <div className="container mx-auto px-6 max-w-4xl py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Brand mark */}
          <div className="flex items-center gap-2 text-white/40">
            <Shield className="h-3.5 w-3.5 text-[#C41230]/60" />
            <span className="text-xs">
              © {year} <span className="text-white/60 font-medium">Crossangle Interior</span>. All rights reserved.
            </span>
          </div>

          {/* Legal links */}
          <nav className="flex items-center gap-5 text-xs text-white/35" aria-label="Legal navigation">
            <Link to="/privacy" className="hover:text-white/70 transition-colors">Privacy Policy</Link>
            <span className="text-white/15">·</span>
            <Link to="/terms" className="hover:text-white/70 transition-colors">Terms & Conditions</Link>
            <span className="text-white/15">·</span>
            <Link to="/contact-us" className="hover:text-white/70 transition-colors">Contact</Link>
          </nav>

        </div>
      </div>
    </footer>
  );
};

export default LegalFooter;
