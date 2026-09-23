import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MediaSlot } from "@/components/ui/enhanced/MediaSlot";
import {
  Container, Eyebrow, DisplayHeading, Body, Em,
  pillCtaClass, PillCtaInner, textLinkClass, EASE_OUT_EXPO,
} from "@/components/editorial";

const ROUTES_OUT = [
  { label: "Portfolio", to: "/portfolio" },
  { label: "Services", to: "/services" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact", to: "/contact-us" },
];

/**
 * 404 — keeps the site frame so a wrong URL is a detour, not a dead end.
 */
const NotFoundPage = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(`404: Non-existent route: ${location.pathname}`);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>404 — Page Not Found | Cross Angle Interior</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to Cross Angle Interior's homepage." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <Navbar />

      <main
        id="main-content"
        className="relative z-10 flex min-h-screen items-center overflow-hidden bg-[var(--s-canvas-primary)] text-white"
      >
        <MediaSlot
          assetKey="not_found_bg"
          fallbackUrl="/reality_render.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />

        <Container className="relative z-10 py-32">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
            className="max-w-3xl"
            role="alert"
          >
            <Eyebrow className="mb-8">Error 404</Eyebrow>
            <DisplayHeading as="h1" size="lg" className="mb-6">
              This page doesn't <Em>exist.</Em>
            </DisplayHeading>
            <Body className="max-w-xl">
              We couldn't find anything at{" "}
              <span className="font-mono text-[0.9em] text-white/70">{location.pathname}</span>. It may have moved, or
              the link may be wrong.
            </Body>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link to="/" className={pillCtaClass}>
                <PillCtaInner>Back to home</PillCtaInner>
              </Link>
              <Link to="/contact-us" className={textLinkClass}>
                Tell us what you were looking for <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="mt-14 border-t border-white/10 pt-8">
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">Try instead</p>
              <ul className="flex flex-wrap gap-x-8 gap-y-3">
                {ROUTES_OUT.map((route) => (
                  <li key={route.to}>
                    <Link
                      to={route.to}
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 transition-colors duration-300 hover:text-primary focus-visible:outline-none focus-visible:text-primary"
                    >
                      {route.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </Container>
      </main>

      <Footer />
    </>
  );
};

export default NotFoundPage;
