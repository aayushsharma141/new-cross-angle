import { Section, Split, NumberedList, Em } from "@/components/editorial";
import { useSiteContent } from "@/content/useSiteContent";

/** The four principles, as a numbered list beside a single statement. */
const AboutValues = () => {
  const c = useSiteContent("about.values");
  return (
  <Section rule>
    <Split
      align="start"
      eyebrow={c.eyebrow}
      heading={<>{c.headingLead} <Em>{c.headingEmphasis}</Em></>}
      body={c.body}
      media={<NumberedList items={c.items} />}
    />
  </Section>
  );
};

export default AboutValues;
