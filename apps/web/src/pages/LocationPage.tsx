import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Building, Home, Users } from "lucide-react";
import { MediaSlot } from "@/components/ui/enhanced/MediaSlot";
import { SiteBreadcrumb } from "@/components/shared/SiteBreadcrumb";
import { SchemaMarkup } from "@/components/shared/SchemaMarkup";

const cityRegions: Record<string, string> = {
  jamshedpur: "Jharkhand",
  ranchi: "Jharkhand",
  bhubaneswar: "Odisha",
  kolkata: "West Bengal",
  patna: "Bihar",
};

// Unique data per city to avoid thin doorway pages
const cityData: Record<string, {
  subtitle: string;
  description: string;
  focus: string;
  stats: { label: string; value: string; icon: React.ElementType }[];
  demographics: {
    population: string;
    primaryVibe: string;
    architecturalTrend: string;
    marketDemand: string;
  };
}> = {
  jamshedpur: {
    subtitle: "The Steel City's Premier Design Studio",
    description: "In India's first planned industrial city, we blend industrial heritage with modern ultra-luxury. From expansive bungalows in Circuit House Area to modern apartments in Sonari, our designs reflect Jamshedpur's unique evolution.",
    focus: "Premium Residential & Corporate Workspaces",
    stats: [
      { label: "Completed Projects", value: "45+", icon: Home },
      { label: "Local Focus", value: "Smart Homes", icon: Building },
      { label: "Design Team", value: "Resident", icon: Users },
    ],
    demographics: {
      population: "1.3+ Million",
      primaryVibe: "Industrial Elite & Modern Cosmopolitan",
      architecturalTrend: "Biophilic Luxury & Smart Automation",
      marketDemand: "High demand for integrated smart-home turnkey solutions among executives and business families."
    }
  },
  ranchi: {
    subtitle: "Elevating Jharkhand's Capital",
    description: "As Ranchi rapidly modernizes, we are at the forefront of designing its new skyline. We specialize in luxury residential projects in Morabadi and Kanke Road, bringing cosmopolitan aesthetics to the city of waterfalls.",
    focus: "Luxury Villas & Modern Apartments",
    stats: [
      { label: "Completed Projects", value: "30+", icon: Home },
      { label: "Local Focus", value: "Villa Architecture", icon: Building },
      { label: "Design Team", value: "Dedicated", icon: Users },
    ],
    demographics: {
      population: "1.4+ Million",
      primaryVibe: "Emerging Metro & Nature-Connected",
      architecturalTrend: "Panoramic Windows & Open Floor Plans",
      marketDemand: "Surge in bespoke villa architecture and premium high-rise apartment interiors."
    }
  },
  bhubaneswar: {
    subtitle: "Modern Living in the Temple City",
    description: "We harmonize Bhubaneswar's rich cultural heritage with contemporary interior design. Our projects in Patia and Khandagiri showcase a perfect balance of traditional Odia elements and minimalist modern luxury.",
    focus: "Heritage Blends & IT Park Offices",
    stats: [
      { label: "Completed Projects", value: "25+", icon: Home },
      { label: "Local Focus", value: "Cultural Integration", icon: Building },
      { label: "Design Team", value: "Specialized", icon: Users },
    ],
    demographics: {
      population: "1.1+ Million",
      primaryVibe: "Cultural Hub & IT Corridor",
      architecturalTrend: "Minimalist Heritage & Sustainable Materials",
      marketDemand: "Growing tech-sector executives seeking modern minimalist homes with cultural accents."
    }
  },
  kolkata: {
    subtitle: "Bespoke Interiors in the City of Joy",
    description: "Kolkata demands a nuanced approach that respects its colonial architecture while embracing the future. From Ballygunge penthouses to Sector V tech offices, we deliver uncompromising quality.",
    focus: "High-End Residential & Commercial",
    stats: [
      { label: "Completed Projects", value: "60+", icon: Home },
      { label: "Local Focus", value: "Adaptive Reuse", icon: Building },
      { label: "Design Team", value: "Metro Hub", icon: Users },
    ],
    demographics: {
      population: "14+ Million",
      primaryVibe: "Colonial Grandeur & Cosmopolitan",
      architecturalTrend: "Neo-Classical Fusion & Ultra-Modern Lofts",
      marketDemand: "Refined taste requiring high-end finishes, art-integrated spaces, and heritage restoration."
    }
  },
  patna: {
    subtitle: "Transforming Bihar's Urban Spaces",
    description: "Bringing world-class interior design to Patna. We cater to the growing demand for premium living spaces in Patliputra and Boring Road, offering turnkey solutions that guarantee peace of mind.",
    focus: "Turnkey Residential Solutions",
    stats: [
      { label: "Completed Projects", value: "20+", icon: Home },
      { label: "Local Focus", value: "Space Optimization", icon: Building },
      { label: "Design Team", value: "Expanding", icon: Users },
    ],
    demographics: {
      population: "2.4+ Million",
      primaryVibe: "Rapid Urbanization & Traditional Roots",
      architecturalTrend: "Efficient Luxury & Multi-Generational Living",
      marketDemand: "Strong preference for end-to-end turnkey execution and highly optimized space planning."
    }
  },
};

const LocationPage = () => {
  const { city } = useParams<{ city: string }>();
  
  const normalizedCityKey = city?.toLowerCase() || '';
  const formattedCity = city 
    ? city.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : "Your City";

  const isKnownCity = normalizedCityKey in cityData;
  const addressRegion = cityRegions[normalizedCityKey] || "India";

  const locationDetails = cityData[normalizedCityKey] || {
    subtitle: `Redefining the standard of living in ${formattedCity}.`,
    description: `Our design studio understands the unique architectural language and lifestyle demands of ${formattedCity}. We source premium materials globally but ensure our execution is deeply integrated with local nuances. From initial consultation to the final handover, we provide a seamless, stress-free experience tailored specifically for our clients in this region.`,
    focus: "Complete Turnkey Interior Execution",
    stats: [
      { label: "Service Area", value: "Active", icon: MapPin },
      { label: "Consultations", value: "Available", icon: Users },
      { label: "Project Types", value: "All", icon: Home },
    ],
    demographics: {
      population: "Varies",
      primaryVibe: "Diverse & Growing",
      addressRegion: "India",
      architecturalTrend: "Modern & Contemporary",
      marketDemand: "Growing demand for premium turnkey interior solutions across residential and commercial sectors."
    }
  };

  return (
    <>
      <Helmet>
        <title>Interior Designers in {formattedCity} | Cross Angle Interior</title>
        <meta name="description" content={`Premium luxury interior design services in ${formattedCity}. ${locationDetails.description.substring(0, 100)}...`} />
        <meta property="og:title" content={`Interior Designers in ${formattedCity} | Cross Angle Interior`} />
        <meta property="og:description" content={`Premium luxury interior design services in ${formattedCity}. ${locationDetails.focus}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://crossangleinterior.com/locations/${city}`} />
        <link rel="canonical" href={`https://crossangleinterior.com/locations/${city}`} />
        {!isKnownCity && <meta name="robots" content="noindex, follow" />}
      </Helmet>
      
      <SchemaMarkup
        type="LocalBusiness"
        data={{
          name: `Cross Angle Interior - ${formattedCity}`,
          description: locationDetails.description,
          url: `https://crossangleinterior.com/locations/${city}`,
          address: {
            "@type": "PostalAddress",
            addressLocality: formattedCity,
            addressRegion: addressRegion,
            addressCountry: "IN",
          }
        }}
      />
      
      <Navbar />

      <main id="main-content" className="bg-[#020202] min-h-screen pt-32 md:pt-48">
        <div className="max-w-[1400px] mx-auto px-6 mb-24">
          <SiteBreadcrumb 
            items={[
              { label: "Locations", href: "/locations" },
              { label: formattedCity }
            ]} 
            className="mb-12"
          />

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
                {locationDetails.subtitle}
              </h2>
              <p className="text-white/60 font-light leading-relaxed mb-12">
                {locationDetails.description}
              </p>
              
              <div className="grid grid-cols-3 gap-6 mb-12">
                {locationDetails.stats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="border-l border-white/10 pl-4">
                      <div className="text-white/40 mb-2"><Icon className="w-5 h-5" /></div>
                      <div className="text-xl font-display text-white mb-1">{stat.value}</div>
                      <div className="text-[10px] uppercase tracking-wider text-white/50">{stat.label}</div>
                    </div>
                  );
                })}
              </div>

              <ul className="space-y-4">
                {[
                  locationDetails.focus,
                  "Complete Turnkey Interior Execution",
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
              <MediaSlot
                assetKey="location_hero_bg"
                fallbackUrl="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1000"
                alt={`Luxury Interior Design in ${formattedCity}`}
                className="w-full h-full object-cover mix-blend-luminosity opacity-80 hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-8">
                <div className="text-2xl font-display text-white">{formattedCity} Studio</div>
                <div className="text-sm font-light text-site-gold mt-1">Accepting New Projects</div>
              </div>
            </div>
          </div>
        </section>

        {/* Demographic & Design Insights Section */}
        {locationDetails.demographics && (
          <section className="bg-black py-24 border-t border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-site-crimson/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="max-w-[1400px] mx-auto px-6 relative z-10">
              <div className="mb-16">
                <span className="font-bold text-[10px] uppercase tracking-[0.4em] text-site-gold flex items-center gap-4 mb-4">
                  <div className="w-12 h-px bg-site-crimson" />
                  Local Market Intelligence
                </span>
                <h2 className="font-display text-3xl md:text-5xl text-white tracking-tight">
                  Demographic & Design Insights
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Insight Cards */}
                <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-xl hover:border-site-crimson/30 transition-colors">
                  <div className="text-site-gold mb-4"><Users className="w-6 h-6" /></div>
                  <h3 className="text-sm uppercase tracking-[0.1em] text-white/50 mb-2 font-bold">Population</h3>
                  <p className="text-xl font-display text-white">{locationDetails.demographics.population}</p>
                </div>
                
                <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-xl hover:border-site-crimson/30 transition-colors">
                  <div className="text-site-gold mb-4"><Building className="w-6 h-6" /></div>
                  <h3 className="text-sm uppercase tracking-[0.1em] text-white/50 mb-2 font-bold">Primary Vibe</h3>
                  <p className="text-xl font-display text-white">{locationDetails.demographics.primaryVibe}</p>
                </div>
                
                <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-xl hover:border-site-crimson/30 transition-colors">
                  <div className="text-site-gold mb-4"><Home className="w-6 h-6" /></div>
                  <h3 className="text-sm uppercase tracking-[0.1em] text-white/50 mb-2 font-bold">Architectural Trend</h3>
                  <p className="text-xl font-display text-white">{locationDetails.demographics.architecturalTrend}</p>
                </div>

                <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-xl hover:border-site-crimson/30 transition-colors">
                  <div className="text-site-gold mb-4"><ArrowRight className="w-6 h-6" /></div>
                  <h3 className="text-sm uppercase tracking-[0.1em] text-white/50 mb-2 font-bold">Market Demand</h3>
                  <p className="text-sm text-white/80 leading-relaxed">{locationDetails.demographics.marketDemand}</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
};

export default LocationPage;
