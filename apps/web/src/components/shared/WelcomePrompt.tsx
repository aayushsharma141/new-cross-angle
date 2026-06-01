import { useState, useEffect, useRef, useCallback } from "react";
import { X, ArrowRight, Compass, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { leadService } from "@/services/LeadService";

const WelcomePrompt = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [contact, setContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem("welcomePromptSeen", "true");
    previousFocusRef.current?.focus();
  }, []);

  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem("welcomePromptSeen");
    if (hasSeenPrompt) return;

    let triggered = false;

    const triggerPrompt = () => {
      if (!triggered) {
        triggered = true;
        previousFocusRef.current = document.activeElement as HTMLElement;
        setIsOpen(true);
        window.removeEventListener("scroll", handleScroll);
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
    };

    const handleScroll = () => {
      const scrollPercentage = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPercentage >= 0.5) triggerPrompt();
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger prompt if mouse leaves the top of the screen (exit-intent)
      if (e.clientY < 20) {
        triggerPrompt();
      }
    };

    // 20s fallback timer
    const timer = setTimeout(triggerPrompt, 20000);
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Focus trap + Escape key
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>("input, button, [tabindex]")?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"]), a[href]'
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = contact.trim();
    if (!value) return;

    // Detect input type
    const isEmail = value.includes("@");
    const isPhone = /^[+]?[0-9\s-]{8,15}$/.test(value.replace(/\s+/g, ""));

    if (!isEmail && !isPhone) {
      toast({
        title: "Check details",
        description: "Please enter a valid email address or phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await leadService.submitLead({
        name: "Welcome Popup Lead",
        email: isEmail ? value : "",
        phone: isPhone ? value : "",
        lead_source: "welcome_popup",
        source_url: window.location.href,
        source: "Welcome-Popup",
        form_data: {
          contact: value,
          type: isEmail ? "email" : "phone",
          submittedAt: new Date().toISOString(),
        },
      });

      toast({
        title: "Thank you!",
        description: "We'll be in touch soon with exclusive design insights.",
      });

      handleClose();
    } catch (error) {
      const err = error as { message?: string };
      console.error("Error submitting form:", error, JSON.stringify(error));
      toast({
        title: "Something went wrong",
        description: err?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-dialog-title"
      ref={dialogRef}
    >
      {/* Immersive backdrop */}
      <div
        className="absolute inset-0 bg-[#040404]/75 backdrop-blur-md transition-all duration-300 animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Pod */}
      <div
        className={cn(
          "relative w-full max-w-[420px] overflow-hidden rounded-2xl bg-[#0c0c0c]/95 border border-white/[0.08] p-6 md:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.6)] backdrop-blur-xl pointer-events-auto",
          "animate-scale-in"
        )}
      >
        {/* Crimson aura - bottom-left */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at bottom left, rgba(196,18,48,0.15) 0%, transparent 60%)",
          }}
        />

        {/* Gold top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#d1af6e]/40 to-transparent" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full border border-white/5 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.06] text-white/40 hover:text-white transition-all duration-200"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="relative flex flex-col gap-5 text-center mt-2">
          {/* Emblem & Tag */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#C41230]/10 border border-[#C41230]/20 p-2.5 shadow-[0_0_20px_rgba(196,18,48,0.15)]">
              <Compass className="h-full w-full text-[#C41230]" />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#d1af6e]/20 bg-[#d1af6e]/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#d1af6e] font-medium">
              <ShieldCheck className="h-3 w-3" />
              Private Invitation
            </div>
          </div>

          <div>
            <h2
              id="welcome-dialog-title"
              className="font-serif text-2xl font-bold tracking-wide text-white mb-2"
            >
              Begin Your Design Journey
            </h2>
            <p className="text-white/55 text-[13px] leading-6 px-1">
              Transform your space with a custom interior blueprint. Share your contact below to receive a complimentary elite consultation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left mt-1">
            {/* Unified Contact Field */}
            <div>
              <label
                htmlFor="promptContact"
                className="block text-[10px] uppercase tracking-[0.18em] text-white/50 font-medium mb-1.5"
              >
                Email Address or Phone Number
              </label>
              <Input
                id="promptContact"
                type="text"
                placeholder="E.g. rahul@example.com or +91 98765 43210"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
                className="h-11 rounded-xl bg-white/[0.02] border-white/10 text-white placeholder:text-white/25 focus:border-[#d1af6e]/50 focus:ring-1 focus:ring-[#d1af6e]/50 text-sm font-sans"
              />
            </div>

            {/* Premium Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-gradient-to-r from-[#B61826] to-[#7A0E19] text-white tracking-[0.18em] uppercase text-[10px] font-semibold rounded-xl shadow-[0_6px_20px_rgba(196,18,48,0.35)] hover:brightness-110 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? "Initiating..." : "Request Consultation"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </form>

          {/* Privacy Note */}
          <p className="text-center text-[10px] leading-4 text-white/30 px-2 mt-1">
            Your personal information is secure and processed in strict compliance with{" "}
            <a
              href="/privacy"
              className="text-white/50 underline underline-offset-2 hover:text-[#d1af6e] transition-colors"
            >
              DPDPA 2023
            </a>{" "}
            privacy guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePrompt;
