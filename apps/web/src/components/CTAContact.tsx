import { Phone, MessageCircle, ArrowRight, MapPin, Mail, Clock, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { IridescenceGlow } from "./ReactBits";
import useScrollReveal from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Us",
    details: ["Jamshedpur, Jharkhand", "Kolkata, West Bengal"],
  },
  {
    icon: Phone,
    title: "Call Us",
    details: ["+91 7909041132"],
  },
  {
    icon: Mail,
    title: "Email Us",
    details: ["hello@crossangleinterior.com"],
  },
  {
    icon: Clock,
    title: "Working Hours",
    details: ["Mon - Sat: 9AM - 7PM"],
  },
];

const CTAContact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  useScrollReveal(containerRef, ".reveal-elem");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const target = e.target as HTMLFormElement;
    const firstName = (target.elements.namedItem("firstName") as HTMLInputElement).value;
    const lastName = (target.elements.namedItem("lastName") as HTMLInputElement).value;
    const email = (target.elements.namedItem("email") as HTMLInputElement).value;
    const phone = (target.elements.namedItem("phone") as HTMLInputElement).value;
    const message = (target.elements.namedItem("message") as HTMLTextAreaElement).value;

    try {
      const { error } = await supabase.from('leads').insert({
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        message,
        lead_source: 'website_contact',
        source_url: window.location.href
      });

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });
      target.reset();
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

  return (
    <section id="contact" ref={containerRef} className="py-20 md:py-32 relative overflow-hidden bg-site-bg">
      {/* Background with IridescenceGlow */}
      <div className="absolute inset-0 bg-site-bg z-0" />
      <div className="absolute inset-0 z-[1] mix-blend-screen opacity-20">
        <IridescenceGlow
          duration={20}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-site-bg via-transparent to-site-bg z-[2]" />

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-64 h-64 border border-site-crimson/5 rounded-full z-[3]" />
      <div className="absolute bottom-10 right-10 w-48 h-48 border border-site-crimson/5 rounded-full z-[3]" />

      <div className="container mx-auto px-4 relative z-10 reveal-elem">
        {/* CTA Banner — "Ready to build something remarkable?" */}
        <div className="border-t-2 border-site-crimson bg-[#0A0A0A] py-16 md:py-20 px-8 md:px-16 mb-16 md:mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Ready to build<br />something <em>remarkable?</em>
            </h2>
            <div>
              <p className="text-[#A3A09C] text-sm md:text-base leading-relaxed mb-6">
                Tell us about your project. We'll respond within 24 hours with a tailored brief and a clear path forward. No templates, no formulas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="mailto:hello@crossangleinterior.com">
                  <Button size="lg" className="bg-site-crimson hover:bg-[#A30E28] text-white uppercase tracking-[0.18em] text-xs font-bold px-8">
                    <Mail className="mr-2 h-4 w-4" />
                    hello@crossangleinterior.com
                  </Button>
                </a>
                <a href="tel:+917909041132">
                  <Button size="lg" variant="outline" className="border-[rgba(237,234,230,0.1)] hover:border-[rgba(237,234,230,0.35)] text-white uppercase tracking-[0.18em] text-xs font-medium px-8">
                    <Phone className="mr-2 h-4 w-4" />
                    Schedule a Call
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left: CTA + Contact Info */}
          <div className="space-y-8">
            {/* Quick Contact Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="tel:+917909041132"
                className="flex-1"
              >
                <Button
                  size="lg"
                  variant="luxury"
                  className="w-full"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Call Now
                </Button>
              </a>
              <a
                href="https://wa.me/917909041132?text=Hi!%20I'm%20interested%20in%20your%20interior%20design%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full bg-transparent border-site-border text-site-text hover:bg-site-crimson hover:text-white text-sm font-semibold uppercase tracking-widest px-6 py-6 group transition-all duration-300 rounded-none"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp Us
                </Button>
              </a>
            </div>
            <div className="flex">
              <Link to="/calculator" className="flex-1 w-full">
                <Button
                  size="lg"
                  variant="default"
                  className="w-full bg-site-bg-card border border-site-border text-site-crimson hover:bg-site-bg-card-hover text-sm font-semibold uppercase tracking-widest px-6 py-6 group transition-all duration-300 rounded-none shadow-lg shadow-black/20"
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  Cost Estimator
                </Button>
              </Link>
            </div>

            {/* Contact Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="flex gap-4 group p-4 rounded-none bg-site-bg-card border border-site-border hover:border-site-crimson/50 transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-site-crimson/10 rounded-none flex items-center justify-center flex-shrink-0 group-hover:bg-site-crimson transition-all duration-300">
                    <info.icon className="w-5 h-5 text-site-crimson group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-site-text-heading text-sm mb-1 uppercase tracking-widest">
                      {info.title}
                    </h4>
                    {info.details.map((detail, i) => (
                      <p key={i} className="text-site-text-muted text-sm">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp Badge */}
            <div className="text-center sm:text-left text-site-text-meta text-xs uppercase tracking-widest">
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                WhatsApp Available 24/7
              </span>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="bg-site-bg-card backdrop-blur-sm border border-site-border p-6 md:p-8 rounded-none shadow-2xl">
            <h3 className="font-serif text-xl md:text-2xl font-semibold text-site-text-heading mb-6 relative inline-block after:content-[''] after:block after:w-12 after:h-px after:bg-site-crimson after:mt-2">
              Send Us a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-xs font-medium text-site-text-meta uppercase tracking-widest mb-2">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    required
                    className="bg-site-bg-input border-site-border text-site-text placeholder:text-site-text-meta/40 rounded-none focus-visible:ring-site-crimson focus-visible:border-site-crimson"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-xs font-medium text-site-text-meta uppercase tracking-widest mb-2">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    required
                    className="bg-site-bg-input border-site-border text-site-text placeholder:text-site-text-meta/40 rounded-none focus-visible:ring-site-crimson focus-visible:border-site-crimson"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-site-text-meta uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  className="bg-site-bg-input border-site-border text-site-text placeholder:text-site-text-meta/40 rounded-none focus-visible:ring-site-crimson focus-visible:border-site-crimson"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-xs font-medium text-site-text-meta uppercase tracking-widest mb-2">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  required
                  className="bg-site-bg-input border-site-border text-site-text placeholder:text-site-text-meta/40 rounded-none focus-visible:ring-site-crimson focus-visible:border-site-crimson"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-xs font-medium text-site-text-meta uppercase tracking-widest mb-2">
                  Tell Us About Your Project
                </label>
                <Textarea
                  id="message"
                  placeholder="Describe your project, timeline, and any specific requirements..."
                  rows={4}
                  required
                  className="bg-site-bg-input border-site-border text-site-text placeholder:text-site-text-meta/40 rounded-none focus-visible:ring-site-crimson focus-visible:border-site-crimson resize-none"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                variant="luxury"
                className="w-full py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTAContact;
