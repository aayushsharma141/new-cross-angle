import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { leadService } from "@/services/LeadService";
import { useLeadValidation } from "@/hooks/useLeadValidation";
import useReducedMotion from "@/hooks/useReducedMotion";
import { PROPERTY_TYPES } from "@/addons/calculators/components/data/pricing-config";
import { useAnalytics } from "@/analytics/AnalyticsProvider";
import { track } from "@/analytics/track";
import { cn } from "@/lib/utils";
import { pillCtaClass, PillCtaInner } from "@/components/editorial";

const projectTypeOptions = PROPERTY_TYPES.map(({ id, label }) => ({ id, label }));

const projectBudgetOptions = [
  { id: "essential", label: "Essential · 15L–30L", value: "Essential (15L-30L)" },
  { id: "premium", label: "Premium · 30L–60L", value: "Premium (30L-60L)" },
  { id: "luxury", label: "Luxury · 60L–120L", value: "Luxury (60L-120L)" },
  { id: "legacy", label: "Legacy · 120L+", value: "Legacy (120L+)" },
];

const jamshedpurServiceAreas = [
  "Jamshedpur", "Mango", "Sakchi", "Bistupur", "Kadma",
  "Sonari", "Telco", "Golmuri", "Baridih", "Dimna", "Adityapur",
];

type FormData = {
  firstName: string; lastName: string; email: string; phone: string;
  projectType: string; projectBudget: string; location: string; message: string;
};

/* ── Underline field ─────────────────────────────────────────────────── */

const fieldBase =
  "peer w-full appearance-none rounded-none border-0 border-b bg-transparent px-0 pb-3 pt-6 text-[15px] font-light text-white placeholder-transparent transition-colors duration-300 focus:outline-none";
const fieldBorder = "border-white/15 focus:border-primary";
const fieldBorderInvalid = "border-red-400/70 focus:border-red-400";
const labelBase =
  "pointer-events-none absolute left-0 top-6 text-[15px] font-light text-white/40 transition-all duration-300 " +
  "peer-focus:top-0 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-[0.2em] peer-focus:text-primary " +
  "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.2em] peer-[:not(:placeholder-shown)]:text-white/50";

const FieldError = ({ id, message }: { id: string; message?: string }) =>
  message ? (
    <p id={id} className="mt-2 text-[10px] font-medium uppercase tracking-[0.15em] text-red-400" aria-live="polite">
      {message}
    </p>
  ) : null;

interface SelectFieldProps {
  id: keyof FormData;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  invalid: boolean;
  error?: string;
  onChange: (v: string) => void;
  onBlur: (v: string) => void;
}

const SelectField = ({ id, label, value, options, invalid, error, onChange, onBlur }: SelectFieldProps) => (
  <div className="relative">
    <label htmlFor={id} className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
      {label}
    </label>
    <div className="relative">
      <select
        id={id}
        name={id}
        value={value}
        required
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur(e.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className={cn(
          "w-full appearance-none rounded-none border-0 border-b bg-transparent px-0 pb-3 pt-3 pr-8 text-[15px] font-light transition-colors duration-300 focus:outline-none",
          value ? "text-white" : "text-white/40",
          invalid ? fieldBorderInvalid : fieldBorder,
        )}
      >
        <option value="" className="bg-[#0A0A0A] text-white/40">Select</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0A0A0A] text-white">{o.label}</option>
        ))}
      </select>
      <span aria-hidden="true" className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-white/40">▾</span>
    </div>
    <FieldError id={`${id}-error`} message={invalid ? error : undefined} />
  </div>
);

/* ── Form ────────────────────────────────────────────────────────────── */

/**
 * Single-page lead form with underline fields. Submission, validation and
 * analytics are identical to the previous multi-step form; only the layout
 * changed.
 */
export const ContactForm = () => {
  const [searchParams] = useSearchParams();
  const interestParam = searchParams.get("interest");
  const defaultMessage = interestParam
    ? `I'm interested in the "${interestParam}" look from the Inspiration Gallery. I'd like to know more about how we can build something similar for my space.`
    : "";

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [formData, setFormData] = useState<FormData>({
    firstName: "", lastName: "", email: "", phone: "",
    projectType: "", projectBudget: "", location: "", message: defaultMessage,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const analytics = useAnalytics();
  const formStartedRef = useRef(false);

  const { errors, touched, handleBlur, handleChange, validateForm, setErrors, setTouched } = useLeadValidation();
  const scrollBehavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";

  const isInvalid = (name: keyof FormData) => Boolean(touched[name] && errors[name]);
  const errorId = (name: keyof FormData) => (isInvalid(name) ? `${name}-error` : undefined);

  const set = (name: keyof FormData) => (value: string) => {
    setFormData((p) => ({ ...p, [name]: value }));
    handleChange(name, value);
  };

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

  const focusFirstInvalidField = () => {
    window.setTimeout(() => {
      const firstInvalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      if (!firstInvalid) return;
      firstInvalid.focus({ preventScroll: true });
      firstInvalid.scrollIntoView({ behavior: scrollBehavior, block: "center" });
    }, 0);
  };

  const scrollToStatus = () => statusRef.current?.scrollIntoView({ behavior: scrollBehavior, block: "center" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData };
    (Object.keys(data) as (keyof FormData)[]).forEach((k) => { data[k] = data[k].trim(); });

    if (!validateForm(data)) {
      focusFirstInvalidField();
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    try {
      const cleanPhone = data.phone.replace(/\D/g, "");
      const id = crypto.randomUUID();
      const payload = {
        id,
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

      // submitLead (not createLead) avoids the RLS SELECT violation for anon users
      await leadService.submitLead(payload);

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

  const textField = (
    name: keyof FormData,
    label: string,
    extra: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <div className="relative">
      <input
        id={name}
        name={name}
        placeholder={label}
        required
        value={formData[name]}
        onChange={(e) => set(name)(e.target.value)}
        onBlur={(e) => handleBlur(name, e.target.value)}
        aria-invalid={isInvalid(name) || undefined}
        aria-describedby={errorId(name)}
        className={cn(fieldBase, isInvalid(name) ? fieldBorderInvalid : fieldBorder)}
        {...extra}
      />
      <label htmlFor={name} className={labelBase}>{label}</label>
      <FieldError id={`${name}-error`} message={isInvalid(name) ? errors[name] : undefined} />
    </div>
  );

  return (
    <div ref={containerRef}>
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-9">
        <div className="grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2">
          {textField("firstName", "First name", { autoComplete: "given-name" })}
          {textField("lastName", "Last name", { autoComplete: "family-name" })}
          {textField("email", "Email address", { type: "email", inputMode: "email", autoComplete: "email" })}
          {textField("phone", "Phone number", { type: "tel", inputMode: "numeric", autoComplete: "tel-national", maxLength: 11 })}
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-3">
          <SelectField
            id="projectType"
            label="Project type"
            value={formData.projectType}
            options={projectTypeOptions.map((o) => ({ value: o.label, label: o.label }))}
            invalid={isInvalid("projectType")}
            error={errors.projectType}
            onChange={set("projectType")}
            onBlur={(v) => handleBlur("projectType", v)}
          />
          <SelectField
            id="projectBudget"
            label="Budget"
            value={formData.projectBudget}
            options={projectBudgetOptions.map((o) => ({ value: o.value, label: o.label }))}
            invalid={isInvalid("projectBudget")}
            error={errors.projectBudget}
            onChange={set("projectBudget")}
            onBlur={(v) => handleBlur("projectBudget", v)}
          />
          <SelectField
            id="location"
            label="Location"
            value={formData.location}
            options={jamshedpurServiceAreas.map((a) => ({ value: a, label: a }))}
            invalid={isInvalid("location")}
            error={errors.location}
            onChange={set("location")}
            onBlur={(v) => handleBlur("location", v)}
          />
        </div>

        <div className="relative">
          <textarea
            id="message"
            name="message"
            placeholder="Briefly describe your vision"
            rows={4}
            required
            value={formData.message}
            onChange={(e) => set("message")(e.target.value)}
            onBlur={(e) => handleBlur("message", e.target.value)}
            aria-invalid={isInvalid("message") || undefined}
            aria-describedby={errorId("message")}
            className={cn(fieldBase, "resize-none", isInvalid("message") ? fieldBorderInvalid : fieldBorder)}
          />
          <label htmlFor="message" className={labelBase}>Briefly describe your vision</label>
          <FieldError id="message-error" message={isInvalid("message") ? errors.message : undefined} />
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
          <button type="submit" disabled={isSubmitting} className={cn(pillCtaClass, "disabled:opacity-60")}>
            <PillCtaInner>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Sending
                </span>
              ) : (
                "Send inquiry"
              )}
            </PillCtaInner>
          </button>
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">No spam. We reply within 24 hours.</span>
        </div>

        <div ref={statusRef} aria-live="polite">
          {submitStatus === "success" && (
            <p className="border-t border-primary/30 pt-5 text-sm font-light text-white/70">
              <span className="text-primary">Thank you.</span> Your brief is with the studio — expect a reply within one working day.
            </p>
          )}
          {submitStatus === "error" && (
            <p className="border-t border-red-400/30 pt-5 text-sm font-light text-white/70">
              We couldn't send that. Please try again, or reach us directly by phone or WhatsApp.
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
