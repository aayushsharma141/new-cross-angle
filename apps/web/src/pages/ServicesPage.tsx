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
import { ArrowRight, Home, Building2, UtensilsCrossed, Lamp, Sofa } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const ServiceCluster = ({ title, description, services }: { title: string, description: string, services: any[] }) => (
  <section className="py-16 md:py-24 relative">
    <div className="container mx-auto px-4">
      <div className="mb-12">
        <h3 className="font-serif text-3xl md:text-4xl text-foreground mb-4">{title}</h3>
        <p className="text-muted-foreground text-lg max-w-2xl">{description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <article
            key={index}
            className="group relative bg-card active:scale-[0.98] md:hover:scale-[1.02] transition-all duration-300 border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl"
          >
            <div className="aspect-video overflow-hidden">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
            </div>
            <div className="p-6 relative">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                <service.icon className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{service.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{service.description}</p>
              <Link
                to={service.href}
                className="inline-flex items-center text-primary font-medium text-sm group/link"
              >
                Explore Solution <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const residentialServices = [
  {
    title: "Living Room Design",
    description: "Complete makeovers for your main gathering space. TV units, seating layouts, and ambient lighting.",
    icon: Sofa,
    href: "/services/living-room",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600"
  },
  {
    title: "Modular Kitchens",
    description: "Ergonomic, factory-finished modular kitchens with Hettich/Hafele fittings and smart storage.",
    icon: UtensilsCrossed,
    href: "/services/modular-kitchen",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600"
  },
  {
    title: "Bedroom Sanctuaries",
    description: "Peaceful retreats with custom wardrobes, false ceilings, and cozy aesthetics.",
    icon: Home,
    href: "/services/bedroom",
    image: "https://images.unsplash.com/photo-1616594039964-40891a90c309?q=80&w=600"
  }
];

const commercialServices = [
  {
    title: "Office Interiors",
    description: "Productive workspaces with ergonomic planning, conference rooms, and reception areas.",
    icon: Building2,
    href: "/services/office",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600"
  },
  {
    title: "Retail & Showroom",
    description: "Engaging retail environments designed to maximize customer flow and product display.",
    icon: Lamp,
    href: "/services/retail",
    image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=600"
  }
];

const ServicesPage = () => {
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
        <div id="residential">
          <ServiceCluster
            title="Residential Design"
            description="Crafting personalized homes that reflect your lifestyle and personality."
            services={residentialServices}
          />
        </div>

        <div id="commercial" className="bg-accent/5">
          <ServiceCluster
            title="Commercial & Office"
            description="Strategic design solutions that enhance productivity and brand value."
            services={commercialServices}
          />
        </div>

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
