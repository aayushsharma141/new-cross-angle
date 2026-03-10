import { Phone, MessageCircle, ArrowRight, MapPin, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { IridescenceGlow } from "./ReactBits";
import useScrollReveal from "@/hooks/useScrollReveal";

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
    <section id="contact" ref={containerRef} className="py-20 md:py-32 relative overflow-hidden">
      {/* Background with IridescenceGlow */}
      <div className="absolute inset-0 bg-background z-0" />
      <div className="absolute inset-0 z-[1] mix-blend-screen opacity-20">
        <IridescenceGlow
          color={[180, 100, 80]} // Wine accent color
          speed={0.8}
          amplitude={0.05}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-[2]" />

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-64 h-64 border border-primary/10 rounded-full z-[3]" />
      <div className="absolute bottom-10 right-10 w-48 h-48 border border-primary/10 rounded-full z-[3]" />

      <div className="container mx-auto px-4 relative z-10 reveal-elem">

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
                  className="w-full text-base md:text-lg px-6 py-5 md:py-6 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 group"
                >
                  <Phone className="mr-2 h-5 w-5" />
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
                  className="w-full bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary text-base md:text-lg px-6 py-5 md:py-6 group transition-all duration-300"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp Us
                </Button>
              </a>
            </div>

            {/* Contact Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="flex gap-4 group p-4 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-all duration-300">
                    <info.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary-foreground text-sm mb-1">
                      {info.title}
                    </h4>
                    {info.details.map((detail, i) => (
                      <p key={i} className="text-primary-foreground/60 text-sm">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp Badge */}
            <div className="text-center sm:text-left text-primary-foreground/50 text-sm">
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                WhatsApp Available 24/7
              </span>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 p-6 md:p-8 rounded-2xl">
            <h3 className="font-serif text-xl md:text-2xl font-semibold text-primary-foreground mb-6">
              Send Us a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-primary-foreground mb-2">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    required
                    className="bg-primary-foreground/5 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-primary-foreground mb-2">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    required
                    className="bg-primary-foreground/5 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary-foreground mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  className="bg-primary-foreground/5 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-primary-foreground mb-2">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  required
                  className="bg-primary-foreground/5 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-primary-foreground mb-2">
                  Tell Us About Your Project
                </label>
                <Textarea
                  id="message"
                  placeholder="Describe your project, timeline, and any specific requirements..."
                  rows={4}
                  required
                  className="bg-primary-foreground/5 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 resize-none"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full group"
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
