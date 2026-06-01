import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Database, Lock, Eye, Mail, Trash2, ArrowLeft, Users, AlertTriangle, FileText } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import LegalFooter from "@/components/layout/LegalFooter";
import { Helmet } from "react-helmet-async";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45, ease: "easeOut" } }),
};

const Section = ({ icon: Icon, title, children, index }: { icon: React.ElementType; title: string; children: React.ReactNode; index: number }) => (
  <motion.section
    custom={index}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-60px" }}
    variants={fadeUp}
    className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 backdrop-blur-sm"
  >
    <div className="flex items-center gap-3 mb-6 border-b border-white/[0.07] pb-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C41230]/20 bg-[#C41230]/10">
        <Icon className="w-5 h-5 text-[#C41230]" />
      </div>
      <h2 className="text-xl font-semibold text-white m-0">{title}</h2>
    </div>
    {children}
  </motion.section>
);

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-[#C41230]/30">
      <Helmet>
        <title>Privacy Policy & DPDPA Rights | Cross Angle Interior</title>
        <meta name="description" content="Cross Angle Interior's Privacy Policy compliant with DPDPA 2023. Learn how we collect, use, and protect your personal data." />
      </Helmet>

      <Navbar />

      <main className="pt-32 pb-24 relative z-10 overflow-hidden">
        {/* Decorative background */}
        <div className="pointer-events-none absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#C41230]/8 to-transparent -z-10" />
        <div className="pointer-events-none absolute top-24 right-0 w-[600px] h-[600px] bg-[#C41230]/4 rounded-full blur-[140px] -z-10" />

        <div className="container mx-auto px-6 max-w-4xl">

          {/* Back link */}
          <Link to="/" className="inline-flex items-center text-white/40 hover:text-[#d1af6e] transition-colors mb-12 group text-sm">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C41230]/10 border border-[#C41230]/20 text-[#C41230] mb-5 text-xs font-semibold uppercase tracking-widest">
              <Shield className="w-3.5 h-3.5" />
              <span>Legal & Privacy · Version 2.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-5 leading-tight">
              Privacy Policy &amp; <span className="text-[#C41230]">DPDPA Compliance</span>
            </h1>
            <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
              Published in compliance with the <strong className="text-white/80">Digital Personal Data Protection Act, 2023 (DPDPA)</strong> of India. This policy governs how Crossangle Interior collects, uses, and protects your personal data.
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-white/40">
              <span>Last Updated: June 01, 2026</span>
              <span>·</span>
              <span>Version 2.0 — DPDPA 2023 Compliant</span>
            </div>
          </motion.div>

          <div className="space-y-6">

            {/* 1. Statutory Overview */}
            <Section icon={FileText} title="1. Statutory Overview" index={0}>
              <p className="text-white/65 leading-relaxed text-sm">
                <strong className="text-white/85">Crossangle Interior</strong> (hereinafter "the Company," "we," "us," or "our") acts as the <strong className="text-white/85">Data Fiduciary</strong> in relation to the personal data collected through our website and during the course of providing interior design services in Jamshedpur and Kolkata.
              </p>
              <p className="text-white/65 leading-relaxed text-sm mt-3">
                By accessing our website or engaging our services, you (the <strong className="text-white/85">Data Principal</strong>) acknowledge that you have read and understood this Policy and consent to the collection and processing of your data as described herein.
              </p>
              <div className="mt-5 grid sm:grid-cols-2 gap-3">
                {[
                  { term: "Data Fiduciary", def: "Crossangle Interior — determines the purpose and means of processing personal data." },
                  { term: "Data Principal", def: "The individual to whom the personal data relates (Client, Visitor, or Lead)." },
                  { term: "Personal Data", def: "Any data about an individual who is identifiable by or in relation to such data." },
                  { term: "Processing", def: "Any automated or manual operation performed on personal data." },
                ].map(({ term, def }) => (
                  <div key={term} className="bg-black/30 border border-white/[0.06] rounded-xl p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#d1af6e] mb-1">{term}</p>
                    <p className="text-xs text-white/55 leading-relaxed">{def}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* 2. Data Collected */}
            <Section icon={Database} title="2. Nature of Data Collected" index={1}>
              <p className="text-white/65 text-sm mb-4">We collect personal data only to the extent necessary for premium interior design service delivery:</p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">A. Voluntarily Provided</p>
                  <ul className="space-y-1.5 text-sm text-white/60">
                    <li className="flex gap-2"><span className="text-[#C41230] mt-0.5">•</span><span><strong className="text-white/80">Identity & Contact:</strong> Legal name, phone, email, and physical address.</span></li>
                    <li className="flex gap-2"><span className="text-[#C41230] mt-0.5">•</span><span><strong className="text-white/80">Project Specifics:</strong> Site location, floor plans, site photographs, and design preferences.</span></li>
                    <li className="flex gap-2"><span className="text-[#C41230] mt-0.5">•</span><span><strong className="text-white/80">Financial Information:</strong> PAN (for high-value transactions), GST details (commercial projects), and transaction history.</span></li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">B. Automatically Collected (Technical)</p>
                  <ul className="space-y-1.5 text-sm text-white/60">
                    <li className="flex gap-2"><span className="text-[#C41230] mt-0.5">•</span><span><strong className="text-white/80">Identifiers:</strong> IP addresses, browser type, and operating system.</span></li>
                    <li className="flex gap-2"><span className="text-[#C41230] mt-0.5">•</span><span><strong className="text-white/80">Usage Data:</strong> Clickstream patterns, time on pages, and referring URLs.</span></li>
                    <li className="flex gap-2"><span className="text-[#C41230] mt-0.5">•</span><span><strong className="text-white/80">Cookies:</strong> Essential cookies for session integrity and analytics cookies for site improvement.</span></li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* 3. Legal Grounds Table */}
            <Section icon={Shield} title="3. Legal Grounds & Purposes for Processing" index={2}>
              <p className="text-white/65 text-sm mb-5">Under DPDPA 2023, we process your data based on <strong className="text-white/80">Consent</strong> or <strong className="text-white/80">Legitimate Use</strong>:</p>
              <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.07] bg-white/[0.03]">
                      <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-white/50">Purpose</th>
                      <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-white/50">Data Category</th>
                      <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-white/50">Legal Basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { purpose: "Project Estimations & Quotes", data: "Contact, Project Specs", basis: "Consent", basisColor: "text-[#d1af6e]" },
                      { purpose: "3D Design Visualizations", data: "Site Photos, Floor Plans", basis: "Contractual Necessity", basisColor: "text-blue-400" },
                      { purpose: "Vendor Coordination (Hafele, Asian Paints)", data: "Name, Site Address", basis: "Legitimate Use", basisColor: "text-emerald-400" },
                      { purpose: "10-Year Warranty Tracking", data: "Contact, Invoice History", basis: "Contractual Necessity", basisColor: "text-blue-400" },
                      { purpose: "Statutory Compliance (Tax)", data: "PAN, GST, Billing Info", basis: "Legal Obligation", basisColor: "text-purple-400" },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-white/75">{row.purpose}</td>
                        <td className="px-4 py-3 text-white/50">{row.data}</td>
                        <td className={`px-4 py-3 font-medium text-xs ${row.basisColor}`}>{row.basis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* 4. DPDPA Rights */}
            <Section icon={Eye} title="4. Your Rights as Data Principal (DPDPA 2023)" index={3}>
              <p className="text-white/65 text-sm mb-5">Pursuant to the DPDPA 2023, you are entitled to the following rights:</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Database, title: "Right to Information", desc: "Receive a summary of your data being processed and the identities of third parties with whom it is shared." },
                  { icon: Trash2, title: "Right to Correction & Erasure", desc: "Request rectification of inaccurate data or deletion of data no longer required for its original purpose." },
                  { icon: Shield, title: "Right of Grievance Redressal", desc: "Register a complaint with our Data Protection Officer regarding any processing concerns within 30 days." },
                  { icon: Users, title: "Right to Nominate", desc: "Nominate any individual to exercise your data rights in the event of your death or incapacity — unique to DPDPA." },
                  { icon: Lock, title: "Right to Withdraw Consent", desc: "Withdraw consent at any time. Note: withdrawal may limit our ability to continue active project services.", className: "sm:col-span-2" },
                ].map(({ icon: Icon, title, desc, className: cls }) => (
                  <div key={title} className={`bg-black/30 border border-white/[0.06] rounded-xl p-5 ${cls ?? ""}`}>
                    <div className="flex items-center gap-2.5 mb-2">
                      <Icon className="w-4 h-4 text-[#C41230]" />
                      <h3 className="text-sm font-semibold text-white m-0">{title}</h3>
                    </div>
                    <p className="text-xs text-white/55 leading-relaxed m-0">{desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* 5. Retention */}
            <Section icon={Lock} title="5. Data Retention & Disposal" index={4}>
              <div className="space-y-3">
                {[
                  { label: "Active Project Data", period: "Project duration + 10 years", note: "Aligned with our 10-Year Modular Warranty period — legally justified contractual necessity." },
                  { label: "Inquiry Data (Non-converted)", period: "24 months", note: "Securely deleted or anonymized after 24 months of inactivity from the initial inquiry date." },
                  { label: "Financial Records", period: "8 years", note: "Mandated by the Companies Act and Income Tax Act of India." },
                ].map(({ label, period, note }) => (
                  <div key={label} className="flex items-start gap-4 bg-black/30 border border-white/[0.06] rounded-xl p-4">
                    <div className="shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-[#d1af6e] mt-1.5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">{label}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#C41230]/10 border border-[#C41230]/20 text-[#C41230] font-medium">{period}</span>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed">{note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* 6. Security & Third Parties */}
            <Section icon={Lock} title="6. Data Security & Third-Party Disclosure" index={5}>
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">Security Measures (TOMs)</p>
                  <ul className="space-y-1.5 text-sm text-white/60">
                    <li className="flex gap-2"><span className="text-[#C41230]">•</span><span><strong className="text-white/80">Encryption:</strong> SSL/TLS encryption for all data in transit.</span></li>
                    <li className="flex gap-2"><span className="text-[#C41230]">•</span><span><strong className="text-white/80">Access Control:</strong> Strict Role-Based Access Control (RBAC) for internal staff.</span></li>
                    <li className="flex gap-2"><span className="text-[#C41230]">•</span><span><strong className="text-white/80">Vendor Due Diligence:</strong> Data shared only with DPDPA-compliant partners (Godrej, Philips, Hettich, Jaquar).</span></li>
                  </ul>
                </div>
                <div className="border-t border-white/[0.07] pt-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">We Do NOT Sell Your Data</p>
                  <p className="text-sm text-white/60">We disclose data only to: (a) <strong className="text-white/80">service partners</strong> for project execution (contractors, logistics, suppliers), and (b) <strong className="text-white/80">compliance authorities</strong> where mandated by law.</p>
                </div>
              </div>
            </Section>

            {/* 7. DPO & Grievance */}
            <Section icon={AlertTriangle} title="7. Grievance Redressal & Data Protection Officer" index={6}>
              <p className="text-white/65 text-sm mb-5">As required by DPDPA 2023, Crossangle Interior has appointed a Data Protection Officer (DPO) to handle all privacy-related concerns:</p>
              <div className="bg-black/40 border border-[#d1af6e]/15 rounded-xl p-5 mb-5">
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  {[
                    { label: "DPO Email", value: "privacy@crossangle.in" },
                    { label: "Legal Inquiries", value: "hello@crossangle.in" },
                    { label: "Phone", value: "+91 7909041132" },
                    { label: "Response Time", value: "48 hrs acknowledge / 30 days resolve" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">{label}</p>
                      <p className="text-white/80 font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#C41230]/5 border border-[#C41230]/15 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[#C41230] mb-2">Breach Notification</p>
                <p className="text-xs text-white/55 leading-relaxed">
                  In the event of a personal data breach, Crossangle Interior will notify the <strong className="text-white/75">Data Protection Board of India</strong> and affected Data Principals within the timelines prescribed by DPDPA 2023.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-white/[0.07]">
                <a
                  href="mailto:privacy@crossangle.in"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-[#C41230] hover:text-white transition-all duration-200"
                >
                  <Mail className="w-4 h-4" />
                  Contact Privacy Team
                </a>
              </div>
            </Section>

          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-white/30 mt-12">
            This policy was last updated on <strong className="text-white/50">June 01, 2026</strong>.
            For the Terms and Conditions of our services, see our{" "}
            <Link to="/terms" className="text-[#d1af6e] hover:text-white transition-colors underline underline-offset-2">
              Terms & Conditions
            </Link>.
          </p>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
};

export default PrivacyPage;
