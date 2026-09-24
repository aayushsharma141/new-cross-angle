import { motion } from "framer-motion";
import { Section, Eyebrow, DisplayHeading, Body, Em, reveal } from "@/components/editorial";

const deliverables = [
  { label: "Space planning", desc: "Optimised layouts for how you actually live" },
  { label: "3D visualization", desc: "Photorealistic renders before any work begins" },
  { label: "Material selection", desc: "Curated finishes, textures and surfaces" },
  { label: "Custom furniture", desc: "Designed and fabricated in-house" },
  { label: "Civil & structural", desc: "Walls, flooring, tiling, waterproofing" },
  { label: "Electrical planning", desc: "Load scheduling, concealed wiring" },
  { label: "False ceiling", desc: "Gypsum, POP and custom ceiling systems" },
  { label: "Lighting design", desc: "Layered ambient, task and accent lighting" },
  { label: "Turnkey execution", desc: "Full project management to handover" },
  { label: "Site supervision", desc: "Daily oversight by a dedicated supervisor" },
  { label: "Final styling & decor", desc: "Styling, accessories, plant dressing" },
];

/** Everything included in a turn-key engagement, as one plain list. */
const ServicesDeliverables = () => (
  <Section rule>
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
      <motion.div {...reveal()} className="lg:sticky lg:top-32 lg:self-start">
        <Eyebrow className="mb-6">What's included</Eyebrow>
        <DisplayHeading className="mb-6">
          One contract. <Em>Every trade.</Em>
        </DisplayHeading>
        <Body className="max-w-sm">
          A turn-key engagement covers the whole build — no separate contractors to brief, chase or reconcile.
        </Body>
      </motion.div>

      <ul className="grid grid-cols-1 gap-x-12 sm:grid-cols-2">
        {deliverables.map((item, i) => (
          <motion.li
            key={item.label}
            {...reveal(Math.min(i, 6) * 0.04)}
            className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-white/10 py-6"
          >
            <span className="pt-1 text-[10px] font-bold tracking-[0.2em] text-primary">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="font-display text-lg text-white md:text-xl">{item.label}</h3>
              <Body className="mt-1.5 text-sm">{item.desc}</Body>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  </Section>
);

export default ServicesDeliverables;
