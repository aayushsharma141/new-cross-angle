import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/enhanced/image";
import { Section, Eyebrow, DisplayHeading, Body, reveal } from "@/components/editorial";

export interface DomainService {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  hero_image?: string | null;
  category_id: string;
}

interface ServiceDomainProps {
  /** Anchor id — `?category=` on /services scrolls to these. */
  id: string;
  eyebrow: string;
  heading: React.ReactNode;
  body: string;
  services: DomainService[];
  isLoading?: boolean;
  rule?: boolean;
}

/**
 * One service domain: a statement, then an even grid of services.
 * All three domains share this treatment so the page reads as one system.
 */
export const ServiceDomain = ({ id, eyebrow, heading, body, services, isLoading, rule = true }: ServiceDomainProps) => (
  <Section id={id} rule={rule}>
    <motion.div {...reveal()} className="mb-14 max-w-3xl md:mb-20">
      <Eyebrow className="mb-6">{eyebrow}</Eyebrow>
      <DisplayHeading className="mb-6">{heading}</DisplayHeading>
      <Body className="max-w-xl">{body}</Body>
    </motion.div>

    {isLoading ? (
      <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-[4/3] w-full animate-pulse bg-white/[0.03]" />
        ))}
      </div>
    ) : services.length === 0 ? (
      <p className="border-t border-white/10 py-10 text-sm font-light text-white/40">
        No services are currently listed here. Check back soon.
      </p>
    ) : (
      <ul className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <motion.li key={service.id} {...reveal(Math.min(i, 5) * 0.05)}>
            <Link
              to={`/services/${service.category_id}/${service.slug}`}
              className="group block focus-visible:outline-none"
            >
              <div className="mb-6 aspect-[4/3] w-full overflow-hidden bg-white/[0.03]">
                <Image
                  src={service.hero_image || undefined}
                  alt={service.title}
                  className="h-full w-full"
                  imageClassName="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  width={900}
                  height={675}
                />
              </div>
              <h3 className="font-display text-2xl text-white transition-colors duration-300 group-hover:text-primary group-focus-visible:text-primary">
                {service.title}
              </h3>
              {service.description && (
                <Body className="mt-3 line-clamp-3 text-sm">{service.description}</Body>
              )}
              <span className="mt-5 inline-flex items-center gap-2 border-b border-white/15 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 transition-colors duration-300 group-hover:border-primary group-hover:text-primary">
                View service{" "}
                <span aria-hidden="true" className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>
    )}
  </Section>
);

export default ServiceDomain;
