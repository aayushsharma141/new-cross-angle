import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FixedSocialBar from "@/components/FixedSocialBar";
import FloatingParticles from "@/components/FloatingParticles";
import ScrollToTop from "@/components/ScrollToTop";
import ServicesHero from "@/components/services/ServicesHero";
import ServicesProcess from "@/components/services/ServicesProcess";
import ServicesWhyUs from "@/components/services/ServicesWhyUs";
import ServicesCTA from "@/components/services/ServicesCTA";
import { ArrowRight, Home, Building2, UtensilsCrossed, Lamp, Sofa, Palette, Lightbulb, PenTool, Bed, LucideIcon, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Icon mapping helper
const IconMap: Record<string, LucideIcon> = {
  Home, Building2, UtensilsCrossed, Lamp, Sofa, Palette, Lightbulb, PenTool, Bed
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ServiceCluster = ({ title, description, services }: { title: string, description: string, services: any[] }) => (
  <section className="py-16 md:py-24 relative">
    <div className="container mx-auto px-4">
      <div className="mb-12">
        <h3 className="font-serif text-3xl md:text-4xl text-foreground mb-4">{title}</h3>
        <p className="text-muted-foreground text-lg max-w-2xl">{description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => {
          const Icon = IconMap[service.icon] || Home;
          return (
            <article
              key={service.id || index}
              className="group relative bg-card active:scale-[0.98] md:hover:scale-[1.02] transition-all duration-300 border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={service.hero_image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              </div>
              <div className="p-6 relative">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{service.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">{service.description}</p>
                <Link
                  to={`/services/${service.category_id}/${service.slug}`}
                  className="inline-flex items-center text-primary font-medium text-sm group/link"
                >
                  Explore Solution <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  </section>
);

const ServicesPage = () => {
  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: api.getServices,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const residentialServices = (services || []).filter(s => s.category_id === 'residential');
  const commercialServices = (services || []).filter(s => s.category_id === 'commercial');
  const specializedServices = (services || []).filter(s => s.category_id === 'specialized');

  return (
    <>
      <Helmet>
        <title>Interior Design Services | Cross Angle Interior</title>
        <meta
          name="description"
          content="Comprehensive interior design solutions for homes and businesses. Specialized in modular kitchens, living rooms, and office interiors."
        />
        <link rel="canonical" href="https://crossangleinterior.com/services" />
      </Helmet>

      <FloatingParticles count={25} />

      <main className="min-h-screen relative z-10 bg-background">
        <FixedSocialBar />
        <Navbar />

        <ServicesHero />

        {/* Hub Content - Clustered Services */}
        {residentialServices.length > 0 && (
          <div id="residential">
            <ServiceCluster
              title="Residential Design"
              description="Crafting personalized homes that reflect your lifestyle and personality."
              services={residentialServices}
            />
          </div>
        )}

        {commercialServices.length > 0 && (
          <div id="commercial" className="bg-accent/5">
            <ServiceCluster
              title="Commercial & Office"
              description="Strategic design solutions that enhance productivity and brand value."
              services={commercialServices}
            />
          </div>
        )}

        {specializedServices.length > 0 && (
          <div id="specialized">
            <ServiceCluster
              title="Specialized Execution"
              description="Expert solutions for niche requirements."
              services={specializedServices}
            />
          </div>
        )}

        {(!services || services.length === 0) && (
          <div className="py-20 text-center container">
            <p className="text-muted-foreground">No services found. Please add services via the Admin Panel.</p>
          </div>
        )}

        <ServicesWhyUs />
        <ServicesProcess />
        <ServicesCTA />

        <Footer />
        <ScrollToTop />
      </main>
    </>
  );
};

export default ServicesPage;
