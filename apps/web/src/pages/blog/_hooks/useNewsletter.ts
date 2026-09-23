import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { trackNewsletterSignup } from "@/hooks/useBlogTracking";

export function useNewsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (honeypot) return;
    const lastSubmit = sessionStorage.getItem("newsletter_last_submit");
    if (lastSubmit && Date.now() - Number(lastSubmit) < 30000) return;
    setIsSubmitting(true);
    setError(null);
    try {
      // supabase-js reports failures (e.g. an RLS rejection) in the result
      // rather than throwing, so check it before treating the signup as done.
      const { error: insertError } = await supabase.from("leads").insert({
        email: email,
        lead_source: "other",
        name: "Newsletter Subscriber",
        message: "Signed up for 'Design Decoded' newsletter.",
      });
      if (insertError) throw insertError;
      // Throttle only successful signups, so a failed attempt can be retried.
      sessionStorage.setItem("newsletter_last_submit", String(Date.now()));
      trackNewsletterSignup();
      setIsDone(true);
      setEmail("");
    } catch (err) {
      console.error("Newsletter signup error:", err);
      setError("We couldn't sign you up just now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    setEmail,
    isSubmitting,
    isDone,
    error,
    honeypot,
    setHoneypot,
    handleNewsletter,
  };
}
