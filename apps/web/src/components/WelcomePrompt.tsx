import { useState, useEffect } from "react";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const WelcomePrompt = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has already seen/dismissed the prompt
    const hasSeenPrompt = localStorage.getItem("welcomePromptSeen");
    if (!hasSeenPrompt) {
      // Show prompt after 5 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("welcomePromptSeen", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('leads').insert({
        email,
        phone,
        lead_source: 'welcome_popup',
        source_url: window.location.href
      });

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: "We'll be in touch soon with exclusive design insights.",
      });

      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
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
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-serif text-xl md:text-2xl font-bold text-foreground mb-2">
                Welcome to Crossangle Interior
              </h3>
              <p className="text-muted-foreground text-sm">
                Get exclusive design tips and a free consultation. Share your contact and we'll reach out!
              </p>
            </div>

            {/* Form */}
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

            {/* Footer */}
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
