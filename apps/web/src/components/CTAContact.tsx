import { Phone, MessageCircle, ArrowRight, MapPin, Mail, Clock, Calculator, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import useScrollReveal from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import gsap from "gsap";
import { Image } from "@/components/ui/image";

const reassurancePoints = [
  "Free first consultation",
  "Clear budget direction",
  "Design and execution support",
];

const nextSteps = [
  {
    step: "01",
    title: "Tell us what you are planning",
    body: "Share your space, timeline, and what kind of support you need.",
  },
  {
    step: "02",
    title: "We review and respond",
    body: "Our team comes back with guidance, fit, and the clearest next move.",
  },
  {
    step: "03",
    title: "Move into consultation",
    body: "If it feels right, we shape the brief, estimate, and project direction together.",
  },
];

const AnimatedField = ({ 
  id, 
  label, 
  error, 
  touched, 
  children,
  onFocus,
  onBlur
}: { 
  id: string; 
  label: string; 
  error?: string; 
  touched?: boolean; 
  children: React.ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
}) => {
  const lineRef = useRef<HTMLDivElement>(null);

  const handleFocus = () => {
    gsap.to(lineRef.current, { scaleX: 1, duration: 0.8, ease: "expo.out", transformOrigin: "left center" });
    if (onFocus) onFocus();
  };

  const handleBlurWrapper = () => {
    gsap.to(lineRef.current, { scaleX: 0, duration: 0.5, ease: "power2.inOut", transformOrigin: "right center" });
    if (onBlur) onBlur();
  };

  return (
    <div className="group relative mb-8">
      <label 
        htmlFor={id} 
        className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--site-text-meta)] transition-colors group-focus-within:text-[#d1af6e]"
      >
        {label}
      </label>
      <div className="relative" onFocus={handleFocus} onBlur={handleBlurWrapper}>
        {children}
        {/* Base Structural Line */}
        <div className="absolute bottom-0 left-0 h-[1px] w-full bg-white/10" />
        {/* Animated Drafting Line */}
        <div 
          ref={lineRef} 
          className="absolute bottom-0 left-0 h-[1.5px] w-full bg-[#d1af6e] scale-x-0" 
        />
      </div>
      {touched && error && (
        <p id={`${id}-error`} className="absolute -bottom-5 left-0 text-[10px] uppercase tracking-wide text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
};

const CTAContact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const containerRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { settings } = useSiteSettings();

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Us",
      details: settings?.address ? [settings.address] : ["Jamshedpur, Jharkhand", "Kolkata, West Bengal"],
    },
    {
      icon: Phone,
      title: "Call Us",
      details: settings?.phone ? [settings.phone] : ["+91 7909041132"],
    },
    {
      icon: Mail,
      title: "Email Us",
      details: settings?.email ? [settings.email] : ["hello@crossangleinterior.com"],
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: ["Mon - Sat: 9AM - 7PM"],
    },
  ];

  useScrollReveal(containerRef, ".reveal-elem", { y: 30, stagger: 0.08 });

  // Parallax background effect
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        y: "20%",
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "firstName":
        if (!value.trim()) return "First name is required";
        break;
      case "lastName":
        if (!value.trim()) return "Last name is required";
        break;
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email";
        break;
      case "phone":
        if (!value.trim()) return "Phone number is required";
        if (!/^\+?[\d\s-]{10,}$/.test(value)) return "Please enter a valid phone number";
        break;
      case "message":
        if (!value.trim()) return "Please tell us about your project";
        if (value.trim().length < 10) return "Please provide more details (at least 10 characters)";
        break;
    }
    return "";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const target = e.target as HTMLFormElement;
    const firstName = (target.elements.namedItem("firstName") as HTMLInputElement).value;
    const lastName = (target.elements.namedItem("lastName") as HTMLInputElement).value;
    const email = (target.elements.namedItem("email") as HTMLInputElement).value;
    const phone = (target.elements.namedItem("phone") as HTMLInputElement).value;
    const message = (target.elements.namedItem("message") as HTMLTextAreaElement).value;

    const fields = ["firstName", "lastName", "email", "phone", "message"];
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    fields.forEach((field) => {
      let value = "";
      switch (field) {
        case "firstName": value = firstName; break;
        case "lastName": value = lastName; break;
        case "email": value = email; break;
        case "phone": value = phone; break;
        case "message": value = message; break;
      }
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    setTouched({ firstName: true, lastName: true, email: true, phone: true, message: true });
    setErrors(newErrors);

    if (hasErrors) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        message,
        lead_source: "website_contact",
        source_url: window.location.href,
      };

      const { error, data } = await supabase.functions.invoke("process-lead", {
        body: payload,
      });

      if (error || (data && !data.success)) {
        throw new Error(error?.message || data?.error || "Failed to process lead");
      }

      setSubmitStatus('success');
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });
      target.reset();
      setTouched({});
      setErrors({});
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus('error');
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Shared input classes for the blank/big form look
  const inputClasses = "w-full bg-transparent border-none px-0 py-3 text-2xl md:text-3xl font-serif text-[var(--site-text)] placeholder:text-white/20 focus:outline-none focus:ring-0 rounded-none shadow-none";

  return (
    <section id="contact" ref={containerRef} className="relative overflow-hidden px-4 py-24 md:py-32">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0 bg-[#050505]">
        <Image
          ref={bgRef}
          src="/reality_render.jpg" 
          alt="Luxury Interior Render" 
          className="pointer-events-none absolute -top-[15%] left-0 h-[130%] w-full"
          imageClassName="opacity-[0.25] saturate-50 select-none pointer-events-none"
          width={1800}
          height={1200}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/70 to-[#050505]" />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl">
        <div className="reveal-elem mx-auto mb-16 max-w-3xl text-center md:mb-24">
          <div className="home-kicker inline-flex w-fit mx-auto mb-6 items-center justify-center bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/5">Start Here</div>
          <h2 className="home-title text-center text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.1]">
            One conversation.
            <br className="max-md:hidden" />
            <span className="home-title-accent"> A clearer next step.</span>
          </h2>
          <p className="home-body mx-auto mt-6 max-w-xl text-base md:text-lg text-white/70">
            Use the form if you want a tailored architecture response, or choose a 
            quicker path if you already know how you would like to connect.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {reassurancePoints.map((point) => (
              <span key={point} className="contact-chip bg-black/40 backdrop-blur-md border-white/5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d1af6e] animate-pulse" />
                {point}
              </span>
            ))}
          </div>
        </div>

        {/* Unified System Container */}
        <div className="relative">
          {/* Glassmorphism Background Split */}
          <div className="absolute inset-0 -mx-4 md:-mx-12 -my-8 md:-my-12 rounded-[48px] bg-[radial-gradient(ellipse_at_center,rgba(209,175,110,0.03)_0%,transparent_70%)] pointer-events-none z-0" />
          
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-10 xl:gap-12 relative z-10">
          <div className="reveal-elem order-1 lg:order-1">
            <div className="rounded-[32px] border border-white/[0.06] bg-[#0A0A0A]/60 backdrop-blur-2xl p-8 shadow-[0_40px_100px_rgba(0,0,0,0.6)] md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#d1af6e]/5 blur-[120px] rounded-full pointer-events-none" />
              
              <div className="mb-10 flex flex-wrap items-center justify-between gap-3">
                <span className="home-kicker">Project Brief</span>
                <span className="rounded-full border border-[#d1af6e]/30 bg-[#d1af6e]/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-[#d1af6e]">
                  Intake Form
                </span>
              </div>
              
              <form onSubmit={handleSubmit} className="relative z-10 w-full space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 md:gap-x-8">
                  <AnimatedField 
                    id="firstName" 
                    label="First Name" 
                    error={errors.firstName} 
                    touched={touched.firstName}
                  >
                    <input
                      id="firstName"
                      name="firstName"
                      autoComplete="given-name"
                      placeholder="John"
                      required
                      onBlur={handleBlur}
                      onChange={handleInputChange}
                      aria-invalid={touched.firstName && !!errors.firstName}
                      className={inputClasses}
                    />
                  </AnimatedField>

                  <AnimatedField 
                    id="lastName" 
                    label="Last Name" 
                    error={errors.lastName} 
                    touched={touched.lastName}
                  >
                    <input
                      id="lastName"
                      name="lastName"
                      autoComplete="family-name"
                      placeholder="Doe"
                      required
                      onBlur={handleBlur}
                      onChange={handleInputChange}
                      aria-invalid={touched.lastName && !!errors.lastName}
                      className={inputClasses}
                    />
                  </AnimatedField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 md:gap-x-8">
                  <AnimatedField 
                    id="email" 
                    label="Email Address" 
                    error={errors.email} 
                    touched={touched.email}
                  >
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="john@example.com"
                      required
                      onBlur={handleBlur}
                      onChange={handleInputChange}
                      aria-invalid={touched.email && !!errors.email}
                      className={inputClasses}
                    />
                  </AnimatedField>

                  <AnimatedField 
                    id="phone" 
                    label="Phone Number" 
                    error={errors.phone} 
                    touched={touched.phone}
                  >
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+91 98765 43210"
                      required
                      onBlur={handleBlur}
                      onChange={handleInputChange}
                      aria-invalid={touched.phone && !!errors.phone}
                      className={inputClasses}
                    />
                  </AnimatedField>
                </div>

                <AnimatedField 
                  id="message" 
                  label="Tell Us About Your Project" 
                  error={errors.message} 
                  touched={touched.message}
                >
                  <textarea
                    id="message"
                    name="message"
                    placeholder="E.g., I'm looking to renovate a 3BHK high-end apartment in Kolkata. We need full design and execution within the next 4 months..."
                    rows={3}
                    required
                    onBlur={handleBlur}
                    onChange={handleInputChange}
                    aria-invalid={touched.message && !!errors.message}
                    className={`${inputClasses} resize-y min-h-[140px] text-lg md:text-xl leading-relaxed pb-6 placeholder:text-white/10`}
                  />
                </AnimatedField>

                <div className="pt-6">
                  {submitStatus === 'success' && (
                    <div className="mb-6 flex items-center justify-center gap-3 rounded-[16px] border border-green-500/20 bg-green-500/10 px-4 py-4">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-green-400">Project details captured. We'll be in touch shortly.</span>
                    </div>
                  )}
                  {submitStatus === 'error' && (
                    <div className="mb-6 flex items-center justify-center gap-3 rounded-[16px] border border-red-500/20 bg-red-500/10 px-4 py-4">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-sm font-medium text-red-400">Signal failed. Please try again or use direct contact.</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row items-center gap-6 justify-between mt-2">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--site-text-meta)] max-w-[200px]">
                      By submitting, you agree to our response time of 24h.
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="home-button-sweep bg-[#d1af6e] text-black hover:bg-[#b89554] group h-14 w-full sm:w-auto px-10 rounded-full text-[0.74rem] font-bold uppercase tracking-[0.24em] shrink-0 border-none relative overflow-hidden"
                      disabled={isSubmitting}
                    >
                      {/* Subtle gloss effect on button */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 ease-in-out" />
                      
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Initiating...</span>
                        </>
                      ) : (
                        <span className="flex items-center gap-3 relative z-10">
                          Submit Inquiry
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="reveal-elem order-2 space-y-8 lg:order-2">
            <div className="home-panel-muted rounded-[32px] p-8 md:p-10 border border-white/[0.04] bg-[#0A0A0A]/40 backdrop-blur-xl">
              <div className="mb-8">
                <div className="home-kicker mb-4 bg-white/5 border border-white/5 inline-flex px-3">Accelerated Route</div>
                <h3 className="font-serif text-2xl font-semibold text-[var(--site-text-heading)]">
                  Bypass the form.
                </h3>
                <p className="mt-3 text-[0.95rem] leading-7 text-white/50">
                  If you already know what you need, call or WhatsApp directly for an immediate dialogue.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  asChild
                  size="lg"
                  className="home-button-sweep bg-white/5 hover:bg-white/10 border border-white/10 h-14 rounded-full text-[0.74rem] font-semibold uppercase tracking-[0.22em] text-white w-full justify-start px-6"
                >
                  <a href={`tel:${settings?.phone || '+917909041132'}`}>
                    <Phone className="h-4 w-4 mr-3" />
                    <span>Call Studio</span>
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="home-button-sweep bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 h-14 rounded-full text-[0.74rem] font-semibold uppercase tracking-[0.22em] text-[#25D366] w-full justify-start px-6"
                >
                  <a
                    href={`https://wa.me/${settings?.whatsapp || '917909041132'}?text=Hi!%20I'm%20interested%20in%20your%20interior%20design%20services.`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4 mr-3" />
                    <span>WhatsApp Connect</span>
                  </a>
                </Button>
                <div className="mt-2 text-center text-[10px] uppercase tracking-[0.15em] text-white/30">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500/80 mr-2 animate-pulse" />
                  Available for immediate chat
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {contactInfo.map((info) => (
                <div key={info.title} className="rounded-[24px] border border-white/[0.04] bg-[#0A0A0A]/40 backdrop-blur-md p-6 flex flex-col justify-between">
                  <div className="mb-4 text-[#d1af6e]/70">
                    <info.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--site-text-meta)]">
                      {info.title}
                    </h4>
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-sm font-medium leading-relaxed text-white/80">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[24px] border border-white/[0.04] bg-gradient-to-br from-[#d1af6e]/5 to-transparent p-6 backdrop-blur-md">
              <Link to="/estimate" className="group flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-serif font-semibold text-white group-hover:text-[#d1af6e] transition-colors">
                    Looking for numbers?
                  </h4>
                  <p className="mt-1 text-xs text-white/50">Access our interactive cost estimator.</p>
                </div>
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:bg-[#d1af6e]/10 group-hover:border-[#d1af6e]/30 transition-all">
                  <Calculator className="h-4 w-4 text-white/70 group-hover:text-[#d1af6e] transition-colors" />
                </div>
              </Link>
            </div>
          </div>
          </div>
        </div>
        
        {/* Architectural Decor Lines */}
        <div className="pointer-events-none absolute -bottom-10 left-10 h-32 w-[1px] bg-gradient-to-t from-transparent to-[#d1af6e]/20" />
        <div className="pointer-events-none absolute bottom-10 -right-10 h-[1px] w-48 bg-gradient-to-l from-transparent to-[#d1af6e]/20" />
      </div>
    </section>
  );
};

export default CTAContact;
