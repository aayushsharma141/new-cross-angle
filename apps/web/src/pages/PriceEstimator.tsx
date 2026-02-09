import { CostEstimator } from "@/components/calculators/CostEstimator";
import { motion } from "framer-motion";

const PriceEstimator = () => {
    return (
        <div className="pt-24 min-h-screen bg-[url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2666&auto=format&fit=crop')] bg-fixed bg-cover bg-center">
            <div className="absolute inset-0 bg-background/90 backdrop-blur-[2px]" />

            <div className="container relative z-10 mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12 space-y-4"
                >
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground">
                        Estimate Your <span className="text-gradient-wine">Dream Space</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Get a transparent, instant estimate for your interior design project.
                        No hidden costs, just honest pricing.
                    </p>
                </motion.div>

                <CostEstimator />
            </div>
        </div>
    );
};

export default PriceEstimator;
