import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Closing, Em, pillCtaClass, PillCtaInner, textLinkClass } from "@/components/editorial";
import { useSiteContent } from "@/content/useSiteContent";

/** Closing statement + one CTA. Phone comes from settings, with the studio fallback. */
const AboutCTA = () => {
  const { settings } = useSiteSettings();
  const c = useSiteContent("about.cta");
  const phone = settings?.phone || "+91 93040 00000";

  return (
    <Closing
      heading={<>{c.headingLead} <Em>{c.headingEmphasis}</Em></>}
      body={c.body}
    >
      <Link to="/contact-us" className={pillCtaClass}>
        <PillCtaInner>{c.primaryLabel}</PillCtaInner>
      </Link>
      <a href={`tel:${phone.replace(/\s+/g, "")}`} className={textLinkClass}>
        {c.phoneLabel}
      </a>
    </Closing>
  );
};

export default AboutCTA;
