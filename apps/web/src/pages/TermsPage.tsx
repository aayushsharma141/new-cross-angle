import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Scale, Hammer, Clock, ShieldCheck,
  CreditCard, Lightbulb, AlertTriangle, XCircle, FileText, Phone
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import LegalFooter from "@/components/layout/LegalFooter";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { Helmet } from "react-helmet-async";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45, ease: "easeOut" as const } }),
};

const Section = ({
  icon: Icon,
  number,
  title,
  children,
  index,
  highlight,
}: {
  icon: React.ElementType;
  number: string;
  title: string;
  children: React.ReactNode;
  index: number;
  highlight?: boolean;
}) => (
  <motion.section
    custom={index}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-60px" }}
    variants={fadeUp}
    className={`rounded-2xl p-8 backdrop-blur-sm border ${
      highlight
        ? "bg-[#D4AF37]/5 border-[#D4AF37]/20"
        : "bg-white/[0.03] border-white/[0.07]"
    }`}
  >
    <div className="flex items-start gap-4 mb-6 border-b border-white/[0.07] pb-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d1af6e]/25 bg-[#d1af6e]/10">
        <Icon className="w-5 h-5 text-[#d1af6e]" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 mb-0.5">Section {number}</p>
        <h2 className="text-xl font-semibold text-white leading-tight m-0">{title}</h2>
      </div>
    </div>
    {children}
  </motion.section>
);

const BulletItem = ({ children }: { children: React.ReactNode }) => (
  <span className="flex gap-2.5 text-sm text-white/65">
    <span className="text-[#d1af6e] mt-0.5 shrink-0">•</span>
    <span>{children}</span>
  </span>
);

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-[#d1af6e]/20">
      <Helmet>
        <title>Terms & Conditions | Cross Angle Interior</title>
        <meta
          name="description"
          content="Crossangle Interior's Terms and Conditions of Service — covering the 45-day delivery guarantee, 10-year modular warranty, payment schedule, and intellectual property rights."
        />
        <meta property="og:title" content="Terms & Conditions | Cross Angle Interior" />
        <meta property="og:description" content="Crossangle Interior's Terms and Conditions of Service — 45-day delivery guarantee, 10-year modular warranty, payment schedule, and IP rights." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://crossangleinterior.com/terms" />
      </Helmet>

      <Navbar />

      <main id="main-content" className="pt-32 pb-24 relative z-10 overflow-hidden">
        {/* Decorative background */}
        <div className="pointer-events-none absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#d1af6e]/6 to-transparent -z-10" />
        <div className="pointer-events-none absolute top-24 left-0 w-[600px] h-[600px] bg-[#d1af6e]/3 rounded-full blur-[140px] -z-10" />

        <div className="container mx-auto px-6 max-w-4xl">

          {/* Back link */}
          <Link to="/" className="inline-flex items-center text-white/40 hover:text-[#d1af6e] transition-colors mb-12 group text-sm">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d1af6e]/10 border border-[#d1af6e]/20 text-[#d1af6e] mb-5 text-xs font-semibold uppercase tracking-widest">
              <Scale className="w-3.5 h-3.5" />
              <span>Legal Agreement</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-5 leading-tight">
              Terms &amp; <span className="text-[#d1af6e]">Conditions of Service</span>
            </h1>
            <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
              A legally binding agreement between <strong className="text-white/80">Crossangle Interior</strong> and the Client. By paying a booking fee or signing a design brief, you agree to be bound by these Terms.
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-white/40">
              <span>Effective Date: June 01, 2026</span>
              <span>·</span>
              <span>Jurisdiction: Jamshedpur &amp; Kolkata, India</span>
            </div>
          </motion.div>

          <div className="space-y-6">

            {/* 1. Agreement */}
            <Section icon={FileText} number="1" title="The Agreement" index={0}>
              <p className="text-sm text-white/65 leading-relaxed">
                These Terms and Conditions ("Terms") constitute a legally binding agreement between <strong className="text-white/85">Crossangle Interior</strong> ("the Company") and the <strong className="text-white/85">Client</strong> — the individual or entity seeking interior design services. By paying a booking fee or signing a design brief, the Client agrees to be fully bound by these Terms.
              </p>
            </Section>

            {/* 2. Scope */}
            <Section icon={Hammer} number="2" title="Scope of Services" index={1}>
              <p className="text-sm text-white/65 mb-4">The Company provides interior design and execution services including, but not limited to:</p>
              <ul className="space-y-2"><li><BulletItem>Interior Architecture &amp; Space Planning</BulletItem></li><li><BulletItem>3D Visualizations &amp; Mood Boards</BulletItem></li><li><BulletItem>Turnkey Execution (Civil, Electrical, Plumbing, Painting)</BulletItem></li><li><BulletItem>Modular Manufacturing (Kitchens, Wardrobes, Storage)</BulletItem></li><li><BulletItem>Procurement of Branded Fittings (Hafele, Hettich, Jaquar, etc.)</BulletItem></li></ul>
            </Section>

            {/* 3. Quotations */}
            <Section icon={FileText} number="3" title="Project Quotations & Validity" index={2}>
              <ul className="space-y-3"><li><BulletItem><strong className="text-white/80">Provisional Estimates:</strong> All initial estimates are provisional and based on Client-provided dimensions.</BulletItem></li><li><BulletItem><strong className="text-white/80">Final BOQ:</strong> A final Bill of Quantities will be issued after detailed on-site measurement and material finalization.</BulletItem></li><li><BulletItem><strong className="text-white/80">Validity Period:</strong> Quotations are valid for <strong className="text-white/80">15 days</strong> from issuance due to fluctuating material costs (steel, plywood, etc.).</BulletItem></li></ul>
            </Section>

            {/* 4. 45-Day Guarantee — highlighted */}
            <Section icon={Clock} number="4" title='The "45-Day Delivery" Guarantee' index={3} highlight>
              <p className="text-sm text-white/65 mb-5">
                The Company promises project handover within <strong className="text-[#d1af6e]">45 days</strong> of the "Execution Start Date."
              </p>
              <div className="space-y-4">
                <div className="bg-black/30 border border-white/[0.08] rounded-xl p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">A. Execution Start Date — Defined as the day ALL of these conditions are met:</p>
                  <ul className="space-y-2"><li><BulletItem>Design sign-off on all 2D and 3D drawings</BulletItem></li><li><BulletItem>Site is cleared of all previous debris or furniture</BulletItem></li><li><BulletItem>1st and 2nd payment milestones are fully cleared</BulletItem></li><li><BulletItem>Site has continuous electricity and water supply</BulletItem></li></ul>
                </div>
                <div className="bg-black/30 border border-[#d1af6e]/10 rounded-xl p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#d1af6e] mb-2">B. The "Rent" Penalty</p>
                  <p className="text-sm text-white/65 leading-relaxed">
                    If the Company fails to hand over the project within the stipulated 45 days, the Company shall pay the Client a pre-agreed daily "rent" amount, <strong className="text-white/80">capped at 5% of the total contract value</strong>.
                  </p>
                </div>
                <div className="bg-black/30 border border-white/[0.08] rounded-xl p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">C. Exclusions — Penalty does NOT apply for delays caused by:</p>
                  <ul className="space-y-2"><li><BulletItem>Client-requested design changes after sign-off</BulletItem></li><li><BulletItem>Delayed material selection by the Client</BulletItem></li><li><BulletItem>Society or Building restricted working hours</BulletItem></li><li><BulletItem>Force Majeure events (floods, strikes, pandemic-related shutdowns)</BulletItem></li></ul>
                </div>
              </div>
            </Section>

            {/* 5. Warranty */}
            <Section icon={ShieldCheck} number="5" title="Warranty & Post-Service Support" index={4}>
              <div className="space-y-4">
                <div className="bg-black/30 border border-[#d1af6e]/15 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-[#d1af6e]" />
                    <p className="text-sm font-semibold text-white">10-Year Modular Warranty</p>
                  </div>
                  <p className="text-xs text-white/55 leading-relaxed">Applies specifically to modular kitchens and wardrobes manufactured by the Company. Covers manufacturing defects, termite infestation, and structural integrity.</p>
                </div>
                <div className="bg-black/30 border border-white/[0.07] rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-2">Brand Warranty (Partners)</p>
                  <p className="text-xs text-white/55 leading-relaxed">Fittings from <strong className="text-white/75">Hafele, Hettich, Godrej, and Philips</strong> are covered by their respective manufacturer warranties. The Company will assist in facilitating these claims.</p>
                </div>
                <div className="bg-black/30 border border-white/[0.07] rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-2">1-Year Free Maintenance</p>
                  <p className="text-xs text-white/55 leading-relaxed">Includes one (1) complimentary service visit every quarter for the first 12 months post-handover to adjust hinges, sliders, or touch-up paint.</p>
                </div>
              </div>
            </Section>

            {/* 6. Payment */}
            <Section icon={CreditCard} number="6" title='Payment Schedule ("The Milestones")' index={5}>
              <p className="text-sm text-white/65 mb-5">Unless otherwise agreed in writing, the standard payment schedule is:</p>
              <div className="space-y-3">
                {[
                  { pct: "10%", label: "Booking Fee", desc: "To initiate the design phase. Non-refundable.", color: "border-[#D4AF37]/30 bg-[#D4AF37]/5" },
                  { pct: "40%", label: "Design Sign-off", desc: "Payable before material procurement and factory production begins.", color: "border-[#d1af6e]/20 bg-[#d1af6e]/5" },
                  { pct: "45%", label: "Site Execution", desc: "Payable in stages as work progresses on-site.", color: "border-white/10 bg-white/[0.03]" },
                  { pct: "5%", label: "Final Handover", desc: "Payable upon completion of the final snag list and before handover of keys.", color: "border-emerald-500/20 bg-emerald-500/5" },
                ].map(({ pct, label, desc, color }) => (
                  <div key={label} className={`flex items-start gap-4 rounded-xl border p-4 ${color}`}>
                    <div className="shrink-0 w-14 text-center">
                      <span className="text-2xl font-bold text-white font-serif">{pct}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white mb-0.5">{label}</p>
                      <p className="text-xs text-white/55">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* 7. IP */}
            <Section icon={Lightbulb} number="7" title="Intellectual Property Rights" index={6}>
              <div className="bg-[#d1af6e]/5 border border-[#d1af6e]/15 rounded-xl p-5">
                <p className="text-sm text-white/70 leading-relaxed">
                  All design concepts, 3D renders, and technical drawings remain the <strong className="text-white/85">sole intellectual property of Crossangle Interior</strong>. The Client is granted a non-exclusive license to use these designs solely for the specific project site upon full payment of all dues.
                </p>
                <p className="text-sm text-white/70 leading-relaxed mt-3">
                  <strong className="text-[#d1af6e]">Unauthorized reproduction</strong> or use of designs for other sites, or sharing with competing contractors, is strictly prohibited and may result in legal action.
                </p>
              </div>
            </Section>

            {/* 8. Liability */}
            <Section icon={AlertTriangle} number="8" title="Limitation of Liability" index={7}>
              <ul className="space-y-3"><li><BulletItem>The Company's maximum liability for any defect, delay, or damage shall not exceed the <strong className="text-white/80">Service Fee portion</strong> of the total contract value.</BulletItem></li><li><BulletItem>The Company is <strong className="text-white/80">not liable</strong> for structural defects in the building, seepage from external walls, or delays caused by third-party vendors not directly managed by the Company.</BulletItem></li></ul>
            </Section>

            {/* 9. Termination */}
            <Section icon={XCircle} number="9" title="Termination" index={8}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-black/30 border border-white/[0.07] rounded-xl p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">By Client</p>
                  <p className="text-sm text-white/65 leading-relaxed">The Client may terminate by paying for all work completed to date plus a <strong className="text-white/80">15% cancellation fee</strong> on the remaining contract value.</p>
                </div>
                <div className="bg-black/30 border border-white/[0.07] rounded-xl p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">By Company</p>
                  <p className="text-sm text-white/65 leading-relaxed">The Company may terminate if the site is unsafe, the Client defaults on payments for more than <strong className="text-white/80">7 days</strong>, or there is a material breach of these Terms.</p>
                </div>
              </div>
            </Section>

            {/* 10. Dispute Resolution */}
            <Section icon={Scale} number="10" title="Dispute Resolution & Governing Law" index={9}>
              <ul className="space-y-3"><li><BulletItem><strong className="text-white/80">Governing Law:</strong> This agreement shall be governed by the laws of India.</BulletItem></li><li><BulletItem><strong className="text-white/80">Amicable Settlement:</strong> Parties shall first attempt to resolve disputes through direct mediation between designated representatives.</BulletItem></li><li><BulletItem><strong className="text-white/80">Arbitration:</strong> If unresolved within 30 days, disputes shall be referred to a sole arbitrator in <strong className="text-white/80">Jamshedpur or Kolkata</strong> under the Arbitration and Conciliation Act, 1996 — faster and more private than court litigation.</BulletItem></li><li><BulletItem><strong className="text-white/80">Jurisdiction:</strong> The courts of Jamshedpur or Kolkata shall have exclusive jurisdiction for matters not resolved by arbitration.</BulletItem></li></ul>
            </Section>

            {/* 11. Contact */}
            <Section icon={Phone} number="11" title="Contact for Legal Inquiries" index={10}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Legal Department</p>
                  <a href="mailto:hello@crossangle.in" className="text-[#d1af6e] hover:text-white transition-colors text-sm">hello@crossangle.in</a>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Phone</p>
                  <a href="tel:+917909041132" className="text-[#d1af6e] hover:text-white transition-colors text-sm">+91 7909041132</a>
                </div>
              </div>
            </Section>

          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-white/30 mt-12">
            These Terms are effective as of <strong className="text-white/50">June 01, 2026</strong>.
            For our data practices, see our{" "}
            <Link to="/privacy" className="text-[#D4AF37] hover:text-white transition-colors underline underline-offset-2">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </main>

      <LegalFooter />
      <ScrollToTop />
    </div>
  );
};

export default TermsPage;
