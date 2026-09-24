import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Image } from "@/components/ui/enhanced/image";
import { Section, Eyebrow, DisplayHeading, Body, reveal } from "@/components/editorial";
import { cn } from "@/lib/utils";

const metaLabel = "mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-white/35";

/**
 * The five stages, from `design_process_steps`.
 *
 * Each stage is one full section: number + title beside its photograph, then
 * timeline / budget and the two responsibility lists. Replaces the tabbed
 * panel, the Gantt chart and the pinned home chapter, which all rendered the
 * same five records three different ways.
 */
export const ProcessStages = () => {
  const { data: stages = [], isLoading } = useQuery({
    queryKey: ['processStages'],
    queryFn: api.getProcessStages
  });

  if (isLoading) {
    return (
      <Section rule>
        <div className="aspect-[16/7] w-full animate-pulse bg-white/[0.03]" aria-busy="true" />
      </Section>
    );
  }

  if (stages.length === 0) return null;

  return (
    <div id="process">
      {stages.map((stage, index) => {
        const mediaLeft = index % 2 === 1;
        return (
          <Section key={stage.id} rule={index > 0}>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
              {/* Copy */}
              <motion.div {...reveal()} className={cn(mediaLeft && "lg:order-2")}>
                <Eyebrow className="mb-6">Stage {stage.number}</Eyebrow>
                <DisplayHeading className="mb-4">
                  {stage.title}
                  {stage.subtitle && (
                    <span className="block italic font-light text-primary">{stage.subtitle}</span>
                  )}
                </DisplayHeading>
                {stage.summary && <Body className="max-w-md">{stage.summary}</Body>}
                {stage.detail && <Body className="mt-4 max-w-md text-sm">{stage.detail}</Body>}

                {(stage.timeline || stage.budgetRange) && (
                  <dl className="mt-10 flex flex-wrap gap-x-16 gap-y-6 border-t border-white/10 pt-8">
                    {stage.timeline && (
                      <div>
                        <dt className={metaLabel}>Timeline</dt>
                        <dd className="font-display text-xl text-white">{stage.timeline}</dd>
                      </div>
                    )}
                    {stage.budgetRange && (
                      <div>
                        <dt className={metaLabel}>Budget</dt>
                        <dd className="font-display text-xl text-white">{stage.budgetRange}</dd>
                      </div>
                    )}
                  </dl>
                )}
              </motion.div>

              {/* Photograph + responsibilities */}
              <motion.div {...reveal(0.1)} className={cn(mediaLeft && "lg:order-1")}>
                {stage.image && (
                  <div className="aspect-[4/3] w-full overflow-hidden bg-white/[0.03]">
                    <Image
                      src={stage.image}
                      alt={stage.title}
                      className="h-full w-full"
                      imageClassName="h-full w-full object-cover"
                      width={1000}
                      height={750}
                    />
                  </div>
                )}

                {(stage.weDo.length > 0 || stage.clientDoes.length > 0 || stage.deliverables.length > 0) && (
                  <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-3">
                    {stage.weDo.length > 0 && (
                      <div>
                        <h3 className={metaLabel}>We do</h3>
                        <ul className="flex flex-col gap-2">
                          {stage.weDo.map((item) => (
                            <li key={item} className="text-sm font-light leading-relaxed text-white/70">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {stage.clientDoes.length > 0 && (
                      <div>
                        <h3 className={metaLabel}>You do</h3>
                        <ul className="flex flex-col gap-2">
                          {stage.clientDoes.map((item) => (
                            <li key={item} className="text-sm font-light leading-relaxed text-white/70">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {stage.deliverables.length > 0 && (
                      <div>
                        <h3 className={metaLabel}>You receive</h3>
                        <ul className="flex flex-col gap-2">
                          {stage.deliverables.map((item) => (
                            <li key={item} className="flex items-baseline gap-2.5 text-sm font-light leading-relaxed text-white/70">
                              <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </Section>
        );
      })}
    </div>
  );
};

export default ProcessStages;
