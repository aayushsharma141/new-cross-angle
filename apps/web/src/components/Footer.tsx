import { useRef } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Linkedin, Twitter, Phone, Mail, MapPin } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import useScrollReveal from "@/hooks/useScrollReveal";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about-us" },
    { name: "Services", href: "/services" },
    { name: "Our Works", href: "/gallery" },
    { name: "Blog", href: "/blog" },
    { name: "Contact Us", href: "/contact-us" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/crossangleinterior/", label: "Instagram" },
    { icon: Facebook, href: "https://www.facebook.com/crossangleinterior", label: "Facebook" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
  ];

  useScrollReveal(footerRef, ".reveal-item", {
    y: 30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
  });

  return (
    <footer
      ref={footerRef}
      role="contentinfo"
      className="text-site-text relative overflow-hidden border-t border-site-border bg-site-bg-section"
    >
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--site-crimson)/0.03)_0%,transparent_50%)]" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Brand & Contact */}
          <div className="lg:col-span-1 reveal-item opacity-0">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logoIcon}
                alt="Cross Angle Interior"
                className="h-[68px] w-auto opacity-90"
              />
              <span className="font-serif text-2xl font-bold">
                <span className="text-site-text-heading">Crossangle</span>{" "}
                <span className="text-site-crimson">Interior</span>
              </span>
            </Link>

            <div className="space-y-3 text-sm mt-8">
              <a href="tel:+917909041132" className="flex items-center gap-2 text-site-text-muted hover:text-site-crimson transition-colors">
                <Phone className="w-4 h-4 text-site-crimson" />
                <span>+91 7909041132</span>
              </a>
              <a href="tel:+919304853659" className="flex items-center gap-2 text-site-text-muted hover:text-site-crimson transition-colors">
                <Phone className="w-4 h-4 text-site-crimson" />
                <span>+91 9304853659</span>
              </a>
              <a href="mailto:info@crossangleinterior.com" className="flex items-center gap-2 text-site-text-muted hover:text-site-crimson transition-colors">
                <Mail className="w-4 h-4 text-site-crimson" />
                <span>info@crossangleinterior.com</span>
              </a>
              <div className="flex items-start gap-2 text-site-text-muted">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-site-crimson" />
                <span>2-G, 2nd floor, Aditya Signature building, Dimna Rd, Mango, Jamshedpur, Jharkhand 831012</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="reveal-item opacity-0">
            <h4 className="font-semibold mb-4 text-site-text-heading">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-site-text-muted hover:text-site-crimson transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div className="reveal-item opacity-0">
            <h4 className="font-semibold mb-4 text-site-text-heading">Follow Us</h4>
            <div className="flex gap-3 mb-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 bg-site-bg border border-site-border rounded-full flex items-center justify-center text-site-crimson hover:bg-site-crimson hover:text-site-bg transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <div className="bg-site-bg border border-site-border p-4 rounded-lg">
              <p className="text-sm text-site-text-muted mb-2">
                Ready to transform your space?
              </p>
              <Link
                to="/contact-us"
                className="text-site-crimson font-medium text-sm hover:text-site-crimson/80 hover:underline"
              >
                Get A Free Quote →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-site-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-site-text-meta text-sm">
            © {currentYear} Crossangle Interior. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-site-text-meta hover:text-site-crimson transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-site-text-meta hover:text-site-crimson transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;