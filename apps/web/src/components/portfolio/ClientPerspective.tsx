import { motion } from "framer-motion";
import { Section, Eyebrow, DisplayHeading, reveal } from "@/components/editorial";

const QUOTE =
  "Their attention to detail transformed our space from a simple room into our daily sanctuary.";
const AUTHOR = "Mrs. Sharma";
const PROJECT = "Serene Master Suite";
const META = "450 sq ft · Private Residence · Jamshedpur";

/** One client voice, set as a display-scale pull quote. */
export const ClientPerspective = () => (
  <Section rule spacing="loose">
    <motion.figure {...reveal()} className="mx-auto max-w-4xl text-center">
      <Eyebrow rule={false} className="mb-10">Client perspective</Eyebrow>
      <blockquote>
        <DisplayHeading as="h2" size="lg" className="font-light">
          &ldquo;{QUOTE}&rdquo;
        </DisplayHeading>
      </blockquote>
      <figcaption className="mt-10 flex flex-col items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">{AUTHOR}</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
          {PROJECT} · {META}
        </span>
      </figcaption>
    </motion.figure>
  </Section>
);

export default ClientPerspective;
