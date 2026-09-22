import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Image } from "@/components/ui/enhanced/image";
import { Section, Eyebrow, DisplayHeading, Body, Em, reveal } from "@/components/editorial";

interface TeamMemberData {
    id: string;
    name: string;
    role: string;
    bio: string | null;
    image_url: string | null;
    instagram_url: string | null;
    linkedin_url: string | null;
    email: string | null;
}

const socialLink =
    "text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 transition-colors duration-300 hover:text-primary focus-visible:outline-none focus-visible:text-primary";

const TeamMember = ({ member, index }: { member: TeamMemberData; index: number }) => (
    <motion.li {...reveal(index * 0.06)} className="flex flex-col">
        <div className="mb-6 aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden bg-white/[0.03]">
            <Image
                src={member.image_url || undefined}
                alt={member.name}
                className="h-full w-full"
                imageClassName="transition-transform duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] motion-reduce:transition-none"
                width={800}
                height={1067}
            />
        </div>
        <h3 className="font-display text-2xl text-white">{member.name}</h3>
        <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-primary">{member.role}</p>
        {member.bio && <Body className="mt-4 text-sm">{member.bio}</Body>}
        {(member.instagram_url || member.linkedin_url || member.email) && (
            <div className="mt-5 flex items-center gap-5">
                {member.instagram_url && (
                    <a href={member.instagram_url} target="_blank" rel="noopener noreferrer" className={socialLink}>
                        Instagram
                    </a>
                )}
                {member.linkedin_url && (
                    <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className={socialLink}>
                        LinkedIn
                    </a>
                )}
                {member.email && (
                    <a href={`mailto:${member.email}`} className={socialLink}>
                        Email
                    </a>
                )}
            </div>
        )}
    </motion.li>
);

/** The studio team, from `team_members`. Portraits with no card chrome. */
const AboutTeam = () => {
    const [team, setTeam] = useState<TeamMemberData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTeam() {
            try {
                const { data, error } = await supabase
                    .from('team_members')
                    .select('*')
                    .order('display_order', { ascending: true });

                if (error) {
                    console.error("Error fetching team members:", error);
                } else {
                    setTeam(data || []);
                }
            } catch (err) {
                console.error("Failed to load team:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchTeam();
    }, []);

    if (!loading && team.length === 0) return null;

    return (
        <Section rule>
            <motion.div {...reveal()} className="mb-16 max-w-2xl md:mb-24">
                <Eyebrow className="mb-6">The studio</Eyebrow>
                <DisplayHeading className="mb-6">
                    The minds behind the <Em>masterpieces.</Em>
                </DisplayHeading>
                <Body className="max-w-lg">
                    Specialists who don't just draft plans — they oversee site execution to the millimetre. Together,
                    we orchestrate environments that are as durable as they are evocative.
                </Body>
            </motion.div>

            {loading ? (
                <div className="grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="aspect-[3/4] w-full animate-pulse bg-white/[0.03]" />
                    ))}
                </div>
            ) : (
                <ul className="grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                    {team.map((member, index) => (
                        <TeamMember key={member.id} member={member} index={index} />
                    ))}
                </ul>
            )}
        </Section>
    );
};

export default AboutTeam;
