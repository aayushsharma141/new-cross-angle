import { motion } from "framer-motion";
import { Instagram, Linkedin, Mail } from "lucide-react";
import { ScrollReveal } from "../ui/scroll-reveal";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
            <div className="group relative h-full">
                {/* Card Container */}
                <div className="relative h-full overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 flex flex-col">
                    {/* Image Container */}
                    <div className="aspect-[4/5] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 shrink-0">
                        <img
                            src={member.image_url || 'https://via.placeholder.com/800x1000'}
                            alt={member.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    </div>

                    {/* Info Content */}
                    <div className="p-6 relative flex flex-col flex-grow">
                        <div className="mb-4">
                            <h3 className="font-serif text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                                {member.name}
                            </h3>
                            <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
                                {member.role}
                            </p>
                        </div>

                        {member.bio && (
                            <p className="text-sm text-muted-foreground leading-relaxed h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500 mb-6">
                                {member.bio}
                            </p>
                        )}

                        {/* Social Links */}
                        <div className="flex items-center gap-4 border-t border-white/5 pt-4 opacity-0 group-hover:opacity-100 transition-opacity delay-100 mt-auto">
                            {member.instagram_url && (
                                <a
                                    href={member.instagram_url}
                                    className="text-muted-foreground hover:text-primary transition-colors"
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
                                    className="text-muted-foreground hover:text-primary transition-colors"
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
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    aria-label={`Email ${member.name}`}
                                >
                                    <Mail className="w-4 h-4" />
                                </a>
                            )}
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
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-[100px] -ml-40 -mb-40" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-2xl mb-16 md:mb-24">
                    <ScrollReveal animation="slide-in-left">
                        <span className="inline-block text-primary font-medium tracking-[0.3em] uppercase text-xs mb-4">
                            The Visionaries
                        </span>
                        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1]">
                            Architecture of <br />
                            <span className="text-primary italic">Anticipation</span>
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
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : team.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
