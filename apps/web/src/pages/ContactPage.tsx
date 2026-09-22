import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import ContactForm from "@/components/contact/ContactForm";
import ContactFAQ from "@/components/contact/ContactFAQ";
import { SchemaMarkup } from "@/components/shared/SchemaMarkup";
import { Section, Container, Eyebrow, textLinkClass, reveal } from "@/components/editorial";
import { PageHero } from "@/components/motion/PageHero";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAnalytics } from "@/analytics/AnalyticsProvider";
import { track } from "@/analytics/track";
import { SITE_CONSTANTS } from "@/lib/constants";

const MAP_SRC = "https://maps.google.com/maps?cid=13776842535355950153&output=embed&hl=en";

const detailLabel = "mb-3 block text-[10px] font-bold uppercase tracking-[0.25em] text-white/40";
const detailLink =
  "text-[15px] font-light text-white/80 transition-colors duration-300 hover:text-primary focus-visible:outline-none focus-visible:text-primary";

/**
 * Contact — cinematic hero over an editorial body.
 *
 * Compact header → two columns (studio details | underline form) →
 * map strip → FAQ. No photographic hero: the form is the point of the page
 * and should be reachable without a scroll.
 */
const ContactPage = () => {
  const { settings } = useSiteSettings();
  const analytics = useAnalytics();

  const email = settings?.email || SITE_CONSTANTS.defaultEmail;
  const phone = settings?.phone || SITE_CONSTANTS.defaultPhone;
  const whatsapp = settings?.whatsapp || "917909041132";
  const address = settings?.address || "2nd Floor, Aditya Signature Building, Dimna Rd, Mango, Jamshedpur 831012";
  const hours =
    Array.isArray(settings?.business_hours) && settings.business_hours.length > 0
      ? (settings.business_hours as { days: string; hours: string }[])
      : [{ days: "Mon – Sat", hours: "9 AM – 7 PM" }];

  return (
    <>
      <Helmet>
        <title>Contact Us | Cross Angle Interior - Get A Quote</title>
        <meta
          name="description"
          content="Contact Cross Angle Interior for your interior design needs. Get a free quote and consultation for residential and commercial projects in Jamshedpur."
        />
        <meta property="og:title" content="Contact Cross Angle Interior" />
        <meta property="og:description" content="Get a free quote and consultation for residential and commercial projects." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://crossangleinterior.com/contact-us" />
      </Helmet>

      <SchemaMarkup
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Home", url: "/" },
            { name: "Contact Us", url: "/contact-us" }
          ]
        }}
      />

      <SchemaMarkup
        type="InteriorDesigner"
        data={{
          name: "Cross Angle Interior",
          telephone: SITE_CONSTANTS.defaultPhone,
          email: SITE_CONSTANTS.defaultEmail,
          url: "https://crossangleinterior.com/contact-us"
        }}
      />

      <Navbar />

      <main id="main-content" className="relative z-10 min-h-screen bg-[var(--s-canvas-primary)] text-white">
        <PageHero
          size="md"
          kicker="Design inquiries"
          lines={["Let's plan your", <span key="l2" className="italic font-light text-[#C9A85C]">interior project.</span>]}
          lede="One conversation, a clearer next step. Send a brief for a tailored response, or reach the studio directly."
          image={{ entity: "contact-us", fallback: "/luxury_interior_base.png", alt: "" }}
        />

        {/* Details | Form */}
        <Container className="pb-24 md:pb-32">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-24 xl:gap-32">
            <motion.aside {...reveal()}>
              <dl className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <dt className={detailLabel}>Direct connect</dt>
                  <dd>
                    <a href={`mailto:${email}`} className={`${detailLink} break-all`}>{email}</a>
                  </dd>
                </div>
                <div>
                  <dt className={detailLabel}>Call the studio</dt>
                  <dd className="flex flex-col gap-2">
                    <a href={`tel:${phone.replace(/\s+/g, "")}`} className={detailLink}>{phone}</a>
                    <a
                      href={`https://wa.me/${whatsapp}?text=Hi!%20I'm%20interested%20in%20your%20interior%20design%20services.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track(analytics, "cta_clicked", { ctaId: "accelerated_whatsapp", destination: "whatsapp" })}
                      className={`${textLinkClass} w-fit`}
                    >
                      WhatsApp <span aria-hidden="true">→</span>
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className={detailLabel}>The studio</dt>
                  <dd className="text-[15px] font-light leading-relaxed text-white/80">
                    <span className="block text-white">{settings?.studio_name || "Crossangle Interior"}</span>
                    <address className="not-italic">{address}</address>
                  </dd>
                </div>
                <div>
                  <dt className={detailLabel}>Hours</dt>
                  <dd className="text-[15px] font-light leading-relaxed text-white/80">
                    {hours.map((h) => (
                      <span key={h.days} className="block">{h.days}: {h.hours}</span>
                    ))}
                  </dd>
                </div>
              </dl>

              <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8">
                <Link
                  to="/estimate"
                  onClick={() => track(analytics, "estimate_path_selected", { pathId: "contact_page_cta" })}
                  className={`${textLinkClass} w-fit`}
                >
                  Looking for numbers? Try the estimator <span aria-hidden="true">→</span>
                </Link>
                <Link
                  to="/aesthetic-discovery-engine"
                  onClick={() => track(analytics, "discovery_path_selected", { pathId: "contact_page_cta" })}
                  className={`${textLinkClass} w-fit`}
                >
                  Not sure about your style? Take the quiz <span aria-hidden="true">→</span>
                </Link>
              </div>
            </motion.aside>

            <motion.div {...reveal(0.1)} id="contact-form-section" className="order-first lg:order-none">
              <ContactForm />
            </motion.div>
          </div>
        </Container>

        {/* Map */}
        <Section rule spacing="tight">
          <motion.div {...reveal()} className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
            <Eyebrow>Find us</Eyebrow>
            <a
              href="https://maps.google.com/?cid=13776842535355950153"
              target="_blank"
              rel="noopener noreferrer"
              className={textLinkClass}
            >
              Open in Google Maps <span aria-hidden="true">→</span>
            </a>
          </motion.div>
          <motion.div {...reveal(0.05)} className="aspect-[16/9] w-full overflow-hidden bg-white/[0.03] md:aspect-[21/9]">
            <iframe
              src={MAP_SRC}
              title="Cross Angle Interior studio location"
              className="h-full w-full border-0 grayscale opacity-80 transition-opacity duration-500 hover:opacity-100"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </motion.div>
        </Section>

        <ContactFAQ />
      </main>

      <Footer />
      <ScrollToTop />
    </>
  );
};

export default ContactPage;
