import { Phone, MessageCircle, ArrowRight, MapPin, Mail, Clock, Calculator, Loader2, CheckCircle, XCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { useToast } from "@/hooks/useToast";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { leadService } from "@/services/LeadService";
import useScrollReveal from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import gsap from "gsap";
import { Image } from "@/components/ui/enhanced/image";
import { useLeadValidation } from "@/hooks/useLeadValidation";
import useReducedMotion from "@/hooks/useReducedMotion";
import { PROPERTY_TYPES } from "@/addons/calculators/components/data/pricing-config";

const reassurancePoints = [
  "Free first consultation",
  "Clear budget direction",
  "Jamshedpur site coordination",
];

const projectTypeOptions = PROPERTY_TYPES.map(({ id, label, desc }) => ({
  id,
  label,
  description: desc,
}));

const projectBudgetOptions = [
  { id: "essential", label: "Essential", range: "15L-30L", value: "Essential (15L-30L)" },
  { id: "premium", label: "Premium", range: "30L-60L", value: "Premium (30L-60L)" },
  { id: "luxury", label: "Luxury", range: "60L-120L", value: "Luxury (60L-120L)" },
  { id: "legacy", label: "Legacy", range: "120L+", value: "Legacy (120L+)" },
];

const jamshedpurServiceAreas = [
  "Jamshedpur",
  "Mango",
  "Sakchi",
  "Bistupur",
  "Kadma",
  "Sonari",
  "Telco",
  "Golmuri",
  "Baridih",
  "Dimna",
  "Adityapur",
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
  const prefersReducedMotion = useReducedMotion();

  const handleFocus = () => {
    if (!prefersReducedMotion) {
      gsap.to(lineRef.current, { scaleX: 1, duration: 0.8, ease: "expo.out", transformOrigin: "left center" });
    } else {
      gsap.set(lineRef.current, { scaleX: 1 });
    }
    if (onFocus) onFocus();
  };

  const handleBlurWrapper = () => {
    if (!prefersReducedMotion) {
      gsap.to(lineRef.current, { scaleX: 0, duration: 0.5, ease: "power2.inOut", transformOrigin: "right center" });
    } else {
      gsap.set(lineRef.current, { scaleX: 0 });
    }
    if (onBlur) onBlur();
  };

  return (
    <div className="group relative mb-8">
      <label 
        htmlFor={id} 
        className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/85 transition-colors group-focus-within:text-[#d1af6e]"
      >
        {label}
      </label>
      <div className="relative" onFocus={handleFocus} onBlur={handleBlurWrapper}>
        {children}
        {/* Base Structural Line */}
        <div className="absolute bottom-0 left-0 h-[1px] w-full bg-white/20" aria-hidden="true" />
        {/* Animated Drafting Line */}
        <div 
          ref={lineRef} 
          className="absolute bottom-0 left-0 h-[1.5px] w-full bg-[#d1af6e] scale-x-0" 
          aria-hidden="true"
        />
      </div>
      {touched && error && (
        <p id={`${id}-error`} className="absolute -bottom-5 left-0 text-[10px] font-medium uppercase tracking-wide text-red-400" aria-live="polite">{error}</p>
      )}
    </div>
  );
};

const slideVariants = {
  enter: { x: 50, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -50, opacity: 0 }
};

const CTAContact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [step, setStep] = useState(1);
  const containerRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const { settings } = useSiteSettings();
  const prefersReducedMotion = useReducedMotion();
  const { 
    errors, 
    touched, 
    handleBlur, 
    handleChange, 
    validateForm,
    setErrors,
    setTouched,
  } = useLeadValidation();

  const scrollBehavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

  const isFieldInvalid = (name: string) => Boolean(touched[name] && errors[name]);
  const getFieldErrorId = (name: string) => (isFieldInvalid(name) ? `${name}-error` : undefined);

  const focusFirstInvalidField = () => {
    window.setTimeout(() => {
      const firstInvalid = formRef.current?.querySelector<HTMLElement>(
        'fieldset[aria-invalid="true"], select[aria-invalid="true"], input[aria-invalid="true"]:not(.sr-only), textarea[aria-invalid="true"]'
      );

      if (!firstInvalid) return;

      firstInvalid.focus({ preventScroll: true });
      firstInvalid.scrollIntoView({ behavior: scrollBehavior, block: 'center' });
    }, 0);
  };

  const scrollToStatus = () => {
    statusRef.current?.scrollIntoView({ behavior: scrollBehavior, block: 'center' });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Us",
      details: settings?.address ? [settings.address] : ["Jamshedpur, Jharkhand"],
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

  // Auto-focus first field
  useEffect(() => {
    if (step === 2) {
      const timer = setTimeout(() => {
        firstNameRef.current?.focus();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Parallax background effect
  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
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
  }, [prefersReducedMotion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);
    const data = Object.fromEntries(
      Array.from(formData.entries()).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
    ) as Record<string, string>;

    if (!validateForm(data)) {
      focusFirstInvalidField();
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const cleanPhone = data.phone.replace(/\D/g, '');

      const payload = {
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        phone: `+91 ${cleanPhone}`,
        message: data.message,
        project_type: data.projectType,
        budget: data.projectBudget,
        city: data.location,
        lead_source: "website_contact",
        source_url: window.location.href,
        source: "Contact-Form",
        form_data: {
          ...data,
          phoneNational: cleanPhone,
          serviceArea: "Jamshedpur",
          submittedAt: new Date().toISOString()
        }
      };

      await leadService.createLead(payload);

      setSubmitStatus('success');
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });
      target.reset();
      setErrors({});
      setTouched({});
      
      // Scroll to success message
      setTimeout(scrollToStatus, 100);

    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus('error');
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
      
      setTimeout(scrollToStatus, 100);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Shared input classes for the blank/big form look
  const inputClasses = "w-full bg-transparent border-none px-0 py-3 text-2xl md:text-3xl font-serif text-[var(--site-text)] placeholder:text-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d1af6e]/50 focus-visible:ring-offset-0 rounded-none shadow-none";

  return (
    <section id="contact" ref={containerRef} className="relative overflow-hidden px-4 py-24 md:py-32">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0 bg-[#050505]">
        <Image
          ref={bgRef}
          src="/reality_render.jpg" 
          alt="" 
          aria-hidden="true"
          className="pointer-events-none absolute -top-[15%] left-0 h-[130%] w-full"
          imageClassName="opacity-[0.25] saturate-50 select-none pointer-events-none"
          width={1800}
          height={1200}
          loading="lazy"
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
          <p className="home-body mx-auto mt-6 max-w-xl text-base text-white/80 md:text-lg">
            Use the project brief if you want a tailored response, or choose a
            quicker path if you already know how you would like to connect.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {reassurancePoints.map((point) => (
              <span key={point} className="contact-chip bg-black/40 backdrop-blur-md border-white/5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d1af6e] animate-pulse" aria-hidden="true" />
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
              
              <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                <span className="home-kicker">Project Brief</span>
                {step > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                      Step {step} of 3
                    </span>
                    <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-[#d1af6e]" 
                        initial={{ width: 0 }} 
                        animate={{ width: `${(step / 3) * 100}%` }} 
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <form ref={formRef} onSubmit={handleSubmit} noValidate className="relative z-10 w-full overflow-hidden">
                <AnimatePresence mode="wait">
                {/* Step 1: Basic Contact Info */}
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-serif text-white mb-6">Let's get the absolute basics out of the way.</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 md:gap-x-8">
                      <AnimatedField 
                        id="firstName" 
                        label="First Name" 
                        error={errors.firstName} 
                        touched={touched.firstName}
                      >
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          ref={firstNameRef}
                          id="firstName"
                          name="firstName"
                          autoComplete="given-name"
                          placeholder="John"
                          required
                          onBlur={(e) => handleBlur('firstName', e.target.value)}
                          onChange={(e) => handleChange('firstName', e.target.value)}
                          aria-invalid={isFieldInvalid('firstName')}
                          aria-describedby={getFieldErrorId('firstName')}
                          className={inputClasses}
                        />
                      </AnimatedField>

                      <AnimatedField 
                        id="lastName" 
                        label="Last Name" 
                        error={errors.lastName} 
                        touched={touched.lastName}
                      >
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          id="lastName"
                          name="lastName"
                          autoComplete="family-name"
                          placeholder="Doe"
                          required
                          onBlur={(e) => handleBlur('lastName', e.target.value)}
                          onChange={(e) => handleChange('lastName', e.target.value)}
                          aria-invalid={isFieldInvalid('lastName')}
                          aria-describedby={getFieldErrorId('lastName')}
                          className={inputClasses}
                        />
                      </AnimatedField>
                    </div>

                  <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#d1af6e] opacity-80 mt-2">
                    Where can we reach you?
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 md:gap-x-8">
                    <AnimatedField 
                      id="email" 
                      label="Email Address" 
                      error={errors.email} 
                      touched={touched.email}
                    >
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="john@example.com"
                        required
                        onBlur={(e) => handleBlur('email', e.target.value)}
                        onChange={(e) => handleChange('email', e.target.value)}
                        aria-invalid={isFieldInvalid('email')}
                        aria-describedby={getFieldErrorId('email')}
                        className={inputClasses}
                      />
                    </AnimatedField>

                    <AnimatedField 
                      id="phone" 
                      label="Phone Number" 
                      error={errors.phone} 
                      touched={touched.phone}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl md:text-3xl font-serif text-[#d1af6e] select-none">
                          +91
                        </span>
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          id="phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          placeholder="98765 43210"
                          required
                          onBlur={(e) => handleBlur('phone', e.target.value)}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          aria-invalid={isFieldInvalid('phone')}
                          aria-describedby={getFieldErrorId('phone')}
                          className={inputClasses}
                        />
                      </div>
                    </AnimatedField>
                  </div>
                  
                  <div className="pt-6 flex justify-end items-center border-t border-white/5 mt-4">
                    <Button 
                      asChild
                      type="button" 
                      onClick={() => {
                        setStep(2);
                      }} 
                      className="bg-white/10 text-white hover:bg-[#d1af6e] hover:text-black uppercase tracking-widest text-[10px] sm:text-xs rounded-full px-6 transition-all duration-300"
                    >
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                        Next: Project Type <ArrowRight className="ml-2 h-3.5 w-3.5" />
                      </motion.button>
                    </Button>
                  </div>
                  </motion.div>
                )}

                {/* Step 2: Project Type */}
                {step === 2 && (
                  <motion.div 
                    key="step2"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-serif text-white mb-6">What type of project are you looking for?</h3>
                    <div>
                      <fieldset
                        aria-labelledby="projectType-label"
                        aria-describedby={getFieldErrorId('projectType')}
                        aria-invalid={isFieldInvalid('projectType')}
                        tabIndex={-1}
                        className="grid gap-3 sm:grid-cols-2"
                      >
                        {projectTypeOptions.map((option) => (
                          <label key={option.id} className="group block cursor-pointer">
                            <input
                              type="radio"
                              name="projectType"
                              value={option.label}
                              onChange={(e) => {
                                handleBlur('projectType', e.target.value);
                                handleChange('projectType', e.target.value);
                              }}
                              aria-invalid={isFieldInvalid('projectType')}
                              aria-describedby={getFieldErrorId('projectType')}
                              className="peer sr-only"
                            />
                            <span className="flex h-full min-h-[108px] flex-col rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-4 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05] peer-focus-visible:border-[#d1af6e]/70 peer-focus-visible:ring-2 peer-focus-visible:ring-[#d1af6e]/35 peer-checked:border-[#d1af6e]/60 peer-checked:bg-[#d1af6e]/10 peer-checked:shadow-[0_18px_45px_rgba(209,175,110,0.08)]">
                              <span className="text-sm font-semibold text-white transition-colors peer-checked:text-[#f3ddab]">
                                {option.label}
                              </span>
                              <span className="mt-2 text-xs leading-5 text-white/65">
                                {option.description}
                              </span>
                            </span>
                          </label>
                        ))}
                      </fieldset>
                      {isFieldInvalid('projectType') && (
                        <p id="projectType-error" className="mt-3 text-[10px] font-medium uppercase tracking-wide text-red-400" aria-live="polite">
                          {errors.projectType}
                        </p>
                      )}
                    </div>

                    <div className="pt-6 flex justify-between items-center border-t border-white/5 mt-4">
                      <Button asChild type="button" variant="ghost" onClick={() => setStep(1)} className="text-white/50 hover:text-white uppercase tracking-widest text-[10px] sm:text-xs">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                          Back
                        </motion.button>
                      </Button>
                      <Button 
                        asChild
                        type="button" 
                        onClick={() => {
                          setStep(3);
                        }} 
                        className="bg-white/10 text-white hover:bg-[#d1af6e] hover:text-black uppercase tracking-widest text-[10px] sm:text-xs rounded-full px-6 transition-all duration-300"
                      >
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                          Next: Project Details <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </motion.button>
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Project Details */}
                {step === 3 && (
                  <motion.div 
                    key="step3"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="space-y-4"
                  >
                  <div className="mb-10 rounded-[24px] border border-white/[0.08] bg-black/25 p-6 backdrop-blur-md md:p-7">
                    <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d1af6e]">
                        Project Details
                      </p>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/72">
                        A quick brief helps us respond with sharper direction on fit,
                        budget, and the next conversation.
                      </p>
                    </div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">
                      Serving Jamshedpur and nearby neighborhoods
                    </p>
                  </div>

                  <div className="space-y-7">

                    <div>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span id="projectBudget-label" className="text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
                          Project Budget
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                          Early direction only
                        </span>
                      </div>
                      <fieldset
                        aria-labelledby="projectBudget-label"
                        aria-describedby={getFieldErrorId('projectBudget')}
                        aria-invalid={isFieldInvalid('projectBudget')}
                        tabIndex={-1}
                        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                      >
                        {projectBudgetOptions.map((option) => (
                          <label key={option.id} className="group block cursor-pointer">
                            <input
                              type="radio"
                              name="projectBudget"
                              value={option.value}
                              onChange={(e) => {
                                handleBlur('projectBudget', e.target.value);
                                handleChange('projectBudget', e.target.value);
                              }}
                              aria-invalid={isFieldInvalid('projectBudget')}
                              aria-describedby={getFieldErrorId('projectBudget')}
                              className="peer sr-only"
                            />
                            <span className="flex h-full min-h-[96px] flex-col rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-4 text-left transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05] peer-focus-visible:border-[#d1af6e]/70 peer-focus-visible:ring-2 peer-focus-visible:ring-[#d1af6e]/35 peer-checked:border-[#d1af6e]/60 peer-checked:bg-[#d1af6e]/10 peer-checked:shadow-[0_18px_45px_rgba(209,175,110,0.08)]">
                              <span className="text-sm font-semibold text-white transition-colors peer-checked:text-[#f3ddab]">
                                {option.label}
                              </span>
                              <span className="mt-2 text-xs uppercase tracking-[0.18em] text-white/60">
                                {option.range}
                              </span>
                            </span>
                          </label>
                        ))}
                      </fieldset>
                      {isFieldInvalid('projectBudget') && (
                        <p id="projectBudget-error" className="mt-3 text-[10px] font-medium uppercase tracking-wide text-red-400" aria-live="polite">
                          {errors.projectBudget}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="location" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
                        Location Near Jamshedpur
                      </label>
                      <div className="relative">
                        <motion.select
                          whileFocus={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          id="location"
                          name="location"
                          defaultValue=""
                          required
                          onBlur={(e) => handleBlur('location', e.target.value)}
                          onChange={(e) => handleChange('location', e.target.value)}
                          aria-invalid={isFieldInvalid('location')}
                          aria-describedby={getFieldErrorId('location')}
                          className="h-14 w-full appearance-none rounded-[18px] border border-white/10 bg-white/[0.02] px-4 pr-12 text-sm font-medium text-[var(--site-text)] outline-none transition-all duration-300 focus:border-[#d1af6e]/70 focus:ring-2 focus:ring-[#d1af6e]/30"
                        >
                          <option value="" className="bg-[#0A0A0A] text-white/50">
                            Select your area
                          </option>
                          {jamshedpurServiceAreas.map((area) => (
                            <option key={area} value={area} className="bg-[#0A0A0A] text-white">
                              {area}
                            </option>
                          ))}
                        </motion.select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d1af6e]" aria-hidden="true" />
                      </div>
                      <p className="mt-3 text-xs leading-5 text-white/60">
                        We are currently taking projects in Jamshedpur and the nearby areas listed here.
                      </p>
                      {isFieldInvalid('location') && (
                        <p id="location-error" className="mt-3 text-[10px] font-medium uppercase tracking-wide text-red-400" aria-live="polite">
                          {errors.location}
                        </p>
                      )}
                    </div>
                  </div>

                <AnimatedField 
                  id="message" 
                  label="Tell Us About Your Project" 
                  error={errors.message} 
                  touched={touched.message}
                >
                  <motion.textarea
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    id="message"
                    name="message"
                    placeholder="E.g., I'm looking to renovate a 3BHK apartment in Kadma. We need full design and execution within the next 4 months..."
                    rows={3}
                    required
                    onBlur={(e) => handleBlur('message', e.target.value)}
                    onChange={(e) => handleChange('message', e.target.value)}
                    aria-invalid={isFieldInvalid('message')}
                    aria-describedby={getFieldErrorId('message')}
                    className={`${inputClasses} resize-y min-h-[140px] text-lg md:text-xl leading-relaxed pb-6 placeholder:text-white/10`}
                  />
                </AnimatedField>

                <div className="pt-6" ref={statusRef} aria-live="polite">
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
                  
                  <div className="flex flex-col sm:flex-row items-center gap-6 justify-between mt-6 pt-6 border-t border-white/5">
                    <Button asChild type="button" variant="ghost" onClick={() => setStep(2)} className="w-full sm:w-auto text-white/50 hover:text-white uppercase tracking-widest text-[10px] sm:text-xs order-2 sm:order-1">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                        Back
                      </motion.button>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      className="home-button-sweep bg-gradient-to-b from-[#d1af6e] to-[#b89554] text-black hover:scale-[1.02] group h-14 w-full sm:w-auto px-10 rounded-full text-[0.74rem] font-bold uppercase tracking-[0.24em] shrink-0 border-none relative overflow-hidden order-1 sm:order-2 shadow-[0_10px_30px_rgba(209,175,110,0.2)]"
                      disabled={isSubmitting}
                    >
                      <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                        {/* Subtle gloss effect on button */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 ease-in-out" />
                        
                        {isSubmitting ? (
                          <span className="flex items-center gap-3 relative z-10">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Initiating...</span>
                          </span>
                          ) : (
                            <span className="flex items-center gap-3 relative z-10">
                            Begin My Transformation
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                        )}
                      </motion.button>
                    </Button>
                  </div>
                  </div>
                </div>
                </motion.div>
                )}
                </AnimatePresence>
            </form>
        </div>
      </div>

      <div className="reveal-elem order-2 lg:order-2 space-y-8">
            <div className="home-panel-muted rounded-[32px] p-8 md:p-10 border border-white/[0.04] bg-[#0A0A0A]/40 backdrop-blur-xl">
              <div className="mb-8">
                <div className="home-kicker mb-4 bg-white/5 border border-white/5 inline-flex px-3">Accelerated Route</div>
                <h3 className="font-serif text-2xl font-semibold text-[var(--site-text-heading)]">
                  Bypass the form.
                </h3>
                <p className="mt-3 text-[0.95rem] leading-7 text-white/70">
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
                  >
                    <MessageCircle className="h-4 w-4 mr-3" />
                    <span>WhatsApp Connect</span>
                  </a>
                </Button>
                <div className="mt-2 text-center text-[10px] uppercase tracking-[0.15em] text-white/55">
                  <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500/80 animate-pulse" aria-hidden="true" />
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
                  <p className="mt-1 text-xs text-white/70">Access our interactive cost estimator.</p>
                </div>
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:bg-[#d1af6e]/10 group-hover:border-[#d1af6e]/30 transition-all">
                  <Calculator className="h-4 w-4 text-white/70 group-hover:text-[#d1af6e] transition-colors" />
                </div>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Architectural Decor Lines */}
        <div className="pointer-events-none absolute -bottom-10 left-10 h-32 w-[1px] bg-gradient-to-t from-transparent to-[#d1af6e]/20" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-10 -right-10 h-[1px] w-48 bg-gradient-to-l from-transparent to-[#d1af6e]/20" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};

export default CTAContact;
