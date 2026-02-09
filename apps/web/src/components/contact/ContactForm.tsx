import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Send, CheckCircle, Loader2 } from "lucide-react";
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
  "Above ₹10 Lakh"
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
}

const FloatingInput = ({ label, type = "text", value, onChange, required, delay = 0 }: FloatingInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        className={`
          peer w-full pt-6 pb-3 px-4 
          bg-card border-2 rounded-xl
          text-foreground
          transition-all duration-300
          focus:outline-none
          ${isFocused
            ? 'border-primary shadow-[0_0_20px_hsl(var(--primary)/0.15)]'
            : 'border-border hover:border-border/80'}
        `}
        placeholder=" "
      />
      <label
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
      <motion.div
        className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isFocused ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

interface FloatingTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  delay?: number;
}

const FloatingTextarea = ({ label, value, onChange, rows = 4, delay = 0 }: FloatingTextareaProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        rows={rows}
        className={`
          peer w-full pt-6 pb-3 px-4 
          bg-card border-2 rounded-xl
          text-foreground resize-none
          transition-all duration-300
          focus:outline-none
          ${isFocused
            ? 'border-primary shadow-[0_0_20px_hsl(var(--primary)/0.15)]'
            : 'border-border hover:border-border/80'}
        `}
        placeholder=" "
      />
      <label
        className={`
          absolute left-4 transition-all duration-300 pointer-events-none
          ${isFocused || hasValue
            ? 'top-2 text-xs font-medium text-primary'
            : 'top-6 text-muted-foreground'}
        `}
      >
        {label}
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
}

const FloatingSelect = ({ label, options, value, onChange, delay = 0 }: FloatingSelectProps) => {
  const hasValue = value.length > 0;

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className={`
            w-full pt-6 pb-3 px-4 h-auto
            bg-card border-2 rounded-xl
            text-foreground
            transition-all duration-300
            focus:ring-0 focus:ring-offset-0
            data-[state=open]:border-primary data-[state=open]:shadow-[0_0_20px_hsl(var(--primary)/0.15)]
            ${hasValue ? 'border-border' : 'border-border'}
          `}
        >
          <SelectValue placeholder="" />
        </SelectTrigger>
        <SelectContent className="bg-card border border-border rounded-xl shadow-xl">
          {options.map((option) => (
            <SelectItem
              key={option}
              value={option}
              className="py-3 focus:bg-primary/10 cursor-pointer"
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <label
        className={`
          absolute left-4 transition-all duration-300 pointer-events-none z-10
          ${hasValue
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

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    projectType: "",
    area: "",
    budget: "",
    city: "",
    projectStage: "",
    message: ""
  });

  const filledFields = Object.values(formData).filter(v => v.length > 0).length;
  const totalFields = Object.keys(formData).length;
  const progress = (filledFields / totalFields) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Supabase Insertion
      const leadData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        service: formData.projectType,
        budget: formData.budget,
        message: `${formData.message}\n\nDetails:\nArea: ${formData.area}\nCity: ${formData.city}\nStage: ${formData.projectStage}`,
        source: "Website Form"
      };

      const { data: newLead, error: supabaseError } = await supabase
        .from('leads')
        .insert([leadData])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // Trigger Smart Notifications & Auto-reply (Fire & Forget)
      if (newLead) {
        supabase.functions.invoke('notify-hot-lead', { body: { lead: newLead } });
        supabase.functions.invoke('auto-reply-lead', { body: { lead: newLead } });
      }

      // Legacy Google Sheet (Optional - keeping for backup)
      const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbyX3RPlj6Yg-7nn9xMRLhsrd5tiimH9Vz_k4VTH36IB4sa80uSwh6ZOFGVgX7tuKEi2/exec";
      await fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(formData),
      });

      setIsSubmitting(false);
      setIsSubmitted(true);

      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });

      // Reset after animation
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          fullName: "",
          phone: "",
          email: "",
          projectType: "",
          area: "",
          budget: "",
          city: "",
          projectStage: "",
          message: ""
        });
      }, 3000);

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

  return (
    <div ref={containerRef}>
      <motion.div
        className="bg-card backdrop-blur-sm border border-border rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-wine-900/20">
          <motion.div
            className="h-full bg-gradient-to-r from-wine-600 to-wine-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="mb-8">
          <span className="text-wine-500 font-medium tracking-wider uppercase text-xs mb-2 block">
            Consultation Request
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">
            Start Your Project
          </h2>
          <p className="text-muted-foreground">
            Fill out the form and we'll be in touch soon.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FloatingInput
              label="Full Name"
              value={formData.fullName}
              onChange={(value) => setFormData({ ...formData, fullName: value })}
              required
              delay={0.1}
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

          <FloatingInput
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value })}
            required
            delay={0.2}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FloatingSelect
              label="Type of Project"
              options={projectTypes}
              value={formData.projectType}
              onChange={(value) => setFormData({ ...formData, projectType: value })}
              delay={0.25}
            />
            <FloatingSelect
              label="Approx. Area"
              options={areaOptions}
              value={formData.area}
              onChange={(value) => setFormData({ ...formData, area: value })}
              delay={0.3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FloatingSelect
              label="Estimated Budget"
              options={budgetOptions}
              value={formData.budget}
              onChange={(value) => setFormData({ ...formData, budget: value })}
              delay={0.35}
            />
            <FloatingInput
              label="City / Location"
              value={formData.city}
              onChange={(value) => setFormData({ ...formData, city: value })}
              delay={0.4}
            />
          </div>

          <FloatingSelect
            label="Project Stage"
            options={projectStages}
            value={formData.projectStage}
            onChange={(value) => setFormData({ ...formData, projectStage: value })}
            delay={0.45}
          />

          <FloatingTextarea
            label="Tell us about your project..."
            value={formData.message}
            onChange={(value) => setFormData({ ...formData, message: value })}
            rows={4}
            delay={0.5}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
          >
            <Button
              type="submit"
              size="lg"
              className={`
                w-full py-7 text-lg rounded-xl
                shadow-lg transition-all duration-500
                ${isSubmitted
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/30'
                  : 'bg-wine-600 hover:bg-wine-700 text-white shadow-wine-500/30 hover:shadow-xl hover:shadow-wine-500/40 hover:-translate-y-0.5'}
              `}
              disabled={isSubmitting || isSubmitted}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : isSubmitted ? (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Message Sent!
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Send Message
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default ContactForm;
