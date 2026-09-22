import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Closing, Em, pillCtaClass, PillCtaInner, textLinkClass } from "@/components/editorial";

/** Closing statement + one CTA. Phone comes from settings, with the studio fallback. */
const AboutCTA = () => {
  const { settings } = useSiteSettings();
  const phone = settings?.phone || "+91 93040 00000";

  return (
    <Closing
      heading={<>Your space is a project. We deliver it as an <Em>experience.</Em></>}
      body="Every project is delivered fully executed — not just designed. Schedule a consultation and let's define the scope of your next space."
    >
      <Link to="/contact-us" className={pillCtaClass}>
        <PillCtaInner>Start your project</PillCtaInner>
      </Link>
      <a href={`tel:${phone.replace(/\s+/g, "")}`} className={textLinkClass}>
        Call the studio
      </a>
    </Closing>
  );
};

export default AboutCTA;
