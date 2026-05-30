import { useState, useEffect, useRef, useCallback } from "react";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { leadService } from "@/services/LeadService";
import logoIcon from "@/assets/logo-icon.png";

const WelcomePrompt = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
      }
    };

    const handleScroll = () => {
      const scrollPercentage = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPercentage >= 0.5) triggerPrompt();
    };

    const timer = setTimeout(triggerPrompt, 20000);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Focus trap + Escape key
  useEffect(() => {
    if (!isOpen) return;

    // Focus the dialog on open
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
    setIsSubmitting(true);

    try {
      await leadService.submitLead({
        name: "Welcome Popup Lead",
        email,
        phone,
        lead_source: 'welcome_popup',
        source_url: window.location.href,
        source: 'Welcome-Popup',
        form_data: { email, phone, submittedAt: new Date().toISOString() }
      });

      toast({
        title: "Thank you!",
        description: "We'll be in touch soon with exclusive design insights.",
      });

      handleClose();
    } catch (error) {
      const err = error as { message?: string };
      console.error('Error submitting form:', error, JSON.stringify(error));
      toast({
        title: "Something went wrong",
        description: err?.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-labelledby="welcome-dialog-title" ref={dialogRef}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={cn(
            "relative w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl pointer-events-auto",
            "animate-scale-in"
          )}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Content */}
          <div className="p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="flex justify-center">
                <img src={logoIcon} alt="" className="w-28 h-28" aria-hidden="true" />
              </div>
              <h2 id="welcome-dialog-title" className="font-serif text-xl md:text-2xl font-bold text-foreground mb-2">
                Welcome to Crossangle Interior
              </h2>
              <p className="text-muted-foreground text-sm">
                Get exclusive design tips and a free consultation. Share your contact and we'll reach out!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="promptEmail" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <Input
                  id="promptEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-muted/50"
                />
              </div>
              <div>
                <label htmlFor="promptPhone" className="block text-sm font-medium text-foreground mb-2">
                  Phone Number
                </label>
                <Input
                  id="promptPhone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="bg-muted/50"
                />
              </div>
              <Button
                type="submit"
                className="w-full group"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Get Free Consultation"}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-4">
              We respect your privacy. No spam, ever.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePrompt;
