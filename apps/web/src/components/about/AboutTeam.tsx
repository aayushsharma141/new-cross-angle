import { motion } from "framer-motion";
import { Instagram, Linkedin, Mail } from "lucide-react";
import { ScrollReveal } from "../ui/scroll-reveal";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Image } from "@/components/ui/enhanced/image";

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

const TeamMember = ({ member, index }: { member: TeamMemberData, index: number }) => {
    return (
        <ScrollReveal animation="fade-up" delay={index * 0.1}>
            <div className="group relative w-full h-[450px] md:h-[500px] overflow-hidden rounded-[2rem] bg-[#111] border border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-700 hover:border-[#d1af6e]/40 hover:shadow-[0_20px_40px_rgba(209,175,110,0.15)] flex flex-col">
                
                {/* Image Container */}
                <div className="absolute inset-0 grayscale sepia-[.2] group-hover:grayscale-0 group-hover:sepia-0 transition-all duration-700 z-0">
                    <Image
                        src={member.image_url || undefined}
                        alt={member.name}
                        className="h-full w-full"
                        imageClassName="transition-transform duration-1000 group-hover:scale-105"
                        width={800}
                        height={1000}
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500 z-10" />
                </div>

                {/* Internal reflection */}
                <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/5 pointer-events-none z-20" />

                {/* Info Content - Absolute positioned at the bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col justify-end z-20">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <h3 className="font-serif text-2xl font-bold text-white mb-1 drop-shadow-md">
                            {member.name}
                        </h3>
                        <p className="text-xs uppercase tracking-[0.2em] text-[#d1af6e] font-semibold drop-shadow-sm mb-4">
                            {member.role}
                        </p>
                    </div>

                    {/* Expandable Biography & Socials */}
                    <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
                        <div className="overflow-hidden">
                            <div className="transform -translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                                {member.bio && (
                                    <p className="text-sm text-white/80 leading-relaxed mb-6 pt-2 border-t border-white/10">
                                        {member.bio}
                                    </p>
                                )}

                                {/* Social Links */}
                                <div className="flex items-center gap-4">
                                    {member.instagram_url && (
                                        <a
                                            href={member.instagram_url}
                                            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:text-black hover:bg-[#d1af6e] hover:border-[#d1af6e] transition-all duration-300"
                                            aria-label={`${member.name}'s Instagram`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Instagram className="w-4 h-4" />
                                        </a>
                                    )}
                                    {member.linkedin_url && (
                                        <a
                                            href={member.linkedin_url}
                                            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:text-black hover:bg-[#d1af6e] hover:border-[#d1af6e] transition-all duration-300"
                                            aria-label={`${member.name}'s LinkedIn`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Linkedin className="w-4 h-4" />
                                        </a>
                                    )}
                                    {member.email && (
                                        <a
                                            href={`mailto:${member.email}`}
                                            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:text-black hover:bg-[#d1af6e] hover:border-[#d1af6e] transition-all duration-300"
                                            aria-label={`Email ${member.name}`}
                                        >
                                            <Mail className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ScrollReveal>
    );
};

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

    return (
        <section className="py-24 md:py-32 relative overflow-hidden bg-background">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#d1af6e]/5 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-2xl mb-16 md:mb-24">
                    <ScrollReveal animation="slide-in-left">
                        <span className="inline-block text-[#d1af6e] font-medium tracking-[0.3em] uppercase text-xs mb-4">
                            The Visionaries
                        </span>
                        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1]">
                            Architecture of <br />
                            <span className="text-[#d1af6e] italic">Anticipation</span>
                        </h2>
                    </ScrollReveal>

                    <ScrollReveal animation="fade-up" delay={0.2}>
                        <p className="text-muted-foreground text-lg mt-6 leading-relaxed">
                            Our studio is composed of specialists who don't just see spaces; they anticipate their soul.
                            Together, we orchestrate environments that are as enduring as they are evocative.
                        </p>
                    </ScrollReveal>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d1af6e]"></div>
                    </div>
                ) : team.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {team.map((member, index) => (
                            <TeamMember key={member.id} member={member} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground">Team data not found.</div>
                )}
            </div>
        </section>
    );
};

export default AboutTeam;
