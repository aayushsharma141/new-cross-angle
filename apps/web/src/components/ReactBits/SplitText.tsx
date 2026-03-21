import { useInView, motion } from 'framer-motion';
import React, { useRef } from 'react';

export interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    threshold?: number;
    rootMargin?: string;
}

const SplitText: React.FC<SplitTextProps> = ({
    text,
    className = '',
    delay = 50,
    duration = 0.5,
    threshold = 0.1,
    rootMargin = '-50px'
}) => {
    const ref = useRef<HTMLParagraphElement>(null);
    const isInView = useInView(ref, { once: true, margin: rootMargin, amount: threshold });

    const words = text.split(' ');

    return (
        <p ref={ref} className={`flex flex-wrap ${className}`}>
            {words.map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block overflow-hidden mr-[0.25em]">
                    <motion.span
                        className="inline-block"
                        initial={{ y: '100%', opacity: 0 }}
                        animate={isInView ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
                        transition={{
                            duration: duration,
                            ease: [0.16, 1, 0.3, 1], // Custom realistic ease out
                            delay: (wordIndex * delay) / 1000
                        }}
                    >
                        {word}
                    </motion.span>
                </span>
            ))}
        </p>
    );
};

export default SplitText;
