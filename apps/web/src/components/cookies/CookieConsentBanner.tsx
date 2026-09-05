import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Cookie, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useCookieConsent } from "./CookieConsentProvider";

// ─── Custom Toggle Switch ────────────────────────────────────────────────────
const ToggleSwitch = ({
  id,
  checked,
  onChange,
  disabled = false,
}: {
  id: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={id}
    disabled={disabled}
    onClick={() => !disabled && onChange?.(!checked)}
    className={[
      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d1af6e]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
      disabled
        ? "cursor-not-allowed opacity-70"
        : "cursor-pointer",
      checked
        ? "bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.4)]"
        : "bg-white/[0.12]",
    ].join(" ")}
  >
    <span
      className={[
        "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-300",
        checked ? "translate-x-6" : "translate-x-1",
      ].join(" ")}
    />
  </button>
);

// ─── Category Row ────────────────────────────────────────────────────────────
const CategoryRow = ({
  title,
  description,
  checked,
  onChange,
  locked = false,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
  locked?: boolean;
}) => (
  <div className="flex items-start justify-between gap-3 py-3 border-b border-white/[0.06] last:border-b-0">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5">
        <p className="text-[13px] font-medium text-white/90">{title}</p>
        {locked && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#d1af6e]/10 border border-[#d1af6e]/20 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-[#d1af6e] font-medium">
            <Lock className="h-2.5 w-2.5" />
            Always On
          </span>
        )}
      </div>
      <p className="text-[11px] leading-5 text-white/40 pr-2">{description}</p>
    </div>
    <ToggleSwitch
      id={title}
      checked={locked || checked}
      onChange={onChange}
      disabled={locked}
    />
  </div>
);

// ─── Main Banner ─────────────────────────────────────────────────────────────
export const CookieConsentBanner = () => {
  const { hasChoice, acceptAll, acceptStrictOnly } = useCookieConsent();
  const [isExpanded, setIsExpanded] = useState(false);

  // Individual toggle states (local only — mapped to all/strict on save)
  const [analytics, setAnalytics] = useState(false);
  const [functional, setFunctional] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const handleSavePreferences = () => {
    if (analytics || functional || marketing) {
      acceptAll();
    } else {
      acceptStrictOnly();
    }
  };

  const handleAcceptAll = () => {
    setAnalytics(true);
    setFunctional(true);
    setMarketing(true);
    acceptAll();
  };

  const handleStrictOnly = () => {
    setAnalytics(false);
    setFunctional(false);
    setMarketing(false);
    acceptStrictOnly();
  };

  return (
    <AnimatePresence>
      {!hasChoice && (
        <motion.div
          key="cookie-pod"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          layout
          className={[
            // Mobile: full-width bottom sheet
            "fixed bottom-0 left-0 right-0 z-[120]",
            // Desktop: compact bottom-left floating pod
            "sm:bottom-5 sm:left-5 sm:right-auto sm:w-[340px]",
          ].join(" ")}
          aria-live="polite"
          role="dialog"
          aria-label="Cookie consent preferences"
        >
          {/* Outer card */}
          <motion.div
            layout
            className={[
              "relative overflow-hidden",
              // Mobile corners
              "rounded-t-2xl rounded-b-none border border-b-0 border-white/[0.08]",
              // Desktop corners
              "sm:rounded-2xl sm:border-b sm:border-white/[0.08]",
              "bg-[#0c0c0c]/95 backdrop-blur-xl",
              "shadow-[0_-8px_40px_rgba(0,0,0,0.5)] sm:shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]",
            ].join(" ")}
          >
            {/* Crimson aura – bottom-left */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at bottom left, rgba(212,175,55,0.14) 0%, transparent 55%)",
              }}
            />

            {/* Gold top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#d1af6e]/40 to-transparent" />

            {/* ── COMPACT STATE ── */}
            <AnimatePresence mode="wait" initial={false}>
              {!isExpanded ? (
                <motion.div
                  key="compact"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="relative flex flex-col gap-4 p-5"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/20">
                      <Cookie className="h-4 w-4 text-[#D4AF37]" />
                    </div>
                    <div>
                      <div className="mb-0.5 flex items-center gap-2">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-[#d1af6e] font-medium">
                          Privacy Controls
                        </p>
                      </div>
                      <p className="text-[13px] leading-5 text-white/55">
                        We use cookies to keep the site fast and to understand how it's used.{" "}
                        <a
                          href="/privacy"
                          className="text-white/70 underline underline-offset-2 hover:text-[#d1af6e] transition-colors duration-200"
                        >
                          Privacy Policy
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleAcceptAll}
                      className="flex h-10 w-full items-center justify-center rounded-xl bg-[#D4AF37] text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_6px_20px_rgba(212,175,55,0.35)] transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                    >
                      Accept All
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsExpanded(true)}
                        className="flex h-9 flex-1 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.03] text-[10px] uppercase tracking-[0.18em] text-white/55 transition-all duration-200 hover:border-[#d1af6e]/30 hover:text-white/80 hover:bg-white/[0.05]"
                      >
                        Manage
                      </button>
                      <button
                        type="button"
                        onClick={handleStrictOnly}
                        className="flex h-9 flex-1 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.03] text-[10px] uppercase tracking-[0.18em] text-white/55 transition-all duration-200 hover:border-white/20 hover:text-white/80 hover:bg-white/[0.05]"
                      >
                        Strict Only
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* ── EXPANDED PREFERENCES STATE ── */
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="relative flex flex-col gap-0 p-5"
                >
                  {/* Expanded header */}
                  <div className="mb-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsExpanded(false)}
                      className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/40 transition-colors hover:text-white/70"
                      aria-label="Back to cookie banner"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Back
                    </button>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#d1af6e]" />
                      <span className="text-[11px] uppercase tracking-[0.18em] text-[#d1af6e]">
                        Cookie Settings
                      </span>
                    </div>
                  </div>

                  {/* Category toggles */}
                  <div className="mb-4">
                    <CategoryRow
                      title="Strictly Necessary"
                      description="Core site functions: routing, security, lead capture, and session integrity."
                      checked={true}
                      locked={true}
                    />
                    <CategoryRow
                      title="Analytics & Performance"
                      description="Google Analytics — helps us understand traffic and improve pages."
                      checked={analytics}
                      onChange={setAnalytics}
                    />
                    <CategoryRow
                      title="Functional Preferences"
                      description="Saves your quiz history, daylight settings, and design preferences."
                      checked={functional}
                      onChange={setFunctional}
                    />
                    <CategoryRow
                      title="Targeting & Marketing"
                      description="Used for future ad re-targeting and promotional campaigns."
                      checked={marketing}
                      onChange={setMarketing}
                    />
                  </div>

                  {/* Expanded CTAs */}
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleSavePreferences}
                      className="flex h-10 w-full items-center justify-center rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-all duration-200 hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/70 active:scale-[0.98]"
                    >
                      Save Preferences
                    </button>
                    <button
                      type="button"
                      onClick={handleAcceptAll}
                      className="flex h-10 w-full items-center justify-center rounded-xl bg-[#D4AF37] text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_6px_20px_rgba(212,175,55,0.35)] transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                    >
                      Accept All
                    </button>
                  </div>

                  {/* Legal micro-line */}
                  <p className="mt-3 text-center text-[10px] leading-4 text-white/25">
                    By continuing you agree to our{" "}
                    <a href="/privacy" className="text-white/40 underline underline-offset-2 hover:text-[#d1af6e] transition-colors">
                      Privacy Policy
                    </a>{" "}
                    &amp;{" "}
                    <a href="/terms" className="text-white/40 underline underline-offset-2 hover:text-[#d1af6e] transition-colors">
                      Terms
                    </a>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
