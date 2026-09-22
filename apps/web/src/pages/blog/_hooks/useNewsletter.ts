import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { trackNewsletterSignup } from "@/hooks/useBlogTracking";

export function useNewsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (honeypot) return;
    const lastSubmit = sessionStorage.getItem("newsletter_last_submit");
    if (lastSubmit && Date.now() - Number(lastSubmit) < 30000) return;
    setIsSubmitting(true);
    try {
      sessionStorage.setItem("newsletter_last_submit", String(Date.now()));
      await supabase.from("leads").insert({
        email: email,
        lead_source: "other",
        name: "Newsletter Subscriber",
        message: "Signed up for 'Design Decoded' newsletter.",
      });
      trackNewsletterSignup();
      setIsDone(true);
      setEmail("");
    } catch (error) {
      console.error("Newsletter signup error:", error);
    }
    setIsSubmitting(false);
  };

  return {
    email,
    setEmail,
    isSubmitting,
    isDone,
    honeypot,
    setHoneypot,
    handleNewsletter,
  };
}
