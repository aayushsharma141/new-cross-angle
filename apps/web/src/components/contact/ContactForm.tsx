import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Magnetic from "../ui/magnetic";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Send, CheckCircle, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const projectTypes = [
  "Residential Interior",
  "Commercial Interior",
  "Office Space",
  "Retail / Showroom",
  "Café / Restaurant"
];

const areaOptions = [
  "Up to 1000 Sq. Ft.",
  "1000 - 3000 Sq. Ft.",
  "Above 3000 Sq. Ft."
];

const budgetOptions = [
  "Up to ₹5 Lakh",
  "₹5 Lakh - ₹10 Lakh",
  "₹10 Lakh - ₹20 Lakh",
  "Above ₹20 Lakh"
];

const projectStages = [
  "Just Planning",
  "Under Construction",
  "Ready for Interior Work",
  "Renovation Project"
];

interface FloatingInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  delay?: number;
  id?: string;
  title?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

const FloatingInput = ({ label, type = "text", value, onChange, required, delay = 0, id, title, placeholder, autoFocus }: FloatingInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <input
        id={id}
        type={type}
        value={value}
        title={title}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        autoFocus={autoFocus}
        className={`
          peer w-full pt-6 pb-3 px-4 
          bg-card/50 border-2 rounded-xl
          text-foreground
          transition-all duration-300
          focus:outline-none
          ${isFocused
            ? 'border-primary shadow-[0_0_20px_hsl(var(--primary)/0.15)] bg-card'
            : 'border-border hover:border-border/80'}
        `}
        placeholder={isFocused ? (placeholder || " ") : " "}
      />
      <label
        htmlFor={id}
        className={`
          absolute left-4 transition-all duration-300 pointer-events-none
          ${isFocused || hasValue
            ? 'top-2 text-xs font-medium text-primary'
            : 'top-1/2 -translate-y-1/2 text-muted-foreground'}
        `}
      >
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </label>
    </motion.div>
  );
};

interface FloatingTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  rows?: number;
  delay?: number;
  id?: string;
  title?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

const FloatingTextarea = ({ label, value, onChange, required, rows = 4, delay = 0, id, title, placeholder, autoFocus }: FloatingTextareaProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <textarea
        id={id}
        value={value}
        title={title}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        rows={rows}
        className={`
          peer w-full pt-6 pb-3 px-4 
          bg-card/50 border-2 rounded-xl
          text-foreground resize-none
          transition-all duration-300
          focus:outline-none
          ${isFocused
            ? 'border-primary shadow-[0_0_20px_hsl(var(--primary)/0.15)] bg-card'
            : 'border-border hover:border-border/80'}
        `}
        placeholder={isFocused ? (placeholder || " ") : " "}
        autoFocus={autoFocus}
      />
      <label
        htmlFor={id}
        className={`
          absolute left-4 transition-all duration-300 pointer-events-none
          ${isFocused || hasValue
            ? 'top-2 text-xs font-medium text-primary'
            : 'top-6 text-muted-foreground'}
        `}
      >
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </label>
    </motion.div>
  );
};

interface FloatingSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  delay?: number;
  id?: string;
  title?: string;
}

const FloatingSelect = ({ label, options, value, onChange, delay = 0, id, title }: FloatingSelectProps) => {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          title={title}
          className={`
            w-full pt-6 pb-3 px-4 h-auto
            bg-card/50 border-2 rounded-xl
            text-foreground
            transition-all duration-300
            focus:ring-0 focus:ring-offset-0
            ${value ? 'border-primary bg-card' : 'border-border hover:border-border/80'}
          `}
        >
          <SelectValue placeholder=" " />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {options.map((option) => (
            <SelectItem key={option} value={option} className="focus:bg-primary/10">
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <label
        htmlFor={id}
        className={`
          absolute left-4 transition-all duration-300 pointer-events-none z-10
          ${value
            ? 'top-2 text-xs font-medium text-primary'
            : 'top-1/2 -translate-y-1/2 text-muted-foreground'}
        `}
      >
        {label}
      </label>
    </motion.div>
  );
};

const ContactForm = () => {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "",
    projectType: "",
    area: "",
    budget: "",
    projectStage: "",
    message: ""
  });

  const steps = [
    { title: "Contact Details", description: "Let's get to know you" },
    { title: "Project Scope", description: "Tell us about your space" },
    { title: "Your Vision", description: "Share your ideas & goals" }
  ];

  const handleNext = () => {
    // Validation Logic
    if (currentStep === 0) {
      if (!formData.fullName || !formData.phone || !formData.email) {
        toast({ title: "Please fill in all required fields", variant: "destructive" });
        return;
      }
    } else if (currentStep === 1) {
      if (!formData.projectType || !formData.area) {
        toast({ title: "Please tell us about the project type and area", variant: "destructive" });
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Treat Enter as Next Step unless it's a textarea (so users can still add newlines in message)
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (currentStep < steps.length - 1) {
        handleNext();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent premature submission if triggered by browser auto-fill or enter key
    if (currentStep !== steps.length - 1) {
      handleNext();
      return;
    }

    setIsSubmitting(true);

    try {
      const leadData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        service: formData.projectType,
        budget: formData.budget,
        city: formData.city,
        message: `${formData.message}\n\nDetails:\nArea: ${formData.area}\nStage: ${formData.projectStage}`,
        lead_source: "website_contact",
        source_url: window.location.href
      };

      const { error: supabaseError } = await supabase
        .from('leads')
        .insert([leadData]);

      if (supabaseError) throw supabaseError;

      // Even without knowing the database ID, we can trigger notifications with the submitted payload.
      supabase.functions.invoke('notify-hot-lead', { body: { lead: leadData } });
      supabase.functions.invoke('auto-reply-lead', { body: { lead: leadData } });

      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });

      setTimeout(() => {
        setIsSubmitted(false);
        setCurrentStep(0);
        setFormData({
          fullName: "",
          phone: "",
          email: "",
          city: "",
          projectType: "",
          area: "",
          budget: "",
          projectStage: "",
          message: ""
        });
      }, 5000);

    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
      toast({
        title: "Error sending message",
        description: "Please try again later or contact us directly on WhatsApp.",
        variant: "destructive"
      });
    }
  };

  const currentStepTitle = steps[currentStep].title;
  const currentStepDesc = steps[currentStep].description;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div ref={containerRef} className="lg:pr-8">
      <motion.div
        className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        {/* Dynamic Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none" />

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/60"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {/* Header */}
        <div className="mb-8 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-primary font-mono text-xs tracking-widest uppercase">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-muted-foreground text-xs font-medium">
              {Math.round(progress)}% Completed
            </span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
            {currentStepTitle}
          </h2>
          <p className="text-muted-foreground text-lg">
            {currentStepDesc}
          </p>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="relative z-10 min-h-[400px] flex flex-col justify-between">
          <AnimatePresence mode="wait" custom={1}>
            {currentStep === 0 && (
              <motion.div
                key="step1"
                custom={1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FloatingInput
                    label="Full Name"
                    value={formData.fullName}
                    onChange={(value) => setFormData({ ...formData, fullName: value })}
                    required
                    delay={0.1}
                    autoFocus
                  />
                  <FloatingInput
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(value) => setFormData({ ...formData, phone: value })}
                    required
                    delay={0.15}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FloatingInput
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(value) => setFormData({ ...formData, email: value })}
                    required
                    delay={0.2}
                  />
                  <FloatingInput
                    label="City"
                    value={formData.city}
                    onChange={(value) => setFormData({ ...formData, city: value })}
                    delay={0.25}
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step2"
                custom={1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-3 block">
                    Project Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {projectTypes.map((type, idx) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, projectType: type })}
                        className={`
                          px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300 text-left
                          ${formData.projectType === type
                            ? 'border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                            : 'border-border/40 bg-card/20 text-muted-foreground hover:border-primary/40 hover:bg-card/40'}
                        `}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FloatingSelect
                    label="Approx. Area"
                    options={areaOptions}
                    value={formData.area}
                    onChange={(value) => setFormData({ ...formData, area: value })}
                    delay={0.1}
                  />
                  <FloatingSelect
                    label="Estimated Budget"
                    options={budgetOptions}
                    value={formData.budget}
                    onChange={(value) => setFormData({ ...formData, budget: value })}
                    delay={0.15}
                  />
                </div>

                <FloatingSelect
                  label="Project Stage"
                  options={projectStages}
                  value={formData.projectStage}
                  onChange={(value) => setFormData({ ...formData, projectStage: value })}
                  delay={0.2}
                />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step3"
                custom={1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <FloatingTextarea
                  id="message"
                  label="Tell us about your project vision..."
                  required
                  title="Your Message"
                  placeholder="Describe your styling preferences, requirements, or any questions you have..."
                  rows={6}
                  value={formData.message}
                  onChange={(value) => setFormData({ ...formData, message: value })}
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
            {currentStep > 0 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            ) : (
              <div /> // Spacer
            )}

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90 rounded-xl px-8"
              >
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className={`
                      px-8 rounded-xl min-w-[160px]
                      ${isSubmitted ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary/90'}
                    `}
                disabled={isSubmitting || isSubmitted}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : isSubmitted ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" /> Sent!
                  </>
                ) : (
                  <>
                    Submit Request <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ContactForm;
