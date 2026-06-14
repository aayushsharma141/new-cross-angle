import { motion } from "framer-motion";

interface ProjectSnapshotProps {
  goal: string;
  type: string;
  timeline: string;
  challenge: string;
  investment?: string;
}

const ProjectSnapshot = ({ goal, type, timeline, challenge, investment }: ProjectSnapshotProps) => {
  const cards = [
    { label: "Client Goal", value: goal },
    { label: "Project Type", value: type },
    { label: "Timeline", value: timeline },
    { label: "Key Challenge", value: challenge },
  ];

  return (
    <div className="relative bg-neutral-950 py-2">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <dl className="flex flex-wrap justify-center py-6 gap-8 md:gap-16">
          {cards.map((card, idx) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex-shrink-0 flex flex-col gap-2 min-w-[150px]"
            >
              <dt className="text-[10px] font-medium tracking-[0.25em] uppercase text-site-gold">
                {card.label}
              </dt>
              <dd className="text-sm md:text-base font-light text-stone-200">
                {card.value}
              </dd>
            </motion.div>
          ))}
          {investment && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex-shrink-0 flex flex-col gap-2 min-w-[150px]"
            >
              <dt className="text-[10px] font-medium tracking-[0.25em] uppercase text-site-gold">
                Investment
              </dt>
              <dd className="text-sm md:text-base font-light text-stone-200">
                {investment}
              </dd>
            </motion.div>
          )}
        </dl>
      </div>
    </div>
  );
};

export default ProjectSnapshot;
