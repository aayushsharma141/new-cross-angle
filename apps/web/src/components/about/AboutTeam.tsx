import { motion } from "framer-motion";
import { Instagram, Linkedin, Mail } from "lucide-react";
import { ScrollReveal } from "../ui/scroll-reveal";

const team = [
    {
        name: "Shrikant Sharma",
        role: "Chief Visionary Officer & Founding Principal",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
        bio: "Exemplifying over two decades of architectural excellence, Shrikant curates the philosophical foundation of every Cross Angle commission.",
        social: { instagram: "#", linkedin: "#", email: "shrikant@crossangle.in" }
    },
    {
        name: "Chanda Sharma",
        role: "Director of Aesthetic Excellence",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
        bio: "Chanda is the vanguard of our interior philosophy, ensuring that every texture and tone resonates with the silent language of luxury.",
        social: { instagram: "#", linkedin: "#", email: "chanda@crossangle.in" }
    },
    {
        name: "Hema Kumari",
        role: "Spatial Visualization Expert",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
        bio: "Hema orchestrates the transition from abstract concept to living reality, masterfully visualizing the anticipation of space.",
        social: { instagram: "#", linkedin: "#" }
    },
    {
        name: "Bhusan Kumar",
        role: "Director of Operations & Strategic Growth",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop",
        bio: "Architecting the operational backbone of the studio, Bhusan ensures the precision and scale of our visionary projects.",
        social: { linkedin: "#" }
    },
    {
        name: "Shubham Sharma",
        role: "Brand Experience & Digital Strategy Lead",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop",
        bio: "Defining how the digital world anticipates the Cross Angle experience through immersive brand storytelling.",
        social: { instagram: "#", linkedin: "#" }
    },
    {
        name: "Souvik Dey",
        role: "Client Relationship & Brand Ambassador",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
        bio: "The silent bridge between our studio's vision and our clients' legacy, Souvik curates the journey of anticipation.",
        social: { linkedin: "#", email: "souvik@crossangle.in" }
    }
];

const TeamMember = ({ member, index }: { member: typeof team[0], index: number }) => {
    return (
        <ScrollReveal animation="fade-up" delay={index * 0.1}>
            <div className="group relative">
                {/* Card Container */}
                <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10">
                    {/* Image Container */}
                    <div className="aspect-[4/5] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                        <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    </div>

                    {/* Info Content */}
                    <div className="p-6 relative">
                        <div className="mb-4">
                            <h3 className="font-serif text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                                {member.name}
                            </h3>
                            <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
                                {member.role}
                            </p>
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500 mb-6">
                            {member.bio}
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-4 border-t border-white/5 pt-4 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                            {member.social.instagram && (
                                <a
                                    href={member.social.instagram}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    aria-label={`${member.name}'s Instagram`}
                                >
                                    <Instagram className="w-4 h-4" />
                                </a>
                            )}
                            {member.social.linkedin && (
                                <a
                                    href={member.social.linkedin}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    aria-label={`${member.name}'s LinkedIn`}
                                >
                                    <Linkedin className="w-4 h-4" />
                                </a>
                            )}
                            {member.social.email && (
                                <a
                                    href={`mailto:${member.social.email}`}
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {team.map((member, index) => (
                        <TeamMember key={index} member={member} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AboutTeam;
