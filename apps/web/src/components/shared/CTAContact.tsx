import {
  Phone,
  MessageCircle,
  ArrowRight,
  MapPin,
  Mail,
  Clock,
  Calculator,
  Loader2,
  CheckCircle,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { useToast } from "@/hooks/useToast";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { leadService } from "@/services/LeadService";
import useScrollReveal from "@/hooks/useScrollReveal";
import { Link, useSearchParams } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import gsap from "gsap";
import { Image } from "@/components/ui/enhanced/image";
import { useLeadValidation } from "@/hooks/useLeadValidation";
import useReducedMotion from "@/hooks/useReducedMotion";
import { PROPERTY_TYPES } from "@/addons/calculators/components/data/pricing-config";
import { useAnalytics } from "@/analytics/AnalyticsProvider";
import { track } from "@/analytics/track";

const projectTypeOptions = PROPERTY_TYPES.map(({ id, label, desc }) => ({
  id,
  label,
  description: desc,
}));

const projectBudgetOptions = [
  { id: "essential", label: "Essential", range: "15L–30L", value: "Essential (15L-30L)" },
  { id: "premium",   label: "Premium",   range: "30L–60L",  value: "Premium (30L-60L)" },
  { id: "luxury",    label: "Luxury",    range: "60L–120L", value: "Luxury (60L-120L)" },
  { id: "legacy",    label: "Legacy",    range: "120L+",    value: "Legacy (120L+)" },
];

const jamshedpurServiceAreas = [
  "Jamshedpur","Mango","Sakchi","Bistupur","Kadma",
  "Sonari","Telco","Golmuri","Baridih","Dimna","Adityapur",
];

/* ─── Animated form field wrapper ────────────────────────────────────────── */
const AnimatedField = ({
  id, label, hint, error, touched, children, onFocus, onBlur,
}: {
  id: string; label: string; hint?: string; error?: string;
  touched?: boolean; children: React.ReactNode;
  onFocus?: () => void; onBlur?: () => void;
}) => {
  const lineRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleFocus = () => {
    gsap.to(lineRef.current, prefersReducedMotion
      ? { scaleX: 1 }
      : { scaleX: 1, duration: 0.6, ease: "expo.out", transformOrigin: "left center" });
    onFocus?.();
  };
  const handleBlurWrapper = () => {
    gsap.to(lineRef.current, prefersReducedMotion
      ? { scaleX: 0 }
      : { scaleX: 0, duration: 0.5, ease: "power2.inOut", transformOrigin: "right center" });
    onBlur?.();
  };

  const isInvalid = Boolean(touched && error);

  return (
    <div className="group relative mb-5">
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 transition-colors group-focus-within:text-[#d1af6e]">
          {label}
        </label>
        {hint && !isInvalid && <span className="text-[10px] text-white/30 italic">{hint}</span>}
        {isInvalid && (
          <span className="text-[10px] font-medium text-red-400 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-red-400" />{error}
          </span>
        )}
      </div>
      <div className={`relative rounded-xl border transition-all duration-300 ${
        isInvalid
          ? "border-red-500/50 bg-red-500/5"
          : "border-white/[0.1] bg-white/[0.03] group-focus-within:border-[#d1af6e]/50 group-focus-within:bg-[#d1af6e]/[0.025]"
      }`} onFocus={handleFocus} onBlur={handleBlurWrapper}>
        {children}
        <div ref={lineRef} className="absolute bottom-0 left-0 h-[2px] w-full rounded-b-xl bg-gradient-to-r from-[#d1af6e]/80 to-[#d1af6e]/20 scale-x-0" aria-hidden="true" />
      </div>
    </div>
  );
};

const slideVariants = {
  enter: { x: 40, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 },
};

/* ─── Main component ──────────────────────────────────────────────────────── */
const CTAContact = () => {
  const [searchParams] = useSearchParams();
  const interestParam = searchParams.get("interest");
  const defaultMessage = interestParam
    ? `I'm interested in the "${interestParam}" look from the Inspiration Gallery. I'd like to know more about how we can build something similar for my space.`
    : "";

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    projectType: "", projectBudget: "", location: "", message: defaultMessage,
  });

  const containerRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const { settings } = useSiteSettings();
  const prefersReducedMotion = useReducedMotion();
  const analytics = useAnalytics();
  const formStartedRef = useRef(false);

  const { errors, touched, handleBlur, handleChange, validateForm, validateField, setErrors, setTouched } = useLeadValidation();
  const scrollBehavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";

  const isFieldInvalid = (name: string) => Boolean(touched[name] && errors[name]);
  const getFieldErrorId = (name: string) => (isFieldInvalid(name) ? `${name}-error` : undefined);

  const focusFirstInvalidField = () => {
    window.setTimeout(() => {
      const firstInvalid = formRef.current?.querySelector<HTMLElement>(
        'fieldset[aria-invalid="true"], select[aria-invalid="true"], input[aria-invalid="true"]:not(.sr-only), textarea[aria-invalid="true"]'
      );
      if (!firstInvalid) return;
      firstInvalid.focus({ preventScroll: true });
      firstInvalid.scrollIntoView({ behavior: scrollBehavior, block: "center" });
    }, 0);
  };

  const scrollToStatus = () => statusRef.current?.scrollIntoView({ behavior: scrollBehavior, block: "center" });

  useScrollReveal(containerRef, ".reveal-elem", { y: 24, stagger: 0.07 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !formStartedRef.current) {
        formStartedRef.current = true;
        track(analytics, "contact_form_started", { path: window.location.pathname });
      }
    }, { threshold: 0.2 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [analytics]);

  useEffect(() => {
    if (step === 2) {
      const t = setTimeout(() => firstNameRef.current?.focus(), 450);
      return () => clearTimeout(t);
    }
  }, [step]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        y: "18%", ease: "none",
        scrollTrigger: { trigger: containerRef.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    }, containerRef);
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData };
    for (const key in data) {
      if (typeof data[key as keyof typeof data] === "string")
        data[key as keyof typeof data] = data[key as keyof typeof data].trim();
    }
    if (!validateForm(data)) {
      const step1Fields = ["firstName", "lastName", "email", "phone"];
      const step2Fields = ["projectType"];
      const hasStep1Error = step1Fields.some(f => validateField(f, data[f as keyof typeof data]));
      const hasStep2Error = step2Fields.some(f => validateField(f, data[f as keyof typeof data]));
      if (hasStep1Error) setStep(1);
      else if (hasStep2Error) setStep(2);
      setTimeout(focusFirstInvalidField, 300);
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus("idle");
    try {
      const cleanPhone = data.phone.replace(/\D/g, "");
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
        form_data: { ...data, phoneNational: cleanPhone, serviceArea: "Jamshedpur", submittedAt: new Date().toISOString() },
      };
      await leadService.createLead(payload);
      setSubmitStatus("success");
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      setFormData({ firstName: "", lastName: "", email: "", phone: "", projectType: "", projectBudget: "", location: "", message: defaultMessage });
      setErrors({});
      setTouched({});
      track(analytics, "contact_form_submitted", { leadSource: payload.lead_source });
      setTimeout(scrollToStatus, 100);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
      toast({ title: "Something went wrong", description: "Please try again later.", variant: "destructive" });
      setTimeout(scrollToStatus, 100);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full bg-transparent border-none px-4 py-3.5 text-sm font-medium text-white placeholder:text-white/30 focus-visible:outline-none rounded-xl";

  return (
    <section
      id="contact-form-section"
      ref={containerRef}
      className="relative overflow-hidden px-4 py-28 md:py-36"
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 z-0 bg-[#050505]">
        <Image
          ref={bgRef}
          src="/reality_render.jpg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -top-[15%] left-0 h-[130%] w-full"
          imageClassName="opacity-[0.18] saturate-[0.4] select-none pointer-events-none"
          width={1800}
          height={1200}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/90 via-[#050505]/60 to-[#050505]/95" />
      </div>

      {/* ── Ambient glow ── */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[900px] opacity-30 blur-[140px]"
        style={{ background: "radial-gradient(ellipse at top, rgba(209,175,110,0.15) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto max-w-7xl">

        {/* ── Premium page header ── */}
        <div className="reveal-elem mb-20 flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#d1af6e]/20 bg-[#d1af6e]/5 px-4 py-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d1af6e] animate-pulse" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d1af6e]/80">Start Here</span>
          </div>

          <h1 className="font-serif text-[clamp(2.8rem,6vw,5.5rem)] font-medium leading-[1.05] tracking-tight text-white max-w-4xl">
            Plan Your Interior
            <span className="block" style={{ WebkitTextStroke: "1px rgba(209,175,110,0.4)", color: "transparent" }}>
              Project
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/50">
            One conversation. A clearer next step. Use the brief for a tailored response,
            or reach us directly via call or WhatsApp.
          </p>

          {/* Trust pills */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {["Free first consultation", "Clear budget direction", "Jamshedpur site coordination"].map((pt) => (
              <span key={pt} className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-[11px] font-medium text-white/55 backdrop-blur-sm">
                <span className="h-1 w-1 rounded-full bg-[#d1af6e]/60" aria-hidden="true" />
                {pt}
              </span>
            ))}
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-8 xl:gap-10">

          {/* LEFT — Multi-step form */}
          <div className="reveal-elem">
            <div className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#0A0A0A]/70 p-7 shadow-[0_32px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl md:p-10">
              {/* Warm glow top-right */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#d1af6e]/8 blur-[80px]" aria-hidden="true" />

              {/* Step indicator */}
              <div className="mb-8 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d1af6e]/70">Project Brief</span>
                <div className="flex items-center gap-2.5">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className={`h-1 rounded-full transition-all duration-500 ${
                      s < step ? "w-8 bg-[#d1af6e]" : s === step ? "w-12 bg-[#d1af6e]" : "w-8 bg-white/10"
                    }`} />
                  ))}
                  <span className="text-[10px] font-bold text-[#d1af6e]/60 tabular-nums">{Math.round((step / 3) * 100)}%</span>
                </div>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} noValidate className="relative z-10 w-full overflow-hidden">
                <AnimatePresence mode="wait">

                  {/* ── Step 1: Contact info ── */}
                  {step === 1 && (
                    <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: "easeInOut" }} className="space-y-1">
                      <div className="mb-7">
                        <h2 className="text-xl font-semibold text-white">Who are we speaking with?</h2>
                        <p className="mt-1 text-xs text-white/35">Takes less than 60 seconds · No spam, ever.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <AnimatedField id="firstName" label="First Name" hint="e.g. Aayush" error={errors.firstName} touched={touched.firstName}>
                          <input ref={firstNameRef} id="firstName" name="firstName" autoComplete="given-name" placeholder="Aayush" required
                            value={formData.firstName}
                            onBlur={(e) => handleBlur("firstName", e.target.value)}
                            onChange={(e) => { setFormData(p => ({ ...p, firstName: e.target.value })); handleChange("firstName", e.target.value); }}
                            {...(isFieldInvalid("firstName") ? { "aria-invalid": "true" as const } : {})}
                            aria-describedby={getFieldErrorId("firstName")}
                            className={inputClasses} />
                        </AnimatedField>
                        <AnimatedField id="lastName" label="Last Name" error={errors.lastName} touched={touched.lastName}>
                          <input id="lastName" name="lastName" autoComplete="family-name" placeholder="Sharma" required
                            value={formData.lastName}
                            onBlur={(e) => handleBlur("lastName", e.target.value)}
                            onChange={(e) => { setFormData(p => ({ ...p, lastName: e.target.value })); handleChange("lastName", e.target.value); }}
                            {...(isFieldInvalid("lastName") ? { "aria-invalid": "true" as const } : {})}
                            aria-describedby={getFieldErrorId("lastName")}
                            className={inputClasses} />
                        </AnimatedField>
                      </div>

                      <div className="flex items-center gap-3 py-2">
                        <div className="h-px flex-1 bg-white/[0.05]" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#d1af6e]/50">How to reach you</span>
                        <div className="h-px flex-1 bg-white/[0.05]" />
                      </div>

                      <AnimatedField id="email" label="Email Address" hint="For project updates" error={errors.email} touched={touched.email}>
                        <input id="email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" required
                          value={formData.email}
                          onBlur={(e) => handleBlur("email", e.target.value)}
                          onChange={(e) => { setFormData(p => ({ ...p, email: e.target.value })); handleChange("email", e.target.value); }}
                          {...(isFieldInvalid("email") ? { "aria-invalid": "true" as const } : {})}
                          aria-describedby={getFieldErrorId("email")}
                          className={inputClasses} />
                      </AnimatedField>

                      <AnimatedField id="phone" label="Mobile Number" hint="10-digit Indian number" error={errors.phone} touched={touched.phone}>
                        <div className="flex items-center">
                          <span className="flex items-center gap-1.5 pl-4 pr-3 py-3.5 border-r border-white/[0.1] text-xs font-bold text-[#d1af6e] select-none shrink-0">
                            🇮🇳 +91
                          </span>
                          <input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="98765 43210" maxLength={11} required
                            value={formData.phone}
                            onBlur={(e) => handleBlur("phone", e.target.value)}
                            onChange={(e) => { setFormData(p => ({ ...p, phone: e.target.value })); handleChange("phone", e.target.value); }}
                            {...(isFieldInvalid("phone") ? { "aria-invalid": "true" as const } : {})}
                            aria-describedby={getFieldErrorId("phone")}
                            className={inputClasses} />
                        </div>
                      </AnimatedField>

                      <div className="pt-5 space-y-3 border-t border-white/[0.05] mt-3">
                        <p className="text-center text-[10px] text-white/30 tracking-wide">🔒 Your data stays private. No calls without your permission.</p>
                        <motion.button type="button" onClick={() => setStep(2)}
                          whileHover={{ scale: 1.015, boxShadow: "0 8px 32px rgba(182,24,38,0.22)" }}
                          whileTap={{ scale: 0.98 }}
                          className="group relative w-full h-13 rounded-2xl bg-gradient-to-r from-[#b61826] to-[#870e20] text-white border border-white/10 font-bold text-xs uppercase tracking-[0.22em] flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(182,24,38,0.18)] overflow-hidden py-4">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                          <span className="relative z-10">Continue to Project Type</span>
                          <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Step 2: Project type ── */}
                  {step === 2 && (
                    <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: "easeInOut" }} className="space-y-5">
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-white">What type of project?</h2>
                        <p className="mt-1 text-xs text-white/35">Select the one that best describes your space.</p>
                      </div>
                      <fieldset aria-labelledby="projectType-label"
                        aria-describedby={getFieldErrorId("projectType")}
                        {...(isFieldInvalid("projectType") ? { "aria-invalid": "true" as const } : {})}
                        className="grid gap-3 sm:grid-cols-2">
                        {projectTypeOptions.map((option) => (
                          <label key={option.id} className="group block cursor-pointer">
                            <input type="radio" name="projectType" value={option.label}
                              checked={formData.projectType === option.label}
                              onChange={(e) => { setFormData(p => ({ ...p, projectType: e.target.value })); handleBlur("projectType", e.target.value); handleChange("projectType", e.target.value); }}
                              {...(isFieldInvalid("projectType") ? { "aria-invalid": "true" as const } : {})}
                              aria-describedby={getFieldErrorId("projectType")}
                              className="peer sr-only" />
                            <span className="flex h-full min-h-[100px] flex-col rounded-[18px] border border-white/8 bg-white/[0.02] px-4 py-4 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04] peer-focus-visible:border-[#d1af6e]/60 peer-focus-visible:ring-2 peer-focus-visible:ring-[#d1af6e]/30 peer-checked:border-[#d1af6e]/50 peer-checked:bg-[#d1af6e]/[0.08] peer-checked:shadow-[0_12px_36px_rgba(209,175,110,0.07)]">
                              <span className="text-sm font-semibold text-white">{option.label}</span>
                              <span className="mt-2 text-xs leading-5 text-white/50">{option.description}</span>
                            </span>
                          </label>
                        ))}
                      </fieldset>
                      {isFieldInvalid("projectType") && (
                        <p id="projectType-error" className="text-[10px] font-medium uppercase tracking-wide text-red-400" aria-live="polite">{errors.projectType}</p>
                      )}
                      <div className="flex justify-between items-center border-t border-white/[0.05] pt-5 mt-2">
                        <button type="button" onClick={() => setStep(1)} className="text-[10px] font-bold uppercase tracking-widest text-white/35 hover:text-white transition-colors">← Back</button>
                        <motion.button type="button" onClick={() => setStep(3)}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          className="flex items-center gap-2 rounded-full bg-white/8 hover:bg-[#b61826] border border-white/10 hover:border-[#b61826] px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white transition-all duration-300">
                          Next: Details <ArrowRight className="h-3.5 w-3.5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Step 3: Project details + message ── */}
                  {step === 3 && (
                    <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: "easeInOut" }} className="space-y-6">
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-white">Final project details</h2>
                        <p className="mt-1 text-xs text-white/35">A quick brief helps us respond with sharper direction.</p>
                      </div>

                      {/* Budget */}
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Project Budget</span>
                          <span className="text-[9px] uppercase tracking-[0.15em] text-white/30">Early direction only</span>
                        </div>
                        <fieldset aria-labelledby="projectBudget-label"
                          aria-describedby={getFieldErrorId("projectBudget")}
                          {...(isFieldInvalid("projectBudget") ? { "aria-invalid": "true" as const } : {})}
                          className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                          {projectBudgetOptions.map((option) => (
                            <label key={option.id} className="block cursor-pointer">
                              <input type="radio" name="projectBudget" value={option.value}
                                checked={formData.projectBudget === option.value}
                                onChange={(e) => { setFormData(p => ({ ...p, projectBudget: e.target.value })); handleBlur("projectBudget", e.target.value); handleChange("projectBudget", e.target.value); }}
                                {...(isFieldInvalid("projectBudget") ? { "aria-invalid": "true" as const } : {})}
                                aria-describedby={getFieldErrorId("projectBudget")}
                                className="peer sr-only" />
                              <span className="flex h-full min-h-[80px] flex-col rounded-[16px] border border-white/8 bg-white/[0.02] px-3.5 py-3.5 text-left transition-all duration-300 hover:border-white/20 peer-checked:border-[#d1af6e]/50 peer-checked:bg-[#d1af6e]/[0.08]">
                                <span className="text-xs font-semibold text-white">{option.label}</span>
                                <span className="mt-1.5 text-[10px] uppercase tracking-[0.15em] text-white/40">{option.range}</span>
                              </span>
                            </label>
                          ))}
                        </fieldset>
                        {isFieldInvalid("projectBudget") && (
                          <p id="projectBudget-error" className="mt-2 text-[10px] font-medium uppercase tracking-wide text-red-400" aria-live="polite">{errors.projectBudget}</p>
                        )}
                      </div>

                      {/* Location */}
                      <div>
                        <label htmlFor="location" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Location Near Jamshedpur</label>
                        <div className="relative">
                          <select id="location" name="location" value={formData.location} required
                            onBlur={(e) => handleBlur("location", e.target.value)}
                            onChange={(e) => { setFormData(p => ({ ...p, location: e.target.value })); handleChange("location", e.target.value); }}
                            {...(isFieldInvalid("location") ? { "aria-invalid": "true" as const } : {})}
                            aria-describedby={getFieldErrorId("location")}
                            className="h-12 w-full appearance-none rounded-[14px] border border-white/10 bg-white/[0.03] px-4 pr-10 text-sm font-medium text-white outline-none transition-all focus:border-[#d1af6e]/50 focus:ring-2 focus:ring-[#d1af6e]/20">
                            <option value="" className="bg-[#0A0A0A] text-white/40">Select your area</option>
                            {jamshedpurServiceAreas.map((area) => (
                              <option key={area} value={area} className="bg-[#0A0A0A] text-white">{area}</option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d1af6e]/60" aria-hidden="true" />
                        </div>
                        {isFieldInvalid("location") && (
                          <p id="location-error" className="mt-2 text-[10px] font-medium uppercase tracking-wide text-red-400" aria-live="polite">{errors.location}</p>
                        )}
                      </div>

                      {/* Message */}
                      <AnimatedField id="message" label="Tell Us About Your Project" error={errors.message} touched={touched.message}>
                        <textarea id="message" name="message" value={formData.message}
                          placeholder="E.g., I'm looking to renovate a 3BHK apartment in Kadma…"
                          rows={4} required
                          onBlur={(e) => handleBlur("message", e.target.value)}
                          onChange={(e) => { setFormData(p => ({ ...p, message: e.target.value })); handleChange("message", e.target.value); }}
                          {...(isFieldInvalid("message") ? { "aria-invalid": "true" as const } : {})}
                          aria-describedby={getFieldErrorId("message")}
                          className={`${inputClasses} resize-none min-h-[120px] leading-relaxed placeholder:text-white/20`} />
                      </AnimatedField>

                      {/* Submit area */}
                      <div ref={statusRef} aria-live="polite" className="pt-4 border-t border-white/[0.05]">
                        {submitStatus === "success" && (
                          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/8 px-4 py-3.5">
                            <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                            <span className="text-sm font-medium text-green-400">Project details captured. We'll be in touch shortly.</span>
                          </div>
                        )}
                        {submitStatus === "error" && (
                          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3.5">
                            <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                            <span className="text-sm font-medium text-red-400">Signal failed. Please try again or use direct contact.</span>
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                          <button type="button" onClick={() => setStep(2)} className="w-full sm:w-auto text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors order-2 sm:order-1">← Back</button>
                          <Button asChild size="lg" className="home-button-sweep bg-gradient-to-r from-[#b61826] to-[#870e20] text-white border border-white/10 hover:scale-[1.02] group h-13 w-full sm:w-auto px-10 rounded-full text-[0.72rem] font-bold uppercase tracking-[0.22em] shrink-0 relative overflow-hidden order-1 sm:order-2 shadow-[0_8px_28px_rgba(182,24,38,0.2)]" disabled={isSubmitting}>
                            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full duration-1000" />
                              {isSubmitting ? (
                                <span className="flex items-center gap-2.5 relative z-10"><Loader2 className="h-4 w-4 animate-spin" />Initiating...</span>
                              ) : (
                                <span className="flex items-center gap-2.5 relative z-10 py-4">Begin My Transformation <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" /></span>
                              )}
                            </motion.button>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </form>
            </div>
          </div>

          {/* RIGHT — Accelerated routes + contact info */}
          <div className="reveal-elem space-y-5">

            {/* Bypass card */}
            <div className="rounded-[24px] border border-white/[0.07] bg-[#0A0A0A]/60 p-6 backdrop-blur-xl md:p-8">
              <div className="mb-5">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">Accelerated Route</span>
                </div>
                <h3 className="font-serif text-xl font-semibold text-white">Bypass the form.</h3>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  If you already know what you need, call or WhatsApp directly for an immediate dialogue.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <a href={`tel:${settings?.phone || "+917909041132"}`}
                  onClick={() => track(analytics, "cta_clicked", { ctaId: "accelerated_call", destination: "tel" })}
                  className="group flex h-12 w-full items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white">
                  <Phone className="h-4 w-4 shrink-0 text-white/40 group-hover:text-white transition-colors" />
                  Call Studio
                </a>
                <a href={`https://wa.me/${settings?.whatsapp || "917909041132"}?text=Hi!%20I'm%20interested%20in%20your%20interior%20design%20services.`}
                  onClick={() => track(analytics, "cta_clicked", { ctaId: "accelerated_whatsapp", destination: "whatsapp" })}
                  className="group flex h-12 w-full items-center gap-3 rounded-2xl border border-[#25D366]/20 bg-[#25D366]/[0.06] px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#25D366]/75 transition-all duration-300 hover:border-[#25D366]/40 hover:bg-[#25D366]/[0.12] hover:text-[#25D366]">
                  <MessageCircle className="h-4 w-4 shrink-0 text-[#25D366]/50 group-hover:text-[#25D366] transition-colors" />
                  WhatsApp Connect
                </a>
                <div className="mt-1 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.18em] text-white/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500/70 animate-pulse" aria-hidden="true" />
                  Available for immediate chat
                </div>
              </div>
            </div>

            {/* Contact info — single elegant card */}
            <div className="rounded-[24px] border border-white/[0.07] bg-[#0A0A0A]/60 p-6 backdrop-blur-xl md:p-8">
              <div className="space-y-5">
                {[
                  { icon: MapPin, label: "Visit Us", value: settings?.address || "2nd Floor, Aditya Signature Building, Mango, Jamshedpur" },
                  { icon: Phone, label: "Call Us", value: settings?.phone || "+91 79090 41132" },
                  { icon: Mail, label: "Email Us", value: settings?.email || "info@crossangleinterior.com" },
                  { icon: Clock, label: "Studio Hours", value: "Mon – Sat, 9 AM – 7 PM" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#d1af6e]/15 bg-[#d1af6e]/[0.06]">
                      <Icon className="h-3.5 w-3.5 text-[#d1af6e]/60" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">{label}</p>
                      <p className="mt-0.5 text-sm font-medium text-white/75 leading-relaxed">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimate nudge */}
            <Link to="/estimate"
              onClick={() => track(analytics, "estimate_path_selected", { pathId: "contact_page_cta" })}
              className="group flex items-center justify-between rounded-[24px] border border-[#d1af6e]/10 bg-gradient-to-br from-[#d1af6e]/[0.05] to-transparent p-5 backdrop-blur-md transition-all duration-300 hover:border-[#d1af6e]/25 hover:from-[#d1af6e]/[0.09]">
              <div>
                <h4 className="text-sm font-serif font-semibold text-white group-hover:text-[#d1af6e] transition-colors">Looking for numbers?</h4>
                <p className="mt-0.5 text-xs text-white/40 group-hover:text-white/60 transition-colors">Access our interactive cost estimator.</p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] group-hover:border-[#d1af6e]/30 group-hover:bg-[#d1af6e]/8 transition-all">
                <Calculator className="h-4 w-4 text-white/40 group-hover:text-[#d1af6e] transition-colors" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTAContact;
