import { Section, Split, NumberedList, Em } from "@/components/editorial";

const values = [
  {
    title: "Execution-first planning",
    description: "Every project begins with a detailed scope, timeline, and budget framework — delivered before a single wall is touched.",
  },
  {
    title: "Design intelligence",
    description: "We blend function with aesthetic rigor — creating spaces built for everyday use, not just photographs.",
  },
  {
    title: "Turnkey accountability",
    description: "No sub-contracting surprises. We own the full project — materials, labour, timelines, and final handover.",
  },
  {
    title: "Client transparency",
    description: "Real-time progress updates, clear milestones, and zero hidden costs. You always know where your project stands.",
  },
];

/** The four principles, as a numbered list beside a single statement. */
const AboutValues = () => (
  <Section rule>
    <Split
      align="start"
      eyebrow="What we stand for"
      heading={<>Designed for aesthetics. <Em>Built for everyday use.</Em></>}
      body="The best interiors don't feel crowded or complicated. We build that feeling through disciplined planning, honest materials, and a single team accountable from first sketch to final handover."
      media={<NumberedList items={values} />}
    />
  </Section>
);

export default AboutValues;
