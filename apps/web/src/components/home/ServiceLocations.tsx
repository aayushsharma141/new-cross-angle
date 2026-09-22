import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import { MediaSlot } from "@/components/ui/enhanced/MediaSlot";

const locations = [
  {
    name: "Jamshedpur",
    slug: "jamshedpur",
    assetKey: "location_jamshedpur",
    demographics: "Industrial Hub • Premium Residential Estates • Established Commercial Centers",
    image: "https://iuuivmwqodefdrrrewol.supabase.co/storage/v1/object/public/media/projects/discovery/visual-14.jpg",
    delay: 0.1,
  },
  {
    name: "Bistupur",
    slug: "bistupur",
    assetKey: "location_bistupur",
    demographics: "Luxury Shopping District • High-End Apartments • Corporate Offices",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
    delay: 0.2,
  },
  {
    name: "Adityapur",
    slug: "adityapur",
    assetKey: "location_adityapur",
    demographics: "Fastest Growing Suburb • Tech Parks • Modern Residential Complexes",
    image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=800",
    delay: 0.3,
  },
  {
    name: "Kadma",
    slug: "kadma",
    assetKey: "location_kadma",
    demographics: "Peaceful Neighborhoods • Bungalows • Riverside Residences",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800",
    delay: 0.4,
  }
];

const allAreas = ["Mango", "Sakchi", "Sonari", "Telco", "Golmuri", "Baridih", "Dimna"];

export default function ServiceLocations() {
  return (
    <section className="py-section-y relative overflow-hidden bg-[#020202] text-white">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url(/noise.svg)' }} />
      <div className="absolute -top-[300px] right-[10%] w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-wide mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-white/70 text-[10px] font-medium tracking-[0.2em] uppercase mb-6"
            >
              <MapPin className="w-3 h-3 text-[#D4AF37]" />
              Service Areas
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-3xl md:text-5xl lg:text-6xl font-serif leading-[1.1] tracking-tight"
            >
              Designing across <br />
              <span className="text-[#D4AF37] italic">prime locations.</span>
            </motion.h2>
          </div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/60 font-sans text-sm max-w-sm"
          >
            From bustling commercial centers to quiet residential neighborhoods, we bring our signature luxury and execution to every corner of the city.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {locations.map((loc) => (
            <motion.div
              key={loc.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: loc.delay }}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-white/[0.02] border border-white/[0.05]"
            >
              <div className="absolute inset-0">
                <MediaSlot
                  assetKey={loc.assetKey}
                  fallbackUrl={loc.image}
                  alt={`${loc.name} Interior Design`}
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700 ease-out grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              </div>
              
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <h3 className="text-2xl font-serif text-white mb-2">{loc.name}</h3>
                  <p className="text-[11px] font-sans tracking-wide text-white/60 mb-6 uppercase leading-relaxed">
                    {loc.demographics}
                  </p>
                  <Link 
                    to={`/locations/${loc.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-sans tracking-[0.2em] uppercase text-white hover:text-[#D4AF37] transition-colors opacity-0 group-hover:opacity-100"
                    onClick={() => window.scrollTo(0, 0)}
                  >
                    View Location
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Other Areas List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="text-[11px] font-sans tracking-[0.2em] text-white/40 uppercase">
            Also serving
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {allAreas.map(area => (
              <Link
                key={area}
                to={`/locations/${area.toLowerCase()}`}
                className="text-sm font-serif text-white/60 hover:text-white transition-colors"
                onClick={() => window.scrollTo(0, 0)}
              >
                {area}
              </Link>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
