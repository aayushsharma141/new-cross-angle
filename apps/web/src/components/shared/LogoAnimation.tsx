import { motion } from "framer-motion";

interface LogoAnimationProps {
    className?: string;
    size?: number;
}

export const LogoAnimation = ({ className = "", size = 300 }: LogoAnimationProps) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            {/* Glow Effect */}
            <div
                className="absolute inset-0 rounded-full bg-kiro-accent/10 blur-[60px] animate-pulse"
                style={{ transform: 'scale(0.8)' }}
            />

            {/* Concentric Rings */}
            {[0.7, 0.85, 1].map((scale, i) => (
                <motion.div
                    key={i}
                    className="absolute inset-0 border border-kiro-accent/15 rounded-full"
                    initial={{ scale: scale, opacity: 0 }}
                    animate={{
                        scale: [scale, scale * 1.05, scale],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{
                        duration: 4 + i,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            ))}

            {/* Orbiting Dot */}
            <motion.div
                className="absolute w-1.5 h-1.5 bg-kiro-accent rounded-full shadow-[0_0_10px_#D4AF37]"
                animate={{
                    rotate: 360,
                    x: [140, 160, 140], // Radius variance
                }}
                transition={{
                    rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                    x: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{ originX: "0px", left: "50%", top: "50%" }}
            />


        </div>
    );
};
