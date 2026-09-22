import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MediaSlot } from "@/components/ui/enhanced/MediaSlot";
import { Section, Eyebrow, DisplayHeading, Body, Em, reveal } from "@/components/editorial";

const assetKeyForMilestone = (year: string): string => {
  const map: Record<string, string> = {
    "2012": "about_timeline_2012",
    "2016": "about_timeline_2016",
    "2020": "about_timeline_2020",
    "2024": "about_timeline_2024",
  };
  return map[year] || "about_timeline_2012";
};

interface Milestone {
  year: string;
  title: string;
  event: string;
  image?: string;
  id?: string;
}

const fallbackMilestones: Milestone[] = [
  { 
    year: "2012", 
    title: "The Foundation",
    event: "Aayush Sharma established Cross Angle with a vision to bring architectural rigor to interior styling in Jamshedpur.",
    image: "/blueprint_shell.jpg"
  },
  { 
    year: "2016", 
    title: "Scaling the Vision",
    event: "Expanded the studio's capacity to handle end-to-end commercial projects, introducing turnkey delivery to ensure uncompromised quality.",
    image: "/reality_render.jpg"
  },
  { 
    year: "2020", 
    title: "A New Standard",
    event: "Redefined luxury living in Jharkhand through a series of landmark residential projects that emphasized tactile materials and spatial clarity.",
    image: "/hero_reality_render_1775299733746.png"
  },
  { 
    year: "2024", 
    title: "Present Day",
    event: "Today, the studio stands as a premier design house, leading a team of specialists to craft environments that age beautifully.",
    image: "/reality_render.jpg"
  },
];

const AboutTimeline = () => {
  const { data: milestones = fallbackMilestones } = useQuery<Milestone[]>({
    queryKey: ['studioMilestones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('studio_milestones')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((m) => {
          const milestoneRow = m as Record<string, unknown>;
          return {
            ...m,
            image: (milestoneRow.image_url as string) || "/reality_render.jpg"
          };
        });
      }
      return fallbackMilestones;
    }
  });

  return (
    <Section rule>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
        {/* Sticky heading */}
        <motion.div {...reveal()} className="lg:sticky lg:top-32 lg:self-start">
          <Eyebrow className="mb-6">The journey</Eyebrow>
          <DisplayHeading className="mb-6">
            Fifteen years of <Em>turnkey</Em> discipline.
          </DisplayHeading>
          <Body className="max-w-sm">
            A decade and a half of dedication, precision, and relentless execution led by Aayush Sharma.
          </Body>
        </motion.div>

        {/* Milestones */}
        <ol>
          {milestones.map((milestone, index) => (
            <motion.li
              key={milestone.id ?? milestone.year}
              {...reveal(index * 0.05)}
              className="grid grid-cols-[4.5rem_1fr] gap-6 border-t border-white/10 py-10 md:grid-cols-[6rem_1fr_11rem] md:gap-10"
            >
              <span className="pt-1 font-display text-2xl leading-none text-primary md:text-3xl">{milestone.year}</span>
              <div>
                <h3 className="font-display text-2xl text-white mb-3 md:text-[1.75rem]">{milestone.title}</h3>
                <Body className="max-w-md text-sm md:text-[15px]">{milestone.event}</Body>
              </div>
              <div className="col-start-2 mt-6 aspect-[4/3] w-44 overflow-hidden md:col-start-3 md:mt-0 md:w-full">
                <MediaSlot
                  assetKey={assetKeyForMilestone(milestone.year)}
                  fallbackUrl={milestone.image}
                  alt={milestone.title}
                  className="h-full w-full object-cover opacity-80"
                />
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </Section>
  );
};

export default AboutTimeline;
