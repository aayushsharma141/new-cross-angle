import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";

const LocationPage = () => {
  const { city } = useParams<{ city: string }>();
  
  // Basic capitalization and formatting
  const formattedCity = city 
    ? city.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : "Your City";

  return (
    <>
      <Helmet>
        <title>Interior Designers in {formattedCity} | Cross Angle Interior</title>
        <meta name="description" content={`Premium luxury interior design services in ${formattedCity}. Discover bespoke residential and commercial spaces designed by Cross Angle Interior.`} />
      </Helmet>
      
      <Navbar />

      <main className="bg-[#020202] min-h-screen pt-32 md:pt-48">
        <div className="max-w-[1400px] mx-auto px-6 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <span className="font-bold text-[10px] uppercase tracking-[0.4em] text-site-gold flex items-center gap-4 mb-6">
              <div className="w-12 h-px bg-site-crimson" />
              Local Service Area
            </span>
            <h1 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.05] tracking-tight text-white mb-8">
              Luxury Interior Design in <br />
              <em className="italic font-medium text-site-crimson">{formattedCity}</em>.
            </h1>
            <p className="text-[1.1rem] text-white/60 font-light leading-relaxed mb-12 max-w-2xl">
              Cross Angle Interior brings global design standards to {formattedCity}. Whether you are looking for turnkey residential execution, sophisticated commercial environments, or bespoke modular kitchens, our team delivers uncompromised excellence right to your doorstep.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <Link to="/estimate">
                <button className="px-8 py-4 bg-site-crimson text-white text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-site-crimson/90 transition-colors w-full sm:w-auto">
                  Start Your Project
                </button>
              </Link>
              <Link to="/portfolio">
                <button className="px-8 py-4 border border-white/10 text-white/80 text-[11px] uppercase tracking-[0.2em] hover:bg-white/5 transition-colors w-full sm:w-auto flex items-center justify-center gap-2">
                  View Portfolio <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Localized SEO Content Section */}
        <section className="border-t border-white/5 bg-[#050505] py-24">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6 text-site-gold">
                <MapPin className="w-5 h-5" />
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Serving {formattedCity}</span>
              </div>
              <h2 className="text-3xl md:text-4xl text-white font-light mb-6">
                Redefining the standard of living in {formattedCity}.
              </h2>
              <p className="text-white/60 font-light leading-relaxed mb-8">
                Our design studio understands the unique architectural language and lifestyle demands of {formattedCity}. We source premium materials globally but ensure our execution is deeply integrated with local nuances. From initial consultation to the final handover, we provide a seamless, stress-free experience tailored specifically for our clients in this region.
              </p>
              <ul className="space-y-4">
                {[
                  "Complete Turnkey Interior Execution",
                  "Premium Residential & Villa Design",
                  "Corporate & Commercial Fit-outs",
                  "Dedicated Project Management"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 text-white/80 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-site-crimson" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden border border-white/10">
              <img 
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1000" 
                alt={`Luxury Interior Design in ${formattedCity}`}
                className="w-full h-full object-cover mix-blend-luminosity opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default LocationPage;
