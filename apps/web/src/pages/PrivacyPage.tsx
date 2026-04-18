import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/primitives/button";
import { Shield, Database, Lock, Eye, Mail, Trash2, ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-ca-black text-white selection:bg-ca-primary/30">
      <Navbar />
      
      <main className="pt-32 pb-20 relative z-10 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-ca-primary/10 to-transparent -z-10" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-ca-primary/5 rounded-full blur-[120px] -z-10" />
        
        <div className="container mx-auto px-6 max-w-4xl">
          <Link to="/" className="inline-flex items-center text-zinc-400 hover:text-ca-primary transition-colors mb-12 mb-8 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ca-primary/10 border border-ca-primary/20 text-ca-primary mb-6 text-sm font-medium">
              <Shield className="w-4 h-4" />
              <span>Legal & Privacy</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight mb-6">
              Privacy Policy & <span className="text-ca-primary">DPDPA Rights</span>
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl">
              We respect your privacy and are committed to protecting your personal data in compliance with the Digital Personal Data Protection Act (DPDPA).
            </p>
            <p className="text-sm text-zinc-500 mt-4">Last Updated: April 2026</p>
          </motion.div>

          <div className="space-y-12 prose prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:font-medium prose-a:text-ca-primary hover:prose-a:text-white prose-a:transition-colors">
            
            <section className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <Database className="w-6 h-6 text-ca-primary" />
                <h2 className="text-2xl m-0 text-white">Data Collection & Use</h2>
              </div>
              <p className="text-zinc-300">
                At Cross Angle Interior, we collect information to provide you with tailored interior design services and to communicate effectively.
              </p>
              <ul className="text-zinc-400 space-y-2 mt-4 marker:text-ca-primary">
                <li><strong className="text-zinc-200">Personal Information:</strong> Name, email address, phone number, and location details provided during consultations.</li>
                <li><strong className="text-zinc-200">Project Information:</strong> Floor plans, specific design preferences, budget estimates, and property details.</li>
                <li><strong className="text-zinc-200">Technical Data:</strong> IP address, browser type, and interaction metrics on our website (managed via essential cookies and analytics).</li>
              </ul>
              <p className="text-zinc-300 mt-4">
                We strictly use this data to calculate estimates, assign design teams, process your project, and ensure quality service delivery.
              </p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <Lock className="w-6 h-6 text-ca-primary" />
                <h2 className="text-2xl m-0 text-white">Data Retention Policy</h2>
              </div>
              <p className="text-zinc-300">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, or as required by law.
              </p>
              <ul className="text-zinc-400 space-y-2 mt-4 marker:text-ca-primary">
                <li><strong className="text-zinc-200">Active Clients:</strong> Data is retained for the duration of the project and up to 5 years post-completion for warranty and post-service support.</li>
                <li><strong className="text-zinc-200">Prospective Leads:</strong> For users who request an estimate but do not proceed, data is securely purged after 24 months of inactivity.</li>
                <li><strong className="text-zinc-200">Administrative Logs:</strong> Telemetry and platform logs are retained for a rolling 90-day period.</li>
              </ul>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-ca-primary/5 rounded-full blur-[80px] -z-10" />
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <Eye className="w-6 h-6 text-ca-primary" />
                <h2 className="text-2xl m-0 text-white">Your DPDPA Rights</h2>
              </div>
              <p className="text-zinc-300 mb-6">
                Under the Indian Digital Personal Data Protection Act (DPDPA), you hold explicit rights to the data you entrust with us.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6 mt-6">
                <div className="bg-black/40 border border-white/5 p-6 rounded-xl">
                  <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                    <Database className="w-4 h-4 text-ca-primary" />
                    Right to Access
                  </h3>
                  <p className="text-sm text-zinc-400 m-0">
                    You have the right to request a summary of the personal data being processed by us and the identities of any data fiduciaries with whom we share it.
                  </p>
                </div>
                
                <div className="bg-black/40 border border-white/5 p-6 rounded-xl">
                  <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-ca-primary" />
                    Right to Erasure
                  </h3>
                  <p className="text-sm text-zinc-400 m-0">
                    You can request the permanent deletion of your personal data when it is no longer necessary for the purpose it was collected.
                  </p>
                </div>

                <div className="bg-black/40 border border-white/5 p-6 rounded-xl sm:col-span-2">
                  <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-ca-primary" />
                    Correction & Grievance Redressal
                  </h3>
                  <p className="text-sm text-zinc-400 m-0">
                    You have the right to request continuous correction or updates to incomplete datasets. You also have the right to nominate an individual to access your data in the event of incapacity.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-lg font-medium text-white mb-4">Exercising Your Rights</h3>
                <p className="text-zinc-400 text-sm mb-6">
                  To exercise any of these rights, or if you have privacy-related grievances, please contact our designated Data Protection Officer.
                </p>
                <Button 
                  onClick={() => window.location.href = "mailto:privacy@crossangleinterior.com"}
                  className="bg-white text-black hover:bg-ca-primary hover:text-white"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Privacy Team
                </Button>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPage;
